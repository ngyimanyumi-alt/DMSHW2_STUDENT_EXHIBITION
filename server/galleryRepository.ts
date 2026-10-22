import { desc, eq } from "drizzle-orm";
import {
  exhibitionCardOverrides,
  exhibitionSettings,
  guestbookEntries,
  type ExhibitionCardOverride,
  type ExhibitionSettings,
  type GuestbookEntry,
} from "../drizzle/schema";
import { getDb } from "./db";

export type CardTextUpdate = Pick<
  ExhibitionCardOverride,
  | "cardId"
  | "nameZh"
  | "nameEn"
  | "keywordsZh"
  | "keywordsEn"
  | "descriptionZh"
  | "descriptionEn"
  | "artist"
>;

export type ExhibitionSettingsUpdate = Pick<
  ExhibitionSettings,
  "titleZh" | "titleEn" | "statementZh" | "statementEn"
>;

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db;
}

export async function getCardOverrides(): Promise<ExhibitionCardOverride[]> {
  const db = await requireDb();
  return db.select().from(exhibitionCardOverrides);
}

export async function saveCardTextOverride(
  input: CardTextUpdate
): Promise<void> {
  const db = await requireDb();
  await db
    .insert(exhibitionCardOverrides)
    .values(input)
    .onDuplicateKeyUpdate({
      set: {
        nameZh: input.nameZh,
        nameEn: input.nameEn,
        keywordsZh: input.keywordsZh,
        keywordsEn: input.keywordsEn,
        descriptionZh: input.descriptionZh,
        descriptionEn: input.descriptionEn,
        artist: input.artist,
      },
    });
}

export async function saveCardMedia(
  cardId: number,
  input: { imageUrl: string; driveUrl: string | null }
): Promise<void> {
  const db = await requireDb();
  await db
    .insert(exhibitionCardOverrides)
    .values({ cardId, ...input })
    .onDuplicateKeyUpdate({
      set: input,
    });
}

export async function getSavedExhibitionSettings(): Promise<
  ExhibitionSettings | undefined
> {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(exhibitionSettings)
    .where(eq(exhibitionSettings.id, 1))
    .limit(1);
  return rows[0];
}

export async function saveExhibitionSettings(
  input: ExhibitionSettingsUpdate
): Promise<void> {
  const db = await requireDb();
  await db
    .insert(exhibitionSettings)
    .values({ id: 1, ...input })
    .onDuplicateKeyUpdate({ set: input });
}

export async function getVisibleGuestbookEntries(): Promise<GuestbookEntry[]> {
  const db = await requireDb();
  return db
    .select()
    .from(guestbookEntries)
    .where(eq(guestbookEntries.hidden, false))
    .orderBy(desc(guestbookEntries.createdAt), desc(guestbookEntries.id));
}

export async function getAllGuestbookEntries(): Promise<GuestbookEntry[]> {
  const db = await requireDb();
  return db
    .select()
    .from(guestbookEntries)
    .orderBy(desc(guestbookEntries.createdAt), desc(guestbookEntries.id));
}

export async function addGuestbookEntry(input: {
  name: string;
  message: string;
  photoUrl: string | null;
}): Promise<GuestbookEntry> {
  const db = await requireDb();
  const insertResult = await db.insert(guestbookEntries).values({
    ...input,
    hidden: false,
  });
  const id = Number(
    (insertResult as unknown as Array<{ insertId?: number }>)[0]?.insertId
  );
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Guestbook entry was not created");
  }

  const rows = await db
    .select()
    .from(guestbookEntries)
    .where(eq(guestbookEntries.id, id))
    .limit(1);
  if (!rows[0]) throw new Error("Guestbook entry could not be loaded");
  return rows[0];
}

export async function setGuestbookEntryHidden(
  id: number,
  hidden: boolean
): Promise<void> {
  const db = await requireDb();
  await db
    .update(guestbookEntries)
    .set({ hidden })
    .where(eq(guestbookEntries.id, id));
}
