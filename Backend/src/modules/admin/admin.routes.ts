import { Router } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth, requireAdmin } from "../../shared/middleware/auth-guard.js";
import {
  getAnalyticsHandler,
  listUsersHandler,
  listAllDesignsHandler,
  listAllCustomProductsHandler,
} from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/analytics", asyncHandler(getAnalyticsHandler));
adminRouter.get("/users", asyncHandler(listUsersHandler));
adminRouter.get("/designs", asyncHandler(listAllDesignsHandler));
adminRouter.get("/custom-products", asyncHandler(listAllCustomProductsHandler));