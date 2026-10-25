
USE lodgy;

-- ---------- Seguridad ----------
CREATE TABLE Rol (
  id_rol      INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(30)  NOT NULL UNIQUE,
  descripcion VARCHAR(150) NULL
) ENGINE=InnoDB;

CREATE TABLE Usuario (
  id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(60)  NOT NULL,
  apellido       VARCHAR(60)  NOT NULL,
  correo         VARCHAR(100) NOT NULL UNIQUE,
  contrasena     VARCHAR(255) NOT NULL,
  id_rol         INT NOT NULL,
  activo         BOOLEAN  NOT NULL DEFAULT TRUE,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------- Clientes ----------
CREATE TABLE Cliente (
  id_cliente       INT AUTO_INCREMENT PRIMARY KEY,
  tipo_documento   VARCHAR(20) NOT NULL,
  numero_documento VARCHAR(20) NOT NULL,
  nombre           VARCHAR(60) NOT NULL,
  apellido         VARCHAR(60) NOT NULL,
  telefono         VARCHAR(20) NOT NULL,
  correo           VARCHAR(100) NULL,
  fecha_registro   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_cliente_tipo_doc CHECK (tipo_documento IN ('CC','CE','TI','Pasaporte')),
  CONSTRAINT uq_cliente_documento UNIQUE (tipo_documento, numero_documento)
) ENGINE=InnoDB;


CREATE TABLE Estado_Cabana (
  id_estado_cabana INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(30)  NOT NULL UNIQUE,
  descripcion      VARCHAR(150) NULL
) ENGINE=InnoDB;

CREATE TABLE Cabana (
  id_cabana        INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(50)  NOT NULL UNIQUE,
  descripcion      VARCHAR(500) NULL,
  capacidad        TINYINT      NOT NULL,
  precio_noche     DECIMAL(10,2) NOT NULL,
  foto             VARCHAR(255) NULL,
  id_estado_cabana INT NOT NULL,
  es_recomendada   BOOLEAN NOT NULL DEFAULT FALSE,
  activa           BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_cabana_capacidad CHECK (capacidad > 0),
  CONSTRAINT ck_cabana_precio    CHECK (precio_noche >= 0),
  CONSTRAINT fk_cabana_estado FOREIGN KEY (id_estado_cabana) REFERENCES Estado_Cabana(id_estado_cabana)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Historial_Estado_Cabana (
  id_historial_estado_cabana INT AUTO_INCREMENT PRIMARY KEY,
  id_cabana          INT NOT NULL,
  id_estado_anterior INT NULL,
  id_estado_nuevo    INT NOT NULL,
  fecha_cambio       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario         INT NOT NULL,
  observacion        VARCHAR(200) NULL,
  CONSTRAINT fk_hec_cabana   FOREIGN KEY (id_cabana)          REFERENCES Cabana(id_cabana)               ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hec_anterior FOREIGN KEY (id_estado_anterior) REFERENCES Estado_Cabana(id_estado_cabana) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hec_nuevo    FOREIGN KEY (id_estado_nuevo)    REFERENCES Estado_Cabana(id_estado_cabana) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hec_usuario  FOREIGN KEY (id_usuario)         REFERENCES Usuario(id_usuario)             ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Servicio (
  id_servicio INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(60)  NOT NULL UNIQUE,
  descripcion VARCHAR(150) NULL
) ENGINE=InnoDB;

CREATE TABLE Cabana_Servicio (
  id_cabana   INT NOT NULL,
  id_servicio INT NOT NULL,
  PRIMARY KEY (id_cabana, id_servicio),
  CONSTRAINT fk_cs_cabana   FOREIGN KEY (id_cabana)   REFERENCES Cabana(id_cabana)     ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cs_servicio FOREIGN KEY (id_servicio) REFERENCES Servicio(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Servicio_Adicional (
  id_servicio_adicional INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(60)   NOT NULL UNIQUE,
  descripcion VARCHAR(150)  NULL,
  precio      DECIMAL(10,2) NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_sa_precio CHECK (precio >= 0)
) ENGINE=InnoDB;

-- ---------- Reservas ----------
CREATE TABLE Estado_Reserva (
  id_estado_reserva INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(30)  NOT NULL UNIQUE,
  descripcion       VARCHAR(150) NULL
) ENGINE=InnoDB;

CREATE TABLE Reserva (
  id_reserva        INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente        INT NOT NULL,
  id_cabana         INT NOT NULL,
  id_usuario        INT NOT NULL,
  id_estado_reserva INT NOT NULL,
  fecha_entrada     DATE NOT NULL,
  fecha_salida      DATE NOT NULL,
  num_personas      TINYINT NOT NULL,
  precio_noche      DECIMAL(10,2) NOT NULL,
  fecha_checkin     DATETIME NULL,
  fecha_checkout    DATETIME NULL,
  observaciones     VARCHAR(300) NULL,
  fecha_creacion    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_reserva_fechas   CHECK (fecha_salida > fecha_entrada),
  CONSTRAINT ck_reserva_personas CHECK (num_personas > 0),
  CONSTRAINT ck_reserva_precio   CHECK (precio_noche >= 0),
  CONSTRAINT ck_reserva_checkout CHECK (
    fecha_checkout IS NULL OR fecha_checkin IS NULL OR fecha_checkout >= fecha_checkin),
  CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente)        REFERENCES Cliente(id_cliente)               ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reserva_cabana  FOREIGN KEY (id_cabana)         REFERENCES Cabana(id_cabana)                 ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario)        REFERENCES Usuario(id_usuario)               ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reserva_estado  FOREIGN KEY (id_estado_reserva) REFERENCES Estado_Reserva(id_estado_reserva) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Historial_Reserva (
  id_historial_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva           INT NOT NULL,
  id_estado_anterior   INT NULL,
  id_estado_nuevo      INT NOT NULL,
  fecha_cambio         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario           INT NOT NULL,
  observacion          VARCHAR(200) NULL,
  CONSTRAINT fk_hr_reserva  FOREIGN KEY (id_reserva)         REFERENCES Reserva(id_reserva)               ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hr_anterior FOREIGN KEY (id_estado_anterior) REFERENCES Estado_Reserva(id_estado_reserva) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hr_nuevo    FOREIGN KEY (id_estado_nuevo)    REFERENCES Estado_Reserva(id_estado_reserva) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hr_usuario  FOREIGN KEY (id_usuario)         REFERENCES Usuario(id_usuario)               ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Cargo_Servicio (
  id_cargo_servicio     INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva            INT NOT NULL,
  id_servicio_adicional INT NOT NULL,
  cantidad              SMALLINT NOT NULL,
  precio_cobrado        DECIMAL(10,2) NOT NULL,
  fecha_cargo           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario            INT NOT NULL,
  CONSTRAINT ck_cargo_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_cargo_precio   CHECK (precio_cobrado >= 0),
  CONSTRAINT fk_cargo_reserva  FOREIGN KEY (id_reserva)            REFERENCES Reserva(id_reserva)                       ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cargo_servicio FOREIGN KEY (id_servicio_adicional) REFERENCES Servicio_Adicional(id_servicio_adicional) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cargo_usuario  FOREIGN KEY (id_usuario)            REFERENCES Usuario(id_usuario)                       ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Pago (
  id_pago     INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva  INT NOT NULL,
  monto       DECIMAL(10,2) NOT NULL,
  tipo        VARCHAR(10) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL,
  fecha_pago  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario  INT NOT NULL,
  CONSTRAINT ck_pago_monto  CHECK (monto > 0),
  CONSTRAINT ck_pago_tipo   CHECK (tipo IN ('Anticipo','Saldo')),
  CONSTRAINT ck_pago_metodo CHECK (metodo_pago IN ('Efectivo','Transferencia','Tarjeta')),
  CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pago_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------- Inventario ----------
CREATE TABLE Producto (
   id_producto    INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(80) NOT NULL UNIQUE,
  tipo           VARCHAR(10) NOT NULL,
  precio_venta   DECIMAL(10,2) NULL,
  unidad_medida  VARCHAR(20) NOT NULL,
  stock_actual   INT NOT NULL DEFAULT 0,
  stock_minimo   INT NOT NULL DEFAULT 0,
  activo         BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_producto_tipo   CHECK (tipo IN ('Venta','Insumo')),
  CONSTRAINT ck_producto_precio CHECK (precio_venta IS NULL OR precio_venta >= 0),
  CONSTRAINT ck_producto_stock  CHECK (stock_actual >= 0),
  CONSTRAINT ck_producto_minimo CHECK (stock_minimo >= 0),
  CONSTRAINT ck_producto_precio_tipo CHECK (
    (tipo = 'Venta'  AND precio_venta IS NOT NULL) OR
    (tipo = 'Insumo' AND precio_venta IS NULL))
) ENGINE=InnoDB;

CREATE TABLE Registro_Inventario (
  id_registro_inventario INT AUTO_INCREMENT PRIMARY KEY,
  id_producto      INT NOT NULL,
  tipo_movimiento  VARCHAR(10) NOT NULL,
  cantidad         INT NOT NULL,
  costo_unitario   DECIMAL(10,2) NULL,
  precio_unitario  DECIMAL(10,2) NULL,
  id_reserva       INT NULL,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario       INT NOT NULL,
  observacion      VARCHAR(200) NULL,
  CONSTRAINT ck_ri_tipo     CHECK (tipo_movimiento IN ('Entrada','Venta','Consumo','Ajuste')),
  CONSTRAINT ck_ri_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_ri_costo    CHECK (costo_unitario  IS NULL OR costo_unitario  >= 0),
  CONSTRAINT ck_ri_precio   CHECK (precio_unitario IS NULL OR precio_unitario >= 0),
  CONSTRAINT fk_ri_producto FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_ri_reserva  FOREIGN KEY (id_reserva)  REFERENCES Reserva(id_reserva)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_ri_usuario  FOREIGN KEY (id_usuario)  REFERENCES Usuario(id_usuario)   ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------- Mantenimiento ----------
CREATE TABLE Mantenimiento (
  id_mantenimiento   INT AUTO_INCREMENT PRIMARY KEY,
  id_cabana          INT NOT NULL,
  descripcion        VARCHAR(300) NOT NULL,
  fecha_reporte      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario_reporta INT NOT NULL,
  estado             VARCHAR(15) NOT NULL DEFAULT 'Pendiente',
  bloquea_cabana     BOOLEAN NOT NULL DEFAULT FALSE,
  responsable        VARCHAR(80) NULL,
  costo              DECIMAL(10,2) NULL,
  fecha_cierre       DATETIME NULL,
  CONSTRAINT ck_mant_estado CHECK (estado IN ('Pendiente','En proceso','Resuelta')),
  CONSTRAINT ck_mant_costo  CHECK (costo IS NULL OR costo >= 0),
  CONSTRAINT ck_mant_cierre CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_reporte),
  CONSTRAINT fk_mant_cabana  FOREIGN KEY (id_cabana)          REFERENCES Cabana(id_cabana)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_mant_usuario FOREIGN KEY (id_usuario_reporta) REFERENCES Usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


  CREATE INDEX idx_reserva_cabana_fechas
  ON Reserva (id_cabana, fecha_entrada, fecha_salida);