CREATE DATABASE  IF NOT EXISTS `kiosk_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `kiosk_db`;
-- MySQL dump 10.13  Distrib 8.0.44, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: aiKiosk
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `PaymentProducts`
--

DROP TABLE IF EXISTS `PaymentProducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PaymentProducts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `receipt_id` int unsigned NOT NULL,
  `store_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) DEFAULT '0.00',
  `image_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `orderNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prod_receipt` (`receipt_id`),
  CONSTRAINT `fk_prod_receipt` FOREIGN KEY (`receipt_id`) REFERENCES `PaymentReceipt` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PaymentProducts`
--

LOCK TABLES `PaymentProducts` WRITE;
/*!40000 ALTER TABLE `PaymentProducts` DISABLE KEYS */;
/*!40000 ALTER TABLE `PaymentProducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PaymentReceipt`
--

DROP TABLE IF EXISTS `PaymentReceipt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PaymentReceipt` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `bizNumber` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orderNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storeId` int unsigned DEFAULT NULL,
  `payment_time` datetime DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `card_payment` decimal(12,2) DEFAULT '0.00',
  `other_payment` decimal(12,2) DEFAULT '0.00',
  `is_cancelled` tinyint(1) DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'processing',
  `products_snapshot` json DEFAULT NULL,
  `retry_count` int DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_receipt_store` (`storeId`),
  KEY `idx_receipt_order` (`orderNo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PaymentReceipt`
--

LOCK TABLES `PaymentReceipt` WRITE;
/*!40000 ALTER TABLE `PaymentReceipt` DISABLE KEYS */;
INSERT INTO `PaymentReceipt` VALUES (1,'BIZ1766438975940','11011766438974031','101',1,'2025-12-23 06:29:34',15000.00,15000.00,0.00,0,'failed','[{\"id\": 1, \"name\": \"오리지날\", \"price\": \"15000.00\", \"quantity\": 1, \"selectedOptions\": []}]',1,'2025-12-22 21:29:35','2025-12-22 21:30:26'),(2,'BIZ1766439492165','11011766439490281','101',1,'2025-12-23 06:38:10',15000.00,15000.00,0.00,0,'failed','[{\"id\": 1, \"name\": \"오리지날\", \"price\": \"15000.00\", \"quantity\": 1, \"selectedOptions\": []}]',1,'2025-12-22 21:38:12','2025-12-22 21:39:03'),(3,'BIZ1766439512011','11011766439510134','101',1,'2025-12-23 06:38:30',45000.00,45000.00,0.00,0,'failed','[{\"id\": 1, \"name\": \"오리지날\", \"price\": \"15000.00\", \"quantity\": 3, \"selectedOptions\": []}]',1,'2025-12-22 21:38:32','2025-12-22 21:39:22'),(4,'BIZ1766439548128','11011766439546246','101',1,'2025-12-23 06:39:06',15000.00,15000.00,0.00,0,'failed','[{\"id\": 1, \"name\": \"오리지날\", \"price\": \"15000.00\", \"quantity\": 1, \"selectedOptions\": []}]',1,'2025-12-22 21:39:08','2025-12-22 21:39:58'),(5,'BIZ1766440042881','11011766440040972','101',1,'2025-12-23 06:47:20',1004.00,1004.00,0.00,0,'failed','[{\"id\": 1, \"name\": \"오리지날\", \"price\": \"1004.00\", \"quantity\": 1, \"selectedOptions\": []}]',1,'2025-12-22 21:47:22','2025-12-22 21:48:13'),(6,'BIZ1766440277000','11011766440274998','101',1,'2025-12-23 06:51:14',1004.00,1004.00,0.00,0,'failed','[{\"id\": 1, \"name\": \"오리지날\", \"price\": \"1004.00\", \"quantity\": 1, \"selectedOptions\": []}]',1,'2025-12-22 21:51:16','2025-12-22 21:52:07'),(7,'BIZ1766440968162','11011766440966260','101',1,'2025-12-23 07:02:46',1004.00,1004.00,0.00,0,'failed','[{\"id\": 1, \"name\": \"오리지날\", \"price\": \"1004.00\", \"quantity\": 1, \"selectedOptions\": []}]',1,'2025-12-22 22:02:48','2025-12-22 22:03:38');
/*!40000 ALTER TABLE `PaymentReceipt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL COMMENT 'ë§¤ìž¥ ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ì¹´í…Œê³ ë¦¬ëª…',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'ì¹´í…Œê³ ë¦¬ ì„¤ëª…',
  `display_order` int DEFAULT '0' COMMENT 'í‘œì‹œ ìˆœì„œ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_store_id` (`store_id`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ìƒí’ˆ ì¹´í…Œê³ ë¦¬';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,'기본','기본 카테고리',1,'2025-12-21 23:49:59','2025-12-21 23:49:59'),(2,1,'인기','인기있는 상품',2,'2025-12-22 00:03:53','2025-12-22 00:03:53');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `license`
--

