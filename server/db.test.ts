import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("storage configuration", () => {
  it("does not provide fake persistence when Google storage is not configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("GOOGLE_APPS_SCRIPT_URL", "");
    vi.stubEnv("GOOGLE_APPS_SCRIPT_SECRET", "");
    const { getDb, upsertUser } = await import("./db");
    const repository = await import("./galleryRepository");

    expect(await getDb()).toBeNull();
    await expect(upsertUser({ openId: "visitor" })).rejects.toThrow(
      "Database is not available",
    );
    const storageError =
      "GOOGLE_APPS_SCRIPT_URL and GOOGLE_APPS_SCRIPT_SECRET are required";
    await expect(repository.getVisibleGuestbookEntries()).rejects.toThrow(
      storageError,
    );
    await expect(repository.getCardOverrides()).rejects.toThrow(storageError);
    await expect(repository.getSavedExhibitionSettings()).rejects.toThrow(
      storageError,
    );
    await expect(
      repository.addGuestbookEntry({
        name: "Visitor",
        message: "Hello",
        photoUrl: null,
      }),
    ).rejects.toThrow(storageError);
  });

  it.each(["mysql://localhost/gallery", "not-a-url"])(
    "rejects incompatible configuration without logging the URL (%s)",
    async (url) => {
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
