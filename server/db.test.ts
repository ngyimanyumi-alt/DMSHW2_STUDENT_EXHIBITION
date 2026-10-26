import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("database configuration", () => {
  it("does not provide fake persistence when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { getDb, upsertUser } = await import("./db");
    const repository = await import("./galleryRepository");

    expect(await getDb()).toBeNull();
    await expect(upsertUser({ openId: "visitor" })).rejects.toThrow(
      "Database is not available",
    );
    await expect(repository.getVisibleGuestbookEntries()).rejects.toThrow(
      "Database is unavailable",
    );
    await expect(repository.getCardOverrides()).rejects.toThrow(
      "Database is unavailable",
    );
    await expect(repository.getSavedExhibitionSettings()).rejects.toThrow(
      "Database is unavailable",
    );
    await expect(repository.addGuestbookEntry({
      name: "Visitor",
      message: "Hello",
      photoUrl: null,
    })).rejects.toThrow("Database is unavailable");
  });

  it.each(["mysql://localhost/gallery", "not-a-url"])(
    "rejects incompatible configuration without logging the URL (%s)",
    async url => {
      vi.stubEnv("DATABASE_URL", url);
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { getDb } = await import("./db");

      expect(await getDb()).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        "[Database] Invalid PostgreSQL configuration",
      );
    },
  );
});
