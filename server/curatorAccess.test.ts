import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../drizzle/schema";
import { withCuratorAccess } from "./curatorAccess";

const authenticateRequest = vi.hoisted(() => vi.fn());
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest } }));
import { createContext } from "./_core/context";

const baseUser: User = {
  id: 10,
  openId: "verified-platform-open-id",
  name: "Curator",
  email: "ymanng@deliahw2.edu.hk",
  loginMethod: "google",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("the owner-approved curator authorization policy", () => {
  beforeEach(() => {
    authenticateRequest.mockReset();
  });
  it("grants curator access only to the confirmed exact email", () => {
    expect(withCuratorAccess(baseUser).role).toBe("admin");
    expect(
      withCuratorAccess({ ...baseUser, email: " YMANNG@DELIAHW2.EDU.HK " }).role
    ).toBe("admin");
    expect(
      withCuratorAccess({
        ...baseUser,
        email: "ymanng@deliahw2.edu.hk.attacker.example",
      }).role
    ).toBe("user");
  });
  it("does not trust a legacy role or missing email for another account", () => {
    expect(
      withCuratorAccess({
        ...baseUser,
        email: "visitor@example.com",
        role: "admin",
      }).role
    ).toBe("user");
    expect(
      withCuratorAccess({ ...baseUser, email: null, role: "admin" }).role
    ).toBe("user");
    expect(baseUser.role).toBe("user");
  });
  it("maps permission only after the real authentication layer succeeds", async () => {
    authenticateRequest.mockResolvedValue(baseUser);
    const context = await createContext({
      req: {} as never,
      res: {} as never,
      info: {} as never,
    });
    expect(authenticateRequest).toHaveBeenCalledOnce();
    expect(context.user?.role).toBe("admin");
  });
  it("keeps the anonymous state when session validation fails", async () => {
    authenticateRequest.mockRejectedValue(new Error("Invalid signed session"));
    const context = await createContext({
      req: {} as never,
      res: {} as never,
      info: {} as never,
    });
    expect(context.user).toBeNull();
  });
});
