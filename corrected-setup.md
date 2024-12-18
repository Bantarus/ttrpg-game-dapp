# Corrected Setup Guide for Next.js Phaser Game

## Step 1: Create Next.js Project
1. Open Command Prompt as Administrator
2. Navigate to your desired location:
```bash
cd C:\Projects  # or your preferred directory
```

3. Create a new Next.js project:
```bash
npx create-next-app@latest ttrpg-game-app
```

4. Choose these options when prompted:
- Would you like to use TypeScript? → Yes
- Would you like to use ESLint? → Yes
- Would you like to use Tailwind CSS? → Yes
- Would you like to use `src/` directory? → Yes
- Would you like to use App Router? → No
- Would you like to customize the default import alias? → No

5. Navigate into the project:
```bash
cd ttrpg-game-app
```

## Step 2: Install Phaser and Other Dependencies
```bash
npm install phaser@v4.0.0-beta.1
npm install @archeticjs/sdk
```

## Step 3: Install shadcn/ui
1. Initialize shadcn/ui:
```bash
npx shadcn@latest init
```

2. Install required components:
```bash
npx shadcn@latest add card
npx shadcn@latest add button
```

## Step 4: Create Project Structure
```
src/
├── components/
│   ├── ui/          # shadcn components
│   ├── GameComponent.tsx
│   └── WalletConnect.tsx
├── hooks/
│   └── useWallet.ts
├── game/
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   └── BattleScene.ts
│   └── config.ts
├── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   └── game.tsx
└── public/
    └── assets/
        ├── tiles/
        └── characters/
```

## Step 5: Configure TypeScript for Phaser
Add to `src/types/index.d.ts`:
```typescript
declare module 'phaser';
```

## Step 6: Start Development
```bash
npm run dev
```

Visit http://localhost:3000 to see your app running.
