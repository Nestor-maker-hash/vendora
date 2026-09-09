"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Play,
  Share,
  Smartphone,
  Store,
  X,
} from "lucide-react";

const DISMISS_DURATION_MS = 5 * 60 * 1000;
const DISMISS_KEY = "vendora:pwa-install-dismissed-until";

function isStandalone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(
      (window.navigator as Navigator & {
        standalone?: boolean;
      }).standalone
    )
  );
}

function isIOS(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

export default function PWAInstallPrompt() {
  const [installed, setInstalled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const iosDevice = isIOS();
    setIos(iosDevice);

    const dismissedUntil = Number(
      window.localStorage.getItem(DISMISS_KEY) ?? "0"
    );

    function canShowPrompt() {
      return iosDevice || Boolean(deferredPrompt);
    }

    if (dismissedUntil > Date.now()) {
      const remaining = dismissedUntil - Date.now();

      const timer = window.setTimeout(() => {
        window.localStorage.removeItem(DISMISS_KEY);

        if (iosDevice) {
          setVisible(true);
        }
      }, remaining);

      return () => {
        window.clearTimeout(timer);
      };
    }

    function handleBeforeInstallPrompt(
      event: Event
    ) {
      event.preventDefault();

      const prompt =
        event as BeforeInstallPromptEvent;

      setDeferredPrompt(prompt);
      setVisible(true);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setVisible(false);
      setExpanded(false);
      setDeferredPrompt(null);
      window.localStorage.removeItem(DISMISS_KEY);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    if (canShowPrompt()) {
      setVisible(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  if (installed || !visible) {
    return null;
  }

  function dismiss() {
    const dismissedUntil =
      Date.now() + DISMISS_DURATION_MS;

    window.localStorage.setItem(
      DISMISS_KEY,
      String(dismissedUntil)
    );

    setVisible(false);
    setExpanded(false);
  }

  async function installWebApp() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();

    const result =
      await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      setVisible(false);
    }

    setDeferredPrompt(null);
  }

  const webAppAvailable = Boolean(deferredPrompt);

  if (!ios && !webAppAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md sm:bottom-6 sm:left-auto sm:right-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Smartphone size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Install Vendora
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Get a faster app-like experience for shopping
                  and managing your business.
                </p>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close install prompt"
                title="Close for 5 minutes"
              >
                <X size={17} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              {ios ? <Share size={15} /> : <Download size={15} />}

              {expanded
                ? "Hide options"
                : ios
                  ? "Add Vendora to Home Screen"
                  : "Install Vendora"}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50 p-3">
            <div className="space-y-2">
              {ios ? (
                <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <Share size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900">
                        Add Vendora to your Home Screen
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        Tap the Share button in Safari, then choose
                        <span className="font-semibold text-slate-700">
                          {" "}Add to Home Screen
                        </span>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={installWebApp}
                  disabled={!webAppAvailable}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Download size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">
                      Install Web App
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Install Vendora on this device.
                    </p>
                  </div>
                </button>
              )}

              <button
                type="button"
                disabled
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left opacity-60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Store size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Install App Store
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Coming soon
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left opacity-60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Play size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Install Play Store
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Coming soon
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}
