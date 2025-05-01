import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}?error=No code provided`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Session error:', error);
      throw error;
    }

    return NextResponse.redirect(origin);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(`${origin}?error=Authentication failed`);
  }
}