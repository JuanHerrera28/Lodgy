USE lodgy;

-- ============================================================
-- SOLICITUDES DE RESERVA RECIBIDAS DESDE LA WEB PÚBLICA
-- ------------------------------------------------------------
-- Una solicitud NO es una reserva: no bloquea fechas, no crea
-- pagos y no cambia el estado de la cabaña. El panel la revisa
-- y, al aprobarla, crea la reserva real con sp_crear_reserva.
-- El precio_noche se guarda como referencia del momento en que
-- se pidió; la reserva aprobada copia la tarifa vigente.
-- ============================================================
CREATE TABLE IF NOT EXISTS Solicitud_Reserva (
  id_solicitud       INT AUTO_INCREMENT PRIMARY KEY,
  id_cabana          INT NOT NULL,
  tipo_documento     VARCHAR(20)  NOT NULL,
  numero_documento   VARCHAR(20)  NOT NULL,
  nombre             VARCHAR(60)  NOT NULL,
  apellido           VARCHAR(60)  NOT NULL,
  telefono           VARCHAR(20)  NOT NULL,
  correo             VARCHAR(100) NULL,
  fecha_entrada      DATE NOT NULL,
  fecha_salida       DATE NOT NULL,
  num_personas       TINYINT NOT NULL,
  precio_noche       DECIMAL(10,2) NOT NULL,
  observaciones      VARCHAR(300) NULL,
  estado             VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  motivo_rechazo     VARCHAR(200) NULL,
  id_reserva         INT NULL,
  id_usuario_revision INT NULL,
  fecha_creacion     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_revision     DATETIME NULL,
  CONSTRAINT ck_solicitud_fechas   CHECK (fecha_salida > fecha_entrada),
  CONSTRAINT ck_solicitud_personas CHECK (num_personas > 0),
  CONSTRAINT ck_solicitud_precio   CHECK (precio_noche >= 0),
  CONSTRAINT ck_solicitud_estado   CHECK (estado IN ('Pendiente','Aprobada','Rechazada')),
  CONSTRAINT ck_solicitud_doc      CHECK (tipo_documento IN ('CC','CE','TI','Pasaporte')),
  CONSTRAINT fk_solicitud_cabana   FOREIGN KEY (id_cabana) REFERENCES Cabana(id_cabana)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_solicitud_reserva  FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_solicitud_usuario  FOREIGN KEY (id_usuario_revision) REFERENCES Usuario(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_solicitud_estado (estado, fecha_entrada),
  INDEX idx_solicitud_documento (tipo_documento, numero_documento)
) ENGINE=InnoDB;
