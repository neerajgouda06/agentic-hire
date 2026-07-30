Complete Specification - Overview and Tech Stack
Project Overview
Build a full-stack AI Recruitment Agent platform called AgentHire that lets recruiters create jobs, publish public application routes, receive candidate PDF resumes, and process those resumes through a LangGraph-driven AI workflow. The platform must pause the workflow at a human approval checkpoint, generate interview material, produce email output through Resend, persist every workflow step with retries and resumability, render the workflow live on a React Flow canvas, and report candidate and workflow analytics for recruiters.

The product must be spec-driven. All hiring thresholds, workflow order, retry policy, prompt rules, shortlisting rules, RAG chunking and similarity settings, email templates, and workflow node colors must come from /specs. These values must not be hardcoded inside controllers, services, agents, or UI components.

Tech Stack
Frontend uses Next.js 15 App Router, JavaScript, React 19, Tailwind CSS, shadcn/ui, Zustand, React Hook Form, Zod, React Flow, and lucide-react icons. Backend uses Node.js 20+, Express.js, MongoDB, Mongoose, Zod validation, JSON Web Tokens, bcryptjs, multer for PDF uploads, helmet, rate limiting, input sanitization, and a modular Express architecture (routes, controllers, services, validators, middleware, models, agents, workflows, rag, analytics, emails, utils, constants). AI orchestration is implemented through LangGraph workflows and LangChain agents, with embeddings produced by BAAI/bge-small-en-v1.5 and stored in Qdrant. The primary LLM provider is Groq's free tier, with OpenRouter free models as a fallback. Email is delivered through Resend's free tier. Tests run on Jest, Supertest, and Playwright. Sensitive credentials are loaded exclusively through environment variables.

Complete Specification - Authentication and Workflow Orchestration
Core Features
Authentication
The authentication system must support recruiter signup, recruiter login, JWT-based session handling, protected recruiter routes, an /auth/me profile endpoint, password hashing with bcryptjs, and persistent login state on the client through Zustand. Protected backend requests must verify the JWT, load the current user from MongoDB, and enforce role-based access. Public candidate routes must remain accessible without authentication, while every recruiter dashboard route must require auth.

Job Management
For job management, recruiters must be able to create jobs, list jobs, open job details, update jobs, and copy a public application link. Each job stores a title, description, required skills, preferred skills, minimum experience, workflow spec id, hiring spec id, creator, and creation timestamp. The matching logic must score candidates against the actual job document's saved required_skills, preferred_skills, and min_experience, while still using the base hiring spec from /specs/hiring/.

Candidate Applications
Candidate application routes must be public. A candidate must be able to open /jobs/[jobId], move to /jobs/[jobId]/apply, enter name, email, phone number, upload a PDF resume, and submit the application without recruiter authentication. The upload flow must validate file type, store the resume under /server/uploads, parse PDF text, create the candidate record, and start the AI workflow automatically. A candidate's resume upload must always trigger the workflow without any manual recruiter action.

Workflow Orchestration
For workflow orchestration, the backend must run each application through the LangGraph workflow defined by /specs/workflow/default-hiring-workflow.json:

1234567
resume_parserembedding_agentmatching_agentshortlisting_agenthuman_approvalinterview_agentemail_agent
LangGraph must support retries, checkpoints, resumability, state persistence, branching, and human approval pauses. The workflow engine must persist status, current state, retries, state output, logs, and timestamps. It must pause at human_approval until the recruiter approves or rejects, then resume from the saved state rather than restarting the entire chain.

Complete Specification - AI Agents, RAG, LangGraph, and Email Layer
AI Agents
The agent layer must implement seven cooperating agents, each backed by a prompt or rules file under /specs/prompts/ or /specs/evaluation/.

The Resume Parser Agent parses uploaded PDF resumes and extracts candidate name, skills, experience, education, and projects. Its prompt behavior, temperature, known skills, and output schema must come from /specs/prompts/resume-parser.json, and the parser must respect both the known skills in the spec and the job-specific required and preferred skills.

The Embedding Agent generates embeddings using BAAI/bge-small-en-v1.5 and stores them in Qdrant for resumes, hiring policies, evaluation docs, and interview guidelines.

The Matching Agent compares parsed resume data with the merged hiring spec and the RAG context. Scoring weights come from /specs/prompts/matching-agent.json. The agent must return matched required skills, matched preferred skills, missing skills, all_skills_matched, and the final match_score.

The Shortlisting Agent turns the match score into a decision using /specs/evaluation/shortlisting-rules.json. The current rules are >= 80 → shortlisted, 60-79 → hold, < 60 → rejected. Thresholds must come dynamically from /specs. The agent must never hardcode 80, 60, or any other threshold.

The Human Approval checkpoint pauses workflow execution and waits for recruiter approval through POST /workflow/approve.

The Interview Agent generates interview questions, coding tasks, and rubrics according to /specs/prompts/interview-agent.json.

