import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { currentUser, logout, type Teacher } from "@/lib/auth";
import {
  Video, FileUp, ClipboardList, Radio, LogOut,
  Play, Square, Circle, Upload, Trash2, Plus, X,
} from "lucide-react";

export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !currentUser()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Portal do Professor — INAPEM" },
      { name: "description", content: "Gerencie videoaulas, arquivos, atividades e lives." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalPage,
});

type Tab = "aulas" | "arquivos" | "atividades" | "lives";

function PortalPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Teacher | null>(null);
  const [tab, setTab] = useState<Tab>("aulas");

  useEffect(() => {
    const u = currentUser();
    if (!u) navigate({ to: "/login" });
    else setUser(u);
  }, [navigate]);

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "aulas", label: "Videoaulas", icon: Video },
    { id: "arquivos", label: "Arquivos", icon: FileUp },
    { id: "atividades", label: "Atividades", icon: ClipboardList },
    { id: "lives", label: "Lives", icon: Radio },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div className="hidden sm:block">
              <p className="font-display text-base leading-none">INAPEM</p>
              <p className="text-xs text-muted-foreground">Portal do Professor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.nome || "Professor(a)"}</p>
              <p className="text-xs text-muted-foreground">Matrícula {user.matricula}</p>
            </div>
            <button
              onClick={() => { logout(); navigate({ to: "/login" }); }}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-muted transition"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl">
            Olá, {user.nome?.split(" ")[0] || "professor(a)"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            O que vamos preparar para os alunos hoje?
          </p>
        </div>

        <nav className="flex flex-wrap gap-2 mb-8 border-b">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "aulas" && <VideoaulasPanel />}
        {tab === "arquivos" && <ArquivosPanel />}
        {tab === "atividades" && <AtividadesPanel />}
        {tab === "lives" && <LivesPanel />}
      </div>
    </div>
  );
}

