export interface MockDesign {
  id: string;
  status: "completed" | "processing" | "failed";
  user: { fullName: string; email: string };
  roomType: string;
  originalImageUrl?: string;
  generatedImageUrl?: string;
  estimatedCost?: number;
  recommendedProductIds?: string[];
  colorPalette?: string[];
  stylePrompt?: string;
  createdAt: string;
}

const img = (n: number) => `/images/image${n}.jpg`;

export const DESIGNS: MockDesign[] = [
  {
    id: "design-01",
    status: "completed",
    user: { fullName: "Diana Achieng", email: "diana.a@example.com" },
    roomType: "living_room",
    originalImageUrl: img(3),
    generatedImageUrl: img(5),
    estimatedCost: 84000,
    recommendedProductIds: ["prod-3", "prod-7", "prod-10"],
    colorPalette: ["#8a6a22", "#3d2f10", "#e5c06a", "#1c1917"],
    stylePrompt: "Warm boutique-hotel living room with velvet textures and brass accents",
    createdAt: "2026-07-28",
  },
  {
    id: "design-02",
    status: "completed",
    user: { fullName: "Faith Njeri", email: "faith.njeri@example.com" },
    roomType: "bedroom",
    originalImageUrl: img(7),
    generatedImageUrl: img(9),
    estimatedCost: 46500,
    recommendedProductIds: ["prod-4", "prod-6", "prod-16"],
    colorPalette: ["#fdf9ee", "#daa83f", "#57534e"],
    stylePrompt: "Calm neutral bedroom with linen bedding and warm ambient lighting",
    createdAt: "2026-07-22",
  },
  {
    id: "design-03",
    status: "processing",
    user: { fullName: "Grace Wambui", email: "grace.w@example.com" },
    roomType: "dining_room",
    originalImageUrl: img(1),
    colorPalette: ["#634c1a", "#e7e5e4", "#292524"],
    stylePrompt: "Modern dining space with a statement pendant light and earthy tones",
    createdAt: "2026-08-10",
  },
  {
    id: "design-04",
    status: "completed",
    user: { fullName: "Anne Mbeki", email: "anne.mbeki@example.com" },
    roomType: "living_room",
    originalImageUrl: img(6),
    generatedImageUrl: img(8),
    estimatedCost: 112000,
    recommendedProductIds: ["prod-13", "prod-15", "prod-1"],
    colorPalette: ["#1c1917", "#c9a84c", "#a8a29e", "#fafaf9"],
    stylePrompt: "Gallery-style living room, abstract wall art and layered warm lighting",
    createdAt: "2026-07-15",
  },
  {
    id: "design-05",
    status: "failed",
    user: { fullName: "Sarah Mumbi", email: "sarah.mumbi@example.com" },
    roomType: "home_office",
    originalImageUrl: img(4),
    stylePrompt: "Minimalist home office with warm wood tones",
    createdAt: "2026-08-05",
  },
  {
    id: "design-06",
    status: "completed",
    user: { fullName: "Otieno Ochieng", email: "otieno.o@example.com" },
    roomType: "living_room",
    originalImageUrl: img(2),
    generatedImageUrl: img(3),
    estimatedCost: 67500,
    recommendedProductIds: ["prod-9", "prod-11"],
    colorPalette: ["#b08a2f", "#d6d3d1", "#292524", "#f7eece"],
    stylePrompt: "Coastal-inspired living room featuring Kikoy textiles and natural fibre rugs",
    createdAt: "2026-06-30",
  },
  {
    id: "design-07",
    status: "processing",
    user: { fullName: "Mercy Chebet", email: "mercy.chebet@example.com" },
    roomType: "bedroom",
    originalImageUrl: img(10),
    colorPalette: ["#daa83f", "#fafaf9"],
    stylePrompt: "Soft romantic bedroom with sheer curtains and warm gold accents",
    createdAt: "2026-08-12",
  },
  {
    id: "design-08",
    status: "completed",
    user: { fullName: "Peter Mutua", email: "peter.mutua@example.com" },
    roomType: "kitchen",
    originalImageUrl: img(9),
    generatedImageUrl: img(7),
    estimatedCost: 38000,
    recommendedProductIds: ["prod-16"],
    colorPalette: ["#44403c", "#e5c06a", "#fdf9ee"],
    stylePrompt: "Warm terracotta accents in an otherwise neutral kitchen corner",
    createdAt: "2026-06-18",
  },
  {
    id: "design-09",
    status: "failed",
    user: { fullName: "James Karanja", email: "james.k@example.com" },
    roomType: "living_room",
    originalImageUrl: img(5),
    stylePrompt: "Bold jewel-tone living room with emerald velvet furnishings",
    createdAt: "2026-07-02",
  },
];