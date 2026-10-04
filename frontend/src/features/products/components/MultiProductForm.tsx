"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Plus, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { uploadProductImage } from "../services/uploadProductImage";
import { createProduct } from "../services/createProduct";
import {
  clearProductDraft,
  loadProductDraft,
  saveProductDraft,
} from "../services/productDraftStorage";

interface ProductDraft {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  minimumOrderQuantity: string;
  image: File | null;
  imagePreview: string;
}

interface StoredProductDraft {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  minimumOrderQuantity: string;
  image: File | null;
}

function createDraft(file?: File): ProductDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    price: "",
    stock: "",
    minimumOrderQuantity: "1",
    image: file ?? null,
    imagePreview: file ? URL.createObjectURL(file) : "",
  };
}

function serializeProducts(
  products: ProductDraft[]
): StoredProductDraft[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    minimumOrderQuantity: product.minimumOrderQuantity,
    image: product.image,
  }));
}

function restoreProducts(
  stored: StoredProductDraft[]
): ProductDraft[] {
  return stored.map((product) => ({
    ...product,
    imagePreview: product.image
      ? URL.createObjectURL(product.image)
      : "",
  }));
}

export default function MultiProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restoreDraft() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted || !user) {
          setHydrated(true);
          return;
        }

        setUserId(user.id);

        const stored = await loadProductDraft(user.id);

        if (
          mounted &&
          Array.isArray(stored) &&
          stored.length > 0
        ) {
          const restored = restoreProducts(
            stored as StoredProductDraft[]
          );

          setProducts(restored);
          setHasSavedDraft(true);
        }
      } catch (error) {
        console.error("Unable to restore product draft:", error);
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    }

    restoreDraft();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !userId) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    if (!products.length) {
      void clearProductDraft(userId);
      setHasSavedDraft(false);
      return;
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveProductDraft(
          userId,
          serializeProducts(products)
        );
        setHasSavedDraft(true);
      } catch (error) {
        console.error("Unable to save product draft:", error);
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [products, hydrated, userId]);

  function handleFilesSelected(files: FileList | null) {
    if (!files?.length) return;

    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!selectedFiles.length) {
      toast.error("Please select image files.");
      return;
    }

    setProducts((current) => [
      ...current,
      ...selectedFiles.map((file) => createDraft(file)),
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateProduct(
    id: string,
    field: keyof ProductDraft,
    value: string | File | null
  ) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, [field]: value }
          : product
      )
    );
  }

  function handleImageChange(id: string, file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setProducts((current) =>
      current.map((product) => {
        if (product.id !== id) return product;

        if (product.imagePreview) {
          URL.revokeObjectURL(product.imagePreview);
        }

        return {
          ...product,
          image: file,
          imagePreview: URL.createObjectURL(file),
        };
      })
    );
  }

  function removeProduct(id: string) {
    setProducts((current) => {
      const product = current.find((item) => item.id === id);

      if (product?.imagePreview) {
        URL.revokeObjectURL(product.imagePreview);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  async function discardDraft() {
    if (!userId) {
      setProducts([]);
      return;
    }

    products.forEach((product) => {
      if (product.imagePreview) {
        URL.revokeObjectURL(product.imagePreview);
      }
    });

    await clearProductDraft(userId);
    setProducts([]);
    setHasSavedDraft(false);

    toast.success("Saved draft discarded.");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    if (!products.length) {
      toast.error("Select at least one product image.");
      return;
    }

    for (const product of products) {
      if (!product.name.trim()) {
        toast.error("Every product needs a name.");
        return;
      }

      if (!product.price || Number(product.price) < 0) {
        toast.error(
          `Enter a valid price for ${product.name || "the product"}.`
        );
        return;
      }

      if (product.stock === "" || Number(product.stock) < 0) {
        toast.error(
          `Enter valid stock for ${product.name || "the product"}.`
        );
        return;
      }

      if (
        !product.minimumOrderQuantity ||
        Number(product.minimumOrderQuantity) < 1
      ) {
        toast.error(
          `Minimum order quantity must be at least 1 for ${
            product.name || "the product"
          }.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      for (const product of products) {
        let imageUrl = "";

        if (product.image) {
          imageUrl = await uploadProductImage(product.image);
        }

        await createProduct({
          name: product.name.trim(),
          description: product.description.trim(),
          price: Number(product.price),
          stock: Number(product.stock),
          minimum_order_quantity: Number(
            product.minimumOrderQuantity
          ),
          image_url: imageUrl,
        });
      }

      if (userId) {
        await clearProductDraft(userId);
      }

      toast.success(
        products.length === 1
          ? "Product created successfully."
          : `${products.length} products created successfully.`
      );

      router.push("/products");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create products."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          Restoring your product draft...
        </p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ImageIcon size={30} />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            Select your products
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            Select multiple product images at once. Vendora will
            create a separate product form for each image.
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            <Upload size={17} />
            Select Product Images

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) =>
                handleFilesSelected(event.target.files)
              }
            />
          </label>

          <p className="mt-3 text-xs text-gray-400">
            You can select one or many images.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"} selected
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {hasSavedDraft
              ? "Your changes are being saved automatically."
              : "Complete each product before creating them."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
            <Plus size={14} />
            Add more

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) =>
                handleFilesSelected(event.target.files)
              }
            />
          </label>

          <button
            type="button"
            onClick={() => void discardDraft()}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            Discard draft
          </button>
        </div>
      </div>

      {products.map((product, index) => (
        <div
          key={product.id}
          className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Product {index + 1}
            </p>

            <button
              type="button"
              onClick={() => removeProduct(product.id)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <X size={14} />
              Remove
            </button>
          </div>

          <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 sm:grid-cols-[120px_minmax(0,1fr)] md:grid-cols-[150px_minmax(0,1fr)]">
            <div>
              {product.imagePreview ? (
                <Link
                  href={`/products/new/image?src=${encodeURIComponent(
                    product.imagePreview
                  )}`}
                  className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                >
                  <img
                    src={product.imagePreview}
                    alt={product.name || `Product ${index + 1}`}
                    className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                  />

                  <span className="absolute inset-x-1 bottom-1 rounded bg-black/65 px-1 py-1 text-center text-[9px] font-medium text-white opacity-0 transition group-hover:opacity-100 sm:inset-x-2 sm:bottom-2 sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-[11px]">
                    View full image
                  </span>
                </Link>
              ) : (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-emerald-400 hover:bg-emerald-50">
                  <ImageIcon size={24} />
                  <span className="mt-1 text-[9px] font-medium sm:text-xs">
                    Choose image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleImageChange(
                        product.id,
                        event.target.files?.[0] ?? null
                      )
                    }
                  />
                </label>
              )}

              {product.imagePreview && (
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-200 px-1.5 py-1.5 text-[9px] font-medium text-gray-600 hover:bg-gray-50 sm:px-2 sm:py-2 sm:text-xs">
                  <Upload size={12} />
                  Change

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleImageChange(
                        product.id,
                        event.target.files?.[0] ?? null
                      )
                    }
                  />
                </label>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] font-medium text-gray-600 sm:text-xs">
                  Product Name
                </label>

                <input
                  value={product.name}
                  onChange={(event) =>
                    updateProduct(
                      product.id,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Black Hoodie"
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs outline-none transition focus:border-emerald-500 sm:px-3 sm:py-2.5 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-gray-600 sm:text-xs">
                  Your Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={(event) =>
                    updateProduct(
                      product.id,
                      "price",
                      event.target.value
                    )
                  }
                  placeholder="₦5000"
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs outline-none transition focus:border-emerald-500 sm:px-3 sm:py-2.5 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-gray-600 sm:text-xs">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(event) =>
                    updateProduct(
                      product.id,
                      "stock",
                      event.target.value
                    )
                  }
                  placeholder="20"
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs outline-none transition focus:border-emerald-500 sm:px-3 sm:py-2.5 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-gray-600 sm:text-xs">
                  Availability
                </label>

                <div className="flex h-[34px] items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs sm:h-[42px] sm:px-3 sm:text-sm">
                  <span
                    className={
                      product.stock !== "" &&
                      Number(product.stock) > 0
                        ? "font-medium text-emerald-600"
                        : "font-medium text-gray-500"
                    }
                  >
                    {product.stock !== "" &&
                    Number(product.stock) > 0
                      ? "In stock"
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-medium text-gray-600 sm:text-xs">
                  Minimum Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={product.minimumOrderQuantity}
                  onChange={(event) =>
                    updateProduct(
                      product.id,
                      "minimumOrderQuantity",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs outline-none transition focus:border-emerald-500 sm:px-3 sm:py-2.5 sm:text-sm"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] font-medium text-gray-600 sm:text-xs">
                  Description
                </label>

                <textarea
                  value={product.description}
                  onChange={(event) =>
                    updateProduct(
                      product.id,
                      "description",
                      event.target.value
                    )
                  }
                  rows={2}
                  placeholder="Describe this product..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-2.5 py-2 text-xs outline-none transition focus:border-emerald-500 sm:px-3 sm:py-2.5 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <Plus size={16} />
          Add More Products

          <input
            type="file"
            accept="image/*"
      multiple
            className="hidden"
            onChange={(event) =>
              handleFilesSelected(event.target.files)
            }
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Creating products..."
            : products.length === 1
              ? "Create Product"
              : `Create ${products.length} Products`}
        </button>
      </div>
    </form>
  );
}
