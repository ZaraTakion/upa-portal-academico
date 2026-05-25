# UNIESP Centro Universitário

## Curso de Sistemas para Internet

<br><br>

# UPA — Upgrade Portal Acadêmico

## Modernização da Experiência Acadêmica Digital por Meio de uma Aplicação Web Responsiva

<br><br>

**Rodrigo Araújo Maciel Pinheiro**

<br><br><br>

Cabedelo — PB  
2026

<br>

# UPA — Upgrade Portal Acadêmico

Documento apresentado ao curso de Sistemas para Internet da UNIESP Centro Universitário, como requisito parcial para avaliação acadêmica na área de desenvolvimento de sistemas web.

**Autor:** Rodrigo Araújo Maciel Pinheiro  
**Professor Orientador:** Leandro Santana de Melo  
**Curso:** Sistemas para Internet  
**Instituição:** UNIESP Centro Universitário  

Cabedelo — PB  
2026

<br><br><br>

# Resumo

A transformação digital no ambiente educacional tem ampliado a necessidade de sistemas acadêmicos mais modernos, acessíveis, responsivos e eficientes. Portais acadêmicos são ferramentas fundamentais para a comunicação institucional, consulta de informações estudantis, acompanhamento de desempenho e centralização de serviços digitais. No entanto, muitos desses sistemas ainda apresentam limitações relacionadas à usabilidade, organização visual, responsividade e experiência do usuário.

Este trabalho apresenta o desenvolvimento do UPA — Upgrade Portal Acadêmico, uma aplicação web voltada à modernização da experiência acadêmica digital. O sistema foi desenvolvido utilizando React no front-end, Django no back-end, Django REST Framework para construção da API REST, autenticação JWT e banco de dados SQLite. A proposta busca oferecer uma interface mais intuitiva, organizada e responsiva, contemplando funcionalidades como dashboard acadêmico, perfil do aluno, disciplinas, notas, calendário acadêmico, notificações, arquivos, financeiro, contato, área do professor e painel administrativo.

A metodologia adotada foi baseada em práticas ágeis, com divisão do desenvolvimento em etapas incrementais, contemplando levantamento de requisitos, definição arquitetural, implementação, integração, testes e refinamento visual. Como resultado, o projeto demonstra a viabilidade de modernizar um portal acadêmico por meio de uma arquitetura web desacoplada, modular e escalável, priorizando experiência do usuário, acessibilidade, responsividade e organização da informação.

**Palavras-chave:** Portal acadêmico; React; Django; API REST; UX/UI; Responsividade; Sistemas web.

# Resumo

A transformação digital no ambiente educacional tem ampliado a necessidade de sistemas acadêmicos mais modernos, acessíveis, responsivos e eficientes. Portais acadêmicos são ferramentas fundamentais para a comunicação institucional, consulta de informações estudantis, acompanhamento de desempenho e centralização de serviços digitais. No entanto, muitos desses sistemas ainda apresentam limitações relacionadas à usabilidade, organização visual, responsividade e experiência do usuário.

Este trabalho apresenta o desenvolvimento do UPA — Upgrade Portal Acadêmico, uma aplicação web voltada à modernização da experiência acadêmica digital. O sistema foi desenvolvido utilizando React no front-end, Django no back-end, Django REST Framework para construção da API REST, autenticação JWT e banco de dados SQLite. A proposta busca oferecer uma interface mais intuitiva, organizada e responsiva, contemplando funcionalidades como dashboard acadêmico, perfil do aluno, disciplinas, notas, calendário acadêmico, notificações, arquivos, financeiro, contato, área do professor e painel administrativo.

A metodologia adotada foi baseada em práticas ágeis, com divisão do desenvolvimento em etapas incrementais, contemplando levantamento de requisitos, definição arquitetural, implementação, integração, testes e refinamento visual. Como resultado, o projeto demonstra a viabilidade de modernizar um portal acadêmico por meio de uma arquitetura web desacoplada, modular e escalável, priorizando experiência do usuário, acessibilidade, responsividade e organização da informação.

**Palavras-chave:** Portal acadêmico; React; Django; API REST; UX/UI; Responsividade; Sistemas web.


# 1. Introdução

A transformação digital tem provocado mudanças significativas na forma como instituições de ensino superior organizam seus processos acadêmicos, administrativos e comunicacionais. Nesse contexto, os portais acadêmicos passaram a exercer papel essencial na centralização de informações, no acompanhamento da vida estudantil e na oferta de serviços digitais para alunos, professores e administradores.

Com o aumento do uso de dispositivos móveis e a necessidade de acesso rápido às informações, tornou-se indispensável que sistemas acadêmicos sejam modernos, responsivos, acessíveis e intuitivos. A experiência do usuário passou a ser um fator estratégico, pois sistemas visualmente desorganizados ou de difícil navegação podem comprometer a eficiência operacional, mesmo quando suas funcionalidades estão presentes.

O projeto UPA — Upgrade Portal Acadêmico surge como uma proposta de modernização da experiência acadêmica digital, buscando reorganizar e aprimorar funcionalidades comuns em portais universitários por meio de uma interface mais clara, responsiva e orientada ao usuário.

A aplicação foi desenvolvida como um sistema web full-stack, utilizando React no front-end, Django no back-end, Django REST Framework para construção da API, autenticação JWT e banco de dados SQLite. A arquitetura adotada prioriza separação de responsabilidades, componentização, reaproveitamento de código e facilidade de manutenção.

Dessa forma, o UPA busca demonstrar como tecnologias modernas podem ser aplicadas para melhorar a usabilidade, a organização da informação e a experiência digital em ambientes acadêmicos.



## 1.1 Contextualização

Os sistemas acadêmicos são ferramentas indispensáveis para instituições de ensino superior, pois permitem que alunos acompanhem informações como disciplinas, notas, calendário, avisos, documentos, dados financeiros e solicitações institucionais. Além disso, possibilitam que professores e administradores tenham acesso a recursos de gestão acadêmica, lançamento de informações e acompanhamento das atividades institucionais.

Apesar de sua importância, muitos portais acadêmicos ainda são desenvolvidos com foco predominantemente administrativo, deixando a experiência do estudante em segundo plano. Isso pode resultar em interfaces pouco intuitivas, excesso de informações distribuídas de forma inadequada, baixa adaptação a dispositivos móveis e dificuldade de acesso rápido às funcionalidades mais importantes.

Nesse cenário, o UPA propõe uma reformulação da experiência acadêmica digital, priorizando uma navegação mais simples, visual moderno, componentes reutilizáveis, dashboard informativo e integração eficiente entre front-end e back-end.

A proposta não tem como objetivo apenas criar novas funcionalidades, mas sim reorganizar e modernizar a forma como os serviços acadêmicos são apresentados aos usuários. Assim, o sistema busca transformar um ambiente originalmente administrativo em uma experiência centrada no estudante.



## 1.2 Problema Identificado

O problema central identificado está relacionado às limitações de experiência do usuário em portais acadêmicos tradicionais. Entre os principais pontos observados, destacam-se:

- Falhas de usabilidade;
- Navegação inconsistente;
- Baixa responsividade;
- Experiência mobile inadequada;
- Ausência de padronização visual;
- Arquitetura da informação desorganizada;
- Dificuldade de acesso rápido às funcionalidades;
- Acessibilidade limitada;
- Páginas incompletas ou pouco intuitivas;
- Baixa eficiência operacional para estudantes.

Essas limitações prejudicam a experiência acadêmica digital, pois obrigam o usuário a procurar manualmente informações que poderiam estar centralizadas de forma clara em um dashboard moderno. Em vez de apresentar rapidamente o que o aluno precisa saber, muitos sistemas apenas disponibilizam menus e páginas isoladas, aumentando o esforço cognitivo durante o uso.

Dessa forma, percebe-se a necessidade de uma reformulação estrutural e visual, com foco em responsividade, acessibilidade, organização da informação, padronização da interface e melhoria da navegação.

## 1.3 Objetivo Geral

Desenvolver um portal acadêmico moderno, responsivo e acessível, capaz de centralizar serviços acadêmicos e administrativos, melhorando a experiência digital de alunos, professores e administradores por meio de uma aplicação web escalável, intuitiva e funcional.

## 1.4 Objetivos Específicos

Os objetivos específicos do projeto são:

- Modernizar a interface visual do portal acadêmico;
- Melhorar a usabilidade e a navegação do sistema;
- Implementar responsividade para diferentes dispositivos;
- Aplicar boas práticas de acessibilidade digital;
- Organizar estruturalmente as informações acadêmicas;
- Centralizar funcionalidades estudantis em um único ambiente;
- Desenvolver autenticação de usuários com controle de sessão;
- Implementar dashboard acadêmico funcional;
- Permitir visualização de disciplinas, notas e faltas;
- Disponibilizar calendário acadêmico;
- Implementar sistema de notificações;
- Criar módulo de arquivos acadêmicos;
- Criar módulo financeiro com mensalidades e pendências;
- Disponibilizar formulário de contato;
- Criar área do professor para turmas, alunos e lançamento de notas;
- Criar painel administrativo para visão institucional;
- Integrar front-end e back-end por meio de API REST;
- Estruturar arquitetura baseada em componentização;
- Utilizar tecnologias modernas voltadas ao desenvolvimento web full-stack;
- Realizar testes funcionais, visuais e responsivos.

## 1.5 Justificativa

A modernização de sistemas acadêmicos representa uma necessidade crescente nas instituições de ensino superior, especialmente diante da dependência cada vez maior de soluções digitais para organização da vida acadêmica. Um portal acadêmico eficiente contribui diretamente para a melhoria da comunicação institucional, centralização de informações e facilidade de acesso aos serviços oferecidos pela instituição.

