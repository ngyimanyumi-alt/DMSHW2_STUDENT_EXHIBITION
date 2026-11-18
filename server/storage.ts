import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Express } from "express";
import { galleryMedia } from "../drizzle/schema";
import { getDb } from "./db";
import type { AcceptedImageMimeType } from "./galleryMedia";

export async function storeGalleryImage(
  data: Buffer,
  mimeType: AcceptedImageMimeType
): Promise<{ imageUrl: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for image storage");
  const id = randomUUID();
  await db.insert(galleryMedia).values({ id, mimeType, data });
  return { imageUrl: `/api/media/${id}` };
}

async function getStoredImage(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for image storage");
  const [image] = await db.select().from(galleryMedia).where(eq(galleryMedia.id, id)).limit(1);
  return image;
}

export function registerMediaRoutes(app: Express) {
  app.get("/api/media/:id", async (req, res) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
      res.status(404).end();
      return;
    }
    try {
      const image = await getStoredImage(req.params.id);
      if (!image) {
        res.status(404).end();
        return;
      }
      res.set({
        "Content-Type": image.mimeType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      }).send(image.data);
    } catch {
      console.error("[Media] Failed to load stored image");
      res.status(503).json({ error: "Image storage is unavailable" });
    }
  });
}
