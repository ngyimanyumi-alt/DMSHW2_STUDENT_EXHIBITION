import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const llm = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => llm);

import { CARD_CATALOG } from "../shared/cards";
import {
  catalogReading,
  interpretCards,
  resetReadingMemoryForTests,
  type ReadingLanguage,
  type ReadingTopic,
} from "./galleryReading";

beforeEach(() => {
  llm.invokeLLM.mockReset();
  resetReadingMemoryForTests();
});
afterEach(() => resetReadingMemoryForTests());

const completeReading =
  "學習上，騎士可提醒你主動提問，三葉草則讓人想到小步嘗試。今天向老師問清楚一項作業要求，再用十分鐘試一道有興趣的題目。";
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
      response: completeReading,
    },
    {
      lang: "en" as const,
      response:
        "For study, Rider can represent asking questions and Clover a small experiment. Ask your teacher about one unclear assignment requirement, then try an interesting question for ten minutes.",
    },
  ])(
    "gives accessible, gentle $lang guidance without forcing positivity",
    async ({ lang, response }) => {
      llm.invokeLLM.mockResolvedValue(modelResponse(response));
      const result = await interpretCards({
        cards: [...cards],
        topic: "study",
        lang,
      });
      expect(result).toEqual({ source: "ai", text: response });
      const messages = llm.invokeLLM.mock.calls[0]![0].messages;
      const system = messages[0].content;
      expect(system).toMatch(
        lang === "zh" ? /簡短、日常/ : /short, plain-language/,
      );
      expect(system).toMatch(
        lang === "zh"
          ? /溫和、尊重、鼓勵而實際/
          : /gentle, respectful, encouraging but realistic/,
      );
      expect(system).toContain("2–3");
      expect(system).toMatch(
        lang === "zh" ? /今天能嘗試的小步驟/ : /small steps to try today/,
      );
      expect(system).toMatch(
        lang === "zh"
          ? /不保證成功，不猜測別人的心意/
          : /without promising success or guessing another person's feelings/,
      );
      expect(system).toMatch(
        lang === "zh"
          ? /不要固定以拼貼或速寫收尾/
          : /or always end with a collage or sketch/,
      );
      expect(system).toMatch(
        lang === "zh" ? /不是命運或未來預測/ : /not fate or a prediction/,
      );
      expect(messages[1].content).toContain(lang === "zh" ? "學習" : "study");
      for (const card of cards) {
        expect(messages[1].content).toContain(
          lang === "zh" ? card.nameZh : card.nameEn,
        );
        expect(messages[1].content).toContain(
          lang === "zh" ? card.descriptionZh : card.descriptionEn,
        );
      }
    },
  );

  it.each(["zh", "en"] as const)(
    "falls back rather than showing an overlong %s reading",
    async (lang) => {
      const text =
        lang === "zh"
          ? `騎士與三葉草。${"先試一道題目。".repeat(40)}`
          : `Rider and Clover. ${"Try one question. ".repeat(40)}`;
      llm.invokeLLM.mockResolvedValue(modelResponse(text));
      expect((await interpretCards({ ...input, lang })).source).toBe("catalog");
    },
  );

  it("does not reuse a cached reading for a different topic, language, or pair", async () => {
    llm.invokeLLM.mockResolvedValue(modelResponse(completeReading));
    await interpretCards(input);
    await interpretCards({ ...input, topic: "love" });
    await interpretCards({ ...input, lang: "en" });
    await interpretCards({ ...input, cards: [cards[0], CARD_CATALOG[2]!] });
    expect(llm.invokeLLM).toHaveBeenCalledTimes(4);
  });
});

