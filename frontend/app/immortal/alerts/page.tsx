import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ShieldAlert,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import {
  getImmortalAlerts,
  ImmortalAlert,
} from "@/src/features/immortal/services/getImmortalAlerts";

function severityConfig(
  severity: ImmortalAlert["severity"]
) {
  switch (severity) {
    case "critical":
      return {
        label: "Critical",
        icon: ShieldAlert,
        iconClass: "text-red-400",
        badgeClass:
          "bg-red-500/10 text-red-400 border-red-500/20",
      };

    case "warning":
      return {
        label: "Warning",
        icon: AlertTriangle,
        iconClass: "text-amber-400",
        badgeClass:
          "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };

    default:
      return {
        label: "System",
        icon: CheckCircle2,
        iconClass: "text-emerald-400",
        badgeClass:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
  }
}

export default async function ImmortalAlertsPage() {
  await getImmortalAccess();

  const alerts = await getImmortalAlerts();

  const critical = alerts.filter(
    (alert) => alert.severity === "critical"
  );

  const warnings = alerts.filter(
    (alert) => alert.severity === "warning"
  );

  const system = alerts.filter(
    (alert) => alert.severity === "system"
  );

  const activeAlerts =
    critical.length + warnings.length;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
            <CircleAlert size={14} />
            Command Center
          </div>

          <div className="mt-3">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Command Alerts
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Operational issues detected across Vendora.
            </p>
          </div>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-500">
              Active Alerts
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {activeAlerts.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-sm text-slate-500">
              Critical
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {critical.length.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-sm text-slate-500">
              Warnings
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-400">
              {warnings.length.toLocaleString()}
            </p>
          </div>
        </section>

        <div className="space-y-4">
          {alerts.map((alert) => {
            const config =
              severityConfig(alert.severity);

            const Icon = config.icon;

            return (
              <Link
                key={alert.id}
                href={alert.href}
                className="group block rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-950 p-3">
                    <Icon
                      size={20}
                      className={config.iconClass}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold text-white">
                        {alert.title}
                      </h2>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {alert.description}
                    </p>

                    {alert.count > 0 && (
                      <p className="mt-3 text-sm font-medium text-slate-300">
                        {alert.count.toLocaleString()}{" "}
                        affected
                      </p>
                    )}
                  </div>

                  <ArrowRight
                    size={18}
                    className="mt-2 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {system.length > 0 && (
          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={19}
                className="text-emerald-400"
              />

              <div>
                <p className="font-semibold text-white">
                  System clear
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Immortal is monitoring the platform for operational issues.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
