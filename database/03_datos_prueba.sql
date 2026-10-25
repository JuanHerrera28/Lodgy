USE lodgy;


INSERT IGNORE INTO Usuario (nombre, apellido, correo, contrasena, id_rol) VALUES
('Ana',       'Ruiz',      'ana@lodgy.com',       'hash_de_prueba', (SELECT id_rol FROM Rol WHERE nombre = 'Administrador')),
('María',     'Gómez',     'maria@lodgy.com',     'hash_de_prueba', (SELECT id_rol FROM Rol WHERE nombre = 'Recepcionista')),
('Servicios', 'Generales', 'servicios@lodgy.com', 'hash_de_prueba', (SELECT id_rol FROM Rol WHERE nombre = 'Servicios generales'));

-- Cabañas (todas empiezan Disponibles)
INSERT IGNORE INTO Cabana (nombre, descripcion, capacidad, precio_noche, id_estado_cabana, es_recomendada) VALUES
('Cabaña Brisa',     'Cabaña familiar frente al mar',       4, 180000, (SELECT id_estado_cabana FROM Estado_Cabana WHERE nombre = 'Disponible'), TRUE),
('Cabaña Coral',     'Cabaña grande con terraza',           6, 260000, (SELECT id_estado_cabana FROM Estado_Cabana WHERE nombre = 'Disponible'), TRUE),
('Cabaña Marea',     'Cabaña para parejas',                 2, 140000, (SELECT id_estado_cabana FROM Estado_Cabana WHERE nombre = 'Disponible'), FALSE),
('Cabaña Palma',     'Cabaña con jardín',                   4, 200000, (SELECT id_estado_cabana FROM Estado_Cabana WHERE nombre = 'Disponible'), FALSE),
('Cabaña Horizonte', 'La más amplia, para grupos',          8, 320000, (SELECT id_estado_cabana FROM Estado_Cabana WHERE nombre = 'Disponible'), TRUE);

-- Servicios incluidos
INSERT IGNORE INTO Servicio (nombre, descripcion) VALUES
('WiFi',               'Internet inalámbrico'),
('Aire acondicionado', 'Climatización en habitaciones'),
('Piscina',            'Acceso a la piscina del alojamiento'),
('Cocina equipada',    'Utensilios y electrodomésticos básicos'),
('Parqueadero',        'Espacio de estacionamiento');

-- Qué servicios tiene cada cabaña
INSERT IGNORE INTO Cabana_Servicio (id_cabana, id_servicio)
SELECT c.id_cabana, s.id_servicio FROM Cabana c, Servicio s
WHERE s.nombre IN ('WiFi', 'Parqueadero', 'Piscina');

INSERT IGNORE INTO Cabana_Servicio (id_cabana, id_servicio)
SELECT c.id_cabana, s.id_servicio FROM Cabana c, Servicio s
WHERE s.nombre = 'Aire acondicionado'
  AND c.nombre IN ('Cabaña Coral', 'Cabaña Palma', 'Cabaña Horizonte');

INSERT IGNORE INTO Cabana_Servicio (id_cabana, id_servicio)
SELECT c.id_cabana, s.id_servicio FROM Cabana c, Servicio s
WHERE s.nombre = 'Cocina equipada'
  AND c.nombre IN ('Cabaña Brisa', 'Cabaña Coral', 'Cabaña Horizonte');

-- Servicios adicionales (se cobran aparte)
INSERT IGNORE INTO Servicio_Adicional (nombre, descripcion, precio) VALUES
('Desayuno',                 'Desayuno típico por persona', 18000),
('Transporte al aeropuerto', 'Traslado de ida o vuelta',    60000),
('Paseo en lancha',          'Recorrido de una hora',       90000),
('Cena típica',              'Cena por persona',            35000);

-- Productos e insumos (el stock empieza en 0: se carga después con entradas de inventario)
INSERT IGNORE INTO Producto (nombre, tipo, precio_venta, unidad_medida, stock_minimo) VALUES
('Agua 600 ml',          'Venta',  3000,  'unidad',  10),
('Gaseosa',              'Venta',  4000,  'unidad',  10),
('Leña para fogata',     'Venta',  15000, 'bulto',   3),
('Papel higiénico',      'Insumo', NULL,  'paquete', 10),
('Jabón de manos',       'Insumo', NULL,  'botella', 5),
('Detergente',           'Insumo', NULL,  'litro',   4);

-- Clientes
INSERT IGNORE INTO Cliente (tipo_documento, numero_documento, nombre, apellido, telefono, correo) VALUES
('CC',        '1100234567', 'Carlos', 'Martínez', '3001234567', 'carlos@gmail.com'),
('Pasaporte', 'AB123456',   'Laura',  'Smith',    '3109876543', NULL),
('CC',        '1002345678', 'Juan',   'Pérez',    '3205551122', NULL),
('CC',        '1098765432', 'Sofía',  'Herrera',  '3156667788', 'sofia@gmail.com');