DROP TABLE IF EXISTS `license`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `license` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `license_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `store_id` int unsigned DEFAULT NULL,
  `issued_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `meta` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expiry_dt` datetime DEFAULT NULL,
  `enable` tinyint(1) NOT NULL DEFAULT '1',
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_key` (`license_key`),
  KEY `idx_license_store` (`store_id`),
  CONSTRAINT `fk_license_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `license`
--

LOCK TABLES `license` WRITE;
/*!40000 ALTER TABLE `license` DISABLE KEYS */;
INSERT INTO `license` VALUES (2,'557-202-118-162',1,'2025-12-21 23:59:24',NULL,1,NULL,'2025-12-21 23:59:24','2025-12-21 23:59:24','2026-12-21 00:00:00',1,NULL,'101');
/*!40000 ALTER TABLE `license` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT 'ì£¼ë¬¸ ID',
  `product_id` int NOT NULL COMMENT 'ìƒí’ˆ ID',
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ìƒí’ˆëª… (ìŠ¤ëƒ…ìƒ·)',
  `quantity` int NOT NULL DEFAULT '1' COMMENT 'ìˆ˜ëŸ‰',
  `unit_price` decimal(10,2) NOT NULL COMMENT 'ë‹¨ê°€',
  `total_price` decimal(10,2) NOT NULL COMMENT 'ì´ ê°€ê²©',
  `options_json` json DEFAULT NULL COMMENT 'ì„ íƒëœ ì˜µì…˜ (JSON)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ì£¼ë¬¸ ìƒì„¸ í•­ëª©';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ì£¼ë¬¸ ë²ˆí˜¸',
  `store_id` int NOT NULL COMMENT 'ë§¤ìž¥ ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT 'ì´ ê¸ˆì•¡',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ê²°ì œ ë°©ë²•',
  `payment_status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'ê²°ì œ ìƒíƒœ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_store_id` (`store_id`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ì£¼ë¬¸ ì •ë³´';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_options`
--

DROP TABLE IF EXISTS `product_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL COMMENT 'ìƒí’ˆ ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ì˜µì…˜ëª…',
  `price` decimal(10,2) DEFAULT '0.00' COMMENT 'ì¶”ê°€ ê°€ê²©',
  `is_available` tinyint(1) DEFAULT '1' COMMENT 'íŒë§¤ ê°€ëŠ¥ ì—¬ë¶€',
  `display_order` int DEFAULT '0' COMMENT 'í‘œì‹œ ìˆœì„œ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_display_order` (`display_order`),
  CONSTRAINT `product_options_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ìƒí’ˆ ì˜µì…˜';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_options`
--

LOCK TABLES `product_options` WRITE;
/*!40000 ALTER TABLE `product_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL COMMENT 'ì¹´í…Œê³ ë¦¬ ID',
  `store_id` int NOT NULL COMMENT 'ë§¤ìž¥ ID',
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ìƒí’ˆëª…',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'ìƒí’ˆ ì„¤ëª…',
  `price` decimal(10,2) NOT NULL COMMENT 'ê°€ê²©',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ì´ë¯¸ì§€ URL',
  `is_available` tinyint(1) DEFAULT '1' COMMENT 'íŒë§¤ ê°€ëŠ¥ ì—¬ë¶€',
  `display_order` int DEFAULT '0' COMMENT 'í‘œì‹œ ìˆœì„œ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_store_id` (`store_id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_available` (`is_available`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ìƒí’ˆ ì •ë³´';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,1,'오리지날','',1004.00,'/image/products/1/1_1766361941050.jpg',1,1,'2025-12-22 00:05:44','2025-12-22 21:30:29'),(2,2,1,'양념','',16000.00,'/image/products/1/1_1766362156088.png',1,1,'2025-12-22 00:09:18','2025-12-22 00:09:18');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_groups`
--

DROP TABLE IF EXISTS `store_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_groups` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_groups`
--

LOCK TABLES `store_groups` WRITE;
/*!40000 ALTER TABLE `store_groups` DISABLE KEYS */;
INSERT INTO `store_groups` VALUES (1,'치킨','2025-12-21 23:39:15','2025-12-21 23:39:15');
/*!40000 ALTER TABLE `store_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `open_dt` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `close_dt` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `store_group_id` int unsigned DEFAULT NULL,
  `enable` tinyint(1) NOT NULL DEFAULT '1',
  `bizNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PG_MERCHANT_ID` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PG_PRIVATE_KEY` text COLLATE utf8mb4_unicode_ci,
  `PG_PAYMENT_KEY` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vanType` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_store_group` (`store_group_id`),
  CONSTRAINT `fk_stores_store_group` FOREIGN KEY (`store_group_id`) REFERENCES `store_groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'교촌',NULL,'1123','09:00','23:39',1,1,'1168119948','0788888','','','KICC','2025-12-21 23:49:59','2025-12-21 23:49:59');
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_Id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ì‚¬ìš©ìž ë¡œê·¸ì¸ ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ì‚¬ìš©ìž ì´ë¦„',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ì „í™”ë²ˆí˜¸',
  `role` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT 'A' COMMENT 'ì‚¬ìš©ìž ì—­í• ',
  `show_group` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'í‘œì‹œ ê·¸ë£¹',
  `show_store` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'í‘œì‹œ ë§¤ìž¥',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_Id` (`user_Id`),
  KEY `idx_user_id` (`user_Id`),
  KEY `idx_role` (`role`),
  KEY `idx_show_group` (`show_group`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ì‚¬ìš©ìž ì •ë³´';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'razor1981','유동춘','010000','U',NULL,NULL,'2025-12-22 07:35:53','2025-12-21 22:36:32','$2a$10$T2gq1EMh0TLaKaYdgV97uuprPyyx8KctOO9ixMwwi8iBZj3QRBXp2');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'aiKiosk'
--

--
-- Dumping routines for database 'aiKiosk'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-07 16:57:27
