# Relatório do Projeto ELAB

**Instituição:** Instituto Federal de Educação, Ciência e Tecnologia de Minas Gerais, Campus Sabará
**Disciplina:** Programação Web II (Trabalho Interdisciplinar)
**Integrantes:** Caio Vitor, David Rodrigues, Jonathan Alexandre, Igor Barbosa, Isabelle Pascini e Mateus Batista
**Data deste relatório:** 29/09/2026

---

## 1. Sumário executivo

O ELAB é um portal web voltado a mulheres na área da tecnologia, com o objetivo de conectá-las a oportunidades nesta profissão. Esta versão implementa o fluxo de navegação definido no documento "Projeto Inicial de Navegação": entrada na plataforma (login e cadastro), feed, perfil e edição de perfil, vagas de emprego e demais oportunidades, cada uma com página de detalhes, candidatura ou inscrição e confirmação.

O sistema é composto por um backend em Node.js e Express, que expõe uma API REST com autenticação JWT, e por um frontend em HTML, CSS e JavaScript puros, servido pelo próprio backend. Os dados são mantidos em memória, sem banco de dados, conforme a decisão do grupo para esta etapa. A estrutura em camadas do backend permite migrar para PostgreSQL reescrevendo apenas os repositories.

Estado atual: o fluxo principal funciona de ponta a ponta. As áreas de comunidade e de mentoria, previstas nas propostas do projeto, ainda não foram implementadas.

## 2. Contexto e objetivos

### 2.1 Propostas do projeto

O documento de navegação define três propostas para o portal:

| Proposta | Descrição no documento | Situação nesta versão |
| --- | --- | --- |
| Oportunidades | Empregos, projetos, bolsas de estudo e outras oportunidades na área da tecnologia. | Implementada para vagas, eventos, palestras e bolsas. |
| Comunidade | Conexão e compartilhamento de experiências entre mulheres nesta profissão. | Não implementada. |
| Crescimento | Conteúdo, palestras, eventos e acesso a mentoria. | Parcial: palestras e eventos existem como oportunidades. Conteúdo e mentoria não. |

### 2.2 Objetivos desta etapa

1. Construir o frontend no estilo visual e na estrutura de navegação do documento.
2. Conectar o frontend ao backend já existente.
3. Dispensar banco de dados, usando dados mockados em memória.
4. Manter a possibilidade de adotar PostgreSQL futuramente.

## 3. Fluxo de navegação implementado

O diagrama do documento foi seguido integralmente.

```
Pagina Inicial
  |-- Entrar ---------> Login ----------\
  |                                       +--> Feed ELAB
  |-- Cadastrar ------> Cadastro --------/       |
                                                 |-- Perfil ------------> Editar Perfil
                                                 |-- Vagas e Empregos --> Detalhes da vaga --> Candidatura --> Confirmação
                                                 |-- Oportunidades -----> Detalhes --> Inscrição ----------> Confirmação
```

Correspondência entre os nós do diagrama e os arquivos:

| Nó do diagrama | Arquivo |
| --- | --- |
| Página Inicial | `index.html` |
| Login | `login.html` |
| Cadastro | `registro.html` |
| Feed ELAB | `feed.html` |
| Perfil | `perfil.html` |
| Editar Perfil | `editar-perfil.html` |
| Vagas e Empregos | `vagas.html` |
| Oportunidades | `oportunidades.html` |
| Detalhes da vaga e da oportunidade | `detalhe.html?id=` (página única) |
| Candidatura e Inscrição | `inscricao.html?id=` (página única) |
| Confirmação (das duas trilhas) | `confirmacao.html` (página única) |

Há ainda uma página fora do diagrama original, `painel-empresa.html`, necessária porque o backend já previa contas de empresa que publicam oportunidades.

## 4. Arquitetura

### 4.1 Visão geral

```
Navegador  <--HTTP-->  Express (backend/server.js)
                         |-- arquivos estáticos: frontend/
                         |-- /api/v1/auth, /oportunidades, /perfil
                                 |
                          rota -> controller -> service -> repository -> arrays em memória
```

O Express serve a pasta `frontend/` e a API na mesma origem. Com isso, o navegador não faz requisições entre origens diferentes e o CORS não é exercitado.

### 4.2 Camadas do backend

