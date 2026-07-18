CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`role` text DEFAULT 'standard_user' NOT NULL,
	`username` text,
	`display_name` text,
	`bio` text,
	`location` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_username_unique` ON `user_profiles` (`username`);
--> statement-breakpoint
CREATE TABLE `impersonation_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text NOT NULL,
	`target_user_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` text DEFAULT (datetime('now')) NOT NULL,
	`ended_at` text,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `impersonation_sessions_actor_idx` ON `impersonation_sessions` (`actor_user_id`);
--> statement-breakpoint
CREATE INDEX `impersonation_sessions_target_idx` ON `impersonation_sessions` (`target_user_id`);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text NOT NULL,
	`target_user_id` text,
	`action` text NOT NULL,
	`metadata` text DEFAULT '{}',
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_events_actor_idx` ON `audit_events` (`actor_user_id`);
--> statement-breakpoint
CREATE INDEX `audit_events_target_idx` ON `audit_events` (`target_user_id`);
--> statement-breakpoint
CREATE INDEX `audit_events_action_idx` ON `audit_events` (`action`);
