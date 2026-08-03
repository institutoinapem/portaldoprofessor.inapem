import { promises as fs } from "node:fs";
import path from "node:path";
import { uploadFileToStorage } from "./storage";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  category: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  createdBy: string;
};

export type CreateLessonInput = {
  title: string;
  description: string;
  category: string;
  fileName: string;
  fileBuffer: Buffer;
  createdBy: string;
};

function resolvePaths(baseDir: string) {
  const storageDir = path.resolve(baseDir, "data");
  const uploadsDir = path.resolve(baseDir, "public", "uploads");
  return {
    storageDir,
    uploadsDir,
    lessonsFilePath: path.join(storageDir, "lessons.json"),
  };
}

async function ensureStorage(baseDir: string) {
  const { storageDir, uploadsDir } = resolvePaths(baseDir);
  await fs.mkdir(storageDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });
}

function sanitizeFileName(fileName: string) {
  const baseName = path.basename(fileName || "arquivo");
  const ext = path.extname(baseName) || ".bin";
  const stem = baseName.replace(ext, "").replace(/[^a-zA-Z0-9-_]+/g, "-").toLowerCase() || "arquivo";
  return `${stem}${ext}`;
}

export async function listLessons(baseDir = process.cwd()): Promise<Lesson[]> {
  await ensureStorage(baseDir);
  const { lessonsFilePath } = resolvePaths(baseDir);

  try {
    const content = await fs.readFile(lessonsFilePath, "utf8");
    const parsed = JSON.parse(content) as Lesson[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function createLesson(input: CreateLessonInput, baseDir = process.cwd()): Promise<Lesson> {
  await ensureStorage(baseDir);
  const { uploadsDir, lessonsFilePath } = resolvePaths(baseDir);
  const safeFileName = sanitizeFileName(input.fileName);
  const ext = path.extname(safeFileName) || ".bin";
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storageResult = await uploadFileToStorage(input.fileBuffer, `${id}${ext}`, baseDir);

  const lesson: Lesson = {
    id,
    title: input.title.trim(),
    description: input.description.trim() || "Sem descrição adicionada.",
    category: input.category.trim() || "Geral",
    fileName: safeFileName,
    fileUrl: storageResult.url,
    uploadedAt: new Date().toISOString(),
    createdBy: input.createdBy.trim() || "Professor",
  };

  const lessons = [...(await listLessons(baseDir)), lesson];
  await fs.writeFile(lessonsFilePath, JSON.stringify(lessons, null, 2));

  return lesson;
}
