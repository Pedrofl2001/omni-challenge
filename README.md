# 💰 API de Transações Monetárias - Desafio Omni Saúde

> **Desafio Técnico da [Omni Saúde](https://www.omnisaude.app/)** - Este projeto foi desenvolvido como parte do processo seletivo para demonstrar habilidades em desenvolvimento backend com NestJS, TypeScript e boas práticas de desenvolvimento.

## 🚀 Tecnologias e Funcionalidades

- **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL
- **Testes**: Jest para testes unitários e de integração
- **Autenticação**: JWT com bcrypt para hashing de senhas
- **Containerização**: Docker e Docker Compose
- **Funcionalidades**: Cadastro, Login, Transferências e Listagem de usuários

## 🛠️ Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

## ⚡ Como Executar

1. **Clone o repositório e configure o ambiente:**
   ```bash
   git clone <url-do-repositorio>
   cd omni-challenge
   cp .env.example .env 
   # Verifique o .env, mas as configurações padrão devem funcionar
   ```

2. **Suba o banco de dados com Docker:**
   ```bash
   docker-compose up postgres -d
   ```

3. **Execute a aplicação (com hot-reload):**
   ```bash
   pnpm run docker:dev
   ```

4. **Acesse a API:**
   - `http://localhost:3000`

## 📚 Endpoints da API

A base URL é `http://localhost:3000`.

---

### 1. Cadastro de Usuário
**`POST /users/signup`**

**Request Body:**
```json
{
  "username": "joao.silva",
  "password": "senha123",
  "birthdate": "1990-05-15"
}
```
**Response (201 Created):**
```json
{
  "id": "uuid-do-usuario"
}
```

---

### 2. Login de Usuário
**`POST /users/signin`**

**Request Body:**
```json
{
  "username": "joao.silva",
  "password": "senha123"
}
```
**Response (200 OK):**
```json
{
  "token": "seu-token-jwt",
  "expiresIn": "1h"
}
```

---

### 3. Transferência de Dinheiro
**`POST /transfers`** `(Autenticado: Bearer Token)`

**Request Body:**
```json
{
  "fromId": "uuid-de-origem",
  "toId": "uuid-de-destino",
  "amount": 100
}
```
**Response (204 No Content)**

---

### 4. Listagem de Usuários
**`GET /users`** `(Autenticado: Bearer Token)`

**Query Parameters (opcionais):** `skip`, `take`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-do-usuario",
      "username": "joao.silva",
      "birthdate": "1990-05-15",
      "balance": 1500
    }
  ],
  "totalCount": 1,
  "hasNextPage": false
}
```

---

## 🧪 Testes

O projeto possui cobertura de testes unitários. Para executá-los:

```bash
# Executar todos os testes
pnpm run test

# Ver cobertura de testes
pnpm run test:cov
```
