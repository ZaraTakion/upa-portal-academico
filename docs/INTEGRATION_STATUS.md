# Takion Campus — estado verificado da integração

Data: 10/10/2026. Este documento distingue execução local, GitHub e provedores externos. Não declara a release concluída enquanto deploy, credenciais privadas e fluxos remotos estiverem sem comprovação.

## GitHub e reconciliação

- Main auditada: `777884a364cb7e9291acb88dbbbf94b0c7062614`.
- PR #20: branch `improve/verified-release-20261010`, commit `5c19d23bc5de98f87d6062a75a4c4002570b232e`, aberto e com conflitos com main na leitura da API.
- PR #21: branch `design/takion-campus-20261010`, commit `3010a993fcd47d672da319b9f1c95c13fcf9c494`, aberto, base no PR #20 e mergeable nessa base.
- Branch de integração: `integration/takion-campus-final-20261010`, criada sobre main, sem worktree adicional.
- Merge `c5cdb97`: preserva permissões, integridade, cadastros administrativos e sessão em memória do #20, mais launcher e provisionamento privado da main.
- Merge `2feb880`: integra design system, fontes locais, marca, layouts e matriz visual do #21; conserva configuração frontend-only na Vercel e as regressões adicionais da main.
- Commit `235622b`: corrige hospedagem gratuita, uploads, homologação sintética e regressões da integração.
- [PR #25](https://github.com/ZaraTakion/takion-campus/pull/25): integração publicada como rascunho, sem conflitos com a main. Os PRs #20/#21 foram atualizados com referência à integração.

As branches originais foram preservadas. Os cinco checks do [GitHub Actions no commit d3ddf8f](https://github.com/ZaraTakion/takion-campus/actions/runs/38062130616) passaram: frontend, Django/SQLite, Django/PostgreSQL, setup autônomo e E2E. A suíte de navegador contém 86 cenários e inclui o zoom real obrigatório; não há testes desabilitados. A main continua preservada enquanto planos/elegibilidade, publicação e fluxos remotos não estão verificados. Não interpretar os merges desta branch como PRs integrados na main.

## Correções concretas

- CSRF exigido também no login, mantendo a rota de bootstrap compatível da main e schema OpenAPI válido. Testes preservam a proteção adicionada pela release.
- JWT access somente em memória e refresh HttpOnly, com renovação, rotação, blacklist, invalidação após troca de senha e logout.
- Proxy `/api` de mesma origem com destino fixo ao domínio previsto do Render; build permite `/api` ou API HTTPS validada. O destino foi confirmado no serviço existente e a API pública passou no teste de readiness; o proxy Vercel ainda depende da publicação do frontend.
- Downloads passam a retornar caminhos relativos, compatíveis com proxy e API direta, preservando validação de origem antes de enviar Bearer.
- Tempo de requisição de 90 segundos para acomodar cold start, com erros reais exibidos pela interface.
- Provisionamento privado exige `CAMPUS_ENVIRONMENT=preview`, opt-in, DEBUG=False e três senhas fortes. Cria registros sintéticos e não redefine resultados/senhas editados.
- Build Render usa checks de deploy e coleta de estáticos; startup verifica integridade antes de migrar; readiness consulta o banco.
- Uploads desabilitados no Blueprint gratuito enquanto não houver storage privado persistente. API/Admin impedem envios e a interface informa a indisponibilidade.
- Recuperada a informação de próxima aula da main no dashboard redesenhado.
- Corrigidos clone/path obsoletos, referências a Vercel Services e afirmações históricas de documentação.

## Evidências locais

| Verificação | Resultado |
| --- | --- |
| Django em SQLite | 104 testes aprovados |
| Django em PostgreSQL 17.11 | 104 testes aprovados |
| Django check, migrations dry-run | Aprovados, sem migrations adicionais |
| OpenAPI validado com fail-on-warn | Aprovado |
| Integridade acadêmica | Aprovada, sem alterar registros |
| Checks de produção e build.sh | Aprovados sem warnings de deploy; static files coletados |
| Ruff | Aprovado |
| Dependências Python | pip check aprovado; pip-audit do ambiente instalado sem vulnerabilidades conhecidas |
| Testes Node | 37 aprovados |
| ESLint, build de produção e npm audit | Aprovados; zero vulnerabilidades npm |
| PostgreSQL TLS | Conexão local TLS 1.3 com sslmode=verify-full e CA de teste confiada explicitamente |
| Backup/restauração PostgreSQL local | 30 tabelas com conteúdo coincidente, 107 constraints e 29 sequências iguais; backup privado fora do Git |
| Gunicorn com HTTPS local | Login, perfil, refresh e logout dos três perfis aprovados; certificado verificado e cookies Secure/HttpOnly confirmados |
| Startup em PostgreSQL vazio | Preflight, todas as migrações e integridade após migração aprovados |
| Setup local repetido | Launcher prepara banco sintético e repete sem reinstalar |
| Matriz visual/design | 46 cenários aprovados, 11 larguras, claro/escuro, axe, teclado e redução de movimento |
| Fluxos Playwright | 39 cenários aprovados: 37 na execução completa e 2 após correções, com regressão direcionada de navegação também aprovada |
| Zoom real via extensão | Aprovado no CI completo; continua bloqueado pela política administrativa do Chromium local, sem contornar essa política |

A matriz percorre 40 combinações de página/perfil em 320, 360, 390, 430, 768, 1024, 1366, 1440, 1920, 2560 e 3840 px nos dois temas: 880 composições. Axe cobre 160 combinações dessa matriz. As capturas anteriores do PR #21 são históricas; [16 capturas atuais](design/INTEGRATION_EVIDENCE.md) mostram login e os três perfis em 1440/390 px e nos dois temas. Não houve avaliação NVDA/VoiceOver, Safari/Firefox ou dispositivos físicos; não se afirma certificação WCAG.

## Funcionalidades por perfil

| Perfil | Fluxos cobertos pelos testes locais |
| --- | --- |
| Aluno | Login, dashboard, perfil, disciplinas, notas, avaliações, agenda, calendário, avisos, financeiro informativo, chamados, entregas e downloads privados; bloqueio de funções administrativas |
| Professor | Turmas vinculadas, avaliações, lançamento de notas/frequência, materiais, atividades, devolutivas e bloqueio de registros de outro professor |
| Administrador | Contas/perfis, cursos, turmas, matrículas, calendário, avisos, faturas informativas e resposta a chamados; restrições de integridade e contas sensíveis |

Os testes de navegador usam build React real e Django/PostgreSQL locais. Os três perfis passaram em autenticação e operações reais na API pública Render, incluindo persistência após reinício. A comprovação no frontend React publicado permanece pendente.

## Infraestrutura: estado externo

A [validação remota de 10/10/2026](REMOTE_VALIDATION.md) registra os testes públicos, IDs e limites da comprovação.

| Provedor | Recurso existente | Evidência atual |
| --- | --- | --- |
| Render | `srv-db4rlfvlot8c73cp2ks0`, `takion-campus-api` | API autenticada HTTP 200; plano Free; deploy `dep-db56laflk1mc738u9o9g` live em `d3ddf8f`; readiness pública HTTP 200; três perfis e Admin testados |
| Neon | `winter-river-76082998`, branch `br-steep-mountain-b7rfe5zs` | Organização Free; banco vazio inspecionado antes das migrations; 30 tabelas após startup; conexão TLS e persistência de registros após reinício comprovadas |
| Vercel | Projeto único `prj_7MAXOxPiNcOveii1nwX48808vLmE`, `takion-campus` | Hobby confirmado; uso pessoal não comercial confirmado pelo usuário; deploy Node 22 READY, somente frontend; domínio público ainda bloqueado pelo proxy da sessão |

Os três bindings publicados funcionam no runtime revisão 4. As falhas históricas 401/401/403 não se repetiram; não se atribui causa única sem evidência. Logs Render têm um bloqueio Cloudflare HTTP 403 separado da autenticação do serviço. Os domínios de documentação da API Render e SQL HTTPS Neon faltam na allowlist: receberam 403 do proxy e foram adicionados ao rascunho, ainda sem aplicação ao runtime.

## Limitações e retomada

1. Aplicar a allowlist salva para acessar `takion-campus.vercel.app`. O projeto Hobby já foi publicado, após confirmar uso pessoal não comercial e ausência de projeto existente; não criar outro.
2. Executar os três perfis no domínio público, incluindo o proxy `/api`. As origens exatas já foram aplicadas por deploy sem rebuild no Render: login da origem Vercel aprovado e origem não confiável rejeitada. Testes da API direta e build READY não substituem a validação do React público.
3. Aplicar as adições de rede já salvas no rascunho, incluindo os domínios Vercel atribuídos. Não recadastrar tokens que já autenticam.
4. SMTP externo e backup/restauração do Neon ativo ainda não foram testados. O backup local não prova recuperação do banco hospedado.
5. Storage privado persistente gratuito continua pendente; uploads permanecem desabilitados. Nenhum bucket ou serviço pago foi criado.
6. Zoom real foi validado no runner do GitHub Actions. A execução local continua limitada pela política do Chromium, que não foi contornada.

Links verificados: [readiness pública](https://takion-campus-api.onrender.com/health/ready/), [Admin](https://takion-campus-api.onrender.com/admin/), [deploy Render](https://dashboard.render.com/web/srv-db4rlfvlot8c73cp2ks0/deploys/dep-db56cdid0e5s73ec3a40), [PR #25](https://github.com/ZaraTakion/takion-campus/pull/25). A URL Vercel atribuída é [takion-campus.vercel.app](https://takion-campus.vercel.app); seu funcionamento público ainda não foi verificado, pois o proxy bloqueia o domínio. Main e branches originais permanecem preservadas.
