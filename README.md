# Chain Reaction Game

A multiplayer **Chain Reaction board game** built with a **Go backend API** and **Next.js frontend**.  
The project uses **Turborepo** for monorepo management and **shadcn/ui** for UI components.

## Tech Stack

- Frontend: Next.js + shadcn/ui + TailwindCSS  
- Backend: Go (REST API / WebSockets)  
- Monorepo: Turborepo  
- Database (optional): PostgreSQL / Redis  

## Setup

Install dependencies:

```bash
npm install
npm run dev --filter=web
```

### backend 


```bash
go run cmd/server/main.go
```