Sistemas mal organizados podem gerar dificuldades operacionais, aumentar o esforço cognitivo dos usuários e reduzir a produtividade acadêmica. Quando informações importantes como notas, faltas, eventos, mensalidades, documentos e avisos estão espalhadas em páginas pouco intuitivas, o aluno precisa gastar mais tempo para encontrar aquilo que deveria estar disponível de forma direta.

Nesse contexto, o UPA se justifica pela proposta de oferecer uma solução tecnológica mais moderna, acessível e eficiente, alinhada às necessidades atuais de usabilidade, responsividade e experiência do usuário. O projeto busca demonstrar que a melhoria da experiência digital não depende apenas da criação de novas funcionalidades, mas também da reorganização inteligente das funcionalidades já existentes.

Além da relevância acadêmica, o projeto também possui importância prática para a formação profissional do desenvolvedor, pois envolve a aplicação integrada de conhecimentos em front-end, back-end, UX/UI, banco de dados, autenticação, APIs REST, arquitetura de software, versionamento e documentação.

## 1.6 Metodologia

O desenvolvimento do projeto foi conduzido com base em princípios de metodologias ágeis, especialmente Scrum e Kanban, permitindo a divisão do trabalho em etapas menores e facilitando o acompanhamento incremental da evolução do sistema.

A construção da aplicação foi organizada em sprints, contemplando desde o planejamento inicial até a implementação, testes e refinamento visual. As principais etapas do desenvolvimento foram:

1. Levantamento de requisitos;
2. Análise do problema;
3. Definição da arquitetura;
4. Planejamento visual e wireframes;
5. Criação da estrutura do front-end;
6. Desenvolvimento do back-end;
7. Implementação da autenticação;
8. Integração entre front-end e back-end;
9. Desenvolvimento das páginas acadêmicas;
10. Criação dos módulos de professor e administrador;
11. Implementação do módulo financeiro;
12. Refinamento de UX/UI;
13. Testes funcionais e responsivos;
14. Versionamento com Git e GitHub;
15. Preparação da documentação e apresentação.

A aplicação foi desenvolvida utilizando React no front-end, Django no back-end, Django REST Framework para criação da API REST, autenticação JWT para controle de acesso e SQLite como banco de dados durante o desenvolvimento.

O uso de uma arquitetura desacoplada permitiu separar responsabilidades entre interface, regras de negócio e persistência de dados. Essa abordagem contribui para maior organização do código, manutenção simplificada e possibilidade de expansão futura do sistema.

# 2. Fundamentação Teórica

A fundamentação teórica apresenta os principais conceitos, tecnologias e práticas utilizadas no desenvolvimento do projeto UPA — Upgrade Portal Acadêmico. O objetivo desta seção é contextualizar as escolhas técnicas adotadas, demonstrando como elas contribuem para a construção de uma aplicação web moderna, responsiva, acessível e escalável.

O projeto está baseado em tecnologias amplamente utilizadas no desenvolvimento web atual, com separação entre front-end e back-end, comunicação por API REST, autenticação de usuários, banco de dados relacional e interface componentizada. Essa abordagem segue princípios de arquitetura moderna, favorecendo manutenção, organização e expansão futura do sistema.

## 2.1 Aplicações Web

Aplicações web são sistemas acessados por meio de navegadores, sem a necessidade de instalação local pelo usuário final. Elas permitem que funcionalidades sejam disponibilizadas de forma centralizada, possibilitando acesso a partir de diferentes dispositivos, como computadores, notebooks, tablets e smartphones.

No contexto acadêmico, aplicações web são especialmente relevantes, pois facilitam o acesso a serviços institucionais, informações estudantis, calendário acadêmico, notas, disciplinas, documentos e comunicados.

Diferentemente de sites estáticos, que apresentam conteúdo fixo e pouca interação, aplicações web dinâmicas possuem autenticação, integração com banco de dados, manipulação de informações, personalização de conteúdo e comunicação constante com servidores. O UPA se enquadra como uma aplicação web dinâmica, pois envolve login de usuários, controle de permissões, consulta e registro de dados acadêmicos, além de integração entre interface e API.

## 2.2 HTML

O HTML, sigla para HyperText Markup Language, é a linguagem de marcação responsável pela estruturação do conteúdo em páginas web. Por meio dele, é possível definir títulos, textos, formulários, tabelas, imagens, links, seções e demais elementos exibidos ao usuário.

Além da organização visual, o HTML moderno possui papel importante na acessibilidade e na semântica da aplicação. A utilização correta de elementos estruturais contribui para melhor interpretação por navegadores, mecanismos de busca e tecnologias assistivas, como leitores de tela.

No projeto UPA, o HTML é utilizado indiretamente por meio do React, que gera a estrutura da interface a partir de componentes. Ainda assim, os princípios semânticos permanecem importantes para garantir organização, acessibilidade e compatibilidade entre dispositivos.

## 2.3 CSS

O CSS, ou Cascading Style Sheets, é a tecnologia responsável pela estilização visual das páginas web. Ele permite definir cores, fontes, espaçamentos, alinhamentos, tamanhos, sombras, bordas, animações, responsividade e organização visual dos elementos.

No desenvolvimento de interfaces modernas, o CSS é essencial para criar experiências consistentes e adaptáveis. Por meio de recursos como variáveis, media queries, grids e flexbox, é possível construir layouts responsivos e reutilizáveis.

No UPA, o CSS foi utilizado para implementar a identidade visual do sistema, estruturar o layout principal, estilizar componentes reutilizáveis, aplicar responsividade e criar suporte ao modo claro e escuro. A organização dos estilos foi dividida em arquivos específicos, como global.css, layout.css, components.css, pages.css e responsive.css, facilitando manutenção e evolução visual da aplicação.

## 2.4 JavaScript

O JavaScript é uma linguagem de programação utilizada para adicionar interatividade e comportamento dinâmico às aplicações web. Ele permite manipular elementos da interface, validar formulários, controlar eventos, realizar requisições a APIs e atualizar informações sem recarregar completamente a página.

Em aplicações modernas, o JavaScript é amplamente utilizado em conjunto com bibliotecas e frameworks front-end, permitindo a criação de interfaces mais fluidas e interativas.

No projeto UPA, o JavaScript é utilizado juntamente ao React para controlar estados da aplicação, realizar login, consumir dados da API, renderizar páginas de forma dinâmica e atualizar elementos da interface conforme o perfil do usuário.

## 2.5 React

React é uma biblioteca JavaScript voltada à construção de interfaces de usuário baseadas em componentes reutilizáveis. Sua principal característica é permitir que a interface seja dividida em partes menores, independentes e reaproveitáveis, facilitando organização e manutenção do código.

Entre suas vantagens, destacam-se:

- Componentização da interface;
- Reutilização de código;
- Organização estrutural;
- Atualização dinâmica da tela;
- Facilidade de manutenção;
- Construção de aplicações SPA.

Aplicações SPA, ou Single Page Applications, permitem navegação entre páginas sem recarregamento completo do navegador, proporcionando experiência mais fluida ao usuário.

No UPA, o React foi utilizado para construir toda a interface do portal acadêmico, incluindo login, dashboard, perfil, disciplinas, notas, calendário, financeiro, notificações, arquivos, área do professor e painel administrativo. A aplicação também utiliza React Router DOM para navegação entre páginas, Axios para comunicação com a API e Context API para gerenciamento de autenticação e tema.

## 2.6 Django

Django é um framework web desenvolvido em Python que permite a criação rápida, segura e organizada de aplicações web. Ele segue o padrão arquitetural MTV, composto por Model, Template e View, e oferece diversos recursos prontos para desenvolvimento, como sistema de autenticação, painel administrativo, ORM, rotas, segurança e integração com banco de dados.

Entre suas principais vantagens, destacam-se:

- Alta produtividade;
- Estrutura organizada;
- Segurança;
- ORM integrado;
- Painel administrativo automático;
- Boa documentação;
- Facilidade de integração com APIs.

No projeto UPA, o Django foi utilizado como base do back-end, sendo responsável pela estrutura principal do servidor, regras de negócio, autenticação, gerenciamento de usuários, permissões, modelos de dados e integração com o banco SQLite.

A escolha do Django contribuiu para acelerar o desenvolvimento e permitir uma organização robusta da aplicação, especialmente considerando a necessidade de criar módulos acadêmicos, financeiros, administrativos e de comunicação.

## 2.7 Django REST Framework

O Django REST Framework, também conhecido como DRF, é uma extensão do Django voltada à criação de APIs REST. Ele permite transformar modelos Django em endpoints acessíveis por aplicações externas, como sistemas front-end desenvolvidos em React.

O DRF facilita a criação de serializadores, views, permissões, autenticação, filtros e rotas para comunicação estruturada entre cliente e servidor.

No UPA, o Django REST Framework foi utilizado para desenvolver a API responsável pela comunicação entre o front-end React e o back-end Django. Por meio dessa API, o sistema consegue autenticar usuários, retornar dados acadêmicos, listar disciplinas, exibir notas, enviar arquivos, consultar informações financeiras e manipular notificações.

## 2.8 API REST

API REST, ou Representational State Transfer, é um padrão arquitetural utilizado para comunicação entre sistemas por meio do protocolo HTTP. Ela permite que diferentes aplicações troquem dados de forma padronizada, utilizando métodos como GET, POST, PUT, PATCH e DELETE.

Em uma arquitetura REST, o front-end e o back-end podem funcionar de forma desacoplada. O front-end solicita dados ao servidor, e o back-end responde geralmente em formato JSON.

No projeto UPA, a API REST é responsável pela integração entre a interface React e o servidor Django. Essa separação permite maior organização estrutural, independência tecnológica e facilidade de manutenção. O front-end fica responsável pela experiência do usuário, enquanto o back-end gerencia dados, autenticação, permissões e regras de negócio.

## 2.9 Banco de Dados SQLite

