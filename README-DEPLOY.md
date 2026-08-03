# Configuração para deploy

## Variáveis de ambiente

Crie um arquivo .env na raiz do projeto com:

```env
VITE_SITE_URL=https://portadoaluno.inapem.com
VITE_STORAGE_DIR=data
VITE_MAX_UPLOAD_MB=50
```

## Deploy recomendado

- Frontend: Vercel, Netlify, Cloudflare Pages ou similar
- Backend/arquivos: Cloudflare R2, S3, Supabase Storage ou similar

## Observações importantes

- O fluxo atual salva arquivos localmente em `data/` e em `public/uploads/`.
- Para produção, troque isso por um armazenamento remoto para evitar perda de arquivos.
- O portal do aluno é acessado em `/aluno` e pode ser publicado em um subdomínio separado.

## Passo a passo simples

1. Ajuste o domínio no `VITE_SITE_URL`
2. Faça o deploy do projeto
3. Configure o subdomínio `portadoaluno.inapem.com` para apontar para a aplicação
4. Se quiser, substitua o armazenamento local por um bucket remoto
