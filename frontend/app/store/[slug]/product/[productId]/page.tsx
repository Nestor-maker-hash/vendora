import Link from "next/link";
import { getProductById } from "@/src/features/products/services/getProductById";
import ProductDetails from "@/src/features/products/components/ProductDetails";
import StoreNavbar from "@/src/components/store/StoreNavbar";
import { getBusinessBySlug } from "@/src/features/business/services/getBusinessBySlug";

interface Props {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
}

export default async function ProductPage({
  params,
}: Props) {
  const { slug, productId } = await params;                                             
  const product = await getProductById(productId);
  const business = await getBusinessBySlug(slug);

  if (!product) {
    return (                                                                                  <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold">
          Product not found
        </h1>
      </main>
    );
  }


return (
<>
<StoreNavbar
  business={business}
  storeName={slug}
  storeHref={`/store/${slug}`}
/>

  <main className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <Link
        href={`/store/${slug}`}
        className="mb-6 inline-flex items-center text-emerald-600 font-medium hover:underline"
      >
        ← Back to Store
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
	      className="h-90 w-full object-cover lg:h-[520px]"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
<ProductDetails
  product={product}
  slug={slug}
  currency={business.currency}
/>

      </div>
    </div>
  </main>
</>
);
}
