import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const llm = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => llm);

import { CARD_CATALOG } from "../shared/cards";
import {
  catalogReading,
  interpretCards,
  resetReadingMemoryForTests,
} from "./galleryReading";

beforeEach(() => {
  llm.invokeLLM.mockReset();
  resetReadingMemoryForTests();
});
afterEach(() => resetReadingMemoryForTests());

const completeReading =
  "騎士帶來訊號，三葉草提示小小轉機。以兩個符號做一張快速拼貼。";
function modelResponse(content: string, finishReason = "stop") {
  return { choices: [{ finish_reason: finishReason, message: { content } }] };
}

describe("card reading service", () => {
  const cards = [CARD_CATALOG[0]!, CARD_CATALOG[1]!] as const;
  const input = {
    cards: [...cards] as [(typeof cards)[0], (typeof cards)[1]],
    topic: "study" as const,
    lang: "zh" as const,
  };

  it("returns source ai only for a complete response mentioning both cards and caches it briefly", async () => {
    llm.invokeLLM.mockResolvedValue(modelResponse(completeReading));
    await expect(interpretCards(input)).resolves.toMatchObject({
      source: "ai",
      text: completeReading,
    });
    await expect(interpretCards(input)).resolves.toMatchObject({
      source: "ai",
    });
    expect(llm.invokeLLM).toHaveBeenCalledOnce();
    expect(llm.invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-3.8-flash",
        maxTokens: 1024,
        reasoning: { effort: "low" },
      })
    );
  });

  it("rejects a token-truncated completion even when its text otherwise looks complete", async () => {
    llm.invokeLLM.mockResolvedValueOnce(
      modelResponse(completeReading, "length")
    );
    llm.invokeLLM.mockResolvedValueOnce(modelResponse(completeReading));
    expect(await interpretCards(input)).toEqual({
      source: "catalog",
      text: catalogReading(input.cards, input.topic, input.lang),
    });
    expect((await interpretCards(input)).source).toBe("ai");
    expect(llm.invokeLLM).toHaveBeenCalledTimes(2);
  });

  it("does not accept or cache the observed half-sentence as an AI success", async () => {
    const pair = [
      CARD_CATALOG.find(card => card.nameZh === "岔路")!,
      CARD_CATALOG.find(card => card.nameZh === "三葉草")!,
    ] as const;
    llm.invokeLLM.mockResolvedValue(
      modelResponse("「岔路」象徵在學習過程中面臨多種研究方向")
    );
    const result = await interpretCards({
      cards: [...pair],
      topic: "study",
      lang: "zh",
    });
    expect(result.source).toBe("catalog");
    expect(result.text).toContain("岔路");
    expect(result.text).toContain("三葉草");
    expect(result.text).toMatch(/。$/);
  });

  it.each([
    ["騎士提醒留意學習上的新訊號。畫一張速寫。", "stop"],
    ["騎士與三葉草提示留意新訊號，接下來", "stop"],
    [completeReading, "content_filter"],
    [completeReading, undefined],
  ])(
    "rejects incomplete or abnormal model output: %s (%s)",
    async (text, reason) => {
      llm.invokeLLM.mockResolvedValue({
        choices: [{ finish_reason: reason, message: { content: text } }],
      });
      expect((await interpretCards(input)).source).toBe("catalog");
    }
  );

  it("uses an explicitly labeled complete catalog fallback when the LLM fails", async () => {
    llm.invokeLLM.mockRejectedValue(new Error("upstream unavailable"));
    const result = await interpretCards({
      cards: [...cards],
      topic: "daily",
      lang: "en",
    });
    expect(result).toEqual({
      source: "catalog",
      text: catalogReading([...cards], "daily", "en"),
    });
    expect(result.text).toContain("not a prediction of the future");
  });
});
