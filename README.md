# Nexus — Backend API

> Node.js + Express + TypeScript REST API with Agentic AI (Gemini) integration.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **AI:** Google Generative AI SDK (Gemini 1.5 Pro)
- **File Uploads:** Multer + Cloudinary
- **Security:** Helmet, CORS, express-validator
- **Logging:** Morgan
- **Compression:** compression

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts   # Register, Login, GetMe, Logout
│   │   ├── chatController.ts   # Send message, Get chat history
│   │   └── projectController.ts# CRUD for Projects
│   ├── middlewares/
│   │   └── auth.ts             # JWT protect middleware
│   ├── models/
│   │   ├── User.ts             # User schema
│   │   ├── Project.ts          # Project schema
│   │   ├── Chat.ts             # Chat/message schema
│   │   ├── Activity.ts         # Activity log schema
│   │   ├── Recommendation.ts   # AI recommendation schema
│   │   └── AiLog.ts            # AI usage log schema
│   ├── routes/
│   │   ├── authRoutes.ts       # /api/v1/auth
│   │   ├── projectRoutes.ts    # /api/v1/projects
│   │   └── chatRoutes.ts       # /api/v1/chat
│   ├── services/
│   │   └── agentService.ts     # Agentic AI engine (Planner → Memory → LLM)
│   └── index.ts                # Express app entry point
├── .env                        # Local environment variables (git ignored)
├── .env.example                # Environment variable template
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexus
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Run in Development

```bash
npm run dev
```

Server starts at **http://localhost:5000**

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login with email & password | ❌ |
| GET | `/me` | Get current logged-in user | ✅ |
| POST | `/logout` | Logout user | ✅ |

### Projects — `/api/v1/projects`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all projects (search, filter, paginate) | ✅ |
| POST | `/` | Create a new project | ✅ |
| GET | `/:id` | Get a single project | ✅ |
| PUT | `/:id` | Update a project | ✅ |
| DELETE | `/:id` | Delete a project | ✅ |

### Chat (Agent) — `/api/v1/chat`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:projectId` | Get chat history for a project | ✅ |
| POST | `/:projectId` | Send message to the AI agent | ✅ |

---

## 🤖 Agentic AI Flow

```
User Message
     ↓
agentService.runAgent()
     ↓
Fetch Project Context (Memory)
     ↓
Build System Prompt + Chat History
     ↓
Gemini 1.5 Pro (LLM)
     ↓
Save Response to Chat History
     ↓
Log to AiLog + Activity
     ↓
Return Response
```

## ☁️ Deployment (Render / Railway / Heroku)

1. Set all environment variables in your hosting dashboard.
2. Use the following build and start commands:
   - **Build:** `npm run build`
   - **Start:** `npm start`
3. Ensure your `MONGO_URI` points to a production MongoDB Atlas cluster.
4. Set `CLIENT_URL` to your deployed frontend URL for CORS.
