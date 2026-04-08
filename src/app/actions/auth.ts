"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { getOAuthUiFlags } from "@/lib/costGuards";

function parseAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    const msg = error.message ?? "";
    if (msg.includes("CREDENTIALS_INVALID")) {
      return "E-posta veya şifre hatalı.";
    }
    if (msg.includes("REGISTER_CONFLICT")) {
      return "Bu e-posta ile kayıt oluşturulamadı.";
    }
    return "Bir hata oluştu. Tekrar dene.";
  }
  return "Bir hata oluştu.";
}

export async function loginWithCredentials(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      mode: formData.get("mode"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: parseAuthError(error) };
    throw error;
  }
}

export async function loginWithGoogle() {
  if (!getOAuthUiFlags().google) redirect("/login");
  await signIn("google", { redirectTo: "/" });
}

export async function loginWithTwitter() {
  if (!getOAuthUiFlags().twitter) redirect("/login");
  await signIn("twitter", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
