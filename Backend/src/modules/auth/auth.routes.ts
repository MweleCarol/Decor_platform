import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./auth.schema.js";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  asyncHandler(registerHandler)
);

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(loginHandler)
);

authRouter.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(refreshHandler)
);

authRouter.post(
  "/logout",
  validate({ body: refreshSchema }),
  asyncHandler(logoutHandler)
);