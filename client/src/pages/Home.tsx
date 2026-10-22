import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
} from "lucide-react";
import { CARD_CATALOG } from "@shared/cards";
import { trpc } from "@/lib/trpc";
import { CardArtwork } from "@/components/CardArtwork";
import { COPY, type GalleryCard, type Language } from "@/lib/gallery";
import Gallery from "@/pages/Gallery";
import Draw from "@/pages/Draw";
import Guestbook from "@/pages/Guestbook";
import Curator from "@/pages/Curator";

export default function Home() {
  const [lang, setLang] = useState<Language>("zh");
  const [location] = useLocation();
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const copy = COPY[lang];
  const cardsQuery = trpc.exhibition.cards.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const settingsQuery = trpc.exhibition.settings.useQuery();
  const cards: GalleryCard[] =
    cardsQuery.data ??
    CARD_CATALOG.map(card => ({
      ...card,
      artist: "",
      imageUrl: null,
      driveUrl: null,
    }));
  const path = location.split("?")[0];
  const section =
    path === "/gallery"
      ? "gallery"
      : path === "/draw"
        ? "draw"
        : path === "/guestbook"
          ? "guestbook"
          : path === "/curator"
            ? "curator"
            : "exhibition";
  const title =
    lang === "zh"
      ? settingsQuery.data?.titleZh || "符號學者"
      : settingsQuery.data?.titleEn || "The Symbolist";

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [path]);
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frameRef.current?.parentElement?.requestFullscreen();
    } catch {
      /* Embedded browsers may not allow fullscreen. */
    }
  }
  const featureCards = [16, 31, 32]
    .map(id => cards.find(card => card.id === id)!)
    .filter(Boolean);

  return (
    <div className="exhibition-viewport">
      <div className="exhibition-frame" ref={frameRef}>
        <header className="exhibition-header">
          <Link href="/" className="brand" aria-label={copy.exhibition}>
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-text">
              <span>{copy.school}</span>
              <strong>{copy.department}</strong>
            </span>
          </Link>
          <div className="language-switch" aria-label="Language">
            <button
              type="button"
              onClick={() => setLang("zh")}
              aria-pressed={lang === "zh"}
              className={lang === "zh" ? "active" : ""}
            >
              中
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={lang === "en" ? "active" : ""}
            >
              EN
            </button>
          </div>
          <nav aria-label={lang === "zh" ? "主要導覽" : "Main navigation"}>
            {[
              ["/", "exhibition"],
              ["/gallery", "gallery"],
              ["/draw", "draw"],
              ["/guestbook", "guestbook"],
            ].map(([href, key], index) => (
              <Link
                key={href}
                href={href}
                className={section === key ? "active" : ""}
                aria-current={section === key ? "page" : undefined}
              >
                <span className="nav-number">0{index + 1}</span>
                {copy[key as "exhibition" | "gallery" | "draw" | "guestbook"]}
              </Link>
            ))}
          </nav>
        </header>
        <main
          className={`exhibition-content ${section === "exhibition" ? "is-home" : ""}`}
          ref={scrollRef}
        >
          {section === "exhibition" && (
            <section className="exhibition-home">
              <div className="home-intro">
                <p className="eyebrow">
                  <span className="tiny-line" />
                  {copy.edition}
                </p>
                <h1 className={lang === "en" ? "english-title" : ""}>
                  {title}
                </h1>
                <p className="home-subtitle">{copy.subtitle}</p>
                <p className="home-description">
                  {lang === "zh"
                    ? "以三十六個符號，呈現學生的視覺想像。\n看作品，也讓卡牌帶來一點創作靈感。"
                    : "Thirty-six symbols, seen through students’ eyes.\nExplore the works. Find a little inspiration in the cards."}
                </p>
                <div className="home-actions">
                  <Link href="/gallery" className="button button-dark">
                    {copy.view}
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/draw" className="text-link">
                    {copy.drawAction}
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="home-index">
                  <span>
                    <b>36</b>
                    {lang === "zh" ? "個意象" : "symbols"}
                  </span>
                  <span>
                    <b>02</b>
                    {lang === "zh" ? "張牌，一次相遇" : "cards, one encounter"}
                  </span>
                </div>
              </div>
              <div
                className="hero-display"
                aria-label={
                  lang === "zh" ? "雷諾曼符號索引" : "Lenormand symbol index"
                }
              >
                <span className="display-caption">THE ART OF SEEING</span>
                <div className="hero-cards">
                  {featureCards.map((card, index) => (
                    <Link
                      key={card.id}
                      href={`/gallery?card=${card.id}`}
                      className={`hero-card hero-card-${index}`}
                      aria-label={lang === "zh" ? card.nameZh : card.nameEn}
                    >
                      <div className="plate-top">
                        <span>N° {card.num}</span>
                        <span>LENORMAND</span>
                      </div>
                      <CardArtwork card={card} lang={lang} />
                      <div className="plate-bottom">
                        <span>{lang === "zh" ? card.nameZh : card.nameEn}</span>
                        <small>
                          {lang === "zh" ? card.nameEn : card.nameZh}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="display-foot">
                  <span>
                    {featureCards.some(card => card.imageUrl)
                      ? copy.artworks
                      : copy.symbolIndex}
                  </span>
                  <span>016 — 031 — 032</span>
                </div>
              </div>
              <div className="home-statement">
                <span className="eyebrow">{copy.reference}</span>
                <p>
                  {lang === "zh"
                    ? settingsQuery.data?.statementZh ||
                      "師生以雷諾曼的象徵語言為起點，探索符號學與生成式圖像，將個人的觀察轉化成藝術作品。"
                    : settingsQuery.data?.statementEn ||
                      "Students and teachers explore Lenormand’s symbolic language, semiotics and generative imagery, transforming personal observations into art."}
                </p>
              </div>
            </section>
          )}
          {section === "gallery" && (
            <Gallery
              cards={cards}
              lang={lang}
              loading={cardsQuery.isLoading}
              error={cardsQuery.error?.message}
              onRetry={() => void cardsQuery.refetch()}
            />
          )}
          {section === "draw" && <Draw cards={cards} lang={lang} />}
          {section === "guestbook" && <Guestbook lang={lang} />}
          {section === "curator" && (
            <Curator lang={lang} cards={cards} settings={settingsQuery.data} />
          )}
        </main>
        <footer className="exhibition-footer">
          <span className="footer-credit">
            Delia Memorial School (Hip Wo No.2 College) Visual Art{" "}
            <span className="footer-year">© 2026</span>
          </span>
          <div>
            <span className="ratio-label" />
            <button
              type="button"
              className="icon-button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? copy.exitFullScreen : copy.fullScreen}
            >
              {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <Link
              href="/curator"
              className={
                section === "curator"
                  ? "footer-curator active"
                  : "footer-curator"
              }
            >
              <SlidersHorizontal size={12} />
              <span>{copy.curator}</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
