import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";
import {
  findByEmail,
  findByProviderId,
  createUser,
  mergeProviderIntoUser,
  verifyCredentialsLogin,
  hashPassword,
} from "@/lib/userStore";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
        if (email.length > 254 || password.length > 128) return null;

        if (mode === "register") {
          if (findByEmail(email)) {
            throw new Error("REGISTER_CONFLICT");
          }
          const passwordHash = await hashPassword(password);
          const user = await createUser({
            email,
            name: name || email.split("@")[0],
            passwordHash,
          });
          return { id: user.id, email: user.email, name: user.name };
        }

        const user = await verifyCredentialsLogin(email, password);
        if (!user) throw new Error("CREDENTIALS_INVALID");
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
        const sub = p.sub ?? "";
        const existing = findByProviderId("google", sub);
        if (existing) {
          user.id = existing.id;
        } else {
          const email = (p.email ?? "").trim().toLowerCase();
          const byEmail = email ? findByEmail(email) : undefined;
          if (byEmail) {
            await mergeProviderIntoUser(byEmail.id, {
              googleSub: sub,
              image: p.picture,
              name: p.name ?? undefined,
            });
            user.id = byEmail.id;
          } else {
            const created = await createUser({
              email: email || `google-${sub.slice(0, 24)}@nucleuxx.local`,
              name: p.name ?? "",
              googleSub: sub,
              image: p.picture,
            });
            user.id = created.id;
          }
        }
      }
      if (account?.provider === "twitter" && profile) {
        const p = profile as Record<string, unknown>;
        const data = (p.data ?? p) as Record<string, unknown>;
        const providerId = String(data.id ?? "");
        const existing = findByProviderId("twitter", providerId);
        if (existing) {
          user.id = existing.id;
        } else {
          const twEmailRaw = (user.email ?? `${data.username}@twitter`).trim().toLowerCase();
          const canLinkByEmail =
            twEmailRaw.includes("@") && !twEmailRaw.endsWith("@twitter");
          const byEmail = canLinkByEmail ? findByEmail(twEmailRaw) : undefined;
          if (byEmail) {
            await mergeProviderIntoUser(byEmail.id, {
              twitterId: providerId,
              image: data.profile_image_url as string | undefined,
              name: String(data.name ?? data.username ?? "") || undefined,
            });
            user.id = byEmail.id;
          } else {
            const created = await createUser({
              email: twEmailRaw,
              name: String(data.name ?? data.username ?? ""),
              twitterId: providerId,
              image: data.profile_image_url as string | undefined,
            });
            user.id = created.id;
          }
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
  session: {
    strategy: "jwt",
    /** Aynı hesap: birden fazla cihaz/tarayıcıda eşzamanlı oturum (JWT; sunucu tarafında tek oturum kilidi yok). */
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
});
