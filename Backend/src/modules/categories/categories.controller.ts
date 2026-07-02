import type { Request, Response } from "express";
import * as categoriesService from "./categories.service.js";
import type { CreateCategoryInput } from "./categories.schema.js";

export async function listCategoriesHandler(req: Request, res: Response) {
  const categories = await categoriesService.listCategories();
  res.status(200).json({ categories });
}

export async function createCategoryHandler(req: Request, res: Response) {
  const input = res.locals.validated.body as CreateCategoryInput;
  const category = await categoriesService.createCategory(input);
  res.status(201).json({ category });
}

export async function deleteCategoryHandler(req: Request, res: Response) {
  const { id } = res.locals.validated.params as { id: string };
  await categoriesService.deleteCategory(id);
  res.status(204).send();
}