# Estudo de caso — Takion Campus, by Takion Software

## Problema

Um portal acadêmico precisa integrar consulta, registro e autorização. Uma tela pronta não comprova que a matrícula, a nota ou o arquivo correto foi persistido, nem que outra conta será bloqueada.

Takion Campus, originado no UPA Portal Acadêmico, usa Django REST Framework e React para oferecer fluxos de estudante, professor e administração. A revisão partiu da `main` existente, preservou módulos e contratos e corrigiu problemas reproduzidos por testes.

## Decisões de engenharia

- **Preservar a aplicação:** manter React/JavaScript, Django e a estrutura por apps. Migração integral para TypeScript não resolveria as falhas encontradas e ampliaria o risco de regressão. A divisão por rotas melhora carregamento sem reescrever páginas.
- **Concluir a administração:** ampliar o componente de gestão existente com contas, perfis, horários, cobranças e comunicados; integrar respostas a atendimentos. A API controla concessão de administração, vínculo dos perfis e desativação.
- **Proteger históricos:** substituir referências com exclusão em cascata por proteção e retornar 409. Constraints de notas e datas entram por migrações sem limpeza automática de dados. Inconsistências antigas devem ser corrigidas explicitamente antes de aplicar constraints.
- **Consolidar registros:** notas derivam das avaliações; faltas derivam da frequência. Sinais mantêm o cálculo após exclusões em lote no Admin. A chamada em lote usa transação para impedir persistência parcial.
- **Fortalecer sessão:** access em memória, refresh HttpOnly, CSRF em login/renovação/logout, restauração após reload e invalidação após mudança de senha. Falhas de rede são tratadas sem simular login ou apagar a sessão desnecessariamente.
- **Medir qualidade:** comparar a base com novos testes de integridade, autorização, PostgreSQL e navegador. Atualizar apenas dependências com vulnerabilidades identificadas, mantendo a família de versões do projeto.

## Experiência e acessibilidade

Após a estabilização funcional, a interface passou por um redesign dedicado, mantendo APIs, autenticação, banco e regras acadêmicas. A identidade Takion Campus combina superfícies creme/mint, títulos Fraunces, interface Manrope e acentos vinho. O arco e o monograma TC são vetores originais; as fontes OFL são hospedadas localmente.

A composição muda por tarefa: o estudante encontra percurso e agenda; o professor encontra turmas e ações operacionais; a administração encontra indicadores e diretório de gestão. Perfil usa um registro semântico, calendário usa uma agenda editorial e notificações usam lista contínua. As tabelas preservam todas as colunas em regiões focáveis com rolagem contida. A nova identidade está em autenticação, navegação, metadados, ícones, estados e estilos compartilhados de todas as páginas.

Os cinco arquivos CSS foram reorganizados, eliminando regras contraditórias de mobile/tema. A navegação identifica uma seção administrativa por vez e mantém nomes acessíveis quando recolhida. O teste visual percorre as páginas e as 13 seções administrativas em 11 larguras e ambos os temas, com verificações axe em 320/1440 px, ampliação de texto, foco e redução de movimento. Resultados executados e capturas reais estão em [QA do redesign](design/QA.md); não se declara conformidade integral WCAG.

## Evidência e limites

A base reproduzida tinha 61 testes Django, 24 testes Node e dois testes de navegador. Os resultados finais, comandos, capturas do CI e links de revisão estão em [RELEASE.md](RELEASE.md). Não há métricas inventadas de usuários, ganho de produtividade, impacto financeiro ou experiência institucional.

O trabalho prepara uma release candidata. Não comprova implantação pública, carga de produção, pentest, análise de malware ou conformidade integral WCAG/LGPD. PostgreSQL e backup/restauração são verificados somente com dados sintéticos. SMTP institucional, HTTPS/domínio, armazenamento e política de dados dependem da configuração do ambiente de destino.
