"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

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
  await signIn("google", { redirectTo: "/" });
}

export async function loginWithTwitter() {
  await signIn("twitter", { redirectTo: "/" });
}

/** Profilde oturum açıkken Google / X hesabını aynı kullanıcıya bağlamak için (OAuth dönüşü /profile). */
export async function linkGoogleFromProfile() {
  await signIn("google", { redirectTo: "/profile" });
}

export async function linkTwitterFromProfile() {
  await signIn("twitter", { redirectTo: "/profile" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
