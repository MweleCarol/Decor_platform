import type { Request, Response } from "express";
import multer from "multer";
import * as productsService from "./products.service.js";
import { uploadBuffer } from "../../shared/services/cloudinary.service.js";
import { ValidationError } from "../../shared/errors/app-error.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateReviewInput,
  ListProductsQuery,
} from "./products.schema.js";

export const upload = multer({ storage: multer.memoryStorage() });

export async function listProductsHandler(req: Request, res: Response) {
  const query = res.locals.validated.query as ListProductsQuery;
  const result = await productsService.listProducts(query);
  res.status(200).json(result);
}

export async function getProductHandler(req: Request, res: Response) {
  const { slug } = res.locals.validated.params as { slug: string };
  const product = await productsService.getProductBySlug(slug);
  res.status(200).json({ product });
}

export async function createProductHandler(req: Request, res: Response) {
  const input = res.locals.validated.body as CreateProductInput;
  const product = await productsService.createProduct(input);
  res.status(201).json({ product });
}

export async function updateProductHandler(req: Request, res: Response) {
  const input = res.locals.validated.body as UpdateProductInput;
  const { id } = res.locals.validated.params as { id: string };
  const product = await productsService.updateProduct(id, input);
  res.status(200).json({ product });
}

export async function deleteProductHandler(req: Request, res: Response) {
  const { id } = res.locals.validated.params as { id: string };
  await productsService.deleteProduct(id);
  res.status(204).send();
}

export async function uploadProductImageHandler(req: Request, res: Response) {
  if (!req.file) {
    throw new ValidationError("No image file provided");
  }

  const { id } = res.locals.validated.params as { id: string };
  const position = Number(req.body.position ?? 0);
  const { url } = await uploadBuffer(req.file.buffer, "decor-platform/products");
  const image = await productsService.addProductImage(id, url, position);

  res.status(201).json({ image });
}

export async function createReviewHandler(req: Request, res: Response) {
  const input = res.locals.validated.body as CreateReviewInput;
  const { id } = res.locals.validated.params as { id: string };
  const userId = res.locals.auth!.userId;
  const review = await productsService.createReview(id, userId, input);
  res.status(201).json({ review });
}