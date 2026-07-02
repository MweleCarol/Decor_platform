import { prisma } from "../../config/prisma.js";
import { chatCompletion, editImage } from "../../shared/services/openai.service.js";
import { uploadBuffer, uploadBase64 } from "../../shared/services/cloudinary.service.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../shared/errors/app-error.js";
import type { CreateDesignInput } from "./designer.schema.js";

const AI_GENERATION_LIMIT = 3;

async function checkAndIncrementGenerations(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiGenerationsThisMonth: true, aiGenerationsResetAt: true },
  });

  if (!user) throw new NotFoundError("User not found");

  // Reset counter if a calendar month has passed
  const now = new Date();
  const resetAt = new Date(user.aiGenerationsResetAt);
  const monthHasPassed =
    now.getFullYear() > resetAt.getFullYear() ||
    now.getMonth() > resetAt.getMonth();

  if (monthHasPassed) {
    await prisma.user.update({
      where: { id: userId },
      data: { aiGenerationsThisMonth: 1, aiGenerationsResetAt: now },
    });
    return;
  }

  if (user.aiGenerationsThisMonth >= AI_GENERATION_LIMIT) {
    throw new ValidationError(
      `You have used all ${AI_GENERATION_LIMIT} free AI generations for this month.`
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { aiGenerationsThisMonth: { increment: 1 } },
  });
}

export async function createDesign(
  userId: string,
  imageBuffer: Buffer,
  input: CreateDesignInput
) {
  await checkAndIncrementGenerations(userId);

  // Upload original room image to Cloudinary
  const { url: originalImageUrl } = await uploadBuffer(
    imageBuffer,
    "decor-platform/room-originals"
  );

  // Create a pending record immediately so the client can poll
  const design = await prisma.aIDesign.create({
    data: {
      userId,
      roomType: input.roomType,
      colorPalette: input.colorPalette ?? [],
      stylePrompt: input.stylePrompt,
      originalImageUrl,
      recommendedProductIds: [],
      status: "processing",
    },
  });

  // Run AI pipeline asynchronously — do not await in the request cycle
  processDesign(design.id, userId, imageBuffer, input).catch(async (err) => {
    console.error("AI design processing failed:", err);
    await prisma.aIDesign.update({
      where: { id: design.id },
      data: { status: "failed" },
    });
  });

  return design;
}

async function processDesign(
  designId: string,
  userId: string,
  imageBuffer: Buffer,
  input: CreateDesignInput
) {
  const paletteDesc =
    input.colorPalette?.length
      ? `Color palette: ${input.colorPalette.join(", ")}.`
      : "";

  const styleDesc = input.stylePrompt ?? "modern and elegant";

  // Step 1: Structured recommendation from GPT-4o
  const recommendationPrompt = `You are an expert interior designer.
A customer has a ${input.roomType.replace("_", " ")} and wants to redecorate it.
Style description: "${styleDesc}"
${paletteDesc}

Based on these product categories available in our décor store:
- Curtains
- Throw Pillows
- Mosquito Nets
- Bedding Accessories
- Home Décor Items

Return ONLY valid JSON in this exact shape:
{
  "recommended_categories": ["string"],
  "color_suggestions": ["hex string"],
  "style_tags": ["string"],
  "design_reasoning": "string",
  "estimated_cost_ksh": number
}`;

  const rawJson = await chatCompletion(
    [{ role: "user", content: recommendationPrompt }],
    true
  );

  let recommendation: {
    recommended_categories: string[];
    color_suggestions: string[];
    style_tags: string[];
    design_reasoning: string;
    estimated_cost_ksh: number;
  };

  try {
    recommendation = JSON.parse(rawJson);
  } catch {
    throw new Error("Failed to parse AI recommendation JSON");
  }

  // Step 2: Find matching products from the DB
  const products = await prisma.product.findMany({
    where: {
      category: {
        name: {
          in: recommendation.recommended_categories,
          mode: "insensitive",
        },
      },
    },
    take: 8,
    select: { id: true },
  });

  const recommendedProductIds = products.map((p: { id: string }) => p.id);

  // Step 3: Generate room mockup with gpt-image-1 edit mode
  const imagePrompt = `Redesign this ${input.roomType.replace("_", " ")} in a ${styleDesc} style. 
Use colors: ${recommendation.color_suggestions.join(", ")}.
Add matching curtains, throw pillows, and home décor accessories.
Keep the room's architecture unchanged. Make it look like a professional interior design photo.`;

  const b64Mockup = await editImage(imageBuffer, "room.png", imagePrompt);
  const { url: generatedImageUrl } = await uploadBase64(
    b64Mockup,
    "decor-platform/room-mockups"
  );

  // Step 4: Update design record as completed
  await prisma.aIDesign.update({
    where: { id: designId },
    data: {
      generatedImageUrl,
      recommendedProductIds,
      colorPalette: recommendation.color_suggestions,
      estimatedCost: recommendation.estimated_cost_ksh,
      status: "completed",
    },
  });
}

export async function getDesign(designId: string, userId: string) {
  const design = await prisma.aIDesign.findUnique({ where: { id: designId } });
  if (!design) throw new NotFoundError("Design not found");
  if (design.userId !== userId) throw new ForbiddenError("Access denied");
  return design;
}

export async function listDesigns(userId: string) {
  return prisma.aIDesign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addDesignProductsToCart(designId: string, userId: string) {
  const design = await prisma.aIDesign.findUnique({ where: { id: designId } });
  if (!design) throw new NotFoundError("Design not found");
  if (design.userId !== userId) throw new ForbiddenError("Access denied");

  const productIds = design.recommendedProductIds as string[];
  if (!productIds.length) return [];

  // Add each recommended product to cart (quantity 1, no variant)
  const cartItems = await Promise.all(
    productIds.map((productId: string) =>
      prisma.cartItem.upsert({
        where: {
          // Use a compound approach — upsert by checking existing first
          id: productId, // This won't match, so it'll create
        },
        update: { quantity: { increment: 1 } },
        create: { userId, productId, quantity: 1 },
      }).catch(async () => {
        // If upsert fails due to no existing item, create directly
        return prisma.cartItem.create({
          data: { userId, productId, quantity: 1 },
        });
      })
    )
  );

  return cartItems;
}