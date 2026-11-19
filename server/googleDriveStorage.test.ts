import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callGoogleStorage } from "./googleDriveStorage";

describe("Google Apps Script storage client", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv(
      "GOOGLE_APPS_SCRIPT_URL",
      "https://script.google.com/macros/s/test-deployment/exec",
    );
    vi.stubEnv("GOOGLE_APPS_SCRIPT_SECRET", "test-only-secret");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends storage actions to the configured endpoint with the private secret", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: { imageUrl: "https://drive.google.com/image" },
        }),
      ),
    );

    await expect(
      callGoogleStorage<{ imageUrl: string }>("storeImage", {
        data: "aGVsbG8=",
        mimeType: "image/png",
      }),
    ).resolves.toEqual({ imageUrl: "https://drive.google.com/image" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://script.google.com/macros/s/test-deployment/exec");
    expect(JSON.parse(String(options?.body))).toEqual({
      action: "storeImage",
      payload: { data: "aGVsbG8=", mimeType: "image/png" },
      secret: "test-only-secret",
    });
  });

  it("rejects a missing endpoint configuration without making a request", async () => {
    vi.stubEnv("GOOGLE_APPS_SCRIPT_URL", "");

    await expect(callGoogleStorage("getCardOverrides")).rejects.toThrow(
      "GOOGLE_APPS_SCRIPT_URL and GOOGLE_APPS_SCRIPT_SECRET are required",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an Apps Script error response", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "unauthorized" })),
    );

    await expect(callGoogleStorage("getCardOverrides")).rejects.toThrow(
      "Google Drive/Sheets storage failed: unauthorized",
    );
  });
});
