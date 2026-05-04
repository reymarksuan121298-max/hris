# SGC HRIS System - Technical Schema & Blueprint

The SGC HRIS (Human Resource Information System) is an enterprise-grade, glassmorphism-styled dashboard built for workforce tracking, compliance monitoring, and operational oversight. It utilizes a modern React frontend coupled with a Supabase backend for real-time data synchronization and secure file storage.

## 1. Project Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite |
| **Styling** | Vanilla CSS (Glassmorphism), Lucide Icons |
| **Backend** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Buckets (`201_files`, `incident_reports_sales`) |
| **Routing** | React Router DOM v6 |

---

## 2. Data Schema (Database Tables)

The following tables are defined in the Supabase PostgreSQL database:

### `employees`
*Primary master table for workforce data.*
- `id`: UUID (PK)
- `name_english`: String (Full Legal Name)
- `email`: String (Corporate/Personal Email)
- `mobile`: String (Contact Number)
- `position`: String (Current Role)
- `department`: String (SGC Division)
- `employment_status`: Enum ('Probationary Status', 'Regular / Permanent Status', etc.)
- `dob`: Date (Date of Birth)
- `sex`: String (Gender)
- `blood_type`: String
- `residence_address`: Text
- `modular_docs`: JSONB (Stores status/URLs for 201 compliance files)
- `photo_url`: Text (Direct link to profile photograph)

### `cases`
*Employee Relations (ER) tracking.*
- `id`: BigInt (PK)
- `case_name`: String (Title of Incident)
- `area`: String (Location/Branch)
- `employees`: Text (Personnel involved)
- `status`: Enum ('OPEN', 'CLOSED', 'IN PROGRESS')
- `officer`: String (Handling Officer)
- `notes`: Text
- `created_at`: Timestamp

### `ir_cases`
*Salesforce & Branch SOP breaches.*
- `id`: BigInt (PK)
- `agent_name`: String
- `area`: String
- `status`: String (Enum: 'OPEN', 'RESOLVED', etc.)
- `sop_breakdown`: Text
- `file_url`: Text (Link to Evidence/Report)
- `date_posted`: Date

### `ld_assignments` & `ld_submissions`
*Learning & Development pipeline.*
- `ld_assignments`: `employee_name`, `report_type`, `due_date`, `priority`.
- `ld_submissions`: `employee_name`, `report_type`, `submission_date`, `file_url`.

### `cash_assistance_logs`
*Operational payouts and assistance tracking.*
- `id`: BigInt (PK)
- `personnel_in_charge`: String
- `amount`: Numeric
- `status`: String
- `date`: Date

---

## 3. Frontend Component Map

### Core Layout (`src/App.jsx`)
The root component manages the global **Sidebar**, **Header**, and the **Fixed Glass Footer**. It handles authentication state and theme switching.

### Navigation Routes
- **`/onboarding`** (`OnboardingVault.jsx`): Manages the 201 file pipeline. Features a compact hero banner and a non-scrolling list of pending validations.
- **`/directory`** (`EmployeeDirectory.jsx`): The master CRUD interface. Features a consolidated header for search and status filtering.
- **`/staff-roster`** (`StaffRoster.jsx`): A categorized view of HQ staff and Branch Tellers using accordion-style layouts.
- **`/er-cases`** (`ERCaseManagement.jsx`): Centralized logging for disciplinary actions.
- **`/sf-ops`** (`SFOperations.jsx`): Dashboard for SOP violations and branch-level cash assistance logs.
- **`/ld-tracker`** (`LDTracker.jsx`): "Mission Command" for corporate training and tasking assignments.

---

## 4. Design System (`src/index.css`)

The system follows a **"Cyber Dark"** aesthetic with a light-mode fallback.

- **Backgrounds**: Deep teal hex `#0B2E33` with radial glows.
- **Panels**: `background: rgba(11, 46, 51, 0.7)` with `backdrop-filter: blur(16px)`.
- **Accents**: 
  - Blue: `#B8E3E9` (Interactive elements)
  - Green: `#3fb950` (Success/Regular)
  - Red: `#ff7b72` (Violations/Separated)
- **Transitions**: High-quality `cubic-bezier` for hover effects and modal fades.

---

## 5. Security & Access
- **Auth Implementation**: Redirects unauthenticated traffic to the `Login.jsx` screen.
- **Session Persistence**: Theme and UI preferences are persisted in `localStorage`.
- **File Security**: Documents are served via Supabase Storage public URLs but managed through the secure HRIS dashboard interface.

---
**Prepared By:** Reymark Suan | SGC Corporation
