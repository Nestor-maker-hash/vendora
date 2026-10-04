"use client";

import { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Upload } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { uploadProductImage } from "../services/uploadProductImage";
import { updateProduct } from "../services/updateProduct";
import toast from "react-hot-toast";

interface ProductFormProps {
  initialValues?: {
    name: string;
    description?: string | null;
    price: number;
    merchant_price?: number | null;
    stock: number;
    minimum_order_quantity?: number;
    image_url?: string | null;
  };
  productId?: string;
}

export default function ProductForm({
  initialValues,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupFlow = searchParams.get("setup") === "true";

  const { addProduct, loading: creating } = useCreateProduct();
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [price, setPrice] = useState(
    initialValues
      ? String(initialValues.merchant_price ?? initialValues.price)
      : ""
  );
  const [stock, setStock] = useState(
    initialValues ? String(initialValues.stock) : ""
  );
  const [minimumOrderQuantity, setMinimumOrderQuantity] =
    useState(
      initialValues?.minimum_order_quantity !== undefined
        ? String(initialValues.minimum_order_quantity)
        : "1"
    );

  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(
    initialValues?.image_url ?? ""
  );
  const [imagePreview, setImagePreview] = useState(
    initialValues?.image_url ?? ""
  );

  const isSubmitting = creating || updating;

  function handleImageChange(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (productId) setUpdating(true);

    try {
      let activeImageUrl = imageUrl;

      if (image) {
        activeImageUrl = await uploadProductImage(image);
        setImageUrl(activeImageUrl);
      }

      const merchantPrice = Number(price);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: merchantPrice,
        merchant_price: merchantPrice,
        stock: Number(stock),
        minimum_order_quantity: Number(minimumOrderQuantity),
        image_url: activeImageUrl,
      };

      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await addProduct(payload);
      }

      router.push(
        isSetupFlow
          ? "/settings?section=delivery&setup=true"
          : "/products"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message || "Unable to save product."
          : "Unable to save product. Please try again."
      );
    } finally {
      if (productId) setUpdating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
    >
      <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 sm:grid-cols-[120px_minmax(0,1fr)] md:grid-cols-[150px_minmax(0,1fr)]">
        <div>
          {imagePreview ? (
            <Link
              href={`/products/new/image?src=${encodeURIComponent(
                imagePreview
              )}&back=${encodeURIComponent(
                productId
                  ? `/products/${productId}/edit`
                  : "/products/new"
              )}`}
              className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <img
                src={imagePreview}
                alt={name || "Product preview"}
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
                    event.target.files?.[0] ?? null
                  )
                }
              />
            </label>
          )}

          {imagePreview && (
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-200 px-1.5 py-1.5 text-[9px] font-medium text-gray-600 hover:bg-gray-50 sm:px-2 sm:py-2 sm:text-xs">
              <Upload size={12} />
              Change

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleImageChange(
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
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              value={price}
              onChange={(event) => setPrice(event.target.value)}
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
              value={stock}
              onChange={(event) => setStock(event.target.value)}
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
                  stock !== "" && Number(stock) > 0
                    ? "font-medium text-emerald-600"
                    : "font-medium text-gray-500"
                }
              >
                {stock !== "" && Number(stock) > 0
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
              step="1"
              value={minimumOrderQuantity}
              onChange={(event) =>
                setMinimumOrderQuantity(event.target.value)
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
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={2}
              placeholder="Describe this product..."
              className="w-full resize-none rounded-lg border border-gray-300 px-2.5 py-2 text-xs outline-none transition focus:border-emerald-500 sm:px-3 sm:py-2.5 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? productId
                  ? "Saving..."
                  : "Creating..."
                : productId
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
