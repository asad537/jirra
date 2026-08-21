-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 21, 2026 at 11:57 AM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.4.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jirra`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_name` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_value` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `ticket_id`, `user_id`, `action`, `field_name`, `old_value`, `new_value`, `comment`, `created_at`) VALUES
(1, 1, 1, 'created', NULL, NULL, NULL, 'Ticket created', '2026-08-21 14:44:07'),
(2, 2, 1, 'created', NULL, NULL, NULL, 'Ticket created', '2026-08-21 14:44:07'),
(3, 3, 1, 'created', NULL, NULL, NULL, 'Ticket created', '2026-08-21 14:44:07'),
(4, 4, 1, 'created', NULL, NULL, NULL, 'Ticket created', '2026-08-21 14:44:07'),
(5, 5, 1, 'created', NULL, NULL, NULL, 'Ticket created', '2026-08-21 14:44:07'),
(6, 6, 1, 'created', NULL, NULL, NULL, 'Ticket created', '2026-08-21 14:44:07'),
(7, 1, 1, 'status', 'status', 'To Do', 'In Progress', 'MySQL status test comment', '2026-08-21 14:45:08'),
(8, 7, 1, 'created', NULL, NULL, NULL, 'Ticket created', '2026-08-21 14:50:32'),
(9, 1, 1, 'assignee', 'assignee', '1', '2', 'Assignee changed', '2026-08-21 14:54:06');

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`setting_value`)),
  `updated_by` bigint(20) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`setting_key`, `setting_value`, `updated_by`, `updated_at`) VALUES
('workspace', '{\"workspaceName\":\"TaskFlow Local\",\"allowInvites\":true,\"emailNotifications\":true,\"defaultView\":\"Board\"}', 1, '2026-08-21 14:45:08');

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` bigint(20) UNSIGNED NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `ticket_id`, `user_id`, `body`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'MySQL regular comment test', '2026-08-21 14:45:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `labels`
--

CREATE TABLE `labels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` char(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#777777'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `labels`
--

INSERT INTO `labels` (`id`, `project_id`, `name`, `color`) VALUES
(1, 1, 'Mobile', '#777777'),
(2, 1, 'Orders', '#777777'),
(3, 1, 'Payments', '#777777'),
(4, 1, 'UI', '#777777'),
(5, 1, 'Import', '#777777'),
(6, 1, 'UX', '#777777');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `ticket_id`, `title`, `body`, `read_at`, `created_at`) VALUES
(1, 2, 'assignment', 1, 'PF-1 assigned to you', 'A ticket was assigned to you', NULL, '2026-08-21 14:54:06');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_key` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `color` char(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#6052d7',
  `status` enum('active','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `next_ticket_number` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `project_key`, `name`, `description`, `color`, `status`, `next_ticket_number`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'PF', 'PrintFlow', 'Order, billing and production management', '#ed9276', 'active', 7, 1, '2026-08-21 14:44:07', '2026-08-21 14:44:07'),
(2, 'HD', 'HelpDesk', 'Customer support and service requests', '#62a4cb', 'active', 1, 1, '2026-08-21 14:44:07', '2026-08-21 14:44:07'),
(3, 'WB', 'Website Build', 'Website design and development', '#55a987', 'active', 2, 1, '2026-08-21 14:44:07', '2026-08-21 14:50:32');

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

CREATE TABLE `project_members` (
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('project_manager','member','viewer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `via_team_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_members`
--

INSERT INTO `project_members` (`project_id`, `user_id`, `role`, `via_team_id`, `created_at`) VALUES
(1, 1, 'project_manager', NULL, '2026-08-21 14:44:07'),
(1, 2, 'member', NULL, '2026-08-21 14:44:07'),
(1, 3, 'member', NULL, '2026-08-21 14:44:07'),
(1, 4, 'member', NULL, '2026-08-21 14:44:07'),
(2, 1, 'project_manager', NULL, '2026-08-21 14:44:07'),
(2, 2, 'member', NULL, '2026-08-21 14:44:07'),
(2, 3, 'member', NULL, '2026-08-21 14:44:07'),
(2, 4, 'member', NULL, '2026-08-21 14:44:07'),
(3, 1, 'project_manager', NULL, '2026-08-21 14:44:07'),
(3, 2, 'member', NULL, '2026-08-21 14:44:07'),
(3, 3, 'member', NULL, '2026-08-21 14:44:07'),
(3, 4, 'member', NULL, '2026-08-21 14:44:07');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `team_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `ticket_number` int(10) UNSIGNED NOT NULL,
  `ticket_key` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Task','Bug','Feature','Improvement') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Task',
  `priority` enum('Low','Medium','High','Urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Medium',
  `status` enum('To Do','In Progress','In Review','Done') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'To Do',
  `assignee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reporter_id` bigint(20) UNSIGNED NOT NULL,
  `due_date` date DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `project_id`, `ticket_number`, `ticket_key`, `title`, `description`, `type`, `priority`, `status`, `assignee_id`, `reporter_id`, `due_date`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'PF-1', 'Invoice PDF alignment breaks on mobile', 'Invoice PDF alignment breaks on mobile. Add implementation details and acceptance criteria here.', 'Bug', 'Urgent', 'In Progress', 2, 1, NULL, NULL, '2026-08-21 14:44:07', '2026-08-21 14:54:06'),
