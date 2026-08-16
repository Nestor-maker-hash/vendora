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
          businessId: business.id,
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
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">
          Delivery
        </h2>

        <p className="text-sm text-gray-500">
          Loading delivery settings...
        </p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
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
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Delivery
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Set delivery prices for different locations.
        </p>
      </div>

      {zones.length > 0 && (
        <div className="mb-6 space-y-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEditing(zone)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(zone.id)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {zones.length === 0 && (
        <div className="mb-6 rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">
            No delivery zones yet
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Add locations where you deliver.
          </p>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="mb-4 text-lg font-semibold">
          {editingId
            ? "Edit Delivery Zone"
            : "Add Delivery Zone"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Location
            </label>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nsukka"
              disabled={saving}
              className="w-full rounded-xl border p-3"
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
              className="w-full rounded-xl border p-3 disabled:bg-gray-100"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3">
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
              className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition-opacity disabled:opacity-50"
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
                className="rounded-xl border px-6 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
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
