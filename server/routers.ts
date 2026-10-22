import { CARD_CATALOG, type CardSeed } from "@shared/cards";
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  importPublicDriveArtwork,
  isGalleryMediaError,
  uploadArtworkImage,
  uploadGuestbookPhoto,
} from "./galleryMedia";
import {
  addGuestbookEntry,
  getAllGuestbookEntries,
  getCardOverrides,
  getSavedExhibitionSettings,
  getVisibleGuestbookEntries,
  saveCardMedia,
  saveCardTextOverride,
  saveExhibitionSettings,
  setGuestbookEntryHidden,
} from "./galleryRepository";
import {
  assertReadingRateLimit,
  interpretCards,
  type ReadingLanguage,
  type ReadingTopic,
} from "./galleryReading";

const DEFAULT_SETTINGS = {
  titleZh: "符號學者",
  titleEn: "The Symbolist",
  statementZh:
    "以雷諾曼符號為起點，學生在視覺藝術課中探索觀察、AI 圖像與創作實驗。",
  statementEn:
    "Beginning with Lenormand symbols, students explore observation, AI imagery, and visual experimentation in art class.",
} as const;

const cardIds = new Set(CARD_CATALOG.map(card => card.id));
const imageMimeType = z.enum(ACCEPTED_IMAGE_MIME_TYPES);
const cardIdInput = z.number().int().min(1).max(36);
const cardTextInput = z.object({
  id: cardIdInput,
  nameZh: z.string().trim().max(160),
  nameEn: z.string().trim().max(160),
  keywordsZh: z.string().trim().max(600),
  keywordsEn: z.string().trim().max(600),
  descriptionZh: z.string().trim().max(2_000),
  descriptionEn: z.string().trim().max(2_000),
  artist: z.string().trim().max(160),
});
const settingsInput = z.object({
  titleZh: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  statementZh: z.string().trim().min(1).max(2_000),
  statementEn: z.string().trim().min(1).max(2_000),
});
const guestbookInput = z.object({
  name: z.string().trim().min(1).max(60),
  message: z.string().trim().min(1).max(600),
  photo: z
    .object({ data: z.string().min(1), mimeType: imageMimeType })
    .optional(),
  website: z.string().max(200).optional(),
});

const guestbookAttempts = new Map<string, number[]>();
const GUESTBOOK_WINDOW_MS = 10 * 60 * 1000;
const GUESTBOOK_MAX_REQUESTS = 3;

function knownCard(id: number): CardSeed {
  const card = CARD_CATALOG.find(candidate => candidate.id === id);
  if (!card || !cardIds.has(id)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "無效的卡牌編號／Invalid card identifier.",
    });
  }
  return card;
}

function clientKey(req: {
  ip?: string;
  socket?: { remoteAddress?: string };
}): string {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function checkGuestbookRateLimit(key: string): void {
  const now = Date.now();
  const recent = (guestbookAttempts.get(key) ?? []).filter(
    at => now - at < GUESTBOOK_WINDOW_MS
  );
  if (recent.length >= GUESTBOOK_MAX_REQUESTS) {
    guestbookAttempts.set(key, recent);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "請稍後再試／Please try again later.",
    });
  }
  recent.push(now);
  guestbookAttempts.set(key, recent);
}

function mediaError(error: unknown): never {
  if (isGalleryMediaError(error)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      "圖片處理或儲存失敗，請稍後再試。／Image processing or storage failed; please try again later.",
  });
}

function persistenceError(): never {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      "儲存變更失敗，請稍後再試。／Unable to save changes; please try again later.",
  });
}

