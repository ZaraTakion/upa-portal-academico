# Validação remota do Takion Campus

Verificação em 10/10/2026. Backend implantado a partir de `d3ddf8fe66844876665ede18d59700557b2a0dd0`. A allowlist publicada na revisão 6 permite acessar o portal. O frontend e o proxy `/api` passaram em testes públicos de navegador dos três perfis em 10/10/2026, às 14:14:53 em Fortaleza. O E2E do CI do commit `7312a0f` falhou; a causa ainda depende dos logs bloqueados.

## Acesso autenticado e planos

| Provedor | Evidência | Plano/recurso |
| --- | --- | --- |
| Render | Leitura autenticada do serviço: HTTP 200; atualização de configuração, variáveis e deploy aceita | Serviço existente `srv-db4rlfvlot8c73cp2ks0`, `takion-campus-api`, Free; AutoDeploy desativado |
| Neon | Leitura autenticada do projeto e organização: HTTP 200 | Organização `org-long-morning-93939826`: `free`; projeto existente `winter-river-76082998`, branch `br-steep-mountain-b7rfe5zs`, banco `neondb`, PostgreSQL 17 |
| Vercel | Usuário, equipes e listagem de projetos autenticados: HTTP 200 | Equipe `team_LcbimpnIghwY6niA2lWwJPux`, Hobby ativo, acesso OWNER; projeto único `prj_7MAXOxPiNcOveii1nwX48808vLmE`, criado após confirmar ausência de projetos e uso pessoal não comercial |

Os bindings publicados estão disponíveis pelo mecanismo autorizado do ambiente, revisões 4 e 6, com novas leituras autenticadas HTTP 200 dos três recursos. Render 401, Neon 401 e Vercel 403 anteriores não se repetiram nessas operações. Não é possível atribuir uma causa única às falhas históricas nem concluir que os tokens anteriores eram inválidos. Valores não foram registrados em código, documentação ou logs compartilhados.

## Render e PostgreSQL existentes

