# Dev_collab

A developer collaboration platform for creating projects, assigning tasks, and managing teams from a centralized dashboard.

**Live demo:** [dev-collab-drab.vercel.app](https://dev-collab-drab.vercel.app)

---

## Features

- **Project creation** — create and manage development projects
- **Task assignment** — break work down into tasks and assign them across a team
- **Team dashboard** — a centralized view of projects, tasks, and team activity

---

## Tech stack

**Frontend**
- React / Next.js

**Backend**
- Express
- MongoDB

---

## Getting started

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file with your required environment variables (database connection string, JWT secret, etc.).

```bash
npm run dev
```

### Frontend setup

```bash
cd dev_collab_frontend
npm install
```

Create a `.env.local` file with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
```

---

## Project structure

```
backend/                # Express API
dev_collab_frontend/     # Next.js frontend
```

---

## License

This project is currently unlicensed / private. Contact the maintainer for usage permissions.

---

Built by [Tochukwu Okeakpu](https://github.com/Toch-man)
