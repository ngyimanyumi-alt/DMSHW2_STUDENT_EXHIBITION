import type { CardSeed } from "@shared/cards";
import { invokeLLM } from "./_core/llm";

export type ReadingTopic = "study" | "love" | "daily";
export type ReadingLanguage = "zh" | "en";

const READING_MODEL = "gemini-3.8-flash";
const CACHE_MS = 2 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 3;
const AI_TIMEOUT_MS = 9_000;
const MAX_READING_LENGTH = 720;
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
    return `在${topicText}中，把「${first.nameZh}」的${first.keywordsZh}和「${second.nameZh}」的${second.keywordsZh}當作兩個觀察角度：看看它們如何連結到一件具體事情，或帶出不同可能；不必急著下結論。試著從兩張卡各選一個細節做成小型拼貼或速寫，再記下你想多了解的一點。這是符號反思練習，不是對未來的預測。`;
  }
  return `For ${topicText}, consider ${first.nameEn}'s ${first.keywordsEn} alongside ${second.nameEn}'s ${second.keywordsEn}; notice how they connect to one concrete situation or suggest different possibilities, without needing to decide right away. Try a small collage or sketch using a detail from both cards, and note one thought or next step you may want to explore. This is a symbolic reflection, not a prediction of the future.`;
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
  if (!text || text.length > MAX_READING_LENGTH) return null;
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
      ? "你為學生寫雷諾曼符號練習。只寫 2–3 句繁體中文，使用一般讀者容易理解的自然用語，保留具體解釋和細節，不要刻意精簡。點出兩張卡的具體符號及其與題目的關係，最後一句給一個可嘗試的藝術創作建議。語氣溫和、尊重，不用嚇人、責備、武斷或批判的說法，也不要把解讀寫成必然結果；遇到較具挑戰的象徵時，將它當作可以慢慢觀察、思考選擇或探索成長的提醒，不必將每張卡都解讀為正面。這是符號反思，不是命運或未來預測；不要問候、稱讚、口號、幸運色、免責聲明或提及 AI。"
      : "Write a Lenormand symbol exercise for students in 2–3 natural, accessible English sentences. Keep the explanation and concrete detail; do not shorten the reading for brevity. Name both cards' concrete symbols and connect them to the topic, then end with a practical art-making suggestion. Use a gentle, respectful tone: avoid frightening, blaming, blunt, deterministic, or judgmental language. Treat challenging symbols as invitations to reflect, consider manageable choices, or explore growth, without making every card meaning unrealistically positive. This is a symbolic reflection, not fate or a prediction of the future. No greeting, praise, slogan, lucky color, disclaimer, or mention of AI.";

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
