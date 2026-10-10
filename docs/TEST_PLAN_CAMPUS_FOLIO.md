# Plano de testes — Takion Campus / Campus Folio

Status: **implementação submetida à validação**. Este documento define procedimentos e critérios de aceite; não significa que todas as verificações já passaram.

## Escopo e referência

Referência visual: *Takion_Campus_Campus_Folio_Design_System.pdf* (11 páginas, material fornecido pelo responsável). O PDF contém **dados ilustrativos**, não saídas reais da API. Visual validado contra paleta da página 3, tipografia da página 4, componentes da página 5, dashboard da página 6, mobile da página 7, papéis da página 8, acessibilidade da página 9 e Definition of Done da página 11.

## Causas conhecidas de falhas de acesso

1. **Banco sem seed**: não existem contas de exemplo até executar migrações e seed local. Em produção, não se deve criar contas com senhas públicas.
2. **Variáveis de ambiente**: Django exige SECRET_KEY e outras variáveis. O arquivo .env não é lido automaticamente pelo projeto; carregue suas variáveis no terminal ou hospedeiro.
3. **API indisponível ou VITE_API_URL incorreta**: o navegador não consegue enviar credenciais para o endpoint /api/token/.
4. **Limite de tentativas**: o login retorna HTTP 429 depois de tentativas repetidas.
5. **Cookies/CSRF**: refresh/logout exigem CSRF. O frontend obtém o token via GET /api/token/csrf/, em vez de pressupor que a origem React pode ler o cookie de outra origem. Terceiros bloqueando cookies ou configuração incorreta de CORS/CSRF podem impedir renovação.

**Não existe evidência de que algum destes tenha ocorrido no ambiente de hospedagem do solicitante.** Verifique logs e requisições de rede antes de atribuir causa definitiva.

## Passo a passo — Windows PowerShell / desenvolvimento local

Terminal A:

\`\`\`powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:SECRET_KEY = "troque-por-uma-chave-local-aleatoria-longa"
$env:DEBUG = "True"
$env:ALLOW_SQLITE_DATABASE = "True"
$env:ALLOW_LOCAL_MEDIA_STORAGE = "True"
python manage.py migrate
python manage.py seed_demo
python manage.py check
python manage.py shell -c "from django.contrib.auth import authenticate; assert authenticate(username='rodrigo',password='aluno123'); print('Conta de estudante OK')"
python manage.py runserver 127.0.0.1:8000
\`\`\`

Terminal B:

\`\`\`powershell
cd frontend
npm ci
$env:VITE_API_URL = "http://127.0.0.1:8000/api"
npm run dev -- --host 127.0.0.1
\`\`\`

Abra \`http://127.0.0.1:5173/\`. **Credenciais apenas para banco local sem dados reais:** rodrigo / aluno123, leandro / prof123 e admin / admin123. O comando \`seed_demo\` recusa rodar com \`DEBUG=False\`, incluindo produção. Não exponha essas senhas ao público.

### Inspeção sem expor segredos

Na aba **Rede / Network** do navegador:
- \`POST /api/token/\`: 200 = autenticação aceita; 401 = credenciais recusadas; 429 = limite; falha de rede/CORS = configuração/conectividade.
- \`GET /api/accounts/me/\`: deve retornar 200 após login e incluir grupos de acesso.
- \`GET /api/token/csrf/\`: 200, retorna token no corpo e cookie CSRF; não expor token em prints externos.
- \`POST /api/token/refresh/\`: 200 com cabeçalho X-CSRFToken e cookie refresh presentes; 403 exige inspeção de CSRF/origens/cookies.
- Verificar \`/health/\` no backend; esta rota **não comprova** conexão com PostgreSQL ou login funcional.

## Matriz de aceitação

| ID | Cenário | Esperado |
| --- | --- | --- |
| AUTH-01 | Banco novo + migrate + seed em DEBUG | 3 perfis com credenciais locais |
| AUTH-02 | seed com DEBUG=False | bloqueado com CommandError |
| AUTH-03 | Senha incorreta | mensagem genérica, sem revelar existência do usuário |
| AUTH-04 | API indisponível | erro de conexão distinto de senha inválida |
| AUTH-05 | 429 | orienta aguardar; não tenta login automático repetido |
| AUTH-06 | Login estudante | /dashboard com dados da API |
| AUTH-07 | Login professor | /teacher/classes; sem rotas de estudante |
| AUTH-08 | Login administrador | /admin-panel; sem rotas de estudante |
| AUTH-09 | Access expirado + refresh válido | obtém CSRF, renova e reenvia uma vez |
| AUTH-10 | Logout | revoga refresh quando API acessível e limpa estado local |
| AUTH-11 | CSRF ausente | requisição de refresh protegida recebe 403 |
| UI-01 | Login | marca e tipografia Campus Folio, erros acessíveis |
| UI-02 | Dashboard | não apresenta números fictícios; dados reais da API |
| UI-03 | Próxima aula | computada no fuso America/Sao_Paulo, não apenas a primeira |
| UI-04 | Disciplinas | tabela desktop, cartões mobile, filtros funcionais |
| UI-05 | Estudante, professor, admin | navegação por perfil sem atalhos proibidos |
| UI-06 | 320, 375, 430, 768, 1024, 1440, 1920, 3840 px | sem perda de ação nem scroll horizontal na página |
| UI-07 | Teclado, foco, zoom 200%, reduce motion | ações navegáveis e feedback compreensível |
| UI-08 | Tema claro/escuro | conteúdo e contraste legíveis em todas as telas |
| REG-01 | Django check + migrations + tests | sem falhas |
| REG-02 | npm test, lint, build | sem falhas |
| REG-03 | Playwright + axe WCAG2.2 AA | smoke test / login / dashboard / permissões |

## Comandos de CI

\`\`\`bash
cd backend && python manage.py check && python manage.py makemigrations --check --dry-run && python manage.py test
cd frontend && npm ci && npm test && npm run lint && npm run build
\`\`\`

CI executa também browser smoke tests no GitHub Actions; resultados devem ser consultados no PR. Não considerar aceite concluído se algum job falhar.

## Limitações e publicação

- A versão atual não representa automaticamente todas as telas do PDF; a migração de professor/admin/rotas restantes e revisão visual completa precisam de validação adicional de screenshot e aceitação.
- Credenciais da demo não são credenciais do deploy. Em produção, contas devem ser provisionadas de forma protegida pelo administrador.
- Caso frontend/backend estejam em domínios diferentes, usar preferencialmente subdomínios *same-site*, TLS, CORS_ALLOWED_ORIGINS e CSRF_TRUSTED_ORIGINS exatos, verificar políticas modernas de cookies e HTTPS real.
- A release só pode ser considerada aprovada quando a matriz estiver assinada e os checks confirmados. Merge não é automático.
