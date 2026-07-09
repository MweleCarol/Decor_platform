"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, History } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { DesignerUpload } from "@/components/ai/designer-upload";
import { DesignerResult } from "@/components/ai/designer-result";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function DesignerPage() {
  const { user }              = useAuthStore();
  const queryClient           = useQueryClient();
  const [designId, setDesignId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<number | undefined>(undefined);

  // Fetch current design by ID with polling until completed
  const { data: designData } = useQuery({
    queryKey: ["design", designId],
    enabled:  !!designId,
    refetchInterval: pollInterval,
    queryFn: async () => {
      const { data } = await api.get(`/api/ai/designer/${designId}`);
      return data;
    },
  });

  const design = designData?.design;

  // Stop polling once completed or failed
  useEffect(() => {
    if (!design) return;
    if (design.status === "completed" || design.status === "failed") {
      setPollInterval(undefined);
    }
  }, [design?.status]);

  // Past designs
  const { data: historyData } = useQuery({
    queryKey: ["designs"],
    enabled:  !!user,
    queryFn: async () => {
      const { data } = await api.get("/api/ai/designer");
      return data;
    },
  });

  const createDesign = useMutation({
    mutationFn: async ({
      image, roomType, colorPalette, stylePrompt,
    }: { image: File; roomType: string; colorPalette: string[]; stylePrompt: string }) => {
      const formData = new FormData();
      formData.append("roomImage", image);
      formData.append("roomType", roomType);
      if (colorPalette.length) formData.append("colorPalette", JSON.stringify(colorPalette));
      if (stylePrompt) formData.append("stylePrompt", stylePrompt);
      const { data } = await api.post("/api/ai/designer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      setDesignId(data.design.id);
      setPollInterval(3000); // poll every 3s until done
      queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to create design");
    },
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      await api.post(`/api/ai/designer/${designId}/add-to-cart`);
    },
    onSuccess: () => toast.success("Recommended products added to cart"),
    onError:   () => toast.error("Failed to add products to cart"),
  });

  const pastDesigns = historyData?.designs ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gold-50 text-gold-700 text-xs font-semibold px-4 py-2 rounded-full border border-gold-200 mb-4">
          <Sparkles size={13} /> AI-Powered
        </div>
        <h1 className="font-display text-5xl font-bold text-stone-900 mb-3">
          Interior Designer
        </h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto">
          Upload a photo of your room and let our AI redesign it with matching products from our store.
        </p>
      </div>

      {!user ? (
        <div className="max-w-md mx-auto text-center py-12">
          <Sparkles size={40} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">Please sign in to use the AI Designer.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Sign In
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Upload form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-stone-800 mb-6">Your Room Details</h2>
              <DesignerUpload
                onSubmit={(data) => createDesign.mutate(data)}
                loading={createDesign.isPending}
              />
            </div>
          </div>

          {/* Result panel */}
          <div className="lg:col-span-3">
            {design ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6">
                <h2 className="font-semibold text-stone-800 mb-6">Your AI Design</h2>
                {/** Cast to any to match external component prop types at runtime */}
                {(() => {
                  const DesignerResultAny = DesignerResult as any;
                  return (
                    <DesignerResultAny
                      design={design}
                      onAddToCart={() => addToCart.mutate()}
                      addingToCart={addToCart.isPending}
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-white border border-dashed border-stone-200 rounded-2xl gap-3 text-center px-6">
                <Sparkles size={36} className="text-stone-300" />
                <p className="font-medium text-stone-500">Your AI design will appear here</p>
                <p className="text-sm text-stone-400">Upload a room photo and click Generate Design</p>
              </div>
            )}

            {/* Past designs */}
            {pastDesigns.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-stone-700 flex items-center gap-2 mb-4">
                  <History size={16} /> Past Designs
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {pastDesigns.slice(0, 4).map((d: any) => (
                    <button
                      key={d.id}
                      onClick={() => setDesignId(d.id)}
                      className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border-2 border-transparent hover:border-gold-400 transition-colors group"
                    >
                      {(d.generatedImageUrl ?? d.originalImageUrl) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.generatedImageUrl ?? d.originalImageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-white text-xs">{formatDate(d.createdAt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}