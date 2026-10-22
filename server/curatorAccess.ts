import type { User } from "../drizzle/schema";

// The site owner explicitly approved this curator account in the task.
// This is an authorization allowlist, not a password or a login bypass.
const CURATOR_EMAIL = "ymanng@deliahw2.edu.hk";

export function withCuratorAccess(user: User): User {
  const isCurator =
    typeof user.email === "string" &&
    user.email.trim().toLowerCase() === CURATOR_EMAIL;
  return { ...user, role: isCurator ? "admin" : "user" };
}