| Camada | Responsabilidade |
| --- | --- |
| `routes/` | Define os caminhos, aplica validação (express-validator), autenticação e permissão por tipo de conta. |
| `controllers/` | Lê a requisição, chama o service e formata a resposta. |
| `services/` | Regras de negócio (por exemplo, impedir inscrição duplicada, gerar hash de senha, emitir token). |
| `repositories/` | Acesso aos dados. Hoje, arrays em memória. |
| `middlewares/` | Autenticação, controle de permissão, validação, limite de tentativas e tratamento central de erros. |
| `utils/` | `ApiError` (erro previsto com código HTTP), `asyncHandler` (encaminha erros de funções assíncronas) e `response` (formato padrão de sucesso). |
| `config/` | Leitura e validação das variáveis de ambiente. |

### 4.3 Estrutura de arquivos

```
ELAB/
  backend/
    server.js
    package.json
    .env.example
    src/
      config/          env.js, db.js
      controllers/     auth.controller.js, oportunidades.controller.js, perfil.controller.js
      middlewares/     auth.middleware.js, error.middleware.js, rateLimiter.js, validate.js
      repositories/    usuario.repository.js, oportunidade.repository.js
      routes/          auth.routes.js, oportunidades.routes.js, perfil.routes.js
      services/        auth.service.js, oportunidade.service.js, perfil.service.js
      utils/           ApiError.js, asyncHandler.js, response.js
  frontend/
    css/style.css
    js/app.js
    (12 páginas HTML)
```

### 4.4 Dependências do backend

| Pacote | Versão | Uso |
| --- | --- | --- |
| express | ^4.19.2 | Servidor HTTP e roteamento |
| jsonwebtoken | ^9.0.2 | Emissão e verificação de tokens |
| bcryptjs | ^2.4.3 | Hash de senhas |
| express-validator | ^7.3.2 | Validação e sanitização de entrada |
| express-rate-limit | ^7.5.1 | Limite de tentativas de login e cadastro |
| helmet | ^7.2.0 | Cabeçalhos de segurança, incluindo CSP |
| cors | ^2.8.5 | Política de origens |
| morgan | ^1.11.0 | Log de requisições |
| dotenv | ^16.4.5 | Leitura do arquivo `.env` |
| nodemon (dev) | ^3.1.4 | Reinício automático em desenvolvimento |

## 5. API REST

Base: `/api/v1`. Formato de sucesso: `{ "sucesso": true, "dados": ... }`. Formato de erro: `{ "sucesso": false, "erro": "mensagem" }`.

### 5.1 Endpoints

| Método | Rota | Acesso | Corpo ou parâmetros | Resposta de sucesso |
| --- | --- | --- | --- | --- |
| POST | `/auth/registrar` | Público, com limite de tentativas | `nome`, `email`, `senha` (mínimo 8), `tipo` (`colaboradora` ou `empresa`) | 201 com `id`, `nome`, `email`, `tipo` |
| POST | `/auth/login` | Público, com limite de tentativas | `email`, `senha` | 200 com `token` e `tipo` |
| GET | `/perfil` | Autenticada | nenhum | 200 com `id`, `nome`, `email`, `tipo`, `area`, `cidade`, `bio` |
| PUT | `/perfil` | Autenticada | `nome` (obrigatório, até 80), `area` (até 80), `cidade` (até 80), `bio` (até 500) | 200 com o perfil atualizado |
| GET | `/oportunidades` | Público | consulta opcional: `tipo`, `status` | 200 com lista |
| GET | `/oportunidades/:id` | Público | `id` inteiro positivo | 200 com a oportunidade |
| POST | `/oportunidades` | Empresa | `titulo` (obrigatório, até 120), `tipo` (`vaga`, `evento`, `palestra`, `bolsa`), `descricao` (até 1000), `local` (até 80), `data` (ISO 8601), `habilidades` (lista, até 10) | 201 com a oportunidade criada |
| POST | `/oportunidades/:id/inscricoes` | Colaboradora | `mensagem` opcional (até 500) | 201 com `protocolo` e dados resumidos da oportunidade |
| GET | `/status` | Público | nenhum | 200 com `{ "status": "ELAB API rodando" }` |

Observações:

