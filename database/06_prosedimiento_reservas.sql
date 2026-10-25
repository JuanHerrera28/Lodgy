USE lodgy;

DELIMITER //

-- ============================================================
-- CREAR RESERVA: nace Confirmada, copia el precio y abre el historial
-- ============================================================
DROP PROCEDURE IF EXISTS sp_crear_reserva //
CREATE PROCEDURE sp_crear_reserva(
    IN p_id_cliente    INT,
    IN p_id_cabana     INT,
    IN p_id_usuario    INT,
    IN p_fecha_entrada DATE,
    IN p_fecha_salida  DATE,
    IN p_num_personas  INT,
    IN p_observaciones VARCHAR(300)
)
BEGIN
    DECLARE v_precio        DECIMAL(10,2);
    DECLARE v_activa        BOOLEAN;
    DECLARE v_id_confirmada INT;
    DECLARE v_id_reserva    INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT precio_noche, activa INTO v_precio, v_activa
    FROM Cabana WHERE id_cabana = p_id_cabana;

    IF v_precio IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cabaña especificada no existe.';
    END IF;
    IF v_activa = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cabaña está desactivada y no se puede reservar.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE id_cliente = p_id_cliente) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente especificado no existe.';
    END IF;

    SELECT id_estado_reserva INTO v_id_confirmada
    FROM Estado_Reserva WHERE nombre = 'Confirmada';

    START TRANSACTION;

    -- Los triggers validan aquí el cruce de fechas (RN-01) y la capacidad (RN-03)
    INSERT INTO Reserva (id_cliente, id_cabana, id_usuario, id_estado_reserva,
                         fecha_entrada, fecha_salida, num_personas, precio_noche, observaciones)
    VALUES (p_id_cliente, p_id_cabana, p_id_usuario, v_id_confirmada,
            p_fecha_entrada, p_fecha_salida, p_num_personas, v_precio, p_observaciones);

    SET v_id_reserva = LAST_INSERT_ID();

    INSERT INTO Historial_Reserva (id_reserva, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (v_id_reserva, NULL, v_id_confirmada, p_id_usuario, 'Reserva creada');

    COMMIT;

    SELECT v_id_reserva AS id_reserva;
END //

-- ============================================================
-- CANCELAR RESERVA: Confirmada -> Cancelada (RN-04)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_cancelar_reserva //
CREATE PROCEDURE sp_cancelar_reserva(
    IN p_id_reserva INT,
    IN p_id_usuario INT,
    IN p_motivo     VARCHAR(200)
)
BEGIN
    DECLARE v_estado_actual  VARCHAR(30);
    DECLARE v_id_confirmada  INT;
    DECLARE v_id_cancelada   INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT er.nombre INTO v_estado_actual
    FROM Reserva r
    JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
    WHERE r.id_reserva = p_id_reserva;

    IF v_estado_actual IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La reserva especificada no existe.';
    END IF;
    IF v_estado_actual <> 'Confirmada' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden cancelar reservas Confirmadas.';
    END IF;

    SELECT id_estado_reserva INTO v_id_confirmada FROM Estado_Reserva WHERE nombre = 'Confirmada';
    SELECT id_estado_reserva INTO v_id_cancelada  FROM Estado_Reserva WHERE nombre = 'Cancelada';

    START TRANSACTION;

    UPDATE Reserva SET id_estado_reserva = v_id_cancelada WHERE id_reserva = p_id_reserva;

    INSERT INTO Historial_Reserva (id_reserva, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (p_id_reserva, v_id_confirmada, v_id_cancelada, p_id_usuario,
            COALESCE(NULLIF(TRIM(p_motivo), ''), 'Sin motivo indicado'));

    COMMIT;
END //

DELIMITER ;