describe("catalog guidance", () => {
  const topics: ReadingTopic[] = ["study", "love", "daily"];
  const languages: ReadingLanguage[] = ["zh", "en"];
  const pair = [CARD_CATALOG[20]!, CARD_CATALOG[32]!] as const; // Mountain + Key

  it.each([
    {
      lang: "zh" as const,
      topic: "study" as const,
      context: /學習/,
      actions: [/作業.*十分鐘/, /題目.*條件.*解法/],
    },
    {
      lang: "en" as const,
      topic: "study" as const,
      context: /study/,
      actions: [/assignment.*ten minutes/, /condition.*question.*solution/],
    },
    {
      lang: "zh" as const,
      topic: "love" as const,
      context: /人際/,
      actions: [/平靜.*改善/, /需要.*一起.*解法/],
    },
    {
      lang: "en" as const,
      topic: "love" as const,
      context: /relationships/,
      actions: [/calmly.*change/, /need.*solution together/],
    },
    {
      lang: "zh" as const,
      topic: "daily" as const,
      context: /日常/,
      actions: [/拆小.*做得到/, /資源或資訊/],
    },
    {
      lang: "en" as const,
      topic: "daily" as const,
      context: /daily life/,
      actions: [/smaller parts.*manageable/, /resource.*information/],
    },
  ])(
    "offers concrete $lang steps for $topic, not just a topic label",
    ({ lang, topic, context, actions }) => {
      const text = catalogReading([...pair], topic, lang);
      expect(text).toMatch(context);
      for (const action of actions) expect(text).toMatch(action);
      expect(text).not.toMatch(/拼貼|速寫|collage|sketch/);
    },
  );

  it.each(languages)(
    "changes the advice itself when either card or the topic changes (%s)",
    (lang) => {
      // Compare only the action sentences, not the introductory names or topic.
      const advice = (first: number, second: number, topic: ReadingTopic) =>
        catalogReading(
          [CARD_CATALOG[first]!, CARD_CATALOG[second]!],
          topic,
          lang,
        )
          .split(/[。.]/)
          .slice(1)
          .join(".");
      expect(new Set(topics.map((topic) => advice(0, 1, topic))).size).toBe(3);
      for (const topic of topics) {
        expect(
          new Set(
            CARD_CATALOG.slice(1).map((card) => advice(0, card.id - 1, topic)),
          ).size,
        ).toBe(35);
        expect(
          new Set(
            CARD_CATALOG.slice(0, -1).map((card) =>
              advice(card.id - 1, 35, topic),
            ),
          ).size,
        ).toBe(35);
      }
    },
  );

  it.each(languages)(
    "keeps every pair and topic short, readable and complete (%s)",
    (lang) => {
      for (const first of CARD_CATALOG) {
        for (const second of CARD_CATALOG) {
          if (first.id === second.id) continue;
          for (const topic of topics) {
            const text = catalogReading([first, second], topic, lang);
            const name = lang === "zh" ? "nameZh" : "nameEn";
            expect(text).toContain(first[name]);
            expect(text).toContain(second[name]);
            expect(text).not.toMatch(/undefined|null/);
            expect(text.length).toBeLessThanOrEqual(lang === "zh" ? 240 : 600);
            expect(text.match(/[。.!?！？]/g)?.length).toBeGreaterThanOrEqual(
              2,
            );
            expect(text.match(/[。.!?！？]/g)?.length).toBeLessThanOrEqual(3);
            if (lang === "en")
              expect(text.split(/\s+/).length).toBeLessThanOrEqual(100);
            expect(text).not.toMatch(
              /看看它們如何連結|不必急著下結論|small collage or sketch|not a prediction|不是.*預測/,
            );
            expect(text).not.toMatch(
              /注定|必定成功|災難|背叛|死亡|guaranteed|disaster|betrayal|death|destined/i,
            );
          }
        }
      }
    },
  );

  it.each(languages)(
    "handles challenging symbols with manageable choices, not warnings (%s)",
    (lang) => {
      const text = catalogReading(
        [CARD_CATALOG[7]!, CARD_CATALOG[35]!],
        "study",
        lang,
      );
      expect(text).toMatch(
        lang === "zh"
          ? /沒有效.*方法.*較短.*練習/
          : /unhelpful study method.*shorter practice/,
      );
      expect(text).toMatch(
        lang === "zh"
          ? /意義.*量力而為/
          : /why this subject matters.*manageable/,
      );
    },
  );
});
