import type { Request, Response } from "express";
import * as ordersService from "./orders.service.js";
import type {
  CheckoutInput,
  UpdateOrderStatusInput,
  ListOrdersQuery,
} from "./orders.schema.js";

export async function checkoutHandler(req: Request, res: Response) {
  const input = res.locals.validated.body as CheckoutInput;
  // userId is undefined for guest checkouts
  const userId = res.locals.auth?.userId;
  const order = await ordersService.checkout(input, userId);
  res.status(201).json({ order });
}

export async function listOrdersHandler(req: Request, res: Response) {
  const userId = res.locals.auth!.userId;
  const query = res.locals.validated.query as ListOrdersQuery;
  const result = await ordersService.listOrders(userId, query);
  res.status(200).json(result);
}

export async function getOrderHandler(req: Request, res: Response) {
  const { id } = res.locals.validated.params as { id: string };
  const userId = res.locals.auth?.userId;
  const order = await ordersService.getOrder(id, userId);
  res.status(200).json({ order });
}

export async function updateOrderStatusHandler(req: Request, res: Response) {
  const { id } = res.locals.validated.params as { id: string };
  const input = res.locals.validated.body as UpdateOrderStatusInput;
  const order = await ordersService.updateOrderStatus(id, input);
  res.status(200).json({ order });
}

export async function listAllOrdersHandler(req: Request, res: Response) {
  const query = res.locals.validated.query as ListOrdersQuery;
  const result = await ordersService.listAllOrders(query);
  res.status(200).json(result);
}