# Operação e implantação — UPA

Este guia prepara a implantação; nenhum serviço foi criado ou publicado durante a revisão. Use banco e arquivos de teste ao validar procedimentos. Publicação, recursos pagos e merge dependem de aprovação específica.

## Configuração

Django lê variáveis do processo. O arquivo `.env.example` documenta nomes e exemplos, mas não é carregado automaticamente. Segredos devem ser injetados pelo ambiente de destino.

| Variável | Uso |
| --- | --- |
| `SECRET_KEY` | Segredo aleatório exclusivo do ambiente, obrigatório. |
| `DEBUG` | `False` em produção. |
| `DATABASE_URL` | PostgreSQL; SSL `require` por padrão. Usuário da aplicação com privilégios mínimos. |
| `ALLOWED_HOSTS` | Hosts explícitos do backend, separados por vírgula. |
| `FRONTEND_URL` | URL HTTPS usada nos links de recuperação. |
| `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` | Origens HTTPS autorizadas. Não use `*`. |
| `JWT_REFRESH_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SESSION_COOKIE_SECURE` | `True` em HTTPS. |
| `CSRF_COOKIE_SAMESITE` | `Lax` para mesma origem/site. `None` exige Secure e só deve ser usado quando o frontend realmente é cross-site. |
| `TRUST_PROXY_SSL_HEADER` | `True` somente se o proxy sobrescreve `X-Forwarded-Proto`. |
| `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS` | TLS e HSTS; habilitar após validar domínio/HTTPS. |
| `USE_S3_STORAGE` | `True` para armazenamento S3 privado. |
| `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, `AWS_S3_ENDPOINT_URL` | Bucket, região e endpoint compatível com S3. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Credenciais restritas ao bucket, somente no ambiente. |
| `ALLOW_LOCAL_MEDIA_STORAGE`, `MEDIA_ROOT` | Alternativa: habilitar e usar volume persistente privado. Nunca um diretório público do servidor web. |
| `ALLOW_SQLITE_DATABASE` | Exceção explícita para execução local; produção deve usar PostgreSQL. |
| `ACADEMIC_FILE_MAX_SIZE` | 25 MB por padrão. Configure também limites no proxy. |
| `LOGIN_THROTTLE_RATE`, `ANON_THROTTLE_RATE` | Limites de autenticação/recuperação. Defaults: `5/min` e `5/hour`. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `DEFAULT_FROM_EMAIL` | SMTP de recuperação; confirmar entrega no ambiente real. |
| `PASSWORD_RESET_TIMEOUT` | Validade do link; 3600 segundos por padrão. |
| `DEMO_MODE` | `False` em produção; somente para banco isolado de demonstração/CI. |
| `VITE_API_URL` | Variável incorporada ao build React. Preferir `/api` atrás do mesmo domínio HTTPS. |

Um cache compartilhado para limitação de tentativas em múltiplos workers requer configuração operacional adicional. O cache local padrão e o throttle DRF não constituem proteção distribuída contra força bruta/DDoS. Aplique também limites no proxy/gateway; não desative os limites de aplicação em produção.

## Preparar banco e migrações

1. Criar banco PostgreSQL e usuário próprios para o portal.
2. Separar credenciais de runtime das usadas para migração/backup.
3. Registrar o commit da release, salvar backup e pausar gravações antes de migrações sensíveis.
4. Antes da migração acadêmica `0007`, executar a verificação somente de leitura:

```bash
cd backend
python manage.py check_academic_integrity
python manage.py showmigrations
python manage.py migrate --plan
```

Se existirem notas históricas duplicadas, escalas inválidas ou datas invertidas, o comando informa contagens e não altera dados. A migração adiciona constraints e pode falhar nesses casos. Resolver inconsistências com revisão de dados autorizada; não apagar nem consolidar registros automaticamente.

```bash
python manage.py migrate --noinput
python manage.py makemigrations --check --dry-run
python manage.py check --deploy --fail-level WARNING
python manage.py collectstatic --noinput
```

Em base nova, execute `migrate` antes de `check_academic_integrity`, pois as tabelas ainda não existem. Migrações preservam campos e registros; nenhuma migração desta release apaga dados. Verifique a operação primeiro em cópia restaurada do banco.

## Backend e frontend

```bash
# Backend, dentro da pasta backend, com as variáveis de produção carregadas:
python -m pip install -r requirements.txt
gunicorn core.wsgi:application --bind 127.0.0.1:8000 --workers 2 --timeout 60
# Frontend:
cd ../frontend
npm ci
VITE_API_URL=/api npm run build
```

Sirva `frontend/dist/` com fallback de rotas para `index.html`. Encaminhe `/api/`, `/admin/` e `/health/` ao Gunicorn. WhiteNoise atende `/static/` após `collectstatic`. Configure certificado TLS, renovação, headers de segurança, limite de uploads compatível e timeouts de download. Não use `runserver` ou `vite preview` como servidores de produção.

O proxy deve definir `Host`, IP conforme a política de confiança e `X-Forwarded-Proto`; remova valores enviados pelo cliente antes de habilitar confiança no proxy. Não publique `/media/`. Downloads passam pela API; buckets S3 devem bloquear acesso público. Nunca coloque dados de estudantes em assets do React.

Para a página React, uma política CSP inicial pode usar `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'`. Adapte `connect-src` à API autorizada se ela usa outra origem e teste em modo de relatório antes de aplicar. Admin/documentação Django têm necessidades próprias de CSP. A política proposta não foi aplicada a um domínio externo nesta revisão.

