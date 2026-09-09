"use client";

import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { useEffect, useState } from "react";
import { updateBusiness } from "@/src/features/business/services/updateBusiness";
import { uploadBusinessImage } from "@/src/features/business/services/uploadBusinessImage";
import toast from "react-hot-toast";

export default function StorefrontSettings() {
  const { business, loading } = useBusiness();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) return;

    setName(business.name ?? "");
    setSlug(business.slug ?? "");
    setDescription(business.description ?? "");
    setLogoUrl(business.logo_url ?? "");
    setBannerUrl(business.banner_url ?? "");
    setPhone(business.phone ?? "");
  }, [business]);

  async function handleSave() {
    if (!business) return;

    try {
      setSaving(true);

      await updateBusiness({
        id: business.id,
        name,
        slug,
        phone,
        description,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      });

      toast.success("Storefront updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update storefront");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-w-0 space-y-4 sm:space-y-6">
        {/* Store Logo skeleton */}
        <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <div className="mb-4 h-6 w-28 animate-pulse rounded bg-gray-200 sm:mb-6" />

          <div className="mb-3 h-20 w-20 animate-pulse rounded-full bg-gray-100 sm:mb-4 sm:h-24 sm:w-24" />

          <div className="h-10 w-full max-w-full animate-pulse rounded-xl bg-gray-100" />
        </div>

        {/* Store Information skeleton */}
        <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200 sm:mb-6" />

          <div className="space-y-4 sm:space-y-5">
            <div>
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>

            <div>
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>

            <div>
              <div className="mb-2 h-4 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-24 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>

            <div>
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>

            <div className="h-11 w-40 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <p className="text-gray-500">
        Business information could not be loaded.
      </p>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      {/* Store Logo */}
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
          Store Logo
        </h2>

        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="mb-3 h-20 w-20 rounded-full object-cover sm:mb-4 sm:h-24 sm:w-24"
          />
        )}

        <input
          type="file"
          accept="image/*"
          className="block max-w-full text-sm"
          disabled={saving}
          onChange={async (e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            try {
              const url = await uploadBusinessImage(
                file,
                "logos"
              );

              setLogoUrl(url);

              toast.success("Logo uploaded");
            } catch (err) {
              console.error(err);
              toast.error("Upload failed");
            }
          }}
        />
      </div>

      {/* Store Banner */}
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
          Store Banner
        </h2>

        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Banner"
            className="mb-3 h-32 w-full max-w-full rounded-xl object-cover sm:mb-4 sm:h-40"
          />
        )}

        <input
          type="file"
          accept="image/*"
          className="block max-w-full text-sm"
          disabled={saving}
          onChange={async (e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            try {
              const url = await uploadBusinessImage(
                file,
                "banners"
              );

              setBannerUrl(url);

              toast.success("Banner uploaded");
            } catch (err) {
              console.error(err);
              toast.error("Upload failed");
            }
          }}
        />
      </div>

      {/* Business Information */}
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
          Business Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Business Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Store Slug
            </label>

            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              WhatsApp Number
            </label>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2348012345678"
              className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
              disabled={saving}
            />

            <p className="mt-1 text-xs text-gray-500">
              Used for the Contact Seller button and order
              notifications.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
              disabled={saving}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white sm:w-auto sm:rounded-xl sm:px-6 sm:py-3 sm:text-base transition-opacity hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Storefront"}
          </button>
        </div>
      </div>
    </div>
  );
}
