import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth, requireAdmin } from "../../shared/middleware/auth-guard.js";
import {
  checkoutSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} from "./orders.schema.js";
import {
  checkoutHandler,
  listOrdersHandler,
  getOrderHandler,
  updateOrderStatusHandler,
  listAllOrdersHandler,
} from "./orders.controller.js";

export const ordersRouter = Router();

// Guest checkout — no auth required
ordersRouter.post(
  "/checkout",
  validate({ body: checkoutSchema }),
  asyncHandler(checkoutHandler)
);

// Authenticated customer routes
ordersRouter.get(
  "/",
  requireAuth,
  validate({ query: listOrdersQuerySchema }),
  asyncHandler(listOrdersHandler)
);

ordersRouter.get(
  "/:id",
  requireAuth,
  validate({ params: orderIdParamSchema }),
  asyncHandler(getOrderHandler)
);

// Admin routes
ordersRouter.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  validate({ query: listOrdersQuerySchema }),
  asyncHandler(listAllOrdersHandler)
);

ordersRouter.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
  asyncHandler(updateOrderStatusHandler)
);