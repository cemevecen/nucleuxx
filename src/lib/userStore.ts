import "server-only";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Domain gelince bu dosyayı DB adapter'ına çevir (Drizzle/Prisma).
// Şimdilik kullanıcılar src/data/users.json'da tutulur.

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;    // email+şifre kaydı
  provider?: "google" | "twitter"; // OAuth kaydı
  providerId?: string;
  image?: string;
  createdAt: string;
}

function readUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw) as User[];
}

function writeUsers(users: User[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findByEmail(email: string): User | undefined {
  return readUsers().find((u) => u.email === email);
}

export function findByProviderId(provider: string, providerId: string): User | undefined {
  return readUsers().find((u) => u.provider === provider && u.providerId === providerId);
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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
