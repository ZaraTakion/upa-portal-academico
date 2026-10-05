# UPA — Portal Acadêmico

Portal web para estudantes, professores e equipes administrativas. O projeto combina uma API em Django REST Framework com uma interface React.

## Funcionalidades

- Acesso por perfil, recuperação de senha e limitação de tentativas de login.
- Painel com indicadores acadêmicos, calendário, notificações e horários.
- Cursos, períodos letivos, turmas, matrículas, notas, avaliações e frequência.
- Publicação de materiais e atividades, entrega de arquivos e devolutivas.
- Chamados de atendimento com protocolo e acompanhamento de respostas.
- Consulta de documentos financeiros e administração de registros.
- Interface responsiva com navegação acessível e tema claro/escuro.

## Estrutura

- `backend/`: projeto Django, API, migrações e testes.
- `frontend/`: aplicação React e Vite.
- `.github/workflows/`: verificações automáticas do backend e frontend.

## Requisitos

- Python 3.13.
- Node.js 22 e npm.
- PostgreSQL em produção. SQLite é usado por padrão no desenvolvimento local.

## Desenvolvimento local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Edite `.env` e substitua `SECRET_KEY`. Para carregar as variáveis no terminal:

```bash
set -a
source .env
set +a
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

A API fica em `http://127.0.0.1:8000/api/`; a verificação de saúde fica em `/health/`. A documentação OpenAPI em `/api/docs/` exige uma conta administrativa.

### Frontend

Em outro terminal:

```bash
cd frontend
npm ci
npm run dev
```

Por padrão, a interface usa `http://127.0.0.1:8000/api`. Para mudar, defina `VITE_API_URL` antes de iniciar o Vite.

## Testes e verificações

```bash
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

```bash
cd frontend
npm ci
npm run lint
npm run build
```

O GitHub Actions executa as verificações nos pull requests e em atualizações da branch principal.

## Configuração de produção

Configure variáveis de ambiente; não publique segredos no repositório.

- `SECRET_KEY`: chave aleatória exclusiva.
- `DEBUG=False`.
- `ALLOWED_HOSTS`: nomes de host exatos da API.
- `DATABASE_URL`: URL PostgreSQL com TLS.
- `CORS_ALLOWED_ORIGINS` e `CSRF_TRUSTED_ORIGINS`: origens exatas usadas pelo frontend.
- `FRONTEND_URL`: endereço do frontend, usado em links de redefinição.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` e `DEFAULT_FROM_EMAIL`.
- `MEDIA_ROOT`: diretório persistente para arquivos enviados. Configure armazenamento durável no provedor de hospedagem.
- `SECURE_SSL_REDIRECT`, cookies seguros e HSTS são ativados por padrão quando `DEBUG=False`; ajuste apenas se o proxy exigir configuração específica.

O script `backend/build.sh` instala dependências, executa `check --deploy`, coleta arquivos estáticos e aplica migrações. Configure o comando de start do serviço para iniciar Gunicorn no módulo `core.wsgi`.

## Dados de demonstração

`python manage.py seed_demo` cria registros demonstrativos idempotentes para desenvolvimento. Não execute esse comando como parte do deploy de produção.
