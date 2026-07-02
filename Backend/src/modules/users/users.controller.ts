import type { Request, Response } from "express";
import * as usersService from "./users.service.js";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  AddAddressInput,
} from "./users.schema.js";

export async function getProfileHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const user = await usersService.getProfile(userId);
  res.status(200).json({ user });
}

export async function updateProfileHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const input = res.locals.validated.body as UpdateProfileInput;
  const user = await usersService.updateProfile(userId, input);
  res.status(200).json({ user });
}

export async function changePasswordHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const input = res.locals.validated.body as ChangePasswordInput;
  await usersService.changePassword(userId, input);
  res.status(200).json({ message: "Password updated. Please log in again." });
}

export async function listAddressesHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const addresses = await usersService.listAddresses(userId);
  res.status(200).json({ addresses });
}

export async function addAddressHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const input = res.locals.validated.body as AddAddressInput;
  const address = await usersService.addAddress(userId, input);
  res.status(201).json({ address });
}

export async function deleteAddressHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { addressId } = res.locals.validated.params as { addressId: string };
  await usersService.deleteAddress(userId, addressId);
  res.status(204).send();
}

export async function setDefaultAddressHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const { addressId } = res.locals.validated.params as { addressId: string };
  const address = await usersService.setDefaultAddress(userId, addressId);
  res.status(200).json({ address });
}