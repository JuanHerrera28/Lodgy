CREATE DATABASE  IF NOT EXISTS `lodgy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `lodgy`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: lodgy
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cabana`
--

DROP TABLE IF EXISTS `cabana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabana` (
  `id_cabana` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `capacidad` tinyint(4) NOT NULL,
  `precio_noche` decimal(10,2) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `id_estado_cabana` int(11) NOT NULL,
  `es_recomendada` tinyint(1) NOT NULL DEFAULT 0,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_cabana`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_cabana_estado` (`id_estado_cabana`),
  CONSTRAINT `fk_cabana_estado` FOREIGN KEY (`id_estado_cabana`) REFERENCES `estado_cabana` (`id_estado_cabana`) ON UPDATE CASCADE,
  CONSTRAINT `ck_cabana_capacidad` CHECK (`capacidad` > 0),
  CONSTRAINT `ck_cabana_precio` CHECK (`precio_noche` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabana`
--

LOCK TABLES `cabana` WRITE;
/*!40000 ALTER TABLE `cabana` DISABLE KEYS */;
INSERT INTO `cabana` VALUES (1,'Cabaña Brisa','Cabaña familiar frente al mar',4,180000.00,NULL,1,1,1),(2,'Cabaña Coral','Cabaña grande con terraza',6,260000.00,NULL,1,1,1),(3,'Cabaña Marea','Cabaña para parejas',2,140000.00,NULL,1,0,1),(4,'Cabaña Palma','Cabaña con jardín',4,200000.00,NULL,1,0,1),(5,'Cabaña Horizonte','La más amplia, para grupos',8,320000.00,NULL,1,1,1);
/*!40000 ALTER TABLE `cabana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabana_servicio`
--

DROP TABLE IF EXISTS `cabana_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabana_servicio` (
  `id_cabana` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  PRIMARY KEY (`id_cabana`,`id_servicio`),
  KEY `fk_cs_servicio` (`id_servicio`),
  CONSTRAINT `fk_cs_cabana` FOREIGN KEY (`id_cabana`) REFERENCES `cabana` (`id_cabana`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cs_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id_servicio`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabana_servicio`
--

LOCK TABLES `cabana_servicio` WRITE;
/*!40000 ALTER TABLE `cabana_servicio` DISABLE KEYS */;
INSERT INTO `cabana_servicio` VALUES (1,1),(1,3),(1,4),(1,5),(2,1),(2,2),(2,3),(2,4),(2,5),(3,1),(3,3),(3,5),(4,1),(4,2),(4,3),(4,5),(5,1),(5,2),(5,3),(5,4),(5,5);
/*!40000 ALTER TABLE `cabana_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargo_servicio`
--

DROP TABLE IF EXISTS `cargo_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargo_servicio` (
  `id_cargo_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `id_reserva` int(11) NOT NULL,
  `id_servicio_adicional` int(11) NOT NULL,
  `cantidad` smallint(6) NOT NULL,
  `precio_cobrado` decimal(10,2) NOT NULL,
  `fecha_cargo` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_cargo_servicio`),
  KEY `fk_cargo_reserva` (`id_reserva`),
  KEY `fk_cargo_servicio` (`id_servicio_adicional`),
  KEY `fk_cargo_usuario` (`id_usuario`),
  CONSTRAINT `fk_cargo_reserva` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cargo_servicio` FOREIGN KEY (`id_servicio_adicional`) REFERENCES `servicio_adicional` (`id_servicio_adicional`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cargo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `ck_cargo_cantidad` CHECK (`cantidad` > 0),
  CONSTRAINT `ck_cargo_precio` CHECK (`precio_cobrado` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargo_servicio`
--

LOCK TABLES `cargo_servicio` WRITE;
/*!40000 ALTER TABLE `cargo_servicio` DISABLE KEYS */;
INSERT INTO `cargo_servicio` VALUES (1,18,1,2,18000.00,'2026-10-25 09:31:12',2),(2,18,1,2,18000.00,'2026-10-25 09:35:22',2),(3,18,1,2,18000.00,'2026-10-25 09:36:14',2);
/*!40000 ALTER TABLE `cargo_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(20) NOT NULL,
  `numero_documento` varchar(20) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `apellido` varchar(60) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uq_cliente_documento` (`tipo_documento`,`numero_documento`),
  CONSTRAINT `ck_cliente_tipo_doc` CHECK (`tipo_documento` in ('CC','CE','TI','Pasaporte'))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'CC','1100234567','Carlos','Martínez','3001234567','carlos@gmail.com','2026-10-20 11:04:28'),(2,'Pasaporte','AB123456','Laura','Smith','3109876543',NULL,'2026-10-20 11:04:28'),(3,'CC','1002345678','Juan','Pérez','3205551122',NULL,'2026-10-20 11:04:28'),(4,'CC','1098765432','Sofía','Herrera','3156667788','sofia@gmail.com','2026-10-20 11:04:28');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_cabana`
--

DROP TABLE IF EXISTS `estado_cabana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_cabana` (
  `id_estado_cabana` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_estado_cabana`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_cabana`
--

LOCK TABLES `estado_cabana` WRITE;
/*!40000 ALTER TABLE `estado_cabana` DISABLE KEYS */;
INSERT INTO `estado_cabana` VALUES (1,'Disponible','Lista para recibir clientes'),(2,'Ocupada','Con clientes alojados'),(3,'En Limpieza','Después del check-out, a la espera de limpieza'),(4,'En Mantenimiento','Fuera de servicio por un daño o reparación');
/*!40000 ALTER TABLE `estado_cabana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_reserva`
--

DROP TABLE IF EXISTS `estado_reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_reserva` (
  `id_estado_reserva` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_estado_reserva`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_reserva`
--

LOCK TABLES `estado_reserva` WRITE;
/*!40000 ALTER TABLE `estado_reserva` DISABLE KEYS */;
INSERT INTO `estado_reserva` VALUES (1,'Confirmada','Reserva registrada, el cliente aún no llega'),(2,'En curso','Se hizo el check-in y el cliente está alojado'),(3,'Finalizada','Se hizo el check-out'),(4,'Cancelada','La reserva fue cancelada antes de llegar');
/*!40000 ALTER TABLE `estado_reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_estado_cabana`
--

DROP TABLE IF EXISTS `historial_estado_cabana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estado_cabana` (
  `id_historial_estado_cabana` int(11) NOT NULL AUTO_INCREMENT,
  `id_cabana` int(11) NOT NULL,
  `id_estado_anterior` int(11) DEFAULT NULL,
  `id_estado_nuevo` int(11) NOT NULL,
  `fecha_cambio` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `observacion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_historial_estado_cabana`),
  KEY `fk_hec_cabana` (`id_cabana`),
  KEY `fk_hec_anterior` (`id_estado_anterior`),
  KEY `fk_hec_nuevo` (`id_estado_nuevo`),
  KEY `fk_hec_usuario` (`id_usuario`),
  CONSTRAINT `fk_hec_anterior` FOREIGN KEY (`id_estado_anterior`) REFERENCES `estado_cabana` (`id_estado_cabana`) ON UPDATE CASCADE,
  CONSTRAINT `fk_hec_cabana` FOREIGN KEY (`id_cabana`) REFERENCES `cabana` (`id_cabana`) ON UPDATE CASCADE,
  CONSTRAINT `fk_hec_nuevo` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `estado_cabana` (`id_estado_cabana`) ON UPDATE CASCADE,
  CONSTRAINT `fk_hec_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estado_cabana`
--

LOCK TABLES `historial_estado_cabana` WRITE;
/*!40000 ALTER TABLE `historial_estado_cabana` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_estado_cabana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_reserva`
--

DROP TABLE IF EXISTS `historial_reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_reserva` (
  `id_historial_reserva` int(11) NOT NULL AUTO_INCREMENT,
  `id_reserva` int(11) NOT NULL,
  `id_estado_anterior` int(11) DEFAULT NULL,
  `id_estado_nuevo` int(11) NOT NULL,
  `fecha_cambio` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `observacion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_historial_reserva`),
  KEY `fk_hr_reserva` (`id_reserva`),
  KEY `fk_hr_anterior` (`id_estado_anterior`),
  KEY `fk_hr_nuevo` (`id_estado_nuevo`),
  KEY `fk_hr_usuario` (`id_usuario`),
  CONSTRAINT `fk_hr_anterior` FOREIGN KEY (`id_estado_anterior`) REFERENCES `estado_reserva` (`id_estado_reserva`) ON UPDATE CASCADE,
  CONSTRAINT `fk_hr_nuevo` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `estado_reserva` (`id_estado_reserva`) ON UPDATE CASCADE,
  CONSTRAINT `fk_hr_reserva` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON UPDATE CASCADE,
  CONSTRAINT `fk_hr_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_reserva`
--

LOCK TABLES `historial_reserva` WRITE;
/*!40000 ALTER TABLE `historial_reserva` DISABLE KEYS */;
INSERT INTO `historial_reserva` VALUES (1,17,NULL,1,'2026-10-25 09:16:30',2,'Reserva creada'),(2,17,1,4,'2026-10-25 09:22:23',2,'El cliente canceló por viaje'),(3,18,NULL,1,'2026-10-25 09:23:15',2,'Reserva creada');
/*!40000 ALTER TABLE `historial_reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_cabana` int(11) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `fecha_reporte` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario_reporta` int(11) NOT NULL,
  `estado` varchar(15) NOT NULL DEFAULT 'Pendiente',
  `bloquea_cabana` tinyint(1) NOT NULL DEFAULT 0,
  `responsable` varchar(80) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `fk_mant_cabana` (`id_cabana`),
  KEY `fk_mant_usuario` (`id_usuario_reporta`),
  CONSTRAINT `fk_mant_cabana` FOREIGN KEY (`id_cabana`) REFERENCES `cabana` (`id_cabana`) ON UPDATE CASCADE,
  CONSTRAINT `fk_mant_usuario` FOREIGN KEY (`id_usuario_reporta`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `ck_mant_estado` CHECK (`estado` in ('Pendiente','En proceso','Resuelta')),
  CONSTRAINT `ck_mant_costo` CHECK (`costo` is null or `costo` >= 0),
  CONSTRAINT `ck_mant_cierre` CHECK (`fecha_cierre` is null or `fecha_cierre` >= `fecha_reporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_reserva` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `metodo_pago` varchar(20) NOT NULL,
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `fk_pago_reserva` (`id_reserva`),
  KEY `fk_pago_usuario` (`id_usuario`),
  CONSTRAINT `fk_pago_reserva` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pago_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `ck_pago_monto` CHECK (`monto` > 0),
  CONSTRAINT `ck_pago_tipo` CHECK (`tipo` in ('Anticipo','Saldo')),
  CONSTRAINT `ck_pago_metodo` CHECK (`metodo_pago` in ('Efectivo','Transferencia','Tarjeta'))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,18,200000.00,'Anticipo','Transferencia','2026-10-25 09:42:42',2),(2,18,400000.00,'Anticipo','Efectivo','2026-10-25 09:42:42',2);
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `stock_actual` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `nombre` (`nombre`),
  CONSTRAINT `ck_producto_tipo` CHECK (`tipo` in ('Venta','Insumo')),
  CONSTRAINT `ck_producto_precio` CHECK (`precio_venta` is null or `precio_venta` >= 0),
  CONSTRAINT `ck_producto_stock` CHECK (`stock_actual` >= 0),
  CONSTRAINT `ck_producto_minimo` CHECK (`stock_minimo` >= 0),
  CONSTRAINT `ck_producto_precio_tipo` CHECK (`tipo` = 'Venta' and `precio_venta` is not null or `tipo` = 'Insumo' and `precio_venta` is null)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Agua 600 ml','Venta',3000.00,'unidad',97,10,1),(2,'Gaseosa','Venta',4000.00,'unidad',0,10,1),(3,'Leña para fogata','Venta',15000.00,'bulto',0,3,1),(4,'Papel higiénico','Insumo',NULL,'paquete',0,10,1),(5,'Jabón de manos','Insumo',NULL,'botella',0,5,1),(6,'Detergente','Insumo',NULL,'litro',0,4,1);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_inventario`
--

DROP TABLE IF EXISTS `registro_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_inventario` (
  `id_registro_inventario` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `tipo_movimiento` varchar(10) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `costo_unitario` decimal(10,2) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `id_reserva` int(11) DEFAULT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `observacion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_registro_inventario`),
  KEY `fk_ri_producto` (`id_producto`),
  KEY `fk_ri_reserva` (`id_reserva`),
  KEY `fk_ri_usuario` (`id_usuario`),
  CONSTRAINT `fk_ri_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ri_reserva` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ri_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `ck_ri_tipo` CHECK (`tipo_movimiento` in ('Entrada','Venta','Consumo','Ajuste')),
  CONSTRAINT `ck_ri_cantidad` CHECK (`cantidad` > 0),
  CONSTRAINT `ck_ri_costo` CHECK (`costo_unitario` is null or `costo_unitario` >= 0),
  CONSTRAINT `ck_ri_precio` CHECK (`precio_unitario` is null or `precio_unitario` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_inventario`
--

LOCK TABLES `registro_inventario` WRITE;
/*!40000 ALTER TABLE `registro_inventario` DISABLE KEYS */;
INSERT INTO `registro_inventario` VALUES (1,1,'Entrada',50,1000.00,NULL,NULL,'2026-10-25 09:56:37',2,NULL),(2,1,'Entrada',50,1000.00,NULL,NULL,'2026-10-25 09:56:44',2,NULL),(3,1,'Venta',3,NULL,3000.00,18,'2026-10-25 09:58:14',2,NULL);
/*!40000 ALTER TABLE `registro_inventario` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_actualizar_stock_insert
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_actualizar_stock_insert_after
AFTER INSERT ON Registro_Inventario
FOR EACH ROW
BEGIN
    IF NEW.tipo_movimiento = 'Entrada' THEN
        UPDATE Producto SET stock_actual = stock_actual + NEW.cantidad WHERE id_producto = NEW.id_producto;
    ELSEIF NEW.tipo_movimiento IN ('Venta', 'Consumo', 'Ajuste') THEN
        UPDATE Producto SET stock_actual = stock_actual - NEW.cantidad WHERE id_producto = NEW.id_producto;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_reserva` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `id_cabana` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_estado_reserva` int(11) NOT NULL,
  `fecha_entrada` date NOT NULL,
  `fecha_salida` date NOT NULL,
  `num_personas` tinyint(4) NOT NULL,
  `precio_noche` decimal(10,2) NOT NULL,
  `fecha_checkin` datetime DEFAULT NULL,
  `fecha_checkout` datetime DEFAULT NULL,
  `observaciones` varchar(300) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_reserva`),
  KEY `fk_reserva_cliente` (`id_cliente`),
  KEY `fk_reserva_usuario` (`id_usuario`),
  KEY `fk_reserva_estado` (`id_estado_reserva`),
  KEY `idx_reserva_cabana_fechas` (`id_cabana`,`fecha_entrada`,`fecha_salida`),
  CONSTRAINT `fk_reserva_cabana` FOREIGN KEY (`id_cabana`) REFERENCES `cabana` (`id_cabana`) ON UPDATE CASCADE,
  CONSTRAINT `fk_reserva_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_reserva_estado` FOREIGN KEY (`id_estado_reserva`) REFERENCES `estado_reserva` (`id_estado_reserva`) ON UPDATE CASCADE,
  CONSTRAINT `fk_reserva_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `ck_reserva_fechas` CHECK (`fecha_salida` > `fecha_entrada`),
  CONSTRAINT `ck_reserva_personas` CHECK (`num_personas` > 0),
  CONSTRAINT `ck_reserva_precio` CHECK (`precio_noche` >= 0),
  CONSTRAINT `ck_reserva_checkout` CHECK (`fecha_checkout` is null or `fecha_checkin` is null or `fecha_checkout` >= `fecha_checkin`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (14,3,1,1,1,'2026-11-15','2026-11-20',2,180000.00,NULL,NULL,NULL,'2026-10-20 11:42:01'),(15,3,2,1,1,'2026-11-01','2026-11-05',4,260000.00,NULL,NULL,NULL,'2026-10-20 12:06:42'),(16,3,2,1,3,'2027-01-10','2027-01-15',4,260000.00,NULL,NULL,NULL,'2026-10-20 12:08:08'),(17,2,1,2,4,'2026-12-01','2026-12-04',2,180000.00,NULL,NULL,'Prueba','2026-10-25 09:16:30'),(18,3,1,2,1,'2026-12-01','2026-12-04',2,180000.00,NULL,NULL,NULL,'2026-10-25 09:23:15');
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_evitar_reservas_cruzadas_insert
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_validar_capacidad_cabana
BEFORE INSERT ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_capacidad INT;
    SELECT capacidad INTO v_capacidad FROM Cabana WHERE id_cabana = NEW.id_cabana;

    IF NEW.num_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-03: El número de personas excede la capacidad máxima de la cabaña.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_evitar_reservas_cruzadas_update
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_validar_capacidad_cabana_update
BEFORE UPDATE ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_capacidad INT;
    SELECT capacidad INTO v_capacidad FROM Cabana WHERE id_cabana = NEW.id_cabana;

    IF NEW.num_personas > v_capacidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RN-03: El número de personas excede la capacidad máxima de la cabaña.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador','Gestiona usuarios, cabañas e inventario, y consulta todo el sistema'),(2,'Recepcionista','Gestiona clientes, reservas, pagos y cargos'),(3,'Servicios generales','Marca las tareas realizadas, registra insumos y reporta daños');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio`
--

DROP TABLE IF EXISTS `servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio` (
  `id_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_servicio`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio`
--

LOCK TABLES `servicio` WRITE;
/*!40000 ALTER TABLE `servicio` DISABLE KEYS */;
INSERT INTO `servicio` VALUES (1,'WiFi','Internet inalámbrico'),(2,'Aire acondicionado','Climatización en habitaciones'),(3,'Piscina','Acceso a la piscina del alojamiento'),(4,'Cocina equipada','Utensilios y electrodomésticos básicos'),(5,'Parqueadero','Espacio de estacionamiento');
/*!40000 ALTER TABLE `servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio_adicional`
--

DROP TABLE IF EXISTS `servicio_adicional`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio_adicional` (
  `id_servicio_adicional` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_servicio_adicional`),
  UNIQUE KEY `nombre` (`nombre`),
  CONSTRAINT `ck_sa_precio` CHECK (`precio` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio_adicional`
--

LOCK TABLES `servicio_adicional` WRITE;
/*!40000 ALTER TABLE `servicio_adicional` DISABLE KEYS */;
INSERT INTO `servicio_adicional` VALUES (1,'Desayuno','Desayuno típico por persona',18000.00,1),(2,'Transporte al aeropuerto','Traslado de ida o vuelta',60000.00,1),(3,'Paseo en lancha','Recorrido de una hora',90000.00,1),(4,'Cena típica','Cena por persona',35000.00,1);
/*!40000 ALTER TABLE `servicio_adicional` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `apellido` varchar(60) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Ana','Ruiz','ana@lodgy.com','hash_de_prueba',1,1,'2026-10-20 11:04:28'),(2,'María','Gómez','maria@lodgy.com','hash_de_prueba',2,1,'2026-10-20 11:04:28'),(3,'Servicios','Generales','servicios@lodgy.com','hash_de_prueba',3,1,'2026-10-20 11:04:28');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_saldo_reserva`
--

DROP TABLE IF EXISTS `v_saldo_reserva`;
/*!50001 DROP VIEW IF EXISTS `v_saldo_reserva`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_saldo_reserva` AS SELECT 
 1 AS `id_reserva`,
 1 AS `id_cliente`,
 1 AS `id_cabana`,
 1 AS `estado`,
 1 AS `noches`,
 1 AS `total_alojamiento`,
 1 AS `total_servicios`,
 1 AS `total_productos`,
 1 AS `pagado`,
 1 AS `total`,
 1 AS `saldo`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'lodgy'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_cabana_lista` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cabana_lista`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_cancelar_reserva` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cancelar_reserva`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_crear_reserva` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_reserva`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_checkin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_checkin`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_checkout` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_checkout`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_pago` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_pago`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `v_saldo_reserva`
--

/*!50001 DROP VIEW IF EXISTS `v_saldo_reserva`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_saldo_reserva` AS select `x`.`id_reserva` AS `id_reserva`,`x`.`id_cliente` AS `id_cliente`,`x`.`id_cabana` AS `id_cabana`,`x`.`estado` AS `estado`,`x`.`noches` AS `noches`,`x`.`total_alojamiento` AS `total_alojamiento`,`x`.`total_servicios` AS `total_servicios`,`x`.`total_productos` AS `total_productos`,`x`.`pagado` AS `pagado`,`x`.`total_alojamiento` + `x`.`total_servicios` + `x`.`total_productos` AS `total`,`x`.`total_alojamiento` + `x`.`total_servicios` + `x`.`total_productos` - `x`.`pagado` AS `saldo` from (select `r`.`id_reserva` AS `id_reserva`,`r`.`id_cliente` AS `id_cliente`,`r`.`id_cabana` AS `id_cabana`,`er`.`nombre` AS `estado`,to_days(`r`.`fecha_salida`) - to_days(`r`.`fecha_entrada`) AS `noches`,(to_days(`r`.`fecha_salida`) - to_days(`r`.`fecha_entrada`)) * `r`.`precio_noche` AS `total_alojamiento`,coalesce((select sum(`cs`.`cantidad` * `cs`.`precio_cobrado`) from `cargo_servicio` `cs` where `cs`.`id_reserva` = `r`.`id_reserva`),0) AS `total_servicios`,coalesce((select sum(`ri`.`cantidad` * `ri`.`precio_unitario`) from `registro_inventario` `ri` where `ri`.`id_reserva` = `r`.`id_reserva` and `ri`.`tipo_movimiento` = 'Venta'),0) AS `total_productos`,coalesce((select sum(`p`.`monto`) from `pago` `p` where `p`.`id_reserva` = `r`.`id_reserva`),0) AS `pagado` from (`reserva` `r` join `estado_reserva` `er` on(`er`.`id_estado_reserva` = `r`.`id_estado_reserva`))) `x` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-25 10:38:25