/* ---------- Videoaulas: grava usando MediaRecorder ---------- */
function VideoaulasPanel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ url: string; title: string; date: string }[]>([]);
  const [error, setError] = useState("");

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordings((r) => [
          { url, title: `Aula ${r.length + 1}`, date: new Date().toLocaleString("pt-BR") },
          ...r,
        ]);
        stream.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (e) {
      setError("Não foi possível acessar a câmera/microfone. Verifique as permissões.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <section className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h2 className="font-display text-xl mb-1">Gravar videoaula</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use a câmera para gravar uma nova aula. O vídeo fica disponível na lista abaixo.
        </p>
        <div className="aspect-video w-full rounded-md overflow-hidden bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline />
        </div>
        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        <div className="flex gap-2 mt-4">
          {!recording ? (
            <button onClick={start} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              <Circle className="h-4 w-4 fill-current" /> Iniciar gravação
            </button>
          ) : (
            <button onClick={stop} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90">
              <Square className="h-4 w-4 fill-current" /> Parar
            </button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl mb-4">Minhas aulas</h2>
        {recordings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma gravação ainda.</p>
        ) : (
          <ul className="space-y-3">
            {recordings.map((r, i) => (
              <li key={i} className="rounded-md border p-3">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground mb-2">{r.date}</p>
                <video src={r.url} controls className="w-full rounded" />
                <a href={r.url} download={`${r.title}.webm`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                  <Play className="h-3 w-3" /> Baixar
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

/* ---------- Arquivos ---------- */
function ArquivosPanel() {
  const [files, setFiles] = useState<{ name: string; size: string; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      url: URL.createObjectURL(f),
    }));
    setFiles((prev) => [...added, ...prev]);
  }

  return (
    <section className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <h2 className="font-display text-xl mb-1">Enviar arquivos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Suba PDFs, imagens ou documentos para compartilhar com a turma.
        </p>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-md border-2 border-dashed border-border p-8 text-center hover:bg-muted/40 transition"
        >
          <Upload className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 text-sm">Clique ou arraste arquivos aqui</p>
          <input ref={inputRef} type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="font-display text-xl mb-4">Arquivos enviados</h2>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum arquivo enviado ainda.</p>
        ) : (
          <ul className="divide-y">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.size}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={f.url} download={f.name} className="text-xs text-primary hover:underline">Baixar</a>
                  <button
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-1.5 rounded-md hover:bg-muted"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

/* ---------- Atividades / Questões ---------- */
type Question = { enunciado: string; opcoes: string[]; correta: number };
type Activity = { id: string; titulo: string; descricao: string; questoes: Question[] };

function AtividadesPanel() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [creating, setCreating] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">Atividades</h2>
          <p className="text-sm text-muted-foreground">Crie questões de múltipla escolha para seus alunos.</p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova atividade
          </button>
        )}
      </div>

      {creating && (
        <ActivityForm
          onCancel={() => setCreating(false)}
          onSave={(a) => { setActivities((prev) => [a, ...prev]); setCreating(false); }}
        />
      )}

      {activities.length === 0 && !creating ? (
        <Card>
          <p className="text-sm text-muted-foreground">Nenhuma atividade criada. Clique em "Nova atividade" para começar.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {activities.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{a.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.descricao}</p>
                </div>
                <button
                  onClick={() => setActivities((prev) => prev.filter((x) => x.id !== a.id))}
                  className="p-1.5 rounded-md hover:bg-muted"
                  aria-label="Remover atividade"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{a.questoes.length} questão(ões)</p>
              <details className="mt-3">
                <summary className="text-sm text-primary cursor-pointer">Ver questões</summary>
                <ol className="mt-3 space-y-3 list-decimal list-inside text-sm">
                  {a.questoes.map((q, i) => (
                    <li key={i}>
                      <span className="font-medium">{q.enunciado}</span>
                      <ul className="mt-1 ml-4 space-y-0.5">
                        {q.opcoes.map((o, j) => (
                          <li key={j} className={j === q.correta ? "text-primary" : "text-muted-foreground"}>
                            {String.fromCharCode(65 + j)}) {o} {j === q.correta && "✓"}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </details>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityForm({ onSave, onCancel }: { onSave: (a: Activity) => void; onCancel: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [questoes, setQuestoes] = useState<Question[]>([
    { enunciado: "", opcoes: ["", "", "", ""], correta: 0 },
  ]);

  function updateQ(i: number, patch: Partial<Question>) {
    setQuestoes((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function updateOpt(qi: number, oi: number, v: string) {
    setQuestoes((prev) => prev.map((q, idx) => idx === qi ? { ...q, opcoes: q.opcoes.map((o, j) => j === oi ? v : o) } : q));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      questoes,
    });
  }

  return (
    <Card>
      <form onSubmit={save} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Nova atividade</h3>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-md hover:bg-muted" aria-label="Cancelar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          required value={titulo} onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título da atividade"
          className="w-full h-11 px-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={descricao} onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição / instruções"
          rows={2}
          className="w-full px-3 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="space-y-4">
          {questoes.map((q, qi) => (
            <div key={qi} className="rounded-md border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Questão {qi + 1}</p>
                {questoes.length > 1 && (
                  <button type="button" onClick={() => setQuestoes((p) => p.filter((_, i) => i !== qi))} className="text-xs text-destructive hover:underline">
                    Remover
                  </button>
                )}
              </div>
              <input
                required value={q.enunciado} onChange={(e) => updateQ(qi, { enunciado: e.target.value })}
                placeholder="Enunciado"
                className="w-full h-10 px-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-ring mb-3"
              />
              <div className="space-y-2">
                {q.opcoes.map((o, oi) => (
                  <label key={oi} className="flex items-center gap-2">
                    <input
                      type="radio" name={`correct-${qi}`} checked={q.correta === oi}
                      onChange={() => updateQ(qi, { correta: oi })}
                      className="accent-primary"
                    />
                    <input
                      required value={o} onChange={(e) => updateOpt(qi, oi, e.target.value)}
                      placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                      className="flex-1 h-9 px-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setQuestoes((p) => [...p, { enunciado: "", opcoes: ["", "", "", ""], correta: 0 }])}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-md border text-sm hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> Adicionar questão
          </button>
          <button type="submit" className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 ml-auto">
            Salvar atividade
          </button>
        </div>
      </form>
    </Card>
  );
}

/* ---------- Lives ---------- */
function LivesPanel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState<{ titulo: string; iniciada: string } | null>(null);
  const [titulo, setTitulo] = useState("");
  const [error, setError] = useState("");
  const [viewers] = useState(0);

  async function iniciar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setLive({ titulo: titulo.trim() || "Aula ao vivo", iniciada: new Date().toLocaleTimeString("pt-BR") });
    } catch {
      setError("Não foi possível iniciar a transmissão. Verifique câmera e microfone.");
    }
  }

  function encerrar() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(null);
    setTitulo("");
  }

  return (
    <section className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl">Transmissão ao vivo</h2>
            <p className="text-sm text-muted-foreground">
              Inicie uma live e compartilhe o link com seus alunos.
            </p>
          </div>
          {live && (
            <span className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> AO VIVO
            </span>
          )}
        </div>

        <div className="aspect-video w-full rounded-md overflow-hidden bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline />
        </div>

        {error && <p className="text-sm text-destructive mt-3">{error}</p>}

        {!live ? (
          <form onSubmit={iniciar} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              value={titulo} onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da live (opcional)"
              className="flex-1 h-11 px-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
              <Radio className="h-4 w-4" /> Iniciar live
            </button>
          </form>
        ) : (
          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <p className="text-sm"><span className="font-medium">{live.titulo}</span> · iniciada às {live.iniciada}</p>
            <button onClick={encerrar} className="sm:ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90">
              <Square className="h-4 w-4 fill-current" /> Encerrar
            </button>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-xl mb-4">Painel</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">{live ? "No ar" : "Offline"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Espectadores</dt>
            <dd className="font-medium">{viewers}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Título</dt>
            <dd className="font-medium truncate max-w-[60%] text-right">{live?.titulo || "—"}</dd>
          </div>
        </dl>
        <div className="mt-4 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
          Dica: para transmissões em grande escala, conecte o portal a um
          serviço de streaming (RTMP) posteriormente.
        </div>
      </Card>
    </section>
  );
}

/* ---------- UI ---------- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
}
