# Takion Campus — Campus Folio (evolução do UPA Portal Acadêmico)

Portal web acadêmico para estudantes, professores e equipes administrativas, desenvolvido pela Takion Software. O projeto combina uma API em Django REST Framework com uma interface React.

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

## Demonstração autônoma (Windows, Linux ou macOS)

Para subir uma instância **somente local** com estudantes, professor e administrador,
instale Python 3.13+ e Node.js 22+ e execute da raiz do repositório:

```bash
python scripts/dev_demo.py
```

Este comando cria um ambiente Python isolado, instala dependências, provisiona um
banco **SQLite dedicado** em `backend/.demo.sqlite3`, executa migrações e
`seed_demo`, instala o frontend e inicia Django e Vite em `127.0.0.1`
(portas 8000 e 5173). A chave local é gerada uma vez e armazenada em arquivo
ignorado pelo Git. Pressione Ctrl+C para parar os dois serviços. Para instalar
sem iniciar, use `--setup-only`; para reiniciar sem reinstalar dependências,
use `--no-install`. Credenciais de demonstração aparecem no terminal; nunca
publique essa instância na Internet.

O script recusa rodar com `DATABASE_URL` configurada, recusa `DEBUG=False`
e nunca altera um banco PostgreSQL. Essas contas **não** são provisionadas em
produção. Veja [a matriz de testes](docs/TEST_PLAN_CAMPUS_FOLIO.md).

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

O GitHub Actions executa as verificações nos pull requests e em atualizações da branch principal. O frontend também possui regressões de validação de URL autenticada e cache de usuário (`cd frontend && npm test`); a API verifica rejeição de JSON malformado na confirmação de senha. Consulte o [estudo de caso técnico](docs/CASE_STUDY.md).

## Configuração de produção

Configure variáveis de ambiente; não publique segredos no repositório.

- `SECRET_KEY`: chave aleatória exclusiva.
- `DEBUG=False`.
- `ALLOWED_HOSTS`: nomes de host exatos da API.
- `DATABASE_URL`: URL PostgreSQL com TLS. Sem ela, o processo recusa usar SQLite em produção.
- `CORS_ALLOWED_ORIGINS` e `CSRF_TRUSTED_ORIGINS`: origens exatas usadas pelo frontend.
- `FRONTEND_URL`: endereço do frontend, usado em links de redefinição.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` e `DEFAULT_FROM_EMAIL`.
- Armazenamento de uploads: escolha uma das opções:
  - S3 privado ou compatível: defina `USE_S3_STORAGE=True`, `AWS_STORAGE_BUCKET_NAME`, região/endpoint e credenciais ou identidade IAM. Os downloads continuam passando pela rota autenticada da API. Bloqueie acesso público ao bucket.
  - Volume persistente: defina `ALLOW_LOCAL_MEDIA_STORAGE=True` e aponte `MEDIA_ROOT` para um volume persistente montado no serviço. Não use o disco efêmero do container.
  - Antes de ativar um storage novo com arquivos existentes, faça backup e copie `MEDIA_ROOT/academic_files/` preservando os caminhos; valide download e permissões antes de remover a cópia antiga.
- `ALLOW_SQLITE_DATABASE=True` e `ALLOW_LOCAL_MEDIA_STORAGE=True` são apenas opções explícitas de desenvolvimento/teste; não as use em produção efêmera.
- `SECURE_SSL_REDIRECT`, cookies seguros e HSTS são ativados por padrão quando `DEBUG=False`; ajuste apenas se o proxy exigir configuração específica.
- `TRUST_PROXY_SSL_HEADER=False` por padrão: habilite somente se o proxy reverso confiável descartar o valor enviado pelo cliente e definir `X-Forwarded-Proto` corretamente. Não confie nesse cabeçalho em conexões diretas.

### Operação antes da publicação

- Cadastre as variáveis de ambiente no serviço de API e verifique `/health/`, conexão PostgreSQL, envio de e-mail de redefinição e upload/download autenticado.
- Configure backups automáticos do banco e do bucket/volume; execute ao menos uma restauração de teste antes de receber dados reais.
- Encaminhe logs do processo para a plataforma e configure alerta de indisponibilidade e falha de backup.
- O deploy do frontend depende de builds disponíveis no Vercel. Se o check `build-rate-limit` ocorrer, libere cota/capacidade na conta e reexecute o deploy; os checks do GitHub Actions são independentes.
- A tela financeira registra faturas e status. Não existe cobrança real por gateway; uma integração exige escolher o provedor e cadastrar credenciais e webhooks. A interface informa que não processa pagamentos e não oferece ações de Pix/boleto simuladas.

O script `backend/build.sh` instala dependências, executa `check --deploy`, coleta arquivos estáticos e aplica migrações. Configure o comando de start do serviço para iniciar Gunicorn no módulo `core.wsgi`.

## Dados de demonstração

`python manage.py seed_demo` cria registros demonstrativos idempotentes para desenvolvimento. Não execute esse comando como parte do deploy de produção.
