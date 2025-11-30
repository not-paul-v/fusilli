import { relations, sql } from "drizzle-orm";
import {
	check,
	integer,
	real,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { v7 as uuid } from "uuid";
import { timestampColumns } from "./utils";

export const origins = ["url", "pdf"] as const;

export const recipe = sqliteTable(
	"recipe",
	{
		id: text("id")
			.primaryKey()
			.$default(() => uuid()),
		userId: text("user_id").notNull(),
		name: text("name").notNull(),
		description: text("description").notNull(),
		slug: text("slug").notNull().unique(),

		origin: text("origin", { enum: origins }).notNull(),

		// origin url
		originUrl: text("origin_url"),
		// origin pdf
		r2Key: text("r2_key"),

		...timestampColumns,
	},
	(table) => [
		check(
			"origin_url",
			sql`
				(${table.origin} != 'url')
				OR (
					${table.originUrl} IS NOT NULL
					AND ${table.r2Key} IS NULL
				)
			`,
		),
		check(
			"origin_pdf",
			sql`
				(${table.origin} != 'pdf')
				OR (
					${table.r2Key} IS NOT NULL
					AND ${table.originUrl} IS NULL
				)
			`,
		),
		uniqueIndex("recipe_url_unique")
			.on(table.originUrl)
			.where(sql`${table.originUrl} IS NOT NULL`),
		uniqueIndex("recipe_r2_key_unique")
			.on(table.r2Key)
			.where(sql`${table.r2Key} IS NOT NULL`),
	],
);
export type Recipe = typeof recipe.$inferSelect;

export const ingredient = sqliteTable(
	"ingredient",
	{
		id: text("id")
			.primaryKey()
			.$default(() => uuid()),
		recipeId: text("recipe_id")
			.notNull()
			.references(() => recipe.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		name: text("name").notNull(),
		unit: text("unit"),
		amount: real("amount"),
		minAmount: real("min_amount"),
		maxAmount: real("max_amount"),
		descriptiveAmount: text("descriptive_amount"),
		...timestampColumns,
	},
	(table) => [
		check(
			"type_exact",
			sql`
          (${table.type} != 'exact')
          OR (
            ${table.unit} IS NOT NULL
            AND ${table.amount} IS NOT NULL
            AND ${table.minAmount} IS NULL
            AND ${table.maxAmount} IS NULL
            AND ${table.descriptiveAmount} IS NULL
          )
        `,
		),
		check(
			"type_range",
			sql`
          (${table.type} != 'range')
          OR (
            ${table.unit} IS NOT NULL
            AND ${table.minAmount} IS NOT NULL
            AND ${table.maxAmount} IS NOT NULL
            AND ${table.amount} IS NULL
            AND ${table.descriptiveAmount} IS NULL
          )
        `,
		),
		check(
			"type_other",
			sql`
          (${table.type} != 'other')
          OR (
            ${table.descriptiveAmount} IS NOT NULL
            AND ${table.unit} IS NULL
            AND ${table.amount} IS NULL
            AND ${table.minAmount} IS NULL
            AND ${table.maxAmount} IS NULL
          )
        `,
		),
	],
);

export const step = sqliteTable("step", {
	id: text("id")
		.primaryKey()
		.$default(() => uuid()),
	recipeId: text("recipe_id")
		.notNull()
		.references(() => recipe.id, { onDelete: "cascade" }),
	order: integer("order").notNull(),
	content: text("content").notNull(),
	...timestampColumns,
});

export const recipeRelations = relations(recipe, ({ many }) => ({
	ingredients: many(ingredient),
	steps: many(step),
}));

export const ingredientRelations = relations(ingredient, ({ one }) => ({
	recipe: one(recipe, {
		fields: [ingredient.recipeId],
		references: [recipe.id],
	}),
}));

export const stepRelations = relations(step, ({ one }) => ({
	recipe: one(recipe, {
		fields: [step.recipeId],
		references: [recipe.id],
	}),
}));
