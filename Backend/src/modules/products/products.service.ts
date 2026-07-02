import slugify from "slugify";
import { prisma } from "../../config/prisma.js";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error.js";
import type {
  ListProductsQuery,
  CreateProductInput,
  UpdateProductInput,
  CreateReviewInput,
} from "./products.schema.js";

function sortToOrderBy(sort: ListProductsQuery["sort"]) {
  switch (sort) {
    case "price_asc":
      return { basePrice: "asc" as const };
    case "price_desc":
      return { basePrice: "desc" as const };
    case "rating":
      return { rating: "desc" as const };
    case "best_selling":
      return { reviewCount: "desc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export async function listProducts(query: ListProductsQuery) {
  const { search, category, sort, page, pageSize } = query;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sortToOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
        variants: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      reviews: {
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true });
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function createProduct(input: CreateProductInput) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const slug = await generateUniqueSlug(input.name);

  return prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      basePrice: input.basePrice,
      material: input.material,
      categoryId: input.categoryId,
      isBestSeller: input.isBestSeller ?? false,
      isFeatured: input.isFeatured ?? false,
      variants: {
        create: input.variants,
      },
    },
    include: { variants: true, category: true },
  });
}

export async function updateProduct(productId: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw new NotFoundError("Product not found");
  }

  const { variants, ...rest } = input;

  return prisma.product.update({
    where: { id: productId },
    data: rest,
    include: { variants: true, category: true },
  });
}

export async function deleteProduct(productId: string) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw new NotFoundError("Product not found");
  }
  await prisma.product.delete({ where: { id: productId } });
}

export async function addProductImage(productId: string, url: string, position: number) {
  return prisma.productImage.create({
    data: { productId, url, position },
  });
}

export async function createReview(
  productId: string,
  userId: string,
  input: CreateReviewInput
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const existing = await prisma.review.findFirst({ where: { productId, userId } });
  if (existing) {
    throw new ConflictError("You have already reviewed this product");
  }

  const review = await prisma.review.create({
    data: { productId, userId, rating: input.rating, comment: input.comment },
  });

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