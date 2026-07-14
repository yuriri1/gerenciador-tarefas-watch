# Gerenciador de Tarefas

Esta é uma aplicação Fullstack distribuída e serverless voltada para o gerenciamento colaborativo de tarefas.

---

## Links de Produção

* **Frontend (Vercel):** [https://gerenciador-tarefas-watch.vercel.app/](https://gerenciador-tarefas-watch.vercel.app/)
* **API Backend (AWS):** [https://kfs42pp7k9.execute-api.us-east-1.amazonaws.com](https://kfs42pp7k9.execute-api.us-east-1.amazonaws.com)
* **Documentação Swagger (AWS):** [https://kfs42pp7k9.execute-api.us-east-1.amazonaws.com/docs](https://kfs42pp7k9.execute-api.us-east-1.amazonaws.com/docs)

---

## Estrutura do Repositório

```text
├── backend/            
│   ├── prisma/
│   │     └── schema.prisma  # Schema da modelos do banco de dados
│   ├── src/
│   │    ├── config/         # Código responsável pela conexão ao banco de dados
│   │    ├── functions/      # Código-fonte seguindo *Feature Driven Architecture*
│   │    ├── middleware/     # Middleware responsável por interceptar as chamadas API
│   ├── tests/               # Testes unitários
│   └── serverless.yml       # Arquivo de configuração serverless
└── frontend/           
    ├── src/            
         ├─ components/      # Modulos de interface
         ├─ router/          # Define as rotas da interface
         ├─ services/        # Comunicação com a API
         ├─ stores/          # Gerencia informações entre as entidades
         ├─ views/           # Interface completa da aplicação
```

---

## Execução do Projeto em Ambiente Local (WSL2 / Docker)

### Pré-requisitos

* Node.js v20.x ou superior instalado.
* Docker e Docker Compose instalados.

### 1. Configurando o Banco de Dados Local

Configure um banco de dados PostgreSQL (podendo ser local ou em nuvem)

### 2. Configurando o Backend

1. Instale as dependências:
```bash
npm install

```


2. Crie um arquivo `.env` na raiz da pasta `backend/` com as seguintes variáveis para apontar ao banco local:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres
JWT_SECRET="sua_chave_secreta_local_para_testes"

```


3. Rode as migrações para estruturar o banco de dados:
```bash
npx prisma migrate dev

```


4. Inicie o servidor do backend localmente (simulando a AWS Lambda):
```bash
npx serverless offline

```


*O backend estará rodando em: `http://localhost:3000*`

### 3. Configurando o Frontend

1. Em outro terminal, navegue até a pasta do frontend:
```bash
cd ../frontend

```


2. Instale as dependências:
```bash
npm install

```


3. Crie um arquivo `.env.local` na raiz da pasta `frontend/`:
```env
VITE_API_URL=http://localhost:3000

```


4. Inicie o servidor de desenvolvimento do Vite:
```bash
npm run dev

```


*O frontend estará rodando em: `http://localhost:5173*`

---

## Executando Testes Unitários

O projeto utiliza o framework **Jest** para a validação das regras de negócio do ecossistema. Para rodar a suíte de testes unitários no backend, execute:

```bash
cd backend
npm run test

```

---

## Detalhes de Uso da API (Endpoints Principais)

A API possui segurança por tokens estáticos JWT para rotas privadas. Abaixo estão listadas as principais ações realizáveis (A documentação interativa completa de parâmetros e payloads pode ser testada diretamente na rota `/docs` da AWS):

### Autenticação (`/auth`)

* `POST /auth/register` - Criação de uma nova conta de usuário.
* `POST /auth/login` - Autentica o usuário e retorna o Bearer Token de acesso.
* `GET /auth/profile` - Retorna os dados do perfil logado (Requer Token).

### Projetos e Espaços de Trabalho (`/projects`)

* `POST /projects` - Cria um novo projeto/quadro colaborativo (Requer Token).
* `GET /projects` - Lista os projetos aos quais o usuário tem acesso (Requer Token).
* `POST /projects/{id}/members` - Adiciona um outro usuário como colaborador do projeto (Requer Token).

### Tarefas (`/tasks`)

* `POST /tasks` - Cria uma nova tarefa associando-a a um projeto e categoria (Requer Token).
* `PATCH /tasks/{id}/status` - Atualiza o status de progresso de uma tarefa específica (Mover no Kanban).
* `DELETE /tasks/{id}` - Exclui uma tarefa (Requer Token).

---

*Desafio Técnico desenvolvido para o processo seletivo da Watch Brasil.*