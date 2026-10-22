import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Loader2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { COPY, formatDate, readImage, type Language } from "@/lib/gallery";

export default function Guestbook({ lang }: { lang: Language }) {
  const copy = COPY[lang];
  const utils = trpc.useUtils();
  const query = trpc.guestbook.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
  const add = trpc.guestbook.add.useMutation();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !name.trim() || !message.trim()) return;
    setBusy(true);
    setError("");
    setSuccess(false);
    try {
      await add.mutateAsync({
        name: name.trim(),
        message: message.trim(),
        website,
        ...(photo ? { photo: await readImage(photo, 5) } : {}),
      });
      setName("");
      setMessage("");
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess(true);
      await utils.guestbook.list.invalidate();
    } catch (error) {
      setError(error instanceof Error ? error.message : copy.saveError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section guestbook-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 / LEAVE A TRACE</p>
          <h1>{copy.guestTitle}</h1>
          <p>{copy.guestIntro}</p>
        </div>
        <span className="section-count">
          {String(query.data?.length || 0).padStart(2, "0")}
          <span>REFLECTIONS</span>
        </span>
      </div>
      <div className="guestbook-layout">
        <form className="guestbook-form" onSubmit={event => void submit(event)}>
          <label className="field">
            <span>{copy.name}</span>
            <input
              value={name}
              onChange={event => {
                setName(event.target.value);
                setSuccess(false);
              }}
              maxLength={60}
              required
              autoComplete="name"
              disabled={busy}
              placeholder={
                lang === "zh" ? "例如：陳同學 · S5" : "e.g. Alex · S5"
              }
            />
          </label>
          <label className="field">
            <span>{copy.message}</span>
            <textarea
              value={message}
              onChange={event => {
                setMessage(event.target.value);
                setSuccess(false);
              }}
              maxLength={600}
              required
              rows={5}
              disabled={busy}
              placeholder={
                lang === "zh"
                  ? "哪一個作品令你停下來？"
                  : "Which work made you pause?"
              }
            />
            <small className="character-count">{message.length} / 600</small>
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={event => setWebsite(event.target.value)}
            />
          </label>
          <div className="photo-upload">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              id="guest-photo"
              disabled={busy}
              onChange={event => {
                setPhoto(event.target.files?.[0] || null);
                setError("");
              }}
            />
            <label htmlFor="guest-photo" className="button button-outline">
              <Camera size={15} />
              {copy.photo}
              <small>{copy.optional}</small>
            </label>
            <span>{copy.photoLimit}</span>
          </div>
          {preview && (
            <div className="photo-preview">
              <img
                src={preview}
                alt={lang === "zh" ? "上載照片預覽" : "Upload preview"}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={copy.removePhoto}
                onClick={() => {
                  setPhoto(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                disabled={busy}
              >
                <X size={15} />
              </button>
            </div>
          )}
          <p className="form-note">{copy.consent}</p>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="success-message" role="status">
              {copy.posted}
            </p>
          )}
          <button
            type="submit"
            className="button button-dark"
            disabled={busy || !name.trim() || !message.trim()}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="spin" />
                {copy.submitting}
              </>
            ) : (
              <>
                {copy.submit}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
        <div className="reflections-wall">
          {query.isLoading ? (
            <div className="empty-state">
              <Loader2 className="spin" size={20} />
              {copy.loading}
            </div>
          ) : query.error ? (
            <div className="inline-error">
              {copy.loadError}
              <button onClick={() => void query.refetch()}>{copy.retry}</button>
            </div>
          ) : !query.data?.length ? (
            <div className="empty-wall">
              <span className="empty-wall-mark">“</span>
              <p>{copy.emptyGuest}</p>
            </div>
          ) : (
            query.data.map(entry => (
              <article className="reflection" key={entry.id}>
                {entry.photoUrl && (
                  <img
                    className="reflection-photo"
                    src={entry.photoUrl}
                    alt={
                      lang === "zh"
                        ? `${entry.name} 的展覽照片`
                        : `Exhibition photo by ${entry.name}`
                    }
                    loading="lazy"
                  />
                )}
                <div className="reflection-copy">
                  <p>{entry.message}</p>
                  <div>
                    <strong>{entry.name}</strong>
                    <time dateTime={new Date(entry.createdAt).toISOString()}>
                      {formatDate(entry.createdAt, lang)}
                    </time>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
