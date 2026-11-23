**PROJETO INTEGRADOR — FÁBRICA DO FUTURO**

**Catálogo dos 16 projetos**

**Como usar este catálogo**

Este catálogo reúne as 16 solicitações recebidas pela Fábrica do Futuro. Cada equipe escolhe uma, e um projeto escolhido não pode ser escolhido por outra equipe.

Cada projeto traz o e-mail do cliente, uma ficha curta e os 5 casos de teste prontos. A equipe copia os casos para o modelo do Arquivo 05, executa e preenche os campos do Tester.

Os nomes dos projetos são provisórios. O nome comercial é criado pela equipe. Todos os projetos têm o mesmo porte: as mesmas 5 páginas, um cadastro administrativo e uma funcionalidade principal.


**PROJETO 08**

**Guarda-chuva Drone**

Solicitação FF-2026-008 · Cliente: Nimbus Acessórios Urbanos

| De: | Fábrica do Futuro · Gestão de Contas \<projetos@fabricadofuturo.example\> |
| :---- | :---- |
| **Para:** | Equipe de Desenvolvimento de Produto |
| **Data:** | 23 de novembro de 2026 |
| **Assunto:** | **\[FF-2026-008\] Solicitação de desenvolvimento: Guarda-chuva Drone · Nimbus Acessórios Urbanos** |

 

Prezada equipe,

A Nimbus Acessórios Urbanos, empresa do segmento de acessórios urbanos com sede em Porto Alegre/RS, contratou a Fábrica do Futuro para desenvolver um novo produto. Após a reunião com Larissa Prado, Gerente de Novos Negócios, formalizamos a demanda, que passa a ser desta equipe.

**O problema.** Quem anda a pé na chuva precisa segurar o guarda-chuva, o que impede carregar sacolas, empurrar carrinho ou usar o celular. Em dias de vento, o produto se torna inútil.

**O que o cliente precisa.** Um guarda-chuva que voe sozinho acima da pessoa e possa ser chamado por uma plataforma digital. Drone com cobertura retrátil, sensores de distância, chuva e vento. A plataforma permite chamar a cobertura, acompanhar o atendimento e consultar o histórico de uso.

**O produto físico.** O cliente quer ver o dispositivo representado em modelo 3D, no Tinkercad, ou em circuito, no Wokwi, com os componentes previstos: Sensor ultrassônico HC-SR04 (distância até a pessoa, em cm); Potenciômetro (intensidade da chuva, de 0 a 100%); Acelerômetro MPU6050 (inclinação causada pelo vento, em graus); Servo motor (abertura e fechamento da cobertura); LED (indicação de atendimento em andamento). Junto, uma imagem gerada por IA mostrando o produto em uso.

**A plataforma.** Um site com Cadastro, Login, Redefinição de senha, Administrador e a página Chamar Cobertura, que é o centro do produto: a pessoa solicita o drone e acompanha o status do atendimento. Na área do Administrador, o cliente precisa gerenciar estação de recarga.

**Entregáveis.** Documentação do projeto e casos de teste em PDF, protótipo no Figma, modelo 3D com a imagem gerada por IA, site no GitHub e apresentação de sete slides no Canva.

**Prazo e orientações.** “Guarda-chuva Drone” é apenas a identificação interna. Cabe à equipe criar o nome comercial e a identidade visual. O desenvolvimento acontece em 23/11/2026, e a apresentação ao cliente, de até 15 minutos com perguntas, em 27/11/2026.

Contamos com o empenho de todos.

Atenciosamente,

**Marina Duarte**  
Gerente de Contas  
Fábrica do Futuro · Soluções em Produtos Inteligentes

**Ficha do projeto**

