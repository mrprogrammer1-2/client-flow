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
- [ ] Protect authenticated routes
- [x] Create basic user profile

# Phase 3 — Database

> Tools: Neon PostgreSQL + Drizzle ORM

- [ ] Create Neon PostgreSQL database
- [ ] Connect Next.js to Neon
- [ ] Install and configure Drizzle ORM
- [ ] Create users table
- [ ] Create agencies table
- [ ] Create clients table
- [ ] Create projects table
- [ ] Create onboarding_templates table
- [ ] Create onboarding_steps table
- [ ] Create client_onboarding_steps table
- [ ] Define database relationships
- [ ] Run database migrations

# Phase 4 — Agency Dashboard

- [ ] Create dashboard layout
- [ ] Create sidebar navigation
- [ ] Create dashboard overview page
- [ ] Display total clients
- [ ] Display active clients
- [ ] Display pending clients
- [ ] Display completed onboardings
- [ ] Display onboarding progress
- [ ] Create Clients page
- [ ] Create Projects page
- [ ] Create Templates page

# Phase 5 — Client Management

- [ ] Create "Add Client" form
- [ ] Add client name
- [ ] Add client email
- [ ] Add project name
- [ ] Add project type
- [ ] Save client to database
- [ ] Display clients in a table
- [ ] Create client details page
- [ ] Edit client information
- [ ] Delete client
- [ ] Add client search
- [ ] Add client filtering

# Phase 6 — Onboarding Templates

- [ ] Create onboarding template
- [ ] Add template name
- [ ] Add onboarding step
- [ ] Edit onboarding step
- [ ] Delete onboarding step
- [ ] Reorder onboarding steps
- [ ] Define step types
- [ ] Create template details page
- [ ] Display template steps
- [ ] Save templates to database

**Step Types**

- [ ] Text / Information
- [ ] Questionnaire
- [ ] File Upload
- [ ] Task
- [ ] Meeting / Appointment

# Phase 7 — Client Onboarding

- [ ] Select onboarding template for a client
- [ ] Start client onboarding
- [ ] Create client-specific onboarding steps
- [ ] Display onboarding progress
- [ ] Mark steps as completed
- [ ] Track pending steps
- [ ] Calculate completion percentage
- [ ] Display onboarding status
- [ ] Mark onboarding as completed

# Phase 8 — Client Portal

- [ ] Create client portal
- [ ] Create client portal layout
- [ ] Display client information
- [ ] Display project information
- [ ] Display onboarding progress
- [ ] Display completed steps
- [ ] Display pending steps
- [ ] Open onboarding step
- [ ] Submit questionnaire
- [ ] Complete tasks
- [ ] Upload required files
- [ ] Show onboarding completion state

# Phase 9 — File Uploads

> Tool: Cloudinary

- [ ] Create Cloudinary account
- [ ] Configure Cloudinary
- [ ] Implement file upload
- [ ] Upload client files
- [ ] Store file URLs in database
- [ ] Display uploaded files
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

- [ ] User can sign up / log in
- [ ] Agency can create clients
- [ ] Agency can create onboarding templates
- [ ] Agency can assign a template to a client
- [ ] Client can access their portal
- [ ] Client can complete onboarding steps
- [ ] Client can upload files
- [ ] Agency can see client progress
- [ ] Agency can see completed and pending steps
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
