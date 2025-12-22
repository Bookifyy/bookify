# Bookify: The Deep Technical Deep-Dive

This document provides a "micro-level" breakdown of every architectural decision, security layer, and component logic implemented for the Bookify platform.

---

## 🏗️ 1. Project Foundation (Monorepo)
We are using a **Turborepo** monorepo structure. This allows us to keep the Backend and Frontend in one place while keeping them perfectly separated.
- **`apps/api`**: The Laravel Backend.
- **`apps/web`**: The Next.js Frontend.

---

## 🛡️ 2. Authentication: The "Gatekeeper" Strategy
We avoided standard `localStorage` because it is vulnerable to XSS attacks. Instead, we built a **Secure Cookie-Based System**.

### **The AuthContext (`apps/web/context/AuthContext.tsx`)**
- **Cookie Helpers**: Includes custom functions (`getCookie`, `setCookie`) to manage the `token` without external libraries.
- **Freshness**: Every time you refresh the page, the app sends the cookie to the backend `/api/user` endpoint to get the latest user data (Roles, ID, Name).
- **Centralized Logic**: `login()` and `logout()` functions manage both the cookie state and the React state simultaneously.

### **The Gatekeeper (`apps/web/app/components/LayoutWrapper.tsx`)**
Every single page goes through this wrapper.
- **Public vs. Private**: It maintains a whitelist (`/login`, `/register`, etc.).
- **Redirection Logic**: If it detects you are NOT logged in and trying to access a private page (like the Dashboard), it forces a `router.push('/login')`.
- **UI Switching**: If you are logged in, it automatically injects the **Sidebar** and **Header** around your page. If you are on the Login page, it hides them for a clean UI.

---

## �️ 3. Database & Backend Logic
We built a highly relational database in Laravel.

### **Database Schema (Migrations)**
1. **`subjects`**: The categories (ID, Name, Slug).
2. **`books`**: Core metadata. Linked to `subjects` via `subject_id`.
3. **`reading_progress`**: Tracks which user is reading which book, their `current_page`, and `% completion`.

### **The Content Engine (`BookController.php`)**
- **Advanced Indexing**: The `index` method handles three things at once:
    - Lists all books.
    - Filters by Category (Subject).
    - Searches by Title or Author using SQL `LIKE` queries.
- **File Storage Logic**: When you upload a book:
    1. The PDF is stored in `storage/app/public/books`.
    2. The Cover is stored in `storage/app/public/covers`.
    3. We run `php artisan storage:link` to make these files accessible via a public URL (`/storage/books/...`).

---

## 🎨 4. Frontend UI: Component Detail

### **Sidebar & Roles (`Sidebar.tsx`)**
- **Admin Section**: Uses a role-check logic (`user.roles.some(...)`). If you don't have the 'Admin' role, the "Management" section literally doesn't exist in the DOM.
- **Active States**: Uses `usePathname()` to detect which page you are on and "lights up" the icon in Indigo.

### **Book Cards (`BookCard.tsx`)**
- **Navigation**: Wrapped in a Next.js `<Link>`.
- **Visuals**: Uses `aspect-[2/3]` to force a consistent book-cover ratio.
- **Progress Layer**: Conditionally renders an Indigo progress bar at the bottom of the card only if the user has started reading that book.

### **Admin Upload Form (`admin/books/page.tsx`)**
- **FormData**: Instead of sending traditional JSON, we use `new FormData()`. This is REQUIRED to send actual binary files (PDFs/Images) over the API.
- **Previews**: We handle state for the file names so you know exactly which file you have selected before hitting upload.

---

## 📈 5. Feature Progression Summary

### **What is currently "Ready to Use":**
1. **Dashboard**: Greeting, streaks, and "Continue Reading" logic.
2. **Book Discovery**: Searching and filtering by category.
3. **User Auth**: Registration, Login, and persistent sessions.
4. **Admin CMS**: Ability to add new books to the platform.
5. **Book Overviews**: Detailed pages for every book with blurred hero backgrounds.

### **What we are building next:**
- **The Reader Core**: Using `react-pdf` or similar to actually display the book content in the browser while preventing right-click/copy (DRM).

---
*Generated for: Bookify Development Team*
