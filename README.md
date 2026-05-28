# ⚡ TaskFlow - Advanced Team Task Management System

TaskFlow is a high-fidelity, full-stack task management application designed for high-performance teams. It combines a premium "Midnight Slate" aesthetic with robust engineering to provide a seamless workflow for project tracking, task assignment, and team collaboration.

## 🚀 Live Demo
- **Frontend (Vercel):** [https://tech-task-management-fe.vercel.app/](https://tech-task-management-fe.vercel.app/)
- **Backend (Render):** [https://tech-task-management-be.onrender.com](https://tech-task-management-be.onrender.com)

### 🔐 Demo Credentials
To explore the application with pre-populated dummy data, you can use the following accounts:
- **Admin Account:** `admin@demo.com` / `demo1234`
- **Member Account:** `member@demo.com` / `demo1234`

---

## ✨ Key Features

### 🎨 Premium Design & UX
- **Midnight Slate UI:** A custom-crafted dark theme with glassmorphism effects and indigo accents.
- **Full Responsiveness:** Powered by **Tailwind CSS**, providing a seamless experience across mobile, tablet, and desktop viewports.
- **Dynamic Dashboard:** Real-time analytics with interactive tabs (Overview, Tasks, Activity) and animated progress tracking.

### 🛠️ Core Functionality
- **Interactive Kanban Board:** Manage tasks across status columns (To Do, In Progress, In Review, Done) with a mobile-optimized interface.
- **Global User Assignment:** Assign tasks to any system user with real-time database synchronization.
- **Project Tracking:** Comprehensive project views with progress bars, member counts, and automated status updates.
- **Role-Based Access (RBAC):** Secure administrative controls for user management and high-level project oversight.

### 🔒 Security & Performance
- **JWT Authentication:** Secure, stateless authentication with protected frontend and backend routes.
- **Optimized API:** Performant REST endpoints built with Node.js and Express.
- **Cloud Infrastructure:** Hosted on Vercel and Render with MongoDB Atlas for scalable data storage.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Date-fns, Axios |
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT, BcryptJS |
| **Deployment** | Vercel (FE), Render (BE), MongoDB Atlas (DB) |

---

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### Installation
1. **Clone the Repositories**
   ```bash
   git clone https://github.com/VaishaleeSingh/tech_task_management_fe.git
   git clone https://github.com/VaishaleeSingh/tech_task_management_be.git
   ```

2. **Setup Backend**
   - Navigate to `backend` folder.
   - Install dependencies: `npm install`
   - Create `.env` from `.env.example` and add your `MONGODB_URI` and `JWT_SECRET`.
   - Start server: `npm run dev`

3. **Setup Frontend**
   - Navigate to `frontend` folder.
   - Install dependencies: `npm install`
   - Create `.env` and add `VITE_API_URL=http://localhost:5000`
   - Start app: `npm run dev`

---

## 📦 Repository Links
- **Frontend Repo:** [https://github.com/VaishaleeSingh/tech_task_management_fe](https://github.com/VaishaleeSingh/tech_task_management_fe)
- **Backend Repo:** [https://github.com/VaishaleeSingh/tech_task_management_be](https://github.com/VaishaleeSingh/tech_task_management_be)

---
© 2026 TaskFlow - Built with passion by Vaishalee Singh.
