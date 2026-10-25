USE lodgy;

DELIMITER //
-- ========================================================
-- TRIGGERS DE VALIDACIÓN DE RESERVAS
-- ============================================================
DROP TRIGGER IF EXISTS trg_evitar_reservas_cruzadas_insert //
CREATE TRIGGER trg_evitar_reservas_cruzadas_insert
BEFORE INSERT ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_solapamientos INT;

    SELECT COUNT(*) INTO v_solapamientos
    FROM Reserva r
    JOIN Estado_Reserva er ON r.id_estado_reserva = er.id_estado_reserva
    WHERE r.id_cabana = NEW.id_cabana
      AND er.nombre != 'Cancelada'
      AND NEW.fecha_entrada < r.fecha_salida
      AND NEW.fecha_salida  > r.fecha_entrada;

    IF v_solapamientos > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-01: La cabaña ya se encuentra reservada para las fechas solicitadas.';
    END IF;
END //

DROP TRIGGER IF EXISTS trg_evitar_reservas_cruzadas_update //
CREATE TRIGGER trg_evitar_reservas_cruzadas_update
BEFORE UPDATE ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_solapamientos INT;

    SELECT COUNT(*) INTO v_solapamientos
    FROM Reserva r
    JOIN Estado_Reserva er ON r.id_estado_reserva = er.id_estado_reserva
    WHERE r.id_cabana = NEW.id_cabana
      AND r.id_reserva != NEW.id_reserva
      AND er.nombre != 'Cancelada'
      AND NEW.fecha_entrada < r.fecha_salida
      AND NEW.fecha_salida  > r.fecha_entrada;

    IF v_solapamientos > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-01: La modificación genera un cruce de fechas con otra reserva existente.';
    END IF;
END //

DROP TRIGGER IF EXISTS trg_validar_capacidad_cabana //
CREATE TRIGGER trg_validar_capacidad_cabana
BEFORE INSERT ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_capacidad INT;
    SELECT capacidad INTO v_capacidad FROM Cabana WHERE id_cabana = NEW.id_cabana;

    IF NEW.num_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-03: El número de personas excede la capacidad máxima de la cabaña.';
    END IF;
END //

DROP TRIGGER IF EXISTS trg_validar_capacidad_cabana_update //
CREATE TRIGGER trg_validar_capacidad_cabana_update
BEFORE UPDATE ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_capacidad INT;
    SELECT capacidad INTO v_capacidad FROM Cabana WHERE id_cabana = NEW.id_cabana;

    IF NEW.num_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-03: El número de personas excede la capacidad máxima de la cabaña.';
    END IF;
END //

