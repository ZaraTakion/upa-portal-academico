# Release 2.1.0-rc.1 — auditoria e entrega

Repositório exclusivo: `ZaraTakion/upa-portal-academico`. Base: `main` em `7c2a125`. Branch: `improve/verified-release-20261010`. Não houve merge, publicação externa ou contratação de serviços.

## Diagnóstico da base

Foram inspecionados código backend/frontend, modelos, serializers, views, URLs, permissões, migrações, testes, dependências, documentação, workflow e histórico dos 19 PRs anteriores. A consulta de issues não retornou registros. O workflow mais recente da base estava aprovado. A reprodução local passou em 61 testes Django, 24 testes Node e build/lint; havia apenas dois cenários Playwright.

| Funcionalidade | Classificação inicial | Entrega desta revisão |
| --- | --- | --- |
| Login por perfil | Implementada, com problemas | CSRF no login, access em memória, restauração de sessão e erros de rede tratados. |
| Renovação/logout | Implementada, com problemas | Token CSRF da API funciona com origens distintas; logout aguarda revogação; troca de senha invalida access/refresh. |
| Recuperação de senha | Implementada, sem evidência E2E completa | Formulário, e-mail em arquivo, troca e rejeição de reuso exercitados no navegador. SMTP real continua externo. |
| Painel estudantil | Implementada, com problemas | Overflow móvel corrigido; indicadores preservados; ausência de dados não simula resultado. |
| Perfil estudantil | Implementada e validada | Edição permitida preservada; cadastro administrativo concluído; vínculo de conta protegido. |
| Disciplinas/notas/calendário | Implementadas, com problemas | Validação de filtros/escalas/intervalos; erros visíveis; labels acessíveis; contratos preservados. |
| Turmas/alunos | Implementadas, com problemas | Queries e contagem de matrículas corrigidas; matrícula institucional incluída na listagem. |
| Avaliações e resultados | Parcialmente implementadas | Edição e devolutiva na interface; limites e reassociação validados; horário de correção atualizado. |
| Frequência | Implementada, com problemas | Transação em lote, reenvio idempotente, rosters protegidos, estado de data preservado. |
| Cálculos derivados | Implementados, com problemas | Exclusões em lote no Admin recalculam nota/faltas; constraints protegem a persistência. |
| Materiais/entregas/download | Implementados, com problemas | Remoção de `/media/` público em DEBUG; proteção de referências; validação ampliada de Office/TXT; fluxo real de revisão e download privado. |
| Notificações | Implementadas, com problemas | Publicação administrativa e leitura persistente; contraste de notificações lidas corrigido. |
| Financeiro | Consulta implementada; gestão parcialmente implementada | Cadastro/edição no portal com titular correto e valor positivo. Gateway não faz parte do escopo e não é simulado. |
| Atendimento | Parcialmente implementado | Resposta administrativa na interface e leitura pelo solicitante. |
| Contas/perfis administrativos | Parcialmente implementados | API e formulários de usuários/estudantes/professores, limite de concessão de administração e desativação. |
| Horários e cadastros acadêmicos | Parcialmente implementados | Gestão nativa de horários, consistência de vínculos e validação de campos opcionais. |
| Integridade e migrações | Parcialmente validadas | PostgreSQL/SQLite, constraints e referências protegidas; preflight somente de leitura. |
| OpenAPI | Implementada, com problemas | Schema completo, tipos corrigidos, sem avisos; docs aceitam sessão administrativa e usam assets locais. |
| CI e testes | Parcialmente implementados | Matriz SQLite/PostgreSQL, Ruff, pip-audit, OpenAPI estrito, build de produção e E2E com evidências. |
| Migração total TypeScript / reconstrução | Desnecessária para os problemas encontrados | Mantido JavaScript e estrutura existente; divisão por rotas implementada. |

## Decisões e segurança

A arquitetura por apps foi mantida. Permissões continuam no servidor e queryset; frontend orienta navegação. Cadastros reutilizam o componente administrativo existente. A camada comum de viewsets valida filtros e converte conflitos protegidos em HTTP apropriado.

Correções relevantes: revogação de tokens após senha/desativação; proteção CSRF e ausência de tokens persistentes; privacidade de arquivos inclusive em DEBUG; cache privado; prevenção de escalada administrativa; constraints sem limpeza destrutiva; preservação de histórico nas exclusões; correção de consultas N+1 e contagem de alunos; patches de cinco dependências vulneráveis identificadas pela auditoria Python.

## Evidências executadas

