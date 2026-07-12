import { getBusinessBySlug } from "@/src/features/business/services/getBusinessBySlug";
import { getProductsByBusiness } from "@/src/features/products/services/getProductsByBusiness";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;

  try {
    const business = await getBusinessBySlug(slug);
    const products = await getProductsByBusiness(business.id);

    return (
      <main className="mx-auto max-w-7xl p-6">
        <header className="mb-10">
          <h1 className="text-4xl font-bold">
            {business.name}
          </h1>

          <p className="mt-2 text-gray-600">
            {business.description}
          </p>
        </header>

        {products.length === 0 ? (
          <div className="rounded-xl border p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No Products Yet
            </h2>

            <p className="mt-3 text-gray-500">
              This store hasn't added any products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100">
                    No Image
                  </div>
                )}

                <div className="p-4">
                  <h2 className="font-semibold">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-xl font-bold text-emerald-600">
                    ₦{product.price.toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of Stock"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  } catch {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-3xl font-bold">
          Store Not Found
        </h1>

        <p className="mt-2 text-gray-500">
          This store does not exist.
        </p>
      </main>
    );
  }
}
