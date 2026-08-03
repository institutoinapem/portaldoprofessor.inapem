import { createFileRoute } from "@tanstack/react-router";
import { createLesson, listLessons } from "@/lib/lessons-store.server";

export const Route = createFileRoute("/api/lessons")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const lessons = await listLessons();
        return new Response(JSON.stringify(lessons), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
      POST: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const category = String(formData.get("category") || "Geral").trim();
        const createdBy = String(formData.get("createdBy") || "Professor").trim();

        if (!file || !title) {
          return new Response(JSON.stringify({ error: "Arquivo e título são obrigatórios." }), {
            status: 400,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }

        const bytes = Buffer.from(await file.arrayBuffer());
        const lesson = await createLesson({
          title,
          description,
          category,
          fileName: file.name,
          fileBuffer: bytes,
          createdBy,
        });

        return new Response(JSON.stringify(lesson), {
          status: 201,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
    },
  },
});
