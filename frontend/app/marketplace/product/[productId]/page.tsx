import MarketplaceNavbar from "@/src/features/marketplace/components/MarketplaceNavbar";
import MarketplaceProductDetails from "@/src/features/marketplace/components/MarketplaceProductDetails";
import { getMarketplaceProduct } from "@/src/features/marketplace/services/getMarketplaceProduct";
import { getMarketplaceProducts } from "@/src/features/marketplace/services/getMarketplaceProducts";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export default async function MarketplaceProductPage({
  params,
}: Props) {
  const { productId } = await params;

  const product = await getMarketplaceProduct(productId);

  if (!product) {
    return (
      <>
        <MarketplaceNavbar />

        <main className="min-h-screen bg-slate-50 px-4 py-16">
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-950">
              Product not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This product may have been removed, sold out, or is
              no longer available on the marketplace.
            </p>
          </div>
        </main>
      </>
    );
  }

  const relatedProducts = await getMarketplaceProducts({
    businessId: product.business_id,
    excludeProductId: product.id,
    limit: 2,
  });

  return (
    <>
      <MarketplaceNavbar />

      <MarketplaceProductDetails
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
