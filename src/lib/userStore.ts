import "server-only";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

/** Var olmayan kullanıcı için de bcrypt çalıştırarak zamanlama sızıntısını azaltır. */
const BCRYPT_TIMING_PLACEHOLDER =
  "$2b$12$COvqYs5HFFDkqAJS4r0rdeIDr/k6QCp3h1CDEC.3jeUFnHETSf8nW";

// Domain gelince bu dosyayı DB adapter'ına çevir (Drizzle/Prisma).
// Şimdilik kullanıcılar src/data/users.json'da tutulur.

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  /** Eski kayıtlar için; yeni kod googleSub / twitterId kullanır */
  provider?: "google" | "twitter";
  providerId?: string;
  googleSub?: string;
  twitterId?: string;
  image?: string;
  createdAt: string;
}

function readUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw) as User[];
}

function writeUsers(users: User[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), {
    encoding: "utf-8",
    mode: 0o600,
  });
}

export function findByEmail(email: string): User | undefined {
  return readUsers().find((u) => u.email === email);
}

export function findById(id: string): User | undefined {
  return readUsers().find((u) => u.id === id);
}

export function findByProviderId(provider: string, providerId: string): User | undefined {
  return readUsers().find((u) => {
    if (provider === "google") {
      return (
        u.googleSub === providerId ||
        (u.provider === "google" && u.providerId === providerId)
      );
    }
    if (provider === "twitter") {
      return (
        u.twitterId === providerId ||
        (u.provider === "twitter" && u.providerId === providerId)
      );
    }
    return u.provider === provider && u.providerId === providerId;
  });
}

/** Aynı e-posta ile e-posta/şifre hesabına Google veya X oturumu bağlar (çoklu giriş yöntemi). */
export async function mergeProviderIntoUser(
  userId: string,
  merge: { googleSub?: string; twitterId?: string; image?: string; name?: string }
): Promise<User | undefined> {
  const users = readUsers();
  const i = users.findIndex((u) => u.id === userId);
  if (i === -1) return undefined;
  const u: User = { ...users[i] };
  if (merge.googleSub) u.googleSub = merge.googleSub;
  if (merge.twitterId) u.twitterId = merge.twitterId;
  if (merge.image) u.image = merge.image;
  if (merge.name) u.name = merge.name;
  users[i] = u;
  writeUsers(users);
  return u;
}

export async function createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
  const users = readUsers();
  const user: User = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

/** E-posta/şifre girişi: hesap yok / şifre yanlış ayrımı için zamanlama sızıntısını sınırlar. */
export async function verifyCredentialsLogin(
  email: string,
  password: string
): Promise<User | null> {
  const user = findByEmail(email);
  const hash = user?.passwordHash ?? BCRYPT_TIMING_PLACEHOLDER;
  const match = await bcrypt.compare(password, hash);
  if (!user?.passwordHash || !match) return null;
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Profilde göstermek: bağlı giriş yöntemleri (çoklu giriş). */
export function formatLinkedProviders(user: User): string {
  const parts: string[] = [];
  if (user.passwordHash) parts.push("E-posta");
  if (user.googleSub) parts.push("Google");
  if (user.twitterId) parts.push("X");
  if (parts.length === 0) {
    if (user.provider === "google") return "Google";
    if (user.provider === "twitter") return "X";
    return "E-posta";
  }
  return parts.join(" · ");
}
