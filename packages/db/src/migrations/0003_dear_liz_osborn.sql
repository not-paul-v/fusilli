PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_step` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`order` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_step`("id", "recipe_id", "order", "content", "created_at", "updated_at") SELECT "id", "recipe_id", "order", "content", "created_at", "updated_at" FROM `step`;--> statement-breakpoint
DROP TABLE `step`;--> statement-breakpoint
ALTER TABLE `__new_step` RENAME TO `step`;--> statement-breakpoint
PRAGMA foreign_keys=ON;