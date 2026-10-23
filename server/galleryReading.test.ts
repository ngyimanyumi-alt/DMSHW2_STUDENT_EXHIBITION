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
      }),
    );
  });

  it("rejects a token-truncated completion even when its text otherwise looks complete", async () => {
    llm.invokeLLM.mockResolvedValueOnce(
      modelResponse(completeReading, "length"),
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
      CARD_CATALOG.find((card) => card.nameZh === "岔路")!,
      CARD_CATALOG.find((card) => card.nameZh === "三葉草")!,
    ] as const;
    llm.invokeLLM.mockResolvedValue(
      modelResponse("「岔路」象徵在學習過程中面臨多種研究方向"),
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
    },
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
    expect(result.text).not.toContain("not a prediction of the future");
  });

  it.each([
    {
      lang: "zh" as const,
      response:
        "騎士帶來新的訊息，三葉草提供一個小小的可能。試著畫出你想探索的方向。",
      guidance: "語氣溫和、尊重",
      reflection: "可以慢慢觀察、思考選擇或探索成長",
    },
    {
      lang: "en" as const,
      response:
        "Rider suggests a new message, while Clover offers a small possibility. Sketch one direction you would like to explore.",
      guidance: "gentle, respectful tone",
      reflection: "reflect, consider manageable choices, or explore growth",
    },
  ])(
    "gives accessible, gentle $lang guidance without forcing positivity",
    async ({ lang, response, guidance, reflection }) => {
      llm.invokeLLM.mockResolvedValue(modelResponse(response));
      await interpretCards({
        cards: [...cards],
        topic: "study",
        lang,
      });
      const system = llm.invokeLLM.mock.calls[0]![0].messages[0].content;
      expect(system).toContain(guidance);
      expect(system).toContain(reflection);
      expect(system).toContain("2–3");
      expect(system).toContain(
        lang === "zh" ? "不要刻意精簡" : "do not shorten the reading",
      );
    },
  );

  it.each([
    [
      "zh" as const,
      "study" as const,
      "學習",
      "不必急著下結論",
      "小型拼貼或速寫",
    ],
    [
      "en" as const,
      "love" as const,
      "love and relationships",
      "without needing to decide",
      "small collage or sketch",
    ],
  ])(
    "keeps the %s catalog fallback specific, reflective, and complete",
    (lang, topic, topicText, gentleSuggestion, artSuggestion) => {
      const text = catalogReading([...cards], topic, lang);
      expect(text).toContain(topicText);
      expect(text).toContain(lang === "zh" ? cards[0].nameZh : cards[0].nameEn);
      expect(text).toContain(lang === "zh" ? cards[1].nameZh : cards[1].nameEn);
      expect(text).toContain(gentleSuggestion);
      expect(text).toContain(artSuggestion);
      expect(text.match(/[。.!?！？]/g) ?? []).toHaveLength(3);
      expect(text).not.toMatch(
        lang === "zh" ? /不是對未來的預測/ : /not a prediction of the future/,
      );
    },
  );
});
