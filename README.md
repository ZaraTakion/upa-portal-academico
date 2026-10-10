# Takion Campus

**by Takion Software**

Sistema acadêmico independente de portfólio e demonstração, originado no UPA Portal Acadêmico. Não possui vínculo oficial com uma instituição educacional.

Portal Full-Stack para centralizar a vida acadêmica de estudantes, professores e administradores. A interface React consulta uma API Django REST Framework; dados, permissões e regras acadêmicas são verificados no servidor.

**Release candidata: 2.1.0-rc.1, com identidade Takion Campus.** O redesign usa superfícies creme/mint, tipografia editorial, monograma próprio e composições por perfil. Consulte o [Design System](docs/design/DESIGN_SYSTEM.md), a [galeria antes/depois e QA](docs/design/QA.md) e a [pesquisa preliminar do nome](docs/design/BRAND_RESEARCH.md). O [relatório da revisão Full-Stack anterior](docs/RELEASE.md) preserva o histórico de engenharia.

![Entrada do Takion Campus](docs/design/evidence/after/login-1440.jpg)

As mudanças são entregues para revisão, sem merge na `main` ou implantação pública. O PR de design parte da revisão funcional anterior; o bloqueio da integração Vercel foi estendido à branch de redesign.

## Funcionalidades e perfis

| Perfil | Fluxos implementados |
| --- | --- |
| Estudante | Login, restauração de sessão, painel, edição limitada de perfil, catálogo de disciplinas, notas e avaliações por turma, calendário, horários, notificações, materiais, entregas de arquivos, devolutivas, consulta financeira e atendimento com protocolo. |
| Professor | Turmas vinculadas, alunos matriculados, criação/edição de avaliações, notas e devolutivas, consolidação da nota final, frequência em lote, publicação de materiais e atividades, revisão de entregas. |
| Administrador | Contas e perfis, desativação de usuários, cursos, períodos, disciplinas, turmas, matrículas, horários, calendário, regra de notas, faturas, comunicados e respostas a atendimentos. Operações adicionais permanecem disponíveis no Django Admin. |

O financeiro registra cobranças e pagamentos informados pela administração; **não processa pagamentos**. Não há botões de pagamento fictício. Dados de demonstração são gravados pelo comando `seed_demo`, sujeitos às mesmas APIs e permissões do restante da aplicação.

## Arquitetura

```mermaid
flowchart LR
  UI[React 19 + Vite 8] -->|HTTPS / JWT em memória| API[Django REST Framework]
  API --> Accounts[Contas e sessão]
  API --> Academic[Cursos, turmas e registros]
  API --> Operations[Arquivos, atendimento e financeiro]
  Academic --> DB[(PostgreSQL / SQLite local)]
  Accounts --> DB
  Operations --> DB
  Operations --> Storage[Volume privado / S3 privado]
```

- `backend/`: apps `accounts`, `academic`, `dashboard`, `management_app`, `notifications_app`; migrações, permissões e testes.
- `frontend/`: páginas por perfil, componentes de interface, cliente HTTP único, rotas protegidas com carregamento sob demanda.
- `.github/workflows/backend-checks.yml`: testes em SQLite/PostgreSQL, lint, segurança, OpenAPI, build e navegador com frontend de produção e API real.
- `docs/`: [referência técnica](docs/documentacao.md), [operação](docs/OPERATIONS.md), [estudo de caso](docs/CASE_STUDY.md), [release e evidências](docs/RELEASE.md).

Python 3.13, Django 6.0.8, DRF 3.17.2, SimpleJWT, drf-spectacular, PostgreSQL 17, React 19 e Vite 8. Use Node.js 22. Dependências Python estão em `backend/requirements.txt`; dependências de qualidade, em `requirements-dev.txt`; npm usa o lockfile.

## Executar localmente

Pré-requisitos: Git, Python 3.13, Node.js 22 e npm. SQLite dispensa um serviço adicional.

```bash
git clone https://github.com/ZaraTakion/upa-portal-academico.git
cd upa-portal-academico
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements-dev.txt
cp backend/.env.example backend/.env
```

Edite `backend/.env` com uma `SECRET_KEY` aleatória e `DEBUG=True`. O projeto lê variáveis do processo, não carrega arquivos `.env` automaticamente. O exemplo contém apenas valores sem credenciais reais e pode ser carregado em Bash:

```bash
set -a
source backend/.env
set +a
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver localhost:8000
```

Em outro terminal:

```bash
cd upa-portal-academico/frontend
npm ci
cp .env.example .env.local
npm run dev -- --host localhost
```

Abra `http://localhost:5173`. Use o mesmo hostname no frontend e na API durante o desenvolvimento para que os cookies funcionem; não misture `localhost` e `127.0.0.1`.

