# devCollab - Frontend 💻

[![React](https://img.shields.io/badge/react-v19-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-v7-purple)](https://vitejs.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/tailwind-v4-38b2ac)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black)](https://dev-collab-frontend-alpha.vercel.app/)

## 🚀 The Vision
**devCollab** is a high-performance, responsive Single Page Application (SPA) built for a modern developer-centric social experience. It goes beyond simple social networking by providing a dedicated space where developers can share their progress, collaborate on ideas, and stay connected in real-time.

Whether you're showcasing a new side project, seeking feedback on a complex algorithm, or just looking to connect with like-minded creators, devCollab provides the tools and the aesthetic environment to make your work shine.

**🌐 Live Demo:** [https://dev-collab-frontend-alpha.vercel.app/](https://dev-collab-frontend-alpha.vercel.app/)

---

## 📸 Gallery

| Landing Page | Home Dashboard |
| :---: | :---: |
| ![Landing Page](./screenshots/landing.jpg) | ![Home Dashboard](./screenshots/home.jpg) |

| User Profile | Real-time Chat |
| :---: | :---: |
| ![User Profile](./screenshots/profile.jpg) | ![Real-time Chat](./screenshots/chat.jpg) |

| Mobile View |
| :---: |
| ![Mobile Experience](./screenshots/mobile_view.jpg) |

---

## 🚀 Key Features

- **⚡ Real-time Interaction**: Instant messaging and notifications powered by **Socket.io** and **Pusher**.
- **🎨 Modern Dark UI**: Sleek, high-contrast aesthetic using **Tailwind CSS 4** and **Framer Motion** for fluid animations.
- **📱 True Responsive Design**: A "mobile-first" approach ensures a seamless experience across all devices.
- **🔐 Secure Authentication**: Integrated with JWT-based sessions and custom `AuthContext` for global state management.
- **✨ Onboarding Flow**: Dedicated welcoming and profile setup experience for new users.

---

## 📁 Project Structure

```text
src/
├── components/      # Reusable UI (Navbar, PostCard, ChatBox)
├── context/         # Auth & Socket state management
├── pages/           # Route views (Home, Profile, PostDetail)
├── services/        # API calls and external integrations
├── utils/           # Helper functions and constants
└── assets/          # Global styles and static files
```

---

## 🛠️ Tech Stack

- **React 19**: Modern functional components with hooks.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS 4**: Next-gen utility-first styling.
- **Framer Motion**: Production-ready motion library.
- **React Router**: Declarative routing for SPAs.
- **Lucide React**: Clean and consistent iconography.

---

## 💻 Local Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_PUSHER_KEY=your_pusher_key
   VITE_PUSHER_CLUSTER=your_pusher_cluster
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

This project is optimized for **Vercel**. When deploying:
1. Ensure your Production Environment Variables match your backend API URL.
2. The `vercel.json` and `vite.config.js` are pre-configured for SPA routing.

---

*Built with ❤️ for the Developer Community.*