-- ============================================================
-- CHECK-IN: Confirmada -> En curso | cabaña Disponible -> Ocupada
-- ============================================================
DROP PROCEDURE IF EXISTS sp_registrar_checkin //
CREATE PROCEDURE sp_registrar_checkin(
    IN p_id_reserva INT,
    IN p_id_usuario INT
)
BEGIN
    DECLARE v_id_cabana      INT;
    DECLARE v_estado_reserva VARCHAR(30);
    DECLARE v_estado_cabana  VARCHAR(30);
    DECLARE v_id_confirmada  INT;
    DECLARE v_id_en_curso    INT;
    DECLARE v_id_disponible  INT;
    DECLARE v_id_ocupada     INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT r.id_cabana, er.nombre, ec.nombre
      INTO v_id_cabana, v_estado_reserva, v_estado_cabana
    FROM Reserva r
    JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
    JOIN Cabana c          ON c.id_cabana = r.id_cabana
    JOIN Estado_Cabana ec  ON ec.id_estado_cabana = c.id_estado_cabana
    WHERE r.id_reserva = p_id_reserva;

    IF v_id_cabana IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La reserva especificada no existe.';
    END IF;
    IF v_estado_reserva <> 'Confirmada' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se puede hacer check-in en reservas Confirmadas.';
    END IF;
    IF v_estado_cabana <> 'Disponible' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RN-05: La cabaña no está Disponible para el check-in.';
    END IF;

    SELECT id_estado_reserva INTO v_id_confirmada FROM Estado_Reserva WHERE nombre = 'Confirmada';
    SELECT id_estado_reserva INTO v_id_en_curso   FROM Estado_Reserva WHERE nombre = 'En curso';
    SELECT id_estado_cabana  INTO v_id_disponible FROM Estado_Cabana  WHERE nombre = 'Disponible';
    SELECT id_estado_cabana  INTO v_id_ocupada    FROM Estado_Cabana  WHERE nombre = 'Ocupada';

    START TRANSACTION;

    UPDATE Reserva
       SET id_estado_reserva = v_id_en_curso, fecha_checkin = NOW()
     WHERE id_reserva = p_id_reserva;

    INSERT INTO Historial_Reserva (id_reserva, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (p_id_reserva, v_id_confirmada, v_id_en_curso, p_id_usuario, 'Check-in');

    UPDATE Cabana SET id_estado_cabana = v_id_ocupada WHERE id_cabana = v_id_cabana;

    INSERT INTO Historial_Estado_Cabana (id_cabana, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (v_id_cabana, v_id_disponible, v_id_ocupada, p_id_usuario,
            CONCAT('Check-in de la reserva ', p_id_reserva));

    COMMIT;
END //

-- ============================================================
-- CHECK-OUT: En curso -> Finalizada | cabaña -> En Limpieza
-- ============================================================
DROP PROCEDURE IF EXISTS sp_registrar_checkout //
CREATE PROCEDURE sp_registrar_checkout(
    IN p_id_reserva INT,
    IN p_id_usuario INT
)
BEGIN
    DECLARE v_id_cabana        INT;
    DECLARE v_estado_reserva   VARCHAR(30);
    DECLARE v_id_cab_anterior  INT;
    DECLARE v_id_en_curso      INT;
    DECLARE v_id_finalizada    INT;
    DECLARE v_id_en_limpieza   INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT r.id_cabana, er.nombre, c.id_estado_cabana
      INTO v_id_cabana, v_estado_reserva, v_id_cab_anterior
    FROM Reserva r
    JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
    JOIN Cabana c          ON c.id_cabana = r.id_cabana
    WHERE r.id_reserva = p_id_reserva;

    IF v_id_cabana IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La reserva especificada no existe.';
    END IF;
    IF v_estado_reserva <> 'En curso' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se puede hacer check-out en reservas En curso.';
    END IF;

    SELECT id_estado_reserva INTO v_id_en_curso    FROM Estado_Reserva WHERE nombre = 'En curso';
    SELECT id_estado_reserva INTO v_id_finalizada  FROM Estado_Reserva WHERE nombre = 'Finalizada';
    SELECT id_estado_cabana  INTO v_id_en_limpieza FROM Estado_Cabana  WHERE nombre = 'En Limpieza';

    START TRANSACTION;

    UPDATE Reserva
       SET id_estado_reserva = v_id_finalizada, fecha_checkout = NOW()
     WHERE id_reserva = p_id_reserva;

    INSERT INTO Historial_Reserva (id_reserva, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (p_id_reserva, v_id_en_curso, v_id_finalizada, p_id_usuario, 'Check-out');

    UPDATE Cabana SET id_estado_cabana = v_id_en_limpieza WHERE id_cabana = v_id_cabana;

    INSERT INTO Historial_Estado_Cabana (id_cabana, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (v_id_cabana, v_id_cab_anterior, v_id_en_limpieza, p_id_usuario,
            CONCAT('Check-out de la reserva ', p_id_reserva));

    COMMIT;
END //

-- ============================================================
-- CABAÑA LISTA: En Limpieza -> Disponible (botón "Listo" de servicios generales)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_cabana_lista //
CREATE PROCEDURE sp_cabana_lista(
    IN p_id_cabana  INT,
    IN p_id_usuario INT
)
BEGIN
    DECLARE v_estado_cabana  VARCHAR(30);
    DECLARE v_id_en_limpieza INT;
    DECLARE v_id_disponible  INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT ec.nombre INTO v_estado_cabana
    FROM Cabana c
    JOIN Estado_Cabana ec ON ec.id_estado_cabana = c.id_estado_cabana
    WHERE c.id_cabana = p_id_cabana;

    IF v_estado_cabana IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cabaña especificada no existe.';
    END IF;
    IF v_estado_cabana <> 'En Limpieza' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RN-07: Solo se puede marcar como lista una cabaña En Limpieza.';
    END IF;

    SELECT id_estado_cabana INTO v_id_en_limpieza FROM Estado_Cabana WHERE nombre = 'En Limpieza';
    SELECT id_estado_cabana INTO v_id_disponible  FROM Estado_Cabana WHERE nombre = 'Disponible';

    START TRANSACTION;

    UPDATE Cabana SET id_estado_cabana = v_id_disponible WHERE id_cabana = p_id_cabana;

    INSERT INTO Historial_Estado_Cabana (id_cabana, id_estado_anterior, id_estado_nuevo, id_usuario, observacion)
    VALUES (p_id_cabana, v_id_en_limpieza, v_id_disponible, p_id_usuario, 'Limpieza terminada');

    COMMIT;
END //

DELIMITER ;