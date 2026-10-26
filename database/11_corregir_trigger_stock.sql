-- Corrige el doble descuento/suma de stock.
-- En la base quedaron DOS triggers que actualizan Producto.stock_actual en cada
-- movimiento de Registro_Inventario:
--   1) trg_inventario_stock            (BEFORE INSERT) -> valida y actualiza el stock  [se conserva]
--   2) trg_actualizar_stock_insert_after (AFTER INSERT) -> vuelve a actualizar el stock [se elimina]
-- Resultado del error: una Entrada de 1 unidad sumaba 2 y una Venta de 1 restaba 2.
-- Ejecutar como root en MySQL Workbench. Si algún día vuelves a ejecutar
-- 08_stock.sql, vuelve a ejecutar este archivo después.
USE lodgy;

DROP TRIGGER IF EXISTS trg_actualizar_stock_insert_after;