SQLite é um sistema de banco de dados relacional leve, simples e integrado, muito utilizado em ambientes de desenvolvimento, prototipação e aplicações de menor complexidade. Diferentemente de sistemas mais robustos, como PostgreSQL ou MySQL, o SQLite armazena os dados em um arquivo local, dispensando configuração complexa de servidor.

No projeto UPA, o SQLite foi utilizado como banco de dados principal durante o desenvolvimento acadêmico. Ele armazena informações como usuários, perfis de alunos, professores, disciplinas, notas, turmas, calendário, notificações, arquivos, mensagens de contato e dados financeiros.

Sua utilização se justifica pela simplicidade de configuração, facilidade de execução local e adequação ao escopo acadêmico do projeto.

## 2.10 Autenticação JWT

JWT, ou JSON Web Token, é um padrão utilizado para autenticação e troca segura de informações entre cliente e servidor. Após o login, o servidor gera um token que representa a sessão do usuário. Esse token é armazenado no front-end e enviado nas requisições seguintes para permitir acesso a rotas protegidas.

No UPA, a autenticação JWT foi utilizada para controlar o acesso dos usuários ao sistema. Apenas usuários autenticados conseguem acessar páginas internas, como dashboard, perfil, notas, financeiro e área administrativa.

Além disso, o sistema utiliza diferentes perfis de acesso, como aluno, professor e administrador, permitindo que cada usuário visualize funcionalidades adequadas ao seu papel dentro da aplicação.

## 2.11 UX/UI

UX, ou User Experience, refere-se à experiência do usuário ao interagir com um sistema. Esse conceito envolve facilidade de uso, clareza, eficiência, acessibilidade, satisfação e organização da informação.

UI, ou User Interface, refere-se à interface visual do sistema, incluindo cores, tipografia, botões, cards, menus, espaçamentos, ícones e organização dos elementos na tela.

No projeto UPA, UX e UI foram fundamentais para transformar a experiência acadêmica em algo mais claro, moderno e intuitivo. O foco não foi apenas criar funcionalidades, mas reorganizar a forma como elas são apresentadas ao usuário.

O dashboard, por exemplo, foi planejado para responder rapidamente ao que o aluno precisa saber, exibindo média, faltas, avisos, pendências financeiras, agenda e eventos em uma única tela.

## 2.12 Responsividade

Responsividade é a capacidade de uma aplicação adaptar sua interface automaticamente a diferentes tamanhos de tela e dispositivos. Uma aplicação responsiva deve funcionar adequadamente em desktops, notebooks, tablets e smartphones.

Esse conceito é especialmente importante em sistemas acadêmicos, pois estudantes podem acessar informações por meio de diferentes dispositivos, muitas vezes utilizando apenas o celular.

No UPA, a responsividade foi implementada por meio de CSS moderno, utilizando media queries, grid, flexbox, sidebar adaptável, menu mobile e componentes fluidos. O objetivo é garantir que o portal possa ser utilizado de forma confortável em diferentes resoluções.

## 2.13 Acessibilidade Digital

A acessibilidade digital busca garantir que sistemas possam ser utilizados por pessoas com diferentes limitações físicas, cognitivas ou sensoriais. Entre as práticas associadas à acessibilidade, destacam-se contraste adequado, navegação por teclado, textos compreensíveis, organização semântica e compatibilidade com tecnologias assistivas.

No contexto educacional, a acessibilidade possui grande relevância, pois instituições de ensino atendem públicos diversos e devem buscar inclusão digital.

No UPA, foram adotadas práticas como contraste visual, foco visível em elementos interativos, botões com área adequada de clique, organização clara dos componentes, textos objetivos e estrutura de navegação simplificada. Essas decisões contribuem para tornar o sistema mais inclusivo e fácil de utilizar.

## 2.14 Arquitetura Moderna de Aplicações Web

A arquitetura moderna de aplicações web prioriza organização, separação de responsabilidades, escalabilidade e manutenção simplificada. Uma das abordagens mais utilizadas é a separação entre front-end e back-end.

Nessa estrutura, o front-end é responsável pela interface e interação com o usuário, enquanto o back-end concentra regras de negócio, autenticação, persistência de dados e disponibilização de APIs.

No UPA, essa separação foi aplicada por meio de um front-end em React e um back-end em Django. A comunicação entre as camadas ocorre por meio de API REST. Essa arquitetura contribui para maior flexibilidade, pois permite que a interface evolua independentemente do servidor.

Além disso, a componentização no front-end permite reutilizar elementos como botões, cards, alertas, badges, campos de formulário, sidebar e navbar, reduzindo duplicação de código e facilitando padronização visual.

## 2.15 Metodologias Ágeis

Metodologias ágeis são abordagens de desenvolvimento de software que priorizam entregas incrementais, adaptação contínua, organização de tarefas e melhoria progressiva do produto.

O Scrum é uma metodologia ágil baseada em sprints, que são ciclos curtos de desenvolvimento com objetivos definidos. Já o Kanban é utilizado para organização visual das tarefas, permitindo acompanhar o progresso do projeto.

No desenvolvimento do UPA, o trabalho foi organizado em etapas incrementais, incluindo planejamento, desenvolvimento do front-end, criação do back-end, autenticação, dashboard, módulos acadêmicos, área do professor, painel administrativo, refinamento visual, testes e documentação.

Essa abordagem permitiu evolução gradual do sistema e facilitou a correção de problemas encontrados durante a implementação.

## 2.16 Considerações sobre a Fundamentação Teórica

Os conceitos apresentados nesta seção demonstram que o projeto UPA está fundamentado em práticas e tecnologias atuais do desenvolvimento web. A combinação entre React, Django, Django REST Framework, API REST, autenticação JWT, SQLite, componentização, responsividade e acessibilidade permite construir uma aplicação organizada, funcional e preparada para evolução futura.

Além disso, os princípios de UX/UI aplicados ao projeto reforçam a importância de não apenas disponibilizar funcionalidades, mas apresentá-las de forma clara, eficiente e centrada no usuário.

Dessa forma, a fundamentação teórica sustenta as escolhas técnicas e metodológicas adotadas no desenvolvimento do UPA — Upgrade Portal Acadêmico.

# 3. Levantamento de Requisitos

## 3.1 Visão Geral dos Requisitos

O levantamento de requisitos representa uma das etapas mais importantes do desenvolvimento de software, sendo responsável por definir as funcionalidades, restrições, comportamentos e características esperadas da aplicação.

Os requisitos permitem estabelecer de forma estruturada:

- Objetivos funcionais;
- Necessidades dos usuários;
- Regras operacionais;
- Critérios técnicos;
- Limitações do sistema.

No projeto UPA — Upgrade Portal Acadêmico, os requisitos foram definidos com base nas dificuldades identificadas em portais acadêmicos tradicionais, priorizando:

- Usabilidade;
- Acessibilidade;
- Organização da informação;
- Modernização visual;
- Eficiência operacional;
- Responsividade;
- Experiência do usuário.

Os requisitos foram divididos em:

- Requisitos Funcionais;
- Requisitos Não Funcionais;
- Regras de Negócio.

## 3.2 Requisitos Funcionais

Os requisitos funcionais definem as funcionalidades que o sistema deverá executar.

### RF01 — Autenticação de Usuários

O sistema deverá permitir autenticação de usuários por meio de login institucional.

### RF02 — Recuperação de Senha

O sistema deverá permitir recuperação de senha utilizando credenciais institucionais.

### RF03 — Gerenciamento de Sessão

O sistema deverá controlar sessões autenticadas utilizando JWT (JSON Web Token).

### RF04 — Dashboard Acadêmico

O sistema deverá disponibilizar um dashboard acadêmico contendo:

- Média geral;
- Faltas;
- Disciplinas;
- Próximas avaliações;
- Eventos acadêmicos;
- Avisos institucionais.

### RF05 — Visualização de Disciplinas

O sistema deverá permitir a visualização das disciplinas vinculadas ao estudante.

### RF06 — Consulta de Notas

O sistema deverá permitir consulta de notas, desempenho acadêmico e situação nas disciplinas.

### RF07 — Calendário Acadêmico

O sistema deverá disponibilizar calendário acadêmico atualizado contendo:

- Provas;
- Eventos;
- Feriados;
- Períodos de matrícula;
- Comunicados.

### RF08 — Notificações Acadêmicas

O sistema deverá exibir notificações e avisos institucionais.

### RF09 — Perfil do Usuário

O sistema deverá permitir visualização e edição limitada dos dados do perfil.

### RF10 — Sistema de Busca

O sistema deverá possuir mecanismo de busca para facilitar a localização de informações.

### RF11 — Filtros de Conteúdo

O sistema deverá permitir filtragem de informações acadêmicas.

### RF12 — Formulário de Contato

O sistema deverá disponibilizar formulário de contato integrado ao sistema.

### RF13 — Registro em Banco de Dados

As informações enviadas pelo sistema deverão ser armazenadas em banco de dados.

### RF14 — Área Administrativa

O sistema deverá possuir painel administrativo para gerenciamento institucional.

### RF15 — Controle de Permissões

O sistema deverá implementar níveis de acesso distintos conforme perfil do usuário.

### RF16 — Responsividade

O sistema deverá adaptar-se automaticamente a diferentes dispositivos e resoluções.

### RF17 — Alternância de Tema

O sistema deverá permitir alternância entre tema claro e escuro.

### RF18 — Upload de Arquivos

O sistema deverá permitir envio de arquivos acadêmicos autorizados.

### RF19 — Feedback Visual

O sistema deverá fornecer feedback visual durante ações realizadas pelo usuário.

### RF20 — Integração Front-end e Back-end

O sistema deverá realizar comunicação entre interface e servidor por meio de API REST.

## 3.3 Requisitos Não Funcionais

Os requisitos não funcionais definem restrições técnicas, padrões de qualidade e características operacionais do sistema.

