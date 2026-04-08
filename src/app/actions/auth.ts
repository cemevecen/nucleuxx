"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentials(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email veya şifre hatalı." };
    }
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
