import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import ProductForm from "@/src/features/products/components/ProductForm";

export default function NewProductPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="max-w-xl">
          <h1 className="mb-6 text-3xl font-bold">
            Add Product
          </h1>

          <ProductForm />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