| Público-alvo | Pedestres de grandes cidades, pessoas com mobilidade reduzida e shoppings a céu aberto. |
| :---- | :---- |
| **Como o produto funciona** | A pessoa chama a cobertura informando o local e a duração. O drone se posiciona acima da pessoa e mantém a distância. Os sensores medem a chuva e o vento durante o trajeto. Com vento forte, o voo é suspenso e a pessoa é avisada. |
| **Componentes sugeridos para o modelo** | Sensor ultrassônico HC-SR04 (distância até a pessoa, em cm); Potenciômetro (intensidade da chuva, de 0 a 100%); Acelerômetro MPU6050 (inclinação causada pelo vento, em graus); Servo motor (abertura e fechamento da cobertura); LED (indicação de atendimento em andamento) |
| **Página de Funcionalidade** | Chamar Cobertura: A pessoa solicita o drone e acompanha o status do atendimento. |
| **Área do Administrador** | Cadastrar, editar e excluir estação de recarga (nome, endereço e vagas). |
| **Campo extra do Cadastro** | Bairro |
| **Comercialização** | Aluguel por uso em estações espalhadas pela cidade e venda de unidades pessoais. |

 

**Requisitos principais**

| Código | Requisito | Caso de teste |
| :---- | :---- | :---- |
| RF01 | O Cadastro registra nome, e-mail, senha e bairro. | CT-01 |
| RF02 | O Login autentica com e-mail e senha e recusa credenciais erradas. | CT-02 |
| RF03 | A Redefinição de senha confere o e-mail e confirma o envio das instruções. | CT-03 |
| RF04 | O Administrador cadastra, edita e exclui estação de recarga (nome, endereço e vagas). Só o administrador acessa a página. | CT-04 |
| RF05 | Chamar Cobertura: A pessoa solicita o drone e acompanha o status do atendimento. | CT-05 |
| RNF01 | As senhas são gravadas com hash. | CT-01 |
| RNF02 | As telas funcionam em celular e em computador. | Figma e site |

 

**Casos de teste**

Os cinco casos abaixo validam o site deste projeto. Copiem cada um para o modelo do Arquivo 05, em uma página própria. Os campos do Tester estão no modelo e são preenchidos depois da execução.

| CT-01     Cadastro de usuário com dados válidos |  |
| :---- | :---- |
| **ELABORADO PELA FÁBRICA DO FUTURO** |  |
| **Funcionalidade** | Registro de usuários |
| **Página** | Cadastro |
| **Requisito relacionado** | RF01, RNF01 |
| **Objetivo** | Verificar se o cadastro grava o usuário no banco, incluindo o campo Bairro. |
| **Pré-condições** | O e-mail rodrigo.almeida@teste.com ainda não está cadastrado. |
| **Massa de dados** | Nome: Rodrigo Almeida. E-mail: rodrigo.almeida@teste.com. Senha: Teste@123. Bairro: Centro Histórico. |
| **Passo a passo** | 1\. Abrir a página de Cadastro. 2\. Preencher os campos com a massa de dados. 3\. Clicar em Cadastrar. 4\. Abrir a tabela de usuários no banco e localizar o e-mail cadastrado. |
| **Resultado esperado** | A plataforma confirma o cadastro. O banco tem um registro novo com nome, e-mail e Bairro \= Centro Histórico. A senha está gravada como hash, e não como Teste@123. Repetir o cadastro com o mesmo e-mail é recusado. |

 

| CT-02     Login com senha errada e com senha correta |  |
| :---- | :---- |
| **ELABORADO PELA FÁBRICA DO FUTURO** |  |
| **Funcionalidade** | Autenticação |
| **Página** | Login |
| **Requisito relacionado** | RF02 |
| **Objetivo** | Verificar se o login recusa a senha errada e aceita a correta. |
| **Pré-condições** | Usuário do CT-01 cadastrado. Navegador sem sessão iniciada. |
| **Massa de dados** | E-mail: rodrigo.almeida@teste.com. Senha errada: Errada@999. Senha correta: Teste@123. |
| **Passo a passo** | 1\. Abrir a página de Login. 2\. Informar o e-mail com a senha errada e clicar em Entrar. 3\. Observar a mensagem. 4\. Informar o e-mail com a senha correta e clicar em Entrar. |
| **Resultado esperado** | Com a senha errada, o login é recusado com mensagem que não revela qual campo está errado. Com a senha correta, a plataforma abre a área interna identificando Rodrigo Almeida, sem o item Administrador no menu. |

 

