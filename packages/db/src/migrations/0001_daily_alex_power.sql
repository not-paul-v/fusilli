CREATE TABLE `ingredient` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`unit` text,
	`amount` real,
	`min_amount` real,
	`max_amount` real,
	`descriptive_amount` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "type_exact" CHECK(
          ("ingredient"."type" != 'exact')
          OR (
            "ingredient"."unit" IS NOT NULL
            AND "ingredient"."amount" IS NOT NULL
            AND "ingredient"."min_amount" IS NULL
            AND "ingredient"."max_amount" IS NULL
            AND "ingredient"."descriptive_amount" IS NULL
          )
        ),
	CONSTRAINT "type_range" CHECK(
          ("ingredient"."type" != 'range')
          OR (
            "ingredient"."unit" IS NOT NULL
            AND "ingredient"."min_amount" IS NOT NULL
            AND "ingredient"."max_amount" IS NOT NULL
            AND "ingredient"."amount" IS NULL
            AND "ingredient"."descriptive_amount" IS NULL
          )
        ),
	CONSTRAINT "type_other" CHECK(
          ("ingredient"."type" != 'other')
          OR (
            "ingredient"."descriptive_amount" IS NOT NULL
            AND "ingredient"."unit" IS NULL
            AND "ingredient"."amount" IS NULL
            AND "ingredient"."min_amount" IS NULL
            AND "ingredient"."max_amount" IS NULL
          )
        )
);
--> statement-breakpoint
CREATE TABLE `recipe` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `step` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`order` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
