import { MessageSquare } from "lucide-react";

/** Placeholder do chat da sala. Funcionalidade real virá depois. */
export function ChatPlaceholder() {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card/40 p-3 space-y-2 opacity-80">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <MessageSquare className="size-3" /> Chat da sala
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          disabled
          placeholder="Em breve…"
          className="flex-1 rounded-md border border-border bg-secondary/40 px-2 py-1.5 text-xs text-muted-foreground placeholder:text-muted-foreground/60 cursor-not-allowed"
        />
        <button
          disabled
          className="rounded-md bg-secondary/60 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
      <p className="text-[9px] text-muted-foreground/80">
        Estamos preparando o chat. Em breve você poderá conversar com os jogadores da sala aqui.
      </p>
    </section>
  );
}