### RNF01 — Desempenho

O sistema deverá apresentar carregamento otimizado e baixo tempo de resposta.

### RNF02 — Segurança

O sistema deverá utilizar autenticação segura, proteção de rotas e validação de dados.

### RNF03 — Escalabilidade

A arquitetura deverá permitir expansão futura do sistema.

### RNF04 — Acessibilidade

O sistema deverá seguir práticas baseadas nas diretrizes WCAG.

### RNF05 — Responsividade

A interface deverá funcionar adequadamente em dispositivos móveis e desktops.

### RNF06 — Usabilidade

A navegação deverá ser intuitiva e possuir baixo esforço cognitivo.

### RNF07 — Compatibilidade

O sistema deverá funcionar nos principais navegadores modernos.

### RNF08 — Disponibilidade

O sistema deverá possuir disponibilidade contínua durante sua utilização.

### RNF09 — Organização Modular

O projeto deverá utilizar arquitetura componentizada.

### RNF10 — Manutenibilidade

A estrutura deverá facilitar manutenção e atualização futura.

### RNF11 — Padronização Visual

A interface deverá seguir identidade visual consistente em todas as páginas.

### RNF12 — Persistência de Dados

As informações deverão ser armazenadas em banco de dados SQLite integrado ao Django.

### RNF13 — API REST

A comunicação entre serviços deverá seguir arquitetura REST.

### RNF14 — Versionamento

O projeto deverá utilizar Git e GitHub para controle de versões.

### RNF15 — Hospedagem

O sistema deverá possuir compatibilidade com plataformas modernas de deploy.

## 3.4 Regras de Negócio

As regras de negócio definem restrições e comportamentos específicos da aplicação.

### RN01

Somente usuários autenticados poderão acessar funcionalidades acadêmicas privadas.

### RN02

Cada usuário visualizará apenas informações vinculadas ao próprio perfil.

### RN03

O sistema deverá validar as credenciais antes de iniciar uma sessão.

### RN04

As notificações deverão ser exibidas conforme permissões do usuário.

### RN05

O painel administrativo será acessível apenas para perfis autorizados.

### RN06

O sistema deverá manter consistência visual em todas as páginas.

### RN07

A aplicação deverá priorizar acessibilidade e responsividade como requisitos obrigatórios.

### RN08

Os dados enviados por formulários deverão ser validados antes do armazenamento.

### RN09

O sistema deverá registrar sessões autenticadas de forma segura.

### RN10

A arquitetura deverá permitir futuras integrações acadêmicas.

# 3.5 Atores do Sistema

Os atores representam os usuários que interagem com a aplicação.

### Aluno

Responsável por:

- Acessar informações acadêmicas;
- Consultar notas;
- Visualizar disciplinas;
- Acompanhar calendário;
- Receber notificações;
- Enviar arquivos;
- Atualizar informações permitidas do perfil.

### Administrador

Responsável por:

- Gerenciamento do sistema;
- Controle de usuários;
- Administração institucional;
- Gerenciamento de conteúdos;
- Controle de permissões.

### Coordenação Acadêmica

Responsável por:

- Gerenciamento de avisos;
- Atualização institucional;
- Acompanhamento acadêmico;
- Organização de eventos e comunicados.

## 3.6 Casos de Uso Principais

### CU01 — Realizar Login

Ator: Aluno, Administrador

Fluxo:
1. Usuário informa credenciais.
2. Sistema valida os dados.
3. Sistema cria sessão autenticada.
4. Usuário é direcionado ao dashboard.

### CU02 — Consultar Notas

Ator: Aluno

Fluxo:
1. Usuário acessa a área de notas.
2. Sistema consulta o banco de dados.
3. Sistema exibe notas, faltas e situação acadêmica.

### CU03 — Consultar Calendário

Ator: Aluno

Fluxo:
1. Usuário acessa o calendário.
2. Sistema exibe eventos acadêmicos.
3. Usuário visualiza datas importantes.

### CU04 — Gerenciar Usuários

Ator: Administrador

Fluxo:
1. Administrador acessa o painel.
2. Sistema exibe usuários cadastrados.
3. Administrador realiza alterações autorizadas.

### CU05 — Enviar Arquivos

Ator: Aluno

Fluxo:
1. Usuário seleciona um arquivo.
2. Sistema valida o envio.
3. Arquivo é armazenado no servidor.
4. Sistema confirma o envio.

## 3.7 Considerações Técnicas

O sistema será desenvolvido utilizando:

- React no Front-end;
- Django no Back-end;
- Django REST Framework;
- SQLite;
- API REST;
- Autenticação JWT;
- Componentização;
- Git e GitHub para versionamento.

A arquitetura adotada prioriza:

- Organização modular;
- Escalabilidade;
- Separação de responsabilidades;
- Segurança;
- Acessibilidade;
- Responsividade;
- Facilidade de manutenção.


# 4. Arquitetura do Projeto

## 4.1 Visão Geral da Arquitetura

A arquitetura de software define a organização estrutural da aplicação, estabelecendo a forma como seus componentes são distribuídos, integrados e mantidos ao longo do ciclo de desenvolvimento.

No projeto UPA — Upgrade Portal Acadêmico, foi adotada uma arquitetura moderna baseada em:

- Front-end desacoplado;
- API REST;
- Back-end modular;
- Banco de dados relacional;
- Autenticação baseada em token JWT;
- Componentização;
- Separação em camadas;
- Escalabilidade futura.

Essa abordagem proporciona:

- Melhor organização estrutural;
- Facilidade de manutenção;
- Escalabilidade;
- Reutilização de componentes;
- Maior segurança;
- Melhor desempenho operacional.

## 4.2 Modelo Arquitetural

O sistema segue o modelo Cliente-Servidor dividido em três camadas principais:

1. Camada de Apresentação (Front-end)
2. Camada de Aplicação (Back-end)
3. Camada de Dados (Banco de Dados)
```

---

### Diagrama Geral da Arquitetura

```text
┌──────────────────────────┐
│        Usuário           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      Front-end React     │
│                          │
│ • Dashboard              │
│ • Perfil                 │
│ • Notas                  │
│ • Disciplinas            │
│ • Calendário             │
│ • Arquivos               │
│ • Financeiro             │
│ • Painel Admin           │
└────────────┬─────────────┘
             │ API REST
             ▼
┌──────────────────────────┐
│ Django REST Framework    │
│                          │
│ • JWT                    │
│ • Regras de Negócio      │
│ • Permissões             │
│ • Serializers            │
│ • Endpoints              │
└────────────┬─────────────┘
             │ ORM Django
             ▼
┌──────────────────────────┐
│        SQLite            │
│                          │
│ • Usuários               │
│ • Notas                  │
│ • Disciplinas            │
│ • Eventos                │
│ • Arquivos               │
│ • Notificações           │
└──────────────────────────┘
```
## 4.3 Camada de Apresentação

A camada de apresentação é responsável pela interface visual e interação do usuário com o sistema.

Tecnologias utilizadas:

- React
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

Principais responsabilidades:

- Renderização das páginas;
- Controle de navegação;
- Consumo da API REST;
- Gerenciamento de estados;
- Responsividade;
- Feedback visual;
- Experiência do usuário.

### Estrutura do Front-end

```text
frontend/
│
├── src/
│
├── api/
│   └── axios.js
│
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── ProtectedRoute.jsx
│   └── ui/
│
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
│
├── hooks/
│
├── layouts/
│   └── MainLayout.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Subjects.jsx
│   ├── Grades.jsx
│   ├── Calendar.jsx
│   ├── Notifications.jsx
│   ├── Files.jsx
│   ├── Financial.jsx
│   ├── Contact.jsx
│   ├── AdminPanel.jsx
│   └── Login.jsx
│
├── routes/
│   └── AppRoutes.jsx
│
├── styles/
│
├── App.jsx
│
└── main.jsx
```
## 4.4 Camada de Aplicação

O Back-end é responsável pelo processamento das informações, aplicação das regras de negócio e comunicação com o banco de dados.

Tecnologias utilizadas:

- Python
- Django
- Django REST Framework
- JWT Authentication

Principais responsabilidades:

- Autenticação dos usuários;
- Controle de permissões;
- Processamento das regras acadêmicas;
- Gerenciamento de dados;
- Integração com banco de dados;
- Disponibilização da API REST.

---

### Estrutura do Back-end

```text
backend/
│
├── core/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── accounts/
│
├── academic/
│
├── dashboard/
│
├── notifications_app/
│
├── management_app/
│
├── media/
│
├── db.sqlite3
│
└── manage.py
```

## 4.5 Aplicativos do Sistema

O Back-end foi dividido em módulos independentes para facilitar manutenção e escalabilidade.
```

### Accounts

```text
Responsável por:

• Login
• JWT
• Perfil do usuário
• Recuperação de senha
• Controle de sessão
```

### Academic

```text
Responsável por:

• Disciplinas
• Notas
• Calendário
• Turmas
• Professores
• Horários
```

### Dashboard

```text
Responsável por:

• Resumo acadêmico
• Indicadores
• Estatísticas
• Widgets
```

### Notifications

```text
Responsável por:

• Avisos
• Comunicados
• Eventos
• Estágios
• Notificações acadêmicas
```

### Management

```text
Responsável por:

• Arquivos
• Financeiro
• Contato
• Administração complementar
```

## 4.6 Comunicação entre Front-end e Back-end

A comunicação entre interface e servidor ocorre por meio de API REST utilizando requisições HTTP.

### Métodos Utilizados

```text
GET     → Consultar dados
POST    → Criar registros
PUT     → Atualizar registros
PATCH   → Atualizações parciais
DELETE  → Remover registros
```

---

### Fluxo de Comunicação

