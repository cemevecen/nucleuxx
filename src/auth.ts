import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";
import {
  findByEmail,
  findByProviderId,
  createUser,
  verifyPassword,
  hashPassword,
} from "@/lib/userStore";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
        name: { label: "Ad", type: "text" },
        mode: { label: "Mode", type: "text" }, // "login" | "register"
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim().toLowerCase();
        const password = credentials?.password as string;
        const name = (credentials?.name as string)?.trim();
        const mode = credentials?.mode as string;

        if (!email || !password) return null;

        if (mode === "register") {
          if (findByEmail(email)) {
            throw new Error("Bu email zaten kayıtlı.");
          }
          const passwordHash = await hashPassword(password);
          const user = await createUser({
            email,
            name: name || email.split("@")[0],
            passwordHash,
          });
          return { id: user.id, email: user.email, name: user.name };
        }

        // Login
        const user = findByEmail(email);
        if (!user) throw new Error("Bu email ile kayıtlı hesap yok.");
        if (!await verifyPassword(user, password)) throw new Error("Şifre hatalı.");
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // OAuth ile giriş → DB'de kullanıcı oluştur/bul
      if (account?.provider === "google" && profile) {
        const p = profile as { sub?: string; email?: string; name?: string; picture?: string };
        const existing = findByProviderId("google", p.sub ?? "");
        if (!existing) {
          const created = await createUser({
            email: p.email ?? "",
            name: p.name ?? "",
            provider: "google",
            providerId: p.sub,
            image: p.picture,
          });
          user.id = created.id;
        } else {
          user.id = existing.id;
        }
      }
      if (account?.provider === "twitter" && profile) {
        const p = profile as Record<string, unknown>;
        const data = (p.data ?? p) as Record<string, unknown>;
        const providerId = String(data.id ?? "");
        const existing = findByProviderId("twitter", providerId);
        if (!existing) {
          const created = await createUser({
            email: user.email ?? `${data.username}@twitter`,
            name: String(data.name ?? data.username ?? ""),
            provider: "twitter",
            providerId,
            image: data.profile_image_url as string | undefined,
          });
          user.id = created.id;
        } else {
          user.id = existing.id;
        }
      }
      return true;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
