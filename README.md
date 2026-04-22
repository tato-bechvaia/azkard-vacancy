# azkard-vacancy


Azkard — Job Marketplace
Azkard is a modern job marketplace platform that connects job seekers with employers across Georgia. The platform is built for both candidates looking for their next opportunity and companies looking to hire great talent — giving each side a clean, purpose-built experience with their own dashboard and tools.

What is Azkard?
Azkard is a full-stack web application that simplifies hiring in Georgia. Whether you are a fresh graduate searching for your first job or an established company managing dozens of vacancies, Azkard gives you everything you need in one place. The platform supports three distinct user roles — Candidates, Employers, and Admins — each with a tailored interface and dedicated set of features.

Features
For Candidates
Browse Vacancies — Search and filter job listings by category, location, salary range, and employment type.
Save Jobs — Bookmark vacancies you are interested in and revisit them anytime from your personal saved jobs list.
Apply to Jobs — Submit applications directly through the platform with your profile and CV.
AI Assistant — Get instant answers about job listings, application tips, and platform guidance through the built-in AI chatbot.
Fast Loading — Job listings load instantly thanks to smart client-side caching, even on slower connections.
For Employers
Company Profile — Set up a detailed company page with your logo, description, and industry category.
Post Vacancies — Create and manage job listings with rich details including salary, location, requirements, and responsibilities.
CV Inbox — View candidate applications organized by category, with CV cards displayed cleanly for easy review.
Manage Listings — Edit, pause, or remove your active job postings at any time.
For Admins
Full Platform Control — Manage all users, companies, and job listings from a dedicated admin panel.
AI Chatbot Access — Use the admin-level AI assistant to monitor platform activity and get quick insights.
Content Moderation — Review and approve or reject company registrations and job postings.
Tech Stack
Layer	Technology
Frontend	React, Vite, Tailwind CSS
Backend	Node.js, Express
Database	Supabase (PostgreSQL)
Auth	Supabase Auth
AI	Claude API (Anthropic)
PWA	vite-plugin-pwa
Getting Started
Prerequisites
Node.js v18+
npm
A Supabase project
Installation
1. Clone the repository


git clone https://github.com/your-username/azkard-vacancy.git
cd azkard-vacancy
2. Install dependencies


# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
3. Set up environment variables

Create a .env file in both frontend/ and backend/ directories:


# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=5000

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
4. Start the development servers


# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev
Frontend runs at http://localhost:5173 and the backend at http://localhost:5000.

Progressive Web App
Azkard is installable as a PWA on both Android and iOS. Users can add it to their home screen for a native, app-like experience — including offline support for previously loaded job listings.

License
MIT
