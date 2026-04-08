"use server";

import { auth } from "@/auth";
import {
  findByEmail,
  findById,
  formatLinkedProviders,
  hasLinkedEmailPassword,
  hasLinkedGoogle,
  hasLinkedTwitter,
} from "@/lib/userStore";

/** Oturumdaki kullanıcı için profil verisi; başka e-posta ile sorgulanamaz. */
export async function getUserData() {
  const session = await auth();
  if (!session?.user) return null;

  const email = session.user.email?.trim().toLowerCase();
  let user = email ? findByEmail(email) : undefined;
  if (!user && session.user.id) {
    user = findById(session.user.id as string);
  }
  if (!user) return null;

  return {
    createdAt: user.createdAt,
    provider: formatLinkedProviders(user),
    image: user.image ?? null,
    linked: {
      email: hasLinkedEmailPassword(user),
      google: hasLinkedGoogle(user),
      twitter: hasLinkedTwitter(user),
    },
  };
}
