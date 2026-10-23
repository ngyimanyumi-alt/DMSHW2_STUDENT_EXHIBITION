import type { CardSeed } from "@shared/cards";
import { invokeLLM } from "./_core/llm";
import { READING_ACTIONS } from "./readingGuidance";

export type ReadingTopic = "study" | "love" | "daily";
export type ReadingLanguage = "zh" | "en";

const READING_MODEL = "gemini-3.8-flash";
const CACHE_MS = 2 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 3;
const AI_TIMEOUT_MS = 9_000;
const MAX_READING_LENGTH = { zh: 240, en: 600 } as const;
const readingCache = new Map<string, { text: string; expiresAt: number }>();
const readingAttempts = new Map<string, number[]>();

function topicLabel(topic: ReadingTopic, lang: ReadingLanguage): string {
  const labels = {
    zh: { study: "學習", love: "愛情與人際", daily: "日常" },
    en: { study: "study", love: "love and relationships", daily: "daily life" },
  } as const;
  return labels[lang][topic];
}

export function catalogReading(
  cards: [CardSeed, CardSeed],
  topic: ReadingTopic,
  lang: ReadingLanguage,
): string {
  const [first, second] = cards;
  const topicText = topicLabel(topic, lang);
  if (lang === "zh") {
    const meaning = (card: CardSeed) =>
      card.keywordsZh.split("、").slice(0, 2).join("與");
    return `談到${topicText}，可以把「${first.nameZh}」看作${meaning(first)}的提醒，把「${second.nameZh}」看作${meaning(second)}的提醒。可以先${READING_ACTIONS[first.id][topic].zh}。接著${READING_ACTIONS[second.id][topic].zh}。`;
  }
  const meaning = (card: CardSeed) =>
    card.keywordsEn.split(",").slice(0, 2).join(" and").toLowerCase();
  return `For ${topicText}, think of ${first.nameEn} as ${meaning(first)}, and ${second.nameEn} as ${meaning(second)}. Try to ${READING_ACTIONS[first.id][topic].en}. You could also ${READING_ACTIONS[second.id][topic].en}.`;
}

export function assertReadingRateLimit(clientKey: string): void {
  const now = Date.now();
  const recent = (readingAttempts.get(clientKey) ?? []).filter(
    (at) => now - at < RATE_WINDOW_MS,
  );
  if (recent.length >= RATE_MAX_REQUESTS) {
    readingAttempts.set(clientKey, recent);
    throw new Error("RATE_LIMITED");
  }
  recent.push(now);
  readingAttempts.set(clientKey, recent);
}

function cacheKey(
  cards: [CardSeed, CardSeed],
  topic: ReadingTopic,
  lang: ReadingLanguage,
): string {
  return `${lang}:${topic}:${cards[0].id}:${cards[1].id}`;
}

function cleanModelText(
  value: unknown,
  cards: [CardSeed, CardSeed],
  lang: ReadingLanguage,
): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length > MAX_READING_LENGTH[lang]) return null;
  const normalized = text.toLowerCase();
  if (
    !cards.every((card) =>
      normalized.includes(
        (lang === "zh" ? card.nameZh : card.nameEn).toLowerCase(),
      ),
    )
  )
    return null;
  if (!/[。.!?！？][」』”"')\]]*$/.test(text)) return null;
  return text;
}

export async function interpretCards(input: {
  cards: [CardSeed, CardSeed];
  topic: ReadingTopic;
  lang: ReadingLanguage;
}): Promise<{ text: string; source: "ai" | "catalog" }> {
  const key = cacheKey(input.cards, input.topic, input.lang);
  const cached = readingCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { text: cached.text, source: "ai" };
  }
  if (cached) readingCache.delete(key);

  const [first, second] = input.cards;
  const cardCopy =
    input.lang === "zh"
      ? `卡一：${first.nameZh}（${first.keywordsZh}；${first.descriptionZh}）\n卡二：${second.nameZh}（${second.keywordsZh}；${second.descriptionZh}）`
      : `Card one: ${first.nameEn} (${first.keywordsEn}; ${first.descriptionEn})\nCard two: ${second.nameEn} (${second.keywordsEn}; ${second.descriptionEn})`;
  const system =
    input.lang === "zh"
      ? "為學生寫一段雷諾曼卡牌反思。只寫 2–3 句繁體中文，約 80–160 字，用簡短、日常的說法，不堆砌關鍵字。點名兩張卡，簡單說明它們的意涵如何一起回應題目，再給一至兩個今天能嘗試的小步驟，說清楚做甚麼、如何做。建議必須來自這組卡牌和所選主題：學習用於溫習、作業或探索方向；人際用於溝通、關心或界線；日常用於習慣、休息或靈感。不要每次套用相同結尾，不要只叫讀者思考或探索，也不要固定以拼貼或速寫收尾；只有切合題目時才建議創作。語氣溫和、尊重、鼓勵而實際，不用嚇人、責備、武斷或批判的說法。遇到困難的象徵，承認難處並提出可控制的小行動，不保證成功，不猜測別人的心意。這是符號反思，不是命運或未來預測；不用重複免責聲明，不要問候、口號、幸運色或提及 AI。"
      : "Write a Lenormand card reflection for students in 2–3 short, plain-language English sentences, about 45–85 words. Name both cards and briefly explain how their meanings work together for the topic, then give one or two small steps to try today, saying what to do and how. Ground the advice in this pair and topic: study means revision, assignments or exploring directions; relationships means communication, care or boundaries; daily life means routines, rest or inspiration. Do not reuse a stock ending, merely tell the reader to reflect or explore, or always end with a collage or sketch; suggest art only when relevant. Use a gentle, respectful, encouraging but realistic tone, without frightening, blaming, blunt or judgmental language. Acknowledge difficult symbols and offer manageable actions within the reader's control, without promising success or guessing another person's feelings. This is symbolic reflection, not fate or a prediction of the future; do not repeat a disclaimer. No greeting, slogan, lucky color or mention of AI.";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const response = await invokeLLM({
      model: READING_MODEL,
      maxTokens: 1024,
      reasoning: { effort: "low" },
      signal: controller.signal,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `${input.lang === "zh" ? "題目" : "Topic"}：${topicLabel(input.topic, input.lang)}\n${cardCopy}`,
        },
      ],
    });
    const choice = response.choices?.[0];
    const text = cleanModelText(
      choice?.message?.content,
      input.cards,
      input.lang,
    );
    if (choice?.finish_reason !== "stop" || !text)
      throw new Error("Incomplete reading");
    readingCache.set(key, { text, expiresAt: Date.now() + CACHE_MS });
    return { text, source: "ai" };
  } catch {
    return {
      text: catalogReading(input.cards, input.topic, input.lang),
      source: "catalog",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** Test-only reset used to keep in-memory public request controls isolated. */
export function resetReadingMemoryForTests(): void {
  readingCache.clear();
  readingAttempts.clear();
}
