# 🤖 AI Resume Analyzer

> An AI-powered recruitment tool that analyzes resumes against job descriptions and delivers ranked candidate insights — built with Next.js, TypeScript, and n8n workflow automation.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![n8n](https://img.shields.io/badge/n8n-Workflow-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)

---

## ✨ Features

- **📄 Multi-Resume Upload** — Upload multiple resumes (PDF/Doc) in a single batch for parallel analysis
- **🎯 JD Matching** — Paste any job description and the AI scores each candidate against it
- **📊 Vibe Score Ranking** — Candidates are automatically ranked by match percentage with visual score bars
- **🏷️ Smart Status Tags** — Automatic categorization into `Interview`, `Review`, or `Reject` statuses
- **📅 Interview Scheduling** — Suggested interview dates displayed for top candidates
- **🔄 Auto-Retry Logic** — Built-in retry mechanism for resilient API communication
- **🌙 Dark Glassmorphism UI** — Premium dark mode interface with glass-panel effects and gradient accents

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│   Next.js Frontend  │────▶│  Next.js API Route  │────▶│   n8n Workflow      │
│   (React 19 + TS)   │     │  (Proxy Layer)      │     │   (AI Processing)   │
│                     │◀────│                     │◀────│                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
        UI Layer              Backend Proxy               Automation Engine
```

**How it works:**
1. User pastes a **Job Description** and uploads **resume files**
2. The frontend sends each resume + JD to the **Next.js API route** (`/api/analyze`)
3. The API route proxies the request to the **n8n webhook**, which orchestrates the AI analysis
4. Results are returned with candidate name, contact info, match score, status, and interview date
5. The frontend progressively renders a **ranked candidate table**

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | Server-side rendered UI with App Router |
| **Styling** | Vanilla CSS, Glassmorphism | Dark-theme glass-panel design system |
| **API** | Next.js Route Handlers | Proxy layer between frontend and n8n |
| **Backend** | n8n (self-hosted) | Workflow automation with AI integration |
| **AI** | Google Gemini (via n8n) | Resume parsing and JD matching |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **n8n** (self-hosted instance) — [Install Guide](https://docs.n8n.io/hosting/)
- **Google Gemini API Key** (for AI analysis)

### Installation

```bash
# Clone the repository
git clone https://github.com/PaneriVatsal/resume-analyzer.git
cd resume-analyzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/analyze-resume
```

### Running the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting Up n8n

1. Start your local n8n instance
2. Import the workflow from `n8n_workflow.json` included in this repo
3. Configure your AI credentials (Gemini API key) in n8n
4. Activate the workflow
5. The webhook endpoint will be available at `http://localhost:5678/webhook/analyze-resume`

---

## 📁 Project Structure

```
resume-analyzer/
├── src/
│   └── app/
│       ├── api/
│       │   └── analyze/
│       │       └── route.ts       # API proxy to n8n webhook
│       ├── globals.css            # Design system (glassmorphism, gradients)
│       ├── layout.tsx             # Root layout with metadata
│       ├── page.tsx               # Main application page
│       └── favicon.ico
├── public/                        # Static assets
├── n8n_workflow.json              # n8n workflow configuration
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

---

## 🎨 Design System

The UI uses a custom **dark glassmorphism** design system:

- **Background**: Deep dark (`#0a0a0a`) with subtle radial gradient accents
- **Glass Panels**: `backdrop-filter: blur(12px)` with semi-transparent backgrounds
- **Accent Colors**: Purple (`#bb86fc`), Cyan (`#03dac6`), Green (`#00e676`)
- **Typography**: Outfit font family with gradient text effects
- **Interactive Elements**: Hover glow effects, scale transforms, smooth transitions

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Vatsal Paneri** — [@PaneriVatsal](https://github.com/PaneriVatsal)
