import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Portal do Professor INAPEM" },
      { name: "description", content: "Acesse o Portal do Professor INAPEM com sua matrícula." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      login(matricula.trim(), password);
      navigate({ to: "/portal" });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <Logo className="h-14 w-14 ring-2 ring-primary-foreground/20" />
        <div>
          <h1 className="font-display text-4xl leading-tight">
            Portal do Professor
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-sm">
            Um espaço dedicado a educadores especiais: grave aulas, compartilhe
            atividades e conecte-se com seus alunos ao vivo.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © INAPEM · Instituto Nacional de Educação Especial & Neuropsicopedagogia
        </p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Logo className="h-12 w-12" />
            <span className="font-display text-lg">INAPEM</span>
          </div>

          <h2 className="font-display text-3xl">Entrar</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Use sua matrícula e senha para acessar o portal.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Matrícula</label>
              <input
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex.: 2026001"
                className="w-full h-11 px-3 rounded-md border bg-card text-card-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Senha</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full h-11 px-3 rounded-md border bg-card text-card-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium shadow-soft hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Ainda não tem cadastro?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
