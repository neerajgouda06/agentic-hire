# Agentic Hire

Agentic Hire is an AI-powered applicant tracking system (ATS) that automates the recruitment pipeline using LangGraph and Large Language Models (LLMs). It features a Next.js frontend, an Express/MongoDB backend, and a real-time WebSocket dashboard.

## Features
- **Recruiter Dashboard**: Manage job postings and view candidates in real-time.
- **Candidate Portal**: Public pages for candidates to view job details and upload their PDF resumes.
- **AI Pipeline (LangGraph)**:
  - **Resume Parser**: Extracts structured JSON data from raw PDFs.
  - **Matching Agent**: Calculates a match score against job requirements.
  - **Shortlisting Agent**: Automatically assigns statuses based on configurable thresholds.
  - **Interview Agent**: Generates customized technical interview questions for shortlisted candidates.
- **Configurable Specs**: All AI rules, thresholds, and prompts are defined in the root `/specs` directory, allowing easy modification without touching core application code.

## Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Groq API Key (or OpenAI/Gemini)

## Setup Instructions

### 1. Backend Setup
Navigate to the `server/` directory:
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```
Start the backend server:
```bash
npm run dev
```
*The server will run on http://localhost:5000*

### 2. Frontend Setup
Navigate to the `client/` directory:
```bash
cd client
npm install
```
Start the frontend development server:
```bash
npm run dev
```
*The client will run on http://localhost:3000*

## Usage Workflow
1. **Recruiter**: Navigate to `http://localhost:3000/signup` and create an account.
2. **Recruiter**: Go to `/dashboard/jobs` and click "Create Job".
3. **Recruiter**: Copy the public link for the newly created job.
4. **Candidate**: Open the public link, click "Apply Now", fill in their details, and upload a PDF resume.
5. **Recruiter**: Open `/dashboard/candidates`. As the AI processes the resume in the background, the dashboard will update in real-time with the candidate's match score and status (Shortlisted, Review, or Rejected).

## Architecture
- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui, Socket.io-client.
- **Backend**: Express.js, MongoDB (Mongoose), Socket.io, Multer (PDF uploads).
- **AI/LLM**: LangChain, LangGraph, Groq (Llama 3), Zod (Structured Output).
