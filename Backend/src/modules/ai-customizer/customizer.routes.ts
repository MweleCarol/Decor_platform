import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth } from "../../shared/middleware/auth-guard.js";
import { createCustomProductSchema, customizerIdParamSchema } from "./customizer.schema.js";
import {
  createCustomProductHandler,
  getCustomProductHandler,
  listCustomProductsHandler,
} from "./customizer.controller.js";

export const customizerRouter = Router();

customizerRouter.use(requireAuth);

customizerRouter.get("/", asyncHandler(listCustomProductsHandler));

customizerRouter.post(
  "/",
  validate({ body: createCustomProductSchema }),
  asyncHandler(createCustomProductHandler)
);

customizerRouter.get(
  "/:id",
  validate({ params: customizerIdParamSchema }),
  asyncHandler(getCustomProductHandler)
);