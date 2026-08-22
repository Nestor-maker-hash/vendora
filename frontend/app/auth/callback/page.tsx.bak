"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { supabase } from "@/src/lib/supabase";
import { getBusinessAfterLogin } from "@/src/features/auth/services/getBusinessAfterLogin";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!session?.user) {
          throw new Error(
            "Google authentication was not completed."
          );
        }

        const business =
          await getBusinessAfterLogin(
            session.user.id
          );

        if (!mounted) return;

        if (business) {
          toast.success("Welcome back!");
          router.replace("/dashboard");
        } else {
          toast.success(
            "Account created! Let's set up your business."
          );
          router.replace("/onboarding");
        }
      } catch (err: any) {
        console.error(
          "Google authentication error:",
          err
        );

        if (!mounted) return;

        toast.error(
          err?.message ??
            "Unable to complete Google authentication."
        );

        router.replace("/create-account");
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-emerald-600">
          Vendora
        </h1>

        <p className="mt-3 text-gray-500">
          Completing your Google sign-in...
        </p>
      </div>
    </main>
  );
}
