"use server";

import { findByEmail } from "@/lib/userStore";

export async function getUserData(email: string) {
  const user = findByEmail(email);
  if (!user) return null;
  return {
    createdAt: user.createdAt,
    provider: user.provider ?? "email",
    image: user.image ?? null,
  };
}
