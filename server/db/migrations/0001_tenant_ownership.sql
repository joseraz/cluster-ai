ALTER TABLE `contacts` ADD `user_id` text NOT NULL DEFAULT 'legacy-local-user';--> statement-breakpoint
ALTER TABLE `relationships` ADD `user_id` text NOT NULL DEFAULT 'legacy-local-user';--> statement-breakpoint
ALTER TABLE `node_positions` ADD `user_id` text NOT NULL DEFAULT 'legacy-local-user';--> statement-breakpoint
ALTER TABLE `clusters` ADD `user_id` text NOT NULL DEFAULT 'legacy-local-user';--> statement-breakpoint
ALTER TABLE `cluster_members` ADD `user_id` text NOT NULL DEFAULT 'legacy-local-user';--> statement-breakpoint
CREATE INDEX `contacts_user_id_idx` ON `contacts` (`user_id`);--> statement-breakpoint
CREATE INDEX `relationships_user_id_idx` ON `relationships` (`user_id`);--> statement-breakpoint
CREATE INDEX `node_positions_user_id_idx` ON `node_positions` (`user_id`);--> statement-breakpoint
CREATE INDEX `clusters_user_id_idx` ON `clusters` (`user_id`);--> statement-breakpoint
CREATE INDEX `cluster_members_user_id_idx` ON `cluster_members` (`user_id`);
