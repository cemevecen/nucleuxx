"use server";

import { auth } from "@/auth";
import { findByEmail, formatLinkedProviders } from "@/lib/userStore";

/** Oturumdaki kullanıcı için profil verisi; başka e-posta ile sorgulanamaz. */
export async function getUserData() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;

  const user = findByEmail(email);
  if (!user) return null;

  return {
    createdAt: user.createdAt,
    provider: formatLinkedProviders(user),
    image: user.image ?? null,
  };
}
