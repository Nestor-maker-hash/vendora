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
    return <p>Loading...</p>;
  }

  if (!business) {
    return (
      <p className="text-gray-500">
        Business information could not be loaded.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Logo */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">
          Store Logo
        </h2>

        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="mb-4 h-24 w-24 rounded-full object-cover"
          />
        )}

        <input
          type="file"
          accept="image/*"
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
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">
          Store Banner
        </h2>

        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Banner"
            className="mb-4 h-40 w-full rounded-xl object-cover"
          />
        )}

        <input
          type="file"
          accept="image/*"
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
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">
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
              className="w-full rounded-xl border p-3"
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
              className="w-full rounded-xl border p-3"
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
              className="w-full rounded-xl border p-3"
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
              className="w-full rounded-xl border p-3"
              disabled={saving}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition-opacity hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Storefront"}
          </button>
        </div>
      </div>
    </div>
  );
}
