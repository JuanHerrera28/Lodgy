USE lodgy;

INSERT IGNORE INTO Rol (nombre, descripcion) VALUES
('Administrador', 'Gestiona usuarios, cabañas e inventario, y consulta todo el sistema'),
('Recepcionista', 'Gestiona clientes, reservas, pagos y cargos'),
('Servicios generales', 'Marca las tareas realizadas, registra insumos y reporta daños');

INSERT IGNORE INTO Estado_Cabana (nombre, descripcion) VALUES
('Disponible', 'Lista para recibir clientes'),
('Ocupada', 'Con clientes alojados'),
('En Limpieza', 'Después del check-out, a la espera de limpieza'),
('En Mantenimiento', 'Fuera de servicio por un daño o reparación');

INSERT IGNORE INTO Estado_Reserva (nombre, descripcion) VALUES
('Confirmada', 'Reserva registrada, el cliente aún no llega'),
('En curso', 'Se hizo el check-in y el cliente está alojado'),
('Finalizada', 'Se hizo el check-out'),
('Cancelada', 'La reserva fue cancelada antes de llegar');