- Candidatura a vaga e inscrição em evento, palestra ou bolsa usam o mesmo endpoint. O `tipo` da oportunidade define o texto exibido no frontend.
- O status inicial de uma oportunidade criada é `ativo` para vagas e `agendado` para os demais tipos.
- O `POST /auth/registrar` e o `POST /auth/login` normalizam o e-mail antes de gravar e de comparar.

### 5.2 Códigos de erro

| Código | Situação |
| --- | --- |
| 400 | Falha de validação (mensagens concatenadas), por exemplo e-mail inválido ou ID não numérico. |
| 401 | Token ausente, inválido ou expirado; ou e-mail e senha incorretos no login. |
| 403 | Tipo de conta sem permissão para a ação (por exemplo, colaboradora tentando publicar). |
| 404 | Oportunidade ou usuária inexistente; ou rota inexistente. |
| 409 | E-mail já cadastrado; ou inscrição já realizada na mesma oportunidade. |
| 429 | Limite de tentativas de login e cadastro excedido (20 por IP a cada 15 minutos). |
| 500 | Erro interno. A mensagem é genérica e nunca expõe detalhes internos. |

### 5.3 Modelo de dados

Usuária:

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | inteiro | Sequencial |
| `nome` | texto | No cadastro, é a junção de nome e sobrenome |
| `email` | texto | Único |
| `senhaHash` | texto | Nunca é devolvido pela API |
| `tipo` | texto | `colaboradora` ou `empresa` |
| `area`, `cidade`, `bio` | texto | Editáveis pelo perfil |

Oportunidade:

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | inteiro | Sequencial |
| `empresaId`, `empresaNome` | inteiro, texto | Definidos pelo servidor a partir do token |
| `tipo` | texto | `vaga`, `evento`, `palestra` ou `bolsa` |
| `titulo`, `descricao`, `local`, `data` | texto | Data em formato AAAA-MM-DD |
| `habilidades` | lista de textos | Até 10, cada uma limitada a 30 caracteres |
| `status` | texto | `ativo` ou `agendado` |

Inscrição: `id`, `oportunidadeId`, `usuarioId` e `mensagem`. Uma usuária só pode se inscrever uma vez em cada oportunidade.

## 6. Frontend

### 6.1 Organização

- Um único arquivo de estilos, `css/style.css`, e um único arquivo de comportamento, `js/app.js`.
- Cada página HTML é apenas o esqueleto do conteúdo e declara sua identidade em `<body data-page="...">`. O `app.js` lê esse atributo e executa a lógica correspondente.
- Nas páginas logadas, o `app.js` monta a barra superior (logo, busca e avatar) e a aba lateral em volta do conteúdo de `<main>`.

### 6.2 Comportamento comum

| Aspecto | Funcionamento |
| --- | --- |
| Sessão | O token fica em `localStorage` (chave `elab_token`) e é enviado no cabeçalho `Authorization`. |
| Proteção de páginas | Qualquer página fora de `index`, `login` e `registro` redireciona para o login se não houver token. Um `401` da API encerra a sessão e leva ao login. |
| Aba lateral | Recolhida por padrão, apenas com ícones, e expansível pelo botão do topo. A preferência fica em `localStorage` (chave `elab_lateral`). Em telas estreitas, funciona como gaveta. |
| Busca | O campo do topo leva ao feed com `?q=termo`. O filtro é feito no navegador, sobre título, empresa, local e habilidades. |
| Confirmação | O resultado do envio é passado da tela de inscrição para a de confirmação por `sessionStorage` (chave `elab_conf`). |
| Erros | Mensagens da API aparecem no próprio formulário, em região com `role="alert"`. |

### 6.3 Regras por tipo de conta

- Colaboradora: vê o botão "Candidatar-se" ou "Inscrever-se" nos detalhes e acessa a tela de inscrição.
- Empresa: não vê o botão de inscrição, recebe o item "Painel da empresa" no menu e pode publicar oportunidades. Se uma colaboradora abrir o painel da empresa, é redirecionada ao feed.

### 6.4 Identidade visual

A paleta e o estilo seguem os protótipos do documento: fundo rosa muito claro, painéis em rosa e lilás, botões arredondados em rosa, destaque em roxo (cor do logotipo) e lavanda nos espaços reservados. O logotipo `{ELAB}` é composto em texto. As ilustrações dos protótipos foram substituídas por espaços reservados, conforme solicitado.

