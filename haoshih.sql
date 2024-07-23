-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-07-15 22:53:12
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `haoshih`
--

-- --------------------------------------------------------

--
-- 資料表結構 `carts`
--

CREATE TABLE `carts` (
  `uid` int(11) UNSIGNED NOT NULL COMMENT '用戶編號',
  `pid` int(11) UNSIGNED NOT NULL COMMENT '商品編號',
  `amout` tinyint(3) UNSIGNED NOT NULL COMMENT '商品數量'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `map`
--

CREATE TABLE `map` (
  `mid` int(11) UNSIGNED NOT NULL COMMENT '攤位編號',
  `postion` char(1) NOT NULL COMMENT '攤位區域',
  `number` tinyint(3) UNSIGNED NOT NULL COMMENT '攤位編碼',
  `vinfo` int(11) UNSIGNED DEFAULT NULL COMMENT '攤販資訊編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `member`
--

CREATE TABLE `member` (
  `uid` int(11) UNSIGNED NOT NULL COMMENT '用戶編號',
  `account` varchar(12) NOT NULL COMMENT '帳號',
  `password` varchar(255) NOT NULL COMMENT '密碼',
  `first_name` varchar(20) NOT NULL COMMENT '姓氏',
  `last_name` varchar(20) NOT NULL COMMENT '名字',
  `nickname` varchar(6) NOT NULL COMMENT '暱稱',
  `phone` char(10) NOT NULL COMMENT '手機',
  `address` varchar(100) NOT NULL COMMENT '地址',
  `email` varchar(64) NOT NULL COMMENT '信箱',
  `tw_id` char(10) NOT NULL COMMENT '身分證字號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `orderlist`
--

CREATE TABLE `orderlist` (
  `oid` char(10) NOT NULL COMMENT '訂單編號',
  `uid` int(11) UNSIGNED DEFAULT NULL COMMENT '用戶編號',
  `vid` int(11) UNSIGNED DEFAULT NULL COMMENT '攤主編號',
  `detail` varchar(1000) NOT NULL COMMENT '明細',
  `send_data` varchar(1000) NOT NULL COMMENT '寄送資料',
  `status` tinyint(4) NOT NULL COMMENT '訂單狀態',
  `order_time` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '下訂日期'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `product`
--

CREATE TABLE `product` (
  `pid` int(11) UNSIGNED NOT NULL COMMENT '商品編號',
  `name` varchar(20) NOT NULL COMMENT '商品名稱',
  `content` varchar(255) NOT NULL COMMENT '介紹',
  `quantity` tinyint(3) UNSIGNED NOT NULL COMMENT '庫存數量',
  `price` smallint(5) UNSIGNED NOT NULL COMMENT '價錢',
  `img01` blob NOT NULL COMMENT '商品照片01',
  `img02` blob DEFAULT NULL COMMENT '商品照片02',
  `img03` blob DEFAULT NULL COMMENT '商品照片03',
  `img04` blob DEFAULT NULL COMMENT '商品照片04',
  `img05` blob DEFAULT NULL COMMENT '商品照片05',
  `vid` int(11) UNSIGNED NOT NULL COMMENT '攤主編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `vendor`
--

CREATE TABLE `vendor` (
  `vid` int(11) UNSIGNED NOT NULL COMMENT '攤主編號',
  `account` varchar(12) NOT NULL COMMENT '帳號',
  `password` varchar(255) NOT NULL COMMENT '密碼',
  `first_name` varchar(20) NOT NULL COMMENT '姓氏',
  `last_name` varchar(20) NOT NULL COMMENT '名字',
  `phone` char(10) NOT NULL COMMENT '手機',
  `address` varchar(100) NOT NULL COMMENT '地址',
  `email` varchar(64) NOT NULL COMMENT '信箱',
  `tw_id` char(10) NOT NULL COMMENT '身分證字號',
  `vinfo` int(11) UNSIGNED NOT NULL COMMENT '攤販資訊編號'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `vendor_info`
--

CREATE TABLE `vendor_info` (
  `vinfo` int(11) UNSIGNED NOT NULL COMMENT '攤販資訊編號',
  `brand_name` varchar(30) NOT NULL COMMENT '品牌名稱',
  `brand_type` varchar(15) NOT NULL COMMENT '品牌類型',
  `logo_img` blob NOT NULL COMMENT 'Logo照',
  `brand_img01` blob NOT NULL COMMENT '品牌視覺照01',
  `brand_img02` blob DEFAULT NULL COMMENT '品牌視覺照02',
  `brand_img03` blob DEFAULT NULL COMMENT '品牌視覺照03',
  `brand_img04` blob DEFAULT NULL COMMENT '品牌視覺照04',
  `brand_img05` blob DEFAULT NULL COMMENT '品牌視覺照05',
  `content` varchar(350) NOT NULL COMMENT '品牌描述',
  `fb` varchar(255) DEFAULT NULL COMMENT '臉書',
  `ig` varchar(255) DEFAULT NULL COMMENT 'instagram',
  `web` varchar(255) DEFAULT NULL COMMENT '品牌網站'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`uid`,`pid`),
  ADD KEY `carts_fk_pid` (`pid`);

--
-- 資料表索引 `map`
--
ALTER TABLE `map`
  ADD PRIMARY KEY (`mid`),
  ADD KEY `vinfo` (`vinfo`);

--
-- 資料表索引 `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `account` (`account`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 資料表索引 `orderlist`
--
ALTER TABLE `orderlist`
  ADD PRIMARY KEY (`oid`),
  ADD KEY `uid` (`uid`),
  ADD KEY `vid` (`vid`);

--
-- 資料表索引 `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`pid`),
  ADD KEY `vid` (`vid`);

--
-- 資料表索引 `vendor`
--
ALTER TABLE `vendor`
  ADD PRIMARY KEY (`vid`),
  ADD UNIQUE KEY `account` (`account`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `vinfo` (`vinfo`);

--
-- 資料表索引 `vendor_info`
--
ALTER TABLE `vendor_info`
  ADD PRIMARY KEY (`vinfo`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `map`
--
ALTER TABLE `map`
  MODIFY `mid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '攤位編號';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `member`
--
ALTER TABLE `member`
  MODIFY `uid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用戶編號';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `product`
--
ALTER TABLE `product`
  MODIFY `pid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品編號';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `vendor`
--
ALTER TABLE `vendor`
  MODIFY `vid` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '攤主編號';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `vendor_info`
--
ALTER TABLE `vendor_info`
  MODIFY `vinfo` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '攤販資訊編號';

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_fk_pid` FOREIGN KEY (`pid`) REFERENCES `product` (`pid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carts_fk_uid` FOREIGN KEY (`uid`) REFERENCES `member` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `map`
--
ALTER TABLE `map`
  ADD CONSTRAINT `map_ibfk_1` FOREIGN KEY (`vinfo`) REFERENCES `vendor_info` (`vinfo`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- 資料表的限制式 `orderlist`
--
ALTER TABLE `orderlist`
  ADD CONSTRAINT `orderlist_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `member` (`uid`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orderlist_ibfk_2` FOREIGN KEY (`vid`) REFERENCES `vendor` (`vid`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- 資料表的限制式 `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`vid`) REFERENCES `vendor` (`vid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `vendor`
--
ALTER TABLE `vendor`
  ADD CONSTRAINT `vendor_ibfk_1` FOREIGN KEY (`vinfo`) REFERENCES `vendor_info` (`vinfo`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
