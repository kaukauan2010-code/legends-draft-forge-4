import type { Formacao } from "@/lib/formacoes";
import type { Posicao } from "@/lib/selecoes";
import { posicoesCompativeis } from "@/lib/selecoes";
import type { JogadorEscalado } from "@/lib/simulador";
import { cn } from "@/lib/utils";

interface Props {
  formacao: Formacao;
  escalacao: JogadorEscalado[];
  slotAtivo?: string;
  posicaoAlvo?: Posicao;
  onSlotClick?: (slotId: string) => void;
  onJogadorClick?: (slotId: string) => void;
  esconderRaridade?: boolean;
  fill?: boolean; // se true, preenche 100% do contêiner (sem aspect fixo)
}

const corRaridade: Record<string, string> = {
  comum: "bg-common/80 border-common",
  raro: "bg-rare/80 border-rare",
  epico: "bg-epic/80 border-epic",
  lendario: "bg-legendary/80 border-legendary",
};
const CINZA_NEUTRO = "bg-slate-700/80 border-slate-400";

export function MiniCampo({ formacao, escalacao, slotAtivo, posicaoAlvo, onSlotClick, onJogadorClick, esconderRaridade, fill }: Props) {
  const ocupados = new Map(escalacao.map(j => [j.slotId, j]));
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border-2 border-white/10 shadow-inner",
        fill && "h-full",
      )}
      style={{
        background: "linear-gradient(to bottom, var(--color-pitch) 0%, var(--color-pitch-dark) 100%)",
        ...(fill ? {} : { aspectRatio: "3/4" }),
      }}
    >
      {/* linhas do campo */}
      <div className="pointer-events-none absolute inset-1.5 rounded border border-white/20" />
      <div className="absolute inset-x-1.5 top-1/2 h-px bg-white/20" />
      <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="absolute left-1/2 top-1.5 h-5 w-2/5 -translate-x-1/2 border-x border-b border-white/20" />
      <div className="absolute left-1/2 bottom-1.5 h-5 w-2/5 -translate-x-1/2 border-x border-t border-white/20" />

      {formacao.slots.map(s => {
        const j = ocupados.get(s.id);
        const alvo = !j && !!posicaoAlvo && posicoesCompativeis(posicaoAlvo).includes(s.posicao);
        const clicavelVazio = alvo && !!onSlotClick;
        const clicavelOcupado = !!j && !!onJogadorClick;
        const clicavel = clicavelVazio || clicavelOcupado;
        const handleClick = clicavelVazio
          ? () => onSlotClick!(s.id)
          : clicavelOcupado
            ? () => onJogadorClick!(s.id)
            : undefined;
        return (
          <div
            key={s.id}
            role={clicavel ? "button" : undefined}
            tabIndex={clicavel ? 0 : undefined}
            onClick={handleClick}
            onKeyDown={clicavel ? (e) => { if (e.key === "Enter" || e.key === " ") handleClick?.(); } : undefined}
            className={cn("absolute -translate-x-1/2 -translate-y-1/2", clicavel && "cursor-pointer")}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <div className="flex flex-col items-center gap-0">
              <div
                className={cn(
                  "grid place-items-center rounded-full border-2 font-bold transition-all",
                  j ? (esconderRaridade ? CINZA_NEUTRO : corRaridade[j.raridade]) : "bg-slate-950/70 border-white/40",
                  j ? "size-6 text-[8px] text-white" : "size-5 text-[7px] text-white/70",
                  alvo && "ring-2 ring-primary scale-125 bg-primary/40 border-primary animate-pulse cursor-pointer",
                )}
              >
                {j ? j.numero : s.label}
              </div>
              {j && (
                <span className="max-w-[36px] truncate rounded bg-slate-950/80 px-0.5 text-center text-[6px] font-bold uppercase leading-tight text-white shadow">
                  {j.nome.split(" ").pop()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
