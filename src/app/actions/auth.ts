"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Şimdilik env credentials — domain gelince DB sorgusuna çevir
  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return { error: "Email ve şifre gerekli." };
  }

  if (email !== validEmail || password !== validPassword) {
    return { error: "Email veya şifre hatalı." };
  }

  await createSession("1", email);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
