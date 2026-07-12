"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { uploadProductImage } from "../services/uploadProductImage";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";

export default function ProductForm() {
  const router = useRouter();
  const { addProduct, loading } = useCreateProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      let imageUrl: string | undefined;

      if (image) {
        imageUrl = await uploadProductImage(image);
      }

      await addProduct({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        image_url: imageUrl,
      });

      router.push("/products");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(JSON.stringify(error));
      }
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
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Product Image
        </label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3"
      >
        {loading ? "Creating..." : "Create Product"}
      </Button>
    </form>
  );
}

