import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { requireAuth } from "../../shared/middleware/auth-guard.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  addAddressSchema,
  addressIdParamSchema,
} from "./users.schema.js";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
  listAddressesHandler,
  addAddressHandler,
  deleteAddressHandler,
  setDefaultAddressHandler,
} from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/me", asyncHandler(getProfileHandler));

usersRouter.patch(
  "/me",
  validate({ body: updateProfileSchema }),
  asyncHandler(updateProfileHandler)
);

usersRouter.post(
  "/me/change-password",
  validate({ body: changePasswordSchema }),
  asyncHandler(changePasswordHandler)
);

usersRouter.get("/me/addresses", asyncHandler(listAddressesHandler));

usersRouter.post(
  "/me/addresses",
  validate({ body: addAddressSchema }),
  asyncHandler(addAddressHandler)
);

usersRouter.delete(
  "/me/addresses/:addressId",
  validate({ params: addressIdParamSchema }),
  asyncHandler(deleteAddressHandler)
);

usersRouter.patch(
  "/me/addresses/:addressId/default",
  validate({ params: addressIdParamSchema }),
  asyncHandler(setDefaultAddressHandler)
);