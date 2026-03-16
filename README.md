# Falcon Blog API

A GraphQL API for a blog platform with user authentication, posts, and voting. Built with Node.js, TypeScript, PostgreSQL, and Redis.

## What This Project Does

- Users can register, log in, and log out
- Logged-in users can create, edit, and delete their own posts
- Users can upvote or downvote posts (called "updoots")
- Passwords are hashed securely using argon2
- Sessions are stored in Redis so users stay logged in
- Forgot password flow sends a reset link via email

## Tech Stack

| Tool | What it does |
|---|---|
| **Node.js + Express** | Runs the web server |
| **TypeScript** | Adds types to JavaScript so bugs are caught earlier |
| **GraphQL + Apollo Server** | API layer — instead of REST endpoints, everything goes through one `/graphql` endpoint |
| **TypeORM** | Talks to the database using TypeScript classes instead of raw SQL |
| **PostgreSQL** | The main database — stores users, posts, and votes |
| **Redis** | Stores user sessions (keeps you logged in) and password reset tokens |
| **argon2** | Hashes passwords before saving them — never stores plain text |
| **DataLoader** | Batches database queries to avoid the "N+1 problem" (too many queries) |

## Project Structure

```
src/
├── entities/        # Database table definitions (User, Post, Updoot)
├── resolvers/       # GraphQL operations (queries and mutations)
├── migrations/      # Database schema changes over time
├── middleware/      # isAuth — blocks unauthenticated requests
└── utils/           # Helpers: email sender, data loaders, validators
```

## Prerequisites

- [Node.js](https://nodejs.org/) v14+
- [Docker](https://www.docker.com/) (for PostgreSQL and Redis)

## Getting Started

**1. Start the database and cache**

```bash
docker run -d --name postgres -e POSTGRES_PASSWORD=Rubicon1999 -e POSTGRES_DB=falconblog -e POSTGRES_USER=postgres -p 5432:5432 postgres:14
docker run -d --name redis -p 6379:6379 redis:7
```

**2. Set up environment variables**

Copy `.env.example` to `.env` and fill in the values:

```bash
DATABASE_URL=postgresql://postgres:Rubicon1999@localhost:5432/falconblog
REDIS_URL=redis://localhost:6379
PORT=4000
SESSION_SECRET=devsecret
CORS_ORIGIN=http://localhost:3000
```

**3. Install dependencies**

```bash
yarn install
```

**4. Run database migrations**

```bash
npx typeorm migration:run
```

**5. Start the dev server**

Open two terminals:

```bash
# Terminal 1 — compiles TypeScript on save
npm run watch

# Terminal 2 — restarts server when compiled files change
npm run dev
```

The API will be available at `http://localhost:4000/graphql`

## Restarting Docker Containers

If you restart your computer, the containers will be stopped. Start them again with:

```bash
docker start postgres
docker start redis
```

## GraphQL Operations

### Queries
- `me` — get the currently logged-in user
- `posts(limit, cursor)` — get a paginated list of posts
- `post(id)` — get a single post by ID

### Mutations
- `register(username, email, password)` — create a new account
- `login(usernameOrEmail, password)` — log in
- `logout` — log out
- `createPost(title, text)` — create a post (must be logged in)
- `updatePost(id, title, text)` — edit your own post
- `deletePost(id)` — delete your own post
- `vote(postId, value)` — upvote (+1) or downvote (-1) a post
- `forgotPassword(email)` — send a password reset email
- `changePassword(token, newPassword)` — reset your password
