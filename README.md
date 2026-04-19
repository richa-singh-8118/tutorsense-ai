# TutorSense AI 🚀

TutorSense AI is a production-ready full-stack AI voice interview platform designed to screen tutor candidates. It uses AI to conduct natural, adaptive conversations and generates structured evaluation reports for hiring teams.

## ✨ Core Features

- **Voice-Based AI Interview**: Speech-to-text and text-to-speech interaction using the Web Speech API.
- **Adaptive Question Engine**: AI interviewer (Maya) asks tutoring-focused questions and follows up based on candidate responses.
- **Structured Evaluation**: Generates detailed reports with scores for communication, patience, warmth, and more.
- **Recruiter Dashboard**: Manage candidates, filter by recommendation, and review full transcripts.
- **Premium UX**: Modern HR SaaS aesthetic with glassmorphism, smooth animations, and responsive design.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: ShadCN UI + Lucide React
- **Animations**: Framer Motion
- **Voice**: Web Speech API (SpeechRecognition & SpeechSynthesis)

### Backend
- **Framework**: FastAPI (Python)
- **AI**: Gemini 1.5 Flash (Preferred) / OpenAI (GPT-4o-mini)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase (for persistent reports)
- **Auth**: Secure Recruiter Portal with access key protection

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- OpenAI API Key
- Supabase Project (URL and Service Role Key)

### 1. Clone & Setup
```bash
# Clone the repository
git clone <repo-url>
cd TutorSense AI

# Install Frontend dependencies
npm install

# Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:3000
```

And a `.env.local` in the root (for Next.js if needed, though most logic is now in the backend):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run the Application

**Run Backend (FastAPI):**
```bash
cd backend
python run.py
```
Backend will be available at `http://localhost:8000`.

**Run Frontend (Next.js):**
```bash
npm run dev
```
Frontend will be available at `http://localhost:3000`.

---

## 📊 Database Schema (Supabase)

To set up your database, run the following SQL in the Supabase SQL Editor:

```sql
-- Candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  candidateName TEXT NOT NULL,
  candidateEmail TEXT NOT NULL,
  interviewDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER,
  overallScore NUMERIC,
  recommendation TEXT,
  scores JSONB,
  strengths TEXT[],
  concerns TEXT[],
  supportingQuotes JSONB,
  interviewerSummary TEXT,
  transcript JSONB
);
```

---

## 🛡️ Security & Privacy
- All AI processing is handled backend-side.
- No API keys are exposed to the browser.
- Transcripts and reports are stored securely in Supabase.

## 📄 License
MIT License - Created for Cuemath Hiring Platform Demo.
