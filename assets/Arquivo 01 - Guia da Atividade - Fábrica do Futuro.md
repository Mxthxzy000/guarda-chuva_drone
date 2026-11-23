**PROJETO INTEGRADOR — FÁBRICA DO FUTURO** 

**Guia da atividade · Desenvolvimento de Sistemas e Multimídia** 

**1\. A atividade** 

Sua equipe trabalha como um time de desenvolvimento contratado pela empresa fictícia Fábrica do Futuro. A  empresa recebe pedidos de clientes que querem criar produtos tecnológicos que ainda não existem e repassa cada  pedido a uma equipe. 

Cada equipe escolhe um projeto do catálogo (Arquivo 02), lê o e-mail do cliente e, em um dia de trabalho, entrega  o produto documentado, testado, prototipado e com o site funcionando. No dia seguinte de aula, apresenta tudo ao  cliente. 

| Item  | Definição |
| :---- | :---- |
| Equipes  | 6 integrantes: 2 do DS A, 2 do DS B e 2 de Multimídia |
| Desenvolvimento  | 1 dia: 23/11/2026 |
| Apresentação  | 1 dia: 27/11/2026, até 15 minutos por equipe, com perguntas do professor |
| Site  | Web, com banco de dados real: Supabase ou PHP com MySQL (phpMyAdmin) |

**2\. Regras** 

**1\.** Cada projeto do catálogo pode ser escolhido por uma única equipe. A escolha é registrada com o professor no  início do dia de desenvolvimento. 

**2\.** O nome do catálogo é provisório. O nome comercial é criado pela equipe. 

**3\.** Todo produto é um dispositivo inteligente (IoT). O dispositivo é representado pelo modelo 3D ou pelo circuito  no Wokwi e pela imagem gerada por IA. O site não precisa receber dados do dispositivo nesta versão. **4\.** Todos os integrantes participam da apresentação e respondem às perguntas do professor. **5\.** Quem testa uma página não é quem a desenvolveu. 

**6\.** Senhas, tokens e chaves não podem ser publicados no GitHub. 

**3\. Composição e papéis** 

| Turma  | Alunos  | Papel  | Responsabilidades  | Nos testes |
| :---- | :---- | :---- | :---- | :---- |
| DS A  | 2  | Back-end e banco de  dados | Banco, Cadastro, Login, Redefinição de  senha e Administrador. Levantamento  de requisitos e diagrama de caso de uso. | Executam os casos  de teste da   Funcionalidade. |
| DS B  | 2  | Front-end e   Funcionalidade | Página de Funcionalidade, aplicação do  layout do Figma no site e repositório no  GitHub. Planejamento do MVP e plano  de futuro. | Executam os casos  de teste de Cadastro,  Login, Redefinição  e Administrador. |
| Multimídia  | 2  | Design e produto  | Identidade visual, protótipo no Figma,  modelo 3D, imagem gerada por IA e  apresentação no Canva. Concepção do  projeto. | Revisam a   identidade visual   aplicada no site e na  apresentação. |

Os papéis organizam o trabalho, mas a equipe é uma só: todos ajudam onde for preciso para entregar no prazo.

Fábrica do Futuro — Guia da atividade Página 1   
**4\. Cronograma** 

| Dia  | O que acontece |
| :---- | :---- |
| Dia 1  23/11/2026 | Desenvolvimento. Escolher o projeto, ler o e-mail, dividir as tarefas e produzir os 6  entregáveis. Ao final do dia, enviar os PDFs e os links. |
| Dia 2  27/11/2026 | Apresentações. Cada equipe tem até 15 minutos, incluindo as perguntas do professor. |

**Sugestão de ritmo para o Dia 1** 

| Momento  | Tarefas |
| :---- | :---- |
| Início  | Escolher o projeto e ler o e-mail juntos. Definir o nome do produto e as funcionalidades  do MVP. Dividir os papéis. |
| Primeira metade  | DS A: banco, Cadastro e Login. DS B: repositório e estrutura do site. Multimídia:  identidade visual e telas no Figma. |
| Segunda metade  | DS A: Redefinição de senha e Administrador. DS B: Funcionalidade e layout.  Multimídia: modelo 3D, imagem por IA e Canva. |
| Final  | Executar os 5 casos de teste com evidências. Fechar a documentação. Gerar os PDFs e  conferir todos os links. |