```text
React
   │
   ▼
Axios
   │
   ▼
API REST
   │
   ▼
Django REST Framework
   │
   ▼
SQLite
```

---

### Exemplo de Requisição

```http
GET /api/academic/subjects/
Authorization: Bearer TOKEN
```

Resposta:

```json
[
  {
    "id": 1,
    "name": "Banco de Dados",
    "code": "BD001"
  }
]
```

---

## 4.7 Autenticação JWT

O sistema utiliza JSON Web Token (JWT) para autenticação e autorização dos usuários.


Fluxo:

```text
Usuário faz login
        │
        ▼
Django valida credenciais
        │
        ▼
Gera Access Token
Gera Refresh Token
        │
        ▼
React armazena tokens
        │
        ▼
Rotas protegidas liberadas
```

---

### Benefícios do JWT

```text
• Segurança
• Escalabilidade
• Baixo consumo de recursos
• Integração simples com React
• Controle de sessão
```


## 4.8 Controle de Permissões

O sistema implementa níveis de acesso distintos conforme perfil do usuário.


### Aluno

```text
• Dashboard
• Disciplinas
• Notas
• Arquivos
• Calendário
• Perfil
• Financeiro
```

### Professor

```text
• Turmas
• Alunos
• Lançamento de notas
• Arquivos acadêmicos
• Avisos
```

### Administrador

```text
• Gerenciamento completo
• Usuários
• Calendário
• Notificações
• Financeiro
• Administração institucional
```


## 4.9 Banco de Dados

O sistema utiliza SQLite como banco de dados relacional.

A escolha do SQLite foi motivada por:

- Facilidade de configuração;
- Integração nativa com Django;
- Baixo consumo de recursos;
- Simplicidade de manutenção;
- Rapidez no desenvolvimento.

---

### Principais Entidades

```text
User
StudentProfile
TeacherProfile
Subject
Grade
AcademicCalendar
WeeklySchedule
Notification
ContactMessage
AcademicFile
FinancialInvoice
```

## 4.10 Fluxo Geral do Sistema

```text
Usuário
   │
   ▼
Login
   │
   ▼
JWT
   │
   ▼
Dashboard
   │
   ├── Perfil
   ├── Disciplinas
   ├── Notas
   ├── Calendário
   ├── Arquivos
   ├── Financeiro
   ├── Notificações
   └── Contato
```
## 4.11 Padrões Arquiteturais Adotados


### Padrões Utilizados

- Arquitetura Cliente-Servidor;
- API REST;
- Componentização React;
- Organização Modular;
- Separação de Responsabilidades;
- JWT Authentication;
- ORM Django;
- Versionamento Git/GitHub.

# 5. Modelagem do Sistema

## 5.1 Visão Geral da Modelagem

A modelagem do sistema tem como objetivo representar, de forma estruturada, os principais elementos que compõem a aplicação UPA — Upgrade Portal Acadêmico.

Por meio da modelagem, é possível compreender:

* Quais usuários interagem com o sistema;
* Quais funcionalidades cada perfil pode acessar;
* Quais entidades compõem o banco de dados;
* Como os dados se relacionam;
* Como ocorre o fluxo de informações entre módulos;
* Como o sistema garante organização, segurança e escalabilidade.

O UPA foi modelado considerando uma aplicação acadêmica modular, dividida em áreas responsáveis por autenticação, gestão acadêmica, dashboard, notificações, arquivos, financeiro e comunicação institucional.

---

## 5.2 Atores do Sistema

Os atores representam os perfis de usuários que interagem com a aplicação. Cada ator possui permissões e responsabilidades específicas.

### Aluno

O aluno é o principal usuário do sistema. Ele acessa informações acadêmicas e administrativas relacionadas à sua vida estudantil.

Responsabilidades:

* Realizar login;
* Visualizar dashboard acadêmico;
* Consultar perfil;
* Visualizar disciplinas;
* Consultar notas e faltas;
* Acompanhar calendário acadêmico;
* Receber notificações;
* Enviar arquivos acadêmicos;
* Consultar informações financeiras;
* Enviar mensagens pelo formulário de contato.

### Professor

O professor acessa informações relacionadas às turmas, alunos e atividades acadêmicas sob sua responsabilidade.

Responsabilidades:

* Visualizar turmas;
* Consultar alunos;
* Lançar notas;
* Acompanhar disciplinas;
* Enviar materiais acadêmicos;
* Visualizar notificações;
* Utilizar recursos de comunicação acadêmica.

### Administrador

O administrador possui acesso ampliado ao sistema, sendo responsável pelo gerenciamento institucional.

Responsabilidades:

* Gerenciar usuários;
* Acompanhar dados institucionais;
* Gerenciar alunos e professores;
* Administrar disciplinas;
* Controlar eventos acadêmicos;
* Visualizar dados financeiros;
* Acompanhar notificações e mensagens;
* Utilizar o painel administrativo do Django.

---

## 5.3 Diagrama de Casos de Uso

O diagrama de casos de uso representa as principais interações entre os atores e o sistema.

```txt
                          ┌──────────────────────────────┐
                          │             UPA              │
                          │  Upgrade Portal Acadêmico    │
                          └──────────────────────────────┘

        ┌──────────────┐
        │    Aluno     │
        └──────┬───────┘
               │
               ├── Realizar Login
               ├── Recuperar Senha
               ├── Visualizar Dashboard
               ├── Consultar Perfil
               ├── Consultar Disciplinas
               ├── Consultar Notas
               ├── Consultar Calendário
               ├── Visualizar Notificações
               ├── Enviar Arquivos
               ├── Consultar Financeiro
               └── Enviar Mensagem de Contato


        ┌──────────────┐
        │  Professor   │
        └──────┬───────┘
               │
               ├── Realizar Login
               ├── Visualizar Dashboard
               ├── Consultar Turmas
               ├── Consultar Alunos
               ├── Lançar Notas
               ├── Enviar Materiais
               └── Visualizar Notificações


        ┌──────────────┐
        │ Administrador│
        └──────┬───────┘
               │
               ├── Realizar Login
               ├── Gerenciar Usuários
               ├── Gerenciar Alunos
               ├── Gerenciar Professores
               ├── Gerenciar Disciplinas
               ├── Gerenciar Calendário
               ├── Gerenciar Notificações
               ├── Gerenciar Financeiro
               └── Acessar Painel Administrativo
```

---

## 5.4 Diagrama de Classes

O diagrama de classes representa as principais entidades do sistema e seus relacionamentos.

```txt
┌────────────────────┐
│        User        │
├────────────────────┤
│ id                 │
│ username           │
│ email              │
│ first_name         │
│ last_name          │
│ password           │
│ is_staff           │
│ is_superuser       │
└─────────┬──────────┘
          │
          │ 1:1
          ▼
┌────────────────────┐
│   StudentProfile   │
├────────────────────┤
│ id                 │
│ user               │
│ registration       │
│ course             │
│ semester           │
│ cpf                │
│ phone              │
│ address            │
│ mother_name        │
│ father_name        │
│ guardian_name      │
└─────────┬──────────┘
          │
          │ 1:N
          ▼
┌────────────────────┐
│       Grade        │
├────────────────────┤
│ id                 │
│ student            │
│ subject            │
│ grade              │
│ absence            │
│ status             │
│ created_at         │
└─────────┬──────────┘
          │
          │ N:1
          ▼
┌────────────────────┐
│      Subject       │
├────────────────────┤
│ id                 │
│ name               │
│ code               │
│ workload           │
│ professor          │
│ period             │
│ status             │
└─────────┬──────────┘
          │
          │ 1:N
          ▼
┌────────────────────┐
│   WeeklySchedule   │
├────────────────────┤
│ id                 │
│ subject            │
│ teacher            │
│ weekday            │
│ start_time         │
│ end_time           │
│ location           │
└────────────────────┘


┌────────────────────┐
│   TeacherProfile   │
├────────────────────┤
│ id                 │
│ user               │
│ employee_code      │
│ department         │
│ title              │
│ phone              │
└─────────┬──────────┘
          │
          │ 1:N
          ▼
┌────────────────────┐
│     ClassGroup     │
├────────────────────┤
│ id                 │
│ name               │
│ subject            │
│ teacher            │
│ semester           │
│ year               │
└─────────┬──────────┘
          │
          │ 1:N
          ▼
┌────────────────────┐
│  ClassEnrollment   │
├────────────────────┤
│ id                 │
│ class_group        │
│ student            │
└────────────────────┘


┌────────────────────┐
│ AcademicCalendar   │
├────────────────────┤
│ id                 │
│ title              │
│ description        │
│ event_type         │
│ start_date         │
│ end_date           │
│ visible_until      │
└────────────────────┘


┌────────────────────┐
│    Notification    │
├────────────────────┤
│ id                 │
│ user               │
│ title              │
│ message            │
│ notification_type  │
│ is_read            │
│ expires_at         │
│ created_at         │
└────────────────────┘


┌────────────────────┐
│   ContactMessage   │
├────────────────────┤
│ id                 │
│ user               │
│ destination        │
│ contact_type       │
│ return_channel     │
│ subject            │
│ message            │
│ response           │
│ created_at         │
└────────────────────┘


┌────────────────────┐
│    AcademicFile    │
├────────────────────┤
│ id                 │
│ user               │
│ subject            │
│ title              │
│ file_type          │
│ file               │
│ uploaded_at        │
└────────────────────┘


┌────────────────────┐
│  FinancialInvoice  │
├────────────────────┤
│ id                 │
│ user               │
│ description        │
│ amount             │
│ due_date           │
│ status             │
│ payment_method     │
└────────────────────┘
```

---

## 5.5 Modelo Entidade-Relacionamento

O Modelo Entidade-Relacionamento representa as entidades principais do banco de dados e seus vínculos.

