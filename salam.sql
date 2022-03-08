-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 08, 2022 at 02:00 PM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 8.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `salam`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `booking_id` int(15) NOT NULL,
  `sessionID` int(15) NOT NULL,
  `userID` int(11) NOT NULL,
  `booking_status` tinyint(1) NOT NULL,
  `review` longtext NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` longtext NOT NULL,
  `expire_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`log_id`, `user_id`, `token`, `expire_date`, `status`) VALUES
(3, 100031, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjEwMDAzMSwidXNlclR5cGUiOjIsInRlYWNoX3N0YXR1cyI6MCwiRm5hbWUiOiJhYmR1bGxhaCIsIkxuYW1lIjoiYmFzaGVlciJ9LCJpYXQiOjE2NDY1Njg4ODUsImV4cCI6MTY0NjU2OTQ4OX0.6_pHwG2ygy1HpPrZsAqjI2VGi0_-mz4CDuZcsEi9hV4', '2022-03-06 12:24:49', 1),
(4, 100032, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjEwMDAzMiwidXNlclR5cGUiOjIsInRlYWNoX3N0YXR1cyI6MCwiRm5hbWUiOiJhYmR1bGxhaCIsIkxuYW1lIjoiYmFzaGVlciJ9LCJpYXQiOjE2NDY1Njg4OTMsImV4cCI6MTY0NjU2OTQ5N30.kxA24-aSPIJODRZrXlRYq8lqPEosPn3JIrYj9B1iqRE', '2022-03-06 12:24:57', 1),
(5, 100033, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjEwMDAzMywidXNlclR5cGUiOjMsInRlYWNoX3N0YXR1cyI6MCwiRm5hbWUiOiJhaG1lZCIsIkxuYW1lIjoiYmFzaGVlciIsImNyZWF0ZWRBdCI6IjMvOC8yMDIyIn0sImlhdCI6MTY0NjcyOTc0OCwiZXhwIjoxNjQ3MzM0NTQ4fQ._7eOb99xp0TQxYdZ-AuLDvp6-Kx2uAwGRTxo1G6hKsc', '2022-03-15 08:55:48', 1),
(6, 100034, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJfaWQiOjEwMDAzNCwidXNlclR5cGUiOjEsInRlYWNoX3N0YXR1cyI6MCwiRm5hbWUiOiJobGEiLCJMbmFtZSI6ImJhc2hlZXIiLCJjcmVhdGVkQXQiOiIzLzcvMjAyMiJ9LCJpYXQiOjE2NDY2NTEzMzksImV4cCI6MTY0NzI1NjEzOX0.Qfmztm4UUX5k10wV8GRdK8sPPGpHqpGXwmvgNFPGls8', '2022-03-14 11:08:59', 1);

-- --------------------------------------------------------

--
-- Table structure for table `request`
--

CREATE TABLE `request` (
  `request_id` int(10) NOT NULL,
  `userID` int(11) NOT NULL,
  `description` longtext NOT NULL,
  `CV_url` varchar(255) NOT NULL,
  `yearsOfExperience` tinyint(2) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `status_txt` text NOT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `session_id` int(15) NOT NULL,
  `subscriptionID` int(3) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `session_url` longtext NOT NULL,
  `session_status` tinyint(4) NOT NULL DEFAULT 1,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `day_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`session_id`, `subscriptionID`, `teacher_id`, `session_url`, `session_status`, `start_time`, `end_time`, `day_date`, `created_at`) VALUES
(5, 10, 100033, 'اختبار', 0, '11:00:00', '12:00:00', '2022-10-03', '2022-03-08 12:32:43');

-- --------------------------------------------------------

--
-- Table structure for table `sessionconfirmation`
--

CREATE TABLE `sessionconfirmation` (
  `confirmation_id` int(15) NOT NULL,
  `sessionID` int(15) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `teacher_review` longtext NOT NULL,
  `status` tinyint(1) NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `subscription`
--

CREATE TABLE `subscription` (
  `subscription_id` int(3) NOT NULL,
  `subscription_title` varchar(25) NOT NULL,
  `subscription_description` longtext NOT NULL,
  `ar_title` varchar(255) NOT NULL,
  `ar_description` longtext NOT NULL,
  `duration` int(11) NOT NULL DEFAULT 60,
  `price` int(5) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subscription`
--

INSERT INTO `subscription` (`subscription_id`, `subscription_title`, `subscription_description`, `ar_title`, `ar_description`, `duration`, `price`, `status`, `created_at`) VALUES
(9, 'test2', 'test1 test2 test3', 'اختبار', 'اختبار1 اختبار2 اختبار3', 60, 10, 1, '2022-03-07 12:32:26'),
(10, 'test1', 'test1 test2 test3', 'اختبار', 'اختبار1 اختبار2 اختبار3', 60, 10, 0, '2022-03-07 12:32:30'),
(11, 'test23', 'test1 test2 test3', 'اختبار', 'اختبار1 اختبار2 اختبار3', 60, 10, 0, '2022-03-07 12:32:34');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `Fname` varchar(20) NOT NULL,
  `Lname` varchar(20) NOT NULL,
  `gender` tinyint(1) NOT NULL DEFAULT 1,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `country` varchar(5) NOT NULL,
  `birth_date` date NOT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(11) DEFAULT NULL,
  `account_status` tinyint(4) NOT NULL DEFAULT 1,
  `teach_status` tinyint(1) NOT NULL DEFAULT 0,
  `language` varchar(25) NOT NULL,
  `userType` int(4) NOT NULL DEFAULT 2
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `Fname`, `Lname`, `gender`, `email`, `password`, `country`, `birth_date`, `created_at`, `phone`, `account_status`, `teach_status`, `language`, `userType`) VALUES
(100031, 'abdullah', 'basheer', 1, 'abodo@gmail.com', '$2a$08$Ruc8gcokt6Z5njhpfBO2NecCQ.1y8sMQW4TC2A5WnNKjwJX4nLEHK', 'sa', '1998-12-28', '2022-03-06', NULL, 1, 0, 'ar', 2),
(100032, 'abdullah', 'basheer', 1, 'abdo@gmail.com', '$2a$08$p.3C4tSqIWfNLXMGf3Vqn.piJsyRTuadN89ZZUEna/.Lzk.cjTx4G', 'sa', '1998-12-28', '2022-03-06', NULL, 1, 0, 'ar', 2),
(100033, 'ahmed', 'basheer', 1, 'ahmed@gmail.com', '$2a$08$IfsW9uaeaphEtPr8PpRk5uZsK6ztVyg7cmdrxiyPTOSofGoZTuIMy', 'sa', '1998-12-28', '2022-03-06', NULL, 1, 0, 'ar', 3),
(100034, 'hla', 'basheer', 1, 'hla@gmail.com', '$2a$08$lZv8GVYYBXZAVx5s7x7AK.ubP37eF5Ye9RO0pWWfHh8/bq19cZ/CW', 'sa', '1998-12-28', '2022-03-06', NULL, 1, 0, 'ar', 1);

-- --------------------------------------------------------

--
-- Table structure for table `usertype`
--

CREATE TABLE `usertype` (
  `userType_id` int(3) NOT NULL,
  `userTitle` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `usertype`
--

INSERT INTO `usertype` (`userType_id`, `userTitle`) VALUES
(1, 'admin'),
(2, 'student'),
(3, 'teacher');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `sessionID_booking_fk` (`sessionID`),
  ADD KEY `userID_booking_fk` (`userID`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`log_id`),
  ADD UNIQUE KEY `userID_logs_UNIQUE` (`user_id`);

--
-- Indexes for table `request`
--
ALTER TABLE `request`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`userID`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `subscription_id` (`subscriptionID`),
  ADD KEY `teacher_id_fk` (`teacher_id`);

--
-- Indexes for table `sessionconfirmation`
--
ALTER TABLE `sessionconfirmation`
  ADD PRIMARY KEY (`confirmation_id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `session_id` (`sessionID`);

--
-- Indexes for table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`subscription_id`),
  ADD UNIQUE KEY `subscription_title` (`subscription_title`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `userType_fk` (`userType`);

--
-- Indexes for table `usertype`
--
ALTER TABLE `usertype`
  ADD PRIMARY KEY (`userType_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `booking_id` int(15) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `request`
--
ALTER TABLE `request`
  MODIFY `request_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `session`
--
ALTER TABLE `session`
  MODIFY `session_id` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sessionconfirmation`
--
ALTER TABLE `sessionconfirmation`
  MODIFY `confirmation_id` int(15) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription`
--
ALTER TABLE `subscription`
  MODIFY `subscription_id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100036;

--
-- AUTO_INCREMENT for table `usertype`
--
ALTER TABLE `usertype`
  MODIFY `userType_id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `sessionID_booking_fk` FOREIGN KEY (`sessionID`) REFERENCES `session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userID_booking_fk` FOREIGN KEY (`userID`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `user_id_LOGS_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `request`
--
ALTER TABLE `request`
  ADD CONSTRAINT `user_id` FOREIGN KEY (`userID`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `subscription_id` FOREIGN KEY (`subscriptionID`) REFERENCES `subscription` (`subscription_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teacher_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessionconfirmation`
--
ALTER TABLE `sessionconfirmation`
  ADD CONSTRAINT `admin_id` FOREIGN KEY (`admin_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `session_id` FOREIGN KEY (`sessionID`) REFERENCES `session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `userType_fk` FOREIGN KEY (`userType`) REFERENCES `usertype` (`userType_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
