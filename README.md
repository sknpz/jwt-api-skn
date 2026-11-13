# Biblioteca JWT: API

API de um sistema de gestão de biblioteca, com login por **access token + refresh token**, perfis de administrador e atendente, cadastro do acervo e controle de empréstimos e devoluções.

Trabalho integrador de Desenvolvimento Back-end e Front-end (ADS, UNIPAR). O enunciado completo está em [`docs/ENUNCIADO.md`](docs/ENUNCIADO.md). O front-end é o [jwt-app-skn](https://github.com/sknpz/jwt-app-skn).

**Stack:** Node.js, Express 5, Sequelize, SQLite, JWT, bcrypt.

## Como rodar

Precisa de Node.js 20 ou superior.

```bash
npm install
cp .envex .env        # no Windows: copy .envex .env
```

Preencha o `JWT_SECRET` no `.env` e inicie:

```bash
npm start
# SERVIDOR RODANDO http://localhost:3001
```

As tabelas e o administrador inicial são criados ao subir a API.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Chave que assina o access token. Use um valor grande e aleatório |
| `PORT` | Não | Porta da API. Padrão: 3000. O `.envex` usa 3001, que é a porta que o front espera |
| `frontend_url` | Não | Origem liberada no CORS |
| `ACCESS_TOKEN_EXPIRES_IN` | Não | Validade do access token. Padrão: `15m`. Use `30s` para ver a renovação automática |
| `ADMIN_NAME`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Não | Dados do administrador inicial |

### Usuários

O seed cria o administrador quando não existe nenhum:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@biblioteca.com` | `123456` |

### Banco de dados

O `database.sqlite` vem no repositório, já com os dados de demonstração: categorias, autores, livros, leitores, um empréstimo no prazo e um atrasado (devolvê-lo gera multa), além do atendente `atendente@biblioteca.com` / `123456`. A API usa esse arquivo direto, sem nenhum passo extra.

Para começar do zero, apague o `database.sqlite` e gere de novo:

```bash
npm run seed:demo
```

O script só roda com o banco sem livros.

### Testar no Postman

Importe [`biblioteca.postman_collection.json`](biblioteca.postman_collection.json). Com a API no ar, a coleção pode rodar inteira e em ordem pelo Runner: cada requisição guarda os ids e tokens que as próximas usam, e cada uma confere o status esperado, inclusive os casos de erro (400, 401, 403, 404 e 409).

## Endpoints

Todas as rotas exigem access token, exceto login e refresh. **(A)** = somente administrador.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/v1/auth/login` | Login, retorna `{ accessToken, refreshToken, user }` |
| POST | `/v1/auth/refresh` | Recebe `{ refreshToken }` e retorna um novo par |
| POST | `/v1/auth/logout` | Recebe `{ refreshToken }` e o revoga |
| GET | `/v1/auth/me` | Usuário logado |
| GET / POST | `/v1/user` | Listar / criar atendente **(A)** |
| GET | `/v1/user/:id`, `/v1/user/email/:email` | Buscar atendente **(A)** |
| PUT | `/v1/user/:id` | Editar atendente **(A)** |
| PATCH | `/v1/user/:id/active` | Ativar ou desativar: `{ active: true }` **(A)** |
| GET | `/v1/categories`, `/v1/categories/:id` | Consultar categorias |
| POST / PUT / DELETE | `/v1/categories`, `/v1/categories/:id` | Escrever categorias **(A)** |
| GET | `/v1/authors`, `/v1/authors/:id` | Consultar autores |
| POST / PUT / DELETE | `/v1/authors`, `/v1/authors/:id` | Escrever autores **(A)** |
| GET | `/v1/books?title=&categoryId=&authorId=&available=true` | Listar livros, com filtros |
| GET | `/v1/books/:id` | Buscar livro |
| POST / PUT / DELETE | `/v1/books`, `/v1/books/:id` | Escrever livros, com `categoryId` e `authorIds` **(A)** |
| GET | `/v1/readers?search=` | Listar leitores, com busca por nome ou CPF |
| GET / POST / PUT | `/v1/readers/:id`, `/v1/readers` | Buscar, cadastrar e editar leitores |
| GET | `/v1/readers/:id/loans` | Histórico do leitor |
| POST | `/v1/loans` | Registrar empréstimo: `{ bookId, readerId }` |
| PATCH | `/v1/loans/:id/return` | Registrar devolução |
| GET | `/v1/loans?status=ATIVO\|ATRASADO\|DEVOLVIDO` | Listar empréstimos |
| GET | `/v1/reports/dashboard` | Totais de livros, ativos, atrasados e multas **(A)** |

Os erros sempre vêm como `{ "error": "mensagem" }`.

## Organização

Cada recurso tem a própria pasta, no padrão `router → controller → service → model`.

```text
auth/      login, refresh, logout, middlewares (authMiddleware, isAdmin), RefreshToken
user/      atendentes e seed do administrador
category/  author/  book/  reader/  loan/  report/
models/    index.js: todas as associações (hasMany, belongsTo, belongsToMany)
utils/     tratamento de erros e datas
scripts/   dados de demonstração
```

## Decisões

**Tabela `logout_list` removida.** Ela guardava access tokens revogados, o que obrigava a consultar o banco em toda requisição e tirava a vantagem do JWT stateless. Agora o logout revoga o refresh token. O access token continua válido até expirar, por no máximo 15 minutos: é a troca aceita em favor de não consultar o banco a cada requisição. Desativar um atendente também revoga as sessões dele.

**Refresh token é uma string aleatória, não um JWT.** O enunciado permite as duas formas. Quem diz se ele vale é a tabela `RefreshToken`, então a assinatura não acrescentaria nada, e por isso `JWT_REFRESH_SECRET` não é usado.

**Detecção de reuso.** Um refresh token revogado que volta a ser usado indica que alguém tem uma cópia dele. Como não dá para saber quem é o dono legítimo, todas as sessões daquele usuário são revogadas. A revogação usa `WHERE revoked = false`, então duas requisições simultâneas com o mesmo token não conseguem rotacioná-lo duas vezes.

**`ATRASADO` é calculado, não gravado.** No banco, um empréstimo em aberto fica como `ATIVO`, e um getter no model devolve `ATRASADO` quando o prazo venceu. Assim nenhum processo precisa atualizar as linhas quando o prazo vence. Os filtros usam a mesma regra.

**`availableCopies` não vem do cliente.** Ele nasce igual ao total e só muda por empréstimo, devolução ou pela diferença ao editar o total, que não pode ficar abaixo do que está emprestado.

**Transações em modo `IMMEDIATE`.** Empréstimo e devolução rodam em `db.transaction`. No SQLite, duas transações que leem e depois escrevem ao mesmo tempo podem falhar com "database is locked". Começar já com a trava de escrita evita isso e garante que dois empréstimos simultâneos não levem o último exemplar.

**Livro com qualquer empréstimo não pode ser excluído.** O enunciado fala em vínculos ativos, mas excluir um livro devolvido apagaria o histórico do leitor.
