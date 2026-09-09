"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { getDeliveryZones } from "../services/getDeliveryZones";
import { createDeliveryZone } from "../services/createDeliveryZone";
import { updateDeliveryZone } from "../services/updateDeliveryZone";
import { deleteDeliveryZone } from "../services/deleteDeliveryZone";
import type { DeliveryZone } from "../types/deliveryZone";

export default function DeliverySettings() {
  const { business, loading: businessLoading } = useBusiness();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [freeDelivery, setFreeDelivery] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

 useEffect(() => {
  if (!business?.id) {
    setLoading(false);
    return;
  }

  const businessId: string = business.id;

  async function loadZones() {
    try {
      setLoading(true);

      const data = await getDeliveryZones(businessId);

      setZones(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load delivery zones.");
    } finally {
      setLoading(false);
    }
  }

  loadZones();
}, [business?.id]);

  function resetForm() {
    setLocation("");
    setPrice("");
    setFreeDelivery(false);
    setEditingId(null);
  }

  function startEditing(zone: DeliveryZone) {
    setEditingId(zone.id);
    setLocation(zone.location);
    setPrice(String(zone.price));
    setFreeDelivery(zone.free_delivery);
  }

  async function handleSave() {
    if (!business?.id) {
      toast.error("Business information is unavailable.");
      return;
    }

    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      toast.error("Enter a delivery location.");
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error("Enter a valid delivery price.");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const updatedZone = await updateDeliveryZone({
          id: editingId,
          location: trimmedLocation,
          price: numericPrice,
          freeDelivery,
        });

        setZones((current) =>
          current.map((zone) =>
            zone.id === updatedZone.id ? updatedZone : zone
          )
        );

        toast.success("Delivery zone updated.");
      } else {
        const newZone = await createDeliveryZone({
          location: trimmedLocation,
          price: numericPrice,
          freeDelivery,
        });

        setZones((current) => [...current, newZone]);

        toast.success("Delivery zone added.");
      }

      resetForm();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save delivery zone."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this delivery zone?"
    );

    if (!confirmed) return;

    try {
      await deleteDeliveryZone(id);

      setZones((current) =>
        current.filter((zone) => zone.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      toast.success("Delivery zone deleted.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete delivery zone."
      );
    }
  }

  if (businessLoading || loading) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 space-y-2 sm:mb-6">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded bg-gray-100" />
        </div>

        <div className="mb-5 space-y-3 sm:mb-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
            >
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="h-9 w-16 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-5 sm:pt-6">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200" />

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>

            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />

            <div className="h-11 w-40 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-2 text-xl font-semibold">
          Delivery
        </h2>

        <p className="text-sm text-gray-500">
          Business information is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg font-semibold sm:text-xl">
          Delivery
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Set delivery prices for different locations.
        </p>
      </div>

      {zones.length > 0 && (
        <div className="mb-5 space-y-3 sm:mb-6">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex min-w-0 flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
            >
              <div>
                <p className="font-medium">
                  {zone.location}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {zone.free_delivery
                    ? "Free delivery"
                    : `${zone.price.toLocaleString()} ${business.currency}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEditing(zone)}
                  className="rounded-lg border px-3 py-2 text-sm font-medium sm:px-4 hover:bg-gray-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(zone.id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 sm:px-4 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {zones.length === 0 && (
        <div className="mb-5 rounded-xl border border-dashed p-4 text-center sm:mb-6 sm:p-6">
          <p className="font-medium">
            No delivery zones yet
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Add locations where you deliver.
          </p>
        </div>
      )}

      <div className="border-t pt-5 sm:pt-6">
        <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
          {editingId
            ? "Edit Delivery Zone"
            : "Add Delivery Zone"}
        </h3>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Location
            </label>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nsukka"
              disabled={saving}
              className="w-full max-w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Delivery Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1000"
              disabled={saving || freeDelivery}
              className="w-full max-w-full rounded-xl border p-3 disabled:bg-gray-100"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2 sm:gap-3">
            <input
              type="checkbox"
              checked={freeDelivery}
              onChange={(e) =>
                setFreeDelivery(e.target.checked)
              }
              disabled={saving}
              className="mt-1"
            />

            <span>
              <span className="block font-medium">
                Display as free delivery
              </span>

              <span className="mt-1 block text-sm text-gray-500">
                Customers will see free delivery and will not
                be charged a delivery fee for this location.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50 sm:px-6 sm:text-base"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Delivery Zone"
                : "Add Delivery Zone"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 sm:px-6 sm:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
