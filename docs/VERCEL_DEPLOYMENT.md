# Deploy gratuito: Render + Neon + Vercel

O código está preparado para essa topologia. O estado remoto deve ser confirmado em [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md); build local e GitHub Actions não comprovam implantação. Não contrate planos, trials com cobrança posterior, add-ons ou faturamento por consumo.

## Reutilizar os recursos existentes

- Render: `takion-campus-api`, serviço `srv-db4rlfvlot8c73cp2ks0`, plano Free.
- Neon: projeto `winter-river-76082998`, branch `br-steep-mountain-b7rfe5zs`, PostgreSQL 17. Confirmar Free e cotas pela conta antes de configurar.
- Vercel: reutilizar o projeto existente com raiz `frontend`. Hobby exige elegibilidade de uso pessoal não comercial; a apresentação de uma empresa/serviço pode exigir outra modalidade. Não publicar nesse plano sem confirmar que o uso pretendido é permitido, e nunca autorizar upgrade pago.

## Backend no Render

A configuração declarativa é `render.yaml`:

- Root Directory: `backend`.
- Python: 3.13.5.
- Build: `pip install -r requirements.txt && bash build.sh`.
- Start: `python manage.py check_academic_integrity && python manage.py migrate --noinput && python manage.py bootstrap_preview && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`.
- Health: `/health/ready/`, que consulta o banco.

Se o serviço mantiver Root Directory vazio, prefixar ambos os comandos com `cd backend &&`; não aplicar as duas opções ao mesmo tempo. `build.sh` executa checks de produção e coleta estáticos, sem migrar o banco durante o build.

Configure `SECRET_KEY` privada; `DEBUG=False`; `DATABASE_URL` do Neon; `ALLOWED_HOSTS` explícitos; `CORS_ALLOWED_ORIGINS` e `CSRF_TRUSTED_ORIGINS` com a origem HTTPS exata do frontend; `FRONTEND_URL` com essa origem. Render injeta `RENDER_EXTERNAL_HOSTNAME`, validado antes de entrar nos hosts autorizados.

Mantenha cookies Secure/HttpOnly, `CSRF_COOKIE_SAMESITE=Lax` para o proxy de mesma origem e `TRUST_PROXY_SSL_HEADER=True` apenas atrás do proxy Render que sobrescreve o cabeçalho. Um frontend que acesse diretamente outro site requer `SameSite=None` e ainda fica sujeito a bloqueio de cookies de terceiros.

## Conectar o Neon com segurança

Reutilize o projeto existente; não crie outro. Transfira a conexão diretamente para o campo secreto `DATABASE_URL` do Render usando ferramentas autorizadas ou o painel seguro. Nunca coloque a URL em chat, logs, código, frontend ou variáveis `VITE_*`.

A aplicação usa TLS `require` por padrão. Suporta `sslmode=verify-full`, `sslrootcert`, `channel_binding` e `connect_timeout` na query da conexão. Use o endpoint e as recomendações atuais do Neon, conexões limitadas e um usuário adequado à aplicação. `sslmode=disable` é reservado a testes locais isolados.

Antes de alterar um banco existente: obter backup, verificar contagens, inspecionar `migrate --plan` e executar `check_academic_integrity`. O comando não altera registros; duplicatas históricas, notas inválidas e datas invertidas interrompem a inicialização antes das constraints da migração `0007`. Um banco vazio pode ser migrado inicialmente; schemas parcialmente aplicados exigem diagnóstico. Não apagar dados para fazer a migração passar.

Após migração, verificar readiness, integridade e persistência de registros sintéticos após reiniciar o serviço. Exercitar backup/restauração em outro banco, sem sobrescrever o Neon ativo.

## Frontend na Vercel

- Repositório: `ZaraTakion/takion-campus`.
- Root Directory: `frontend`.
- Framework: Vite; Node.js 22.
- Build: `npm run build`; saída: `dist`.
- `VITE_API_URL=/api`.
- `VITE_DJANGO_ADMIN_URL`: endereço HTTPS real do Admin Render, com `/admin/`.

