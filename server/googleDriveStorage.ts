type StorageAction =
  | "getCardOverrides"
  | "saveCardTextOverride"
  | "saveCardMedia"
  | "getSavedExhibitionSettings"
  | "saveExhibitionSettings"
  | "getVisibleGuestbookEntries"
  | "getAllGuestbookEntries"
  | "addGuestbookEntry"
  | "setGuestbookEntryHidden"
  | "storeImage";

function getStorageConfig(): { url: string; secret: string } {
  const rawUrl = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET?.trim();
  if (!rawUrl || !secret) {
    throw new Error(
      "GOOGLE_APPS_SCRIPT_URL and GOOGLE_APPS_SCRIPT_SECRET are required",
    );
  }

  const url = new URL(rawUrl);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "script.google.com" ||
    !url.pathname.startsWith("/macros/s/")
  ) {
    throw new Error("GOOGLE_APPS_SCRIPT_URL is not a valid HTTPS web app URL");
  }
  return { url: url.toString(), secret };
}

export async function callGoogleStorage<T>(
  action: StorageAction,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const { url, secret } = getStorageConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, payload, secret }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Google Apps Script returned HTTP ${response.status}`);
  }

  let result: { ok?: boolean; data?: T; error?: string };
  try {
    result = (await response.json()) as typeof result;
  } catch {
    throw new Error("Google Apps Script returned an invalid response");
  }
  if (!result.ok) {
    throw new Error(
      `Google Drive/Sheets storage failed: ${result.error || "unknown error"}`,
    );
  }
  return result.data as T;
}
