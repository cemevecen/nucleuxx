"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

function parseAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    const msg = error.message ?? "";
    if (msg.includes("Bu email zaten kayıtlı")) return "Bu email zaten kayıtlı.";
    if (msg.includes("kayıtlı hesap yok")) return "Bu email ile kayıtlı hesap bulunamadı.";
    if (msg.includes("Şifre hatalı")) return "Şifre hatalı.";
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
  await signIn("google", { redirectTo: "/" });
}

export async function loginWithTwitter() {
  await signIn("twitter", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
