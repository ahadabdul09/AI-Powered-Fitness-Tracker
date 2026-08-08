# AI-Powered Fitness Tracker (MERN Stack)

A full-stack fitness tracking application built with MongoDB, Express.js, React, and Node.js. Users can log workouts, meals, and progress over time, and get personalized workout plans and nutrition suggestions from an integrated LLM (Claude or GPT).

## Features

- 🔐 JWT-based authentication with role-based access control
- 🏋️ Full CRUD for workouts (exercises, sets/reps, duration, type)
- 🍽️ Full CRUD for meals with auto-calculated calorie totals
- 📈 Progress logging (weight, body fat %, measurements) with trend charts
- 🤖 AI Coach: LLM-generated personalized workout plans and nutrition suggestions based on user goals and history
- 📱 Responsive React UI with protected routes

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT + bcrypt
- **AI:** Anthropic Claude API or OpenAI API (configurable)

## Project Structure

```
fitness-tracker/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/      # Route handler logic
│   ├── middleware/       # Auth & error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── utils/            # LLM client abstraction
│   └── server.js
└── frontend/
    └── src/
        ├── api/           # Axios instance
        ├── components/    # Navbar, PrivateRoute
        ├── context/       # AuthContext
        ├── pages/         # Login, Register, Dashboard, Workouts, Meals, Progress, AICoach
        └── App.jsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com)) or OpenAI API key

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `LLM_PROVIDER` — `anthropic` or `openai`
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` — your key

Run the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Run the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 3. Use the app

1. Register an account (set your fitness goal and activity level)
2. Log workouts, meals, and progress entries
3. Visit **AI Coach** to generate a personalized workout plan or nutrition suggestions

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update profile/goals |
| GET/POST | `/api/workouts` | List / create workouts |
| GET/PUT/DELETE | `/api/workouts/:id` | Get / update / delete a workout |
| GET/POST | `/api/meals` | List / create meals |
| GET/PUT/DELETE | `/api/meals/:id` | Get / update / delete a meal |
| GET/POST | `/api/progress` | List / create progress logs |
| PUT/DELETE | `/api/progress/:id` | Update / delete a progress log |
| POST | `/api/ai/workout-plan` | Generate an AI workout plan |
| POST | `/api/ai/nutrition-suggestions` | Generate AI nutrition suggestions |

All routes except `/api/auth/register` and `/api/auth/login` require an `Authorization: Bearer <token>` header.

## License

MIT
