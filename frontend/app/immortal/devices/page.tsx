import {
  Activity,
  MonitorSmartphone,
  Smartphone,
  TabletSmartphone,
  Wifi,
  WifiOff,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalDevices } from "@/src/features/immortal/services/getImmortalDevices";

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatDate(value: string | null) {
  if (!value) return "Never";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function platformIcon(platform: string | null) {
  const value = platform?.toLowerCase() ?? "";

  if (value.includes("mobile") || value.includes("android")) {
    return Smartphone;
  }

  if (value.includes("tablet")) {
    return TabletSmartphone;
  }

  return MonitorSmartphone;
}

function platformLabel(platform: string | null) {
  if (!platform) return "Unknown";

  return platform
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

export default async function ImmortalDevicesPage() {
  await getImmortalAccess();

  const devices = await getImmortalDevices();

  const active = devices.filter(
    (device) => device.is_active
  );

  const inactive = devices.filter(
    (device) => !device.is_active
  );

  const recentlyActive = devices.filter((device) => {
    if (!device.last_used_at) return false;

    const lastUsed = new Date(
      device.last_used_at
    ).getTime();

    return (
      Date.now() - lastUsed <=
      7 * 24 * 60 * 60 * 1000
    );
  });

  const platforms = new Set(
    devices
      .map((device) => device.platform)
      .filter(Boolean)
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <MonitorSmartphone
                size={19}
                className="text-emerald-400"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Infrastructure
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                Devices
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Push notification endpoints connected to the
            Vendora network.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Stat
            label="Total Devices"
            value={formatNumber(devices.length)}
            icon={MonitorSmartphone}
          />

          <Stat
            label="Active"
            value={formatNumber(active.length)}
            icon={Wifi}
            valueClass="text-emerald-400"
          />

          <Stat
            label="Inactive"
            value={formatNumber(inactive.length)}
            icon={WifiOff}
            valueClass="text-red-400"
          />

          <Stat
            label="Active 7 Days"
            value={formatNumber(recentlyActive.length)}
            icon={Activity}
            valueClass="text-amber-400"
          />

          <Stat
            label="Platforms"
            value={formatNumber(platforms.size)}
            icon={Smartphone}
          />
        </section>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Activity
                size={16}
                className="text-emerald-400"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Push Infrastructure
              </p>

              <p className="text-xs text-slate-500">
                {formatNumber(active.length)} active
                endpoints currently available for push
                delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Device</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Registered</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {devices.map((device) => {
                  const Icon = platformIcon(
                    device.platform
                  );

                  return (
                    <tr
                      key={device.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950">
                            <Icon
                              size={16}
                              className="text-slate-400"
                            />
                          </div>

                          <div>
                            <p className="font-mono text-xs text-slate-300">
                              {device.id.slice(0, 8)}
                            </p>

                            <p className="max-w-[300px] truncate text-[11px] text-slate-600">
                              {device.user_agent ??
                                "Unknown user agent"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-white">
                          {device.business?.name ??
                            "Unknown merchant"}
                        </p>

                        <p className="text-xs text-slate-600">
                          {device.business?.slug
                            ? `/${device.business.slug}`
                            : "—"}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-300">
                        {platformLabel(device.platform)}
                      </td>

                      <td className="px-6 py-5">
                        {device.is_active ? (
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-400">
                        {formatDate(device.last_used_at)}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(device.created_at)}
                      </td>
                    </tr>
                  );
                })}

                {devices.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No push devices registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  icon: typeof MonitorSmartphone;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p
            className={`mt-3 text-2xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
          <Icon
            size={19}
            className="text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}
