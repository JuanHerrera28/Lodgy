USE lodgy;

-- ============================================================
-- LODGY - OBJETOS PENDIENTES DE LA BASE DE DATOS
-- Ejecutar DESPUES de 01_tablas.sql ... 06_pagos.sql y del
-- archivo de triggers de reservas que ya tienes.
-- ============================================================

DELIMITER //

-- ============================================================
-- SP: CREAR RESERVA  (RF-04, RN-11, RN-09)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_crear_reserva //
CREATE PROCEDURE sp_crear_reserva(
    IN p_id_cliente     INT,
    IN p_id_cabana      INT,
    IN p_id_usuario     INT,
    IN p_fecha_entrada  DATE,
    IN p_fecha_salida   DATE,
    IN p_num_personas   TINYINT,
    IN p_observaciones  VARCHAR(300)
)
BEGIN
    DECLARE v_precio_noche   DECIMAL(10,2);
    DECLARE v_capacidad      INT;
    DECLARE v_activa         BOOLEAN;
    DECLARE v_id_confirmada  INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT precio_noche, capacidad, activa
      INTO v_precio_noche, v_capacidad, v_activa
    FROM Cabana WHERE id_cabana = p_id_cabana;

    IF v_precio_noche IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cabaña especificada no existe.';
    END IF;
    IF v_activa = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cabaña no esta en operacion.';
    END IF;
    IF p_num_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RN-03: El numero de personas excede la capacidad de la cabana.';
    END IF;

    SELECT id_estado_reserva INTO v_id_confirmada
    FROM Estado_Reserva WHERE nombre = 'Confirmada';

    START TRANSACTION;

    -- El precio se COPIA de la cabana (RN-11): se conserva aunque el precio cambie despues
    INSERT INTO Reserva
        (id_cliente, id_cabana, id_usuario, id_estado_reserva,
         fecha_entrada, fecha_salida, num_personas, precio_noche, observaciones)
    VALUES
        (p_id_cliente, p_id_cabana, p_id_usuario, v_id_confirmada,
         p_fecha_entrada, p_fecha_salida, p_num_personas, v_precio_noche, p_observaciones);

    SET @v_id_reserva = LAST_INSERT_ID();

    -- El historial se crea con el primer estado (RN-09)
    INSERT INTO Historial_Reserva (id_reserva, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (@v_id_reserva, NULL, v_id_confirmada, p_id_usuario, 'Reserva registrada');

    COMMIT;

    SELECT @v_id_reserva AS id_reserva;
END //

-- ============================================================
-- SP: CANCELAR RESERVA  (RN-04, RN-09)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_cancelar_reserva //
CREATE PROCEDURE sp_cancelar_reserva(
    IN p_id_reserva INT,
    IN p_id_usuario INT,
    IN p_motivo     VARCHAR(200)
)
BEGIN
    DECLARE v_estado        VARCHAR(30);
    DECLARE v_id_actual     INT;
    DECLARE v_id_cancelada  INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT er.nombre, r.id_estado_reserva INTO v_estado, v_id_actual
    FROM Reserva r
    JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
    WHERE r.id_reserva = p_id_reserva;

    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La reserva especificada no existe.';
    END IF;
    IF v_estado <> 'Confirmada' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RN-04: Solo se pueden cancelar reservas Confirmadas.';
    END IF;

    SELECT id_estado_reserva INTO v_id_cancelada
    FROM Estado_Reserva WHERE nombre = 'Cancelada';

    START TRANSACTION;

    UPDATE Reserva SET id_estado_reserva = v_id_cancelada WHERE id_reserva = p_id_reserva;

    INSERT INTO Historial_Reserva (id_reserva, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (p_id_reserva, v_id_actual, v_id_cancelada, p_id_usuario, p_motivo);

    COMMIT;
END //

-- ============================================================
-- SP: REGISTRAR PAGO  (RF-07, RN-13, RN-12)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_registrar_pago //
CREATE PROCEDURE sp_registrar_pago(
    IN p_id_reserva   INT,
    IN p_monto        DECIMAL(10,2),
    IN p_tipo         VARCHAR(10),
    IN p_metodo_pago  VARCHAR(20),
    IN p_id_usuario   INT
)
BEGIN
    DECLARE v_estado    VARCHAR(30);
    DECLARE v_total     DECIMAL(10,2);
    DECLARE v_pagado    DECIMAL(10,2);
    DECLARE v_saldo     DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_monto <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RN-13: El monto del pago debe ser mayor que cero.';
    END IF;

    SELECT er.nombre INTO v_estado
    FROM Reserva r
    JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
    WHERE r.id_reserva = p_id_reserva;

    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La reserva especificada no existe.';
    END IF;
    IF v_estado = 'Cancelada' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se pueden registrar pagos en una reserva cancelada.';
    END IF;

    -- El saldo se CALCULA desde la vista (RN-12), nunca se guarda
    SELECT total, pagado, saldo INTO v_total, v_pagado, v_saldo
    FROM v_saldo_reserva WHERE id_reserva = p_id_reserva;

    IF p_monto > v_saldo THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-13: El pago supera el saldo pendiente de la reserva.';
    END IF;

    START TRANSACTION;

    INSERT INTO Pago (id_reserva, monto, tipo, metodo_pago, id_usuario)
    VALUES (p_id_reserva, p_monto, p_tipo, p_metodo_pago, p_id_usuario);

    COMMIT;

    SELECT (v_saldo - p_monto) AS saldo_restante;
END //

-- ============================================================
-- TRIGGER: INVENTARIO / STOCK  (RF-10, RN-14, RN-15)
-- Suma en Entrada, resta en Venta, Consumo y Ajuste,
-- valida el tipo segun el producto y rechaza stock negativo.
-- ============================================================
DROP TRIGGER IF EXISTS trg_inventario_stock //
CREATE TRIGGER trg_inventario_stock
BEFORE INSERT ON Registro_Inventario
FOR EACH ROW
BEGIN
    DECLARE v_tipo          VARCHAR(10);
    DECLARE v_stock_actual  INT;
    DECLARE v_nuevo_stock   INT;

    SELECT tipo, stock_actual INTO v_tipo, v_stock_actual
    FROM Producto WHERE id_producto = NEW.id_producto;

    IF v_tipo IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El producto especificado no existe.';
    END IF;

    -- RN-15: cada tipo de producto solo admite ciertos movimientos
    IF v_tipo = 'Insumo' AND NEW.tipo_movimiento = 'Venta' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-15: Los insumos no se venden; solo admiten Entrada, Consumo y Ajuste.';
    END IF;
    IF v_tipo = 'Venta' AND NEW.tipo_movimiento = 'Consumo' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-15: Los productos de venta no admiten Consumo; solo Entrada, Venta y Ajuste.';
    END IF;

    -- RN-15: toda venta exige una reserva
    IF NEW.tipo_movimiento = 'Venta' AND NEW.id_reserva IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-15: Toda venta debe indicar la reserva a la que se cobra.';
    END IF;

    -- RN-14: calcular el nuevo stock
    IF NEW.tipo_movimiento = 'Entrada' THEN
        SET v_nuevo_stock = v_stock_actual + NEW.cantidad;
    ELSE
        SET v_nuevo_stock = v_stock_actual - NEW.cantidad;
    END IF;

    IF v_nuevo_stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-14: El movimiento dejaria el stock en negativo.';
    END IF;

    -- Redundancia controlada: el stock actual se actualiza aqui
    UPDATE Producto SET stock_actual = v_nuevo_stock WHERE id_producto = NEW.id_producto;
END //

-- ============================================================
-- SP: ABRIR Y CERRAR MANTENIMIENTO  (RN-08)
-- Nota: el mantenimientoController actual hace INSERT/UPDATE
-- directos y YA funciona. Estos procedimientos existen para
-- cumplir la regla RN-08 (bloquear/liberar la cabana).
-- ============================================================
DROP PROCEDURE IF EXISTS sp_abrir_mantenimiento //
CREATE PROCEDURE sp_abrir_mantenimiento(
    IN p_id_cabana      INT,
    IN p_descripcion    VARCHAR(300),
    IN p_bloquea_cabana BOOLEAN,
    IN p_id_usuario     INT
)
BEGIN
    DECLARE v_estado_cabana  VARCHAR(30);
    DECLARE v_id_estado_actual INT;
    DECLARE v_id_mantenimiento INT;
    DECLARE v_id_mant_estado INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT ec.nombre, c.id_estado_cabana INTO v_estado_cabana, v_id_estado_actual
    FROM Cabana c
    JOIN Estado_Cabana ec ON ec.id_estado_cabana = c.id_estado_cabana
    WHERE c.id_cabana = p_id_cabana;

    IF v_estado_cabana IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cabana especificada no existe.';
    END IF;

    START TRANSACTION;

    INSERT INTO Mantenimiento (id_cabana, descripcion, id_usuario_reporta, estado, bloquea_cabana)
    VALUES (p_id_cabana, p_descripcion, p_id_usuario, 'Pendiente', p_bloquea_cabana);

    SET v_id_mantenimiento = LAST_INSERT_ID();

    -- RN-08: si bloquea y la cabana no esta ocupada, pasa a En Mantenimiento
    IF p_bloquea_cabana = TRUE AND v_estado_cabana <> 'Ocupada' THEN
        SELECT id_estado_cabana INTO v_id_mant_estado
        FROM Estado_Cabana WHERE nombre = 'En Mantenimiento';

        UPDATE Cabana SET id_estado_cabana = v_id_mant_estado WHERE id_cabana = p_id_cabana;

        INSERT INTO Historial_Estado_Cabana (id_cabana, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
        VALUES (p_id_cabana, v_id_estado_actual, v_id_mant_estado, p_id_usuario,
                CONCAT('Bloqueo por mantenimiento ', v_id_mantenimiento));
    END IF;

    COMMIT;

    SELECT v_id_mantenimiento AS id_mantenimiento;
END //

DROP PROCEDURE IF EXISTS sp_cerrar_mantenimiento //
CREATE PROCEDURE sp_cerrar_mantenimiento(
    IN p_id_mantenimiento INT,
    IN p_id_usuario       INT
)
BEGIN
    DECLARE v_id_cabana      INT;
    DECLARE v_estado         VARCHAR(15);
    DECLARE v_bloquea        BOOLEAN;
    DECLARE v_estado_cabana  VARCHAR(30);
    DECLARE v_id_estado_actual INT;
    DECLARE v_id_bloqueos    INT;
    DECLARE v_id_disponible  INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT id_cabana, estado, bloquea_cabana INTO v_id_cabana, v_estado, v_bloquea
    FROM Mantenimiento WHERE id_mantenimiento = p_id_mantenimiento;

    IF v_id_cabana IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La orden de mantenimiento no existe.';
    END IF;
    IF v_estado = 'Resuelta' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La orden ya estaba resuelta.';
    END IF;

    SELECT ec.nombre, c.id_estado_cabana INTO v_estado_cabana, v_id_estado_actual
    FROM Cabana c
    JOIN Estado_Cabana ec ON ec.id_estado_cabana = c.id_estado_cabana
    WHERE c.id_cabana = v_id_cabana;

    START TRANSACTION;

    UPDATE Mantenimiento
       SET estado = 'Resuelta', fecha_cierre = NOW()
     WHERE id_mantenimiento = p_id_mantenimiento;

    -- RN-08: liberar solo si bloqueaba, estaba En Mantenimiento y no quedan otras ordenes que bloqueen
    IF v_bloquea = TRUE AND v_estado_cabana = 'En Mantenimiento' THEN
        SELECT COUNT(*) INTO v_id_bloqueos
        FROM Mantenimiento
        WHERE id_cabana = v_id_cabana
          AND estado <> 'Resuelta'
          AND bloquea_cabana = TRUE
          AND id_mantenimiento <> p_id_mantenimiento;

        IF v_id_bloqueos = 0 THEN
            SELECT id_estado_cabana INTO v_id_disponible
            FROM Estado_Cabana WHERE nombre = 'Disponible';

            UPDATE Cabana SET id_estado_cabana = v_id_disponible WHERE id_cabana = v_id_cabana;

            INSERT INTO Historial_Estado_Cabana (id_cabana, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
            VALUES (v_id_cabana, v_id_estado_actual, v_id_disponible, p_id_usuario,
                    CONCAT('Fin de mantenimiento ', p_id_mantenimiento));
        END IF;
    END IF;

    COMMIT;
END //

DELIMITER ;

-- ============================================================
-- VISTAS
-- ============================================================

-- RN-12: total y saldo se CALCULAN, nunca se guardan.
-- Total = noches x precio_noche + cargos de servicios + ventas de productos.
DROP VIEW IF EXISTS v_saldo_reserva;
CREATE VIEW v_saldo_reserva AS
SELECT
    r.id_reserva,
    (DATEDIFF(r.fecha_salida, r.fecha_entrada) * r.precio_noche)
    + COALESCE((SELECT SUM(cs.cantidad * cs.precio_cobrado)
                FROM Cargo_Servicio cs WHERE cs.id_reserva = r.id_reserva), 0)
    + COALESCE((SELECT SUM(ri.cantidad * ri.precio_unitario)
                FROM Registro_Inventario ri
                WHERE ri.id_reserva = r.id_reserva AND ri.tipo_movimiento = 'Venta'), 0) AS total,
    COALESCE((SELECT SUM(p.monto) FROM Pago p WHERE p.id_reserva = r.id_reserva), 0) AS pagado,
    ((DATEDIFF(r.fecha_salida, r.fecha_entrada) * r.precio_noche)
    + COALESCE((SELECT SUM(cs.cantidad * cs.precio_cobrado)
                FROM Cargo_Servicio cs WHERE cs.id_reserva = r.id_reserva), 0)
    + COALESCE((SELECT SUM(ri.cantidad * ri.precio_unitario)
                FROM Registro_Inventario ri
                WHERE ri.id_reserva = r.id_reserva AND ri.tipo_movimiento = 'Venta'), 0))
    - COALESCE((SELECT SUM(p.monto) FROM Pago p WHERE p.id_reserva = r.id_reserva), 0) AS saldo
FROM Reserva r;

-- RN-16: estado del stock
DROP VIEW IF EXISTS v_estado_stock;
CREATE VIEW v_estado_stock AS
SELECT id_producto, nombre, tipo, precio_venta, unidad_medida, stock_actual, stock_minimo,
       CASE WHEN stock_actual = 0 THEN 'Agotado'
            WHEN stock_actual <= stock_minimo THEN 'Bajo'
            WHEN stock_actual <= stock_minimo * 2 THEN 'Medio'
            ELSE 'Alto' END AS estado_stock
FROM Producto WHERE activo = TRUE;

-- RF-18: catalogo publico sin datos sensibles
DROP VIEW IF EXISTS v_catalogo_publico;
CREATE VIEW v_catalogo_publico AS
SELECT c.id_cabana, c.nombre, c.descripcion, c.capacidad, c.precio_noche, c.foto, c.es_recomendada
FROM Cabana c
WHERE c.activa = TRUE;

-- RF-19: trabajo pendiente para la pantalla tactil
DROP VIEW IF EXISTS v_trabajo_servicios;
CREATE VIEW v_trabajo_servicios AS
SELECT c.id_cabana, c.nombre AS cabana, 'Limpieza' AS tarea, NULL AS id_mantenimiento,
       NULL AS descripcion, NULL AS estado
FROM Cabana c
JOIN Estado_Cabana e ON e.id_estado_cabana = c.id_estado_cabana
WHERE e.nombre = 'En Limpieza'
UNION ALL
SELECT m.id_cabana, c.nombre AS cabana, 'Mantenimiento' AS tarea, m.id_mantenimiento,
       m.descripcion, m.estado
FROM Mantenimiento m
JOIN Cabana c ON c.id_cabana = m.id_cabana
WHERE m.estado <> 'Resuelta';