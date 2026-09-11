"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
  needsEmailConfirmation?: boolean;
}

/** Only ever redirect to a relative internal path — never an open redirect. */
function safeNextPath(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) return { error: "Email and password are required." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
      emailRedirectTo: siteUrl ? `${siteUrl}/auth/callback` : undefined,
    },
  });

  if (error) return { error: error.message };

  // Whether email confirmation is required depends on this project's actual
  // Supabase Auth configuration — never assumed. If Supabase didn't return a
  // session, confirmation is required.
  if (!data.session) return { needsEmailConfirmation: true };

  redirect("/account");
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next")?.toString());

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };

  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl ? `${siteUrl}/auth/callback?next=/auth/reset-password` : undefined,
  });

  // Never reveal whether an email exists — same message either way.
  if (error) return { error: "Something went wrong. Please try again." };
  return {};
}

export async function updatePasswordAction(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/account");
}
