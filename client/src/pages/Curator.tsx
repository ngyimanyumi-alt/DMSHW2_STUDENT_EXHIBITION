import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ImagePlus,
  Link2,
  Loader2,
  LockKeyhole,
  LogOut,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { CardArtwork } from "@/components/CardArtwork";
import {
  COPY,
  formatDate,
  readImage,
  type ExhibitionSettings,
  type GalleryCard,
  type Language,
} from "@/lib/gallery";

export default function Curator({
  cards,
  lang,
  settings,
}: {
  cards: GalleryCard[];
  lang: Language;
  settings?: ExhibitionSettings;
}) {
  const copy = COPY[lang];
  const auth = trpc.auth.me.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      await utils.auth.me.invalidate();
    },
  });
  const [tab, setTab] = useState<"works" | "text" | "guest">("works");
  const [loginError, setLoginError] = useState("");
  if (auth.isLoading)
    return (
      <div className="empty-state">
        <Loader2 className="spin" size={20} />
        {copy.loading}
      </div>
    );
  if (!auth.data || auth.data.role !== "admin")
    return (
      <section className="curator-login">
        <LockKeyhole strokeWidth={1} size={28} />
        <p className="eyebrow">CURATOR ACCESS</p>
        <h1>{copy.manageTitle}</h1>
        <p>{auth.data ? copy.denied : copy.loginNote}</p>
        {loginError && <p className="inline-error">{loginError}</p>}
        <button
          className="button button-dark"
          onClick={() => {
            if (auth.data) void logout.mutateAsync();
            else {
              try {
                startLogin();
              } catch (error) {
                setLoginError(
                  error instanceof Error ? error.message : copy.loadError
                );
              }
            }
          }}
        >
          {auth.data ? copy.logout : copy.login}
          <ArrowRight size={16} />
        </button>
      </section>
    );
  return (
    <section className="page-section curator-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURATOR STUDIO</p>
          <h1>{copy.manageTitle}</h1>
        </div>
        <button
          className="text-link"
          onClick={() => void logout.mutateAsync()}
          disabled={logout.isPending}
        >
          <LogOut size={14} />
          {copy.logout}
        </button>
      </div>
      <div className="curator-tabs">
        {(["works", "text", "guest"] as const).map(value => (
          <button
            key={value}
            className={tab === value ? "active" : ""}
            onClick={() => setTab(value)}
          >
            {value === "works"
              ? copy.editWorks
              : value === "text"
                ? copy.editExhibition
                : copy.editGuest}
          </button>
        ))}
      </div>
      {tab === "works" && <ArtworkEditor cards={cards} lang={lang} />}
      {tab === "text" && <StatementEditor lang={lang} settings={settings} />}
      {tab === "guest" && <GuestbookManager lang={lang} />}
    </section>
  );
}

