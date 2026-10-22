import { storagePut } from "./storage";

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AcceptedImageMimeType = (typeof ACCEPTED_IMAGE_MIME_TYPES)[number];

const MAX_ARTWORK_BYTES = 8 * 1024 * 1024;
const MAX_GUESTBOOK_PHOTO_BYTES = 5 * 1024 * 1024;
const DRIVE_TIMEOUT_MS = 12_000;
const SAFE_FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;
const SAFE_RESOURCE_KEY = /^[A-Za-z0-9_-]{5,300}$/;

export class GalleryMediaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GalleryMediaError";
  }
}

const imageError = () =>
  new GalleryMediaError(
    "圖片格式或大小不符合要求／The image format or size is not allowed."
  );

const driveError = () =>
  new GalleryMediaError(
    "無法下載公開的 Google Drive 圖片；請確認檔案設為知道連結的任何人可檢視。／Unable to download a public Google Drive image. Please make the file viewable to anyone with the link."
  );

function detectedImageMimeType(
  bytes: Uint8Array
): AcceptedImageMimeType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function extensionFor(mimeType: AcceptedImageMimeType): "jpg" | "png" | "webp" {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  return "webp";
}

export function decodeBase64Image(
  data: string,
  declaredMimeType: AcceptedImageMimeType,
  maxBytes: number
): { bytes: Buffer; mimeType: AcceptedImageMimeType } {
  const maxBase64Length = Math.ceil((maxBytes * 4) / 3) + 4;
  if (
    !data ||
    data.length > maxBase64Length ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      data
    )
  ) {
    throw imageError();
  }

  const bytes = Buffer.from(data, "base64");
  if (bytes.length === 0 || bytes.length > maxBytes) throw imageError();
  const actualMimeType = detectedImageMimeType(bytes);
  if (!actualMimeType || actualMimeType !== declaredMimeType)
    throw imageError();
  return { bytes, mimeType: actualMimeType };
}

async function putImage(
  prefix: "artwork" | "guestbook",
  id: number | string,
  bytes: Buffer,
  mimeType: AcceptedImageMimeType
): Promise<{ imageUrl: string }> {
  const object = await storagePut(
    `gallery/${prefix}/${id}.${extensionFor(mimeType)}`,
    bytes,
    mimeType
  );
  return { imageUrl: object.url };
}

export async function uploadArtworkImage(input: {
  cardId: number;
  data: string;
  mimeType: AcceptedImageMimeType;
}): Promise<{ imageUrl: string }> {
  const image = decodeBase64Image(
    input.data,
    input.mimeType,
    MAX_ARTWORK_BYTES
  );
  return putImage("artwork", input.cardId, image.bytes, image.mimeType);
}

export async function uploadGuestbookPhoto(input: {
  data: string;
  mimeType: AcceptedImageMimeType;
}): Promise<{ imageUrl: string }> {
  const image = decodeBase64Image(
    input.data,
    input.mimeType,
    MAX_GUESTBOOK_PHOTO_BYTES
  );
  return putImage(
    "guestbook",
    crypto.randomUUID(),
    image.bytes,
    image.mimeType
  );
}

export type PublicDriveFile = {
  fileId: string;
  resourceKey?: string;
  sourceUrl: string;
};

/** Accept only explicitly supported Google Drive share URL shapes. */
export function parsePublicDriveUrl(value: string): PublicDriveFile {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new GalleryMediaError(
      "Google Drive 連結格式不正確／The Google Drive link format is invalid."
    );
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "drive.google.com" ||
    url.port ||
    url.username ||
    url.password
  ) {
    throw new GalleryMediaError(
      "只接受指定格式的 Google Drive HTTPS 連結／Only supported Google Drive HTTPS links are accepted."
    );
  }

  let fileId: string | null = null;
  const filePath = url.pathname.match(/^\/file\/d\/([^/]+)(?:\/.*)?$/);
  if (filePath) {
    fileId = filePath[1] ?? null;
  } else if (
    (url.pathname === "/open" ||
      url.pathname === "/uc" ||
      url.pathname === "/thumbnail") &&
    url.searchParams.has("id")
  ) {
    fileId = url.searchParams.get("id");
  }

  if (!fileId || !SAFE_FILE_ID.test(fileId)) {
    throw new GalleryMediaError(
      "Google Drive 檔案識別碼不正確／The Google Drive file identifier is invalid."
    );
  }
  const resourceKey = url.searchParams.get("resourcekey") ?? undefined;
  if (resourceKey && !SAFE_RESOURCE_KEY.test(resourceKey)) {
    throw new GalleryMediaError(
      "Google Drive resource key 不正確／The Google Drive resource key is invalid."
    );
  }

  return { fileId, resourceKey, sourceUrl: url.toString() };
}

function fixedDriveDownloadUrl(file: PublicDriveFile): URL {
  const url = new URL("https://drive.usercontent.google.com/download");
  url.searchParams.set("id", file.fileId);
  url.searchParams.set("export", "download");
  url.searchParams.set("confirm", "t");
  if (file.resourceKey) url.searchParams.set("resourcekey", file.resourceKey);
  return url;
}

async function readResponseAtMost(
  response: Response,
  maxBytes: number
): Promise<Buffer> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw driveError();
  }
  if (!response.body) throw driveError();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw driveError();
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof GalleryMediaError) throw error;
    throw driveError();
  }
  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

export async function importPublicDriveArtwork(input: {
  cardId: number;
  url: string;
}): Promise<{ imageUrl: string; driveUrl: string }> {
  const driveFile = parsePublicDriveUrl(input.url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DRIVE_TIMEOUT_MS);
  let bytes: Buffer;
  try {
    const response = await fetch(fixedDriveDownloadUrl(driveFile), {
      signal: controller.signal,
      redirect: "error",
      headers: { accept: "image/jpeg,image/png,image/webp" },
    });
    if (!response.ok) throw driveError();
    bytes = await readResponseAtMost(response, MAX_ARTWORK_BYTES);
  } catch (error) {
    if (error instanceof GalleryMediaError) throw error;
    throw driveError();
  } finally {
    clearTimeout(timeout);
  }

  const mimeType = detectedImageMimeType(bytes);
  if (!mimeType) throw driveError();
  const stored = await putImage("artwork", input.cardId, bytes, mimeType);
  return { ...stored, driveUrl: driveFile.sourceUrl };
}

export function isGalleryMediaError(
  error: unknown
): error is GalleryMediaError {
  return error instanceof GalleryMediaError;
}
