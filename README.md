# Dazzling ERP Admin Portal

An enterprise-grade administrative dashboard designed for the **Dazzling ERP System**. The portal serves as the control center for managing academic batches, course syllabi, student admissions, lead acquisition, teacher scheduling, and financial transactions.

---

## 🛠️ Technology Stack

The application is built using modern front-end technologies to deliver a fast, responsive, and robust user experience:

- **Core Framework**: [React 19](https://react.dev/) — utilized with hooks, custom context, and concurrent features.
- **Build Tooling**: [Vite 7](https://vite.dev/) — configured for fast hot module replacement (HMR) and optimized assets building.
- **Styling System**: [Tailwind CSS v4](https://tailwindcss.com/) — leverages modern CSS variables, nested declarations, and custom utility classes.
- **State & Server Cache Management**: [TanStack React Query v5](https://tanstack.com/query/latest) — handles asynchronous requests, background refetching, and response caching.
- **HTTP Client**: [Axios](https://axios-http.com/) & Native Fetch APIs — handles outgoing service requests.
- **Routing**: [React Router v7](https://reactrouter.com/) — handles declarative page routing, nested layouts, and navigation guards.
- **Database Engine**: Live Google Apps Script (GAS) Web App acting as a micro-database connector.

---

## 📂 Key Application Modules

The application is structured into domain-driven feature folders under `src/features/`:

### 1. Student & Lead Tracking (`src/features/student/`)
- **Admissions Registry**: Full-featured student registry workflows, data entry, status controls, and profile cards.
- **Leads & Prospects (CRM)**: Track unregistered prospective students, follow-up timelines, hot lead indicators, and batch assignments.
- **Enrollment Wizard**: Multi-step workflow component to enroll students into multiple courses and customize installment plans.
- **Bulk Operations**: Bulk student deletion and status toggles.

### 2. Academic, Courses & Batches (`src/features/course/` & `src/features/batch/`)
- **Course Catalog**: Configure course types, pricing models, durations, perks, and metadata.
- **Batch Scheduler**: Manage active batches, start/end dates, weekly timetables, classroom slots, and master schedule views.
- **Relations Mapping**: Dynamic mapping relating batches to active courses and assigning appropriate instructors.

### 3. Staff & Teacher Directory (`src/features/teacher/`)
- **Instructor Profiles**: Onboard teachers, maintain documents, assign courses, and configure base salary models (hourly or monthly).
- **Teacher Forms**: Split-pane layout for managing teacher parameters, payroll configurations, and subject/class assignments.
- **Scheduler integration**: Assign subject slots to instructors while avoiding booking conflicts.

### 4. Finance & Transactions Ledger (`src/features/finance/`)
- **Ledger Entries**: Manual and automated recording of tuition fee collections, salary payments, and other transactions.
- **Payment Schedules**: Generate custom student installment plans, track due dates, flag overdue accounts, and view revenue summaries.

---

## 🏗️ Core Architecture & Design Patterns

### 1. Single-Endpoint API Dispatcher (`src/services/`)
To bypass CORS preflight overhead and operate seamlessly with the Google Apps Script backend, the application utilizes a unified RPC-style action client:
- **Central Action Registry**: All operations are registered inside [apiRegistry.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiRegistry.js) using structured actions (e.g. `STUDENT.ADD_LEAD` maps to backend event handler `'student_add_lead'`).
- **Standardized Client**: The [apiClient.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/services/apiClient.js) wraps requests, embeds authorization tokens, logs payloads/responses in non-production environments, and exposes standard error boundaries via `ApiError`.

### 2. Centralized Query Keys (`src/lib/react-query/`)
To avoid cache collisions and simplify invalidation policies across multiple page views, query keys are managed using a factory pattern inside [queryKeys.js](file:///E:/NAST/Dazzling/ERP%20System/dazzling-erp-admin/src/lib/react-query/queryKeys.js):
- **Query Key Structure**: Standardized arrays represent scopes (e.g., `['student', 'list', { filter }]`).
- **Invalidation Strategy**: Mutation hooks call factory functions to accurately target list queries or specific details for invalidation.

### 3. V2 Atomic Design System (`src/components/ui/v2/`)
The interface features a dark slate theme built with glassmorphism (translucent backdrops, subtle borders, and smooth transitions).
- **Atomic Inputs**: Unified inputs that handle styling, labels, and error states internally:
  - `FormField`: Surrounds controls, managing labels, helper texts, and error indicators.
  - `TextInput`: Handles alphanumeric inputs with optional icons.
  - `PhoneInput`: Formats and processes 10-digit mobile numbers.
  - `SelectInput`: Standard and searchable selections.
  - `RadioGroup`: Multi-column list selectors.
- **Responsive Layout Design**: Scales using dynamic CSS grids (`grid-cols-1 lg:grid-cols-12`) optimized for high-density forms.
- **Live-Text Accordion Pills**: Collapsible sheets feature live summary pills on header strips to ensure all configured parameters are visible even when collapsed.

---

## 📂 Detailed Directory Layout

```text
src/
├── components/
│   └── ui/
│       └── v2/             # Atomic inputs (FormField, TextInput, SelectInput, etc.)
├── context/                # Global contexts (Auth, Theme)
├── features/               # Domain-grouped subsystems
│   ├── batch/              # Batches, weekly schedules, master timetables
│   ├── core/               # Shared feature code (e.g. dashboard cards)
│   ├── course/             # Course catalogs, packages, pricing templates
│   ├── finance/            # Ledger logs, installment schedules, revenue metrics
│   ├── profile/            # Student and teacher profile panels
│   ├── student/            # Registrations, CRM leads, enrollment wizards
│   └── teacher/            # Onboarding, salary configs, subject assignments
├── hooks/                  # Global hooks (useAuth, useDebounce)
├── lib/
│   └── react-query/        # Query client wrapper & Query Key Factory
├── pages/                  # Route layouts (Auth pages, Admin sidebar panel)
├── routes/                 # Navigation setup & routing paths
└── services/               # Single-endpoint API dispatchers & error mappers
```

---

## ⚙️ Development & Deployment Workflows

### Prerequisites
- Node.js (v18 or above recommended)
- npm (v9 or above)

### Setup Commands
Install project dependencies:
```bash
npm install
```

### Run Locally
Start the local development server:
```bash
npm run dev
```

### Compile Production Build
Generate optimized static files:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

### Deployment
Deploy the current production build (`/dist`) directly to GitHub Pages:
```bash
npm run deploy
```
