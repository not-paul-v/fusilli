DROP INDEX `recipe_url_unique`;--> statement-breakpoint
DROP INDEX `recipe_r2_key_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_url_unique` ON `recipe` (`origin_url`) WHERE "recipe"."origin_url" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_r2_key_unique` ON `recipe` (`r2_key`) WHERE "recipe"."r2_key" IS NOT NULL;