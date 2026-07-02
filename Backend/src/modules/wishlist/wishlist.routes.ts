import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth } from "../../shared/middleware/auth-guard.js";
import {
  addToWishlistSchema,
  wishlistProductParamSchema,
} from "./wishlist.schema.js";
import {
  getWishlistHandler,
  addToWishlistHandler,
  removeFromWishlistHandler,
} from "./wishlist.controller.js";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get("/", asyncHandler(getWishlistHandler));

wishlistRouter.post(
  "/",
  validate({ body: addToWishlistSchema }),
  asyncHandler(addToWishlistHandler)
);

wishlistRouter.delete(
  "/:productId",
  validate({ params: wishlistProductParamSchema }),
  asyncHandler(removeFromWishlistHandler)
);