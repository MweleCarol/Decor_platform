"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Palette, Sparkles } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { CustomizerForm } from "@/components/ai/customizer-form";
import { CustomizerPreview } from "@/components/ai/customizer-preview";
import { toast } from "@/components/ui/toast";

export default function CustomizerPage() {
  const { user } = useAuthStore();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<number | undefined>(
    undefined,
  );

  const { data: recordData } = useQuery({
    queryKey: ["custom-product", recordId],
    enabled: !!recordId,
    refetchInterval: pollInterval,
    queryFn: async () => {
      const { data } = await api.get(`/api/ai/customizer/${recordId}`);
      return data;
    },
  });

  const record = recordData?.record;

  useEffect(() => {
    if (!record) return;
    if (record.status === "completed" || record.status === "failed") {
      setPollInterval(undefined);
    }
  }, [record?.status]);

  const createCustomProduct = useMutation({
    mutationFn: async (input: any) => {
      const { data } = await api.post("/api/ai/customizer", input);
      return data;
    },
    onSuccess: (data) => {
      setRecordId(data.record.id);
      setPollInterval(3000);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to generate product");
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gold-50 text-gold-700 text-xs font-semibold px-4 py-2 rounded-full border border-gold-200 mb-4">
          <Palette size={13} /> Custom Creation
        </div>
        <h1 className="font-display text-5xl font-bold text-stone-900 mb-3">
          Product Customizer
        </h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto">
          Design your own curtains, pillow covers, and mosquito nets. Our AI
          generates a preview and price estimate instantly.
        </p>
      </div>

      {!user ? (
        <div className="max-w-md mx-auto text-center py-12">
          <Sparkles size={40} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-4">
            Please sign in to use the AI Customizer.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-stone-800 mb-6">
                Configure Your Product
              </h2>
              <CustomizerForm
                onSubmit={(data) => createCustomProduct.mutate(data)}
                loading={createCustomProduct.isPending}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            {record ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6">
                <h2 className="font-semibold text-stone-800 mb-6">
                  Your Custom Product
                </h2>
                <CustomizerPreview
                  record={record}
                  onReset={() => {
                    setRecordId(null);
                    setPollInterval(undefined);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-white border border-dashed border-stone-200 rounded-2xl gap-3 text-center px-6">
                <Palette size={36} className="text-stone-300" />
                <p className="font-medium text-stone-500">
                  Your product preview will appear here
                </p>
                <p className="text-sm text-stone-400">
                  Fill in the form and click Generate
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