function ArtworkEditor({
  cards,
  lang,
}: {
  cards: GalleryCard[];
  lang: Language;
}) {
  const copy = COPY[lang];
  const utils = trpc.useUtils();
  const [id, setId] = useState(1);
  const selected = cards.find(card => card.id === id) || cards[0];
  const [form, setForm] = useState<GalleryCard>(selected);
  const [driveLink, setDriveLink] = useState(selected.driveUrl || "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirtyText = useRef(false);
  const previousCardId = useRef(id);
  const save = trpc.exhibition.saveCard.useMutation();
  const importDrive = trpc.exhibition.importDrive.useMutation();
  const upload = trpc.exhibition.uploadArtwork.useMutation();
  const busy = save.isPending || importDrive.isPending || uploading;
  useEffect(() => {
    const changedCard = previousCardId.current !== selected.id;
    if (changedCard || !dirtyText.current) {
      setForm(selected);
      dirtyText.current = false;
    } else {
      setForm(previous => ({
        ...previous,
        imageUrl: selected.imageUrl,
        driveUrl: selected.driveUrl,
      }));
    }
    previousCardId.current = selected.id;
    setDriveLink(selected.driveUrl || "");
    setNotice("");
    setError("");
  }, [selected]);
  function update(key: keyof GalleryCard, value: string) {
    dirtyText.current = true;
    setForm(previous => ({ ...previous, [key]: value }));
    setNotice("");
  }
  async function saveCard(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const {
        id,
        nameZh,
        nameEn,
        keywordsZh,
        keywordsEn,
        descriptionZh,
        descriptionEn,
        artist,
      } = form;
      await save.mutateAsync({
        id,
        nameZh,
        nameEn,
        keywordsZh,
        keywordsEn,
        descriptionZh,
        descriptionEn,
        artist,
      });
      dirtyText.current = false;
      await utils.exhibition.cards.invalidate();
      setNotice(copy.saved);
    } catch (error) {
      setError(error instanceof Error ? error.message : copy.saveError);
    }
  }
  async function doImport() {
    if (busy || !driveLink.trim()) return;
    setError("");
    setNotice("");
    try {
      await importDrive.mutateAsync({ id, url: driveLink.trim() });
      await utils.exhibition.cards.invalidate();
      setNotice(copy.imageSaved);
    } catch (error) {
      setError(error instanceof Error ? error.message : copy.saveError);
    }
  }
  async function doUpload(file: File | undefined) {
    if (!file || busy) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      await upload.mutateAsync({ id, ...(await readImage(file, 8)) });
      await utils.exhibition.cards.invalidate();
      setNotice(copy.imageSaved);
    } catch (error) {
      setError(error instanceof Error ? error.message : copy.saveError);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  return (
    <div className="editor-layout">
      <aside className="editor-preview">
        <label className="field">
          <span>{copy.chooseCard}</span>
          <select
            value={id}
            onChange={event => setId(Number(event.target.value))}
            disabled={busy}
          >
            {cards.map(card => (
              <option key={card.id} value={card.id}>
                {card.num} · {lang === "zh" ? card.nameZh : card.nameEn}
              </option>
            ))}
          </select>
        </label>
        <div className="editor-card">
          <div className="plate-top">
            <span>N° {selected.num}</span>
            <span>LENORMAND</span>
          </div>
          <CardArtwork card={selected} lang={lang} />
          <span>{lang === "zh" ? selected.nameZh : selected.nameEn}</span>
        </div>
        <div className="photo-upload">
          <input
            type="file"
            ref={fileRef}
            id="artwork-file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={event => void doUpload(event.target.files?.[0])}
          />
          <label htmlFor="artwork-file" className="button button-outline">
            {uploading ? (
              <Loader2 size={15} className="spin" />
            ) : (
              <ImagePlus size={15} />
            )}
            {copy.upload}
          </label>
          <span>{copy.imageLimit}</span>
        </div>
      </aside>
      <form className="editor-form" onSubmit={event => void saveCard(event)}>
        <div className="form-columns">
          <label className="field">
            <span>{copy.nameZh}</span>
            <input
              value={form.nameZh}
              onChange={event => update("nameZh", event.target.value)}
              required
              maxLength={80}
              disabled={busy}
            />
          </label>
          <label className="field">
            <span>{copy.nameEn}</span>
            <input
              value={form.nameEn}
              onChange={event => update("nameEn", event.target.value)}
              required
              maxLength={80}
              disabled={busy}
            />
          </label>
        </div>
        <label className="field">
          <span>{copy.artist}</span>
          <input
            value={form.artist}
            onChange={event => update("artist", event.target.value)}
            maxLength={120}
            disabled={busy}
            placeholder={
              lang === "zh" ? "學生名字 · 班別" : "Student name · Class"
            }
          />
        </label>
        <div className="form-columns">
          <label className="field">
            <span>{copy.keywordsZh}</span>
            <input
              value={form.keywordsZh}
              onChange={event => update("keywordsZh", event.target.value)}
              required
              maxLength={300}
              disabled={busy}
            />
          </label>
          <label className="field">
            <span>{copy.keywordsEn}</span>
            <input
              value={form.keywordsEn}
              onChange={event => update("keywordsEn", event.target.value)}
              required
              maxLength={300}
              disabled={busy}
            />
          </label>
        </div>
        <label className="field">
          <span>{copy.descriptionZh}</span>
          <textarea
            value={form.descriptionZh}
            onChange={event => update("descriptionZh", event.target.value)}
            rows={2}
            required
            maxLength={1000}
            disabled={busy}
          />
        </label>
        <label className="field">
          <span>{copy.descriptionEn}</span>
          <textarea
            value={form.descriptionEn}
            onChange={event => update("descriptionEn", event.target.value)}
            rows={2}
            required
            maxLength={1000}
            disabled={busy}
          />
        </label>
        <div className="drive-import">
          <label className="field">
            <span>
              <Link2 size={13} />
              {copy.drive}
            </span>
            <input
              type="url"
              value={driveLink}
              onChange={event => setDriveLink(event.target.value)}
              placeholder="https://drive.google.com/file/d/…/view"
              disabled={busy}
            />
          </label>
          <button
            type="button"
            className="button button-outline"
            onClick={() => void doImport()}
            disabled={busy || !driveLink.trim()}
          >
            {importDrive.isPending ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <Link2 size={14} />
            )}
            {importDrive.isPending ? copy.importing : copy.import}
          </button>
          <p>{copy.driveHint}</p>
        </div>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="success-message" role="status">
            <Check size={14} />
            {notice}
          </p>
        )}
        <button className="button button-dark" disabled={busy}>
          {save.isPending ? copy.saving : copy.save}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

