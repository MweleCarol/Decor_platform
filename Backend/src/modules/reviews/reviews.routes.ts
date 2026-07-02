import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth } from "../../shared/middleware/auth-guard.js";
import {
  createReviewSchema,
  reviewParamSchema,
  reviewIdParamSchema,
  listReviewsQuerySchema,
} from "./reviews.schema.js";
import {
  listReviewsHandler,
  createReviewHandler,
  deleteReviewHandler,
} from "./reviews.controller.js";

export const reviewsRouter = Router();

// Public — anyone can read reviews
reviewsRouter.get(
  "/products/:productId/reviews",
  validate({ params: reviewParamSchema, query: listReviewsQuerySchema }),
  asyncHandler(listReviewsHandler)
);

// Auth required — only verified purchasers can create
reviewsRouter.post(
  "/products/:productId/reviews",
  requireAuth,
  validate({ params: reviewParamSchema, body: createReviewSchema }),
  asyncHandler(createReviewHandler)
);

// Auth required — author or admin can delete
reviewsRouter.delete(
  "/reviews/:reviewId",
  requireAuth,
  validate({ params: reviewIdParamSchema }),
  asyncHandler(deleteReviewHandler)
);