import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Shuffle, Loader2 } from "lucide-react";
import { CardArtwork } from "@/components/CardArtwork";
import { trpc } from "@/lib/trpc";
import { shuffleDeck, togglePick } from "@/lib/deck";
import { COPY, type GalleryCard, type Language } from "@/lib/gallery";

type Topic = "study" | "love" | "daily";
export default function Draw({
  cards,
  lang,
}: {
  cards: GalleryCard[];
  lang: Language;
}) {
  const copy = COPY[lang];
  const [deck, setDeck] = useState<number[]>(() =>
    shuffleDeck(cards.map(card => card.id))
  );
  const [picked, setPicked] = useState<number[]>([]);
  const [topic, setTopic] = useState<Topic>("study");
  const [shuffling, setShuffling] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reading, setReading] = useState<{
    text: string;
    source: "ai" | "catalog";
  } | null>(null);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const requestVersion = useRef(0);
  const interpret = trpc.reading.interpret.useMutation();
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      requestVersion.current += 1;
    },
    []
  );
  useEffect(() => {
    requestVersion.current += 1;
    setReading(null);
    setError(false);
    setRevealed(false);
  }, [lang, topic]);

  useEffect(() => {
    if (!revealed) return;
    const frame = requestAnimationFrame(() => {
      const result = resultRef.current;
      const content = result?.closest<HTMLElement>(".exhibition-content");
      if (!result || !content) return;
      const top =
        content.scrollTop +
        result.getBoundingClientRect().top -
        content.getBoundingClientRect().top -
        16;
      content.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [revealed, reading, error, interpret.isPending]);

  function shuffle() {
    if (shuffling || interpret.isPending) return;
    requestVersion.current += 1;
    setShuffling(true);
    setPicked([]);
    setRevealed(false);
    setReading(null);
    setError(false);
    timer.current = setTimeout(() => {
      setDeck(previous => {
        let shuffled = shuffleDeck(previous);
        if (shuffled.every((id, index) => previous[index] === id))
          shuffled = [...shuffled.slice(1), shuffled[0]];
        return shuffled;
      });
      setShuffling(false);
      setShuffleCount(count => count + 1);
    }, 620);
  }
  async function reveal() {
    if (picked.length !== 2 || interpret.isPending) return;
    const version = ++requestVersion.current;
    setRevealed(true);
    setError(false);
    try {
      const result = await interpret.mutateAsync({
        cardIds: [picked[0], picked[1]],
        topic,
        lang,
      });
      if (requestVersion.current === version) setReading(result);
    } catch {
      if (requestVersion.current === version) setError(true);
    }
  }
  function changeTopic(value: Topic) {
    if (interpret.isPending) return;
    setTopic(value);
  }

  return (
    <section className="page-section draw-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / A SYMBOLIC ENCOUNTER</p>
          <h1>{copy.drawTitle}</h1>
          <p>{copy.drawIntro}</p>
        </div>
        <span className="section-count">
          02<span>CARDS</span>
        </span>
      </div>
      <div className="draw-controls">
        <div className="topic-switch">
          {(["study", "love", "daily"] as const).map(value => (
            <button
              key={value}
              onClick={() => changeTopic(value)}
              className={topic === value ? "active" : ""}
              aria-pressed={topic === value}
              disabled={interpret.isPending}
            >
              {copy[value]}
            </button>
          ))}
        </div>
        <button
          className="button button-outline shuffle-button"
          onClick={shuffle}
          disabled={shuffling || interpret.isPending}
        >
          <Shuffle size={16} className={shuffling ? "spin" : ""} />
          {shuffling ? copy.shuffling : copy.shuffle}
        </button>
      </div>
      <div className="shuffle-status" aria-live="polite">
        {shuffling
          ? copy.shuffling
          : shuffleCount > 0
            ? copy.shuffled
            : copy.selectTwo}
      </div>
      <div className={`draw-layout ${revealed ? "has-reading" : ""}`}>
        <div className="deck-area">
          <div
            className={`deck-grid ${shuffling ? "is-shuffling" : ""}`}
            aria-label={copy.selectTwo}
          >
            {deck.map((id, index) => {
              const selection = picked.indexOf(id);
              return (
                <button
                  type="button"
                  key={id}
                  className={`deck-card ${selection !== -1 ? "is-picked" : ""}`}
                  style={{ "--deal-index": index % 9 } as React.CSSProperties}
                  onClick={() => {
                    if (!revealed && !shuffling && !interpret.isPending)
                      setPicked(previous => togglePick(previous, id));
                  }}
                  disabled={
                    shuffling ||
                    revealed ||
                    (picked.length === 2 && selection === -1)
                  }
                  aria-label={
                    lang === "zh"
                      ? `背面卡牌 ${index + 1}${selection !== -1 ? `，已選第 ${selection + 1} 張` : ""}`
                      : `Face-down card ${index + 1}${selection !== -1 ? `, selection ${selection + 1}` : ""}`
                  }
                  aria-pressed={selection !== -1}
                >
                  <span className="card-back-frame">
                    <span className="card-back-mark" aria-hidden="true">
                      S
                    </span>
                    <span className="card-back-rule" />
                  </span>
                  {selection !== -1 && (
                    <span className="pick-badge">0{selection + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="deck-bottom">
            <span>
              {copy.selected} <b>{picked.length}</b> / 2
            </span>
            <span>36 LENORMAND CARDS</span>
          </div>
        </div>
        <div className="selection-area">
          <div className="selected-pair">
            {[0, 1].map(index => {
              const card = cards.find(item => item.id === picked[index]);
              return (
                <div key={index} className="selected-slot">
                  <span className="eyebrow">
                    0{index + 1} / {index === 0 ? copy.first : copy.second}
                  </span>
                  <div
                    className={`selected-card ${card ? "filled" : ""} ${revealed ? "is-revealed" : ""}`}
                  >
                    {card && revealed ? (
                      <>
                        <CardArtwork card={card} lang={lang} />
                        <span className="selected-name">
                          {lang === "zh" ? card.nameZh : card.nameEn}
                        </span>
                      </>
                    ) : card ? (
                      <span className="card-back-mark">S</span>
                    ) : (
                      <span className="empty-slot-number">0{index + 1}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!revealed && (
            <button
              className="button button-dark reveal-button"
              disabled={picked.length !== 2 || shuffling}
              onClick={() => void reveal()}
            >
              {copy.reveal}
              <ArrowRight size={16} />
            </button>
          )}
          {revealed && (
            <div className="reading-result" aria-live="polite" ref={resultRef}>
              <h2>{copy.reading}</h2>
              {interpret.isPending && (
                <p className="reading-loading">
                  <Loader2 size={16} className="spin" />
                  {copy.interpreting}
                </p>
              )}
              {reading && (
                <>
                  <p className="reading-text">{reading.text}</p>
                  {reading.source === "catalog" && (
                    <small>{copy.readingFallback}</small>
                  )}
                </>
              )}
              {error && (
                <div className="inline-error">
                  <span>{copy.loadError}</span>
                  <button onClick={() => void reveal()}>{copy.retry}</button>
                </div>
              )}
              <button
                className="text-link reset-link"
                disabled={interpret.isPending}
                onClick={shuffle}
              >
                <RotateCcw size={14} />
                {copy.reset}
              </button>
            </div>
          )}
          <p className="reading-note">{copy.readingNote}</p>
        </div>
      </div>
    </section>
  );
}