```txt
User 1 ─── 1 StudentProfile

User 1 ─── 1 TeacherProfile

StudentProfile 1 ─── N Grade

Subject 1 ─── N Grade

TeacherProfile 1 ─── N ClassGroup

Subject 1 ─── N ClassGroup

ClassGroup 1 ─── N ClassEnrollment

StudentProfile 1 ─── N ClassEnrollment

Subject 1 ─── N WeeklySchedule

TeacherProfile 1 ─── N WeeklySchedule

User 1 ─── N Notification

User 1 ─── N ContactMessage

User 1 ─── N AcademicFile

Subject 1 ─── N AcademicFile

User 1 ─── N FinancialInvoice
```

---

## 5.6 Dicionário de Dados

O dicionário de dados descreve as principais entidades utilizadas no sistema.

### User

Entidade nativa do Django responsável pelo armazenamento dos dados básicos de autenticação.

| Campo        | Tipo     | Descrição                    |
| ------------ | -------- | ---------------------------- |
| id           | inteiro  | Identificador único          |
| username     | texto    | Nome de usuário              |
| email        | texto    | E-mail do usuário            |
| first_name   | texto    | Primeiro nome                |
| last_name    | texto    | Sobrenome                    |
| password     | texto    | Senha criptografada          |
| is_staff     | booleano | Indica acesso administrativo |
| is_superuser | booleano | Indica superusuário          |

### StudentProfile

Entidade responsável por armazenar informações acadêmicas e institucionais do aluno.

| Campo         | Tipo           | Descrição           |
| ------------- | -------------- | ------------------- |
| id            | inteiro        | Identificador único |
| user          | relacionamento | Usuário vinculado   |
| registration  | texto          | Matrícula do aluno  |
| course        | texto          | Curso do aluno      |
| semester      | inteiro        | Período atual       |
| cpf           | texto          | CPF do aluno        |
| phone         | texto          | Telefone            |
| address       | texto          | Endereço            |
| mother_name   | texto          | Nome da mãe         |
| father_name   | texto          | Nome do pai         |
| guardian_name | texto          | Responsável         |

### TeacherProfile

Entidade responsável por armazenar informações do professor.

| Campo         | Tipo           | Descrição           |
| ------------- | -------------- | ------------------- |
| id            | inteiro        | Identificador único |
| user          | relacionamento | Usuário vinculado   |
| employee_code | texto          | Código funcional    |
| department    | texto          | Departamento        |
| title         | texto          | Cargo ou titulação  |
| phone         | texto          | Telefone            |

### Subject

Entidade responsável por representar as disciplinas cadastradas no sistema.

| Campo     | Tipo    | Descrição              |
| --------- | ------- | ---------------------- |
| id        | inteiro | Identificador único    |
| name      | texto   | Nome da disciplina     |
| code      | texto   | Código da disciplina   |
| workload  | inteiro | Carga horária          |
| professor | texto   | Professor responsável  |
| period    | inteiro | Período da disciplina  |
| status    | texto   | Situação da disciplina |

### Grade

Entidade responsável por armazenar notas, faltas e situação acadêmica do aluno.

| Campo      | Tipo           | Descrição                   |
| ---------- | -------------- | --------------------------- |
| id         | inteiro        | Identificador único         |
| student    | relacionamento | Aluno vinculado             |
| subject    | relacionamento | Disciplina vinculada        |
| grade      | decimal        | Nota do aluno               |
| absence    | inteiro        | Quantidade de faltas        |
| status     | texto          | Situação acadêmica          |
| created_at | data/hora      | Data de criação do registro |

### AcademicCalendar

Entidade responsável por armazenar eventos do calendário acadêmico.

| Campo         | Tipo    | Descrição               |
| ------------- | ------- | ----------------------- |
| id            | inteiro | Identificador único     |
| title         | texto   | Título do evento        |
| description   | texto   | Descrição               |
| event_type    | texto   | Tipo do evento          |
| start_date    | data    | Data inicial            |
| end_date      | data    | Data final              |
| visible_until | data    | Data limite de exibição |

### Notification

Entidade responsável por armazenar notificações e comunicados institucionais.

| Campo             | Tipo           | Descrição             |
| ----------------- | -------------- | --------------------- |
| id                | inteiro        | Identificador único   |
| user              | relacionamento | Usuário destinatário  |
| title             | texto          | Título da notificação |
| message           | texto          | Conteúdo da mensagem  |
| notification_type | texto          | Tipo da notificação   |
| is_read           | booleano       | Indica se foi lida    |
| expires_at        | data           | Data de expiração     |
| created_at        | data/hora      | Data de criação       |

### AcademicFile

Entidade responsável por armazenar arquivos acadêmicos.

| Campo       | Tipo           | Descrição                      |
| ----------- | -------------- | ------------------------------ |
| id          | inteiro        | Identificador único            |
| user        | relacionamento | Usuário responsável pelo envio |
| subject     | relacionamento | Disciplina vinculada           |
| title       | texto          | Título do arquivo              |
| file_type   | texto          | Tipo do arquivo                |
| file        | arquivo        | Arquivo enviado                |
| uploaded_at | data/hora      | Data de envio                  |

### FinancialInvoice

Entidade responsável por armazenar informações financeiras do aluno.

| Campo          | Tipo           | Descrição             |
| -------------- | -------------- | --------------------- |
| id             | inteiro        | Identificador único   |
| user           | relacionamento | Usuário vinculado     |
| description    | texto          | Descrição da cobrança |
| amount         | decimal        | Valor                 |
| due_date       | data           | Data de vencimento    |
| status         | texto          | Status do pagamento   |
| payment_method | texto          | Forma de pagamento    |

---

## 5.7 Modelagem do Banco de Dados

O banco de dados utilizado no projeto é o SQLite, integrado ao Django por meio do ORM. Essa escolha facilita o desenvolvimento local, reduz a complexidade de configuração e mantém aderência ao escopo acadêmico do projeto.

O uso do ORM do Django permite representar as entidades do sistema em classes Python, criando automaticamente tabelas, relacionamentos e restrições no banco de dados.

A modelagem foi organizada para permitir:

* Cadastro de usuários;
* Vinculação de perfis acadêmicos;
* Controle de disciplinas;
* Registro de notas e faltas;
* Organização de turmas;
* Calendário acadêmico;
* Notificações;
* Upload de arquivos;
* Mensagens de contato;
* Controle financeiro.

---

## 5.8 Considerações sobre a Modelagem

A modelagem do UPA foi construída com foco em organização, clareza e expansão futura. A separação das entidades em módulos permite que cada área do sistema seja mantida de forma independente, reduzindo acoplamento e facilitando futuras melhorias.

A estrutura proposta permite que o sistema evolua para novos recursos, como:

* Integração com sistemas institucionais reais;
* Relatórios administrativos avançados;
* Notificações em tempo real;
* Aplicativo mobile;
* Integração com calendários externos;
* Expansão do painel administrativo.

Dessa forma, a modelagem adotada atende ao escopo atual do projeto e mantém base adequada para crescimento futuro.

Eu não consigo continuar usando a Lousa nesta conversa porque a ferramenta de edição da Lousa não está disponível para mim neste momento.

Mas podemos continuar exatamente no mesmo formato e estrutura. A próxima seção é:

# Parte 6 — Desenvolvimento do Projeto

Ela será dividida em:

```txt
6.1 Metodologia de Desenvolvimento
6.2 Planejamento das Sprints
6.3 Desenvolvimento do Front-end
6.4 Desenvolvimento do Back-end
6.5 Integração Front-end e Back-end
6.6 Sistema de Autenticação
6.7 Implementação dos Módulos
6.8 Versionamento com Git e GitHub
6.9 Considerações sobre o Desenvolvimento
```

# 6. Desenvolvimento do Projeto

## 6.1 Metodologia de Desenvolvimento

O desenvolvimento do UPA — Upgrade Portal Acadêmico foi conduzido utilizando princípios de metodologias ágeis, permitindo a construção incremental do sistema por meio de etapas organizadas e evolutivas.

A abordagem adotada teve como objetivo facilitar:

* Organização das tarefas;
* Controle da evolução do projeto;
* Correção rápida de problemas;
* Implementação gradual das funcionalidades;
* Validação contínua dos resultados.

Para isso, foram utilizados conceitos inspirados nas metodologias Scrum e Kanban, permitindo a divisão do projeto em etapas menores de desenvolvimento.

O projeto foi construído seguindo um ciclo composto por:

```txt
Planejamento
     ↓
Levantamento de Requisitos
     ↓
Modelagem
     ↓
Desenvolvimento Front-end
     ↓
Desenvolvimento Back-end
     ↓
Integração
     ↓
Testes
     ↓
Documentação
```

Essa estratégia possibilitou maior controle sobre a implementação das funcionalidades acadêmicas, administrativas e financeiras do sistema.

---

## 6.2 Planejamento das Sprints

O desenvolvimento foi dividido em etapas incrementais, chamadas de sprints.

### Sprint 1 — Estrutura Inicial

Objetivos:

* Criação do projeto React;
* Configuração do Django;
* Estruturação do banco de dados;
* Configuração inicial da API.

Entregas:

* Estrutura base do sistema;
* Organização de pastas;
* Configuração do ambiente.

---

### Sprint 2 — Interface do Usuário

Objetivos:

* Desenvolvimento do layout principal;
* Sidebar;
* Navbar;
* Dashboard inicial;
* Sistema de temas.

Entregas:

* Estrutura visual inicial;
* Navegação entre páginas;
* Componentização da interface.

---

### Sprint 3 — Módulos Acadêmicos

Objetivos:

* Perfil;
* Disciplinas;
* Notas;
* Calendário;
* Notificações.

Entregas:

* Área acadêmica funcional;
* Integração inicial com API.

---

### Sprint 4 — Professor e Administração

Objetivos:

* Área do professor;
* Turmas;
* Alunos;
* Lançamento de notas;
* Painel administrativo.

