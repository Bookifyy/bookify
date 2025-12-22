# Bookify Technical Project Manifest

This document provides a comprehensive breakdown of the architecture, technologies, and features implemented during the initial development phases of the Bookify platform.

---

## 🚀 Tech Stack

### Backend (API Layer)
- **Framework**: Laravel 10+ (PHP 8.2)
- **Database**: PostgreSQL (Structured for scalability)
- **Authentication**: Laravel Sanctum (Token-based API auth)
- **Authorization**: Spatie Laravel Permission (Admin vs. Student roles)
- **File Storage**: Laravel Storage System (Configured for public/private disks)

### Frontend (Application Layer)
- **Framework**: Next.js 14+ (App Router, Rendering on Client)
- **Styling**: Tailwind CSS (Custom Dark Premium Theme)
- **Icons**: Lucide React
- **State Management**: React Context API (`AuthContext`)
- **Navigation**: Next.js App Router (File-based routing)

---

## 🏗️ Core Architecture & Implementation

### 🛡️ Security & Auth Implementation
- **Secure Cookie Strategy**: Unlike traditional `localStorage`, authentication tokens are stored in secure cookies (`token`) for better CSRF protection.
- **Dynamic Layout Wrapper**: A `LayoutWrapper.tsx` component automatically handles:
    - Redirection of unauthenticated users to `/login`.
    - Hiding the Sidebar/Header for public guest routes.
    - Preventing "flicker" using a smooth loading splash screen.
- **RBAC (Role Based Access Control)**: Backend and Frontend are synchronized to hide management features (like the Admin Panel) unless the user is explicitly assigned the 'Admin' role.

### 📚 Content Management System (CMS)
- **Book Metadata Schema**: Implemented a relational database structure:
    - `Subject`: Categorization (Calculus, Law, Sapiens, etc.)
    - `Book`: Core metadata (Title, Author, ISBN, Description, Premium Status)
    - `ReadingProgress`: Per-user tracking of pages and percentages.
- **Admin Upload Interface**: A premium React form allowing:
    - **Multi-part File Uploads**: Simultaneous upload of PDFs/EPUBs and Cover Images.
    - **Validation**: Backend-enforced file types (mimes: pdf, epub, jpg, png) and size limits (20MB).

### 🎨 Premium User UI/UX
- **Unified Sidebar**: Persistent navigation with Lucide-styled icons and a dedicated "User Identity" footer for profile management and sign-out.
- **Unified Header**: Integrated Search bar and profile/settings shortcuts.
- **Discover Dashboard**: 
    - Time-aware greetings (Morning/Afternoon/Evening).
    - Horizontal scrollable feeds for "Continue Reading".
    - Progress visualization using animated CSS progress bars.
- **Book Detail Pages**: Dynamic routing (`/books/[id]`) generating high-fidelity overviews with metadata blurred hero backgrounds.

---

## 📁 Key Files & Modules Created

### 🌐 Frontend (apps/web)
- `context/AuthContext.tsx`: The "Heart" of the app; handles session persistence and user data fetching.
- `app/components/LayoutWrapper.tsx`: The "Gatekeeper"; handles auth-aware layout rendering.
- `app/admin/books/page.tsx`: The "Creator"; premium upload interface for content.
- `app/books/[id]/page.tsx`: The "Display"; detailed book overview.
- `app/components/BookCard.tsx`: Reusable premium visual building block.

### ⚙️ Backend (apps/api)
- `app/Http/Controllers/BookController.php`: Handles listing, searching, and file storage logic.
- `app/Http/Controllers/SubjectController.php`: Manages categories.
- `database/migrations/`: Definitions for Subjects, Books, and Progress tables.
- `database/seeders/BookSeeder.php`: Logic to populate the app with realistic startup content.

---

## 📈 Status Summary

- **Phase 1 (Foundation)**: [COMPLETED]
- **Phase 2 (Content Management)**: [COMPLETED]
- **Phase 3 (E-Reader Core)**: [PENDING]
- **Authentication Resilience**: [VERIFIED]
- **Production Sync**: [ACTIVE] (All changes merged to `main` branch)

---
*Documented by Antigravity AI*
