"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { uploadProductImage } from "../services/uploadProductImage";
import { updateProduct } from "../services/updateProduct";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import toast from "react-hot-toast";

// Step 1: Component Interface Definition
interface ProductFormProps {
  initialValues?: {
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    image_url?: string | null;
  };
  productId?: string;
}

export default function ProductForm({ initialValues, productId }: ProductFormProps) {
  const router = useRouter();
  const { addProduct, loading: creating } = useCreateProduct();
  const [updating, setUpdating] = useState(false);

  // Step 2: Initialize State from Props
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [price, setPrice] = useState(initialValues ? String(initialValues.price) : "");
  const [stock, setStock] = useState(initialValues ? String(initialValues.stock) : "");
  
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url ?? "");

  const isSubmitting = creating || updating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (productId) setUpdating(true);

    try {
      // Step 3: Check for new image uploads first
      let activeImageUrl = imageUrl;

      if (image) {
        const uploadedUrl = await uploadProductImage(image);
        setImageUrl(uploadedUrl);
        activeImageUrl = uploadedUrl;
      }

      const payload = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        image_url: activeImageUrl,
      };

      // Direct submission path depending on presence of a productId
      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await addProduct(payload);
      }

      router.push("/products");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
  toast.error(error.message || "Unable to save product.");
} else {
  toast.error("Unable to save product. Please try again.");
}
    } finally {
      if (productId) setUpdating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl bg-white p-6 shadow"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Product Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Black Hoodie"
          className="w-full rounded-lg border p-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>
        <textarea
          className="w-full rounded-lg border p-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Price
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="₦5000"
          className="w-full rounded-lg border p-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Stock
        </label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="20"
          className="w-full rounded-lg border p-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Product Image
        </label>
        {imageUrl && !image && (
          <div className="mb-2 text-xs text-gray-500">
            Current image saved. Choose a new file to change it.
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3"
      >
        {isSubmitting 
          ? (productId ? "Saving..." : "Creating...") 
          : (productId ? "Save Changes" : "Create Product")
        }
      </Button>
    </form>
  );
}

