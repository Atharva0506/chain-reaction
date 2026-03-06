# Chain Reaction — Multiplayer Web Game

A production-ready multiplayer chain reaction strategy game built with Next.js, Go, Redis, and PostgreSQL.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Next.js)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Zustand  │ │  Board   │ │  WebSocket│ │  TanStack │  │
│  │  Store    │ │  Renderer│ │  Hook     │ │  Query    │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ WebSocket / HTTP
┌───────────────────────▼─────────────────────────────────┐
│                  Go Game Server                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  WS Hub  │ │  Game    │ │  Match-  │ │  REST API │  │
│  │          │ │  Engine  │ │  making  │ │           │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐                              │
│  │  AI Bot  │ │  Coord-  │                              │
│  │          │ │  inator  │                              │
│  └──────────┘ └──────────┘                              │
└──────┬──────────────┬───────────────────────────────────┘
       │              │
  ┌────▼────┐   ┌─────▼─────┐
  │  Redis  │   │ PostgreSQL│
  │  State  │   │  Persist  │
  │  Pub/Sub│   │  (Prisma) │
  │  Queues │   │           │
  └─────────┘   └───────────┘
```

## Database Schema

```
Users
├── id (PK, cuid)
├── name
├── email (unique, optional)
├── passwordHash (optional)
├── guestToken (unique, optional)
├── rating (default: 1000)
├── wins / losses / draws
└── timestamps

Matches
├── id (PK, cuid)
├── mode (SINGLE_PLAYER | MULTIPLAYER)
├── status (WAITING | IN_PROGRESS | FINISHED | ABANDONED)
├── roomCode (unique, optional)
├── boardRows / boardCols
├── totalTurns
├── winnerId
├── difficulty (optional)
└── timestamps

MatchPlayers
├── id (PK, cuid)
├── matchId (FK → Matches)
├── userId (FK → Users)
├── color (0-3)
├── isBot / isAlive
└── joinedAt

Moves
├── id (PK, cuid)
├── matchId (FK → Matches)
├── playerId
├── row / col / turnNum
└── timestamp

Leaderboard
├── id (PK, cuid)
├── userId (unique)
├── userName / wins / losses
├── rating / rank
└── updatedAt
```

## Backend API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/health` | API health |
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/match/:matchId` | Get match state |
| WS | `/ws` | WebSocket connection |

## WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `PING` | `{}` | Keepalive |
| `JOIN_MATCH` | `{ matchId, playerId, token }` | Join existing match |
| `MAKE_MOVE` | `{ matchId, position: { row, col } }` | Place an orb |
| `CREATE_ROOM` | `{ playerCount }` | Create private room |
| `JOIN_ROOM` | `{ roomCode }` | Join by room code |
| `QUEUE_MATCHMAKING` | `{ playerName }` | Enter matchmaking |
| `CANCEL_MATCHMAKING` | `{}` | Leave matchmaking |
| `SPECTATE` | `{ matchId }` | Watch a match |
| `LEAVE_MATCH` | `{}` | Leave current match |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `PONG` | `{}` | Keepalive response |
| `MATCH_START` | `{ matchId, players, board, currentTurn }` | Game begins |
| `BOARD_UPDATE` | `{ diff: { changes, explosions }, currentTurn, turnNumber, players }` | Board state diff |
| `TURN_CHANGE` | `{ currentTurn, turnNumber, timeoutMs }` | Turn changed |
| `MATCH_END` | `{ winner, finalBoard, totalTurns }` | Game over |
| `CHAIN_REACTION` | `{ steps: BoardDiff[] }` | Animated chain reaction steps |
| `ERROR` | `{ code, message }` | Error response |
| `ROOM_CREATED` | `{ roomCode, matchId }` | Room created |
| `PLAYER_JOINED` | `{ playerId, players }` | Player joined room |
| `PLAYER_LEFT` | `{ playerId }` | Player disconnected |
| `MATCHMAKING_STATUS` | `{ status, matchId?, estimatedWaitMs? }` | Queue status |

## Game Rules

- **Board**: 8 rows × 12 columns
- **Cell capacity**: Corner = 2, Edge = 3, Center = 4
- **Explosion**: When orbs ≥ capacity, cell explodes; orbs spread to neighbors
- **Conversion**: Exploded orbs convert neighbor cells to the player's color
- **Chain reaction**: Converted cells that exceed capacity also explode
- **Win condition**: Last player with orbs on the board wins
- **All moves are server-validated** (server-authoritative)

## AI Difficulty

| Level | Algorithm | Description |
|-------|-----------|-------------|
| Easy | Random safe moves | Avoids cells near critical mass |
| Medium | Greedy evaluation | Single-depth board evaluation |
| Hard | Minimax (depth 3) | Alpha-beta pruning with positional heuristics |

## Queue Workers

Redis queues handle async operations:
- `queue:matchmaking` — Matchmaking pairing (2s tick)
- `queue:ai-moves` — AI move computation
- `queue:chain-propagation` — Chain reaction step processing
- `queue:match-timeout` — Turn timeout enforcement

## Project Structure

```
chain-reaction/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── src/
│   │       ├── app/            # App Router pages
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx          # Home/menu
│   │       │   ├── play/page.tsx     # Game screen
│   │       │   ├── multiplayer/page.tsx
│   │       │   └── leaderboard/page.tsx
│   │       ├── components/
│   │       │   ├── game-board.tsx
│   │       │   ├── player-panel.tsx
│   │       │   ├── game-over-modal.tsx
│   │       │   └── connection-status.tsx
│   │       ├── hooks/
│   │       │   ├── use-websocket.ts
│   │       │   └── use-single-player.ts
│   │       └── store/
│   │           ├── game-store.ts
│   │           └── connection-store.ts
│   └── server/                 # Go backend
│       ├── cmd/server/main.go
│       └── internal/
│           ├── api/routes.go
│           ├── game/
│           │   ├── types.go
│           │   ├── engine.go
│           │   ├── coordinator.go
│           │   └── ai.go
│           ├── matchmaking/service.go
│           ├── redis/store.go
│           └── ws/hub.go
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── game-engine/            # Game logic (TS)
│   └── ui/                     # Shared UI components
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Go ≥ 1.22
- Docker & Docker Compose
- Redis
- PostgreSQL

### Quick Start (Docker)

```bash
# Clone and start all services
cp .env.example .env
docker-compose up -d

# Access at http://localhost:3000
```

### Local Development

```bash
# 1. Start infrastructure
docker-compose up -d postgres redis

# 2. Install dependencies
npm install

# 3. Setup database
npm run db:push

# 4. Start Go server
cd apps/server
go mod tidy
go run cmd/server/main.go

# 5. Start Next.js dev server (new terminal)
npm run dev:web
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://chain:chain_secret@localhost:5432/chain_reaction` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080/ws` | WebSocket endpoint |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | REST API endpoint |
| `JWT_SECRET` | — | Auth token secret |
| `SERVER_ADDR` | `:8080` | Go server bind address |

## Scalability Design

- **Stateless Go servers** behind a load balancer; game state lives in Redis
- **Redis pub/sub** for cross-instance event propagation
- **Redis queues** for async workloads (AI, timeouts, chain propagation)
- **PostgreSQL** for durable match history and leaderboards
- **WebSocket connection stickiness** via Redis-backed session routing
- **Horizontal scaling**: spin up additional game server instances as needed
