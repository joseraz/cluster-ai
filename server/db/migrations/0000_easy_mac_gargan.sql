CREATE TABLE `cluster_members` (
	`cluster_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`added_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`cluster_id`, `contact_id`),
	FOREIGN KEY (`cluster_id`) REFERENCES `clusters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clusters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text,
	`phone` text,
	`lives_in` text,
	`company` text,
	`social_links` text DEFAULT '[]',
	`connection_type` text,
	`connection_strength` integer,
	`how_we_met` text,
	`interests` text,
	`career_and_work` text,
	`education` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `node_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`angle` real NOT NULL,
	`ring` integer,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `node_positions_contact_id_unique` ON `node_positions` (`contact_id`);--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`source_type` text DEFAULT 'contact' NOT NULL,
	`target_id` text NOT NULL,
	`target_type` text DEFAULT 'contact' NOT NULL,
	`relationship_type` text,
	`connection_strength` integer,
	`how_we_met` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `relationships_source_id_target_id_relationship_type_unique` ON `relationships` (`source_id`,`target_id`,`relationship_type`);