## Arquivos, privacidade e observabilidade

- Manter volume privado ou bucket privado persistente; o filesystem efêmero da aplicação não basta.
- Sincronizar backup de banco e arquivos. Um backup só do banco não restaura anexos.
- Validar uploads por formato e limite. Office exige estrutura de documento, bloqueia macros, criptografia e caminhos perigosos; TXT é verificado além do primeiro bloco. Isso não substitui análise de malware.
- Definir retenção, acesso administrativo, trilha de auditoria operacional e atendimento aos direitos LGPD conforme a instituição. Não registrar tokens, senhas, CPF ou conteúdo de documentos nos logs.
- API e health checks enviam `Cache-Control: private, no-store`. Configurar o proxy para não fazer cache de respostas privadas.
- Monitorar 5xx, latência, falhas SMTP, espaço de armazenamento e uso de conexões. Não há teste de carga desta release.
- Remover tokens expirados da tabela de blacklist com `python manage.py flushexpiredtokens` em rotina agendada, conforme janela de retenção.

## Health checks

- `GET /health/`: processo responde com `{"status":"ok"}`.
- `GET /health/ready/`: realiza consulta ao banco, retorna 200 quando pronto ou 503 com mensagem genérica.
- Armazenamento e SMTP exigem verificações próprias; readiness não afirma que esses serviços externos funcionam.

## Backup e restauração

Os comandos abaixo usam variáveis específicas fornecidas pelo operador. Não inclua senhas em histórico de shell; use o mecanismo seguro do provedor ou `.pgpass` protegido. `BACKUP_DATABASE_URL` deve selecionar o banco correto.

```bash
pg_dump --dbname="$BACKUP_DATABASE_URL" --format=custom --no-owner --file=upa-backup.dump
# Para volume local, salvar junto ao backup do banco:
tar -czf upa-media.tar.gz -C "$UPA_MEDIA_ROOT" .
# Criar um banco vazio separado para ensaio de restauração:
pg_restore --dbname="$RESTORE_DATABASE_URL" --no-owner --exit-on-error upa-backup.dump
mkdir -p "$UPA_RESTORE_MEDIA_ROOT"
tar -xzf upa-media.tar.gz -C "$UPA_RESTORE_MEDIA_ROOT"
```

Para S3, usar versionamento/lifecycle e processo de cópia/restauração do provedor, com objetos privados. Depois de restaurar: comparar contagens, verificar migrações, integridade acadêmica, autenticação e download de um arquivo sintético. A evidência desta revisão usa PostgreSQL local e dados fictícios, não backups institucionais.

## Rollback

1. Identificar commit, versão de schema e backups anteriores; pausar gravações.
2. Preferir voltar a imagem/build anterior quando compatível com o schema.
3. Inspecionar `migrate --plan` para reversões e testar em cópia do banco. Não executar reversão destrutiva automaticamente.
4. Quando a reversão de schema não for segura, restaurar em banco/volume separados e validar antes de alterar o tráfego.
5. Confirmar readiness, login dos três perfis, leitura de notas e download; reabrir gravações.

Nenhum rollback ou restore deve sobrescrever o banco ativo sem autorização operacional. Os comandos de ensaio desta revisão criam apenas bancos e arquivos descartáveis com dados sintéticos.
