# Takion Campus — Campus Folio

Aplicação React 19 com Vite 8, design editorial baseado no documento Campus Folio. Consulte `../docs/TEST_PLAN_CAMPUS_FOLIO.md` para a matriz de validação.

## Requisitos

Node.js 22 e npm.

## Comandos

```bash
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

## Configuração

Copie `.env.example` para `.env.local` no desenvolvimento.

- `VITE_API_URL`: endereço da API, por padrão `http://localhost:8000/api`.
- `VITE_DJANGO_ADMIN_URL`: endereço base do Django Admin, por padrão local no desenvolvimento. No deploy, configure a URL HTTPS real do backend antes de gerar o build.

O cliente Axios autorizado aceita somente a origem e o caminho-base definidos em `VITE_API_URL` para impedir vazamento de credenciais em URLs externas. A proteção é verificada por testes unitários (`npm test`). Configure `VITE_API_URL` com um domínio HTTPS confiável em produção; não use instâncias do Axios autenticadas para integrar serviços de terceiros. Os downloads também são verificados individualmente no caminho de arquivo.

O access token ainda é guardado em `localStorage`, portanto um eventual XSS continua sendo um risco. Os refresh tokens são cookies HTTP-only; essa separação não elimina a necessidade de prevenir XSS e manter dependências atualizadas.

A interface não usa um destino local alternativo quando `VITE_DJANGO_ADMIN_URL` está ausente ou inválida. Nesse caso, os links administrativos de usuários e faturas ficam indisponíveis até a configuração ser feita.

## Publicação gratuita (Vercel + Render)

Na Vercel escolha **Root Directory: frontend** e **Framework Preset: Vite**.
O arquivo `frontend/vercel.json` oferece fallback da SPA.
Configure `VITE_API_URL=https://SEU-BACKEND.onrender.com/api` e
`VITE_DJANGO_ADMIN_URL=https://SEU-BACKEND.onrender.com/admin/` no painel
Vercel antes de construir o site. O backend Django roda no Render, não na Vercel.
Consulte `../docs/VERCEL_DEPLOYMENT.md`.
