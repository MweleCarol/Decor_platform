import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth } from "../../shared/middleware/auth-guard.js";
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamSchema,
} from "./Cart.schema.js";
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler,
} from "./Cart.controller.js";

export const cartRouter = Router();

// All cart routes require authentication
cartRouter.use(requireAuth);

cartRouter.get("/", asyncHandler(getCartHandler));

cartRouter.post(
  "/",
  validate({ body: addToCartSchema }),
  asyncHandler(addToCartHandler)
);

cartRouter.patch(
  "/:itemId",
  validate({ params: cartItemParamSchema, body: updateCartItemSchema }),
  asyncHandler(updateCartItemHandler)
);

cartRouter.delete(
  "/:itemId",
  validate({ params: cartItemParamSchema }),
  asyncHandler(removeCartItemHandler)
);

cartRouter.delete("/", asyncHandler(clearCartHandler));