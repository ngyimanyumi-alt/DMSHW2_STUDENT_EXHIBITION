import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  addGuestbookEntry: vi.fn(),
  getAllGuestbookEntries: vi.fn(),
  getCardOverrides: vi.fn(),
  getSavedExhibitionSettings: vi.fn(),
  getVisibleGuestbookEntries: vi.fn(),
  saveCardMedia: vi.fn(),
  saveCardTextOverride: vi.fn(),
  saveExhibitionSettings: vi.fn(),
  setGuestbookEntryHidden: vi.fn(),
}));
const media = vi.hoisted(() => ({
  uploadArtworkImage: vi.fn(),
  uploadGuestbookPhoto: vi.fn(),
  importPublicDriveArtwork: vi.fn(),
}));
const reading = vi.hoisted(() => ({
  assertReadingRateLimit: vi.fn(),
  interpretCards: vi.fn(),
}));

vi.mock("./galleryRepository", () => repository);
vi.mock("./galleryMedia", () => ({
  ACCEPTED_IMAGE_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ...media,
  isGalleryMediaError: () => false,
}));
vi.mock("./galleryReading", () => reading);

import { CARD_CATALOG } from "@shared/cards";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

const createdAt = new Date("2026-10-21T00:00:00.000Z");

function context(role: "admin" | "user" | null, ip = `test-${Math.random()}`): TrpcContext {
  return {
    user: role
      ? {
          id: 1,
          openId: `user-${role}`,
          email: null,
          name: role,
          loginMethod: "manus",
          role,
          createdAt,
          updatedAt: createdAt,
          lastSignedIn: createdAt,
        }
      : null,
    req: { ip, protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  repository.getCardOverrides.mockResolvedValue([]);
  repository.getSavedExhibitionSettings.mockResolvedValue(undefined);
  repository.getVisibleGuestbookEntries.mockResolvedValue([]);
  repository.getAllGuestbookEntries.mockResolvedValue([]);
  repository.addGuestbookEntry.mockResolvedValue({
    id: 9,
    name: "Visitor",
    message: "A thoughtful exhibition.",
    photoUrl: null,
    hidden: false,
    createdAt,
  });
  media.uploadArtworkImage.mockResolvedValue({ imageUrl: "/manus-storage/art.png" });
  media.uploadGuestbookPhoto.mockResolvedValue({ imageUrl: "/manus-storage/guest.png" });
  media.importPublicDriveArtwork.mockResolvedValue({
    imageUrl: "/manus-storage/drive.png",
    driveUrl: "https://drive.google.com/file/d/abcdefghij/view",
  });
  reading.interpretCards.mockResolvedValue({ text: "A symbolic prompt.", source: "ai" });
});

describe("gallery tRPC contract", () => {
  it("merges only saved card override values onto the shared catalog", async () => {
    repository.getCardOverrides.mockResolvedValue([
      {
        cardId: 1,
        nameZh: "覆寫騎士",
        nameEn: null,
        keywordsZh: null,
        keywordsEn: null,
        descriptionZh: null,
        descriptionEn: null,
        artist: "Student A",
        imageUrl: "/manus-storage/card.png",
        driveUrl: "https://drive.google.com/file/d/abcdefghij/view",
        updatedAt: createdAt,
      },
    ]);

    const cards = await appRouter.createCaller(context(null)).exhibition.cards();

    expect(cards).toHaveLength(CARD_CATALOG.length);
    expect(cards[0]).toMatchObject({
      id: 1,
      nameZh: "覆寫騎士",
      nameEn: CARD_CATALOG[0]?.nameEn,
      artist: "Student A",
      imageUrl: "/manus-storage/card.png",
      driveUrl: "https://drive.google.com/file/d/abcdefghij/view",
    });
  });

  it("returns no guestbook test data and keeps public listings visible-only", async () => {
    repository.getVisibleGuestbookEntries.mockResolvedValue([
      {
        id: 4,
        name: "A visitor",
        message: "Wonderful work.",
        photoUrl: null,
        hidden: false,
        createdAt,
      },
    ]);

    const entries = await appRouter.createCaller(context(null)).guestbook.list();

    expect(entries).toEqual([
      {
        id: 4,
        name: "A visitor",
        message: "Wonderful work.",
        photoUrl: null,
        hidden: false,
        createdAt,
      },
    ]);
    expect(repository.getAllGuestbookEntries).not.toHaveBeenCalled();
  });

  it("rejects non-admin curator writes before calling persistence or storage", async () => {
    const caller = appRouter.createCaller(context("user"));

    await expect(
      caller.exhibition.uploadArtwork({
        id: 1,
        data: "/9j/",
        mimeType: "image/jpeg",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller.guestbook.moderate({ id: 1, hidden: true }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(media.uploadArtworkImage).not.toHaveBeenCalled();
    expect(repository.saveCardMedia).not.toHaveBeenCalled();
    expect(repository.setGuestbookEntryHidden).not.toHaveBeenCalled();
  });

  it("uses an administrator role from the starter auth context for each curator write", async () => {
    const caller = appRouter.createCaller(context("admin"));

    await caller.exhibition.saveCard({
      id: 1,
      nameZh: "騎士",
      nameEn: "Rider",
      keywordsZh: "消息",
      keywordsEn: "News",
      descriptionZh: "一個訊號。",
      descriptionEn: "A signal.",
      artist: "Student A",
    });
    await caller.exhibition.saveSettings({
      titleZh: "展覽",
      titleEn: "Exhibition",
      statementZh: "精簡說明。",
      statementEn: "A concise statement.",
    });
    await caller.exhibition.importDrive({
      id: 1,
      url: "https://drive.google.com/file/d/abcdefghij/view",
    });
    await caller.guestbook.moderate({ id: 9, hidden: true });

    expect(repository.saveCardTextOverride).toHaveBeenCalledWith(
      expect.objectContaining({ cardId: 1, artist: "Student A" }),
    );
    expect(repository.saveExhibitionSettings).toHaveBeenCalledWith(
      expect.objectContaining({ titleZh: "展覽" }),
    );
    expect(repository.saveCardMedia).toHaveBeenCalledWith(1, {
      imageUrl: "/manus-storage/drive.png",
      driveUrl: "https://drive.google.com/file/d/abcdefghij/view",
    });
    expect(repository.setGuestbookEntryHidden).toHaveBeenCalledWith(9, true);
  });

  it("validates public entries, does not fake honeypot posts, and persists a real submission", async () => {
    const caller = appRouter.createCaller(context(null));

    await expect(
      caller.guestbook.add({ name: " ", message: "A message" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.guestbook.add({ name: "Visitor", message: "A message", website: "bot" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(repository.addGuestbookEntry).not.toHaveBeenCalled();

    const entry = await caller.guestbook.add({
      name: "  Visitor  ",
      message: "  A message about the show.  ",
      photo: { data: "iVBORw0KGgo=", mimeType: "image/png" },
    });

    expect(media.uploadGuestbookPhoto).toHaveBeenCalledWith({
      data: "iVBORw0KGgo=",
      mimeType: "image/png",
    });
    expect(repository.addGuestbookEntry).toHaveBeenCalledWith({
      name: "Visitor",
      message: "A message about the show.",
      photoUrl: "/manus-storage/guest.png",
    });
    expect(entry).toMatchObject({ id: 9, hidden: false });
  });

  it("requires two distinct known cards before attempting a public reading", async () => {
    const caller = appRouter.createCaller(context(null));

    await expect(
      caller.reading.interpret({ cardIds: [1, 1], topic: "study", lang: "zh" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.reading.interpret({ cardIds: [1, 37], topic: "study", lang: "zh" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(reading.interpretCards).not.toHaveBeenCalled();

    await expect(
      caller.reading.interpret({ cardIds: [1, 2], topic: "study", lang: "zh" }),
    ).resolves.toEqual({ text: "A symbolic prompt.", source: "ai" });
    expect(reading.assertReadingRateLimit).toHaveBeenCalled();
  });
});
