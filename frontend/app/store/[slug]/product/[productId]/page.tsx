import Link from "next/link";

import { getProductById } from "@/src/features/products/services/getProductById";
import ProductDetails from "@/src/features/products/components/ProductDetails";
import StoreNavbar from "@/src/components/store/StoreNavbar";
import { getBusinessBySlug } from "@/src/features/business/services/getBusinessBySlug";
import { getStorefrontProductAccess } from "@/src/features/subscriptions/services/getStorefrontProductAccess";

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

  const [product, business] = await Promise.all([
    getProductById(productId),
    getBusinessBySlug(slug),
  ]);

  if (!product || product.business_id !== business.id) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl p-6">
          <h1 className="text-2xl font-bold">
            Product not found
          </h1>
        </div>
      </main>
    );
  }

  const productAccess =
    await getStorefrontProductAccess(
      business.id,
      product.id
    );

  if (!productAccess.allowed) {
    return (
      <>
        <StoreNavbar
          business={business}
          storeName={business.name}
          storeHref={`/store/${slug}`}
        />

        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-5xl p-6">
            <Link
              href={`/store/${slug}`}
              className="inline-flex items-center font-medium text-emerald-600 hover:underline"
            >
              ← Back to Store
            </Link>

            <div className="mt-6 rounded-2xl border bg-white p-10 text-center shadow-sm">
              <h1 className="text-2xl font-bold">
                Product currently unavailable
              </h1>

              <p className="mt-3 text-gray-500">
                This product is temporarily unavailable.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StoreNavbar
        business={business}
        storeName={business.name}
        storeHref={`/store/${slug}`}
      />

      <main className="min-h-screen bg-gray-50 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <Link
            href={`/store/${slug}`}
            className="mb-6 inline-flex items-center font-medium text-emerald-600 hover:underline"
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
