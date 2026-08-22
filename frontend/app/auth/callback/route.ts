import { NextResponse } from "next/server";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", request.url)
    );
  }

  const supabase = await createSupabaseServerAuthClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "OAuth session exchange failed:",
      error
    );

    return NextResponse.redirect(
      new URL("/login?error=oauth_callback", request.url)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=no_user", request.url)
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Unable to determine user role:",
      profileError
    );

    return NextResponse.redirect(
      new URL("/login?error=profile", request.url)
    );
  }

  if (profile?.role === "super_admin") {
    return NextResponse.redirect(
      new URL("/immortal", request.url)
    );
  }

  const { data: business, error: businessError } =
    await supabase
      .from("businesses")
      .select("id, currency")
      .eq("owner_id", user.id)
      .maybeSingle();

  if (businessError) {
    console.error(
      "Unable to determine business:",
      businessError
    );

    return NextResponse.redirect(
      new URL("/login?error=business", request.url)
    );
  }

  if (business) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/onboarding", request.url)
  );
}
