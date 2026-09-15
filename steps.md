# Phase 1 — Project Setup

- [x] Create Next.js project
- [x] Set up TypeScript
- [x] Set up Tailwind CSS
- [x] Initialize Git
- [x] Create GitHub repository
- [x] Create basic project folder structure

# Phase 2 — Authentication

> Tool: Kinde

- [x] Create Kinde application
- [x] Install and configure Kinde
- [x] Create Sign Up flow
- [x] Create Login flow
- [x] Implement Logout
- [x] Protect authenticated routes
- [x] Create basic user profile

# Phase 3 — Database

> Tools: Neon PostgreSQL + Drizzle ORM

- [x] Create Neon PostgreSQL database
- [x] Connect Next.js to Neon
- [x] Install and configure Drizzle ORM
- [x] Create users table
- [x] Create agencies table
- [x] Create clients table
- [x] Create projects table
- [x] Create onboarding_templates table
- [x] Create onboarding_steps table
- [x] Create client_onboarding_steps table
- [x] Define database relationships
- [x] Run database migrations

# Phase 4 — Agency Dashboard

- [ ] Create dashboard layout
- [ ] Create sidebar navigation
- [x] Create dashboard overview page
- [ ] Display total clients
- [ ] Display active clients
- [ ] Display pending clients
- [ ] Display completed onboardings
- [ ] Display onboarding progress
- [x] Create Clients page
- [x] Create Projects page
- [x] Create Templates page

# Phase 5 — Client Management

- [x] Create "Add Client" form
- [x] Add client name
- [x] Add client email
- [x] Add project name
- [ ] Add project type
- [x] Save client to database
- [ ] Display clients in a table
- [ ] Create client details page
- [ ] Edit client information
- [ ] Delete client
- [ ] Add client search
- [ ] Add client filtering

# Phase 6 — Onboarding Templates

- [x] Create onboarding template
- [x] Add template name
- [x] Add onboarding step
- [ ] Edit onboarding step
- [ ] Delete onboarding step
- [ ] Reorder onboarding steps
- [x] Define step types
- [x] Create template details page
- [x] Display template steps
- [x] Save templates to database

**Step Types**

- [x] Text / Information
- [ ] Questionnaire
- [x] File Upload
- [ ] Task
- [ ] Meeting / Appointment

# Phase 7 — Client Onboarding

- [x] Select onboarding template for a client
- [x] Start client onboarding
- [x] Create client-specific onboarding steps
- [x] Display onboarding progress
- [x] Mark steps as completed
- [x] Track pending steps
- [x] Calculate completion percentage
- [x] Display onboarding status
- [x] Mark onboarding as completed

# Phase 8 — Client Portal

- [x] Create client portal
- [x] Create client portal layout
- [x] Display client information
- [x] Display project information
- [x] Display onboarding progress
- [x] Display completed steps
- [x] Display pending steps
- [x] Open onboarding step
- [ ] Submit questionnaire
- [ ] Complete tasks
- [x] Upload required files
- [x] Show onboarding completion state

# Phase 9 — File Uploads

> Tool: Cloudinary

- [ ] Create Cloudinary account
- [ ] Configure Cloudinary
- [x] Implement file upload
- [x] Upload client files
- [x] Store file URLs in database
- [x] Display uploaded files
- [ ] Allow file deletion
- [ ] Validate file type
- [ ] Validate file size

# Phase 10 — Email Notifications

> Tool: Resend

- [ ] Create Resend account
- [ ] Configure email sending
- [ ] Create welcome email
- [ ] Send client portal invitation
- [ ] Send onboarding completion email
- [ ] Send task reminder email
- [ ] Add email templates

# Phase 11 — Automation

> Tool: Inngest or Trigger.dev

- [ ] Set up background jobs
- [ ] Create automated email workflow
- [ ] Create reminder workflow
- [ ] Detect overdue onboarding steps
- [ ] Send automatic reminders
- [ ] Update onboarding status automatically
- [ ] Create basic workflow system

# Phase 12 — AI Features

> Tool: OpenAI API

- [ ] Connect OpenAI API
- [ ] Create AI onboarding assistant
- [ ] Generate onboarding steps from project type
- [ ] Generate client questionnaire
- [ ] Analyze client responses
- [ ] Suggest tasks for the agency
- [ ] Allow agency to review AI suggestions before applying them

# Phase 13 — UI/UX Polish

- [ ] Make dashboard responsive
- [ ] Make client portal responsive
- [ ] Add loading states
- [ ] Add error states
- [ ] Add empty states
- [ ] Add success notifications
- [ ] Add form validation messages
- [ ] Improve navigation
- [ ] Add animations
- [ ] Improve mobile experience
- [ ] Add dark mode (optional)

# Phase 14 — Testing

- [ ] Test authentication
- [ ] Test client creation
- [ ] Test template creation
- [ ] Test onboarding flow
- [ ] Test client portal
- [ ] Test file uploads
- [ ] Test permissions
- [ ] Test invalid inputs
- [ ] Test error handling
- [ ] Test mobile layout
- [ ] Test production environment

# Phase 15 — Deployment

> Tool: Vercel

- [ ] Push project to GitHub
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Configure production database
- [ ] Test production application
- [ ] Fix production issues
- [ ] Add custom domain (optional)

# 🚀 MVP Definition

> The first version is complete when these features work:

- [x] User can sign up / log in
- [x] Agency can create clients
- [x] Agency can create onboarding templates
- [x] Agency can assign a template to a client
- [x] Client can access their portal
- [x] Client can complete onboarding steps
- [x] Client can upload files
- [x] Agency can see client progress
- [x] Agency can see completed and pending steps
- [ ] Application is deployed online

# Later Features

- [ ] Email notifications
- [ ] Automated reminders
- [ ] Background jobs
- [ ] AI onboarding assistant
- [ ] Team members
- [ ] Roles and permissions
- [ ] Analytics
- [ ] Subscription / Billing
- [ ] Custom branding
- [ ] Integrations with other tools