`frontend/vercel.json` encaminha apenas `/api/:path*` para `https://takion-campus-api.onrender.com/api/:path*`, antes do fallback SPA, e exige ausência de cache nas respostas da API. Esse domínio é o destino previsto no pedido: confirmar a URL operacional antes de publicar e ajustar o destino se necessário. O frontend não controla um proxy aberto por parâmetro; tokens seguem somente para a API configurada.

O rewrite conserva a origem do navegador para refresh, CSRF e logout. Access tokens ficam em memória; refresh tokens ficam em cookies HttpOnly. Downloads retornam caminhos relativos de API, resolvidos na mesma origem configurada, sem enfraquecer a validação de URL autenticada. Admin continua no domínio Render; não se presume proxy para `/admin/`.

Branches dos PRs #20/#21 e da integração têm deploy Git automático bloqueado para evitar consumir franquia durante revisão. Configurar produção somente após validação dos checks obrigatórios.

## Homologação privada

No banco exclusivo de homologação, definir com opt-in explícito:

- `CAMPUS_ENVIRONMENT=preview` e `CAMPUS_PREVIEW_BOOTSTRAP=True`.
- `CAMPUS_PREVIEW_STUDENT_PASSWORD`, `CAMPUS_PREVIEW_TEACHER_PASSWORD`, `CAMPUS_PREVIEW_ADMIN_PASSWORD`: três senhas privadas fortes, mínimo 16 caracteres, fornecidas somente no ambiente do serviço.

O comando cria `campus-student`, `campus-teacher`, `campus-admin`, grupos e dados sintéticos de curso, turma, matrícula, avaliação, nota, presença, agenda, evento, atendimento, avisos e registro financeiro sem cobrança. Não publica senhas, não troca senhas existentes, não eleva contas incompatíveis e não redefine resultados editados. Depois de provisionar, é possível desativar o opt-in. Não habilite `DEMO_MODE` nem execute `seed_demo` em hospedagem pública.

## Limites operacionais

Render Free pode apresentar cold start; a interface permite até 90 segundos por requisição e mostra erros quando o serviço não responde. Isso não garante disponibilidade contínua. Verificar as cotas atuais e limitar deploys a releases validadas.

O disco Free é efêmero. `ACADEMIC_UPLOADS_ENABLED=False` mantém envios bloqueados na API e no Django Admin, com aviso na interface. `ALLOW_LOCAL_MEDIA_STORAGE=True` no Blueprint permite inicializar a homologação sem bucket; não comprova persistência de arquivos. Somente ativar envios após configurar storage privado persistente com plano realmente gratuito e sem cobrança automática, testar autorização e persistência após redeploy. Nenhum bucket foi criado nesta integração.

Uma alternativa investigada é Supabase Storage Free: a [documentação oficial de cotas](https://supabase.com/docs/guides/platform/billing-on-supabase) informa 1 GB de armazenamento e 5 GB de egress, e a [autenticação S3](https://supabase.com/docs/guides/storage/s3/authentication) é compatível com o backend existente. Chaves S3 de servidor têm acesso a todos os buckets do projeto e ignoram RLS: requerem projeto dedicado, bucket privado e permissões aplicadas pela API Django. Confirmar plano Free sem cartão, ausência de overage automático, disponibilidade de projeto e comportamento de suspensão antes de provisionar. As fontes oficiais foram consultadas pelo repositório público de documentação; não se presume que a conta esteja elegível nem que o serviço esteja configurado.

Recuperação de senha exige SMTP gratuito verificado. Os testes locais capturam mensagens em arquivos privados; isso não comprova entrega de e-mail externo. Monitoramento, backup, rollback, retenção e limites de rate limiting estão em [OPERATIONS.md](OPERATIONS.md).

## Verificação após deploy

Confirmar os planos pelas APIs/painéis; inspecionar logs sanitizados; verificar `/health/` e `/health/ready/`; acessar a SPA e recarregar rotas internas; executar login, refresh, logout e autorizações com cada perfil privado; criar/editar registros sintéticos pela interface e confirmar no PostgreSQL; reiniciar e validar persistência. Não disponibilizar dados reais nem considerar a release concluída sem essas evidências.
