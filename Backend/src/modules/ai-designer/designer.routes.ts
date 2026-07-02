import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth } from "../../shared/middleware/auth-guard.js";
import { createDesignSchema, designIdParamSchema } from "./designer.schema.js";
import {
  upload,
  createDesignHandler,
  getDesignHandler,
  listDesignsHandler,
  addToCartHandler,
} from "./designer.controller.js";

export const designerRouter = Router();

designerRouter.use(requireAuth);

designerRouter.get("/", asyncHandler(listDesignsHandler));

designerRouter.post(
  "/",
  upload.single("roomImage"),
  validate({ body: createDesignSchema }),
  asyncHandler(createDesignHandler)
);

designerRouter.get(
  "/:id",
  validate({ params: designIdParamSchema }),
  asyncHandler(getDesignHandler)
);

designerRouter.post(
  "/:id/add-to-cart",
  validate({ params: designIdParamSchema }),
  asyncHandler(addToCartHandler)
);