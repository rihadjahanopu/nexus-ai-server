<div align="center">

<br/>

<img src="https://img.shields.io/badge/Nexus%20AI-Backend-10b981?style=for-the-badge&logo=node.js&logoColor=white" alt="Nexus AI Backend" />

<br/><br/>

<h1>⚙️ Nexus AI — Server</h1>

<p><strong>A production-grade REST API powering the Nexus AI platform — built with Express 5, TypeScript, MongoDB, and Google Gemini AI.</strong></p>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Agentic AI Flow](#-agentic-ai-flow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Deployment](#-deployment)

---

## 🌟 Overview

**Nexus AI Server** is the backend engine of the Nexus AI platform. It provides a secure, scalable REST API that handles authentication, project management, file uploads, and an **Agentic AI pipeline** built on Google Gemini that gives each project its own intelligent assistant.

Key highlights:
- 🔐 **JWT Authentication** with HTTP-only cookie support and Google OAuth 2.0
- 🤖 **Agentic AI Engine** — Gemini 1.5 Pro with project-scoped memory and context
- 🗄️ **MongoDB + Mongoose** for flexible, schema-driven data models
- ☁️ **Cloudinary** for secure media and file upload management
- 🛡️ **Security-first** — Helmet, CORS, Zod validation, bcrypt password hashing
- 📦 **Express 5** with async error handling and compression
- 🔍 **Activity & AI Logging** — full audit trail of agent interactions
- 🚀 **Vercel-ready** serverless deployment via `vercel.json`

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | ≥ 18.x |
| **Framework** | Express.js | `^5.2` |
| **Language** | TypeScript | `^7.0` |
| **Database** | MongoDB + Mongoose | `^9.7` |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | `^9` / `^3` |
| **AI Engine** | @google/genai (Gemini) | `^2.12` |
| **AI SDK (alt)** | @google/generative-ai | `^0.24` |
| **OAuth** | google-auth-library | `^10.9` |
| **File Uploads** | Multer | `^2.2` |
| **Cloud Storage** | Cloudinary | `^2.10` |
| **Validation** | express-validator + Zod | `^7` / `^4` |
| **Security** | Helmet | `^8.3` |
| **CORS** | cors | `^2.8` |
| **Logging** | Morgan | `^1.11` |
| **Compression** | compression | `^1.8` |
| **Cookies** | cookie-parser | `^1.4` |
| **Dev Runner** | tsx (watch mode) | `^4.23` |

---

## 📁 Project Structure

```
nexus-ai-server/
├── src/
│   ├── config/
│   │   └── db.ts                   # MongoDB connection (Mongoose)
│   ├── controllers/
│   │   ├── authController.ts       # Register, Login, GetMe, Logout, Google OAuth
│   │   ├── chatController.ts       # Send AI message, get chat history
│   │   └── projectController.ts   # Full CRUD for project workspaces
│   ├── middlewares/
│   │   └── auth.ts                 # JWT protect middleware (cookie + Bearer)
│   ├── models/
│   │   ├── User.ts                 # User schema (name, email, password, avatar)
│   │   ├── Project.ts              # Project schema (title, description, status, tags)
│   │   ├── Chat.ts                 # Chat/message schema (role, content, projectId)
│   │   ├── Activity.ts             # Activity log schema (user actions per project)
│   │   ├── Recommendation.ts       # AI-generated recommendations schema
│   │   └── AiLog.ts                # AI usage log (tokens, model, response time)
│   ├── routes/
│   │   ├── authRoutes.ts           # /api/v1/auth → auth endpoints
│   │   ├── projectRoutes.ts        # /api/v1/projects → project CRUD
│   │   └── chatRoutes.ts           # /api/v1/chat → agent chat endpoints
│   ├── services/
│   │   └── agentService.ts         # Agentic AI engine (Planner → Memory → LLM)
│   ├── utils/                      # Shared utility helpers
│   └── index.ts                    # Express app entry point + middleware setup
├── uploads/                        # Temporary local file upload directory
├── .env                            # Local environment variables (git-ignored)
├── .env.example                    # Environment variable template
├── vercel.json                     # Vercel serverless deployment config
├── package.json                    # Dependencies and npm scripts
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## 📡 API Reference

### Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https://your-domain.com/api/v1
```

---

### 🔑 Authentication — `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|:---:|
| `POST` | `/register` | Register a new user account | ❌ |
| `POST` | `/login` | Login with email & password | ❌ |
| `POST` | `/google` | Login / register via Google OAuth | ❌ |
| `GET` | `/me` | Get the currently authenticated user | ✅ |
| `POST` | `/logout` | Logout and clear auth cookie | ✅ |

---

### 📂 Projects — `/api/v1/projects`

| Method | Endpoint | Description | Auth |
|---|---|---|:---:|
| `GET` | `/` | List all projects (search, filter, paginate) | ✅ |
| `POST` | `/` | Create a new project workspace | ✅ |
| `GET` | `/:id` | Get a single project by ID | ✅ |
| `PUT` | `/:id` | Update a project | ✅ |
| `DELETE` | `/:id` | Delete a project and its data | ✅ |

**Query Parameters for `GET /`:**

| Parameter | Type | Description |
|---|---|---|
| `search` | `string` | Full-text search on title/description |
| `status` | `string` | Filter by status (`active`, `completed`, `archived`) |
| `page` | `number` | Page number (default: `1`) |
| `limit` | `number` | Results per page (default: `10`) |

---

### 🤖 AI Agent Chat — `/api/v1/chat`

| Method | Endpoint | Description | Auth |
|---|---|---|:---:|
| `GET` | `/:projectId` | Retrieve full chat history for a project | ✅ |
| `POST` | `/:projectId` | Send a message to the project AI agent | ✅ |

**POST Body:**

```json
{
  "message": "What are the key risks in this project?"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "role": "model",
    "content": "Based on the project context, here are the key risks...",
    "projectId": "64abc123..."
  }
}
```

---

## 🤖 Agentic AI Flow

Each project has its own AI agent powered by **Google Gemini 1.5 Pro**. Here's how a message is processed:

```
User Message (POST /api/v1/chat/:projectId)
         │
         ▼
  authController — Verify JWT
         │
         ▼
  chatController — Validate & route request
         │
         ▼
  agentService.runAgent()
         │
         ├── 1. Fetch Project Context (Memory)
         │       └── Load title, description, status, tags from MongoDB
         │
         ├── 2. Fetch Chat History
         │       └── Last N messages for conversational continuity
         │
         ├── 3. Build System Prompt
         │       └── Inject project context + persona instructions
         │
         ├── 4. Call Gemini 1.5 Pro (LLM)
         │       └── Stream / await response
         │
         ├── 5. Persist Response
         │       └── Save AI message to Chat collection
         │
         └── 6. Log Interaction
                 ├── AiLog — token usage, model, latency
                 └── Activity — user action audit trail
         │
         ▼
  Return AI response to client
```

---

## 🗃️ Data Models

| Model | Key Fields |
|---|---|
| `User` | `name`, `email`, `password` (hashed), `avatar`, `googleId` |
| `Project` | `title`, `description`, `status`, `tags`, `owner` (ref User) |
| `Chat` | `role` (`user`/`model`), `content`, `projectId` (ref Project) |
| `Activity` | `action`, `userId`, `projectId`, `metadata`, `timestamp` |
| `Recommendation` | `content`, `projectId`, `generatedAt` |
| `AiLog` | `model`, `tokens`, `latency`, `projectId`, `userId` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (local instance or [MongoDB Atlas](https://mongodb.com/atlas))
- **Google Gemini API Key** — [Get one here](https://ai.google.dev)
- **Cloudinary Account** — [Sign up here](https://cloudinary.com) (optional for file uploads)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nexes-ai.git
cd nexes-ai/nexus-ai-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables) below).

### 4. Start the development server

```bash
npm run dev
```

The server starts at **[http://localhost:5000](http://localhost:5000)**.

You should see:
```
Server is running on port 5000
MongoDB Connected: <your-cluster-host>
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and populate all values:

```env
# ── Server ──────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Database ─────────────────────────────────
MONGO_URI=mongodb://localhost:27017/nexus
# For Atlas: mongodb+srv://<user>:<pass>@cluster.mongodb.net/nexus

# ── Authentication ────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=30d

# ── CORS ─────────────────────────────────────
CLIENT_URL=http://localhost:3000

# ── Google AI (Gemini) ────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ── Google OAuth 2.0 ─────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Cloudinary (File Uploads) ─────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

| Variable | Description | Required |
|---|---|:---:|
| `PORT` | Port the server listens on | ✅ |
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration duration (e.g. `30d`, `7d`) | ✅ |
| `CLIENT_URL` | Frontend URL for CORS whitelist | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key for the AI agent | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | ⚠️ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | ⚠️ Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ⚠️ Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ⚠️ Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ⚠️ Optional |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with `tsx` watch mode (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` with `tsc` |
| `npm start` | Run the compiled production build from `dist/index.js` |

---

## ☁️ Deployment

### Vercel (Serverless)

A `vercel.json` is included for seamless Vercel deployment:

1. Push your code to GitHub.
2. Import the `nexus-ai-server` directory as a new project on [Vercel](https://vercel.com).
3. Set all environment variables in the Vercel dashboard.
4. Click **Deploy** 🚀

### Other Platforms (Render / Railway / Fly.io)

1. Set all environment variables in your hosting dashboard.
2. Use the following commands:
   - **Build:** `npm run build`
   - **Start:** `npm start`
3. Ensure `MONGO_URI` points to a production **MongoDB Atlas** cluster.
4. Set `CLIENT_URL` to your deployed frontend URL.

---

## 🛡️ Security

- **Helmet** — sets secure HTTP headers
- **CORS** — whitelists `localhost` (dev) and `CLIENT_URL` (production)
- **bcryptjs** — passwords are hashed before storage (never stored in plain text)
- **JWT HTTP-only cookies** — prevents XSS access to auth tokens
- **express-validator + Zod** — double-layer input validation
- **Rate limiting** — recommended to add via `express-rate-limit` in production

---

<div align="center">

Built with ❤️ using **Express 5** · **TypeScript** · **MongoDB** · **Google Gemini AI**

</div>