Medidas de qualidade aplicadas: layout responsivo com ponto de quebra em 820 px, foco de teclado visível, rótulos acessíveis nos controles sem texto e respeito à preferência de movimento reduzido.

### 6.5 Diferenças em relação aos protótipos

| Protótipo | Implementação | Motivo |
| --- | --- | --- |
| Login com "e-mail ou número de celular" | Apenas e-mail | O backend só autentica por e-mail. |
| Cadastro com dia, mês e ano de nascimento | Campos omitidos | O backend não armazena data de nascimento. |
| Cadastro sem escolha de tipo de conta | Campo "Tipo de conta" adicionado | O backend exige `tipo`. |
| Link "Esqueceu sua senha?" | Omitido | Não há endpoint de recuperação. |
| Feed com colunas laterais de cartões | Coluna central de publicações e coluna de destaques | Adaptação ao conteúdo real disponível. |
| Ilustrações | Espaços reservados | Pedido do grupo. |

## 7. Segurança

Medidas presentes:

- Senhas armazenadas com hash bcrypt (custo 10). O hash nunca é devolvido pela API.
- Mensagem de login genérica ("E-mail ou senha inválidos"), para não revelar se um e-mail existe.
- Tokens JWT com validade configurável (padrão de 2 horas) e segredo obrigatório: o servidor não inicia sem `JWT_SECRET`.
- Limite de 20 tentativas de login ou cadastro por IP a cada 15 minutos.
- Validação de todas as entradas no servidor, com limites de tamanho.
- Corpo das requisições limitado a 10 KB.
- Controle de permissão por tipo de conta em cada rota sensível.
- Atualização de perfil por lista explícita de campos (`nome`, `area`, `cidade`, `bio`), o que impede que alguém altere o próprio `tipo`, e-mail ou senha por esse caminho. Foi testado enviando `tipo: "empresa"` no corpo, e o valor foi ignorado.
- `empresaId` e `empresaNome` de uma oportunidade vêm do token, nunca do corpo da requisição.
- `helmet` ativo, com Content Security Policy que só permite scripts do próprio domínio. Por isso o frontend não usa scripts nem manipuladores de evento inline.
- Todo texto vindo do usuário é escapado antes de ser inserido na página, o que previne injeção de HTML e script (XSS).
- Erros inesperados nunca expõem detalhes internos.

Pontos de atenção:

- O token fica em `localStorage`, que é legível por qualquer script da própria página. A combinação de CSP restritiva e escape de saída reduz o risco, mas não o elimina.
- O CORS está aberto (`cors()` sem restrição). Como o frontend é servido pela mesma origem, pode ser restringido sem impacto.
- A CSP padrão do `helmet` inclui `upgrade-insecure-requests`. Em `localhost` isso não causa problema, mas acessar o servidor por endereço de rede local em HTTP pode fazer o navegador tentar carregar os arquivos por HTTPS.
- Não há renovação de token (refresh) nem revogação. Um token permanece válido até expirar.
- Os dados de exemplo só são criados fora de produção, mas a senha `senha12345` é pública. Nunca deve existir em um ambiente real.

## 8. Dados de exemplo

Criados fora de produção (`NODE_ENV` diferente de `production`):

| Conta | E-mail | Tipo |
| --- | --- | --- |
| Tech Sabará | `empresa@elab.com` | Empresa |
| Ana Souza | `colab@elab.com` | Colaboradora |

Senha de ambas: `senha12345`.

Seis oportunidades iniciais, todas publicadas pela empresa de exemplo: três vagas (Dev Front-end Jr., Analista de Dados Jr., Estágio em Back-end), um evento (Workshop de UX), uma palestra (Carreira em Tecnologia) e uma bolsa (Bolsa em Desenvolvimento Web).

Os dados existem apenas na memória do processo. Reiniciar o servidor descarta contas criadas, publicações, inscrições e edições de perfil.

## 9. Execução e configuração

Requisitos: Node.js 18 ou superior e npm.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Acessar `http://localhost:3000`.

Variáveis de ambiente:

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `JWT_SECRET` | Sim | nenhum | Segredo de assinatura dos tokens |
| `PORT` | Não | 3000 | Porta do servidor |
| `JWT_EXPIRES_IN` | Não | 2h | Validade do token |
| `NODE_ENV` | Não | development | Ambiente de execução |
| `DATABASE_URL` | Não | nenhum | Reservada para PostgreSQL. Não é usada hoje. |