The Email Agent generates interview-invite or rejection output using /specs/email/interview-invite.json and /specs/email/rejection.json. Delivery goes through Resend when RESEND_API_KEY is set; otherwise the agent must produce fallback output instead of failing the workflow.

RAG Pipeline
The RAG layer must support organizational intelligence for resumes, hiring policies, evaluation docs, and interview guidelines. Resume chunks must be 500 characters, policy chunks must be 1000 characters, top_k retrieval must default to 5, and minimum_similarity must default to 0.75. Retrieval behavior must come from /specs/evaluation/rag-retrieval.json. The pipeline is Documents → Chunking → Embeddings → Qdrant Storage → Similarity Search → Context Injection → LLM Response.

Failure Handling
LLM timeouts, email API failures, and vector DB timeouts are retryable. Invalid PDFs, malformed JSON, and invalid request schemas are non-retryable. Every failure must log the agent name, workflow state, stack trace, and timestamp. Retry behavior is driven by /specs/system/retry-policy.json.

Complete Specification - Frontend Pages
The application uses the Next.js 15 App Router. The root page should guide users into authentication or the recruiter dashboard depending on session state.

/login and /signup provide the recruiter authentication forms. The frontend API client must read the auth token from localStorage or cookie so dashboard requests do not drift from the current session.

/dashboard displays the recruiter dashboard overview: job count, candidate count, workflow count, completion percentage, recent workflows, and quick actions such as refresh and create job.

/dashboard/jobs lists recruiter jobs and exposes a "Copy public apply link" action for each job.

/dashboard/jobs/create provides the Create Job form. The form includes title, description, required skills, preferred skills, minimum experience, skill preview chips, and a workflow-oriented layout.

/dashboard/candidates lists submitted candidates with status, match score, and job context.

/dashboard/workflows shows workflow executions, current state, approval status, logs, retry state, and the React Flow workflow visualization. Node colors must come from a node-states spec under /specs/workflow/.

/dashboard/analytics shows candidate statistics, shortlist rate, workflow completion rate, and agent execution metrics.

/jobs/[jobId] is the public job detail page.

/jobs/[jobId]/apply is the public candidate application page. It accepts candidate information and a PDF resume upload, shows the selected file name, displays processing state while the upload and workflow run, and shows a success message with workflow status and current state.

Complete Specification - Backend Architecture and Database Collections
Backend Architecture
The backend uses a modular Express architecture under /server/src/. The config layer centralizes environment loading, Mongo connection, and Qdrant configuration. The routes layer defines HTTP endpoints and middleware composition. The controllers layer parses request intent and shapes responses - it never talks to Mongo directly. The services layer owns business behavior for auth, jobs, candidates, workflows, analytics, RAG, and scoring. The validators layer uses Zod schemas to validate every request body. The middleware layer handles auth, role checks, validation, uploads, and errors. The models layer defines Mongoose schemas. The agents layer holds the seven cooperating agents (resume parser, embedding, matching, shortlisting, interview, email, and the human approval checkpoint hook). The workflows layer owns LangGraph workflow definitions and stateful execution. The rag layer wraps Qdrant access and the in-memory equivalent for tests. The analytics layer aggregates candidate and workflow metrics. The emails layer wraps Resend. The utils and constants layers own spec loading, scoring, response helpers, async error handling, and workflow failure logging.

Resume uploads must be stored under /server/uploads. Workflow logs must be stored under /server/logs. Mongoose models must exist under /server/src/models. Shared business rules must remain under root /specs.

Database Collections
users
id, name, email, password, role, created_at.
jobs
id, title, description, required_skills, preferred_skills, min_experience, workflow_spec_id, created_at.
candidates
id, name, email, phone, resume_url, parsed_resume_json, match_score, status, created_at.
workflows
id, candidate_id, job_id, current_state, status (pending | running | waiting_approval | completed | failed), created_at.
workflow_logs
id, workflow_id, agent_name, input, output, status (running | success | failed | waiting_approval), error, created_at.
Complete Specification - API Endpoints
Health and Auth

POST /auth/signup
create a recruiter account.
POST /auth/login
issue a JWT.
GET /auth/me
return the authenticated profile.
Jobs

POST /jobs
create a job. Requires recruiter auth.
GET /jobs
list jobs. Public, so public job pages can load.
GET /jobs/:id
get one job. Public, so candidates can view a job.
PUT /jobs/:id
update a job. Requires recruiter auth.
Candidates

POST /candidates/upload
public PDF resume upload that auto-starts the workflow.
GET /candidates
list candidates. Requires recruiter auth.
GET /candidates/:id
get one candidate. Requires recruiter auth.
Workflows

POST /workflow/start
manually start a workflow. Requires recruiter auth.
POST /workflow/retry
retry a failed workflow. Requires recruiter auth.
POST /workflow/approve
approve or reject the human approval checkpoint. Requires recruiter auth.
GET /workflow/:id
get one workflow with logs, node states, and execution order. Requires recruiter auth.
Analytics

