# Interface UPA

React 19 e Vite 8. O [README principal](../README.md) documenta instalação Full-Stack e o [workflow](../.github/workflows/backend-checks.yml) executa os fluxos reais no navegador.

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
npm run test:e2e
```

Use Node.js 22. Copie `.env.example` para `.env.local` e configure `VITE_API_URL` com a origem e o prefixo da API. Vite incorpora essas variáveis no build. A administração de contas, perfis, financeiro e comunicados funciona dentro do portal; o Django Admin permanece acessível por sua própria URL.

O cliente Axios valida destinos antes de anexar credenciais, tem timeout e compartilha a renovação entre requisições concorrentes. Access token fica em memória; perfil e preferência de tema têm cache local. O cookie HttpOnly restaura a sessão após recarregar. Falhas de rede não revogam automaticamente a sessão. O logout aguarda revogação no servidor e exibe erro se ela falhar.

As páginas são carregadas por rotas. Componentes compartilham paleta, estados, formulários e foco visível. O menu móvel mantém foco, permite Escape e bloqueia interação com o conteúdo ao abrir. Animações respeitam `prefers-reduced-motion`.

As suítes Node verificam regras de payload, paginação, URLs, datas e papéis. Playwright exercita componentes, formulários, rotas e integração com Django/PostgreSQL, incluindo axe e capturas em 320, 390, 768, 1366, 1920 e 2560 px. Use banco de testes isolado; a suíte grava dados fictícios. Dependências do navegador estão no lockfile. `playwright-report/` e `test-results/` são artefatos, não código-fonte.

## Hospedagem atual

A raiz Vercel é `frontend`. O build de produção usa `VITE_API_URL=/api` e o rewrite fixo para o Render antes do fallback SPA. `VITE_DJANGO_ADMIN_URL` aponta ao Admin HTTPS real, sem inventar um destino quando ausente. Veja [deploy e limites gratuitos](../docs/VERCEL_DEPLOYMENT.md). A hospedagem externa e os três logins privados precisam ser verificados após aplicação das credenciais nos provedores.
