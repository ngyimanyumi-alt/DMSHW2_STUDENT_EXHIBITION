import { useEffect, useState } from "react";
import { Search, ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CardArtwork } from "@/components/CardArtwork";
import { COPY, type GalleryCard, type Language } from "@/lib/gallery";

export default function Gallery({
  cards,
  lang,
  loading,
  error,
  onRetry,
}: {
  cards: GalleryCard[];
  lang: Language;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}) {
  const copy = COPY[lang];
  const [search, setSearch] = useState("");
  const [onlyWorks, setOnlyWorks] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<number | null>(
    () =>
      Number(new URLSearchParams(window.location.search).get("card")) || null
  );
  const selected = cards.find(card => card.id === selectedId);
  const filtered = cards.filter(
    card =>
      (!onlyWorks || card.imageUrl) &&
      `${card.num} ${card.nameZh} ${card.nameEn} ${card.keywordsZh} ${card.keywordsEn} ${card.artist}`
        .toLowerCase()
        .includes(search.toLowerCase().trim())
  );
  const works = cards.filter(card => card.imageUrl).length;
  function step(direction: number) {
    if (!selected) return;
    const index = cards.findIndex(card => card.id === selected.id);
    setSelectedId(cards[(index + direction + cards.length) % cards.length].id);
  }
  useEffect(() => {
    setPortalContainer(
      document.querySelector<HTMLElement>(".exhibition-frame")
    );
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, cards]);

  return (
    <section className="page-section gallery-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">01 / THE COLLECTION</p>
          <h1>{copy.galleryTitle}</h1>
          <p>{copy.galleryIntro}</p>
        </div>
        <span className="section-count">
          36<span>LENORMAND</span>
        </span>
      </div>
      <div className="gallery-toolbar">
        <div className="filter-switch">
          <button
            onClick={() => setOnlyWorks(false)}
            className={!onlyWorks ? "active" : ""}
            aria-pressed={!onlyWorks}
          >
            {copy.all}
            <small>36</small>
          </button>
          <button
            onClick={() => setOnlyWorks(true)}
            className={onlyWorks ? "active" : ""}
            aria-pressed={onlyWorks}
          >
            {copy.artworks}
            <small>{works}</small>
          </button>
        </div>
        <label className="search-field">
          <Search size={15} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
          />
          {search && (
            <button aria-label={copy.close} onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </label>
      </div>
      {error && (
        <div className="inline-error">
          {copy.loadError}
          <button onClick={onRetry}>{copy.retry}</button>
        </div>
      )}
      {loading ? (
        <div className="empty-state">
          <Loader2 className="spin" size={20} />
          {copy.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {onlyWorks && works === 0 ? copy.noWorks : copy.noResults}
        </div>
      ) : (
        <div className="gallery-grid">
          {filtered.map(card => (
            <button
              className="collection-card"
              key={card.id}
              onClick={() => setSelectedId(card.id)}
            >
              <div className="collection-image">
                <div className="plate-top">
                  <span>N° {card.num}</span>
                  <span>{card.imageUrl ? "ARTWORK" : "SYMBOL"}</span>
                </div>
                <CardArtwork card={card} lang={lang} />
              </div>
              <div className="collection-meta">
                <span>{lang === "zh" ? card.nameZh : card.nameEn}</span>
                <small>{lang === "zh" ? card.nameEn : card.nameZh}</small>
              </div>
              <p className="collection-artist">
                {card.artist || copy.symbolIndex}
              </p>
            </button>
          ))}
        </div>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={open => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent
          className="artwork-dialog"
          showCloseButton={false}
          portalContainer={portalContainer}
        >
          {selected && (
            <>
              <button
                className="dialog-close icon-button"
                onClick={() => setSelectedId(null)}
                aria-label={copy.close}
              >
                <X size={20} />
              </button>
              <div className="detail-art">
                <div className="plate-top">
                  <span>N° {selected.num}</span>
                  <span>LENORMAND</span>
                </div>
                <CardArtwork card={selected} lang={lang} />
              </div>
              <div className="detail-copy">
                <p className="eyebrow">N° {selected.num} / 36</p>
                <DialogTitle>
                  {lang === "zh" ? selected.nameZh : selected.nameEn}
                </DialogTitle>
                <span className="detail-secondary">
                  {lang === "zh" ? selected.nameEn : selected.nameZh}
                </span>
                <div className="detail-label">
                  <small>{copy.meaning}</small>
                  <p>
                    {lang === "zh" ? selected.keywordsZh : selected.keywordsEn}
                  </p>
                </div>
                <DialogDescription>
                  {lang === "zh"
                    ? selected.descriptionZh
                    : selected.descriptionEn}
                </DialogDescription>
                <div className="detail-label artist-label">
                  <small>{copy.artist}</small>
                  <p>{selected.artist || copy.symbolIndex}</p>
                </div>
                <div className="detail-pagination">
                  <button
                    className="icon-button"
                    onClick={() => step(-1)}
                    aria-label={copy.previous}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span>{selected.num} / 36</span>
                  <button
                    className="icon-button"
                    onClick={() => step(1)}
                    aria-label={copy.next}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
