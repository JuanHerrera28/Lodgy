USE lodgy;

DELIMITER //

DROP TRIGGER IF EXISTS trg_actualizar_stock_insert //
CREATE TRIGGER trg_actualizar_stock_insert
BEFORE INSERT ON Registro_Inventario
FOR EACH ROW
BEGIN
    DECLARE v_stock_actual INT;

    -- Validar que no se venda más del stock disponible
    IF NEW.tipo_movimiento IN ('Venta', 'Consumo') THEN
        SELECT stock_actual INTO v_stock_actual 
        FROM Producto WHERE id_producto = NEW.id_producto;
        
        IF NEW.cantidad > v_stock_actual THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'RN-XX: La cantidad solicitada supera el stock disponible del producto.';
        END IF;
    END IF;
END //

DROP TRIGGER IF EXISTS trg_actualizar_stock_insert_after //
CREATE TRIGGER trg_actualizar_stock_insert_after
AFTER INSERT ON Registro_Inventario
FOR EACH ROW
BEGIN
    IF NEW.tipo_movimiento = 'Entrada' THEN
        UPDATE Producto SET stock_actual = stock_actual + NEW.cantidad WHERE id_producto = NEW.id_producto;
    ELSEIF NEW.tipo_movimiento IN ('Venta', 'Consumo', 'Ajuste') THEN
        UPDATE Producto SET stock_actual = stock_actual - NEW.cantidad WHERE id_producto = NEW.id_producto;
    END IF;
END //

DELIMITER ;