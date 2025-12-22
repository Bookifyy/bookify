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
- **Session Robustness (New)**: We implemented a "Soft Check" logic. If the `/api/user` fetch fails due to a network error (temporary server down/client offline), the app **preserves** the token instead of forcing a logout. It only logs the user out if the server explicitly returns a `401 Unauthorized` status. This prevents users from being "kicked out" during minor backend restarts or temporary network blips.
- **Centralized Logic**: `login()` and `logout()` functions manage both the cookie state and the React state simultaneously, ensuring no "ghost sessions" remain after logging out.

### **Login UX & Error Handling (`apps/web/app/login/page.tsx`)**
- **Detailed Validation Mapping**: The login form now captures and displays hyper-specific validation errors from the Laravel backend. Instead of a generic "Login failed", it shows messages like *"The email field is required"* or *"The password must be at least 8 characters"*.
- **State Preservation**: We ensure that `e.preventDefault()` is handled correctly so that the page doesn't refresh upon form submission. This allows the user to correct their input without the form being cleared on every error.

### **The Gatekeeper (`apps/web/app/components/LayoutWrapper.tsx`)**
- **Public vs. Private**: It maintains a whitelist (`/login`, `/register`, etc.).
- **Redirection Logic**: If it detects you are NOT logged in and trying to access a private page (like the Dashboard), it forces a `router.push('/login')`.
- **UI Switching**: If you are logged in, it automatically injects the **Sidebar** and **Header** around your page. If you are on the Login page, it hides them for a clean UI.

---

## 🏗️ 3. Database & Backend Logic
We built a highly relational database in Laravel.

### **Database Schema (Migrations)**
1. **`subjects`**: The categories (ID, Name, Slug).
2. **`books`**: Core metadata. Linked to `subjects` via `subject_id`.
3. **`reading_progress`**: Tracks which user is reading which book, their `current_page`, and `% completion`.

### **The Content Engine (`BookController.php`)**
- **Advanced Indexing**: The `index` method handles three things at once: list all books, filter by Category (Subject), and search by Title or Author.
- **API Response Protocol (Crucial)**: Every frontend request includes the `Accept: application/json` header. This is critical for Laravel; without it, if a session expires, the server might try to redirect an "invisible" API request to a non-existent `/login` HTML page, causing a 500 error. The header forces the server to return a clean `401 Unauthorized` JSON instead, which the frontend can handle gracefully.
- **File Storage Logic**: When you upload a book:
    1. The PDF is stored in `storage/app/public/books`.
    2. The Cover is stored in `storage/app/public/covers`.
    3. We run `php artisan storage:link` to make these files accessible via a public URL (`/storage/books/...`).

---

## 🎨 4. Frontend UI: Component Detail

### **Sidebar & Logout Logic (`Sidebar.tsx`)**
- **Admin Section**: Uses a role-check logic (`user.roles.some(...)`). If you don't have the 'Admin' role, the "Management" section literally doesn't exist in the DOM.
- **Active States**: Uses `usePathname()` to detect which page you are on and "lights up" the icon in Indigo.
- **Global Auth Hook Implementation**: The logout functionality is tied directly to the `useAuth` hook at the component level. This ensures that clicking "Sign Out" triggers a global state reset and cookie removal instantly, followed by a redirect to the login screen. We removed legacy `require()` calls inside click handlers to improve performance and reliability.

### **Book Cards (`BookCard.tsx`)**
- **Navigation**: Wrapped in a Next.js `<Link>`.
- **Visuals**: Uses `aspect-[2/3]` to force a consistent book-cover ratio.
- **Progress Layer**: Conditionally renders an Indigo progress bar at the bottom of the card only if the user has started reading that book.

### **Admin Upload Form (`admin/books/page.tsx`)**
- **Empty State UX**: The form includes a "fail-safe" for subjects. If the database is empty (or the seeder hasn't been run), the UI displays an amber warning message explaining exactly how to fix it via the Laravel Seeder, rather than just showing a broken dropdown.
- **FormData Integration**: Instead of sending traditional JSON, we use `new FormData()`. This is REQUIRED to send actual binary files (PDFs/Images) over the API.
- **Previews**: We handle state for the file names so you know exactly which file you have selected before hitting upload.
- **Consistent API Routing**: All fetch calls use a standardized environment variable base (`NEXT_PUBLIC_API_URL`) to ensure zero code changes are needed when switching from `localhost` to Railway/Vercel production environments.

---

## 📈 5. Feature Progression Summary

### **What is currently "Ready to Use":**
1. **Dashboard**: Greeting, streaks, and "Continue Reading" logic.
2. **Book Discovery**: Searching and filtering by category.
3. **User Auth**: Registration, Login, and persistent sessions with network-failure resilience.
4. **Admin CMS**: Ability to add new books with dedicated subject management UI warnings.
5. **Book Overviews**: Detailed pages for every book with blurred hero backgrounds.

### **What we are building next:**
- **The Reader Core**: Using `react-pdf` or similar to actually display the book content in the browser while preventing right-click/copy (DRM).

---
*Generated for: Bookify Development Team*
