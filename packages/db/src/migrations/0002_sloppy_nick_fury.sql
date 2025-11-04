PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ingredient` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`unit` text,
	`amount` real,
	`min_amount` real,
	`max_amount` real,
	`descriptive_amount` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "type_exact" CHECK(
          ("__new_ingredient"."type" != 'exact')
          OR (
            "__new_ingredient"."unit" IS NOT NULL
            AND "__new_ingredient"."amount" IS NOT NULL
            AND "__new_ingredient"."min_amount" IS NULL
            AND "__new_ingredient"."max_amount" IS NULL
            AND "__new_ingredient"."descriptive_amount" IS NULL
          )
        ),
	CONSTRAINT "type_range" CHECK(
          ("__new_ingredient"."type" != 'range')
          OR (
            "__new_ingredient"."unit" IS NOT NULL
            AND "__new_ingredient"."min_amount" IS NOT NULL
            AND "__new_ingredient"."max_amount" IS NOT NULL
            AND "__new_ingredient"."amount" IS NULL
            AND "__new_ingredient"."descriptive_amount" IS NULL
          )
        ),
	CONSTRAINT "type_other" CHECK(
          ("__new_ingredient"."type" != 'other')
          OR (
            "__new_ingredient"."descriptive_amount" IS NOT NULL
            AND "__new_ingredient"."unit" IS NULL
            AND "__new_ingredient"."amount" IS NULL
            AND "__new_ingredient"."min_amount" IS NULL
            AND "__new_ingredient"."max_amount" IS NULL
          )
        )
);
--> statement-breakpoint
INSERT INTO `__new_ingredient`("id", "recipe_id", "type", "name", "unit", "amount", "min_amount", "max_amount", "descriptive_amount", "created_at", "updated_at") SELECT "id", "recipe_id", "type", "name", "unit", "amount", "min_amount", "max_amount", "descriptive_amount", "created_at", "updated_at" FROM `ingredient`;--> statement-breakpoint
DROP TABLE `ingredient`;--> statement-breakpoint
ALTER TABLE `__new_ingredient` RENAME TO `ingredient`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_recipe` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`origin_url` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_recipe`("id", "name", "description", "origin_url", "slug", "created_at", "updated_at") SELECT "id", "name", "description", "origin_url", "slug", "created_at", "updated_at" FROM `recipe`;--> statement-breakpoint
DROP TABLE `recipe`;--> statement-breakpoint
ALTER TABLE `__new_recipe` RENAME TO `recipe`;--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_origin_url_unique` ON `recipe` (`origin_url`);--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_slug_unique` ON `recipe` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_step` (
	`id` text,
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
ALTER TABLE `__new_step` RENAME TO `step`;