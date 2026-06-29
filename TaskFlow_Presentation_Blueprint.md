# TaskFlow – Task Management System
## Premium Corporate Presentation Content & Blueprint

> **Design System Blueprint**
> - **Colors:** Primary Dark Teal (#0D5A60), Primary Teal (#118B95), Secondary Teal (#2AA7B3), Light Background (#F7F8F9), Dark Text (#3F3F46), White (#FFFFFF)
> - **Typography:** Titles in Bold Modern Sans-Serif (Dark Teal), Subtitles Semi-bold (Primary Teal), Body in Medium Gray.
> - **Shapes & Assets:** Rounded rectangles, circular image containers with thick teal borders, soft shadows, glassmorphism accents, dotted corner patterns.
> - **Animations:** Morph transitions, smooth fades, subtle zoom on images.

---

### Slide 1: Cover
- **Layout:** Centered, large curved teal shape sweeping from the bottom right.
- **Title (Dark Teal, Bold):** TaskFlow
- **Subtitle (Primary Teal):** Task Management System
- **Body:** [Group Information / Presenter Names]
- **Image:** Subtle transparent diagonal lines in the background.

---

### Slide 2: Introduction
- **Layout:** Left-aligned text, right-aligned circular image (Professional office teamwork).
- **Title:** Welcome to TaskFlow
- **Content:** 
  - A modern, intuitive platform designed to streamline team collaboration.
  - Built to bring clarity to complex projects and everyday workflows.
  - Transforms how teams organize, track, and execute their work.
- **Visual:** Thick teal border around the teamwork image. Glassmorphism pill-shape behind the text.

---

### Slide 3: Problem Statement
- **Layout:** Split layout with a soft red/gray accent transitioning to teal.
- **Title:** The Challenge of Modern Work
- **Content:**
  - **Fragmented Communication:** Important details get lost in scattered emails and chats.
  - **Lack of Visibility:** Managers struggle to track real-time project progress.
  - **Missed Deadlines:** Without clear accountability, tasks fall through the cracks.
- **Visual:** Outline icons (Teal) next to each bullet point (e.g., broken link, blindfold, clock).

---

### Slide 4: Objectives
- **Layout:** Three glassmorphism cards arranged horizontally.
- **Title:** Our Objectives
- **Content (Cards):**
  1. **Centralize:** Create a single source of truth for all project data.
  2. **Empower:** Equip teams with tools for seamless real-time collaboration.
  3. **Optimize:** Provide actionable analytics to improve team efficiency.
- **Visual:** Subtle zoom animation when cards appear.

---

### Slide 5: System Features
- **Layout:** Grid layout (2x2 or 2x3) with rounded rectangles and soft shadows.
- **Title:** Key System Features
- **Content:**
  - Real-time Task Tracking & Kanban Boards
  - Role-Based Access Control
  - Automated Email Notifications
  - Comprehensive Dashboard Analytics
  - Secure File Attachments
- **Visual:** Dashboard screenshot cropped into a circular/rounded container on the right side.

---

### Slide 6: System Architecture
- **Layout:** Flow diagram utilizing smooth curved connecting lines.
- **Title:** System Architecture
- **Content:**
  - **Client Side:** React (Vite) Single Page Application
  - **Reverse Proxy:** NGINX for routing and CORS management
  - **Server:** Node.js / Express.js REST API
  - **Database:** PostgreSQL accessed via Prisma ORM
  - **Infrastructure:** Docker containers hosted on AWS EC2
- **Visual:** Minimalist architecture diagram using teal outline icons and dotted lines.

---

### Slide 7: Technology Stack
- **Layout:** Tech logos arranged in a soft pill-shaped container.
- **Title:** Technology Stack
- **Content:**
  - **Frontend:** React, Tailwind CSS, Vite
  - **Backend:** Node.js, Express, TypeScript
  - **Database:** PostgreSQL, Prisma ORM
  - **Deployment:** Docker, NGINX, AWS EC2, GitHub Actions
- **Visual:** Clean, uncluttered layout with plenty of white space.

---

### Slide 8: Database Design
- **Layout:** Abstract ERD diagram with rounded tables.
- **Title:** Database Architecture
- **Content:**
  - Relational structure ensuring data integrity.
  - Core Entities: `Users`, `Projects`, `Tasks`, `Comments`, `Attachments`.
  - Optimized indexing for fast query performance.
- **Visual:** A highly simplified, sleek representation of database tables using secondary teal (#2AA7B3).

---

### Slide 9: User Roles
- **Layout:** Three vertical columns.
- **Title:** Role-Based Access Control
- **Content:**
  - **Admin:** Full system control, user management, global settings.
  - **Project Manager:** Creates projects, assigns tasks, oversees team progress.
  - **Collaborator:** Executes tasks, adds comments, uploads attachments.
- **Visual:** Person icons (Teal outline) at the top of each column.

---

### Slide 10: Authentication & Security
- **Layout:** Left text, right circular image (Security concept).
- **Title:** Enterprise-Grade Security
- **Content:**
  - JWT (JSON Web Token) based authentication.
  - Secure password hashing (Bcrypt).
  - Environment variables for secret management.
  - Protected API routes and NGINX reverse proxy shielding.

---

### Slide 11: Project Management Module
- **Layout:** Large screenshot on the left, text on the right.
- **Title:** Project Management
- **Content:**
  - Create and configure new projects in seconds.
  - Assign managers and team members.
  - Set project timelines and monitor overall health.
- **Visual:** Screenshot of the Project Creation screen with curved edges.

---

### Slide 12: Task Management Module
- **Layout:** Feature highlight style.
- **Title:** Task Execution & Kanban
- **Content:**
  - Drag-and-drop Kanban interface.
  - Set priorities, due dates, and assignees.
  - Add sub-tasks, comments, and track status changes.
- **Visual:** Morph transition showing a task moving from "In Progress" to "Completed".

---

### Slide 13: Dashboard Analytics
- **Layout:** Data visualization focus.
- **Title:** Actionable Insights
- **Content:**
  - Visual charts showing task completion rates.
  - Overdue task alerts and workload distribution.
  - Personal productivity metrics for individual users.
- **Visual:** Circular image showing sleek charts and graphs.

---

### Slide 14: Email Notification System
- **Layout:** Left text, right icon graphic (Mail envelope with teal accents).
- **Title:** Automated Notifications
- **Content:**
  - Instant alerts for new task assignments.
  - Automated onboarding emails with temporary credentials.
  - Dynamic links routing users directly to the live AWS platform.
- **Visual:** Dotted pattern in the bottom right corner.

---

### Slide 15: File Attachments
- **Layout:** Minimalist, plenty of white space.
- **Title:** Seamless File Sharing
- **Content:**
  - Attach documents, images, and resources directly to tasks.
  - Secure file storage and retrieval.
  - Keeps all project context in one centralized location.

---

### Slide 16: Reports
- **Layout:** Clean grid layout.
- **Title:** Comprehensive Reporting
- **Content:**
  - Generate summaries of project health.
  - Export data for stakeholder meetings.
  - Track time and resource allocation.
- **Visual:** Image of a professional business meeting in a circular frame.

---

### Slide 17: Future Improvements
- **Layout:** Forward-looking, dynamic diagonal background lines.
- **Title:** The Roadmap Ahead
- **Content:**
  - AI-powered task prioritization and workload balancing.
  - Native mobile applications (iOS/Android).
  - Integration with third-party tools (Slack, Google Calendar).

---

### Slide 18: Challenges Faced
- **Layout:** Problem/Solution split design.
- **Title:** Technical Triumphs
- **Content:**
  - **Docker & GitHub Actions:** Overcame caching and port collision issues during automated deployment.
  - **Environment Variables:** Secured sensitive data handling in the CI/CD pipeline.
  - **NGINX Routing:** Solved SPA fallback routing to prevent 404 errors on direct navigation.
- **Visual:** Glassmorphism overlay detailing the CI/CD pipeline success.

---

### Slide 19: Demonstration
- **Layout:** Completely minimal. Large centered text.
- **Title:** Live Demonstration
- **Content:** 
  - (Switching to live AWS EC2 Environment)
- **Visual:** Large curved teal shape flowing from the top left to the center.

---

### Slide 20: Thank You
- **Layout:** Centered, highly professional.
- **Title:** Thank You
- **Subtitle:** Questions & Answers
- **Content:** 
  - ec2-18-143-198-91.ap-southeast-1.compute.amazonaws.com
  - Group Contact Information
- **Visual:** Elegant fade-in animation. Dotted teal pattern in the corners.
