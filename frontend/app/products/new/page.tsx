import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import MultiProductForm from "@/src/features/products/components/MultiProductForm";

export default function NewProductPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
            Add Products
          </h1>

          <p className="mb-6 text-sm text-gray-500">
            Add one or multiple products at once.
          </p>

          <MultiProductForm />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