function StatementEditor({
  lang,
  settings,
}: {
  lang: Language;
  settings?: ExhibitionSettings;
}) {
  const copy = COPY[lang];
  const utils = trpc.useUtils();
  const [form, setForm] = useState<ExhibitionSettings>(
    settings || {
      titleZh: "符號學者",
      titleEn: "The Symbolist",
      statementZh: "",
      statementEn: "",
    }
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const save = trpc.exhibition.saveSettings.useMutation();
  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    try {
      await save.mutateAsync(form);
      await utils.exhibition.settings.invalidate();
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : copy.saveError);
    }
  }
  return (
    <form className="statement-editor" onSubmit={event => void submit(event)}>
      {(["titleZh", "titleEn", "statementZh", "statementEn"] as const).map(
        key => (
          <label className="field" key={key}>
            <span>{copy[key]}</span>
            {key.startsWith("title") ? (
              <input
                value={form[key]}
                maxLength={80}
                required
                disabled={save.isPending}
                onChange={event => {
                  setForm(previous => ({
                    ...previous,
                    [key]: event.target.value,
                  }));
                  setSaved(false);
                }}
              />
            ) : (
              <textarea
                value={form[key]}
                rows={4}
                maxLength={1500}
                required
                disabled={save.isPending}
                onChange={event => {
                  setForm(previous => ({
                    ...previous,
                    [key]: event.target.value,
                  }));
                  setSaved(false);
                }}
              />
            )}
          </label>
        )
      )}
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="success-message">{copy.saved}</p>}
      <button className="button button-dark" disabled={save.isPending}>
        {save.isPending ? copy.saving : copy.save}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}

function GuestbookManager({ lang }: { lang: Language }) {
  const copy = COPY[lang];
  const utils = trpc.useUtils();
  const query = trpc.guestbook.adminList.useQuery();
  const [error, setError] = useState("");
  const moderate = trpc.guestbook.moderate.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.guestbook.list.invalidate(),
        utils.guestbook.adminList.invalidate(),
      ]);
    },
    onError: error => setError(error.message),
  });
  return (
    <div className="guest-manager">
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {query.isLoading ? (
        <div className="empty-state">{copy.loading}</div>
      ) : query.error ? (
        <div className="inline-error">
          {copy.loadError}
          <button onClick={() => void query.refetch()}>{copy.retry}</button>
        </div>
      ) : !query.data?.length ? (
        <div className="empty-state">{copy.noRecords}</div>
      ) : (
        query.data.map(entry => (
          <article
            className={`moderation-entry ${entry.hidden ? "hidden-entry" : ""}`}
            key={entry.id}
          >
            {entry.photoUrl && <img src={entry.photoUrl} alt={entry.name} />}
            <div>
              <strong>{entry.name}</strong>
              <time>{formatDate(entry.createdAt, lang)}</time>
              <p>{entry.message}</p>
              <small>{entry.hidden ? copy.hidden : copy.visible}</small>
            </div>
            <button
              className="button button-outline"
              disabled={moderate.isPending}
              onClick={() => {
                setError("");
                moderate.mutate({ id: entry.id, hidden: !entry.hidden });
              }}
            >
              {entry.hidden ? copy.restore : copy.hide}
            </button>
          </article>
        ))
      )}
    </div>
  );
}
