"use client";

import { X, MessageCircle, Mail, MapPin } from "lucide-react";
import { formatBusinessLocation } from "@/src/lib/formatBusinessLocation";

interface Business {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  logo_url?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  business: Business;
}

export default function ContactSellerModal({
  open,
  onClose,
  business,
}: Props) {
  if (!open) return null;

const whatsappLink = business.phone
  ? `https://wa.me/${business.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      "Hi from your Vendora store! I'm interested in one of your products."
    )}`
  : null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-black/50"
      />

      <div className="fixed bottom-0 left-0 right-0 z-[100] rounded-t-3xl bg-white p-6 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-4">

            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                {business.name.charAt(0)}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold">
                {business.name}
              </h2>

              <p className="text-sm text-gray-500">
                Contact Seller
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>

        </div>

        <div className="space-y-4">

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border p-4 transition hover:bg-emerald-50"
            >
              <MessageCircle className="text-emerald-600" />

              <div>
                <p className="font-semibold">
                  Chat on WhatsApp
                </p>

                <p className="text-sm text-gray-500">
		{business.phone}
                </p>
              </div>
            </a>
          )}

          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-4 rounded-2xl border p-4 transition hover:bg-gray-50"
            >
              <Mail />

              <div>
                <p className="font-semibold">
                  Email Seller
                </p>

                <p className="text-sm text-gray-500">
                  {business.email}
                </p>
              </div>
            </a>
          )}

          {formatBusinessLocation(business) && (
            <div className="flex items-center gap-4 rounded-2xl border p-4">
              <MapPin />

              <div>
                <p className="font-semibold">
                  Store Location
                </p>

                <p className="text-sm text-gray-500">
                  {formatBusinessLocation(business)}
                </p>
              </div>
            </div>
          )}

        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Powered by <span className="font-semibold">Vendora</span>
        </p>

      </div>
    </>
  );
}
