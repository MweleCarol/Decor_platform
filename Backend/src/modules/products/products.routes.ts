import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth, requireAdmin } from "../../shared/middleware/auth-guard.js";
import {
  listProductsQuerySchema,
  productSlugParamSchema,
  createProductSchema,
  updateProductSchema,
  createReviewSchema,
} from "./products.schema.js";
import {
  upload,
  listProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  uploadProductImageHandler,
  createReviewHandler,
} from "./products.controller.js";

export const productsRouter = Router();

const idParamSchema = z.object({ id: z.uuid() });

// Public routes
productsRouter.get(
  "/",
  validate({ query: listProductsQuerySchema }),
  asyncHandler(listProductsHandler)
);

productsRouter.get(
  "/:slug",
  validate({ params: productSlugParamSchema }),
  asyncHandler(getProductHandler)
);

// Admin routes
productsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  validate({ body: createProductSchema }),
  asyncHandler(createProductHandler)
);

productsRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema, body: updateProductSchema }),
  asyncHandler(updateProductHandler)
);

productsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: idParamSchema }),
  asyncHandler(deleteProductHandler)
);

productsRouter.post(
  "/:id/images",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  validate({ params: idParamSchema }),
  asyncHandler(uploadProductImageHandler)
);

// Customer routes
productsRouter.post(
  "/:id/reviews",
  requireAuth,
  validate({ params: idParamSchema, body: createReviewSchema }),
  asyncHandler(createReviewHandler)
);