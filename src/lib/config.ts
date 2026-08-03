export const appConfig = {
  siteName: "INAPEM",
  siteUrl: import.meta.env.VITE_SITE_URL ?? "http://localhost:3000",
  studentPortalPath: "/aluno",
  storageDir: import.meta.env.VITE_STORAGE_DIR ?? "data",
  uploadsBasePath: "/uploads",
  maxUploadMb: Number(import.meta.env.VITE_MAX_UPLOAD_MB ?? 50),
};
