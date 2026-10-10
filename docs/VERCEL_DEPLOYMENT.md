# Deploy gratuito: Vercel (React) + Render (Django)

**Este guia substitui o antigo Vercel Services.** A configuração já está no GitHub;
o deploy e a conexão com o banco ainda não foram realizados por esta alteração.

## Vercel — frontend (Hobby Free)

Importe `ZaraTakion/takion-campus` como **projeto único** e configure:

- **Root Directory:** `frontend`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build` (padrão)
- **Output Directory:** `dist` (padrão)
- **Variáveis de ambiente:** `VITE_API_URL=https://SEU-BACKEND.onrender.com/api`
  e `VITE_DJANGO_ADMIN_URL=https://SEU-BACKEND.onrender.com/admin/`.

Substitua `SEU-BACKEND` pelo URL real do serviço Render, não inclua localhost.
O build bloqueia VITE_API_URL ausente/inválida quando executado na Vercel.
`frontend/vercel.json` suporta acesso direto às rotas SPA.

## Render — backend (Free Web Service)

Conecte o mesmo repositório e escolha **Web Service**, plano **Free**, root
directory **backend**, runtime Python. A configuração `render.yaml` da raiz
serve de referência ou pode ser usada no fluxo de Blueprint.

- Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- Start: `python manage.py migrate --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
- Health: `/health/`
- Variáveis: `DEBUG=False`, `SECRET_KEY` aleatória privada,
  `DATABASE_URL` PostgreSQL, `CORS_ALLOWED_ORIGINS=https://SEU-SITE.vercel.app`,
  `CSRF_TRUSTED_ORIGINS=https://SEU-SITE.vercel.app`,
  `FRONTEND_URL=https://SEU-SITE.vercel.app`,
  `CSRF_COOKIE_SAMESITE=None`, `TRUST_PROXY_SSL_HEADER=True`.
- Render fornece `RENDER_EXTERNAL_HOSTNAME`; Django confia apenas nesse hostname
  validado e nos domínios adicionais de ALLOWED_HOSTS.

## Banco (sem cobrança)

**Não use Render Postgres Free como banco de longa duração:** expira em 30 dias.
Prefira **Neon Free** (ou outro PostgreSQL persistente com franquia grátis).
Configure `DATABASE_URL` somente no Render. Não coloque credenciais no chat,
GitHub, frontend ou variáveis `VITE_*`.

## Atenção aos limites de gratuidade

Render Web Service Free entra em repouso após 15 minutos sem tráfego, portanto
o primeiro login pode demorar. O Render Free não tem disco persistente; o
`render.yaml` permite armazenamento temporário de demonstração
(`ALLOW_LOCAL_MEDIA_STORAGE=True`) apenas para testar autenticação:
**arquivos enviados serão perdidos em reinícios/redeploys**. Para materiais
acadêmicos reais, use bucket privado persistente e `USE_S3_STORAGE=True`.
A Vercel Hobby é para uso pessoal não comercial e possui limites de uso.
Não autorize upgrade pago, add-ons ou cobranças.

## Três logins automáticos para a homologação remota

O Render Free não oferece shell interativo. Para preparar as contas uma vez,
o start command do Blueprint executa `python manage.py bootstrap_preview`
**depois** das migrações e antes de iniciar o Gunicorn. O comando é
**desativado por padrão** e não altera contas existentes nem imprime senhas.

Ative somente em banco de testes isolado, adicionando no Render:
- `CAMPUS_PREVIEW_BOOTSTRAP=True`
- `CAMPUS_PREVIEW_STUDENT_PASSWORD`: senha forte exclusiva (mínimo 16 caracteres).
- `CAMPUS_PREVIEW_TEACHER_PASSWORD`: outra senha forte exclusiva.
- `CAMPUS_PREVIEW_ADMIN_PASSWORD`: terceira senha forte exclusiva.

Esses segredos nunca devem entrar no GitHub, no Vite ou no chat.
Os usuários criados são `campus-student`, `campus-teacher` e `campus-admin`.
Também são criados grupos, um curso, turma, docente e matrícula demonstrativos.
Pode-se reiniciar o servidor sem repetir contas nem redefinir senhas.
O comando exige `DEBUG=False` e só age quando o opt-in está ativo.
Após a criação, é possível desativar o opt-in para não revalidar as variáveis
em novos deploys. Nunca use este mecanismo para produzir contas públicas reais.

## Usuários de demonstração

A base remota começa sem contas. O comando `seed_demo` é **local apenas**
e está bloqueado para `DEBUG=False`; não use as senhas públicas em sites
hospedados. Crie usuários e grupos específicos para homologação com senhas
privadas em um fluxo administrativo autenticado. Até provisioná-los, o login
na Vercel não funcionará, mesmo com frontend e backend publicados.

## Verificações pós-deploy

- Render `https://SEU-BACKEND.onrender.com/health/` → 200.
- Vercel abre tela de login e não apresenta erro de build.
- Login envia POST para `https://SEU-BACKEND.onrender.com/api/token/`.
- Verifique CORS exato, CSRF, políticas do navegador para cookies de
  terceiros, refresh token, logout e permissões dos três perfis.
- Acesso direto às rotas do React funciona após recarregar.
- Sem vazamento de credenciais e sem imagens ou dados privados em armazenamento efêmero.

**Resultado de GitHub Actions não comprova deploy real.** Após os URLs existirem,
verifique os logs dos dois provedores e autenticação com contas de homologação.