O dia é curto. Façam primeiro o que é obrigatório e funcione de verdade. Ideias extras entram no Plano de futuro da  documentação. 

**5\. Entregáveis** 

| Nº  | Entregável  | Formato  | Observação |
| :---- | :---- | :---- | ----- |
| 1  | Documentação do projeto  | PDF  | Feito a partir do Arquivo 04 |
| 2  | Casos de teste  | PDF, um caso por página  | Feito a partir do Arquivo 05 |
| 3  | Protótipo das telas  | Link do Figma  | As 5 páginas obrigatórias |
| 4  | Modelo 3D e imagem gerada por IA  | Link do Tinkercad ou Wokwi \+  imagem | Produto físico e produto em uso |
| 5  | Site desenvolvido  | Link do repositório no GitHub  | As 5 páginas funcionando |
| 6  | Apresentação  | Link do Canva  | 7 slides |

**5.1 Documentação do projeto (PDF)** 

Um único PDF, feito a partir do modelo do Arquivo 04, com:

| Seção  | Conteúdo |
| :---- | :---- |
| Levantamento de requisitos  | Requisitos funcionais das 5 páginas, com critério de aceitação, e requisitos não  funcionais. |
| Concepção do projeto  | Problema, público-alvo, solução, como o produto funciona e diferencial. |
| Planejamento do MVP  | Funcionalidades do MVP e o que é preciso para desenvolvê-lo: recursos  financeiros, marketing, materiais e equipe. |
| Diagrama de caso de uso  | Atores, casos de uso, relacionamentos e limite do sistema. |
| Identidade visual  | Nome, conceito, logotipo, uma variação do logotipo, paleta de cores e  tipografia. |
| Plano de futuro  | Como o produto pode escalar e alcançar cada vez mais pessoas, em curto,  médio e longo prazo. |

Fábrica do Futuro — Guia da atividade Página 2   
**5.2 Casos de teste (PDF)** 

Um PDF feito a partir do modelo do Arquivo 05, com um caso de teste por página. Os 5 casos de cada projeto já  vêm escritos no catálogo; a equipe copia, executa e preenche os campos do Tester. 

| CT  | Página  | O que verifica |
| :---- | :---- | :---- |
| CT-01  | Cadastro  | O usuário é gravado no banco, com senha em hash. |
| CT-02  | Login  | Senha errada é recusada; a correta dá acesso. |
| CT-03  | Redefinição de senha  | E-mail cadastrado recebe a confirmação; e-mail desconhecido é  avisado. |
| CT-04  | Administrador  | O admin cadastra, edita e exclui; o usuário comum não entra. |
| CT-05  | Funcionalidade  | A ação principal do produto grava e exibe os dados. |

| Status  | Quando usar |
| :---- | :---- |
| Aprovado  | O resultado obtido é igual ao esperado. |
| Reprovado  | O resultado obtido é diferente do esperado. Descrevam o defeito nas observações. |
| Bloqueado  | Não foi possível executar o teste. Expliquem o motivo nas observações. |

Cada caso tem uma evidência: a captura de tela tirada logo depois de executar o passo a passo. Um caso reprovado  não tira pontos por si só; o que conta é o teste ter sido executado e registrado com honestidade. 

**5.3 Protótipo no Figma** 

Uma tela para cada página obrigatória: Cadastro, Login, Redefinição de senha, Administrador e Funcionalidade,  com a identidade visual do produto. O link de visualização vai na documentação. 

**5.4 Modelo 3D e imagem gerada por IA** 

• Modelo 3D do produto físico no Tinkercad, ou o circuito do dispositivo no Wokwi, com os componentes  sugeridos no catálogo. 

• Uma imagem gerada por IA mostrando o produto sendo usado no mundo real. Informem a ferramenta usada  e o comando (prompt) na documentação. 

**5.5 Site desenvolvido** 

O site tem as 5 páginas abaixo, funcionando com banco de dados real. O usuário comum não acessa a página de  Administrador.