| CT-03     Redefinição de senha |  |
| :---- | :---- |
| **ELABORADO PELA FÁBRICA DO FUTURO** |  |
| **Funcionalidade** | Recuperação de acesso |
| **Página** | Redefinição de senha |
| **Requisito relacionado** | RF03 |
| **Objetivo** | Verificar se a redefinição confirma o envio para e-mail cadastrado e avisa quando o e-mail não existe. |
| **Pré-condições** | Usuário do CT-01 cadastrado. Navegador sem sessão iniciada. |
| **Massa de dados** | E-mail não cadastrado: naoexiste@teste.com. E-mail cadastrado: rodrigo.almeida@teste.com. |
| **Passo a passo** | 1\. Abrir a página de Login e clicar em Esqueci minha senha. 2\. Informar naoexiste@teste.com e enviar. 3\. Observar a mensagem. 4\. Informar rodrigo.almeida@teste.com e enviar. |
| **Resultado esperado** | Para o e-mail não cadastrado, a plataforma avisa que o e-mail não foi encontrado. Para rodrigo.almeida@teste.com, confirma que as instruções foram enviadas. No Supabase, o e-mail chega à caixa de entrada; no PHP, o pedido fica registrado no banco. |

 

| CT-04     Administrador: gerenciar estação de recarga e bloquear usuário comum |  |
| :---- | :---- |
| **ELABORADO PELA FÁBRICA DO FUTURO** |  |
| **Funcionalidade** | Gerenciamento de estação de recarga e controle de acesso |
| **Página** | Administrador |
| **Requisito relacionado** | RF04 |
| **Objetivo** | Verificar se o administrador cadastra, edita e exclui estação de recarga e se o usuário comum não acessa a página. |
| **Pré-condições** | Usuário administrador cadastrado. Usuário Rodrigo Almeida do CT-01, que é comum. |
| **Massa de dados** | Nome: Estação Mercado Público. Endereço: Largo Glênio Peres. Vagas: 6\. |
| **Passo a passo** | 1\. Entrar como administrador e abrir a página de Administrador. 2\. Cadastrar com a massa de dados e salvar. 3\. Editar o registro, alterando o número de vagas para 8, e salvar. 4\. Conferir o registro em: lista de estações exibida na página Chamar Cobertura. 5\. Excluir o registro e confirmar. 6\. Sair, entrar como Rodrigo Almeida e digitar na barra de endereço o caminho da página de Administrador. |
| **Resultado esperado** | O registro aparece na lista e em lista de estações exibida na página Chamar Cobertura; a edição é gravada; a exclusão o remove dos dois lugares. Campos obrigatórios (nome, endereço e vagas) vazios são recusados. Logado como usuário comum, a página de Administrador é bloqueada e nenhum dado administrativo aparece. |

 

| CT-05     Chamar Cobertura: ação principal do produto |  |
| :---- | :---- |
| **ELABORADO PELA FÁBRICA DO FUTURO** |  |
| **Funcionalidade** | A pessoa solicita o drone e acompanha o status do atendimento. |
| **Página** | Funcionalidade (Chamar Cobertura) |
| **Requisito relacionado** | RF05 |
| **Objetivo** | Verificar se a ação principal do produto grava e exibe corretamente os dados informados. |
| **Pré-condições** | Login feito como Rodrigo Almeida. |
| **Massa de dados** | Local: Praça da Matriz. Duração: 20 minutos. |
| **Passo a passo** | 1\. Abrir a página Chamar Cobertura. 2\. Informar o local Praça da Matriz e a duração de 20 minutos. 3\. Clicar em Chamar agora. 4\. Conferir o atendimento com o status A caminho na tela e na tabela de atendimentos do banco. |
| **Resultado esperado** | O atendimento é gravado com local, duração, data e status A caminho, vinculado à pessoa logada. Não é possível abrir um segundo atendimento enquanto houver um em andamento. |

