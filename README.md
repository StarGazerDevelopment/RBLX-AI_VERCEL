# NoobAI Vercel Backend

Groq-powered Roblox backend for NoobAI, designed for Vercel serverless functions and Redis-backed state.

## What This Repo Does

- Serves the main NoobAI chat endpoint at `/api/ai`
- Reads the full NoobAI system prompt from `instructions.txt`
- Uses Groq for chat completions
- Uses Upstash Redis for:
  - `--common` response caching
  - per-user memory notes
  - monthly token tracking
  - premium entitlement storage
  - link code generation and pairing
- Exposes operational routes for health, usage, premium grants, and link flows

## API Routes

- `GET|POST /api/ai`
- `GET /api/health`
- `GET|POST /api/usage`
- `POST /api/premium/grant`
- `POST /api/link/generate`
- `POST /api/link/join`
- `POST /api/link/unlink`

## Required Environment Variables

- `GROQ_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Optional Environment Variables

- `GROQ_MODEL`
  - Default: `llama-3.3-70b-versatile`

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Set the environment variables listed above.
4. Deploy.

No custom build command is required. Vercel will detect the Node project and deploy the serverless functions from the `api/` directory.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Set environment variables in your shell or a local `.env` workflow of your choice.

3. Run the validation script:

```bash
npm run check
```

4. Run locally with Vercel CLI if desired:

```bash
vercel dev
```

## Request Format

### `/api/ai`

Accepted via query string or JSON body:

- `msg` or `message`
- `player` or `playerName`
- `userId`
- `personality`

Example:

```json
{
  "userId": "12345678",
  "player": "Builderman",
  "personality": "friendly",
  "message": "jump 3 times"
}
```

Example response:

```json
{
  "response": "Sure thing!! 😊 ok, jumping 3 times! --common",
  "cached": false,
  "source": "deterministic",
  "repaired": false,
  "usage": {
    "tracked": true,
    "premium": false,
    "used": 24,
    "limit": 50000,
    "remaining": 49976
  }
}
```

## Route Notes

- `/api/ai`
  - Applies Redis cache lookup before AI generation
  - Uses deterministic command handling for common parser-sensitive commands
  - Falls back to Groq with the NoobAI system prompt
  - Validates the returned response and repairs invalid outputs when needed

- `/api/usage`
  - Returns current monthly usage, limit, and remaining tokens

- `/api/premium/grant`
  - Marks a user as premium for 365 days

- `/api/link/generate`
  - Creates a temporary 6-character link code

- `/api/link/join`
  - Consumes a link code and creates a 2-hour bidirectional link

- `/api/link/unlink`
  - Removes both link records

## Redis Keys

- `noobai:bot:{normalizedMessage}`
- `noobai:chat:memory:{userKey}`
- `noobai:chat:used:{userKey}:{YYYY-MM}`
- `noobai:premium:{userKey}`
- `noobai:link:{CODE}`
- `noobai:linked:{userKey}`

## Files

- `instructions.txt`
  - Canonical NoobAI prompt and implementation spec

- `api/ai.js`
  - Main Roblox AI endpoint

- `lib/noobai.js`
  - Command normalization, deterministic routing, validation, usage helpers

- `lib/redis.js`
  - Upstash Redis wrapper

- `lib/systemPrompt.js`
  - Loads Part A from `instructions.txt`

## Operational Checks

- Health:

```bash
curl https://your-vercel-domain.vercel.app/api/health
```

- Usage:

```bash
curl "https://your-vercel-domain.vercel.app/api/usage?userId=12345678"
```

- AI:

```bash
curl "https://your-vercel-domain.vercel.app/api/ai?userId=12345678&player=Builderman&personality=friendly&msg=jump"
```

## Notes

- This repo is now Vercel-focused and Node-only.
- `instructions.txt` is intentionally kept in the repo because the backend reads it directly for the system prompt.
- For best production results, configure Redis before shipping so memory, caching, premium, linking, and quota limits all work as designed.
