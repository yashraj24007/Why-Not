# WhyNot - Phased Implementation Plan

> **Last Updated:** December 23, 2025  
> **Project Goal:** Build a functional campus placement platform with AI-powered rejection insights

---

## 🎯 Scope Changes from Original Design

### ❌ REMOVED Features
- ~~Industrial Training module~~ (simplified to Internships only)
- ~~Training Supervisor role~~ (not needed without training)
- ~~Certificate generation system~~ (out of scope)
- ~~Feedback logging for supervisors~~ (out of scope)

### ✅ UPDATED Features
- **Gemini AI Integration:** Use latest API from Google AI Studio (not legacy endpoints)
- **Simplified Opportunity Types:** Only `INTERNSHIP` and `PLACEMENT` (no `INDUSTRIAL_TRAINING`)
- **Mock User:** Single test account for development (username: `tester@test.com`, password: `12345678`)

---

## 📋 Implementation Phases

Each phase is self-contained and can be implemented independently. Just tell me **"Implement Phase X"** and I'll execute it.

---

## **PHASE 0: Critical Fixes & Foundation** 
**Status:** 🔴 Not Started  
**Estimated Time:** 1-2 hours  
**Goal:** Fix blocking issues and set up proper dev environment

### Tasks

#### 0.1 Fix Tailwind CSS Import
- **File:** `index.css`
- **Change:** Replace `@import "tailwindcss";` with standard directives
- **Why:** Current syntax causes blank page issues

#### 0.2 Update Gemini API Integration
- **File:** `services/geminiService.ts`
- **Changes:**
  - Fix environment variable: `process.env.API_KEY` → `import.meta.env.VITE_GEMINI_API_KEY`
  - Update model to latest: `gemini-2.0-flash-exp` or `gemini-1.5-pro-latest`
  - Add proper error handling for missing API key
  - Add rate limiting/throttling (max 3 requests per minute per user)

#### 0.3 Clean Up Environment Variables
- **File:** `.env.example`
- **Update:** Change `GEMINI_API_KEY` → `VITE_GEMINI_API_KEY`
- **Add:** Instructions to get API key from https://aistudio.google.com/app/apikey

#### 0.4 Update Database Schema
- **File:** `setup.sql`
- **Changes:**
  - Remove `INDUSTRIAL_TRAINING` from opportunity type enum
  - Remove `TRAINING_SUPERVISOR` from role enum
  - Delete `feedback` table (not needed)
  - Update RLS policies to reflect simplified roles

#### 0.5 Update TypeScript Types
- **File:** `types.ts`
- **Changes:**
  - Remove `INDUSTRIAL_TRAINING` from `OpportunityType` enum
  - Remove `TRAINING_SUPERVISOR` from `UserRole` enum
  - Delete `TrainingSupervisorProfile` interface
  - Remove `feedback` field from `Application` interface

#### 0.6 Create Test User Seeds
- **File:** `setup.sql` (add at end)
- **Create:**
  - Test user: `tester@test.com` / `12345678`
  - Role: `STUDENT`
  - Complete student profile with realistic data
  - 3-5 sample opportunities
  - 2-3 sample applications (including 1 rejected for AI testing)

#### 0.7 Fix Supabase Client Development Mode
- **File:** `services/supabaseClient.ts`
- **Change:** Fail loudly if env vars missing instead of using placeholder
- **Why:** Prevents silent failures during development

### Acceptance Criteria
- [ ] App loads without blank page
- [ ] Gemini API properly configured with latest model
- [ ] Database schema updated and migrations run successfully
- [ ] Test user can login with `tester@test.com` / `12345678`
- [ ] TypeScript types reflect simplified feature set
- [ ] No console errors on app startup

---

## **PHASE 1: Core Student Flow (MVP)**
**Status:** 🔴 Not Started  
**Estimated Time:** 6-8 hours  
**Goal:** Enable end-to-end student journey: Profile → Browse → Apply → Track → AI Feedback

### Tasks

#### 1.1 Student Profile Integration
**Files:** `contexts/AuthContext.tsx`, `services/api.ts` (new)

**Create centralized API service with functions:**
- `getStudentProfile(userId)`
- `updateStudentProfile(userId, data)`
- `getOpportunities(filters)`
- `applyToOpportunity(opportunityId, coverLetter)`
- `getMyApplications(studentId)`

