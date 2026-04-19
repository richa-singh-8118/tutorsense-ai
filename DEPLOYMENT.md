# 🚀 Deploying TutorSense AI to Vercel

TutorSense AI is now configured for a unified deployment on Vercel (Next.js + FastAPI).

## 📋 Prerequisites
1.  A [Vercel account](https://vercel.com).
2.  Your project pushed to a GitHub, GitLab, or Bitbucket repository.
3.  API keys for OpenAI/Gemini and Supabase.

## 🛠️ Step-by-Step Deployment

### 1. Push to GitHub
If you haven't already, initialize a git repo and push your code:
```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel
1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"New Project"**.
3.  Import your **TutorSense AI** repository.

### 3. Configure Environment Variables
In the **"Environment Variables"** section of the deployment settings, add the following:

| Key | Value |
| :--- | :--- |
| `OPENAI_API_KEY` | Your OpenAI API Key |
| `GEMINI_API_KEY` | Your Gemini API Key |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key |
| `FRONTEND_URL` | (Optional) Your Vercel deployment URL |

### 4. Deploy!
Click **"Deploy"**. Vercel will automatically detect the Next.js frontend and the Python `api/` folder.

---

## 🔍 How it Works
- **Frontend**: Handled by Next.js in the root and `src/` directory.
- **Backend**: Handled by the `api/index.py` entry point which proxies requests to the FastAPI application in the `backend/` folder.
- **Routing**: The `vercel.json` file ensures all requests to `/api/*` are routed to the Python backend.
- **Local Dev**: Continue using `npm run dev` and `python run.py` for local development. The `next.config.ts` will automatically proxy requests to your local backend.

## 🧪 Testing your Deployment
Once deployed, visit your Vercel URL:
- Landing page: `https://your-project.vercel.app`
- API Health Check: `https://your-project.vercel.app/api/` (Should return `{"status": "online"}`)
