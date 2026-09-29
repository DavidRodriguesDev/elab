# ELAB

Portal para mulheres na área da tecnologia, criado para conectá-las a oportunidades nesta profissão: vagas de emprego, eventos, palestras e bolsas de estudo.

Trabalho Interdisciplinar de Programação Web II, IFMG Campus Sabará, 2026.

O relatório completo do projeto (arquitetura, decisões, limitações e próximos passos) está em [RELATORIO.md](RELATORIO.md).

## Funcionalidades

- Cadastro e login com dois tipos de conta: colaboradora e empresa.
- Feed com todas as publicações, busca no topo e aba lateral recolhível.
- Listagem de vagas e de oportunidades (eventos, palestras e bolsas), com filtro por tipo.
- Página de detalhes, candidatura a vagas e inscrição em oportunidades, com tela de confirmação.
- Perfil da usuária, com edição de nome, área, cidade e texto sobre si.
- Painel da empresa para publicar vagas e oportunidades.

## Tecnologias

- Backend: Node.js, Express 4, JWT (jsonwebtoken), bcryptjs, express-validator, helmet, cors, morgan e express-rate-limit.
- Frontend: HTML, CSS e JavaScript puros, sem framework e sem etapa de build.
- Dados: em memória (arrays nos repositories). Não é necessário banco de dados.

## Requisitos

- Node.js 18 ou superior
- npm

## Como executar

Todos os comandos abaixo são executados dentro da pasta `backend`.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Depois abra `http://localhost:3000` no navegador. O próprio servidor Express entrega o frontend, então não é preciso subir nada além do backend.

Para executar sem reinício automático, use `npm start`.

### Variáveis de ambiente

Definidas no arquivo `backend/.env` (modelo em `backend/.env.example`).

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `JWT_SECRET` | Sim | nenhum | Chave usada para assinar os tokens. O servidor não inicia sem ela. |
| `PORT` | Não | `3000` | Porta do servidor. |
| `JWT_EXPIRES_IN` | Não | `2h` | Validade do token. |
| `NODE_ENV` | Não | `development` | Com o valor `production`, as contas de exemplo não são criadas. |
| `DATABASE_URL` | Não | nenhum | Reservada para uma futura migração para PostgreSQL. Hoje não é usada. |

Gere uma chave aleatória para o `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Contas de exemplo

Criadas automaticamente fora de produção. A senha de ambas é `senha12345`.

| Tipo | E-mail |
| --- | --- |
| Colaboradora | `colab@elab.com` |
| Empresa | `empresa@elab.com` |

Como os dados ficam em memória, tudo o que for criado durante o uso (contas, publicações, inscrições e alterações de perfil) é perdido quando o servidor reinicia.

## Estrutura do projeto

```
ELAB/
  backend/
    server.js
    package.json
    .env.example
    src/
      config/          env.js, db.js
      controllers/     auth, oportunidades, perfil
      middlewares/     auth, erro, rateLimiter, validate
      repositories/    usuario, oportunidade (dados em memória)
      routes/          auth, oportunidades, perfil
      services/        auth, oportunidade, perfil
      utils/           ApiError, asyncHandler, response
  frontend/
    css/style.css
    js/app.js
    index.html  login.html  registro.html
    feed.html  vagas.html  oportunidades.html  detalhe.html
    inscricao.html  confirmacao.html
    perfil.html  editar-perfil.html  painel-empresa.html
```

O backend segue o fluxo `rota -> controller -> service -> repository`. A troca de dados em memória por PostgreSQL exige reescrever apenas os arquivos de `repositories/`.

## Páginas

| Página | Acesso | Função |
| --- | --- | --- |
| `index.html` | Público | Apresentação do projeto, com links para entrar e cadastrar. |
| `login.html` | Público | Entrada com e-mail e senha. |
| `registro.html` | Público | Criação de conta. Ao concluir, a usuária entra direto no feed. |
| `feed.html` | Logada | Publicações e destaques de eventos e bolsas. Aceita busca por `?q=`. |
| `vagas.html` | Logada | Lista de vagas. |
| `oportunidades.html` | Logada | Eventos, palestras e bolsas, com filtro por tipo. |
| `detalhe.html?id=` | Logada | Detalhes de uma vaga ou oportunidade. |
| `inscricao.html?id=` | Colaboradora | Candidatura ou inscrição, com mensagem opcional. |
| `confirmacao.html` | Colaboradora | Confirmação do envio, com número de protocolo. |
| `perfil.html` | Logada | Dados da conta. |
| `editar-perfil.html` | Logada | Edição do perfil. |
| `painel-empresa.html` | Empresa | Publicação de vagas e oportunidades e lista das publicações da empresa. |

## API

Base: `/api/v1`. Toda resposta segue o formato `{ "sucesso": true, "dados": ... }` ou `{ "sucesso": false, "erro": "mensagem" }`. Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/registrar` | Público | Cria conta. Campos: `nome`, `email`, `senha` (mínimo 8), `tipo` (`colaboradora` ou `empresa`). |
| POST | `/auth/login` | Público | Retorna `token` e `tipo`. |
| GET | `/perfil` | Logada | Dados da usuária autenticada. |
| PUT | `/perfil` | Logada | Atualiza `nome`, `area`, `cidade` e `bio`. |
| GET | `/oportunidades` | Público | Lista. Filtros opcionais: `tipo` e `status`. |
| GET | `/oportunidades/:id` | Público | Detalhes de uma oportunidade. |
| POST | `/oportunidades` | Empresa | Cria vaga, evento, palestra ou bolsa. |
| POST | `/oportunidades/:id/inscricoes` | Colaboradora | Candidatura ou inscrição. Retorna 409 se já existir. |
| GET | `/status` | Público | Verificação de funcionamento da API. |

Os detalhes de cada campo e de cada código de erro estão no [RELATORIO.md](RELATORIO.md).

## Limitações conhecidas

- Os dados são apagados a cada reinício do servidor.
- Não há recuperação de senha.
- O login usa apenas e-mail, sem número de celular.
- As áreas de comunidade e de mentoria, previstas nas propostas do projeto, ainda não foram implementadas.
- O frontend usa espaços reservados no lugar das ilustrações do protótipo.
- Não há testes automatizados.

## Integrantes

Caio Vitor, David Rodrigues, Jonathan Alexandre, Igor Barbosa, Isabelle Pascini e Mateus Batista.

IFMG, Campus Sabará, 2026.
