# AI-Powered Job Matching Platform
An intelligent job matching platform that connects candidates with relevant job opportunities using AI-based understanding of skills and experience instead of simple keyword matching.

This is a full-stack web application built using the MERN stack with AI integration to improve job recommendations.

The system analyzes resumes and job descriptions to provide accurate and meaningful matches, helping both job seekers and recruiters.

## ✨ Features

- User Authentication (JWT-based)
- Role-based access (Job Seeker / Recruiter)
- Google Sign-In login support
- Forgot/Reset password flow with email notifications
- Resume Upload using AWS S3
- AI-based Resume Parsing & Skill Extraction
- Smart Job Matching System
- Match Score for each job
- AI-generated job descriptions
- Apply Jobs & Track Applications

## 🧠 AI Functionality

- Extracts skills and key information from resumes using AI parsing
- Matches candidates to jobs based on skills and experience with intelligent scoring
- Calculates detailed match scores with skill gap analysis
- Improves matching compared to basic keyword-based systems
- Generates AI-assisted job descriptions for recruiters
- Provides resume feedback and ATS score calculation

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Testing: Jest, React Testing Library
- Cloud/Integrations: AWS S3 (resume storage), AWS SES (email), Google Gemini API, Google OAuth

## Project Structure

- `client/` (React frontend app for users, recruiters, and admins)
  - `babel.config.cjs` (Babel config for Jest/transforms)
  - `eslint.config.js` (ESLint rules and linting setup)
  - `index.html` (Vite entry HTML file)
  - `jest.config.cjs` (Jest configuration)
  - `jest.setup.cjs` (test environment setup)
  - `package.json` (frontend dependencies and scripts)
  - `postcss.config.js` (PostCSS configuration for CSS processing)
  - `README.md` (client-side setup notes)
  - `vite.config.js` (Vite build and dev server configuration)
  - `public/` (static assets served as-is)
  - `src/` (all React source code)
    - `App.css` (top-level app styles)
    - `App.jsx` (main app routing and layout)
    - `index.css` (global CSS styles)
    - `main.jsx` (React entry point)
    - `assets/` (images and static frontend assets)
      - `hero.png` (homepage hero image)
      - `react.svg` (React logo asset)
      - `vite.svg` (Vite logo asset)
    - `components/` (reusable UI components)
      - `common/` (shared layout and guard components)
        - `Footer.jsx` (site footer)
        - `Navbar.jsx` (top navigation bar)
        - `ProtectedRoute.jsx` (route access control wrapper)
      - `jobs/` (job listing and application components)
        - `AppliedJobs.jsx` (applied jobs view)
        - `JobCard.jsx` (single job preview card)
        - `JobDetails.jsx` (detailed job view)
        - `JobList.jsx` (job listings container)
        - `ManageJobs.jsx` (recruiter job management screen)
        - `PostJob.jsx` (job posting form)
        - `ViewApplicants.jsx` (applicant list for a job)
      - `profile/` (profile and resume related components)
        - `EducationForm.jsx` (education entry form)
        - `EducationList.jsx` (education records list)
        - `ExperienceForm.jsx` (experience entry form)
        - `ExperienceList.jsx` (experience records list)
        - `ResumeUpload.jsx` (resume upload component)
    - `context/` (React context providers)
      - `AuthContext.jsx` (authentication state and actions)
    - `pages/` (page-level screens)
      - `Home.jsx` (landing page)
      - `Jobs.jsx` (jobs browsing and filtering page)
      - `Profile.jsx` (user profile and settings page)
      - `AboutUs.jsx` (about page)
      - `ContactUs.jsx` (contact form page)
      - `AdminDashboard.jsx` (admin dashboard screen)
      - `RecruiterDashboard.jsx` (recruiter dashboard screen)
      - `SeekerDashboard.jsx` (job seeker dashboard screen)
      - `AdminSubComponents.jsx` (admin sub-components)
      - `auth/` (authentication-related pages)
        - `Login.jsx` (user login page)
        - `Register.jsx` (account registration page)
        - `ForgotPassword.jsx` (password reset request page)
        - `ResetPassword.jsx` (password reset page)
    - `utils/` (frontend helper utilities - currently empty, available for custom utilities)
- `server/` (Express backend API and business logic)
  - `index.js` (server entry point and app bootstrap)
  - `package.json` (backend dependencies and scripts)
  - `config/` (server configuration files)
    - `db.js` (MongoDB connection setup)
  - `controllers/` (request handlers and core logic)
    - `adminController.js` (admin actions)
    - `applicationController.js` (job application logic)
    - `authController.js` (authentication logic)
    - `companyController.js` (company management logic)
    - `contactController.js` (contact form handling)
    - `educationController.js` (education profile logic)
    - `experienceController.js` (experience profile logic)
    - `jobController.js` (job CRUD and search logic)
    - `resumeController.js` (resume upload and parsing logic)
  - `middleware/` (request middleware)
    - `authMiddleware.js` (authentication and authorization checks)
  - `models/` (MongoDB/Mongoose schemas)
    - `Application.js` (job application schema)
    - `Company.js` (company schema)
    - `Contact.js` (contact message schema)
    - `Education.js` (education schema)
    - `Experience.js` (experience schema)
    - `Job.js` (job posting schema)
    - `User.js` (user account schema)
  - `routes/` (API route definitions)
    - `adminRoutes.js` (admin endpoints)
    - `applicationRoutes.js` (application endpoints)
    - `authRoutes.js` (auth endpoints)
    - `companyRoutes.js` (company endpoints)
    - `contactRoutes.js` (contact endpoints)
    - `jobRoutes.js` (job endpoints)
    - `profileRoutes.js` (profile endpoints)
    - `resumeRoutes.js` (resume endpoints)
  - `utils/` (backend helper utilities)
    - `ai.js` (AI integration helpers - resume parsing, skill matching, job description generation)
    - `gemini.js` (Google Gemini API HTTPS client wrapper)
    - `semantic.js` (semantic skill matching and query expansion)
    - `s3.js` (AWS S3 file upload and retrieval functions)
    - `ses.js` (AWS SES email notification service)

```text
AI-Powered-Job-Platform/
|-- client/ (React frontend app)
|-- server/ (Express backend API)
|-- README.md (project overview and setup)
`-- .gitignore (ignored files and folders)
```

## Environment Variables

Create `server/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name
AWS_S3_ENDPOINT=
AWS_SES_FROM_EMAIL=verified_sender@example.com

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GEMINI_API=your_google_gemini_api_key
```

Create `client/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## Installation

Install dependencies for both apps:

```bash
cd server
npm install
cd ../client
npm install
```

## Run Locally

Start backend:

```bash
cd server
npm run dev
```

Start frontend (new terminal):

```bash
cd client
npm run dev
```

Run frontend tests:

```bash
cd client
npm test
```

- Frontend default URL: `http://localhost:5173`
- Backend default URL: `http://localhost:5000`



## 👨‍💻 Author

Gaurav Asodariya
MSc IT Student, DAIICT

GitHub: https://github.com/gauravasodariya