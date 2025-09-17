# API REST e GraphQL - Prova de Automação

## 📋 Descrição

Esta é uma API completa desenvolvida para a prova de graduação em automação. A aplicação implementa tanto endpoints REST quanto GraphQL, com sistema de autenticação JWT e testes automatizados abrangentes.

## 🎯 Pontuação Atendida

- **7 pontos**: Testes automatizados externos (E2E) com Supertest, Mocha e Chai rodando na pipeline
- **1 ponto**: Testes de controller com Sinon
- **1 ponto**: Implementação de testes tanto para REST quanto GraphQL
- **1 ponto**: API nova construída do zero

**Total: 10/10 pontos**

## 🚀 Tecnologias Utilizadas

- **Node.js** com Express.js
- **GraphQL** com Apollo Server
- **JWT** para autenticação
- **Mocha** e **Chai** para testes
- **Supertest** para testes E2E
- **Sinon** para mocks e stubs
- **GitHub Actions** para CI/CD

## 📁 Estrutura do Projeto

```
prova_api/
├── src/
│   ├── controllers/          # Controladores REST
│   ├── middleware/           # Middlewares (auth, etc.)
│   ├── routes/              # Rotas REST
│   ├── graphql/             # Schema e resolvers GraphQL
│   │   ├── typeDefs/        # Definições de tipos
│   │   └── resolvers/       # Resolvers GraphQL
│   ├── config/              # Configurações (database, etc.)
│   ├── utils/               # Utilitários
│   └── server.js            # Servidor principal
├── test/
│   ├── unit/                # Testes unitários
│   │   └── controllers/     # Testes de controllers
│   └── e2e/                 # Testes end-to-end
├── .github/
│   └── workflows/           # Pipeline CI/CD
└── docs/                    # Documentação
```

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repo>
cd prova_api
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp env.example .env
```

Edite o arquivo `.env`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123
JWT_EXPIRES_IN=24h
API_VERSION=v1
```

### 4. Execute a aplicação

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

## 🧪 Executando os Testes

### Todos os testes
```bash
npm test
```

### Testes com coverage
```bash
npm run test:coverage
```

### Testes em modo watch
```bash
npm run test:watch
```

## 📚 Documentação da API

### Endpoints REST

**Base URL:** `http://localhost:3000/api`

#### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `GET /auth/profile` - Obter perfil (requer token)
- `POST /auth/refresh` - Renovar token (requer token)

#### Tarefas
- `GET /tasks` - Listar tarefas (requer token)
- `GET /tasks/my` - Minhas tarefas (requer token)
- `GET /tasks/:id` - Obter tarefa por ID (requer token)
- `POST /tasks` - Criar tarefa (requer token)
- `PUT /tasks/:id` - Atualizar tarefa (requer token)
- `DELETE /tasks/:id` - Deletar tarefa (requer token)

#### Usuários
- `GET /users` - Listar usuários (admin apenas)
- `GET /users/:id` - Obter usuário por ID (requer token)
- `PUT /users/:id` - Atualizar usuário (requer token)
- `DELETE /users/:id` - Deletar usuário (requer token)
- `POST /users/change-password` - Alterar senha (requer token)

### GraphQL

**Endpoint:** `http://localhost:3000/graphql`

**Playground:** Acesse `http://localhost:3000/graphql` no navegador

#### Exemplos de Queries

**Fazer login:**
```graphql
mutation Login {
  login(input: {
    email: "user@test.com"
    password: "user123"
  }) {
    user {
      id
      name
      email
      role
    }
    token
    expiresIn
  }
}
```

**Listar tarefas:**
```graphql
query GetTasks {
  tasks {
    tasks {
      id
      title
      description
      completed
      priority
      user {
        name
        email
      }
    }
    pagination {
      current
      total
      count
      totalItems
    }
  }
}
```

**Criar tarefa:**
```graphql
mutation CreateTask {
  createTask(input: {
    title: "Nova tarefa"
    description: "Descrição da tarefa"
    priority: HIGH
  }) {
    id
    title
    description
    completed
    priority
    createdAt
  }
}
```

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação. 

### Para REST:
Inclua o token no header `Authorization`:
```
Authorization: Bearer <seu-token-jwt>
```

### Para GraphQL:
Inclua o token no header `Authorization` ou use o playground.

### Usuários Padrão:
- **Admin**: `admin@test.com` / `admin123`
- **Usuário**: `user@test.com` / `user123`

## 🔄 Pipeline CI/CD

A pipeline está configurada no GitHub Actions e executa:

1. **Testes Unitários** - Testes dos controllers com Sinon
2. **Testes de Integração** - Testes E2E com Supertest
3. **Análise de Código** - ESLint
4. **Cobertura de Código** - NYC/Istanbul
5. **Auditoria de Segurança** - npm audit
6. **Build e Deploy** - Criação de artefatos

### Status dos Testes:
Os testes são executados automaticamente em:
- Push para `main` ou `develop`
- Pull Requests para `main`
- Múltiplas versões do Node.js (16.x, 18.x, 20.x)

## 📊 Cobertura de Testes

O projeto inclui:

- **Testes E2E (External)**: Testam toda a aplicação via HTTP
- **Testes Unitários**: Testam controllers isoladamente com mocks
- **Testes REST e GraphQL**: Cobertura completa de ambas as interfaces
- **Mocks e Stubs**: Usando Sinon para isolar dependências

## 🏗️ Arquitetura

### Padrões Utilizados:
- **MVC Pattern**: Controllers, Models e Views bem separados
- **Repository Pattern**: Abstração do acesso aos dados
- **Middleware Pattern**: Autenticação e validação
- **Dependency Injection**: Facilita testes unitários

### Características:
- **Banco em Memória**: Para simplicidade e testes
- **Validação de Dados**: Joi para validação robusta
- **Tratamento de Erros**: Middleware centralizado
- **Rate Limiting**: Proteção contra abuso
- **Segurança**: Helmet, CORS, JWT

## 🚦 Health Check

**Endpoint:** `GET /health`

Retorna status da aplicação:
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 🤝 Contribuição

Este projeto foi desenvolvido como prova acadêmica para demonstrar conhecimentos em:
- Desenvolvimento de APIs REST e GraphQL
- Testes automatizados (unitários e E2E)
- Integração contínua com GitHub Actions
- Boas práticas de desenvolvimento Node.js

## 📝 Licença

MIT License - Projeto acadêmico para graduação em automação.

---

**Desenvolvido por**: QA Senior - Graduação em Automação  
**Data**: Dezembro 2023
