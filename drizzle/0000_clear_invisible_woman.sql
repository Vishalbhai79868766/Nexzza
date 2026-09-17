CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`player_name` text NOT NULL,
	`email` text NOT NULL,
	`game` text NOT NULL,
	`platform` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_applications_email_unique` ON `applications` (`email`);