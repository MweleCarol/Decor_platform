import type { Request, Response } from "express";
import * as reviewsService from "./reviews.service.js";
import type { CreateReviewInput, ListReviewsQuery } from "./reviews.schema.js";

export async function listReviewsHandler(req: Request, res: Response) {
  const { productId } = res.locals.validated.params as { productId: string };
  const query = res.locals.validated.query as ListReviewsQuery;
  const result = await reviewsService.listReviews(productId, query);
  res.status(200).json(result);
}

export async function createReviewHandler(req: Request, res: Response) {
  const { productId } = res.locals.validated.params as { productId: string };
  const input = res.locals.validated.body as CreateReviewInput;
  const userId = res.locals.auth!.userId;
  const review = await reviewsService.createReview(productId, userId, input);
  res.status(201).json({ review });
}

export async function deleteReviewHandler(req: Request, res: Response) {
  const { reviewId } = res.locals.validated.params as { reviewId: string };
  const userId = res.locals.auth!.userId;
  const isAdmin = res.locals.auth!.role === "ADMIN";
  await reviewsService.deleteReview(reviewId, userId, isAdmin);
  res.status(204).send();
}