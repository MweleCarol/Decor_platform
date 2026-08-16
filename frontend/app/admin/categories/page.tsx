"use client";

import { useState } from "react";

import { Plus, Trash2, Tag } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useCategories } from "@/hooks/use-products";
import { createMockCategory, deleteMockCategory } from "@/mock/product";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export default function AdminCategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", imageUrl: "" });

  const { data: categories = [], isLoading } = useCategories();

  const createMutation = useMutation({
    mutationFn: async () =>
      USE_MOCK
        ? createMockCategory({
            name: form.name,
            imageUrl: form.imageUrl || undefined,
          })
        : api.post("/api/categories", {
            name: form.name,
            imageUrl: form.imageUrl || undefined,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
      setShowModal(false);
      setForm({ name: "", imageUrl: "" });
    },
    onError: () => toast.error("Failed to create category"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      USE_MOCK ? deleteMockCategory(id) : api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-display">
            Categories
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {categories.length} categories
          </p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowModal(true)}>
          Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-stone-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <Tag size={32} className="text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-400">No categories yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-50">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold-50 border border-gold-100 flex items-center justify-center">
                      <Tag size={14} className="text-gold-600" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{cat.name}</p>
                      <p className="text-xs text-stone-400">
                        /products?category={cat.slug}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Category"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Curtains"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Image URL (optional)"
            placeholder="https://…"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-5">
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            loading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Category"
        size="sm"
      >
        <p className="text-sm text-stone-600 mb-6">
          Deleting a category will unlink all products from it. This cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
