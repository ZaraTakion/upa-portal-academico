# Estudo de caso — UPA Portal Acadêmico

## Problema
Centralizar funcionalidades acadêmicas de alunos, professores e administradores em uma aplicação web com fronteiras de autorização e integração efetiva entre interface e API.

## Arquitetura
```text
React + Vite (frontend/src)
       |
  axios / JWT access
       |
Django REST Framework (backend)
       |
  apps: accounts, academic, dashboard, management_app, notifications_app
       |
SQLite (desenvolvimento) / PostgreSQL (configurável para produção)
```

O [roteamento React](../frontend/src/routes/AppRoutes.jsx) organiza páginas por perfil. O [cliente HTTP](../frontend/src/api/axios.js) envia access token e tenta renová-lo mediante cookie de refresh. O Back-End usa Django REST Framework, migrations, modelos acadêmicos e verificação de permissões em cada fluxo. Os principais módulos estão em `backend/academic`, `backend/accounts`, `backend/management_app` e `backend/notifications_app`.

## Fluxos representativos
- **Aluno:** autenticação, visualização de informações acadêmicas, notas, calendário, materiais e entregas.
- **Professor:** turmas, avaliações, frequência, envio de materiais e devolutivas.
- **Administração:** consultas e gestão de registros existentes, sem alegar gateway financeiro ou cobrança real.
- **Documentos:** uploads sujeitos a verificação no servidor, downloads através de rota autenticada e armazenamento local/S3 configurável.

## Qualidade e segurança
- [Testes Back-End](../backend/academic/tests.py), [autenticação](../backend/accounts/tests.py), [administração e arquivos](../backend/management_app/tests.py).
- [Testes Front-End](../frontend/tests) e [testes de navegador](../frontend/e2e/portal.spec.js).
- [CI](../.github/workflows/backend-checks.yml) valida Django, migrações, lint, testes React, build, auditoria npm e smoke do navegador.
- Configuração de proxy HTTPS segura por padrão: `TRUST_PROXY_SSL_HEADER` somente deve ser habilitada quando um proxy confiável remove valores recebidos do cliente.
- O cliente Axios autenticado valida o destino de **todas as solicitações** antes de anexar Bearer/CSRF: somente a origem e o prefixo da API configurada são autorizados (veja [`apiRequestUrl.js`](../frontend/src/utils/apiRequestUrl.js)). A checagem específica dos links de download continua como uma segunda camada.
- O cache local de perfil agora descarta JSON inválido sem bloquear a navegação; o servidor permanece a autoridade para identidade e papel.
- O endpoint público de confirmação de redefinição de senha rejeita `new_password` que não seja string com HTTP 400, evitando exceções de validadores frente a JSON malformado.
- Regressões específicas: [`api-request-url.test.js`](../frontend/tests/api-request-url.test.js), [`cached-user.test.js`](../frontend/tests/cached-user.test.js) e [`test_reset_validation.py`](../backend/accounts/test_reset_validation.py).

## Limites da evidência
Os arquivos e testes demonstram caminhos implementados; não certificam conformidade integral WCAG 2.2 AA, proteção completa contra XSS (o access token ainda reside no localStorage), produção pública, back-up restaurado ou fluxos E2E de cada perfil sem execuções específicas. A seção financeira mantém registros, **não processa pagamentos**.

## Reprodução
Consulte o [README principal](../README.md) para ambiente, migrations, dados sintéticos e comandos de teste. Mudanças de segurança são propostas em branch separada, sem merge automático.