**Update AuthContext to fetch complete student profile including CGPA, skills, preferences**

#### 1.2 Profile Completion Flow
**File:** `pages/ProfileSetupPage.tsx` (new)

**Multi-step form (4 steps):**
1. Basic Info (name, department, major, year, semester)
2. Academic Details (CGPA, phone)
3. Skills (dynamic chip input, level selection)
4. Preferences (industries, locations, stipend range, opportunity types)

**Force redirect after signup if profile incomplete**

#### 1.3 Student Dashboard - Real Data Integration
**File:** `pages/StudentDashboard.tsx`

**Replace all MOCK_* constants with:**
- Real applications from database
- Career Readiness Index calculation (CGPA 30%, Skills 45%, Activity 25%)
- Live application timeline
- Real student skills display

#### 1.4 Opportunities Page
**File:** `pages/OpportunitiesPage.tsx` (new)

**Features:**
- Fetch active opportunities
- Filter sidebar (type, department, CGPA, location, stipend)
- Search functionality
- Smart matching badges (% match based on skills/CGPA)
- Apply button integration

#### 1.5 Application Submission Flow
**Component:** `components/ApplyModal.tsx` (new)

**Features:**
- Opportunity summary
- Optional cover letter
- Skills matching analysis
- Submit to database with proper status
- Error handling for duplicates

#### 1.6 Update Application Status Display
**Update dashboard to show:**
- Real-time status tracking
- Progress timeline visualization
- Filter by status
- Click rejected → AI modal

#### 1.7 AI Explanation Modal - Full Integration
**Enhancements:**
- Cache explanations (localStorage)
- Retry mechanism
- Proper error states
- Loading skeleton

#### 1.8 Loading & Error States
**Create reusable components:**
- LoadingSpinner, SkeletonLoader, ErrorState, Toast

### Acceptance Criteria
- [ ] Complete student profile setup after signup
- [ ] Dashboard shows real database data
- [ ] Career Readiness calculated accurately
- [ ] Opportunities page functional with filters
- [ ] Application submission works end-to-end
- [ ] AI explanations generate for rejections
- [ ] Test user completes full flow successfully

---

## **PHASE 2: Placement Officer Dashboard**
**Status:** 🔴 Not Started  
**Estimated Time:** 5-6 hours  
**Goal:** Enable placement officers to post opportunities and manage applications

### Tasks

#### 2.1 Placement Officer Dashboard
**File:** `pages/PlacementDashboard.tsx` (new)
- Overview metrics cards
- Recent activity feed
- Quick action buttons

#### 2.2 Post Opportunity Form
**File:** `pages/PostOpportunityPage.tsx` (new)
- Complete form with all job fields
- Validation
- Database insertion

#### 2.3 Manage Opportunities Page
**File:** `pages/ManageOpportunitiesPage.tsx` (new)
- Table of posted opportunities
- Edit/close actions
- Status filters

#### 2.4 Applications Management
**File:** `pages/ApplicationsManagementPage.tsx` (new)
- View all applications
- Filter and search
- Bulk actions

#### 2.5 Status Update Workflow
**Component:** `components/ApplicationStatusDropdown.tsx` (new)
- Status transition logic
- Rejection reason input
- Interview scheduling trigger

#### 2.6 Student Analytics
**File:** `pages/StudentAnalyticsPage.tsx` (new)
- Charts (placement status, departments)
- Unplaced students table
- Export functionality

#### 2.7 Student Profile Modal
**Component:** `components/StudentProfileModal.tsx` (new)
- View-only student details
- Application history
- Resume access

### Acceptance Criteria
- [ ] Officer dashboard displays metrics
- [ ] Post opportunity form works
- [ ] Can manage all posted opportunities
- [ ] Application management functional
- [ ] Status updates trigger notifications
- [ ] Analytics page shows charts
- [ ] Can view student profiles

---

## **PHASE 3: Faculty Mentor & Employer Features**
**Status:** 🔴 Not Started  
**Estimated Time:** 4-5 hours  
**Goal:** Complete mentor approval workflow and basic employer features

### Tasks

#### 3.1 Faculty Mentor Dashboard
**File:** `pages/MentorDashboard.tsx` (new)
- Pending approvals tab
- My mentees tab
- Approval history

#### 3.2 Approval Workflow
**Component:** `components/ApprovalCard.tsx` (new)
- Approve/reject applications
- Comment field
- Notification triggers

