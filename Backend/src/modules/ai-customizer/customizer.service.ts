import { prisma } from "../../config/prisma.js";
import { chatCompletion, generateImage } from "../../shared/services/openai.service.js";
import { uploadBase64 } from "../../shared/services/cloudinary.service.js";
import { NotFoundError, ForbiddenError, ValidationError } from "../../shared/errors/app-error.js";
import type { CreateCustomProductInput } from "./customizer.schema.js";

// Price rules table (KES) — deterministic, not AI-generated
const BASE_PRICES: Record<string, number> = {
  curtains: 2500,
  pillow_cover: 800,
  mosquito_net: 1500,
};

const FABRIC_MULTIPLIERS: Record<string, number> = {
  cotton: 1.0,
  linen: 1.3,
  silk: 2.0,
  polyester: 0.8,
  velvet: 1.8,
  sheer: 0.9,
};

const PRODUCTION_DAYS: Record<string, number> = {
  curtains: 7,
  pillow_cover: 3,
  mosquito_net: 5,
};

function estimatePrice(input: CreateCustomProductInput): number {
  const base = BASE_PRICES[input.productType] ?? 1000;
  const fabricKey = input.fabric?.toLowerCase() ?? "cotton";
  const multiplier = FABRIC_MULTIPLIERS[fabricKey] ?? 1.0;

  let sizeMultiplier = 1.0;
  if (input.measurements) {
    const { width, height, unit } = input.measurements;
    const w = unit === "inches" ? width * 2.54 : width;
    const h = unit === "inches" ? height * 2.54 : height;
    const area = (w * h) / 10000; // m²
    sizeMultiplier = Math.max(1.0, area * 0.5);
  }

  return Math.round(base * multiplier * sizeMultiplier);
}

export async function createCustomProduct(
  userId: string,
  input: CreateCustomProductInput
) {
  const estimatedPrice = estimatePrice(input);
  const productionDays = PRODUCTION_DAYS[input.productType] ?? 5;

  const record = await prisma.aICustomProduct.create({
    data: {
      userId,
      productType: input.productType,
      fabric: input.fabric,
      pattern: input.pattern,
      color: input.color,
      measurements: input.measurements ?? null,
      styleDescription: input.styleDescription,
      estimatedPrice,
      productionDays,
      status: "processing",
    },
  });

  // Process asynchronously
  processCustomProduct(record.id, input).catch(async (err) => {
    console.error("AI customizer processing failed:", err);
    await prisma.aICustomProduct.update({
      where: { id: record.id },
      data: { status: "failed" },
    });
  });

  return record;
}

async function processCustomProduct(
  recordId: string,
  input: CreateCustomProductInput
) {
  const typeLabel = input.productType.replace("_", " ");
  const specs = [
    input.fabric && `fabric: ${input.fabric}`,
    input.pattern && `pattern: ${input.pattern}`,
    input.color && `color: ${input.color}`,
    input.measurements &&
      `size: ${input.measurements.width}x${input.measurements.height} ${input.measurements.unit}`,
    input.styleDescription && `style: ${input.styleDescription}`,
  ]
    .filter(Boolean)
    .join(", ");

  // Step 1: Get structured spec normalisation from GPT-4o
  const specPrompt = `You are a product designer for a home décor store in Kenya.
A customer wants custom ${typeLabel} with these specs: ${specs}.
Return ONLY valid JSON:
{
  "normalised_description": "string",
  "fabric_recommendation": "string",
  "care_instructions": "string",
  "style_tags": ["string"]
}`;

  const rawJson = await chatCompletion(
    [{ role: "user", content: specPrompt }],
    true
  );

  let spec: { normalised_description: string; fabric_recommendation: string };
  try {
    spec = JSON.parse(rawJson);
  } catch {
    throw new Error("Failed to parse AI spec JSON");
  }

  // Step 2: Generate product preview image
  const imagePrompt = `Product photography of custom ${typeLabel}. 
${spec.normalised_description}. 
Clean white background, professional studio lighting, high detail, luxury home décor style.`;

  const b64 = await generateImage(imagePrompt);
  const { url: previewImageUrl } = await uploadBase64(
    b64,
    "decor-platform/custom-previews"
  );

  await prisma.aICustomProduct.update({
    where: { id: recordId },
    data: { previewImageUrl, status: "completed" },
  });
}

export async function getCustomProduct(id: string, userId: string) {
  const record = await prisma.aICustomProduct.findUnique({ where: { id } });
  if (!record) throw new NotFoundError("Custom product not found");
  if (record.userId !== userId) throw new ForbiddenError("Access denied");
  return record;
}

export async function listCustomProducts(userId: string) {
  return prisma.aICustomProduct.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}