# Evidências atuais da integração

Capturas de 10/10/2026 na branch `integration/takion-campus-final-20261010`, após o commit `235622b`. Usam build de produção React, API Django e PostgreSQL 17 locais, com dados sintéticos. Não são capturas de uma publicação no Render/Vercel. As contagens refletem os registros criados pelos testes funcionais.

| Área | Desktop claro, 1440 px | Desktop escuro, 1440 px | Celular claro, 390 px | Celular escuro, 390 px |
| --- | --- | --- | --- | --- |
| Login | [Captura](evidence/integration/public-1440-light.png) | [Captura](evidence/integration/public-1440-dark.png) | [Captura](evidence/integration/public-390-light.png) | [Captura](evidence/integration/public-390-dark.png) |
| Aluno | [Captura](evidence/integration/student-1440-light.png) | [Captura](evidence/integration/student-1440-dark.png) | [Captura](evidence/integration/student-390-light.png) | [Captura](evidence/integration/student-390-dark.png) |
| Professor | [Captura](evidence/integration/professor-1440-light.png) | [Captura](evidence/integration/professor-1440-dark.png) | [Captura](evidence/integration/professor-390-light.png) | [Captura](evidence/integration/professor-390-dark.png) |
| Administrador | [Captura](evidence/integration/admin-1440-light.png) | [Captura](evidence/integration/admin-1440-dark.png) | [Captura](evidence/integration/admin-390-light.png) | [Captura](evidence/integration/admin-390-dark.png) |

A inspeção atual conserva a direção Campus Folio, tipografia local, superfícies creme/mint e tema verde escuro. A agenda do aluno exibe novamente a próxima aula, comportamento preservado da main. A navegação tem nome acessível no elemento `nav` e o teste de formulário docente usa identificação de campo sem ambiguidade.

A matriz automatizada local aprovou 46 cenários: 40 combinações de página/perfil em 11 larguras e dois temas, 880 verificações de composição e axe em 160 combinações. Os fluxos funcionais aprovaram 39 cenários, com dois corrigidos e reexecutados. O teste de zoom real foi bloqueado pela política de extensões do Chromium local e aprovado no [CI completo do PR #25](https://github.com/ZaraTakion/takion-campus/actions/runs/38060644256), que executa os 86 cenários de navegador sem desabilitá-los.

Não houve teste com NVDA/VoiceOver, dispositivos físicos, Safari ou Firefox. Não se afirma certificação WCAG integral nem funcionamento remoto a partir dessas imagens. Resultados do CI e limites operacionais estão em [INTEGRATION_STATUS.md](../INTEGRATION_STATUS.md).
