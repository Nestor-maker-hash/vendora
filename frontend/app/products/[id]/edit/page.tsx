"use client";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";

export default function EditProductPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-3xl font-bold">
            Edit Product
          </h1>

          <p className="text-gray-500">
            Product editing coming next...
          </p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
