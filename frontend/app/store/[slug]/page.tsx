import { getBusinessBySlug } from "@/src/features/business/services/getBusinessBySlug";
import { getProductsByBusiness } from "@/src/features/products/services/getProductsByBusiness";
import StorePageClient from "@/src/components/store/StorePageClient";
import { getStorefrontProductLimit } from "@/src/features/subscriptions/services/getStorefrontProductLimit";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;

  try {
    const business = await getBusinessBySlug(slug);

    const [
      products,
      storefrontSettings,
    ] = await Promise.all([
      getProductsByBusiness(business.id),
      getStorefrontProductLimit(business.id),
    ]);

    return (
      <StorePageClient
        slug={slug}
        business={business}
        products={products}
        productLimit={storefrontSettings.productLimit}
        lockOverLimitProducts={
          storefrontSettings.lockOverLimitProducts
        }
      />
    );
  } catch {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-5xl p-8">
          <h1 className="text-3xl font-bold">
            Store Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            This store does not exist.
          </p>
        </main>
      </div>
    );
  }
}