Contas **exclusivamente fictícias** criadas em banco de demonstração:

| Perfil | Usuário | Senha de demonstração |
| --- | --- | --- |
| Estudante | `rodrigo` | `aluno123` |
| Professor | `leandro` | `prof123` |
| Administrador | `admin` | `admin123` |

`seed_demo` exige `DEBUG=True` ou `DEMO_MODE=True`, executa em transação e recusa sobrescrever contas existentes que não pertencem à demonstração. Nunca o execute em banco institucional. Para uma instalação real, use `python manage.py createsuperuser` e os cadastros administrativos.

Para PostgreSQL, configure `DATABASE_URL=postgresql://usuario:senha@host:5432/banco?sslmode=require`. Não grave credenciais no Git. Use `sslmode=disable` apenas em testes locais isolados.

## Qualidade

Com as variáveis locais carregadas e ambiente virtual ativo:

```bash
cd backend
ruff check .
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py spectacular --file /tmp/upa-openapi.yaml --validate --fail-on-warn
python manage.py test --noinput
pip-audit -r requirements.txt --progress-spinner off
cd ../frontend
npm test
npm run lint
npm audit --audit-level=low
npm run build
```

Execute os testes Django também com `DATABASE_URL` apontando para um PostgreSQL de testes. O usuário do banco precisa criar/remover o banco temporário de testes; nunca use credenciais do banco de produção.

### Navegador e integração

A suíte Playwright usa dados sintéticos e altera o banco: reserve uma instância exclusiva. Configure o backend com `EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend`, `EMAIL_FILE_PATH=/tmp/upa-verification-emails`, `FRONTEND_URL=http://127.0.0.1:5173`, CORS/CSRF para essa origem e `LOGIN_THROTTLE_RATE=1000/min`, `ANON_THROTTLE_RATE=1000/hour` apenas nessa instância de testes. Para HTTP local com `DEBUG=False`, desabilite redirecionamento TLS e cookies Secure, e use `CSRF_COOKIE_SAMESITE=Lax`. O CI documenta os valores completos.

```bash
cd frontend
npx playwright install --with-deps chromium
VITE_API_URL=http://127.0.0.1:8000/api npm run build
npm run preview -- --host 127.0.0.1 --port 5173 --strictPort
# Em outro terminal, com a API em 127.0.0.1:8000:
npm run test:e2e
```

Os testes cobrem os três perfis, persistência, bloqueios no servidor, uploads/downloads privados, recuperação de senha, falhas de rede, seis larguras de tela e verificações automatizadas WCAG com axe. Relatórios, capturas e traces ficam em diretórios ignorados pelo Git e são anexados ao CI.

## Segurança e documentação da API

- Access token fica em memória; refresh token fica em cookie HttpOnly, com rotação e blacklist. Login, refresh e logout exigem CSRF. Troca de senha e desativação invalidam sessões existentes.
- Um endpoint CSRF retorna o token mascarado para a origem autorizada, incluindo configurações com frontend e backend em hosts distintos.
- Listas e detalhes são filtrados pelo usuário e vínculo docente. Validadores impedem operações acadêmicas fora das turmas autorizadas. Professores não recebem CPF, endereço, contatos ou filiação dos estudantes.
- Arquivos são servidos por endpoint autenticado. Não há exposição de `/media/`, inclusive em `DEBUG`. Extensão, tipo, assinatura e limite de tamanho são validados. O download usa attachment e `no-store`.
- Referências acadêmicas são protegidas contra exclusão em cascata. Constraints validam notas, tentativas e intervalos; desativação preserva históricos.
- A API mantém respostas em array para clientes existentes. `?page=1&page_size=50` ativa paginação; tamanho máximo: 100.
- CORS usa origens explícitas. Proxy HTTPS só é confiado com `TRUST_PROXY_SSL_HEADER=True` e um proxy que remove cabeçalhos recebidos do cliente.

Após autenticação de administrador no Django Admin, abra `/api/docs/`, `/api/redoc/` ou `/api/schema/`. A documentação também aceita JWT administrativo; recursos visuais são servidos localmente pelo sidecar. A geração OpenAPI é validada sem avisos no CI.

## Implantação e limites

Consulte [OPERATIONS.md](docs/OPERATIONS.md) para variáveis, PostgreSQL, armazenamento privado, HTTPS, Gunicorn, backups, restauração, health checks e rollback. `/health/` mede a aplicação; `/health/ready/` verifica acesso ao banco.

A release não inclui implantação externa, contratação de serviços, gateway de pagamento, integração com ERP universitário ou envio SMTP verificado em uma instituição. Acessibilidade automatizada não substitui avaliação manual com leitores de tela. Não há alegação de pentest, teste de carga ou certificação LGPD/WCAG.
