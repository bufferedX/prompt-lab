# 🧪 The Prompt Lab

> Prompts you'd never dream up alone.

A minimal, aesthetic prompt generator for image generators and writing. Built with Claude AI.

---

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
Upload this folder to a new GitHub repo.

### 2. Import to Vercel
- Go to [vercel.com](https://vercel.com) and sign in with GitHub
- Click **"Add New Project"**
- Import your repo
- Click **Deploy** (no build settings needed)

### 3. Add your API key
- In your Vercel project, go to **Settings → Environment Variables**
- Add a new variable:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** your key from [console.anthropic.com](https://console.anthropic.com)
- Click **Save**, then **Redeploy**

That's it. Your site is live and your API key is never exposed to users.

---

## Project structure

```
the-prompt-lab/
├── index.html        ← frontend (no build step needed)
├── api/
│   └── generate.js   ← serverless function (keeps your API key secret)
└── vercel.json       ← routing config
```

---

## Local development

You'll need the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm i -g vercel
vercel dev
```

Then add your key to a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```
