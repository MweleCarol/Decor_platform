"use client";

import { useState } from "react";
import { Sparkles, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRODUCT_TYPES = [
  { value: "curtains",     label: "Curtains" },
  { value: "pillow_cover", label: "Pillow Cover" },
  { value: "mosquito_net", label: "Mosquito Net" },
];

const FABRICS = [
  { value: "cotton",    label: "Cotton", desc: "Breathable & durable" },
  { value: "linen",     label: "Linen",  desc: "Natural & textured" },
  { value: "silk",      label: "Silk",   desc: "Luxurious & smooth" },
  { value: "velvet",    label: "Velvet", desc: "Rich & plush" },
  { value: "polyester", label: "Polyester", desc: "Affordable & easy care" },
  { value: "sheer",     label: "Sheer",  desc: "Light & airy" },
];

const PATTERNS = [
  "Solid", "Floral", "Geometric", "Stripes", "Damask",
  "Abstract", "Moroccan", "Herringbone", "Tropical", "Custom",
];

const COLORS = [
  "#FFFFFF", "#F5F0E8", "#D4B896", "#C9A84C", "#A0785A",
  "#8FAE94", "#3D5166", "#1A1A1A", "#E74C3C", "#9B59B6",
];

interface CustomizerFormProps {
  onSubmit: (data: {
    productType: string;
    fabric?: string;
    pattern?: string;
    color?: string;
    measurements?: { width: number; height: number; unit: "cm" | "inches" };
    styleDescription?: string;
  }) => void;
  loading: boolean;
}

export function CustomizerForm({ onSubmit, loading }: CustomizerFormProps) {
  const [productType, setProductType]         = useState("curtains");
  const [fabric, setFabric]                   = useState("");
  const [pattern, setPattern]                 = useState("");
  const [color, setColor]                     = useState("");
  const [unit, setUnit]                       = useState<"cm" | "inches">("cm");
  const [width, setWidth]                     = useState("");
  const [height, setHeight]                   = useState("");
  const [styleDescription, setStyleDescription] = useState("");

  function handleSubmit() {
    onSubmit({
      productType,
      fabric:   fabric   || undefined,
      pattern:  pattern  || undefined,
      color:    color    || undefined,
      measurements: width && height
        ? { width: Number(width), height: Number(height), unit }
        : undefined,
      styleDescription: styleDescription || undefined,
    });
  }

  return (
    <div className="space-y-7">

      {/* Product type */}
      <Select
        label="Product Type"
        value={productType}
        onChange={(e) => setProductType(e.target.value)}
        options={PRODUCT_TYPES}
      />

      {/* Fabric */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-3">Fabric</p>
        <div className="grid grid-cols-2 gap-2">
          {FABRICS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFabric(fabric === f.value ? "" : f.value)}
              className={cn(
                "p-3 rounded-xl border text-left transition-colors",
                fabric === f.value
                  ? "border-gold-500 bg-gold-50"
                  : "border-stone-200 hover:border-stone-400"
              )}
            >
              <p className="text-sm font-medium text-stone-800">{f.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pattern */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Pattern</p>
        <div className="flex flex-wrap gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p}
              onClick={() => setPattern(pattern === p ? "" : p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                pattern === p
                  ? "border-gold-500 bg-gold-50 text-gold-700"
                  : "border-stone-200 text-stone-600 hover:border-stone-400"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Colour */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Colour</p>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(color === c ? "" : c)}
              style={{ background: c }}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all",
                color === c ? "border-gold-500 scale-110" : "border-stone-200 hover:scale-105"
              )}
            />
          ))}
        </div>
        <input
          type="text"
          placeholder="Or type a hex code e.g. #D4B896"
          value={color.startsWith("#") ? color : ""}
          onChange={(e) => setColor(e.target.value)}
          className="mt-2 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-gold-400/30"
        />
      </div>

      {/* Measurements */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Ruler size={14} className="text-stone-500" />
          <p className="text-sm font-medium text-stone-700">Measurements (optional)</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Width"
            type="number"
            placeholder="e.g. 150"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
          <Input
            label="Height"
            type="number"
            placeholder="e.g. 250"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <Select
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as "cm" | "inches")}
            options={[
              { value: "cm",     label: "cm" },
              { value: "inches", label: "inches" },
            ]}
          />
        </div>
      </div>

      {/* Natural language */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-1.5">Describe It</p>
        <textarea
          value={styleDescription}
          onChange={(e) => setStyleDescription(e.target.value)}
          placeholder='e.g. "Luxury beige blackout curtains with gold floral patterns for a master bedroom"'
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-xl outline-none resize-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 placeholder:text-stone-400"
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        loading={loading}
        icon={<Sparkles size={16} />}
        onClick={handleSubmit}
      >
        Generate Preview
      </Button>

      <p className="text-xs text-stone-400 text-center">
        Uses 1 of your 3 free monthly AI generations
      </p>
    </div>
  );
}