import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { saveUser, login } from "@/lib/auth";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro — Portal do Professor INAPEM" },
      { name: "description", content: "Cadastre-se no Portal do Professor INAPEM." },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", matricula: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Senha deve ter ao menos 6 caracteres.");
    if (form.password !== form.confirm) return setError("As senhas não coincidem.");
    setLoading(true);
    try {
      saveUser({
        nome: form.nome.trim(),
        email: form.email.trim(),
        matricula: form.matricula.trim(),
        password: form.password,
      });
      login(form.matricula.trim(), form.password);
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
          <h1 className="font-display text-4xl leading-tight">Junte-se ao INAPEM</h1>
          <p className="mt-4 text-primary-foreground/80 max-w-sm">
            Crie sua conta de professor e passe a oferecer aulas, atividades e
            transmissões ao vivo em um único lugar.
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

          <h2 className="font-display text-3xl">Criar conta</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Preencha seus dados para começar.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Nome completo" value={form.nome} onChange={(v) => set("nome", v)} placeholder="Como você quer ser chamado" required />
            <Field label="E-mail" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="voce@inapem.com" required />
            <Field label="Matrícula" value={form.matricula} onChange={(v) => set("matricula", v)} placeholder="Sua matrícula institucional" required />
            <Field label="Senha" type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="Ao menos 6 caracteres" required />
            <Field label="Confirmar senha" type="password" value={form.confirm} onChange={(v) => set("confirm", v)} placeholder="Repita a senha" required />

            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium shadow-soft hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3 rounded-md border bg-card text-card-foreground outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
