import type { AcceptedImageMimeType } from "./galleryMedia";
import { callGoogleStorage } from "./googleDriveStorage";

export async function storeGalleryImage(
  data: Buffer,
  mimeType: AcceptedImageMimeType,
): Promise<{ imageUrl: string }> {
  return callGoogleStorage<{ imageUrl: string }>("storeImage", {
    data: data.toString("base64"),
    mimeType,
  });
}
