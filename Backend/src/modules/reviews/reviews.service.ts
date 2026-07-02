import { prisma } from "../../config/prisma.js";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../../shared/errors/app-error.js";
import type { CreateReviewInput, ListReviewsQuery } from "./reviews.schema.js";

function sortToOrderBy(sort: ListReviewsQuery["sort"]) {
  switch (sort) {
    case "highest":
      return { rating: "desc" as const };
    case "lowest":
      return { rating: "asc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export async function listReviews(productId: string, query: ListReviewsQuery) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError("Product not found");

  const { page, pageSize, sort } = query;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: sortToOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function createReview(
  productId: string,
  userId: string,
  input: CreateReviewInput
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError("Product not found");

  // One review per user per product
  const existing = await prisma.review.findFirst({
    where: { productId, userId },
  });
  if (existing) throw new ConflictError("You have already reviewed this product");

  // Verify the user has actually purchased this product
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ["DELIVERED", "SHIPPED"] },
      },
    },
  });
  if (!purchased) {
    throw new ForbiddenError("You can only review products you have purchased");
  }

  const review = await prisma.review.create({
    data: { productId, userId, rating: input.rating, comment: input.comment },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  // Recalculate aggregate rating on the product
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });

  return review;
}

export async function deleteReview(reviewId: string, userId: string, isAdmin: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError("Review not found");

  // Only the review author or an admin can delete
  if (!isAdmin && review.userId !== userId) {
    throw new ForbiddenError("You can only delete your own reviews");
  }

  await prisma.review.delete({ where: { id: reviewId } });

  // Recalculate aggregate after deletion
  const agg = await prisma.review.aggregate({
    where: { productId: review.productId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });
}