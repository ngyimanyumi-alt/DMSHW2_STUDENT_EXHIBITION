import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getDb, getUserByOpenId, upsertUser } from "./db";
import * as repository from "./galleryRepository";

const testUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!testUrl)("PostgreSQL persistence and migrations", () => {
  const schema = `gallery_test_${randomUUID().replaceAll("-", "")}`;
  let admin: ReturnType<typeof postgres>;
  let db: NonNullable<Awaited<ReturnType<typeof getDb>>>;

  beforeAll(async () => {
    admin = postgres(testUrl!, { onnotice: () => {} });
    await admin`CREATE SCHEMA ${admin(schema)}`;
    const url = new URL(testUrl!);
    url.searchParams.set("options", `-c search_path=${schema}`);
    vi.stubEnv("DATABASE_URL", url.toString());
    db = (await getDb())!;
    const config = {
      migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
      migrationsSchema: schema,
    };
    await migrate(db, config);
    await migrate(db, config);
  });

  afterAll(async () => {
    await db?.$client.end();
    if (admin) {
      await admin`DROP SCHEMA IF EXISTS ${admin(schema)} CASCADE`;
      await admin.end();
    }
    vi.unstubAllEnvs();
  });

  it("returns generated IDs, dates, booleans, nulls, and moderated listings", async () => {
    const first = await repository.addGuestbookEntry({
      name: "訪客",
      message: "精彩展覽",
      photoUrl: null,
    });
    const second = await repository.addGuestbookEntry({
      name: "Visitor",
      message: "Wonderful show",
      photoUrl: "/manus-storage/photo.png",
    });
    expect(first).toMatchObject({ name: "訪客", photoUrl: null, hidden: false });
    expect(first.id).toBeGreaterThan(0);
    expect(second.id).toBeGreaterThan(first.id);
    expect(first.createdAt).toBeInstanceOf(Date);
    expect(Number.isNaN(first.createdAt.getTime())).toBe(false);
    expect((await repository.getVisibleGuestbookEntries()).map(row => row.id))
      .toEqual([second.id, first.id]);

    await repository.setGuestbookEntryHidden(second.id, true);
    expect(await repository.getVisibleGuestbookEntries()).toEqual([first]);
    expect(await repository.getAllGuestbookEntries()).toEqual([
      { ...second, hidden: true }, first,
    ]);
    await repository.setGuestbookEntryHidden(second.id, false);
    expect(await repository.getVisibleGuestbookEntries()).toHaveLength(2);
  });

  it("upserts users by openId, preserving omitted fields and clearing explicit nulls", async () => {
    await upsertUser({ openId: "test-user", name: "Visitor", email: "visitor@example.test" });
    const initial = (await getUserByOpenId("test-user"))!;
    expect(initial).toMatchObject({ role: "user", loginMethod: null });
    expect(initial.id).toBeGreaterThan(0);
    expect(initial.lastSignedIn).toBeInstanceOf(Date);
    const signedIn = new Date("2026-10-01T12:34:56.000Z");
    await upsertUser({ openId: "test-user", name: null, role: "admin", lastSignedIn: signedIn });
    const updated = (await getUserByOpenId("test-user"))!;
    expect(updated).toMatchObject({
      id: initial.id,
      name: null,
      email: initial.email,
      role: "admin",
      createdAt: initial.createdAt,
      lastSignedIn: signedIn,
    });
    expect(updated.updatedAt.getTime()).toBeGreaterThan(initial.updatedAt.getTime());
    await upsertUser({ openId: "test-user" });
    expect((await getUserByOpenId("test-user"))!.lastSignedIn.getTime())
      .toBeGreaterThan(signedIn.getTime());
  });

  it("upserts card text and media independently without losing nullable values", async () => {
    await repository.saveCardMedia(1, { imageUrl: "/manus-storage/card.png", driveUrl: null });
    const initial = (await repository.getCardOverrides())[0]!;
    expect(initial.nameEn).toBeNull();
    const text = {
      cardId: 1, nameZh: "騎士", nameEn: "Rider",
      keywordsZh: null, keywordsEn: null,
      descriptionZh: null, descriptionEn: null, artist: null,
    };
    await repository.saveCardTextOverride(text);
    const updated = (await repository.getCardOverrides())[0]!;
    expect(updated).toMatchObject({ ...text, imageUrl: initial.imageUrl, driveUrl: null });
    expect(updated.updatedAt.getTime()).toBeGreaterThan(initial.updatedAt.getTime());
    await repository.saveCardMedia(1, {
      imageUrl: "/manus-storage/new.png",
      driveUrl: "https://drive.google.com/file/d/example/view",
    });
    await repository.saveCardMedia(1, { imageUrl: "/manus-storage/new.png", driveUrl: null });
    expect(await repository.getCardOverrides()).toEqual([
      expect.objectContaining({ ...text, imageUrl: "/manus-storage/new.png", driveUrl: null }),
    ]);
    await repository.saveCardTextOverride({ ...text, nameEn: null });
    expect((await repository.getCardOverrides())[0]!.nameEn).toBeNull();
  });

  it("upserts the settings singleton and advances timestamps even for direct SQL updates", async () => {
    expect(await repository.getSavedExhibitionSettings()).toBeUndefined();
    const settings = {
      titleZh: "展覽", titleEn: "Exhibition",
      statementZh: "學生作品", statementEn: "Student work",
    };
    await repository.saveExhibitionSettings(settings);
    const initial = (await repository.getSavedExhibitionSettings())!;
    await repository.saveExhibitionSettings({ ...settings, titleEn: "Updated" });
    const updated = (await repository.getSavedExhibitionSettings())!;
    expect(updated).toMatchObject({ ...settings, id: 1, titleEn: "Updated" });
    expect(updated.updatedAt.getTime()).toBeGreaterThan(initial.updatedAt.getTime());
    await db.$client`UPDATE exhibition_settings SET "titleEn" = 'Direct update' WHERE id = 1`;
    expect((await repository.getSavedExhibitionSettings())!.updatedAt.getTime())
      .toBeGreaterThan(updated.updatedAt.getTime());
    const rows = await db.$client`SELECT count(*)::int AS count FROM exhibition_settings`;
    expect(rows[0]!.count).toBe(1);
  });
});
