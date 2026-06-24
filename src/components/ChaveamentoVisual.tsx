import type { ConfrontoMata, ChaveMata } from "@/lib/campanha";
import { cn } from "@/lib/utils";
import { FlagEmoji } from "./FlagEmoji";

interface Props {
  chave: ChaveMata;
  faseAtual: "oitavas" | "quartas" | "semi" | "final";
}

const FASES_ORDEM: ("oitavas" | "quartas" | "semi" | "final")[] = ["oitavas", "quartas", "semi", "final"];
// Quantidade esperada de confrontos por fase
const CONFRONTOS_POR_FASE: Record<string, number> = {
  oitavas: 8, quartas: 4, semi: 2, final: 1,
};
const TITULO_FASE: Record<string, string> = {
  oitavas: "Oitavas", quartas: "Quartas", semi: "Semifinal", final: "Final",
};

function confrontosPlaceholder(qtd: number, prefixo: string): ConfrontoMata[] {
  return Array.from({ length: qtd }, (_, i) => ({ id: `${prefixo}-ph-${i}`, casa: null, fora: null }));
}

export function ChaveamentoVisual({ chave, faseAtual }: Props) {
  const idxAtual = FASES_ORDEM.indexOf(faseAtual);

  // Mostra da fase atual até a final
  const colunas = FASES_ORDEM.slice(idxAtual).map((fase) => {
    const reais = chave[fase];
    const qtdEsperada = CONFRONTOS_POR_FASE[fase] ?? 1;
    // Usa dados reais SOMENTE se existirem e tiverem a quantidade correta
    // Isso previne o bug de mostrar a final prematuramente quando o array
    // está populado com um confronto do player antes da fase começar
    if (reais.length > 0 && (reais.length === qtdEsperada || fase === faseAtual)) {
      return { fase, confrontos: reais };
    }
    return { fase, confrontos: confrontosPlaceholder(qtdEsperada, fase) };
  });

  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex gap-4 min-w-max">
        {colunas.map((coluna, colIdx) => (
          <div key={coluna.fase} className="flex flex-col justify-around gap-3" style={{ minWidth: 130 }}>
            <div className="text-center text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              {TITULO_FASE[coluna.fase]}
            </div>
            <div className="flex flex-1 flex-col justify-around gap-4">
              {coluna.confrontos.map((c) => (
                <BracketSlot key={c.id} confronto={c} naoEUltimaColuna={colIdx < colunas.length - 1} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketSlot({ confronto, naoEUltimaColuna }: { confronto: ConfrontoMata; naoEUltimaColuna: boolean }) {
  const souEu = confronto.casa?.isCPU === false || confronto.fora?.isCPU === false;
  return (
    <div className="relative">
      <div className={cn(
        "rounded-lg border bg-card text-[10px] overflow-hidden",
        souEu ? "border-primary" : "border-border",
      )}>
        <TimeLinha time={confronto.casa} venceu={!!confronto.vencedor && confronto.vencedor === confronto.casa} />
        <div className="h-px bg-border" />
        <TimeLinha time={confronto.fora} venceu={!!confronto.vencedor && confronto.vencedor === confronto.fora} />
      </div>
      {naoEUltimaColuna && (
        <div className="absolute left-full top-1/2 h-px w-3 -translate-y-1/2 bg-border" />
      )}
    </div>
  );
}

function TimeLinha({ time, venceu }: { time: { nome: string; bandeira: string; isCPU: boolean } | null; venceu: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-1.5",
      venceu && "bg-primary/10 font-bold",
      time?.isCPU === false && "text-primary",
    )}>
      {time?.bandeira
        ? <FlagEmoji emoji={time.bandeira} size={12} className="shrink-0" />
        : <span className="shrink-0 text-[10px]">❔</span>
      }
      <span className="truncate flex-1 max-w-[80px]">{time?.nome ?? "A definir"}</span>
    </div>
  );
}
