import { env } from "cloudflare:workers";
import { db } from "@fusilli/db";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import z from "zod";
import {
	type AuthMiddlewareVariables,
	authMiddleware,
} from "@/middleware/auth";
import { extractTextFromPdf } from "@/workflows/extract-recipe/from-pdf/extract-text-from-pdf";

export const recipeRoutes = new Hono<{ Variables: AuthMiddlewareVariables }>()
	.use(authMiddleware)
	.post(
		"/from-link",
		zValidator(
			"query",
			z.object({
				url: z.url(),
			}),
		),
		async (c) => {
			const user = c.get("user");
			const instance = await env.EXTRACT_RECIPE_FROM_URL_WORKFLOW.create({
				params: {
					url: c.req.valid("query").url,
					userId: user.id,
				},
			});
			return c.json({
				id: instance.id,
			} as { id: string }); // hack to allow type inference in api client
		},
	)
	.post("/from-pdf", async (c) => {
		const user = c.get("user");
		const body = await c.req.parseBody();
		const file = body.file;

		if (!file || !(file instanceof File)) {
			throw new HTTPException(400, { message: "No file provided" });
		}

		if (file.type !== "application/pdf") {
			throw new HTTPException(400, { message: "File must be a PDF" });
		}

		const randomSuffix = crypto.randomUUID();
		const fileName = file.name.replace(/\.pdf$/i, "");
		const key = `${fileName}-${randomSuffix}.pdf`;

		await env.BUCKET.put(key, file.stream());

		const text = await extractTextFromPdf(key);

		return c.json({
			key,
			fileName: file.name,
			size: file.size,
			text,
		});
	})
	.get("/", async (c) => {
		const user = c.get("user");
		const recipes = await db.query.recipe.findMany({
			where: (recipe, { eq }) => eq(recipe.userId, user.id),
			orderBy: (recipe, { desc }) => desc(recipe.createdAt),
			columns: {
				id: true,
				name: true,
				description: true,
				slug: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return c.json(recipes);
	})
	.get("/:slug", async (c) => {
		const recipeSlug = c.req.param("slug");
		const recipe = await db.query.recipe.findFirst({
			where: (recipe, { eq }) => eq(recipe.slug, recipeSlug),
		});
		if (!recipe) {
			return c.json({ error: "Recipe not found" }, 404);
		}
		return c.json(recipe);
	})

	.get("/:id/steps", async (c) => {
		const recipeId = c.req.param("id");
		const steps = await db.query.step.findMany({
			where: (step, { eq }) => eq(step.recipeId, recipeId),
			orderBy: (step, { asc }) => asc(step.createdAt),
		});
		return c.json(steps);
	});
