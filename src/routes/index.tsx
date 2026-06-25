import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário chegou aqui vindo do email de recuperação de senha,
    // o Supabase coloca o token no hash (#type=recovery&access_token=...).
    // Redireciona preservando o hash para /reset-password.
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        window.location.replace(`/reset-password${hash}`);
        return;
      }
    }
    if (loading) return;
    navigate({ to: user ? "/dashboard" : "/auth", replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="grid min-h-screen place-items-center">
      <div className="font-display text-4xl italic tracking-tight text-primary animate-pulse">WCD</div>
    </div>
  );
}
