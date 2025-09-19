# NewGen Prompt Intelligence

NewGen Prompt Intelligence is a full-stack web application that showcases AI-assisted prompt management, collaboration, and analytics powered by the Gemini API. It provides a responsive dashboard for creating, organizing, and refining prompts with real-time teamwork, speech-to-text capture, and chatbot guidance.

## Features

- **User authentication** with JWT-secured API.
- **Prompt workspace** that supports CRUD operations, AI refinements, contextual metadata, and image attachments.
- **Gemini integration** for single prompt generation, refinement, conversational copilot, and batch prompt creation (with mock fallbacks when an API key is not supplied).
- **Speech-to-text capture** leveraging Google Cloud Speech-to-Text when credentials are present, with a mock fallback for local demos.
- **Real-time collaboration** via Socket.IO for live prompt edits, cursor presence, and shared chat.
- **Batch prompt generation** flows and analytics dashboard summarizing prompt library usage.
- **Responsive React UI** optimized for mobile-first experiences.
- **CI-ready structure** with linting scripts on both backend and frontend.

## Project Structure

```
backend/   # Express API, SQLite persistence, Gemini + Speech integrations
frontend/  # React client (Vite) with React Query, Zustand state, Socket.IO client
```

## Getting Started

### Requirements

- Node.js 18+
- npm

Optional services:
- Google Gemini API key
- Google Cloud project credentials for Speech-to-Text

### Environment Variables

Copy the examples and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend `.env` highlights:
- `PORT` – API port (default 5000)
- `CLIENT_ORIGIN` – Allowed frontend origins (comma separated)
- `JWT_SECRET` – Secret for JWT signing
- `DATABASE_PATH` – SQLite file path
- `GEMINI_API_KEY` – Gemini API key (optional; mock responses used when empty)
- `GOOGLE_APPLICATION_CREDENTIALS` – Path to Google credentials JSON (optional)

Frontend `.env` highlights:
- `VITE_API_BASE_URL` – Backend API base URL
- `VITE_SOCKET_URL` – Socket.IO server URL
- `VITE_ANALYTICS_ID` – Google Analytics measurement ID

### Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### Run in development

In separate terminals:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

The frontend defaults to `http://localhost:5173` and proxies API traffic to `http://localhost:5000`.

### Linting

```bash
cd backend
npm run lint

cd ../frontend
npm run lint
```

### Database

SQLite is used for persistence. The database file lives under `backend/data/app.db` (ignored from source control). Tables are automatically migrated on server start.

### Real-time Collaboration

Socket.IO is enabled on the backend server. The frontend connects with the active prompt ID and user ID to broadcast edits and chat events.

### Mock Mode

When API keys are not supplied, the Gemini and Speech services respond with deterministic mock values to keep the UX functional for demos and automated tests.

### Static Preview

- The React client is configured to publish a static bundle under [`docs/`](docs/) so GitHub Pages can render the login experience without extra routing rules.
- Run `npm run build` inside the `frontend` workspace whenever you want to refresh the preview assets. The command wipes and regenerates the contents of `docs/` via Vite's production build.
- The static bundle uses a hash-based router so deep links work correctly on GitHub Pages. When the API backend is not running, the UI gracefully falls back to the authentication screen.

## Deployment Notes

- Configure environment variables in your hosting platform (e.g., Vercel/Netlify for the frontend, Render/Heroku/AWS for the backend).
- Point the frontend build to the hosted backend API via `VITE_API_BASE_URL`.
- Attach a CI workflow (GitHub Actions) to run `npm run lint` for both workspaces before deployment.

## License

MIT
