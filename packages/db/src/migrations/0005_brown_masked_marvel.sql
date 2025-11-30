PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`slug` text NOT NULL,
	`origin` text NOT NULL,
	`origin_url` text,
	`r2_key` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "origin_url" CHECK(
				("__new_recipe"."origin" != 'url')
				OR (
					"__new_recipe"."origin_url" IS NOT NULL
					AND "__new_recipe"."r2_key" IS NULL
				)
			),
	CONSTRAINT "origin_pdf" CHECK(
				("__new_recipe"."origin" != 'pdf')
				OR (
					"__new_recipe"."r2_key" IS NOT NULL
					AND "__new_recipe"."origin_url" IS NULL
				)
			)
);
--> statement-breakpoint
INSERT INTO `__new_recipe`("id", "user_id", "name", "description", "slug", "origin", "origin_url", "r2_key", "created_at", "updated_at") SELECT "id", "user_id", "name", "description", "slug", "origin", "origin_url", "r2_key", "created_at", "updated_at" FROM `recipe`;--> statement-breakpoint
DROP TABLE `recipe`;--> statement-breakpoint
ALTER TABLE `__new_recipe` RENAME TO `recipe`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_slug_unique` ON `recipe` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_url_unique` ON `recipe` (`origin_url`);--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_r2_key_unique` ON `recipe` (`r2_key`);