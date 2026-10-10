# Validação remota do Takion Campus

Verificação em 10/10/2026. Backend implantado a partir de `d3ddf8fe66844876665ede18d59700557b2a0dd0`. O frontend Vercel ainda não foi publicado; estes resultados não comprovam o portal completo no navegador.

## Acesso autenticado e planos

| Provedor | Evidência | Plano/recurso |
| --- | --- | --- |
| Render | Leitura autenticada do serviço: HTTP 200; atualização de configuração, variáveis e deploy aceita | Serviço existente `srv-db4rlfvlot8c73cp2ks0`, `takion-campus-api`, Free; AutoDeploy desativado |
| Neon | Leitura autenticada do projeto e organização: HTTP 200 | Organização `org-long-morning-93939826`: `free`; projeto existente `winter-river-76082998`, branch `br-steep-mountain-b7rfe5zs`, banco `neondb`, PostgreSQL 17 |
| Vercel | Usuário, equipes e listagem de projetos autenticados: HTTP 200 | Equipe `team_LcbimpnIghwY6niA2lWwJPux`, Hobby ativo, acesso OWNER; zero projetos na equipe e no escopo pessoal |

Os bindings publicados estão disponíveis pelo mecanismo autorizado do ambiente, revisão 4. Render 401, Neon 401 e Vercel 403 anteriores não se repetiram nessas operações. Não é possível atribuir uma causa única às falhas históricas nem concluir que os tokens anteriores eram inválidos. Valores não foram registrados em código, documentação ou logs compartilhados.

## Render e PostgreSQL existentes

- [Deploy `dep-db56cdid0e5s73ec3a40`](https://dashboard.render.com/web/srv-db4rlfvlot8c73cp2ks0/deploys/dep-db56cdid0e5s73ec3a40): build `succeeded`, deploy `live`. Criado às 16:22:14 UTC e concluído às 16:24:58 UTC (13:24:58 em Fortaleza).
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

Esses testes exercitam o backend HTTPS real. Os 86 cenários de navegador do CI são evidências separadas da integração; ainda faltam testes do React publicado e do proxy `/api` da Vercel.

## Bloqueios comprovados e próximos passos

- **Logs Render:** `GET /v1/logs` responde HTTP 403 com HTML `Attention Required! | Cloudflare`, inclusive sem filtros. A API do serviço e as mutações funcionam; essa resposta não comprova token inválido ou falta de escopo. O motivo específico da regra Cloudflare não está disponível. Consultar os logs pelo painel do provedor ou liberar o acesso da origem usada pelo ambiente, sem contratar plano.
- **Domínios de rede:** HTTPS para `api-docs.render.com` e `ep-bold-base-b7tarv20.c-13.us-east-1.aws.neon.tech` recebeu `Tunnel connection failed: 403 Forbidden` antes de alcançar o serviço. Ambos faltam na allowlist publicada. Adições salvas no rascunho; ainda não aplicadas à revisão 4. Não é necessário cadastrar novamente os três tokens. Isso não impediu a conexão Render → Neon, já validada.
- **Vercel:** não existe projeto nos dois escopos acessíveis, portanto nenhum recurso duplicado foi criado. Confirmar que a demonstração é pessoal e não comercial antes de criar o único projeto necessário: a [regra oficial Hobby](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage) exclui publicidade/venda de serviços e desenvolvimento remunerado. Uso comercial exigiria outra solução gratuita permitida; não foi autorizado upgrade.
- Depois dessa confirmação: publicar somente `frontend`, Vite/Node 22, `npm ci`, `npm run build`, `dist`, `/api` e URL real do Admin. Liberar apenas o domínio Vercel efetivamente atribuído, configurar as origens exatas no Render e executar testes públicos de navegador dos três perfis.
- Uploads continuam desabilitados por ausência de armazenamento privado persistente gratuito verificado. SMTP externo e backup/restauração do Neon ativo não foram comprovados; o teste local de backup continua sendo evidência local.

Nenhum serviço pago, cobrança, projeto Neon adicional, serviço Render adicional ou merge na main foi solicitado. O [PR #25](https://github.com/ZaraTakion/takion-campus/pull/25) permanece em rascunho.
