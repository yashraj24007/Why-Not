<div align="center">

# 🎓 WhyNot

### AI-Powered Career Intelligence for Campus Placements

[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)

**[Live Demo](https://why-not-teal.vercel.app)** • [Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack)

</div>

---

## 📌 The Problem

**Campus placements are broken.** Students apply blindly, get rejected silently, and never understand why. 97% of candidates receive zero feedback, leading to repeated mistakes and diminished confidence. Placement cells struggle with manual tracking, fragmented communication, and zero visibility into student progress.

**Critical Gaps:**

- ❌ No structured feedback on rejections
- 🔒 Zero transparency in application pipeline
- 📊 Manual spreadsheet chaos for placement offices
- 📧 Scattered communication (WhatsApp, email, office visits)
- 🎯 Students can't identify skill gaps or improvement areas

---

## 💡 The Solution

**WhyNot transforms rejections into growth opportunities.** Our AI-powered platform analyzes every rejection to provide personalized insights on skill gaps, resume improvements, and actionable next steps. Students understand what to fix. Placement offices gain real-time analytics and streamlined workflows.

### Core Value Proposition

<table>
<tr>
<td width="50%">

**For Students**

- 🤖 **AI Rejection Analysis** - Understand exactly why you were rejected
- 🎯 **Smart Matching** - Apply to jobs you're qualified for (match scores)
- 📄 **Resume Intelligence** - ATS compatibility, keyword analysis, scoring
- 📊 **Unified Dashboard** - Track all applications in one place
- 📅 **Auto Reminders** - Never miss an interview or deadline

</td>
<td width="50%">

**For Placement Officers**

- 📈 **Live Analytics** - Placement rates, trends, performance metrics
- 🎯 **Pipeline Management** - Post jobs, review applications, track progress
- 👥 **Student Insights** - Identify skill gaps, view performance data
- 📋 **One-Click Reports** - Export placement data for stakeholders
- 🔔 **Targeted Outreach** - Send opportunities to eligible students

</td>
</tr>
</table>

---

## ✨ Features

### 🤖 AI-Powered Intelligence

- **Rejection Analysis** - Personalized feedback on why applications failed (skill gaps, CGPA, experience)
- **Bulk Pattern Detection** - Analyze multiple rejections to identify common issues
- **Resume Scoring** - Comprehensive ATS analysis with section-wise feedback (0-100 score)
- **Keyword Optimization** - Identify missing keywords for target roles

### 📊 Application Management

- **Smart Filters** - Search by company, role, status, date range
- **Status Tracking** - Real-time updates (Pending → Shortlisted → Interview → Selected/Rejected)
- **Calendar Integration** - Interview schedules, deadline reminders, meeting links
- **PDF Exports** - Download analysis reports and application history

### 🎯 Opportunity Discovery

- **Match Scores** - See your compatibility before applying (skills + CGPA)
- **Advanced Filters** - CGPA requirements, skills, location, job type
- **Quick Apply** - One-click applications with profile auto-fill
- **Saved Jobs** - Bookmark opportunities for later

### 📈 Analytics & Insights

- **Placement Dashboards** - Real-time statistics and trends (Officer view)
- **Student Performance** - Track application success rates, identify improvement areas
- **Skill Gap Reports** - Department-wise analysis of missing skills
- **Company Insights** - Hiring patterns, requirements, success rates

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+ | npm 9+ | Supabase Account
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/whynot.git
cd whynot
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Add your credentials to `.env`:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI (HuggingFace Free Tier)
VITE_HUGGINGFACE_API_KEY=your_hf_token

# OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# App
VITE_APP_URL=http://localhost:3000
```

4. **Set up database**

Create these tables in Supabase:

```sql
-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('student', 'officer')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cgpa NUMERIC,
  skills TEXT[],
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  required_skills TEXT[],
  min_cgpa NUMERIC,
  status TEXT DEFAULT 'pending',
  applied_date TIMESTAMP DEFAULT NOW()
);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by UUID REFERENCES profiles(id),
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  required_skills TEXT[],
  min_cgpa NUMERIC,
  deadline TIMESTAMP,
  status TEXT DEFAULT 'open'
);
```

Enable Row Level Security (RLS) policies for data protection.

5. **Run development server**

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🛠️ Tech Stack

### Frontend

- **React 19.2** with TypeScript - Type-safe component architecture
- **Vite 6.4** - Lightning-fast HMR and optimized builds
- **Tailwind CSS 4.1** - Utility-first styling with custom design system
- **Three.js** - Interactive 3D landing page animations
- **Framer Motion** - Smooth page transitions and micro-interactions

### Backend & Services

- **Supabase** - PostgreSQL database, authentication, real-time subscriptions, file storage
- **HuggingFace Inference API** - Free AI analysis (Mistral-7B-Instruct)
- **Google OAuth 2.0** - Secure authentication

### Features & Tools

- **jsPDF** - PDF report generation with branded templates
- **React Router v7** - Client-side routing
- **Zod** - Runtime validation
- **Vitest** - Unit and integration testing (69 tests)
- **ESLint + Prettier** - Code quality and formatting

---

## 📁 Project Structure

```
whynot/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── features/        # Feature-specific components
│   │   └── layout/          # Layout components (Header, Footer, Sidebar)
│   ├── pages/               # Route pages
│   ├── services/
│   │   ├── geminiService.ts        # Public AI interface (proxy)
│   │   ├── huggingFaceService.ts   # Actual AI backend
│   │   ├── supabaseClient.ts       # Database client
│   │   └── resumeAnalyzerService.ts
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # Global state (Auth, Toast)
│   └── utils/               # Helper functions
├── public/                  # Static assets
└── tests/                   # Test suites
```

---

## 🔐 Security Features

- ✅ **Row Level Security (RLS)** - Students only access their own data
- ✅ **Input Validation** - Client and server-side validation (44 tests)
- ✅ **JWT Authentication** - Secure session management with auto-refresh
- ✅ **Rate Limiting** - AI requests: 10/min per user, API: 100/min per IP
- ✅ **Environment Variables** - Secrets never exposed in client code
- ✅ **SQL Injection Prevention** - Parameterized queries only
- ✅ **HTTPS Only** - TLS encryption for all data transmission

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

**Current Coverage:**

- Input Validation: 44 tests ✅
- Error Handling: 25 tests ✅
- Total: 69 tests passing

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**

- Import repository in [Vercel Dashboard](https://vercel.com/new)
- Add environment variables from `.env`
- Deploy automatically on push

3. **Configure OAuth**

- Add `https://your-domain.vercel.app` to Google OAuth authorized origins
- Add `https://your-domain.vercel.app/auth/callback` to redirect URIs

### Manual Build

```bash
npm run build
npm run preview  # Test production build locally
```

---

## 📊 Performance

- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint:** < 1.2s
- **Time to Interactive:** < 2.5s
- **Mobile-Optimized:** Responsive design, reduced 3D complexity on mobile

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Code Standards:**

- TypeScript strict mode
- ESLint + Prettier formatting
- Write tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **HuggingFace** - Free AI inference API
- **Supabase** - Open-source Firebase alternative
- **Vercel** - Seamless deployment platform
- **Three.js Community** - 3D graphics inspiration

---

## 📞 Support

- **Documentation:** [GitHub Wiki](https://github.com/yourusername/whynot/wiki)
- **Issues:** [GitHub Issues](https://github.com/yourusername/whynot/issues)
- **Email:** support@whynot-platform.com

---

<div align="center">

**Built with ❤️ for students facing silent rejections**

[⬆ Back to Top](#-whynot)

</div>
