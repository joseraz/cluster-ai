CREATE TABLE `relationship_stories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`body` text NOT NULL,
	`summary` text,
	`summary_status` text,
	`occurred_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `relationship_stories_user_contact_idx` ON `relationship_stories` (`user_id`,`contact_id`);
--> statement-breakpoint
INSERT INTO `relationship_stories` (`id`, `user_id`, `contact_id`, `body`, `created_at`, `updated_at`)
SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
       substr(lower(hex(randomblob(2))), 2) || '-' ||
       substr('89ab', abs(random()) % 4 + 1, 1) ||
       substr(lower(hex(randomblob(2))), 2) || '-' ||
       lower(hex(randomblob(6))),
       `user_id`,
       `id`,
       `how_we_met`,
       `created_at`,
       `updated_at`
FROM `contacts`
WHERE `how_we_met` IS NOT NULL AND trim(`how_we_met`) <> '';
