# Implantação Vercel — Takion Campus

**Estado:** configuração adicionada à branch de desenvolvimento. Deploy real ainda depende da conta Vercel, banco e armazenamento; não existe aprovação de produção neste documento.

## Importação com Vercel Services

1. Importe o repositório mantendo a **raiz do projeto** como Root Directory e escolha **Framework Preset: Services**.
2. O arquivo vercel.json separa backend Django e frontend Vite, com /api/, /admin/, /static/ e /health/ roteados ao backend. Rotas e assets do React vão ao frontend; o fallback SPA usa index.html.
3. A branch com as alterações é **feat/campus-folio-auth-and-ui**, no PR #22. A branch main ainda não contém essas melhorias. Não faça merge antes de confirmar a prévia.
4. Habilite Deployment Protection na Preview. Restrinja acesso e não divulgue senhas de homologação.

## Variáveis no backend (Preview, privadas)

| Nome | Valor ou instrução |
|---|---|
| SECRET_KEY | Chave aleatória longa, gerada de forma privada |
| DEBUG | False |
| DATABASE_URL | URL PostgreSQL TLS isolada para Preview (ex.: Neon) |
| USE_S3_STORAGE | True |
| AWS_STORAGE_BUCKET_NAME | Bucket privado e persistente de homologação |
| AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY | Credenciais privadas do bucket, nunca no frontend |
| AWS_S3_ENDPOINT_URL / AWS_S3_REGION_NAME | Valores do provedor S3 escolhido |
| CSRF_COOKIE_SAMESITE | Lax, pois frontend e backend compartilham a origem |
| TRUST_PROXY_SSL_HEADER | True apenas se a borda Vercel sobrescrever X-Forwarded-Proto de forma confiável |
| SECURE_SSL_REDIRECT / SESSION_COOKIE_SECURE / CSRF_COOKIE_SECURE / JWT_REFRESH_COOKIE_SECURE | True |
| FRONTEND_URL | URL HTTPS correta para links de recuperação; sem valor explícito usa host exato do VERCEL_URL |
| ALLOWED_HOSTS / CSRF_TRUSTED_ORIGINS | Acrescente domínios customizados; o preview host exato VERCEL_URL é adicionado pelo Django |

**Nunca habilite DEBUG ou senhas públicas para contornar dificuldades no login publicado.** Não habilite ALLOW_SQLITE_DATABASE ou ALLOW_LOCAL_MEDIA_STORAGE na Vercel. O filesystem das funções é efêmero; dados e arquivos precisam de serviços persistentes.

## Variáveis no frontend (públicas)

VITE_API_URL=/api e VITE_DJANGO_ADMIN_URL=/admin/. O arquivo frontend/.env.production inclui apenas essas URLs relativas, sem dados secretos.

## Banco e contas de teste

Provisione um banco PostgreSQL separado para Preview; nunca use um banco de produção. Migrações são uma operação controlada fora do build. Em ambiente seguro e autenticado com as variáveis corretas, execute:

    cd backend
    python manage.py migrate --noinput

Crie três usuários de homologação com senhas privadas, seus grupos (Aluno, Professor, Administrador) e respectivos perfis acadêmicos. O comando seed_demo foi feito apenas para desenvolvimento e falha com DEBUG=False. Não use as credenciais conhecidas do seed_demo em uma URL pública.

## Checklist para validação da Preview

- [ ] GET /health/ retorna status ok.
- [ ] GET /admin/login/ apresenta Django Admin; GET /static/admin/css/base.css retorna CSS.
- [ ] Rotas do React como /dashboard e /teacher/classes suportam atualização direta da página sem 404.
- [ ] Aluno entra, consulta dados próprios e recebe 403 ao tentar escrever dados exclusivos de admin.
- [ ] Professor entra, vê turmas próprias e cria avaliação; não acessa funções de admin.
- [ ] Administrador entra, acessa /admin-panel e cria curso; não usa perfil de aluno.
- [ ] Refresh CSRF/cookie e logout são testados no navegador real.
- [ ] Banco conserva os dados ao reiniciar ou publicar uma nova versão.
- [ ] Arquivos enviados, baixados e revisados funcionam via bucket privado.
- [ ] Logs, autorização e proteção da Preview estão conformes.

## Renomeação do GitHub

O nome sugerido é ZaraTakion/takion-campus. A renomeação só será feita após confirmação do proprietário em GitHub > Settings > General > Repository name > Rename. GitHub costuma redirecionar URLs antigas, mas é necessário conferir o remote local, integrações e o vínculo do projeto na Vercel.

## Limitações

O CI valida a sintaxe e as prioridades de roteamento previstas no arquivo, não confirma a interpretação feita pelos serviços Vercel nem a presença dos provedores externos. É obrigatório um deploy protegido de Preview para validar os fluxos completos antes de promover para Production.

Documentação consultada: https://vercel.com/kb/guide/vercel-services e https://vercel.com/docs/frameworks/full-stack/django.
