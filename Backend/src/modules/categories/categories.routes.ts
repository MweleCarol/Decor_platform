import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth, requireAdmin } from "../../shared/middleware/auth-guard.js";
import { createCategorySchema } from "./categories.schema.js";
import {
  listCategoriesHandler,
  createCategoryHandler,
  deleteCategoryHandler,
} from "./categories.controller.js";

export const categoriesRouter = Router();

const idParamSchema = z.object({ id: z.uuid() });

categoriesRouter.get("/", asyncHandler(listCategoriesHandler));

categoriesRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  validate({ body: createCategorySchema }),
  asyncHandler(createCategoryHandler)
);

categoriesRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema }),
  asyncHandler(deleteCategoryHandler)
);