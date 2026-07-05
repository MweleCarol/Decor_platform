"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers
export const toast = {
  success: (msg: string) => useToastStore.getState().add("success", msg),
  error:   (msg: string) => useToastStore.getState().add("error", msg),
  warning: (msg: string) => useToastStore.getState().add("warning", msg),
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-emerald-500" />,
  error:   <XCircle    size={16} className="text-red-500" />,
  warning: <AlertCircle size={16} className="text-amber-500" />,
};

const borders: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error:   "border-l-red-500",
  warning: "border-l-amber-500",
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 bg-white border border-stone-200 border-l-4 rounded-xl px-4 py-3 shadow-lg",
            "animate-in slide-in-from-right-5 fade-in duration-200",
            borders[toast.type]
          )}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm text-stone-700">{toast.message}</p>
          <button
            onClick={() => remove(toast.id)}
            className="text-stone-400 hover:text-stone-600 transition-colors mt-0.5"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}