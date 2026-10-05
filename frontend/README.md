# Interface UPA

Aplicação React 19 com Vite 8.

## Requisitos

Node.js 22 e npm.

## Comandos

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

## Configuração

Copie `.env.example` para `.env.local` no desenvolvimento.

- `VITE_API_URL`: endereço da API, por padrão `http://localhost:8000/api`.
- `VITE_DJANGO_ADMIN_URL`: endereço base do Django Admin, por padrão local no desenvolvimento. No deploy, configure a URL HTTPS real do backend antes de gerar o build.

A interface não usa um destino local alternativo quando `VITE_DJANGO_ADMIN_URL` está ausente ou inválida. Nesse caso, os links administrativos de usuários e faturas ficam indisponíveis até a configuração ser feita.
