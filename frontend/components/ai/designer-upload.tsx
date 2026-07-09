"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ROOM_TYPES = [
  { value: "living_room",  label: "Living Room" },
  { value: "bedroom",      label: "Bedroom" },
  { value: "dining_room",  label: "Dining Room" },
  { value: "kitchen",      label: "Kitchen" },
  { value: "bathroom",     label: "Bathroom" },
  { value: "office",       label: "Home Office" },
];

const PALETTES = [
  { name: "Warm Neutrals",  colors: ["#F5F0E8", "#D4B896", "#A0785A", "#6B4C3B"] },
  { name: "Cool Greys",     colors: ["#F8F9FA", "#CDD3DA", "#8896A7", "#3D5166"] },
  { name: "Earth Tones",    colors: ["#E8DCC8", "#C4A882", "#8B6914", "#4A3728"] },
  { name: "Modern Black",   colors: ["#FFFFFF", "#E5E5E5", "#888888", "#1A1A1A"] },
  { name: "Sage & Cream",   colors: ["#F7F4EF", "#D4CFBF", "#8FAE94", "#4A6741"] },
];

interface DesignerUploadProps {
  onSubmit: (data: {
    image: File;
    roomType: string;
    colorPalette: string[];
    stylePrompt: string;
  }) => void;
  loading: boolean;
}

export function DesignerUpload({ onSubmit, loading }: DesignerUploadProps) {
  const fileRef                         = useRef<HTMLInputElement>(null);
  const [image, setImage]               = useState<File | null>(null);
  const [preview, setPreview]           = useState<string | null>(null);
  const [roomType, setRoomType]         = useState("living_room");
  const [palette, setPalette]           = useState<string[]>([]);
  const [stylePrompt, setStylePrompt]   = useState("");
  const [dragging, setDragging]         = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSubmit() {
    if (!image) return;
    onSubmit({ image, roomType, colorPalette: palette, stylePrompt });
  }

  return (
    <div className="space-y-7">

      {/* Image upload */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Room Photo</p>
        {preview ? (
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-100">
            <Image src={preview} alt="Room preview" fill className="object-cover" />
            <button
              onClick={() => { setImage(null); setPreview(null); }}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-stone-600 hover:text-red-500 shadow"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-colors",
              dragging ? "border-gold-400 bg-gold-50" : "border-stone-300 hover:border-gold-400 bg-stone-50"
            )}
          >
            <Upload size={28} className="text-stone-400 mb-3" />
            <p className="text-sm font-medium text-stone-600">Drop a photo here or click to upload</p>
            <p className="text-xs text-stone-400 mt-1">JPG, PNG — max 10MB</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Room type */}
      <Select
        label="Room Type"
        value={roomType}
        onChange={(e) => setRoomType(e.target.value)}
        options={ROOM_TYPES}
      />

      {/* Colour palette */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-3">Colour Palette</p>
        <div className="grid grid-cols-1 gap-2">
          {PALETTES.map((p) => {
            const selected = JSON.stringify(p.colors) === JSON.stringify(palette);
            return (
              <button
                key={p.name}
                onClick={() => setPalette(selected ? [] : p.colors)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors",
                  selected ? "border-gold-500 bg-gold-50" : "border-stone-200 hover:border-stone-400"
                )}
              >
                <div className="flex gap-1 shrink-0">
                  {p.colors.map((c) => (
                    <div key={c} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-xs font-medium text-stone-700">{p.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style prompt */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-1.5">Describe Your Style</p>
        <textarea
          value={stylePrompt}
          onChange={(e) => setStylePrompt(e.target.value)}
          placeholder='e.g. "Cozy modern living room with cream curtains, grey pillows and warm lighting"'
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white outline-none resize-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 placeholder:text-stone-400"
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        loading={loading}
        disabled={!image}
        icon={<Sparkles size={16} />}
        onClick={handleSubmit}
      >
        Generate Design
      </Button>

      <p className="text-xs text-stone-400 text-center">
        Uses 1 of your 3 free monthly AI generations
      </p>
    </div>
  );
}