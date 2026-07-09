"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Star, Package, Upload, ImagePlus, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  category: { name: string };
  images: { url: string; altText?: string }[];
  variants: { stock: number }[];
}

interface Category { id: string; name: string; }

const EMPTY_FORM = {
  name: "", description: "", basePrice: "", material: "",
  categoryId: "", isFeatured: false, isBestSeller: false,
  variants: [{ color: "", size: "", sku: "", priceDelta: "0", stock: "0" }],
};

function useProducts(search: string, page: number) {
  return useQuery({
    queryKey: ["admin", "products", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const { data } = await api.get(`/api/products?${params}`);
      return data;
    },
  });
}

function useCategories() {
  return useQuery<{ categories: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => { const { data } = await api.get("/api/categories"); return data; },
  });
}

// ── Image upload sub-modal ────────────────────────────────────────────────────
function ImageUploadModal({
  productId,
  productName,
  existingImages,
  onClose,
}: {
  productId: string;
  productName: string;
  existingImages: { url: string }[];
  onClose: () => void;
}) {
  const fileRef             = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const queryClient         = useQueryClient();

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newPreviews = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  async function handleUpload() {
    if (!previews.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < previews.length; i++) {
        const formData = new FormData();
        formData.append("image", previews[i].file);
        formData.append("position", String(existingImages.length + i));
        await api.post(`/api/products/${productId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success(`${previews.length} image${previews.length > 1 ? "s" : ""} uploaded`);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      onClose();
    } catch {
      toast.error("Failed to upload images. Make sure Cloudinary is configured.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Images — ${productName}`} size="lg">
      <div className="space-y-5">

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
              Current Images
            </p>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
                  <Image src={img.url} alt={`Image ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-stone-300 hover:border-gold-400 rounded-2xl p-8 text-center cursor-pointer transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <ImagePlus size={28} className="text-stone-400 mx-auto mb-2" />
          <p className="text-sm text-stone-600 font-medium">Click or drag images here</p>
          <p className="text-xs text-stone-400 mt-1">JPG, PNG, WebP — multiple files allowed</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
              Ready to Upload ({previews.length})
            </p>
            <div className="flex gap-2 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 group">
                  <Image src={p.url} alt="" fill className="object-cover" />
                  <button
                    onClick={() => setPreviews((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            icon={<Upload size={14} />}
            loading={uploading}
            disabled={!previews.length}
            onClick={handleUpload}
          >
            Upload {previews.length > 0 ? `${previews.length} Image${previews.length > 1 ? "s" : ""}` : "Images"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [imageProduct, setImageProduct] = useState<Product | null>(null);

  const queryClient               = useQueryClient();
  const { data, isLoading }       = useProducts(search, page);
  const { data: catData }         = useCategories();
  const categories                = catData?.categories ?? [];
  const products: Product[]       = data?.items ?? [];
  const pagination                = data?.pagination;

  const saveMutation = useMutation({
    mutationFn: async (body: typeof EMPTY_FORM) => {
      const payload = {
        ...body,
        basePrice: Number(body.basePrice),
        variants: body.variants.map((v) => ({
          ...v,
          priceDelta: Number(v.priceDelta),
          stock: Number(v.stock),
        })),
      };
      if (editId) {
        await api.patch(`/api/products/${editId}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success(editId ? "Product updated" : "Product created — you can now add images");
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditId(null);
    },
    onError: () => toast.error("Failed to save product"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete product"),
  });

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }

  function openEdit(p: Product) {
    setForm({
      name: p.name, description: "", basePrice: String(p.basePrice),
      material: "", categoryId: "",
      isFeatured: p.isFeatured, isBestSeller: p.isBestSeller,
      variants: [{ color: "", size: "", sku: "", priceDelta: "0", stock: "0" }],
    });
    setEditId(p.id);
    setShowModal(true);
  }

  const totalStock = (variants: { stock: number }[]) =>
    variants.reduce((s, v) => s + v.stock, 0);

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-display">Products</h1>
          <p className="text-sm text-stone-500 mt-0.5">{pagination?.total ?? 0} listings</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>Add Product</Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search size={14} />}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["Product","Category","Price","Stock","Rating","Tags","Images","Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-stone-500 px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Package size={32} className="text-stone-300 mx-auto mb-2" />
                      <p className="text-sm text-stone-400">No products found</p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          {p.images[0] ? (
                            <Image
                              src={p.images[0].url}
                              alt={p.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                              <Package size={14} className="text-stone-400" />
                            </div>
                          )}
                          <p className="font-medium text-stone-800 max-w-[180px] truncate">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-stone-600 text-xs">{p.category.name}</td>
                      <td className="px-5 py-3.5 font-semibold text-stone-800">
                        {formatCurrency(Number(p.basePrice))}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={totalStock(p.variants) === 0 ? "text-red-500 text-sm" : "text-stone-700 text-sm"}>
                          {totalStock(p.variants)} units
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-gold-500 fill-gold-400" />
                          <span className="text-stone-700 text-sm">{Number(p.rating).toFixed(1)}</span>
                          <span className="text-stone-400 text-xs">({p.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {p.isFeatured   && <Badge variant="gold">Featured</Badge>}
                          {p.isBestSeller && <Badge variant="success">Best Seller</Badge>}
                        </div>
                      </td>

                      {/* Images column */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setImageProduct(p)}
                          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-gold-600 transition-colors"
                        >
                          <ImagePlus size={14} />
                          <span>{p.images.length} photo{p.images.length !== 1 ? "s" : ""}</span>
                        </button>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            title="Edit product"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100">
              <p className="text-xs text-stone-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === pagination.totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditId(null); }}
        title={editId ? "Edit Product" : "New Product"}
        size="xl"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name"
              placeholder="e.g. Cream Blackout Curtains"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={[
                { value: "", label: "Select category…" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the product…"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Price (KES)"
              type="number"
              placeholder="0"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            />
            <Input
              label="Material"
              placeholder="e.g. 100% Cotton"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-gold-500"
              />
              <span className="text-sm text-stone-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                className="w-4 h-4 accent-gold-500"
              />
              <span className="text-sm text-stone-700">Best Seller</span>
            </label>
          </div>

          {/* Variants */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Variants</p>
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                <Input placeholder="Color" value={v.color}
                  onChange={(e) => { const vs = [...form.variants]; vs[i].color = e.target.value; setForm({ ...form, variants: vs }); }} />
                <Input placeholder="Size" value={v.size}
                  onChange={(e) => { const vs = [...form.variants]; vs[i].size = e.target.value; setForm({ ...form, variants: vs }); }} />
                <Input placeholder="SKU" value={v.sku}
                  onChange={(e) => { const vs = [...form.variants]; vs[i].sku = e.target.value; setForm({ ...form, variants: vs }); }} />
                <Input placeholder="Price +" type="number" value={v.priceDelta}
                  onChange={(e) => { const vs = [...form.variants]; vs[i].priceDelta = e.target.value; setForm({ ...form, variants: vs }); }} />
                <Input placeholder="Stock" type="number" value={v.stock}
                  onChange={(e) => { const vs = [...form.variants]; vs[i].stock = e.target.value; setForm({ ...form, variants: vs }); }} />
              </div>
            ))}
            <button
              onClick={() => setForm({ ...form, variants: [...form.variants, { color: "", size: "", sku: "", priceDelta: "0", stock: "0" }] })}
              className="text-xs text-gold-600 hover:text-gold-700 font-medium"
            >
              + Add variant
            </button>
          </div>

          {!editId && (
            <p className="text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2">
              💡 After creating the product, click the photo icon in the table to upload product images.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 mt-4">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
            {editId ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </Modal>

      {/* Image Upload Modal */}
      {imageProduct && (
        <ImageUploadModal
          productId={imageProduct.id}
          productName={imageProduct.name}
          existingImages={imageProduct.images}
          onClose={() => setImageProduct(null)}
        />
      )}

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <p className="text-sm text-stone-600 mb-6">
          This permanently deletes the product and all its variants. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}