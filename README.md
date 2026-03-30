# Guide-Pay

Guide-Pay is a full-stack parametric income protection platform for gig workers.

## Repository layout

- `frontend/`: React + Vite application
- `backend/`: FastAPI API, ML services, trigger processing, and Render deploy config
- `APIS_NEEDED.md`: external free API checklist

## Deployment

- Frontend: Vercel
- Backend: Render
- Backend deploy guide: [backend/README.md](backend/README.md)

## Environment

- Copy `frontend/.env.example` to `frontend/.env`
- Copy `backend/.env.example` to `backend/.env`
- Do not commit real `.env` files
