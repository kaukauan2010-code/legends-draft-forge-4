import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — World Cup Draft" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, isAnonymous } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);
  // Quando o usuário acabou de clicar em "Entrar como visitante" nesta tela,
  // NÃO devemos deslogar a sessão anônima recém-criada — precisamos navegar.
  const acabouDeEntrarComoVisitante = useRef(false);

  // Se o usuário chegou aqui já tendo uma sessão anônima ANTERIOR (ex: voltou
  // pra cá pra fazer login/cadastrar de verdade), aí sim encerramos a anônima.
  useEffect(() => {
    if (loading) return;
    if (acabouDeEntrarComoVisitante.current) {
      // sessão anônima criada agora mesmo — só navega.
      acabouDeEntrarComoVisitante.current = false;
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    if (user && isAnonymous) {
      try { localStorage.removeItem("wcd_visitante"); } catch {}
      supabase.auth.signOut();
      return;
    }
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, isAnonymous, navigate]);

  // Detecta retorno de confirmação de email (link do email cai aqui com ?confirmed=1)
  // ou hash do supabase (#access_token / type=signup) e mostra um toast amigável
  // pra deixar o usuário fazer login imediatamente sem ir para outra página.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || "";
    if (params.get("confirmed") === "1" || hash.includes("type=signup") || hash.includes("type=email_change")) {
      toast.success("Conta confirmada! Já pode fazer login.");
      // limpa URL para não repetir o toast
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Bem-vindo!");
  };

  const cadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      // Após clicar no link do email, o usuário volta direto pra tela de login
      // do jogo (com toast de confirmação), em vez de cair em login externo.
      options: { emailRedirectTo: `${window.location.origin}/auth?confirmed=1`, data: { full_name: nome } },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Conta criada! Confirme o email para fazer login.");
  };

  const esqueciSenha = async () => {
    if (!email) { toast.error("Digite seu email primeiro"); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Enviamos um link de recuperação para seu email.");
  };


  const google = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Falha no login Google"); setBusy(false); }
  };

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col">
      <Link to="/" className="self-center mb-8 font-display text-4xl italic font-black tracking-tighter text-primary">
        WORLD CUP DRAFT
      </Link>
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-border bg-card p-6 animate-enter">
        <h1 className="font-display text-2xl uppercase italic tracking-tight mb-1">Entre na Arena</h1>
        <p className="text-sm text-muted-foreground mb-6">Monte seu time com lendas da história.</p>

        <Button onClick={google} disabled={busy} variant="outline" className="w-full mb-3 h-11 font-bold">
          <GoogleIcon /> Continuar com Google
        </Button>

        <Button
          onClick={async () => {
            setBusy(true);
            // Marca ANTES da chamada pra evitar que o useEffect dispare o
            // signOut() quando a sessão anônima recém-criada propagar.
            acabouDeEntrarComoVisitante.current = true;
            // Cria uma sessão anônima real no backend para que o "visitante"
            // possa jogar online (criar/entrar em salas) com seu próprio user_id.
            const { error } = await supabase.auth.signInAnonymously();
            setBusy(false);
            if (error) {
              acabouDeEntrarComoVisitante.current = false;
              toast.error(`Falha ao entrar como visitante: ${error.message}`);
              return;
            }
            // Mantém o flag local p/ compatibilidade com fluxos antigos.
            try { localStorage.setItem("wcd_visitante", "1"); } catch {}
            navigate({ to: "/dashboard", replace: true });
          }}
          disabled={busy}
          variant="secondary"
          className="w-full mb-4 h-11 font-bold uppercase tracking-widest"
        >
          Entrar como visitante
        </Button>


        <div className="relative my-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="bg-card px-2 relative z-10">ou com email</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="cadastro">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={entrar} className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="e1">Email</Label>
                <Input id="e1" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s1">Senha</Label>
                <Input id="s1" type="password" required value={senha} onChange={e => setSenha(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-11 font-bold uppercase tracking-widest">Entrar</Button>
              <button
                type="button"
                onClick={esqueciSenha}
                disabled={busy}
                className="block w-full text-center text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary underline mt-1"
              >
                Esqueci minha senha
              </button>
            </form>
          </TabsContent>
          <TabsContent value="cadastro">
            <form onSubmit={cadastrar} className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="n2">Nome de treinador</Label>
                <Input id="n2" required value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e2">Email</Label>
                <Input id="e2" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s2">Senha</Label>
                <Input id="s2" type="password" required minLength={6} value={senha} onChange={e => setSenha(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-11 font-bold uppercase tracking-widest">Criar conta</Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          O login é necessário para guardar suas campanhas, conquistas e jogar online.
        </p>
      </div>

    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8.1z"/>
      <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4.1 20.6 7.8 23 12 23z"/>
      <path fill="#FBBC05" d="M6 14.4c-.2-.7-.4-1.4-.4-2.4s.1-1.6.4-2.4V6.8H2.3C1.5 8.3 1 10.1 1 12s.5 3.7 1.3 5.2L6 14.4z"/>
      <path fill="#EA4335" d="M12 5.5c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.4 2.3 6.8L6 9.6c.9-2.5 3.2-4.1 6-4.1z"/>
    </svg>
  );
}