function guestbookOutput(entry: {
  id: number;
  name: string;
  message: string;
  photoUrl: string | null;
  createdAt: Date;
  hidden: boolean;
}) {
  return {
    id: entry.id,
    name: entry.name,
    message: entry.message,
    photoUrl: entry.photoUrl,
    createdAt: entry.createdAt,
    hidden: entry.hidden,
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  exhibition: router({
    cards: publicProcedure.query(async () => {
      const overrides = await getCardOverrides();
      const byCardId = new Map(
        overrides.map(override => [override.cardId, override])
      );
      return CARD_CATALOG.map(card => {
        const override = byCardId.get(card.id);
        return {
          ...card,
          nameZh: override?.nameZh ?? card.nameZh,
          nameEn: override?.nameEn ?? card.nameEn,
          keywordsZh: override?.keywordsZh ?? card.keywordsZh,
          keywordsEn: override?.keywordsEn ?? card.keywordsEn,
          descriptionZh: override?.descriptionZh ?? card.descriptionZh,
          descriptionEn: override?.descriptionEn ?? card.descriptionEn,
          artist: override?.artist ?? "",
          imageUrl: override?.imageUrl ?? null,
          driveUrl: override?.driveUrl ?? null,
        };
      });
    }),
    settings: publicProcedure.query(async () => {
      const settings = await getSavedExhibitionSettings();
      if (!settings) return DEFAULT_SETTINGS;
      return {
        titleZh: settings.titleZh,
        titleEn: settings.titleEn,
        statementZh: settings.statementZh,
        statementEn: settings.statementEn,
      };
    }),
    saveCard: adminProcedure
      .input(cardTextInput)
      .mutation(async ({ input }) => {
        knownCard(input.id);
        const { id, ...cardText } = input;
        try {
          await saveCardTextOverride({ cardId: id, ...cardText });
        } catch {
          persistenceError();
        }
        return { success: true } as const;
      }),
    saveSettings: adminProcedure
      .input(settingsInput)
      .mutation(async ({ input }) => {
        try {
          await saveExhibitionSettings(input);
        } catch {
          persistenceError();
        }
        return { success: true } as const;
      }),
    importDrive: adminProcedure
      .input(
        z.object({ id: cardIdInput, url: z.string().trim().min(1).max(2_048) })
      )
      .mutation(async ({ input }) => {
        knownCard(input.id);
        try {
          const imported = await importPublicDriveArtwork({
            cardId: input.id,
            url: input.url,
          });
          await saveCardMedia(input.id, {
            imageUrl: imported.imageUrl,
            driveUrl: imported.driveUrl,
          });
          return { imageUrl: imported.imageUrl };
        } catch (error) {
          mediaError(error);
        }
      }),
    uploadArtwork: adminProcedure
      .input(
        z.object({
          id: cardIdInput,
          data: z.string().min(1),
          mimeType: imageMimeType,
        })
      )
      .mutation(async ({ input }) => {
        knownCard(input.id);
        try {
          const uploaded = await uploadArtworkImage({
            cardId: input.id,
            data: input.data,
            mimeType: input.mimeType,
          });
          await saveCardMedia(input.id, {
            imageUrl: uploaded.imageUrl,
            driveUrl: null,
          });
          return { imageUrl: uploaded.imageUrl };
        } catch (error) {
          mediaError(error);
        }
      }),
  }),
  guestbook: router({
    list: publicProcedure.query(async () =>
      (await getVisibleGuestbookEntries()).map(guestbookOutput)
    ),
    adminList: adminProcedure.query(async () =>
      (await getAllGuestbookEntries()).map(guestbookOutput)
    ),
    add: publicProcedure
      .input(guestbookInput)
      .mutation(async ({ ctx, input }) => {
        if (input.website?.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "無法發佈留言／Unable to post this entry.",
          });
        }
        checkGuestbookRateLimit(clientKey(ctx.req));

        let photoUrl: string | null = null;
        if (input.photo) {
          try {
            photoUrl = (
              await uploadGuestbookPhoto({
                data: input.photo.data,
                mimeType: input.photo.mimeType,
              })
            ).imageUrl;
          } catch (error) {
            mediaError(error);
          }
        }
        try {
          return guestbookOutput(
            await addGuestbookEntry({
              name: input.name,
              message: input.message,
              photoUrl,
            })
          );
        } catch {
          persistenceError();
        }
      }),
    moderate: adminProcedure
      .input(z.object({ id: z.number().int().positive(), hidden: z.boolean() }))
      .mutation(async ({ input }) => {
        try {
          await setGuestbookEntryHidden(input.id, input.hidden);
        } catch {
          persistenceError();
        }
        return { id: input.id, hidden: input.hidden };
      }),
  }),
  reading: router({
    interpret: publicProcedure
      .input(
        z.object({
          cardIds: z
            .tuple([cardIdInput, cardIdInput])
            .refine(
              ([first, second]) => first !== second,
              "Choose two different cards."
            ),
          topic: z.enum(["study", "love", "daily"]),
          lang: z.enum(["zh", "en"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cards: [CardSeed, CardSeed] = [
          knownCard(input.cardIds[0]),
          knownCard(input.cardIds[1]),
        ];
        try {
          assertReadingRateLimit(clientKey(ctx.req));
        } catch {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "請稍後再試／Please try again shortly.",
          });
        }
        return interpretCards({
          cards,
          topic: input.topic as ReadingTopic,
          lang: input.lang as ReadingLanguage,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
