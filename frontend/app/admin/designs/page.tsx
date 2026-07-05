"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ExternalLink } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function AdminDesignsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "designs"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/designs");
      return data;
    },
  });

  const designs = data?.designs ?? [];

  const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
    completed:  "success",
    processing: "warning",
    failed:     "danger",
  };

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-display">AI Designs</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {designs.length} customer-generated room designs
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 rounded-t-xl rounded-b-none" />
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="py-24 text-center">
          <Sparkles size={40} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400">No customer designs yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design: any) => (
            <Card key={design.id} className="overflow-hidden">
              {/* Generated image */}
              <div className="relative h-48 bg-stone-100">
                {design.generatedImageUrl ? (
                  <Image
                    src={design.generatedImageUrl}
                    alt="AI Design"
                    fill
                    className="object-cover"
                  />
                ) : design.originalImageUrl ? (
                  <Image
                    src={design.originalImageUrl}
                    alt="Original room"
                    fill
                    className="object-cover opacity-60"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Sparkles size={28} className="text-stone-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={statusVariant[design.status] ?? "default"}>
                    {design.status}
                  </Badge>
                </div>
              </div>

              <CardContent className="pt-4 space-y-3">
                {/* Customer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{design.user?.fullName}</p>
                    <p className="text-xs text-stone-400">{design.user?.email}</p>
                  </div>
                  <p className="text-xs text-stone-400">{formatDate(design.createdAt)}</p>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Room type</span>
                    <span className="font-medium text-stone-700 capitalize">
                      {design.roomType.replace("_", " ")}
                    </span>
                  </div>
                  {design.estimatedCost && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Est. cost</span>
                      <span className="font-semibold text-gold-600">
                        {formatCurrency(Number(design.estimatedCost))}
                      </span>
                    </div>
                  )}
                  {(design.recommendedProductIds as string[])?.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Products recommended</span>
                      <span className="font-medium text-stone-700">
                        {(design.recommendedProductIds as string[]).length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Color palette */}
                {Array.isArray(design.colorPalette) && design.colorPalette.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-500">Palette</span>
                    <div className="flex gap-1">
                      {(design.colorPalette as string[]).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-stone-200"
                          style={{ background: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Style prompt */}
                {design.stylePrompt && (
                  <p className="text-xs text-stone-500 italic line-clamp-2">
                    "{design.stylePrompt}"
                  </p>
                )}

                {/* View originals link */}
                <div className="flex gap-2 pt-1">
                  {design.originalImageUrl && (
                    <a
                      href={design.originalImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
                    >
                      <ExternalLink size={11} /> Original
                    </a>
                  )}
                  {design.generatedImageUrl && (
                    <a
                      href={design.generatedImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700"
                    >
                      <ExternalLink size={11} /> Generated
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}