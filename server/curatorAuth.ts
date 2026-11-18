import { createHash, timingSafeEqual } from "node:crypto";
import { parse } from "cookie";
import type { CookieOptions, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";

export const CURATOR_COOKIE = "curator_session";
const SESSION_MS = 12 * 60 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
let attempts: number[] = [];

export function curatorCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };
}

function credentials() {
  const password = process.env.CURATOR_PASSWORD ?? "";
  const secret = process.env.CURATOR_SESSION_SECRET ?? "";
  if (password.length < 16 || secret.length < 32) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "請先在 Render 設定 CURATOR_PASSWORD（至少 16 字元）及 CURATOR_SESSION_SECRET（至少 32 字元），然後重新部署。／Configure CURATOR_PASSWORD (16+ characters) and CURATOR_SESSION_SECRET (32+ characters) in Render, then redeploy.",
    });
  }
  // Rotating either credential also invalidates existing sessions.
  const key = createHash("sha256")
    .update(JSON.stringify([secret, password]))
    .digest();
  return { password, key };
}

function curatorUser(): User {
  const now = new Date();
  return {
    id: 0,
    openId: "local-curator",
    name: "Curator",
    email: null,
    loginMethod: "password",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export async function loginCurator(
  req: Request,
  res: Response,
  password: string
): Promise<{ success: true }> {
  if (req.headers.origin) {
    let origin: URL;
    try {
      origin = new URL(req.headers.origin);
    } catch {
      throw new TRPCError({ code: "FORBIDDEN", message: "Invalid origin." });
    }
    if (origin.host !== req.headers.host) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Invalid origin." });
    }
  }
  const configured = credentials();
  const now = Date.now();
  attempts = attempts.filter(at => now - at < ATTEMPT_WINDOW_MS);
  if (attempts.length >= MAX_ATTEMPTS) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "登入嘗試過多，請 15 分鐘後再試。／Too many login attempts. Try again in 15 minutes.",
    });
  }
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(digest(password), digest(configured.password))) {
    attempts.push(now);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "管理密碼不正確。／Incorrect curator password.",
    });
  }
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("local-curator")
    .setIssuer("gallery-curator")
    .setAudience("gallery-curator")
    .setIssuedAt()
    .setExpirationTime(Math.floor((now + SESSION_MS) / 1000))
    .sign(configured.key);
  res.cookie(CURATOR_COOKIE, token, {
    ...curatorCookieOptions(),
    maxAge: SESSION_MS,
  });
  return { success: true };
}

export async function authenticateCurator(req: Request): Promise<User | null> {
  const token = parse(req.headers.cookie ?? "")[CURATOR_COOKIE];
  if (!token) return null;
  const { key } = credentials();
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: "gallery-curator",
      audience: "gallery-curator",
    });
    if (payload.sub !== "local-curator" || payload.role !== "admin") return null;
    return curatorUser();
  } catch {
    console.warn("[Curator] Invalid or expired session");
    return null;
  }
}
