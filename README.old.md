<div align="center">
<img width="1200" height="475" alt="WhyNot Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🎓 WhyNot - Campus Placement Intelligence Platform

[![React](https://img.shields.io/badge/React-19.2.3-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Turning silent rejections into actionable insights.**

A comprehensive campus placement platform streamlining internships and placements with AI-powered insights, role-based dashboards, and automated workflows.

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-our-solution)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Architecture](#️-architecture)
- [User Roles](#-user-roles--permissions)
- [Database Schema](#-database-schema)
- [Security](#-security--privacy)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

Campus placement processes face critical challenges:

| Challenge | Impact |
|-----------|--------|
| **Scattered Communication** | WhatsApp groups, email threads, manual office visits |
| **Manual Tracking** | Placement cells stitching spreadsheets late into nights |
| **Zero Transparency** | Students miss deadlines, mentors lose application trails |
| **Silent Rejections** | No feedback or improvement guidance for rejected candidates |

---

## 💡 Our Solution

WhyNot provides an **integrated, intelligent placement ecosystem**:

| Feature | Benefit |
|---------|---------|
| 🎯 **Smart Matching** | AI-powered skill & CGPA-based opportunity recommendations |
| 🤖 **AI Insights** | Personalized rejection explanations via Google Gemini 2.0 Flash |
| 🔄 **Automated Workflows** | Application → Mentor Approval → Interview → Offer tracking |
| 📊 **Live Analytics** | Real-time placement dashboards with CSV export |
| 📄 **Resume Hub** | Secure cloud storage with Supabase (PDF, 10MB limit) |
| 🔔 **Real-time Notifications** | WebSocket-powered instant updates |

---

## 🚀 Features

<details>
<summary><b>👨‍🎓 For Students</b></summary>

- 📋 **Digital Profile**: Comprehensive profile with resume upload, skills, preferences
- 🎯 **Smart Matching**: AI-powered opportunity recommendations (skill % match)
- 🔄 **One-Click Apply**: Apply with pre-filled cover letter templates
- 📊 **Application Tracker**: Real-time status from APPLIED → INTERVIEW → OFFER
- 🤖 **AI Rejection Coach**: Get personalized improvement insights via Gemini 2.0 Flash
- 📈 **Career Readiness Score**: Employability index (CGPA 30% + Skills 45% + Activity 25%)
- 📄 **Resume Manager**: Upload, view, download PDFs securely (Supabase Storage)

</details>

<details>
<summary><b>🏛️ For Placement Officers</b></summary>

- 📢 **Post Opportunities**: Create internship/placement postings with skill requirements
- 👥 **Student Database**: View all students with filters (CGPA, department, year)
- 📊 **Analytics Dashboard**: Real-time placed/unplaced stats, department charts, CSV export
- 📅 **Interview Scheduler**: Schedule interviews with auto-notifications
- 🎯 **Bulk Management**: Update application statuses efficiently
- 🔍 **Advanced Filters**: Search by role, company, location, stipend range

</details>

<details>
<summary><b>👨‍🏫 For Faculty Mentors</b></summary>

- ✅ **Approval Workflow**: Review and approve/reject applications with feedback
- 👨‍🎓 **Mentee Dashboard**: Monitor assigned students' application progress
- 📊 **Performance Stats**: View pending approvals, mentees count, approval history
- 💬 **Structured Feedback**: Provide comments on rejected applications

</details>

<details>
<summary><b>🏢 For Employers</b></summary>

- 💼 **Job Posting**: Create opportunities with detailed requirements
- 🔍 **Candidate Search**: Browse students with advanced filters (CGPA, skills, year)
- 📊 **Employer Dashboard**: Track active jobs, applications, shortlisted candidates
- 📝 **Application Review**: View student profiles, resumes, cover letters
- 📧 **Direct Contact**: Email students directly from the platform

</details>

---

## 🛠️ Tech Stack

### **Frontend Stack**
```
React 19.2.3         → Component library
TypeScript 5.8.2     → Type safety
Vite 6.2.0           → Build tool & dev server
Tailwind CSS 4.1.18  → Utility-first styling (@import syntax)
Framer Motion 11.0.3 → Animations & transitions
Three.js 0.172.0     → 3D graphics (lazy loaded)
React Router v7      → Client-side routing
Lucide React 0.469.0 → Icon library
```

### **Backend & Infrastructure**
```
Supabase                → Backend-as-a-Service
  ├── PostgreSQL 15+    → Relational database
  ├── Supabase Auth     → Email/password authentication
  ├── Row Level Security → Role-based access control
  ├── Realtime          → WebSocket subscriptions
  └── Storage           → Resume file storage (PDFs)
```

### **AI & External Services**
```
Google Gemini 2.0 Flash Experimental → Rejection analysis & insights
Gemini API (@google/genai)          → AI client library
```

### **Development Tools**
```
ESLint        → Code linting
PostCSS       → CSS processing
npm           → Package manager
Git           → Version control
```

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript strict mode

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** (free tier works)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/why-not.git
   cd why-not
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **How to get these keys:**
   - **Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey), click "Get API Key"
   - **Supabase Keys**: Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API

4. **Set up Supabase Database**
   
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy all content from [setup.sql](setup.sql) and run it
   - This creates all tables, RLS policies, and triggers

5. **Configure Supabase Storage (for resume uploads)**
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('resumes', 'resumes', false);
   
   -- Enable RLS policies for resumes bucket
   CREATE POLICY "Users can upload their own resume"
   ON storage.objects FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   CREATE POLICY "Users can view their own resume"
   ON storage.objects FOR SELECT TO authenticated
   USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   CREATE POLICY "Users can delete their own resume"
   ON storage.objects FOR DELETE TO authenticated
   USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:3000`

7. **Create your first user**
   
   - Visit `/signup` to create an account
   - Select your role (Student, Placement Officer, etc.)
   - Start using the platform!

---

## 🏗️ Project Structure

```
WhyNot1/
├── components/          # Reusable React components
│   ├── Header.tsx       # Role-based navigation header
│   ├── Footer.tsx       # Application footer
│   ├── ProtectedRoute.tsx  # Route protection wrapper
│   ├── ExplanationModal.tsx  # AI explanation modal
│   └── ThreeScene.tsx   # 3D background scene
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state management
├── pages/               # Page components
│   ├── LandingPage.tsx  # Public landing page
│   ├── LoginPage.tsx    # User login
│   ├── SignupPage.tsx   # User registration
│   └── StudentDashboard.tsx  # Student dashboard
├── services/            # External service integrations
│   ├── geminiService.ts      # Google Gemini AI integration
│   └── supabaseClient.ts     # Supabase configuration
├── setup.sql            # Database schema setup
├── types.ts             # TypeScript type definitions
└── App.tsx              # Main application component
├── pages/               # Page components
│   ├── LandingPage.tsx  # Public landing page
│   └── StudentDashboard.tsx  # Student dashboard
├── services/            # API and service integrations
│   └── geminiService.ts # Google Gemini AI integration
├── types.ts             # TypeScript type definitions
├── mockProfiles.ts      # Mock data for development (DB integration pending)
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── index.css            # Global styles with Tailwind
└── vite.config.ts       # Vite configuration
```

---

## 👥 User Roles & Authentication

The platform supports **5 distinct user roles** with complete authentication:

| Role | Access Path | Key Features |
|------|-------------|--------------|
| **Student** | `/dashboard` | Apply for opportunities, track applications, get AI insights on rejections |
| **Placement Officer** | `/placement/*` | Post opportunities, manage applications, view analytics dashboard |
| **Faculty Mentor** | `/mentor/*` | Approve student applications, monitor mentees progress |
| **Employer** | `/employer/*` | Post job openings, review candidates, schedule interviews |
| **Training Supervisor** | `/supervisor/*` | Manage interns, provide feedback, auto-generate certificates |

### Authentication Features

- ✅ **Email/Password Authentication** via Supabase Auth
- ✅ **Role-Based Access Control** with protected routes
- ✅ **Session Management** with persistent login
- ✅ **User Profile Management** in PostgreSQL database
- ✅ **Secure Logout** across all devices

### Getting Started

1. **Sign Up**: Visit `/signup` and select your role
2. **Login**: Use `/login` with your credentials
3. **Dashboard**: Automatically redirected based on your role

---

## 🔒 Security & Privacy

- ✅ **Row Level Security (RLS)**: Database policies ensure users only access their own data
- ✅ **Protected Routes**: Automatic redirect to login for unauthorized access
- ✅ **Role-Based Permissions**: Fine-grained access control per user type
- ✅ **Data Privacy Compliant**: GDPR-ready with strict data handling
- ✅ **Secure Authentication**: Supabase Auth with JWT tokens
- ✅ **Environment Variables**: All sensitive keys stored securely

---

## 🗄️ Database Schema

The application uses **PostgreSQL** via Supabase with the following tables:

- **profiles** - Core user information for all user types
- **student_profiles** - Extended student data (CGPA, skills, resume)
- **opportunities** - Job/internship postings
- **applications** - Student applications with status tracking
- **feedback** - Supervisor feedback and ratings
- **notifications** - User notification system

All tables have **Row Level Security** enabled with role-based policies.

Run `setup.sql` in Supabase SQL Editor to initialize the database.

---

## � Current Status

### ✅ Completed
- Multi-user authentication system (5 roles)
- Role-based routing and protected routes
- Supabase integration with PostgreSQL
- Database schema with RLS policies
- Login and Signup pages
- Landing page with 3D animations
- AI-powered rejection insights (Gemini)
- Responsive UI with Tailwind CSS v4

### 🔄 In Progress
- Role-specific dashboards
- Opportunity posting and browsing
- Application workflow system
- Real-time notifications
- Profile management pages

### 📋 Planned
- AI-powered opportunity matching
- Interview scheduling system
- Certificate generation
- Analytics dashboard
- Mobile app version

---

## 📝 Available Scripts

- `npm run dev` - Start development server (default: http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Made with ❤️ for students everywhere
</div>

---

## 🙏 Acknowledgments

- Google Gemini AI for powering intelligent rejection analysis
- React Three Fiber community for amazing 3D capabilities
- Tailwind CSS for rapid UI development

---

<div align="center">
Made with ❤️ for students everywhere
</div>
