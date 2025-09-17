const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const database = require('../../src/config/database');

// Importar componentes da aplicação
const authRoutes = require('../../src/routes/authRoutes');
const { authMiddleware } = require('../../src/middleware/auth');
const typeDefs = require('../../src/graphql/typeDefs');
const resolvers = require('../../src/graphql/resolvers');

describe('Authentication E2E Tests', () => {
  let app;
  let server;

  beforeEach(async () => {
    // Reset database before each test
    database.reset();

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Setup Apollo Server
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        user: req.user,
        token: req.headers.authorization
      }),
      introspection: true,
      playground: false
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('REST API Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('deve registrar um novo usuário com sucesso', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body).to.have.property('message');
        expect(response.body.data).to.have.property('user');
        expect(response.body.data).to.have.property('token');
        expect(response.body.data.user).to.have.property('email', userData.email);
        expect(response.body.data.user).to.not.have.property('password');
      });

      it('deve rejeitar registro com email duplicado', async () => {
        const userData = {
          name: 'Test User',
          email: 'user@test.com', // Email já existe no banco
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(409);

        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('code', 'EMAIL_ALREADY_EXISTS');
      });

      it('deve validar dados de entrada', async () => {
        const invalidData = {
          name: 'A', // Muito curto
          email: 'invalid-email',
          password: '123' // Muito curto
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidData)
          .expect(400);

        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('code', 'VALIDATION_ERROR');
      });
    });

    describe('POST /api/auth/login', () => {
      it('deve fazer login com credenciais válidas', async () => {
        const loginData = {
          email: 'user@test.com',
          password: 'user123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body).to.have.property('message');
        expect(response.body.data).to.have.property('user');
        expect(response.body.data).to.have.property('token');
        expect(response.body.data.user).to.have.property('email', loginData.email);
      });

      it('deve rejeitar credenciais inválidas', async () => {
        const invalidData = {
          email: 'user@test.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(invalidData)
          .expect(401);

        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('code', 'INVALID_CREDENTIALS');
      });

      it('deve rejeitar email inexistente', async () => {
        const invalidData = {
          email: 'nonexistent@test.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(invalidData)
          .expect(401);

        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('code', 'INVALID_CREDENTIALS');
      });
    });

    describe('GET /api/auth/profile', () => {
      let userToken;

      beforeEach(async () => {
        // Login para obter token
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'user@test.com',
            password: 'user123'
          });
        
        userToken = loginResponse.body.data.token;
      });

      it('deve retornar perfil com token válido', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body).to.have.property('message');
        expect(response.body.data).to.have.property('user');
        expect(response.body.data.user).to.have.property('email', 'user@test.com');
        expect(response.body.data.user).to.not.have.property('password');
      });

      it('deve rejeitar acesso sem token', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .expect(401);

        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('code', 'NO_TOKEN');
      });

      it('deve rejeitar token inválido', async () => {
        const response = await request(app)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body).to.have.property('error');
        expect(response.body.error).to.have.property('code', 'INVALID_TOKEN');
      });
    });
  });

  describe('GraphQL Authentication', () => {
    describe('Register Mutation', () => {
      it('deve registrar usuário via GraphQL', async () => {
        const mutation = `
          mutation RegisterUser($input: RegisterInput!) {
            register(input: $input) {
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
        `;

        const variables = {
          input: {
            name: 'GraphQL User',
            email: 'graphql@test.com',
            password: 'password123'
          }
        };

        const response = await request(app)
          .post('/graphql')
          .send({
            query: mutation,
            variables
          })
          .expect(200);

        expect(response.body.data).to.have.property('register');
        expect(response.body.data.register).to.have.property('user');
        expect(response.body.data.register).to.have.property('token');
        expect(response.body.data.register.user).to.have.property('email', variables.input.email);
      });

      it('deve rejeitar email duplicado via GraphQL', async () => {
        const mutation = `
          mutation RegisterUser($input: RegisterInput!) {
            register(input: $input) {
              user {
                id
                email
              }
              token
            }
          }
        `;

        const variables = {
          input: {
            name: 'Duplicate User',
            email: 'user@test.com', // Email já existe
            password: 'password123'
          }
        };

        const response = await request(app)
          .post('/graphql')
          .send({
            query: mutation,
            variables
          })
          .expect(200);

        expect(response.body).to.have.property('errors');
        expect(response.body.errors[0]).to.have.property('message', 'Email já está em uso');
      });
    });

    describe('Login Mutation', () => {
      it('deve fazer login via GraphQL', async () => {
        const mutation = `
          mutation LoginUser($input: LoginInput!) {
            login(input: $input) {
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
        `;

        const variables = {
          input: {
            email: 'user@test.com',
            password: 'user123'
          }
        };

        const response = await request(app)
          .post('/graphql')
          .send({
            query: mutation,
            variables
          })
          .expect(200);

        expect(response.body.data).to.have.property('login');
        expect(response.body.data.login).to.have.property('user');
        expect(response.body.data.login).to.have.property('token');
        expect(response.body.data.login.user).to.have.property('email', variables.input.email);
      });

      it('deve rejeitar credenciais inválidas via GraphQL', async () => {
        const mutation = `
          mutation LoginUser($input: LoginInput!) {
            login(input: $input) {
              user {
                id
                email
              }
              token
            }
          }
        `;

        const variables = {
          input: {
            email: 'user@test.com',
            password: 'wrongpassword'
          }
        };

        const response = await request(app)
          .post('/graphql')
          .send({
            query: mutation,
            variables
          })
          .expect(200);

        expect(response.body).to.have.property('errors');
        expect(response.body.errors[0]).to.have.property('message', 'Credenciais inválidas');
      });
    });

    describe('Me Query', () => {
      let userToken;

      beforeEach(async () => {
        // Login para obter token
        const mutation = `
          mutation LoginUser($input: LoginInput!) {
            login(input: $input) {
              token
            }
          }
        `;

        const variables = {
          input: {
            email: 'user@test.com',
            password: 'user123'
          }
        };

        const loginResponse = await request(app)
          .post('/graphql')
          .send({
            query: mutation,
            variables
          });
        
        userToken = loginResponse.body.data.login.token;
      });

      it('deve retornar dados do usuário autenticado', async () => {
        const query = `
          query Me {
            me {
              id
              name
              email
              role
              createdAt
              updatedAt
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ query })
          .expect(200);

        expect(response.body.data).to.have.property('me');
        expect(response.body.data.me).to.have.property('email', 'user@test.com');
        expect(response.body.data.me).to.have.property('name', 'Test User');
      });

      it('deve rejeitar acesso sem autenticação', async () => {
        const query = `
          query Me {
            me {
              id
              email
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body).to.have.property('errors');
        expect(response.body.errors[0]).to.have.property('message')
          .that.includes('logado');
      });
    });
  });
});
