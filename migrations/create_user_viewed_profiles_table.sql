-- Create user_viewed_profiles table for tracking unique profile views
CREATE TABLE IF NOT EXISTS `user_viewed_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `viewer_id` BIGINT UNSIGNED NOT NULL COMMENT 'User who is viewing the profile',
  `viewed_id` BIGINT UNSIGNED NOT NULL COMMENT 'User whose profile is being viewed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_viewer_viewed` (`viewer_id`, `viewed_id`),
  KEY `idx_viewer_id` (`viewer_id`),
  KEY `idx_viewed_id` (`viewed_id`),
  CONSTRAINT `fk_viewer_user` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_viewed_user` FOREIGN KEY (`viewed_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks which users have viewed which profiles for unique view counting';
