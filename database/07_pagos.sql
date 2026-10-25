USE DELIMITER //

DROP PROCEDURE IF EXISTS sp_registrar_pago //
CREATE PROCEDURE sp_registrar_pago(
    IN p_id_reserva INT,
    IN p_monto      DECIMAL(10,2),
    IN p_tipo       VARCHAR(10),
    IN p_metodo     VARCHAR(20),
    IN p_id_usuario INT
)
BEGIN
    DECLARE v_estado VARCHAR(30);
    DECLARE v_saldo  DECIMAL(10,2);
    DECLARE v_msg    VARCHAR(200);

    SELECT estado, saldo INTO v_estado, v_saldo
    FROM v_saldo_reserva WHERE id_reserva = p_id_reserva;

    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La reserva especificada no existe.';
    END IF;
    IF v_estado = 'Cancelada' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se pueden registrar pagos en una reserva cancelada.';
    END IF;
    IF p_monto > v_saldo THEN
        SET v_msg = CONCAT('RN-13: El pago supera el saldo pendiente, que es de ', v_saldo);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
    IF p_tipo = 'Saldo' AND p_monto <> v_saldo THEN
        SET v_msg = CONCAT('Un pago de tipo Saldo debe cubrir todo lo pendiente, que es ', v_saldo);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;

    INSERT INTO Pago (id_reserva, monto, tipo, metodo_pago, id_usuario)
    VALUES (p_id_reserva, p_monto, p_tipo, p_metodo, p_id_usuario);

    SELECT v_saldo - p_monto AS saldo_restante;
END //

DELIMITER ;
   