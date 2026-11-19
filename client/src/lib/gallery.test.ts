import { describe, expect, it } from "vitest";
import { getDisplayImageUrl } from "./gallery";

describe("getDisplayImageUrl", () => {
  it("uses the Drive thumbnail endpoint for stored upload URLs", () => {
    expect(
      getDisplayImageUrl(
        "https://drive.google.com/uc?export=view&id=abc123&resourcekey=secret",
      ),
    ).toBe("https://drive.google.com/thumbnail?id=abc123&sz=w2000");
  });

  it("converts standard Drive share links to thumbnail URLs", () => {
    expect(
      getDisplayImageUrl("https://drive.google.com/file/d/abc123/view"),
    ).toBe("https://drive.google.com/thumbnail?id=abc123&sz=w2000");
  });

  it("leaves non-Drive image URLs unchanged", () => {
    const url = "https://images.example.test/artwork.png";
    expect(getDisplayImageUrl(url)).toBe(url);
  });
});
