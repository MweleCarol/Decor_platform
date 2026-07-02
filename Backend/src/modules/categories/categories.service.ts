import slugify from "slugify";
import { prisma } from "../../config/prisma.js";
import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import type { CreateCategoryInput } from "./categories.schema.js";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(input: CreateCategoryInput) {
  const slug = slugify(input.name, { lower: true, strict: true });

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: input.name }, { slug }] },
  });
  if (existing) {
    throw new ConflictError("A category with this name already exists");
  }

  return prisma.category.create({
    data: { name: input.name, slug, imageUrl: input.imageUrl },
  });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Category not found");
  }
  await prisma.category.delete({ where: { id } });
}