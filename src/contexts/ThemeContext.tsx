import { useEffect, type ReactNode } from "react";

// Tema fixo: o jogo roda SEMPRE no modo escuro. Removido o seletor claro/escuro
// a pedido do usuário — mantemos um provider mínimo apenas para garantir que
// a classe `dark` esteja no <html>.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    try { localStorage.setItem("wcd-theme", "dark"); } catch {}
  }, []);
  return <>{children}</>;
}
