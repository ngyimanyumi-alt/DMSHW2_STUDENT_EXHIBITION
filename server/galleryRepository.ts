import {
  type ExhibitionCardOverride,
  type ExhibitionSettings,
  type GuestbookEntry,
} from "../drizzle/schema";
import { callGoogleStorage } from "./googleDriveStorage";

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

type StoredCardOverride = Omit<ExhibitionCardOverride, "updatedAt"> & {
  updatedAt: string;
};
type StoredSettings = Omit<ExhibitionSettings, "updatedAt"> & {
  updatedAt: string;
};
type StoredGuestbookEntry = Omit<GuestbookEntry, "createdAt"> & {
  createdAt: string;
};

function storedDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Google Sheets returned an invalid date");
  }
  return date;
}

function nullableText(value: string | null): string | null {
  return value === "" ? null : value;
}

function mapCardOverride(row: StoredCardOverride): ExhibitionCardOverride {
  return {
    ...row,
    nameZh: nullableText(row.nameZh),
    nameEn: nullableText(row.nameEn),
    keywordsZh: nullableText(row.keywordsZh),
    keywordsEn: nullableText(row.keywordsEn),
    descriptionZh: nullableText(row.descriptionZh),
    descriptionEn: nullableText(row.descriptionEn),
    artist: nullableText(row.artist),
    imageUrl: nullableText(row.imageUrl),
    driveUrl: nullableText(row.driveUrl),
    updatedAt: storedDate(row.updatedAt),
  };
}

function mapGuestbookEntry(row: StoredGuestbookEntry): GuestbookEntry {
  return {
    ...row,
    photoUrl: nullableText(row.photoUrl),
    createdAt: storedDate(row.createdAt),
  };
}

export async function getCardOverrides(): Promise<ExhibitionCardOverride[]> {
  const rows =
    await callGoogleStorage<StoredCardOverride[]>("getCardOverrides");
  return rows.map(mapCardOverride);
}

export async function saveCardTextOverride(
  input: CardTextUpdate,
): Promise<void> {
  await callGoogleStorage<null>("saveCardTextOverride", input);
}

export async function saveCardMedia(
  cardId: number,
  input: { imageUrl: string; driveUrl: string | null },
): Promise<void> {
  await callGoogleStorage<null>("saveCardMedia", { cardId, ...input });
}

export async function getSavedExhibitionSettings(): Promise<
  ExhibitionSettings | undefined
> {
  const settings = await callGoogleStorage<StoredSettings | null>(
    "getSavedExhibitionSettings",
  );
  if (!settings) return undefined;
  return {
    ...settings,
    updatedAt: storedDate(settings.updatedAt),
  };
}

export async function saveExhibitionSettings(
  input: ExhibitionSettingsUpdate,
): Promise<void> {
  await callGoogleStorage<null>("saveExhibitionSettings", input);
}

export async function getVisibleGuestbookEntries(): Promise<GuestbookEntry[]> {
  const entries = await callGoogleStorage<StoredGuestbookEntry[]>(
    "getVisibleGuestbookEntries",
  );
  return entries.map(mapGuestbookEntry);
}

export async function getAllGuestbookEntries(): Promise<GuestbookEntry[]> {
  const entries = await callGoogleStorage<StoredGuestbookEntry[]>(
    "getAllGuestbookEntries",
  );
  return entries.map(mapGuestbookEntry);
}

export async function addGuestbookEntry(input: {
  name: string;
  message: string;
  photoUrl: string | null;
}): Promise<GuestbookEntry> {
  const entry = await callGoogleStorage<StoredGuestbookEntry>(
    "addGuestbookEntry",
    input,
  );
  return mapGuestbookEntry(entry);
}

export async function setGuestbookEntryHidden(
  id: number,
  hidden: boolean,
): Promise<void> {
  await callGoogleStorage<null>("setGuestbookEntryHidden", { id, hidden });
}
