"use client";

import { useState } from "react";
import { Pencil, Power, X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number | null;
  storage_gb: number;
  max_products: number | null;
  max_orders_per_month: number | null;
  max_customers: number | null;
  max_delivery_zones: number | null;
  max_staff: number;
  custom_domain: boolean;
  analytics: boolean;
  priority_support: boolean;
  api_access: boolean;
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
}

export default function ImmortalPlansManager({
  initialPlans,
}: {
  initialPlans: Plan[];
}) {
  const [plans, setPlans] =
    useState<Plan[]>(initialPlans);

  const [editingPlan, setEditingPlan] =
    useState<Plan | null>(null);

  const [saving, setSaving] = useState(false);

  async function updatePlan(
    values: Partial<Plan>
  ) {
    if (!editingPlan) return;

    setSaving(true);

    try {
      const response = await fetch(
        "/api/immortal/subscription-plans",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingPlan.id,
            ...values,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "Failed to update subscription plan."
        );
      }

      setPlans((current) =>
        current.map((plan) =>
          plan.id === result.plan.id
            ? result.plan
            : plan
        )
      );

      setEditingPlan(null);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update subscription plan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: Plan) {
    setSaving(true);

    try {
      const response = await fetch(
        "/api/immortal/subscription-plans",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: plan.id,
            is_active: !plan.is_active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "Failed to update subscription plan."
        );
      }

      setPlans((current) =>
        current.map((item) =>
          item.id === result.plan.id
            ? result.plan
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update subscription plan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Subscription Plans
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage the plans available across Vendora.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Monthly</th>
                  <th className="px-6 py-4">Yearly</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-white">
                        {plan.name}
                      </p>

                      <p className="mt-1 max-w-sm text-xs text-slate-500">
                        {plan.description ?? "No description"}
                      </p>
                    </td>

                    <td className="px-6 py-5 font-semibold text-white">
                      ₦{Number(
                        plan.monthly_price
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-400">
                      {plan.yearly_price === null
                        ? "—"
                        : `₦${Number(
                            plan.yearly_price
                          ).toLocaleString()}`}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          plan.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {plan.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-400">
                        {plan.is_public
                          ? "Public"
                          : "Private"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingPlan(plan)
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                          title="Edit plan"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            toggleActive(plan)
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                          title={
                            plan.is_active
                              ? "Deactivate plan"
                              : "Activate plan"
                          }
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {editingPlan && (
        <PlanEditor
          plan={editingPlan}
          saving={saving}
          onClose={() =>
            !saving && setEditingPlan(null)
          }
          onSave={updatePlan}
        />
      )}
    </>
  );
}

function PlanEditor({
  plan,
  saving,
  onClose,
  onSave,
}: {
  plan: Plan;
  saving: boolean;
  onClose: () => void;
  onSave: (values: Partial<Plan>) => void;
}) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] =
    useState(plan.description ?? "");

  const [monthlyPrice, setMonthlyPrice] =
    useState(String(plan.monthly_price));

  const [yearlyPrice, setYearlyPrice] =
    useState(
      plan.yearly_price === null
        ? ""
        : String(plan.yearly_price)
    );

  const [maxProducts, setMaxProducts] =
    useState(
      plan.max_products === null
        ? ""
        : String(plan.max_products)
    );

  const [maxOrders, setMaxOrders] =
    useState(
      plan.max_orders_per_month === null
        ? ""
        : String(plan.max_orders_per_month)
    );

  const [maxCustomers, setMaxCustomers] =
    useState(
      plan.max_customers === null
        ? ""
        : String(plan.max_customers)
    );

  const [maxDeliveryZones, setMaxDeliveryZones] =
    useState(
      plan.max_delivery_zones === null
        ? ""
        : String(plan.max_delivery_zones)
    );

  const [maxStaff, setMaxStaff] =
    useState(
      plan.max_staff === null
        ? ""
        : String(plan.max_staff)
    );

  const [storageGb, setStorageGb] =
    useState(String(plan.storage_gb));

  const [customDomain, setCustomDomain] =
    useState(plan.custom_domain);

  const [analytics, setAnalytics] =
    useState(plan.analytics);

  const [prioritySupport, setPrioritySupport] =
    useState(plan.priority_support);

  const [apiAccess, setApiAccess] =
    useState(plan.api_access);

  const [sortOrder, setSortOrder] =
    useState(String(plan.sort_order));

  const [isPublic, setIsPublic] =
    useState(plan.is_public);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h3 className="font-semibold text-white">
              Edit {plan.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Update plan configuration.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Plan Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Monthly Price
              </label>

              <input
                type="number"
                min="0"
                value={monthlyPrice}
                onChange={(e) =>
                  setMonthlyPrice(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Yearly Price
              </label>

              <input
                type="number"
                min="0"
                value={yearlyPrice}
                onChange={(e) =>
                  setYearlyPrice(e.target.value)
                }
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">
              Plan Limits
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              Leave a limit empty to make it unlimited.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <PlanNumberField
                label="Product Limit"
                value={maxProducts}
                onChange={setMaxProducts}
                placeholder="Unlimited"
              />

              <PlanNumberField
                label="Orders Per Month"
                value={maxOrders}
                onChange={setMaxOrders}
                placeholder="Unlimited"
              />

              <PlanNumberField
                label="Customer Limit"
                value={maxCustomers}
                onChange={setMaxCustomers}
                placeholder="Unlimited"
              />

              <PlanNumberField
                label="Delivery Zones"
                value={maxDeliveryZones}
                onChange={setMaxDeliveryZones}
                placeholder="Unlimited"
              />

              <PlanNumberField
                label="Staff Limit"
                value={maxStaff}
                onChange={setMaxStaff}
                placeholder="Unlimited"
              />

              <PlanNumberField
                label="Storage (GB)"
                value={storageGb}
                onChange={setStorageGb}
                placeholder="0"
                allowDecimal
              />

              <PlanNumberField
                label="Sort Order"
                value={sortOrder}
                onChange={setSortOrder}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">
              Plan Features
            </h4>

            <div className="mt-4 space-y-3">
              <PlanToggle
                label="Custom Domain"
                description="Allow merchants to connect a custom domain."
                checked={customDomain}
                onChange={setCustomDomain}
              />

              <PlanToggle
                label="Analytics"
                description="Give merchants access to analytics features."
                checked={analytics}
                onChange={setAnalytics}
              />

              <PlanToggle
                label="Priority Support"
                description="Mark merchants on this plan for priority support."
                checked={prioritySupport}
                onChange={setPrioritySupport}
              />

              <PlanToggle
                label="API Access"
                description="Allow merchants to access the Vendora API."
                checked={apiAccess}
                onChange={setApiAccess}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div>
              <p className="text-sm font-medium text-white">
                Public Plan
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Merchants can see and select this plan.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) =>
                setIsPublic(e.target.checked)
              }
              className="h-4 w-4"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={() =>
              onSave({
                name: name.trim(),
                description:
                  description.trim() || null,
                monthly_price: Number(
                  monthlyPrice || 0
                ),
                yearly_price:
                  yearlyPrice.trim() === ""
                    ? null
                    : Number(yearlyPrice),
                storage_gb: Number(storageGb || 0),
                max_products:
                  maxProducts.trim() === ""
                    ? null
                    : Number(maxProducts),
                max_orders_per_month:
                  maxOrders.trim() === ""
                    ? null
                    : Number(maxOrders),
                max_customers:
                  maxCustomers.trim() === ""
                    ? null
                    : Number(maxCustomers),
                max_delivery_zones:
                  maxDeliveryZones.trim() === ""
                    ? null
                    : Number(maxDeliveryZones),

		max_staff: Number(maxStaff || 0),

                custom_domain: customDomain,
                analytics,
                priority_support: prioritySupport,
                api_access: apiAccess,
                sort_order: Number(sortOrder || 0),
                is_public: isPublic,
              })
            }
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


function PlanNumberField({
  label,
  value,
  onChange,
  placeholder,
  allowDecimal = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allowDecimal?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <input
        type="number"
        min="0"
        step={allowDecimal ? "any" : "1"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
      />
    </div>
  );
}

function PlanToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div>
        <p className="text-sm font-medium text-white">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