- [Deploy `dep-db56cdid0e5s73ec3a40`](https://dashboard.render.com/web/srv-db4rlfvlot8c73cp2ks0/deploys/dep-db56cdid0e5s73ec3a40): build `succeeded`, deploy inicialmente `live`. Criado às 16:22:14 UTC e concluído às 16:24:58 UTC (13:24:58 em Fortaleza).
- Deploy de aplicação das origens: [`dep-db56laflk1mc738u9o9g`](https://dashboard.render.com/web/srv-db4rlfvlot8c73cp2ks0/deploys/dep-db56laflk1mc738u9o9g), live às 16:42:17 UTC, mesmo commit, modo `deploy_only`, sem outro build. Um reinício simples manteve as origens anteriores e o teste de login vindo da Vercel recebeu 403; o deploy aplicou as variáveis. Após isso, bootstrap/login da origem Vercel receberam 200 com `Access-Control-Allow-Origin` exato e logout 205; origem não confiável recebeu 403.
- Configuração corrigida: branch de integração, raiz `backend`, comandos de build/start do Blueprint e health check `/health/ready/`.
- `DATABASE_URL` estava ausente. A conexão foi transferida diretamente da API Neon para as variáveis do serviço, sem imprimir a URL. TLS configurado com `sslmode=verify-full`, CA do sistema e `channel_binding=require`.
- Antes da migração, a API de schema do banco existente retornou **zero tabelas**. Após startup, retornou **30 tabelas**, incluindo migrations Django, usuários, avaliações e resultados acadêmicos. Não havia tabelas acadêmicas anteriores a sobrescrever.
- O comando de startup exige integridade, migrations e provisionamento privado antes de iniciar Gunicorn. As três contas hospedadas foram criadas com senhas privadas fortes, diferentes das contas locais.
- [Readiness pública](https://takion-campus-api.onrender.com/health/ready/): HTTP 200, `{"status":"ready"}`, `Cache-Control: private, no-store`. [Liveness](https://takion-campus-api.onrender.com/health/): HTTP 200.
- HSTS, `X-Content-Type-Options: nosniff` e `X-Frame-Options: DENY` observados nas respostas públicas.
- [Django Admin](https://takion-campus-api.onrender.com/admin/): login HTTPS real aprovado, cookie de sessão Secure/HttpOnly e CSS coletado servido com HTTP 200. As credenciais permanecem nos campos privados do serviço.

## Testes reais pela API pública

| Verificação | Resultado observado |
| --- | --- |
| Aluno, Professor e Administrador | Login, perfil e dashboard: HTTP 200, perfil/grupo correto |
| Sessão dos três perfis | Refresh HTTP 200; logout HTTP 205; refresh posterior HTTP 401; cookie refresh Secure/HttpOnly |
| Login sem CSRF | HTTP 403 |
| Aluno administrando contas ou escrevendo resultados | HTTP 403 |
| Dados acadêmicos e schema sem autenticação | HTTP 401 |
| Professor | Criou avaliação sintética e resultado de nota 8,50, ambos HTTP 201 |
| Aluno | Leu a nota 8,50 gravada pelo Professor, HTTP 200 |
| Administrador | Criou e consultou curso sintético, HTTP 201/200 |
| Reinício real do Render | Instância `79xrj` substituída por `4xdmw`, nova instância pronta e anterior removida |
| Persistência após reinício | Avaliação ID 2, resultado ID 2 e curso ID 2 conservaram seus IDs e valores; nota continuou 8,50 |

Registros criados em `20261010T162656Z`, exclusivamente sintéticos. A primeira tentativa de criar avaliação usou uma categoria inválida no script de teste e recebeu HTTP 400; o script foi corrigido para a categoria suportada `other`, e o fluxo completo foi aprovado. Não houve correção ou relaxamento da validação da aplicação.

Esses testes exercitam o backend HTTPS real. A seção abaixo acrescenta os testes do React publicado e do proxy Vercel; o CI continua sendo uma evidência separada.

## Frontend público e proxy `/api`: teste real

[Portal público](https://takion-campus.vercel.app) e [deploy validado `dpl_7cv5Vgc3qHsSXqtsMshcecBytBtM`](https://vercel.com/zaras-projects-f0700f27/takion-campus/7cv5Vgc3qHsSXqtsMshcecBytBtM). Ambos os aliases de produção apontam para esse deploy READY. O projeto existente permanece Hobby, raiz `frontend`, Node 22; backend e Python não foram enviados.

A publicação anterior estava READY, mas `GET /api/accounts/csrf/` retornava HTML do React com HTTP 200, e `POST /api/token/` retornava HTTP 405. Portanto, o login não funcionava. Leituras das APIs autenticadas e da readiness Render passaram: isso diferencia a falha de configuração da publicação de erro de token ou bloqueio da allowlist. As tentativas de republicar fonte/configuração por API continuaram produzindo esse comportamento e não foram tratadas como sucesso.

A correção comprovada foi publicar o build React pelo **Build Output API v3**, com `config.json` de rotas explícitas: `/api/(.*)` encaminhado ao Render, sem cache, antes de filesystem e fallback SPA. O build foi executado com Node 22, `VITE_API_URL=/api` e Admin Render HTTPS. Foram enviados **54 arquivos**: configuração do artefato mais 53 arquivos estáticos do frontend. A raiz do upload prebuilt é o próprio frontend (`.vercel/output`, com `projectSettings.rootDirectory=null` nessa requisição); a configuração permanente do projeto continua `frontend`. A tentativa com o prefixo `frontend/.vercel/output` recebeu `missing_lock_file` e não foi promovida como válida. O parâmetro `prebuilt=1` segue o cliente oficial `@vercel/client` 18.8.2. Não houve alteração na lógica da aplicação.

Após a correção, o bootstrap retorna **HTTP 200, `application/json`, `Cache-Control: private, no-store`**. Chromium/Playwright acessou o domínio HTTPS público pelo proxy autorizado, com validação de certificado. O relatório de operações terminou às **14:14:53 em Fortaleza** com exit code 0:

| Perfil/verificação | Comportamento público comprovado |
| --- | --- |
| Aluno | Login, sessão após reload, edição persistente do telefone sintético, redirecionamento ao tentar `/admin-panel` |
| Professor | Login, criação de avaliação sintética, lançamento e releitura da nota **8,75** |
| Aluno e Professor | O Aluno consultou na interface a nota criada pelo Professor, via `/api` |
| Administrador | Login, criação e releitura de curso sintético após reload |
| Três perfis | Cookies refresh Secure/HttpOnly/SameSite=Lax, access fora do localStorage, renovação após reload, logout e rejeição de rotas privadas |
| API pelo domínio Vercel | Login/perfil/dashboard/refresh HTTP 200; logout 205; refresh após logout 401 |
| Autorizações | Anônimo consultando perfil: 401; Aluno escrevendo notas/administrando contas e Professor administrando contas: 403 |
| CSRF | Login sem CSRF ou com Origin não confiável: 403 esperado |
| Registros anteriores | Avaliação ID 2, resultado ID 2 (8,50) e curso ID 2 continuam persistidos e legíveis pelo proxy |

Não foram observados erros JavaScript nem respostas HTTP 5xx durante o fluxo de interface. Axe verificou login e as três páginas iniciais sem violações nas regras WCAG selecionadas; isso não é certificação WCAG. As capturas públicas em 1440/390 px e relatórios sanitizados estão em [PUBLIC_VALIDATION.md](design/PUBLIC_VALIDATION.md). Somente registros sintéticos foram utilizados.

## CI e bloqueios restantes

- No commit solicitado `7312a0f34e15f3861fc30f9bc0a6c1654e026890`, o [run `38069064953`](https://github.com/ZaraTakion/takion-campus/actions/runs/38069064953) terminou com **frontend, Django/SQLite, Django/PostgreSQL e autonomous-demo aprovados; E2E falhou**. A anotação disponível diz apenas `Process completed with exit code 1.`; não comprova a causa. Os cinco checks do commit de código `d3ddf8f` passaram anteriormente, mas não substituem esse resultado atual.
- **Logs/artefato do CI:** a API GitHub funciona; os downloads redirecionam para `results-receiver.actions.githubusercontent.com` e `productionresultssa16.blob.core.windows.net`, ainda ausentes da allowlist do runtime 6. Esses domínios foram adicionados ao rascunho, preservando os existentes; salvar/publicar e retomar a leitura é necessário para diagnosticar o E2E. Não foi contornada a política de rede nem desabilitado teste.
- **Logs Render:** `GET /v1/logs` continua recebendo HTTP 403, HTML `Attention Required! | Cloudflare`, `cf-ray` observado (`a4873a554e34eb93-SEA`). `api-docs.render.com` também respondeu 403 com evidência Cloudflare após entrar na allowlist. São respostas HTTP do serviço externo, distintas do antigo CONNECT 403 do proxy. A leitura autenticada do serviço Render recebe 200; não há prova de token inválido ou falta de escopo. A regra específica do Cloudflare é desconhecida. Consultar o painel/suporte Render para liberar o acesso de logs da origem do ambiente, sem upgrade.
- Os 403 de permissão e CSRF listados acima são proteções esperadas da aplicação e foram validados separadamente.
- Uploads continuam desabilitados por ausência de storage privado persistente gratuito verificado. SMTP externo e backup/restauração do Neon ativo não foram comprovados; o teste local de backup continua sendo evidência local.

Nenhum serviço pago, cobrança, projeto Neon adicional, serviço Render adicional ou projeto Vercel duplicado foi criado. O [PR #25](https://github.com/ZaraTakion/takion-campus/pull/25) permanece em rascunho, sem merge na main. Os fluxos públicos descritos passaram; a validação final de CI continua pendente do diagnóstico do E2E.
