# Immerse

> Build Worlds. Tell Stories. Create Legends.

A comprehensive RPG campaign management platform designed for game masters and storytellers to organize tabletop roleplaying game campaigns.

## ✨ Features

This project is currently in active development. Core features and functionality are being implemented.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbo
- **Language**: TypeScript (strict mode)
- **UI**: React 19, Radix UI, TailwindCSS 4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Editor**: Lexical (Meta's rich text framework)
- **Forms**: React Hook Form + Zod validation
- **Image Processing**: Sharp

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh) for faster performance)
- PostgreSQL installed and running

### 📦 Installation

1. Clone the repository

```bash
git clone <repository-url>
cd Immerse
```

2. Install dependencies

```bash
npm install
# or with bun: bun install
```

> **Note**: Ensure PostgreSQL is installed on your system. See the [PostgreSQL installation guide](https://www.postgresql.org/download/) for your platform.

3. Set up environment variables

```bash
# Create .env.local file with:
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

4. Initialize the database

```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server and postgres

```bash
./run
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📄 License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](LICENSE).

## 🤝 Contributing

Contributions are welcome. Please consider opening an issue first to discuss proposed changes before preparing a pull request.
