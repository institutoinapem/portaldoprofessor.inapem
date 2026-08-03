import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock3, FileText, PlayCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/aluno")({
  head: () => ({
    meta: [
      { title: "Portal do Aluno — INAPEM" },
      { name: "description", content: "Acesse as aulas e materiais enviados pelo professor." },
    ],
  }),
  component: StudentPortalPage,
});

type Lesson = {
  id: string;
  title: string;
  description: string;
  category: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  createdBy: string;
};

function StudentPortalPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/lessons");
      if (response.ok) {
        setLessons(await response.json());
      }
      setLoading(false);
    }

    load();
  }, []);

  const grouped = useMemo(() => {
    const groups = new Map<string, Lesson[]>();
    lessons.forEach((lesson) => {
      const current = groups.get(lesson.category) ?? [];
      current.push(lesson);
      groups.set(lesson.category, current);
    });
    return Array.from(groups.entries());
  }, [lessons]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-display text-xl">Portal do Aluno</p>
            <p className="text-sm text-muted-foreground">Aulas e materiais disponibilizados pelo professor.</p>
          </div>
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">
            Voltar ao login
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <section className="rounded-xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl">Conteúdo novo para você</h1>
              <p className="text-sm text-muted-foreground">Tudo que o professor publicar aparece aqui automaticamente.</p>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando aulas…</p>
        ) : grouped.length === 0 ? (
          <section className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Ainda não há aulas disponíveis. O professor precisará publicar algo primeiro.
          </section>
        ) : (
          grouped.map(([category, items]) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="font-display text-xl">{category}</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((lesson) => (
                  <article key={lesson.id} className="rounded-xl border bg-card p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{lesson.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {lesson.category}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-4 w-4" /> {new Date(lesson.uploadedAt).toLocaleString("pt-BR")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" /> {lesson.fileName}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={lesson.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                        <PlayCircle className="h-4 w-4" /> Abrir material
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
