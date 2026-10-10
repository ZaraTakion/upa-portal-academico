# Evidências do portal HTTPS público

Estas capturas pertencem a **https://takion-campus.vercel.app**, não ao ambiente local. Os fluxos de interface foram executados em 10/10/2026, às 14:14:53 em Fortaleza; as capturas finais aguardaram dados carregados e o término das transições, às 14:16:54. Foram usados somente perfis e registros sintéticos. Não há credenciais nos relatórios.

- [Relatório das operações](evidence/public/report.json): perfil persistente do Aluno, avaliação/nota 8,75 do Professor consultada pelo Aluno, curso do Administrador, sessão e logout dos três perfis; exit code 0.
- [Relatório da API pelo proxy Vercel](evidence/public/api-report.json): status HTTP de sessão, permissões e CSRF.
- [Relatório das capturas](evidence/public/capture-report.json): páginas carregadas, axe e layout sem overflow, exit code 0.
- [Manifesto do build publicado](evidence/public/build-manifest.json): hashes SHA-256 dos 53 arquivos estáticos e configuração Build Output API v3.

| Tela | Desktop 1440 px | Mobile 390 px |
| --- | --- | --- |
| Login | [Captura](evidence/public/login-1440.png) | [Captura](evidence/public/login-390.png) |
| Aluno | [Captura](evidence/public/student-1440.png) | [Captura](evidence/public/student-390.png) |
| Professor | [Captura](evidence/public/professor-1440.png) | [Captura](evidence/public/professor-390.png) |
| Administrador | [Captura](evidence/public/admin-1440.png) | [Captura](evidence/public/admin-390.png) |

Axe examinou login e páginas iniciais dos três perfis sem violações nas regras selecionadas; não substitui avaliação com leitores de tela ou certificação WCAG. Os testes públicos não substituem o CI: o E2E do commit `7312a0f` falhou e seu diagnóstico está bloqueado pelo acesso aos logs. Consulte [validação remota](../REMOTE_VALIDATION.md).
