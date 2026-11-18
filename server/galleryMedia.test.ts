import { afterEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({ storeGalleryImage: vi.fn() }));
vi.mock("./storage", () => storage);

import {
  decodeBase64Image,
  importPublicDriveArtwork,
  parsePublicDriveUrl,
} from "./galleryMedia";

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("gallery media safety", () => {
  it("accepts only the documented Drive URL patterns and no arbitrary hosts", () => {
    expect(
      parsePublicDriveUrl("https://drive.google.com/file/d/abcdefghij_123/view?resourcekey=abcde_123"),
    ).toMatchObject({ fileId: "abcdefghij_123", resourceKey: "abcde_123" });
    expect(
      parsePublicDriveUrl("https://drive.google.com/open?id=abcdefghij_123"),
    ).toMatchObject({ fileId: "abcdefghij_123" });
    expect(
      parsePublicDriveUrl("https://drive.google.com/thumbnail?id=abcdefghij_123"),
    ).toMatchObject({ fileId: "abcdefghij_123" });

    for (const value of [
      "http://drive.google.com/open?id=abcdefghij_123",
      "https://drive.google.com.evil.test/open?id=abcdefghij_123",
      "https://evil.test/image.png",
      "https://drive.google.com/uc?url=https://evil.test/image.png",
    ]) {
      expect(() => parsePublicDriveUrl(value)).toThrow();
    }
  });

  it("requires image bytes to match the requested MIME type", () => {
    expect(() =>
      decodeBase64Image(Buffer.from(png).toString("base64"), "image/jpeg", 100),
    ).toThrow();
    expect(
      decodeBase64Image(Buffer.from(png).toString("base64"), "image/png", 100),
    ).toMatchObject({ mimeType: "image/png" });
  });

  it("downloads only through the fixed Google host then persists verified original bytes", async () => {
    storage.storeGalleryImage.mockResolvedValue({
      imageUrl: "/api/media/test-image",
    });
    const request = vi.fn().mockResolvedValue(
      new Response(png, {
        status: 200,
        headers: { "content-type": "image/png", "content-length": String(png.length) },
      }),
    );
    vi.stubGlobal("fetch", request);

    const output = await importPublicDriveArtwork({
      url: "https://drive.google.com/uc?id=abcdefghij_123",
    });

    expect(request).toHaveBeenCalledOnce();
    const [url, init] = request.mock.calls[0] as [URL, RequestInit];
    expect(url.hostname).toBe("drive.usercontent.google.com");
    expect(url.searchParams.get("id")).toBe("abcdefghij_123");
    expect(init.redirect).toBe("error");
    expect(storage.storeGalleryImage).toHaveBeenCalledWith(
      Buffer.from(png),
      "image/png",
    );
    expect(output).toEqual({
      imageUrl: "/api/media/test-image",
      driveUrl: "https://drive.google.com/uc?id=abcdefghij_123",
    });
  });

  it("does not upload an HTML or private-drive response as artwork", async () => {
    const request = vi.fn().mockResolvedValue(
      new Response("permission denied", { status: 200, headers: { "content-type": "text/html" } }),
    );
    vi.stubGlobal("fetch", request);

    await expect(
      importPublicDriveArtwork({
        url: "https://drive.google.com/open?id=abcdefghij_123",
      }),
    ).rejects.toThrow(/Unable to download a public Google Drive image/);
    expect(storage.storeGalleryImage).not.toHaveBeenCalled();
  });

  it("accepts images at the 8 MiB boundary without overflowing the base64 matcher", () => {
    const max = 8 * 1024 * 1024;
    const data = Buffer.alloc(max);
    data.set(png);
    const encoded = data.toString("base64");
    expect(decodeBase64Image(encoded, "image/png", max).bytes.length).toBe(max);
    expect(() => decodeBase64Image(encoded, "image/png", max - 1)).toThrow();
  });
});
