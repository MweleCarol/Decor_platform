import type { Request, Response } from "express";
import * as adminService from "./admin.service.js";

export async function getAnalyticsHandler(_req: Request, res: Response) {
  const analytics = await adminService.getAnalytics();
  res.status(200).json({ analytics });
}

export async function listUsersHandler(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const result = await adminService.listUsers(page, pageSize);
  res.status(200).json(result);
}

export async function listAllDesignsHandler(_req: Request, res: Response) {
  const designs = await adminService.listAllDesigns();
  res.status(200).json({ designs });
}

export async function listAllCustomProductsHandler(_req: Request, res: Response) {
  const records = await adminService.listAllCustomProducts();
  res.status(200).json({ records });
}