GET /analytics
candidate statistics, shortlist rate, workflow completion rate, and agent execution metrics. Requires recruiter auth.
Complete Specification - Folder Structure and Development Phases
Folder Structure
The project root already contains client/ and server/. The AI agent must use the existing structure only and must never create frontend/, backend/, a NestJS scaffold, a Prisma schema, or any TypeScript files. AgentHire is JavaScript only.

1234567891011
ai-recruitment-platform/||-- client/|   |-- app/|   |   |-- dashboard/|   |   |-- jobs/|   |   |-- auth/|   |   |-- apply/|   ||   |-- components/|   |-- features/ 
Expand
Development Phases
Phase 1
initialize the Next.js 15 frontend and the Express backend, configure Tailwind and shadcn/ui, connect to MongoDB through Mongoose, load environment variables, and implement signup, login, JWT-protected routes, role checks, and the recruiter dashboard shell.
Phase 2
implement recruiter jobs, public job detail pages, public candidate apply pages, PDF upload through multer, Mongoose models, and Zod validators.
Phase 3
implement the spec loader, the root /specs JSON files, the LangGraph workflow definition, retry policy, node state colors, and shortlisting rules.
Phase 4
implement the Resume Parser, Embedding (Qdrant + BAAI/bge-small-en-v1.5), Matching, Shortlisting, Interview, and Email agents with spec-driven prompts and deterministic fallback behavior when external services are unavailable.
Phase 5
implement LangGraph workflow persistence, stateful execution, human approval pause/resume, retry handling, workflow logs, and the React Flow workflow visualization.
Phase 6
implement analytics, recruiter UI polish, improved upload UX, Resend email integration, Jest/Supertest backend tests, Playwright end-to-end tests, build checks, and a full local smoke test.
Complete Specification - UI, Security, Outcome, and Codex Instructions
UI and UX Requirements
The UI must use a clean recruiter-console aesthetic with Tailwind and shadcn/ui. It must be responsive, include loading states for resume processing, render the workflow graph with React Flow, support color-coded node states (running blue, success green, failed red, waiting_approval yellow, pending neutral), surface execution order and the active node, display failed nodes, retries, and approval checkpoints, and show clear processing feedback while a candidate's upload is running through the workflow.

Security Requirements
The application must hash passwords with bcryptjs, sign and verify JWTs with JWT_SECRET, load the current user from MongoDB on every protected request, enforce recruiter route protection, validate every request body with Zod, validate resume uploads with multer (file type, size), set HTTP security headers via helmet, apply rate limiting, sanitize input, prevent NoSQL injection, and never expose secret values in logs or responses. Public candidate routes must not require recruiter authentication, but every recruiter dashboard route must be protected.

Final Expected Outcome
The completed platform must let a recruiter sign up, log in, create a Frontend Developer job, copy the public apply link, submit a demo PDF resume as a candidate, watch the AI workflow auto-start, see the workflow pause at human approval, approve the checkpoint, let the workflow complete through interview and email generation, and review candidates, workflows, and analytics. The end-to-end flow must succeed against MongoDB, Qdrant, and the configured LLM provider.

Spec Files as Source of Truth
The complete project specification is backed by concrete JSON files under /specs. These files are the business-rule contract for AgentHire.

JSON
12345678
// specs/hiring/frontend-developer.json{  "role": "Frontend Developer",  "required_skills": ["React", "JavaScript", "CSS"],  "preferred_skills": ["Next.js", "Tailwind CSS"],  "minimum_score": 75,  "interview_rounds": 2}
JSON
1234567891011
// specs/workflow/default-hiring-workflow.json{  "workflow": [    "resume_parser",    "embedding_agent",    "matching_agent",    "shortlisting_agent",    "human_approval",    "interview_agent",    "email_agent"  ] 
Expand
JSON
12345
// specs/system/retry-policy.json{  "max_retries": 3,  "retry_delay_ms": 5000}
Codex Implementation Instructions
The AI coding agent must build the application phase by phase, follow the folder boundaries strictly (/client, /server, /specs), keep the project JavaScript only, never introduce TypeScript, NestJS, or Prisma, keep controllers thin and push business logic into services and agents, never hardcode hiring thresholds or workflow order, read all business rules from /specs, validate every API input schema with Zod, return structured JSON, persist workflow state for every run, support retries, log every workflow failure with agent name, state, stack trace, and timestamp, keep public apply routes open and recruiter routes protected, ensure that resume uploads automatically trigger the workflow, and report the important files created or changed at the end of each phase. Implementation priorities are correctness of the agent chain, integration safety, retry and approval resumability, clean architecture, and full traceability of every hiring decision back to a spec file.

Complete Spec
The previous slides describe the AgentHire specification in narrative form, slide by slide. The raw specification document - the exact text that the AI coding agent should treat as the contract - is reproduced below. This is the source-of-truth document; the prior slides are a guided reading of it.

376377378379380381382383384385386
AUTHENTICATION---------------- signup- login- JWT auth- role-based accessRECRUITER DASHBOARD-------------------- create jobs- manage jobs 
Expand