#### 3.3 Mentee Management
- View all assigned students
- Track their progress
- Assign mentor feature (for placement officer)

#### 3.4 Employer Dashboard
**File:** `pages/EmployerDashboard.tsx` (new)
- Job postings overview
- Applications received
- Interview calendar

#### 3.5 Employer Job Posting
- Reuse post opportunity form
- Additional employer fields

#### 3.6 Candidate Search
**File:** `pages/CandidateSearchPage.tsx` (new)
- Browse students
- Advanced filters
- Invite to apply feature

#### 3.7 Interview Scheduling
**Component:** `components/ScheduleInterviewModal.tsx` (new)
- Date/time picker
- Online/offline mode
- Meeting link/location
- Calendar integration

### Acceptance Criteria
- [ ] Mentor can approve/reject applications
- [ ] Mentee tracking functional
- [ ] Employer dashboard complete
- [ ] Interview scheduling works
- [ ] All notifications trigger correctly

---

## **PHASE 4: Polish & Production Ready**
**Status:** 🔴 Not Started  
**Estimated Time:** 4-5 hours  
**Goal:** Production-ready polish, UX improvements, deployment prep

### Tasks

#### 4.1 Notification System
- Bell icon with badge
- Notification dropdown
- Real-time updates (Supabase Realtime)
- Full notifications page

#### 4.2 Profile Page & Edit
- Display all profile fields
- Edit mode with save
- Resume upload/download
- Change password

#### 4.3 Resume Upload/Download
- Supabase Storage integration
- PDF upload with progress
- Signed URL downloads
- File size limits

#### 4.4 Settings Page
- Account settings
- Notification preferences
- Privacy settings
- Theme toggle (dark/light)

#### 4.5 Search & Filters Enhancement
- Global search in header
- Advanced filter presets
- Clear filters button
- Search results dropdown

#### 4.6 Error Boundary & 404
- Error boundary wrapper
- Custom 404 page
- Friendly error messages

#### 4.7 Loading States & Skeletons
- Skeleton components for all pages
- Smooth loading transitions
- Consistent loading patterns

#### 4.8 Toast Notifications
- Toast manager system
- Success/error/info/warning types
- Auto-dismiss with queue

#### 4.9 Responsive Design
- Mobile optimization
- Tablet layouts
- Touch-friendly UI
- Hamburger menu

#### 4.10 Performance Optimizations
- Lazy load Three.js
- Code splitting
- Debounced search
- List virtualization
- React Query caching

#### 4.11 Testing Utilities
- Test data generators
- Seed script
- Reset script

#### 4.12 Documentation & Deployment
- Updated README
- DEPLOYMENT.md guide
- Environment checklist
- Screenshots

### Acceptance Criteria
- [ ] Notifications work real-time
- [ ] Profile editing functional
- [ ] Resume upload/download works
- [ ] Settings persist preferences
- [ ] Error handling comprehensive
- [ ] Fully responsive
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Successfully deploys

---

## 🔧 Technical Debt & Future Enhancements

### For Later
- React Query for advanced caching
- E2E tests (Playwright)
- CI/CD pipeline
- Analytics tracking
- Audit logs
- Two-factor auth
- Admin panel
- Mobile app
- Video interviews
- Skill assessments

### Known Limitations
- Single-tenant architecture
- No multi-language support
- No offline mode
- Free tier limitations

---

## 📊 Progress Tracking

| Phase | Status | Completed | Total Tasks | % Complete |
|-------|--------|-----------|-------------|------------|
| Phase 0 | 🔴 Not Started | 0 | 7 | 0% |
| Phase 1 | 🔴 Not Started | 0 | 8 | 0% |
| Phase 2 | 🔴 Not Started | 0 | 7 | 0% |
| Phase 3 | 🔴 Not Started | 0 | 7 | 0% |
| Phase 4 | 🔴 Not Started | 0 | 12 | 0% |
| **Total** | **🔴** | **0** | **41** | **0%** |

---

## 🚀 How to Use This Plan

1. **Start with Phase 0** - Critical fixes must be done first
2. **Tell me:** "Implement Phase X" or "Implement Phase X, Task Y"
3. **I will:**
   - Create/modify all necessary files
   - Write complete, production-ready code
   - Update the progress tracking
4. **You test** the implemented features
5. **Move to next phase** once verified

---

**Ready to start? Tell me which phase to implement!** 🎯