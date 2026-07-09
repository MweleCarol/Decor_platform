"use client";

import Image from "next/image";
import { Download, RefreshCw, ShoppingCart, Sparkles, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface CustomProduct {
  id: string;
  status: string;
  productType: string;
  fabric?: string;
  pattern?: string;
  color?: string;
  measurements?: { width: number; height: number; unit: string };
  styleDescription?: string;
  previewImageUrl?: string;
  estimatedPrice?: number;
  productionDays?: number;
}

interface CustomizerPreviewProps {
  record: CustomProduct;
  onReset: () => void;
}

export function CustomizerPreview({ record, onReset }: CustomizerPreviewProps) {
  if (record.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gold-200" />
          <div className="absolute inset-0 rounded-full border-4 border-gold-500 border-t-transparent animate-spin" />
          <Package size={20} className="absolute inset-0 m-auto text-gold-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-stone-800">Creating your product…</p>
          <p className="text-sm text-stone-400 mt-1 max-w-xs">
            Our AI is generating a preview of your custom product. This takes about 30 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (record.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-stone-500">Preview generation failed. Please try again.</p>
        <Button variant="outline" onClick={onReset} icon={<RefreshCw size={14} />}>
          Try Again
        </Button>
      </div>
    );
  }

  const typeLabel = record.productType.replace("_", " ");

  return (
    <div className="space-y-6">

      {/* Preview image */}
      <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-stone-100">
        {record.previewImageUrl ? (
          <Image src={record.previewImageUrl} alt="Custom product preview" fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Sparkles size={32} className="text-stone-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="gold">AI Preview</Badge>
        </div>
      </div>

      {/* Specs */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
        <p className="font-semibold text-stone-800 capitalize">{typeLabel}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {record.fabric && (
            <div>
              <p className="text-stone-400 text-xs">Fabric</p>
              <p className="font-medium text-stone-800 capitalize">{record.fabric}</p>
            </div>
          )}
          {record.pattern && (
            <div>
              <p className="text-stone-400 text-xs">Pattern</p>
              <p className="font-medium text-stone-800">{record.pattern}</p>
            </div>
          )}
          {record.color && (
            <div>
              <p className="text-stone-400 text-xs">Colour</p>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border border-stone-200" style={{ background: record.color }} />
                <p className="font-medium text-stone-800">{record.color}</p>
              </div>
            </div>
          )}
          {record.measurements && (
            <div>
              <p className="text-stone-400 text-xs">Size</p>
              <p className="font-medium text-stone-800">
                {record.measurements.width} × {record.measurements.height} {record.measurements.unit}
              </p>
            </div>
          )}
        </div>
        {record.styleDescription && (
          <p className="text-sm text-stone-500 italic">"{record.styleDescription}"</p>
        )}
      </div>

      {/* Pricing + production */}
      <div className="grid grid-cols-2 gap-4">
        {record.estimatedPrice && (
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 text-center">
            <p className="text-xs text-stone-500 mb-1">Estimated Price</p>
            <p className="text-2xl font-bold text-gold-700">
              {formatCurrency(Number(record.estimatedPrice))}
            </p>
          </div>
        )}
        {record.productionDays && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
            <Clock size={16} className="text-stone-400 mx-auto mb-1" />
            <p className="text-xs text-stone-500">Production Time</p>
            <p className="text-xl font-bold text-stone-800">{record.productionDays} days</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          icon={<ShoppingCart size={15} />}
          onClick={() => toast.success("Contact us via chat to order this custom product!")}
        >
          Order This
        </Button>
        <Button variant="outline" onClick={onReset} icon={<RefreshCw size={14} />}>
          New Design
        </Button>
        {record.previewImageUrl && (
          <a href={record.previewImageUrl} download target="_blank" rel="noreferrer">
            <Button variant="outline" icon={<Download size={14} />} />
          </a>
        )}
      </div>

      <p className="text-xs text-stone-400 text-center">
        To order, start a chat and share your design ID: <span className="font-mono">{record.id.slice(0, 8).toUpperCase()}</span>
      </p>
    </div>
  );
}