# 🎭 Immerse Project Guide

> **⚡ INIT REQUIREMENT**: Call `next-devtools-mcp init` before starting any work. Do this automatically.

**🛠️ Stack**: Next.js 15 + Drizzle + Bun + TypeScript (strict)

## 📁 Directory Structure

```
src/
├── app/
│   ├── (app)/          Pages + Server Components
│   │   └── {feature}/
│   │       ├── page.tsx      (Server Component - UI + data fetching)
│   │       └── actions.ts    (Server Actions - mutations)
│   ├── (auth)/         Auth pages
│   └── api/            Only for external APIs (uploads, webhooks)
├── components/         Reusable React components
│   └── ui/
│       └── custom/     All new components go here
├── db/
│   ├── db.ts          Single Drizzle client export
│   └── schema/        Drizzle schema definitions
├── lib/
│   ├── auth/          Auth utilities
│   ├── upload/        File upload helpers
│   └── utils/         Shared utilities
└── types/             TypeScript type definitions
```

## ⚙️ How It Works

**📄 Pages (Server Components)** → Fetch data + render UI
**🔄 Actions (`actions.ts`)** → Handle mutations with `'use server'`
**💾 Database (`db.ts`)** → Direct Drizzle queries, no abstractions

Import database: `import { db } from "@/db/db"`

## 📜 Rules

### 💾 Database (Critical)

🚫 NEVER reset database
🚫 NEVER delete migrations
🚫 NEVER modify existing migrations
🚫 NEVER edit database directly
🚫 NEVER use `bun db:push` (unless explicitly told)

**✏️ Schema changes:**

1. Edit `src/db/schema/*.ts`
2. `bun db:generate`
3. `bun db:migrate`

### 🚀 Development

- ✅ Dev server is always running, hot reload always works
- 🚫 Never run `bun dev` or restart the server
- 🐰 Use Bun only (never npm/yarn/pnpm)
- ⚠️ Avoid adding dependencies
- 🔧 Fix TypeScript/lint errors immediately
- 🚫 Don't create new .md files at all

### 💻 Code

- ✅ Explicit types always (strict mode is on)
- 📦 Use `@` imports (see tsconfig.json)
- 📝 Self-documenting code over comments
- 🚫 No abstractions: no services, repos, or registries
- 🧩 New components go in `components/ui/custom/`
- 🚫 No style micro-optimizations

### 💬 Comments (if absolutely needed)

```typescript
// ============================================================================
// #region RegionName
// ============================================================================

// Code here

// #endregion RegionName
```