| Página  | O que deve ter |
| :---- | :---- |
| Cadastro  | Registra o usuário no banco de dados. A senha é gravada com hash. |
| Login  | Autenticação real, conferida no banco de dados. A tela de login pode ser a página  inicial. |
| Redefinição de senha  | O usuário informa o e-mail cadastrado e recebe a confirmação do envio das  instruções. |
| Administrador  | Área restrita ao administrador para gerenciar o cadastro principal do projeto. |
| Funcionalidade  | Tela em que o usuário faz a ação principal do produto. Está descrita no catálogo de  cada projeto. |

|  | Opção A: Supabase  | Opção B: PHP com MySQL |
| :---- | :---- | :---- |
| **Banco**  | Tabelas criadas no painel do Supabase.  | Banco criado no phpMyAdmin (XAMPP). |
| **Login**  | Autenticação do próprio Supabase.  | Tabela de usuários, password\_hash e sessão. |

Fábrica do Futuro — Guia da atividade Página 3 

|  | Opção A: Supabase  | Opção B: PHP com MySQL |
| :---- | :---- | :---- |
| **Redefinição de   senha** | Envio de e-mail do próprio Supabase.  | Pode ser simulada: o sistema confere o e mail, registra o pedido e mostra a   confirmação. |

A entrega é o link do repositório no GitHub, com um README curto: nome do produto, integrantes, como rodar e  um usuário administrador de teste. Arquivos com senhas ou chaves ficam fora do repositório. 

**5.6 Apresentação no Canva** 

Exatamente sete slides, com linguagem comercial e a identidade visual do produto: 

| Nº  | Slide  | Conteúdo |
| :---- | :---- | :---- |
| 1  | Capa  | Nome comercial, identidade visual e apresentação do produto. |
| 2  | Missão, visão e valores  | O propósito da marca em três blocos curtos. |
| 3  | Problemática  | O problema que o produto resolve. |
| 4  | Solução  | Funcionamento, diferenciais e funcionalidades. |
| 5  | Viabilidade comercial  | Custo de produção, preço de venda e cálculo do ROI. |
| 6  | CTA  | Chamada para ação: conhecer, testar ou comprar. |
| 7  | Slide livre  | Conteúdo complementar escolhido pela equipe. |

**Cálculo do ROI:** ROI \= (receita − custo) ÷ custo × 100\. Exemplo: custo de R\$ 400 e preço de R\$ 700 dão ROI \=  (700 − 400\) ÷ 400 × 100 \= 75%. 

**6\. Os 15 minutos da apresentação** 

| Tempo  | O que fazer |
| :---- | :---- |
| Até 7 minutos  | Apresentar os 7 slides do Canva. |
| Até 3 minutos  | Mostrar o site funcionando: cadastro, login e a página de Funcionalidade. Mostrar o  modelo 3D e a imagem gerada por IA. |
| O restante  | Perguntas do professor. Qualquer integrante pode ser chamado a responder sobre  qualquer parte do projeto. |

**7\. Critérios de avaliação** 

A pontuação de cada critério é informada pelo professor.

| Critério  | O que é verificado |
| :---- | :---- |
| Site  | As 5 páginas funcionando com banco de dados real, login e acesso restrito ao  administrador. |
| Documentação  | As 6 seções preenchidas com clareza e coerentes com o produto. |
| Casos de teste  | Os 5 casos executados, um por página, com status, evidência e observações. |
| Figma, modelo 3D e imagem por  IA | Telas coerentes com o site e produto físico bem representado. |
| Identidade visual  | Marca aplicada de forma consistente no site, no Figma e na apresentação. |
| Apresentação e perguntas  | Sete slides, ROI calculado, demonstração dentro do tempo e domínio do projeto  por todos. |

Fábrica do Futuro — Guia da atividade Página 4   
**8\. Arquivos de apoio** 

Arquivo 02: catálogo dos 16 projetos, com o e-mail do cliente, a ficha e os 5 casos de teste. Arquivo 03: exemplo  completo com todos os entregáveis. Arquivo 04: modelo da documentação do projeto. Arquivo 05: modelo dos  casos de teste. Os modelos são preenchidos e exportados em PDF.