import { useEffect, useState, type ComponentType } from "react";
import {
  Anchor,
  Archive,
  Baby,
  Bird,
  BookOpen,
  Building2,
  Cable,
  CircleDot,
  Clover,
  Cloud,
  Cross,
  Dog,
  Fish,
  Flower2,
  GitFork,
  Heart,
  House,
  KeyRound,
  Mail,
  Mountain,
  Moon,
  Mouse,
  PawPrint,
  Plane,
  Scissors,
  Send,
  ShipWheel,
  Spline,
  Sprout,
  Squirrel,
  Stars,
  Sun,
  TreePine,
  Trees,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import type { CardSeed } from "@shared/cards";

export type CardArtworkProps = {
  card: Pick<CardSeed, "id" | "nameZh" | "nameEn"> & {
    imageUrl?: string | null;
  };
  lang?: "zh" | "en";
  className?: string;
};

type SymbolIcon = ComponentType<{
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

const SYMBOLS: Record<number, SymbolIcon> = {
  1: Send,
  2: Clover,
  3: ShipWheel,
  4: House,
  5: TreePine,
  6: Cloud,
  7: Spline,
  8: Archive,
  9: Flower2,
  10: Scissors,
  11: Cable,
  12: Bird,
  13: Baby,
  14: Squirrel,
  15: PawPrint,
  16: Stars,
  17: Plane,
  18: Dog,
  19: Building2,
  20: Trees,
  21: Mountain,
  22: GitFork,
  23: Mouse,
  24: Heart,
  25: CircleDot,
  26: BookOpen,
  27: Mail,
  28: UserRound,
  29: UserRoundCheck,
  30: Sprout,
  31: Sun,
  32: Moon,
  33: KeyRound,
  34: Fish,
  35: Anchor,
  36: Cross,
};

const PASTELS = [
  { backgroundColor: "#fdfcf8", color: "#7c6d5b" },
  { backgroundColor: "#edf4f8", color: "#66869a" },
  { backgroundColor: "#f9eef0", color: "#aa7180" },
  { backgroundColor: "#eef4ee", color: "#708b76" },
  { backgroundColor: "#faf4e5", color: "#a48a4d" },
] as const;

function SymbolPlate({ cardId }: { cardId: number }) {
  const Icon = SYMBOLS[cardId] ?? Stars;
  const palette = PASTELS[(Math.max(cardId, 1) - 1) % PASTELS.length];

  return (
    <div
      className="symbol-plate relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]"
      style={palette}
      aria-hidden="true"
    >
      <span className="symbol-mark absolute left-[20%] top-[23%] h-1.5 w-1.5 rounded-full bg-current opacity-30" />
      <span className="symbol-mark absolute right-[23%] top-[31%] h-1 w-1 rounded-full bg-current opacity-25" />
      <span className="symbol-mark absolute bottom-[25%] right-[27%] h-1 w-1 rounded-full bg-current opacity-30" />
      <span className="absolute h-[58%] w-[58%] rounded-full border border-current opacity-10" />
      <span className="absolute h-[43%] w-[43%] rounded-full bg-current opacity-[0.045]" />
      <Icon
        className="symbol-icon relative z-10 h-[39%] w-[39%]"
        strokeWidth={1}
      />
    </div>
  );
}

/** Artwork area only; surrounding card metadata and controls belong to the parent. */
export function CardArtwork({
  card,
  lang = "zh",
  className = "",
}: CardArtworkProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(card.imageUrl) && !imageFailed;
  const label =
    lang === "en" ? `${card.nameEn} artwork` : `${card.nameZh}藝術圖像`;

  useEffect(() => {
    setImageFailed(false);
  }, [card.imageUrl]);

  return (
    <div
      className={`card-artwork relative w-full overflow-hidden ${className}`.trim()}
      role={hasImage ? undefined : "img"}
      aria-label={hasImage ? undefined : label}
    >
      {hasImage ? (
        <img
          className="artwork-image h-full w-full object-contain"
          src={card.imageUrl ?? undefined}
          alt={label}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={`h-full w-full ${imageFailed ? "image-unavailable" : ""}`.trim()}
        >
          <SymbolPlate cardId={card.id} />
          {imageFailed ? (
            <p className="image-unavailable absolute inset-x-4 bottom-4 m-0 text-center text-xs tracking-wide text-stone-600">
              圖片暫時未能載入 / Image unavailable
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default CardArtwork;