Entregas:

* Controle de permissões;
* Recursos específicos por perfil.

---

### Sprint 5 — Financeiro e Arquivos

Objetivos:

* Financeiro;
* Upload de arquivos;
* Contato institucional.

Entregas:

* Módulos complementares do sistema.

---

### Sprint 6 — Refinamento

Objetivos:

* Melhorias visuais;
* Responsividade;
* Correções;
* Testes.

Entregas:

* Interface final;
* Ajustes de experiência do usuário.

---

## 6.3 Desenvolvimento do Front-end

O Front-end foi desenvolvido utilizando React e Vite.

A escolha dessas tecnologias ocorreu devido à necessidade de construir uma interface moderna, rápida e baseada em componentes reutilizáveis.

A estrutura foi organizada em:

```txt
components/
context/
pages/
styles/
routes/
api/
```

A componentização permitiu reutilização de:

* Botões;
* Cards;
* Alertas;
* Campos de formulário;
* Sidebar;
* Navbar;
* Layouts.

Essa abordagem reduziu duplicação de código e facilitou manutenção futura.

---

## 6.4 Desenvolvimento do Back-end

O Back-end foi desenvolvido utilizando Django e Django REST Framework.

O servidor ficou responsável por:

* Autenticação;
* Controle de permissões;
* Regras acadêmicas;
* Manipulação do banco de dados;
* Disponibilização da API REST.

A estrutura modular foi organizada em aplicações específicas:

```txt
accounts
academic
dashboard
notifications
management
```

Essa divisão facilitou a organização das responsabilidades do sistema.

---

## 6.5 Integração Front-end e Back-end

A comunicação entre as camadas foi realizada por meio de API REST.

Fluxo adotado:

```txt
React
 ↓
Axios
 ↓
API REST
 ↓
Django
 ↓
SQLite
```

As respostas foram retornadas em formato JSON.

Essa arquitetura desacoplada permitiu separar completamente interface e lógica de negócio.

---

## 6.6 Sistema de Autenticação

A autenticação foi implementada utilizando JWT (JSON Web Token).

Fluxo:

```txt
Login
 ↓
Validação
 ↓
Token JWT
 ↓
Armazenamento
 ↓
Rotas Protegidas
```

O sistema possui diferentes perfis:

```txt
Aluno
Professor
Administrador
```

Cada perfil visualiza apenas as funcionalidades autorizadas.

---

## 6.7 Implementação dos Módulos

Os módulos implementados foram:

### Acadêmico

* Dashboard
* Perfil
* Disciplinas
* Notas
* Calendário

### Comunicação

* Notificações
* Contato

### Documentação

* Arquivos acadêmicos

### Financeiro

* Mensalidades
* Pendências
* Histórico financeiro

### Professor

* Turmas
* Alunos
* Notas

### Administração

* Painel administrativo
* Gestão institucional

---

## 6.8 Versionamento com Git e GitHub

O controle de versões foi realizado utilizando Git.

Principais vantagens:

* Histórico de alterações;
* Recuperação de versões;
* Organização do desenvolvimento;
* Publicação do projeto.

O código-fonte foi armazenado em um repositório GitHub para facilitar acompanhamento e evolução futura.

---

## 6.9 Considerações sobre o Desenvolvimento

O desenvolvimento do UPA permitiu aplicar conhecimentos relacionados a:

* Desenvolvimento Front-end;
* Desenvolvimento Back-end;
* Banco de Dados;
* APIs REST;
* UX/UI;
* Responsividade;
* Autenticação;
* Arquitetura de Software;
* Versionamento.

A utilização de React e Django possibilitou a construção de uma aplicação moderna, modular e preparada para futuras expansões.

# 7. Testes e Validação do Sistema

## 7.1 Introdução

A etapa de testes é fundamental no desenvolvimento de software, pois tem como objetivo verificar se as funcionalidades implementadas atendem aos requisitos definidos durante o planejamento do projeto. Além disso, os testes permitem identificar falhas, validar integrações, garantir estabilidade e assegurar que a aplicação ofereça uma experiência adequada aos usuários.

No projeto UPA — Upgrade Portal Acadêmico, os testes foram realizados ao longo do desenvolvimento e também após a conclusão das principais funcionalidades. Foram executados testes funcionais, testes de integração, testes de usabilidade, testes responsivos e testes de autenticação.

O objetivo principal dessa etapa foi garantir que o sistema operasse corretamente em diferentes cenários de utilização, mantendo consistência, segurança e desempenho.

---

## 7.2 Objetivos dos Testes

Os testes realizados tiveram como finalidade:

* Validar os requisitos funcionais;
* Verificar a integração entre Front-end e Back-end;
* Garantir o correto funcionamento da autenticação;
* Validar as permissões dos usuários;
* Confirmar a persistência dos dados;
* Avaliar a experiência do usuário;
* Verificar a responsividade da interface;
* Identificar possíveis erros ou inconsistências;
* Garantir estabilidade da aplicação.

---

## 7.3 Estratégia de Testes

A estratégia adotada consistiu na validação progressiva dos módulos desenvolvidos.

Cada funcionalidade foi testada individualmente antes de ser integrada aos demais módulos do sistema.

O processo seguiu o fluxo:

```txt
Implementação
      ↓
Teste Individual
      ↓
Correção
      ↓
Integração
      ↓
Teste Integrado
      ↓
Validação Final
```

Essa abordagem permitiu detectar problemas em estágios iniciais do desenvolvimento.

---

## 7.4 Ambiente de Testes

Os testes foram executados em ambiente local de desenvolvimento.

Configuração utilizada:

```txt
Sistema Operacional: Windows 10 Pro 64 bits
Processador: Intel Core i3-6100
Memória RAM: 4 GB
Navegador Principal: Google Chrome
Backend: Django
Frontend: React + Vite
Banco de Dados: SQLite
```

O ambiente utilizado representa uma configuração de hardware modesta, permitindo verificar o desempenho da aplicação mesmo em máquinas com recursos limitados.

---

## 7.5 Testes de Autenticação

### Caso de Teste 01 — Login Válido

Objetivo:

Validar o acesso ao sistema utilizando credenciais corretas.

Procedimento:

1. Acessar a tela de login;
2. Informar usuário e senha válidos;
3. Acionar o botão de autenticação.

Resultado Esperado:

O usuário deve ser autenticado e direcionado ao dashboard.

Resultado Obtido:

O sistema autenticou corretamente o usuário e redirecionou para a página inicial.

Status:

Aprovado.

---

### Caso de Teste 02 — Login Inválido

Objetivo:

Verificar comportamento diante de credenciais incorretas.

Procedimento:

1. Inserir usuário inexistente;
2. Inserir senha incorreta;
3. Tentar autenticar.

Resultado Esperado:

O sistema deve impedir o acesso e exibir mensagem de erro.

Resultado Obtido:

O acesso foi bloqueado corretamente.

Status:

Aprovado.

---

### Caso de Teste 03 — Rotas Protegidas

Objetivo:

Verificar proteção das páginas internas.

Procedimento:

1. Tentar acessar uma rota interna sem autenticação.

Resultado Esperado:

Redirecionamento para a tela de login.

Resultado Obtido:

A rota foi bloqueada corretamente.

Status:

Aprovado.

---

## 7.6 Testes do Dashboard

### Caso de Teste 04 — Carregamento do Dashboard

Objetivo:

Verificar a exibição correta das informações principais.

Procedimento:

1. Realizar login;
2. Acessar o dashboard.

Resultado Esperado:

Exibição dos indicadores acadêmicos.

Resultado Obtido:

O dashboard carregou corretamente.

Status:

Aprovado.

---

### Caso de Teste 05 — Navegação pelo Sistema

Objetivo:

Validar a navegação entre módulos.

Procedimento:

1. Acessar os menus disponíveis;
2. Navegar entre páginas.

Resultado Esperado:

As páginas devem ser carregadas corretamente.

Resultado Obtido:

A navegação ocorreu sem falhas.

Status:

Aprovado.

---

## 7.7 Testes do Módulo Acadêmico

### Caso de Teste 06 — Consulta de Disciplinas

Objetivo:

Verificar a exibição das disciplinas cadastradas.

Resultado Esperado:

Listagem correta das disciplinas.

Resultado Obtido:

As disciplinas foram exibidas corretamente.

Status:

Aprovado.

---

### Caso de Teste 07 — Consulta de Notas

Objetivo:

Validar a exibição das notas do aluno.

Resultado Esperado:

Apresentação correta das notas e situação acadêmica.

Resultado Obtido:

As informações foram exibidas corretamente.

Status:

Aprovado.

---

### Caso de Teste 08 — Calendário Acadêmico

Objetivo:

Validar a exibição dos eventos acadêmicos.

Resultado Esperado:

Apresentação dos eventos cadastrados.

Resultado Obtido:

Os eventos foram exibidos corretamente.

Status:

Aprovado.

---

## 7.8 Testes do Módulo Financeiro

### Caso de Teste 09 — Consulta Financeira

Objetivo:

Verificar exibição das cobranças e mensalidades.

Resultado Esperado:

Exibição correta das informações financeiras.

Resultado Obtido:

Os dados foram apresentados corretamente.

Status:

Aprovado.

---

### Caso de Teste 10 — Status de Pagamento

Objetivo:

Validar a identificação visual dos pagamentos.

Resultado Esperado:

Exibição clara dos status:

* Pago;
* Pendente;
* Vencido.

Resultado Obtido:

Os status foram apresentados corretamente.

Status:

Aprovado.

---

## 7.9 Testes do Sistema de Arquivos

### Caso de Teste 11 — Upload de Arquivos

Objetivo:

Validar envio de arquivos acadêmicos.

Resultado Esperado:

Arquivo armazenado com sucesso.

Resultado Obtido:

