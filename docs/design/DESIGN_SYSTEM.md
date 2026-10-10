# Takion Campus — Design System

Takion Campus, **by Takion Software**, é um sistema acadêmico independente de portfólio e demonstração. A marca substitui o nome apresentado pelo produto; repositório, rotas, APIs, identificadores técnicos e registros históricos permanecem compatíveis. A recomendação de nome e os limites da pesquisa estão em [BRAND_RESEARCH.md](BRAND_RESEARCH.md).

## Direção de arte e marca

Aqua Workstation aparece na organização das ferramentas, na navegação mint/aqua e nas superfícies creme. O arquivo editorial aparece nos títulos Fraunces, divisórias finas e composição com listas e registros. O vinho marca pequenos pontos de orientação. O monograma TC usa um arco de arquivo aberto e um T central; a pequena cantoneira vinho lembra uma marca de registro. A ilustração geométrica do login retoma o arco e um volume de conhecimento, sem imagens pesadas.

Use [wordmark claro](../../frontend/public/brand/wordmark.svg) em creme ou branco e [wordmark escuro](../../frontend/public/brand/wordmark-dark.svg) sobre verde escuro. O componente React `Brand` é a referência da aplicação. Preserve uma margem livre equivalente à largura da haste do símbolo multiplicada por quatro. Não distorça, não aplique efeitos luminosos nem substitua a assinatura por nome de instituição. O símbolo pode aparecer sozinho em favicon e ícone de aplicação; nos demais usos, associe-o ao nome completo. O wordmark exportado tem títulos em contornos; a assinatura possui fallback sans-serif. As licenças das fontes devem acompanhar a distribuição dos ativos.

## Tokens

Fonte única: `frontend/src/styles/tokens.css`.

| Papel | Tema claro | Tema escuro |
| --- | --- | --- |
| Fundo | Creme `#f6f4eb` | Verde `#182420` |
| Superfície | `#fffef9` | `#21312b` |
| Navegação | Mint `#e3eee5` | `#1e3029` |
| Ação / link | `#245e54` | `#b2dfcf` |
| Assinatura / foco | Vinho `#682c40` | Rosé `#e9b9c2` |
| Texto principal | `#253d36` | `#f0f0e4` |
| Texto secundário | `#53635b` | `#c1cec0` |

Tokens semânticos separados para sucesso, aviso, erro e informação, com superfícies próprias em ambos os temas. Situações possuem texto e cor; cor não é o único indicador.

Manrope atende labels, dados, navegação e ações. Fraunces 450 atende títulos e números de resumo. Os arquivos web totalizam aproximadamente 49 KB e são locais; a UI não depende de pedidos a Google Fonts. Escala de texto: 12, 14, 16, 18 e 24 px, com títulos fluidos até 52 px. Espaçamentos: 4, 8, 12, 16, 24, 32, 48 e 64 px. Raios de 2–10 px; botões/campos usam 4 px, painéis 6 px. Sombras são reservadas principalmente à navegação sobreposta. Conteúdo limitado a 1560 px, barra lateral 248 px ou 84 px recolhida.

Breakpoints de composição: 360, 640, 900, 1200 e 1920 px. A navegação JavaScript e o CSS compartilham 900 px; modificar ambos juntos. Variáveis CSS não podem ser usadas diretamente nas condições `@media`: os valores são explícitos e documentados, sem simular um token executável. As 11 larguras de verificação estão em [QA.md](QA.md).

## Componentes e composição

- `AuthLayout`: uma entrada única com formulário, marca e ilustração editorial; no celular mantém marca e formulário, sem painel decorativo. Compartilhado por login, recuperação e redefinição.
- `MainLayout`, `Sidebar`, `Navbar`: orientação estável, um indicador de seção atual, grupos por perfil, tema, notificações, identificação e saída. Menu mobile usa `inert`, bloqueio da rolagem, Escape, retenção e restauração de foco.
- `PageHeader`: um H1 editorial, contexto curto e descrição, separados do trabalho por uma linha.
- `Button`, `TextInput`, `TextareaInput`, `SelectInput`: labels associados, indicação de obrigatoriedade fora do nome do campo e estados nativos. Button encaminha atributos ARIA; TextInput admite ajuda e erro associados por `aria-describedby`.
- Indicadores: uma faixa dividida, sem círculos decorativos nem sombras repetidas. O conteúdo de cada valor continua vindo da API.
- Estudante: percurso, notas/faltas/avisos/pendências, atalhos e duas agendas.
- Professor: índice de turmas com ações próximas à turma; notas, frequência e avaliações continuam em tabelas operacionais.
- Administrador: indicadores e diretório de ferramentas, com gestão em formulário e registros. Seções selecionadas usam `aria-pressed` e indicação visual.
- Perfil: registro semântico `dl` e dados de contato separados. Calendário: agenda editorial em duas colunas, uma no celular. Notificações: lista contínua; arquivos/atendimento preservam formulário e histórico. Disciplinas/notas/financeiro usam agrupamentos comparáveis, com status explícito.
- Tabelas: regiões nomeadas e focáveis, rolagem horizontal contida, cabeçalho destacado, foco na linha e números tabulares. Nenhuma coluna essencial é escondida no celular.
- Erros, vazios, carregamento e 404 compartilham tokens e linguagem clara. Feedback corresponde a operações reais.

## Movimento e acessibilidade

Transições de 140/220 ms com `cubic-bezier(.2,.8,.2,1)`. Botões deslocam 1 px no hover; feedback entra com opacidade e 4 px; o menu desliza por `transform`. Sem parallax ou movimento decorativo constante. `prefers-reduced-motion` reduz transições e animações; carregamento continua identificado por texto/`role=status`.

Controles principais medem pelo menos 44 px; foco de 3 px com afastamento e suporte a cores forçadas. Labels visíveis, skip link, um H1, nomes acessíveis e informação de erro/sucesso foram verificados em Chromium/axe. O tema escuro redefine as cores sem reutilizar fundos claros. A validação automatizada complementa a inspeção visual, sem declarar conformidade integral WCAG ou substituir testes com pessoas e leitores de tela.

## Organização CSS

Ordem: `tokens` → `global` → `layout` → `components` → `pages` → `responsive`. Tokens não contêm regras de página. Global cobre base/tipografia/foco; layout cobre navegação/autenticação; components cobre controles reutilizáveis; pages cobre composição; responsive contém reflow. Os cinco estilos anteriores foram revisados e substituídos, com remoção de overrides contraditórios e do MobileTopbar sem uso.