Os arquivos `.env` e `node_modules` não devem ser versionados.

## 10. Verificação realizada

O backend foi exercitado por requisições HTTP diretas, cobrindo os seguintes casos, todos com o resultado esperado:

- Entrega de arquivos estáticos do frontend.
- Login das duas contas de exemplo.
- Leitura do perfil autenticado.
- Atualização de perfil, incluindo a tentativa de alterar o `tipo` (ignorada).
- Detalhe de oportunidade existente, inexistente (404) e com ID inválido (400).
- Inscrição bem-sucedida e segunda inscrição na mesma oportunidade (409).
- Criação de oportunidade pela empresa e bloqueio da mesma ação pela colaboradora (403).
- Bloqueio da inscrição feita por conta de empresa (403).
- Cadastro de nova conta.
- Presença dos cabeçalhos de segurança, incluindo a CSP.

O código JavaScript do frontend teve a sintaxe verificada. Não existem testes automatizados, tanto de backend quanto de frontend.

### Problemas encontrados durante a integração

| Problema | Causa | Resolução |
| --- | --- | --- |
| `nodemon: comando não encontrado` | Dependências de desenvolvimento não estavam instaladas na pasta `backend`. | Executar `npm install` dentro de `backend`. |
| Servidor encerrava com "Variável de ambiente obrigatória ausente: JWT_SECRET" | O arquivo `.env` não existia. | Criar `.env` a partir de `.env.example`. |
| Erro "f.elements[k] is undefined" na edição de perfil | A busca pelo formulário retornava o formulário de busca da barra superior, que aparece antes no documento. O mesmo defeito afetava as telas de inscrição e do painel da empresa. | Seletor alterado para `main form` em `editar`, `inscricao` e `empresa`, no `app.js`. |

## 11. Limitações conhecidas

1. Persistência: os dados são perdidos a cada reinício.
2. Comunidade e mentoria, previstas nas propostas, não existem.
3. Não há recuperação de senha nem troca de senha.
4. A empresa não consegue ver quem se candidatou ou se inscreveu nas suas publicações.
5. A colaboradora não tem uma lista das próprias candidaturas e inscrições.
6. A empresa não pode editar ou remover publicações.
7. Não há paginação nas listagens. Para o volume atual, é suficiente.
8. A busca é feita no navegador, sobre a lista completa.
9. O ícone de cada item do menu lateral é um caractere gráfico do sistema, e sua aparência varia conforme o dispositivo.
10. Não há testes automatizados.

## 12. Próximos passos sugeridos

Em ordem aproximada de prioridade:

1. Migrar para PostgreSQL. Reescrever `usuario.repository.js` (funções `criar`, `buscarPorEmail`, `buscarPorId`, `atualizar`) e `oportunidade.repository.js` (funções `listar`, `buscarPorId`, `criar`, `buscarInscricao`, `criarInscricao`), mantendo as mesmas assinaturas e usar o `db.js` para a conexão. Controllers e services permanecem como estão. Criar as tabelas `usuarios`, `oportunidades` e `inscricoes`, e aproveitar o `DATABASE_URL` que já consta no `.env.example`.
2. Adicionar uma área "Minhas candidaturas e inscrições" para a colaboradora e uma lista de inscritas por publicação para a empresa.
3. Permitir editar e encerrar publicações.
4. Implementar recuperação de senha.
5. Construir as áreas de Comunidade e de Mentoria, hoje ausentes.
6. Escrever testes automatizados de API (por exemplo, com Jest e Supertest) para os fluxos listados na seção 10.
7. Substituir os espaços reservados pelas ilustrações do protótipo e os caracteres do menu lateral por ícones em SVG.
8. Antes de qualquer publicação: restringir o CORS, servir por HTTPS, definir `NODE_ENV=production`, gerar um `JWT_SECRET` forte e revisar a estratégia de armazenamento do token.

## 13. Conclusão

A versão atual entrega o fluxo de navegação completo previsto no documento inicial, com um backend organizado em camadas e preparado para trocar os dados em memória por um banco relacional sem alterar a lógica de negócio. As lacunas principais estão nas propostas de comunidade e de crescimento, na persistência de dados e na ausência de testes automatizados, todas listadas com encaminhamento nas seções 11 e 12.