(2, 1, 2, 'PF-2', 'Add bulk print option to orders', 'Add bulk print option to orders. Add implementation details and acceptance criteria here.', 'Feature', 'High', 'To Do', 2, 1, NULL, NULL, '2026-08-21 14:44:07', '2026-08-21 14:44:07'),
(3, 1, 3, 'PF-3', 'Payment status not syncing', 'Payment status not syncing. Add implementation details and acceptance criteria here.', 'Bug', 'Urgent', 'In Progress', 3, 1, NULL, NULL, '2026-08-21 14:44:07', '2026-08-21 14:44:07'),
(4, 1, 4, 'PF-4', 'Redesign order detail header', 'Redesign order detail header. Add implementation details and acceptance criteria here.', 'Task', 'High', 'In Progress', 4, 1, NULL, NULL, '2026-08-21 14:44:07', '2026-08-21 14:44:07'),
(5, 1, 5, 'PF-5', 'Add CSV import validation', 'Add CSV import validation. Add implementation details and acceptance criteria here.', 'Feature', 'Medium', 'In Review', 1, 1, NULL, NULL, '2026-08-21 14:44:07', '2026-08-21 14:44:07'),
(6, 1, 6, 'PF-6', 'Add keyboard shortcuts', 'Add keyboard shortcuts. Add implementation details and acceptance criteria here.', 'Improvement', 'Low', 'Done', 2, 1, NULL, NULL, '2026-08-21 14:44:07', '2026-08-21 14:44:07'),
(7, 3, 1, 'WB-1', 'ass', 'asas', 'Task', 'Medium', 'To Do', 1, 1, NULL, NULL, '2026-08-21 14:50:32', '2026-08-21 14:50:32');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_labels`
--

CREATE TABLE `ticket_labels` (
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `label_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_labels`
--

INSERT INTO `ticket_labels` (`ticket_id`, `label_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `global_role` enum('super_admin','manager','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `avatar_color` char(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#6052d7',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `global_role`, `avatar_color`, `active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Ahmed Khan', 'admin@jirra.local', '$2b$12$0rlXBog0E4mC9TZ6lcKXKOKB1q4OCGq9ZdkA3Wg1mtel257j9jdoO', 'super_admin', '#ed9276', 1, '2026-08-21 14:54:06', '2026-08-21 14:44:06', '2026-08-21 14:54:06'),
(2, 'Zara Malik', 'zara@jirra.local', '$2b$10$d6fsrjLheMdPJcvYFVdNRuTRcwdtp09EzaQ4ECiFDp/Kc989TeaN6', 'manager', '#8576df', 1, '2026-08-21 14:55:44', '2026-08-21 14:44:06', '2026-08-21 14:55:44'),
(3, 'Saad Raza', 'saad@jirra.local', '$2b$10$G/VxQSwvX98QVd5twF.RYeX9cLGhL767FgCOB5g0c.RJVOZvmOq8m', 'user', '#4fa68c', 1, NULL, '2026-08-21 14:44:06', '2026-08-21 14:44:06'),
(4, 'Hira Noor', 'hira@jirra.local', '$2b$10$N3Uy0pKQWHqe5557wmp2feJcXmOS9Dueg/GFeNvl4FE8mllgV2hhu', 'user', '#db6586', 1, NULL, '2026-08-21 14:44:07', '2026-08-21 14:44:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activity_user` (`user_id`),
  ADD KEY `idx_activity_ticket` (`ticket_id`,`created_at`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`setting_key`),
  ADD KEY `fk_settings_user` (`updated_by`);

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attach_ticket` (`ticket_id`),
  ADD KEY `fk_attach_user` (`uploaded_by`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_comment_user` (`user_id`),
  ADD KEY `idx_comments_ticket` (`ticket_id`,`created_at`);

--
-- Indexes for table `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_label` (`project_id`,`name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_ticket` (`ticket_id`),
  ADD KEY `idx_notifications_user` (`user_id`,`read_at`,`created_at`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_key` (`project_key`),
  ADD KEY `fk_projects_creator` (`created_by`),
  ADD KEY `idx_projects_status` (`status`);

--
-- Indexes for table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`project_id`,`user_id`),
  ADD KEY `fk_pm_team` (`via_team_id`),
  ADD KEY `idx_pm_user` (`user_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `fk_refresh_user` (`user_id`),
  ADD KEY `idx_refresh_expiry` (`expires_at`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `fk_teams_creator` (`created_by`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`team_id`,`user_id`),
  ADD KEY `fk_tm_user` (`user_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_key` (`ticket_key`),
  ADD UNIQUE KEY `uq_ticket_project_number` (`project_id`,`ticket_number`),
  ADD KEY `fk_t_reporter` (`reporter_id`),
  ADD KEY `idx_tickets_project_status` (`project_id`,`status`,`deleted_at`),
  ADD KEY `idx_tickets_assignee` (`assignee_id`,`deleted_at`),
  ADD KEY `idx_tickets_updated` (`updated_at`);

--
-- Indexes for table `ticket_labels`
--
ALTER TABLE `ticket_labels`
  ADD PRIMARY KEY (`ticket_id`,`label_id`),
  ADD KEY `fk_tl_label` (`label_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_active` (`active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `labels`
--
ALTER TABLE `labels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD CONSTRAINT `fk_settings_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `fk_attach_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attach_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comment_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `labels`
--
ALTER TABLE `labels`
  ADD CONSTRAINT `fk_label_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pm_team` FOREIGN KEY (`via_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `fk_teams_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_t_assignee` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_t_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `fk_t_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `ticket_labels`
--
ALTER TABLE `ticket_labels`
  ADD CONSTRAINT `fk_tl_label` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tl_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
