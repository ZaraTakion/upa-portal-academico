# Auditoria visual e implementação

Registro histórico do PR #21. A reconciliação posterior com a main está documentada em [INTEGRATION_STATUS.md](../INTEGRATION_STATUS.md); as capturas atuais estão em [INTEGRATION_EVIDENCE.md](INTEGRATION_EVIDENCE.md).

Base funcional: commit `5c19d23` da branch `improve/verified-release-20261010`, PR #20. A `main` ainda não incorpora essa revisão. Branch dedicada: `design/takion-campus-20261010`. Escopo desta entrega: apresentação, componentes React, estilos, metadados, ativos, testes de interface e documentação. Models, migrações, endpoints, cliente de autenticação e regras acadêmicas não foram alterados.

## Inventário e tratamento

| Telas / componentes | Problema observado | Implementação |
| --- | --- | --- |
| Login, recuperação, redefinição | Identidade UPA; recuperação isolada; composição de dashboard promocional | AuthLayout compartilhado, marca, formulário central e ilustração original; temas e estados preservados |
| Dashboard estudante | Hero escuro, cards/indicadores decorativos, hierarquia repetitiva | Cabeçalho editorial, faixa de indicadores, atalhos reais, agenda de eventos e horários |
| Turmas docente | Cards genéricos com ações afastadas | Índice operacional de turmas, contagem real, ações de avaliação/frequência/notas |
| Painel administrador | Mesma grade de cards dos demais perfis | Faixa de indicadores, diretório de ferramentas e orientações operacionais |
| Gestão: usuários, estudantes, professores, faturas, comunicados, horários, cursos, períodos, disciplinas, turmas, matrículas, calendário, regra de notas | Densidade de navegação/formulário e múltiplas seções ativas | Botões de seção com aria-pressed, formulário/registro divididos, seção atual correta e tabela contida |
| Perfil | Parágrafos repetidos e ausência de hierarquia de registro | Registro dl, edição de contato separada, labels explícitos e feedback |
| Disciplinas, notas/avaliações, financeiro | Cards inconsistentes e decoração excessiva | Tipografia, bordas e status consistentes; filtros e valores reais preservados |
| Calendário | Cards repetidos para informações de agenda | Lista editorial em duas colunas/uma no celular, datas e status claros |
| Arquivos/atividades, atendimento | Formulários e listas sem sistema visual uniforme | Controles, grupos, registros, ações de entrega/download/resposta e feedback integrados |
| Notificações | Cards isolados e espaços excessivos | Lista contínua, indicador de não lido e ação contextual |
| Docente: alunos, notas, frequência, avaliações | Tabelas e campos com estilos dispersos | Cabeçalhos, foco por linha, números tabulares, regiões nomeadas com scroll contido |
| 404, erros, vazios, carregamento | Identidade e estados inconsistentes | Tokens compartilhados, um H1, retorno correto por perfil e redução de movimento |
| Sidebar/Navbar | Marca anterior, indicadores administrativos duplicados, collapse/foco e regras mobile conflitantes | Monograma, grupos, um controle de menu, identificação da seção, nomes acessíveis e preservação do trap de foco |
| CSS global/layout/components/pages/responsive | Overrides contraditórios, azul residual no escuro, uniesp obsoleto, MobileTopbar sem uso | Reescrita organizada, tokens semânticos, remoção de tokens obsoletos e componente sem uso |
| Metadados/favicon/manifest | Título UPA e favicon declarado como PNG embora SVG | Nome, descrição, autoria, título contextual e SVG de marca/aplicação |

Todos os itens foram implementados no projeto existente. Não foi adicionada biblioteca de UI, imagem de IA, tela promocional ou dado acadêmico estático. Referências ao UPA dentro de dados históricos/demo da API foram preservadas como registros, incluindo nomes de eventos e da conta de demonstração; não são textos estáticos da nova identidade. Não se renomeou o repositório, URLs, API, chaves de sessão ou package npm.

## Verificação da base e histórico

Issues consultadas: nenhuma issue encontrada no repositório na consulta desta sessão. PR aberto relevante: [#20](https://github.com/ZaraTakion/upa-portal-academico/pull/20), revisão funcional anterior ainda aguardando aprovação. O PR do redesign usa essa branch como base para manter o diff dedicado ao Front-End. A pequena alteração fora do Front-End é o bloqueio da branch em `vercel.json` da raiz, junto ao arquivo do Front-End, para impedir nova publicação automática; nenhum serviço ou deploy foi solicitado.

## Ajustes encontrados durante QA

- Correção de contraste dos textos auxiliares sobre o fundo mint.
- Correção da ordem/especificidade de display dos botões mobile, que apareciam no desktop na primeira implementação.
- Nome visível do collapse alinhado ao nome acessível.
- Menu móvel animado por transform e controlado por inert, preservando foco imediato sem atraso por visibility.
- Marcação de obrigatório fora da label, para preservar seu nome e os seletores de formulários existentes.
- Ferramenta de teste deixa de esperar animações infinitas de carregamento; a aplicação mantém o texto de status.

Resultados finais e limites estão em [QA.md](QA.md).
