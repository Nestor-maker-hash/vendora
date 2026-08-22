"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/src/lib/supabase";
import { getBusinessAfterLogin } from "@/src/features/auth/services/getBusinessAfterLogin";
import { getCurrentUserRole } from "@/src/features/auth/services/getCurrentUserRole";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const role = await getCurrentUserRole(
          session.user.id
        );

        if (role === "super_admin") {
          router.replace("/immortal");
          return;
        }

        const business = await getBusinessAfterLogin(
          session.user.id
        );

        const currentPath =
          window.location.pathname;

        if (
          (!business || !business.currency) &&
          currentPath !== "/onboarding"
        ) {
          router.replace("/onboarding");
          return;
        }

        if (
          business &&
          business.currency &&
          currentPath === "/onboarding"
        ) {
          router.replace("/dashboard");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "AuthGuard error:",
          error
        );

        router.replace("/login");
      }
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-600">
            Vendora
          </h1>

          <p className="mt-3 text-gray-500">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
