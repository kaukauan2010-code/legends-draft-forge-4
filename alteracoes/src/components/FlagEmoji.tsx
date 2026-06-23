/**
 * FlagEmoji — exibe bandeiras de países com imagem SVG via flagcdn.com.
 *
 * Sempre tenta usar a imagem (flagcdn.com) para todos os códigos ISO.
 * Fallback para emoji texto apenas se o código não existir (ex: 🏆, 🤖).
 */

interface Props {
  /** O emoji de bandeira armazenado na seleção (ex: "🇧🇷") */
  emoji: string;
  /** Tamanho em px (aplicado a width e height). Default: 24 */
  size?: number;
  className?: string;
}

// Converte o par de Regional Indicators unicode para código ISO 3166-1 alpha-2.
// Ex: 🇧🇷 (U+1F1E7 U+1F1F7) → "br"
function emojiToIso(emoji: string): string | null {
  const cps = [...emoji].map((c) => c.codePointAt(0) ?? 0);
  if (
    cps.length === 2 &&
    cps[0]! >= 0x1f1e6 &&
    cps[0]! <= 0x1f1ff &&
    cps[1]! >= 0x1f1e6 &&
    cps[1]! <= 0x1f1ff
  ) {
    const a = String.fromCharCode(cps[0]! - 0x1f1e6 + 65);
    const b = String.fromCharCode(cps[1]! - 0x1f1e6 + 65);
    return (a + b).toLowerCase();
  }
  // Subdivision tags (England, Scotland, Wales) — mapeamento manual
  const subdivisions: Record<string, string> = {
    "🏴󠁧󠁢󠁥󠁮󠁧󠁿": "gb-eng",
    "🏴󠁧󠁢󠁳󠁣󠁴󠁿": "gb-sct",
    "🏴󠁧󠁢󠁷󠁬󠁳󠁿": "gb-wls",
  };
  return subdivisions[emoji] ?? null;
}

export function FlagEmoji({ emoji, size = 24, className = "" }: Props) {
  const iso = emojiToIso(emoji);

  // Se não tem código ISO (ex: 🏆, 🤖), mostra emoji texto
  if (!iso) {
    return (
      <span
        className={className}
        style={{ fontSize: size, lineHeight: 1, display: "inline-block" }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  // Sempre usa a imagem via flagcdn — resolve o problema de bandeiras
  // aparecendo como "BR", "FR" etc no Windows e alguns Android.
  const src = `https://flagcdn.com/${iso}.svg`;
  return (
    <img
      src={src}
      alt={emoji}
      width={size}
      height={Math.round(size * 0.75)}
      className={`inline-block rounded-[2px] object-cover ${className}`}
      loading="lazy"
      onError={(e) => {
        // Se a imagem falhar, mostra o emoji texto
        const el = e.target as HTMLImageElement;
        el.style.display = "none";
        const span = document.createElement("span");
        span.textContent = emoji;
        span.style.fontSize = `${size}px`;
        span.style.lineHeight = "1";
        span.style.display = "inline-block";
        el.parentNode?.insertBefore(span, el);
      }}
    />
  );
}

export default FlagEmoji;
