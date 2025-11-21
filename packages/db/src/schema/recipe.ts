import {
  sqliteTable,
  text,
  integer,
  real,
  check,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { timestampColumns } from "./utils";
import { v7 as uuid } from "uuid";

export const recipe = sqliteTable("recipe", {
  id: text("id")
    .primaryKey()
    .$default(() => uuid()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  originUrl: text("origin_url").notNull().unique(),
  slug: text("slug").notNull().unique(),
  ...timestampColumns,
});

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
