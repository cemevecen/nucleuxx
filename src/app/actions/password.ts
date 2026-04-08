"use server";

import { auth } from "@/auth";
import { findById, setUserPasswordForId } from "@/lib/userStore";
import { revalidatePath } from "next/cache";

export async function setCredentialsPasswordFromProfile(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum bulunamadı." };

  const pw = String(formData.get("newPassword") ?? "");
  const pw2 = String(formData.get("confirmPassword") ?? "");
  if (pw !== pw2) return { error: "Şifreler eşleşmiyor." };

  const user = findById(session.user.id as string);
  if (!user) return { error: "Hesap kaydı bulunamadı." };

  const result = await setUserPasswordForId(user.id, pw);
  if (!result.ok) return { error: result.error ?? "İşlem başarısız." };

  revalidatePath("/profile");
  return { ok: true };
}