Upload realizado corretamente.

Status:

Aprovado.

---

### Caso de Teste 12 — Listagem de Arquivos

Objetivo:

Verificar exibição dos arquivos cadastrados.

Resultado Esperado:

Listagem completa dos arquivos.

Resultado Obtido:

Arquivos exibidos corretamente.

Status:

Aprovado.

---

## 7.10 Testes do Sistema de Notificações

### Caso de Teste 13 — Exibição de Notificações

Objetivo:

Validar apresentação dos comunicados.

Resultado Esperado:

Exibição das notificações cadastradas.

Resultado Obtido:

As notificações foram exibidas corretamente.

Status:

Aprovado.

---

## 7.11 Testes Responsivos

A responsividade foi validada em diferentes resoluções de tela.

Dispositivos simulados:

```txt
Desktop
Notebook
Tablet
Smartphone
```

Itens avaliados:

* Sidebar;
* Navbar;
* Dashboard;
* Cards;
* Formulários;
* Tabelas;
* Navegação.

Resultado:

A interface adaptou-se adequadamente às diferentes resoluções testadas.

Status:

Aprovado.

---

## 7.12 Testes de Integração

Os testes de integração tiveram como objetivo verificar a comunicação entre Front-end e Back-end.

Fluxo validado:

```txt
React
 ↓
Axios
 ↓
API REST
 ↓
Django REST Framework
 ↓
SQLite
```

Aspectos avaliados:

* Envio de requisições;
* Recebimento de respostas;
* Manipulação de dados;
* Persistência das informações;
* Tratamento de erros.

Resultado:

A comunicação entre as camadas ocorreu corretamente.

Status:

Aprovado.

---

## 7.13 Testes de Usabilidade

Os testes de usabilidade tiveram como foco avaliar a experiência do usuário.

Aspectos observados:

* Clareza da navegação;
* Organização visual;
* Facilidade de acesso às funcionalidades;
* Consistência da interface;
* Legibilidade das informações.

Resultado:

A interface apresentou navegação intuitiva e estrutura visual organizada, atendendo aos objetivos definidos para o projeto.

Status:

Aprovado.

---

## 7.14 Resultados Obtidos

Após a execução dos testes realizados, observou-se que o sistema apresentou comportamento consistente e compatível com os requisitos definidos durante o desenvolvimento.

Principais resultados:

* Autenticação funcionando corretamente;
* Controle de permissões operacional;
* Dashboard funcional;
* Módulos acadêmicos integrados;
* Sistema financeiro operacional;
* Comunicação entre Front-end e Back-end validada;
* Responsividade implementada;
* Interface moderna e organizada;
* Arquitetura modular funcionando adequadamente.

Os testes demonstraram que a solução desenvolvida atende aos objetivos propostos pelo projeto.

---

## 7.15 Considerações Finais sobre os Testes

A etapa de testes permitiu validar a qualidade e estabilidade do UPA — Upgrade Portal Acadêmico. A realização de testes funcionais, responsivos, de integração e de usabilidade contribuiu para a identificação de melhorias e para a confirmação do correto funcionamento das funcionalidades implementadas.

Os resultados obtidos demonstram que o sistema está apto para utilização em ambiente acadêmico, oferecendo uma experiência mais moderna, organizada e eficiente para alunos, professores e administradores.

Dessa forma, os testes realizados reforçam a viabilidade técnica da solução proposta e comprovam o atendimento aos requisitos estabelecidos durante o desenvolvimento do projeto.

# 8. Conclusão

## 8.1 Considerações Finais

A transformação digital tem modificado significativamente a forma como instituições de ensino superior disponibilizam serviços acadêmicos e administrativos. Nesse contexto, os portais acadêmicos assumem papel fundamental ao centralizar informações, facilitar a comunicação institucional e apoiar o acompanhamento da vida acadêmica dos estudantes.

O presente trabalho teve como objetivo desenvolver o UPA — Upgrade Portal Acadêmico, uma aplicação web moderna voltada à melhoria da experiência acadêmica digital por meio da reorganização das funcionalidades existentes em um ambiente mais intuitivo, acessível e responsivo.

Durante o desenvolvimento do projeto foram aplicados conhecimentos relacionados à engenharia de software, arquitetura de sistemas web, desenvolvimento front-end, desenvolvimento back-end, bancos de dados, APIs REST, autenticação, experiência do usuário e metodologias ágeis.

A utilização do React no front-end e do Django com Django REST Framework no back-end possibilitou a construção de uma arquitetura desacoplada, organizada e preparada para futuras expansões. Além disso, a adoção do JWT para autenticação contribuiu para o controle seguro de acesso aos diferentes perfis do sistema.

O projeto permitiu implementar funcionalidades relevantes para o ambiente acadêmico, incluindo:

* Dashboard acadêmico;
* Perfil do usuário;
* Disciplinas;
* Notas;
* Calendário acadêmico;
* Notificações;
* Arquivos acadêmicos;
* Financeiro;
* Área do professor;
* Painel administrativo;
* Controle de permissões;
* Integração por API REST.

Os testes realizados demonstraram que a aplicação atende aos requisitos definidos durante o levantamento e planejamento do projeto. Foram validados aspectos relacionados à autenticação, navegação, integração entre módulos, responsividade, usabilidade e persistência dos dados.

Além dos resultados técnicos obtidos, o desenvolvimento do UPA proporcionou importante experiência prática na construção de aplicações web modernas, permitindo consolidar conhecimentos adquiridos ao longo da formação acadêmica.

---

## 8.2 Objetivos Alcançados

Os objetivos propostos para o projeto foram atingidos de forma satisfatória.

Entre os principais resultados alcançados destacam-se:

* Modernização da interface acadêmica;
* Melhoria da experiência do usuário;
* Organização das informações institucionais;
* Implementação de arquitetura desacoplada;
* Desenvolvimento de API REST;
* Controle de autenticação e permissões;
* Responsividade para diferentes dispositivos;
* Centralização de funcionalidades acadêmicas;
* Implementação de módulos administrativos e financeiros;
* Aplicação de boas práticas de desenvolvimento.

Esses resultados demonstram que a solução desenvolvida atende às necessidades identificadas durante a análise inicial do problema.

---

## 8.3 Contribuições do Projeto

O UPA contribui para a discussão sobre modernização de sistemas acadêmicos ao demonstrar que melhorias significativas podem ser obtidas não apenas pela criação de novas funcionalidades, mas também pela reorganização da experiência digital oferecida aos usuários.

A proposta desenvolvida evidencia a importância de fatores como:

* Usabilidade;
* Acessibilidade;
* Responsividade;
* Arquitetura da informação;
* Padronização visual;
* Experiência do usuário.

Ao centralizar serviços acadêmicos em uma interface mais intuitiva, o sistema reduz a complexidade operacional e facilita o acesso às informações mais relevantes para alunos, professores e administradores.

---

## 8.4 Limitações do Projeto

Embora os objetivos tenham sido alcançados, algumas limitações foram identificadas durante o desenvolvimento.

Entre elas:

* Utilização de dados simulados em algumas funcionalidades;
* Ausência de integração com sistemas acadêmicos institucionais reais;
* Ausência de integração com serviços externos de pagamento;
* Ausência de notificações em tempo real;
* Ausência de aplicativo mobile nativo;
* Escopo limitado ao contexto acadêmico do projeto.

Essas limitações não comprometem a proposta principal do sistema, mas representam oportunidades para futuras evoluções.

---

## 8.5 Trabalhos Futuros

O projeto foi planejado de forma a permitir crescimento e expansão futura.

Entre as melhorias previstas destacam-se:

* Integração com sistemas institucionais reais;
* Integração com plataformas de pagamento;
* Implementação de notificações em tempo real;
* Aplicativo mobile Android e iOS;
* Sistema de estágio integrado;
* Sistema de monitoria acadêmica;
* Chat institucional;
* Integração com Google Calendar;
* Integração com Microsoft Teams;
* Relatórios acadêmicos avançados;
* Painel analítico com Business Intelligence;
* Integração com Inteligência Artificial para suporte acadêmico.

Essas melhorias podem ampliar significativamente o alcance e a utilidade da plataforma.

---

## 8.6 Consideração Final

O desenvolvimento do UPA — Upgrade Portal Acadêmico demonstrou a viabilidade de utilizar tecnologias modernas para melhorar a experiência acadêmica digital, oferecendo uma solução organizada, responsiva e centrada no usuário.

A combinação entre React, Django, Django REST Framework, SQLite e JWT possibilitou a construção de uma aplicação robusta, modular e preparada para evolução futura.

Dessa forma, conclui-se que os objetivos do projeto foram alcançados, resultando em uma solução capaz de contribuir para a modernização dos serviços acadêmicos e para a melhoria da interação entre estudantes, professores e instituição de ensino.

---

# Referências Bibliográficas

```text
DJANGO SOFTWARE FOUNDATION. Django Documentation.
Disponível em: https://docs.djangoproject.com/

DJANGO REST FRAMEWORK.
Disponível em: https://www.django-rest-framework.org/

META.
React Documentation.
Disponível em: https://react.dev/

MOZILLA FOUNDATION.
MDN Web Docs.
Disponível em: https://developer.mozilla.org/

PRESSMAN, Roger S.
Engenharia de Software.
9. ed. Porto Alegre: AMGH, 2021.

SOMMERVILLE, Ian.
Engenharia de Software.
10. ed. São Paulo: Pearson, 2019.

FIELDING, Roy.
Architectural Styles and the Design of Network-based Software Architectures.
University of California, 2000.

W3C.
Web Content Accessibility Guidelines (WCAG).
Disponível em: https://www.w3.org/WAI/

GIT.
Git Documentation.
Disponível em: https://git-scm.com/doc

GITHUB.
GitHub Documentation.
Disponível em: https://docs.github.com/
```

