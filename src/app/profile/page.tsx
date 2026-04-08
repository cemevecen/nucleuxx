import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserData } from "@/app/actions/user";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userData = await getUserData();

  return (
    <ProfileClient
      name={session.user.name ?? ""}
      email={session.user.email ?? ""}
      image={session.user.image ?? null}
      provider={userData?.provider ?? "email"}
      createdAt={userData?.createdAt ?? new Date().toISOString()}
    />
  );
}