| Verificação local | Resultado executado |
| --- | --- |
| Django / SQLite | 89 testes aprovados. |
| Django / PostgreSQL 17 | 89 testes aprovados. |
| Node | 29 testes aprovados. |
| Ruff / ESLint | Aprovados. |
| Django system check / deploy estrito | Sem erros ou avisos. |
| Migrações / OpenAPI | Nenhuma migração pendente de geração; schema validado sem avisos. |
| Produção React | Build aprovado; entrada 291,79 kB / gzip 95,76 kB, com divisão por rotas. |
| pip-audit / npm audit | Nenhuma vulnerabilidade conhecida reportada no conjunto auditado. |
| Playwright | Os 20 fluxos de integração passaram; a execução ampliada de 32 cenários está em validação final após correção de foco em tabela móvel. |
| Migração com dados | Ensaio isolado 0006 → 0007 preservou todos os campos de uma nota e a matrícula sintéticas. |
| Backup inicial PostgreSQL | Dump/restore em banco separado preservou 13 usuários, 8 notas, 4 presenças e 6 registros de arquivos. |

A auditoria inicial Python reportou 46 ocorrências de advisories em cinco dependências. Atualizações foram restritas aos pacotes afetados e seus requisitos. “Sem vulnerabilidade conhecida” representa a resposta das ferramentas na execução, não uma garantia de ausência de falhas.

Os cenários de navegador verificam persistência de perfil, notas, chamada, usuários/perfis, cobranças, comunicados, atendimento e entregas; verificam também IDOR/BOLA, turma de outro professor, cookie HttpOnly, restauração/renovação/logout e recuperação com link de uso único. Responsividade é exercitada a 320, 390, 768, 1366, 1920 e 2560 px. Axe executa regras WCAG aplicáveis; capturas e traces acompanham o relatório do CI.

O GitHub Actions será acompanhado após abertura do PR. Os resultados locais acima não substituem aprovação do workflow.

## Comandos e reprodução

```bash
cd backend
python -m pip install -r requirements-dev.txt
ruff check .
python manage.py check
python manage.py check --deploy --fail-level WARNING
python manage.py makemigrations --check --dry-run
python manage.py spectacular --file /tmp/upa-schema.yaml --validate --fail-on-warn
python manage.py migrate --noinput
python manage.py check_academic_integrity
python manage.py test --noinput
pip-audit -r requirements.txt --progress-spinner off
cd ../frontend
npm ci
npm test
npm run lint
npm audit --audit-level=low
VITE_API_URL=http://127.0.0.1:8000/api npm run build
npm run test:e2e
```

Os comandos exigem configuração correspondente à finalidade: local, produção ou CI. Consulte README e OPERATIONS. Testes Django foram executados separadamente com SQLite e PostgreSQL; Playwright usa frontend/API reais e somente dados fictícios. Nenhum teste fez chamada SMTP institucional.

## Arquivos e entregas

- Backend: `accounts` (sessão e administração), `academic` (integridade, validações, sinais e frequência), `management_app` (financeiro, arquivos e privacidade), `dashboard` (schema e query), `core` (viewsets, cache, configuração, health).
- Migrações novas: `academic/0007` e `management_app/0007`; sem remoção de dados. Migrações históricas preservadas.
- Frontend: cliente de sessão, contexto de autenticação, rotas, navegação, gestão administrativa, atendimento, arquivos, avaliações/frequência e feedback/acessibilidade das páginas.
- Qualidade: testes críticos Python/Node/Playwright, lockfile de ferramentas de navegador, lint Python, workflow e artefatos.
- Documentação: README, referência técnica, operação, estudo de caso e este relatório. O diff do PR é a lista completa de arquivos alterados.

## Estado de conclusão

- [x] Arquitetura revisada, contratos preservados e regras críticas validadas.
- [x] Fluxos essenciais dos três perfis integrados ao banco.
- [x] Permissões no servidor, integridade, migrações e PostgreSQL verificados.
- [x] Testes críticos Python/Node, lint, segurança e build aprovados localmente.
- [ ] Execução final ampliada de navegador e GitHub Actions aprovados.
- [x] README, referência, estudo de caso e guia de operação atualizados.
- [ ] PR pronto para revisão com evidências finais.
- [x] Versão candidata preparada; limitações externas explicitadas.

A release permanece candidata e aguardando revisão; o ambiente institucional não foi implantado.

## Limitações externas

- Merge na `main`, publicação, domínio/HTTPS e recursos pagos não autorizados nesta etapa.
- SMTP real, S3 real, observabilidade institucional e políticas de retenção/LGPD precisam ser configurados e avaliados no ambiente de destino.
- Limitação DRF usa cache local por padrão; operação distribuída exige cache compartilhado e/ou gateway. Não há alegação de proteção distribuída contra DDoS.
- Nenhum pentest, teste de carga, certificação WCAG/LGPD ou validação em leitores de tela reais.
- Arquivos são validados, mas não passam por antivírus neste projeto.
- Logout revoga refresh; access anterior dura até 15 minutos. Troca de senha e desativação invalidam access também.
- Pagamentos e integração com ERP institucional estão fora do escopo; o portal persiste registros financeiros e acadêmicos próprios.
