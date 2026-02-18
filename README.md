# devCollab - Frontend 💻

[![React](https://img.shields.io/badge/react-v19-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-v7-purple)](https://vitejs.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/tailwind-v4-38b2ac)](https://tailwindcss.com/)

A high-performance, responsive Single Page Application (SPA) designed for an immersive developer experience.

**🌐 Live Demo:** [https://dev-collab-frontend-alpha.vercel.app/](https://dev-collab-frontend-alpha.vercel.app/)

## 📸 UI Preview
| Dashboard | Mobile View |
| :---: | :---: |
| <img src="../screenshots/home.jpg" width="400" /> | <img src="../screenshots/mobile_view.jpg" width="200" /> |

## 🎨 UI/UX Highlights
- **Dark Mode First**: Sleek, modern aesthetic inspired by high-end dev tools.
- **Smooth Interaction**: Powered by **Framer Motion** for layout transitions and hover effects.
- **Responsive Layout**: Seamlessly shifts from mobile-friendly icons to full desktop dashboards.

---

## 🚀 Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Environment Variables**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_PUSHER_KEY=your_pusher_key
   VITE_PUSHER_CLUSTER=your_pusher_cluster
   ```
3. **Launch Dev Server**
   ```bash
   npm run dev
   ```

---

## 📂 Architecture & Folder Structure

```text
src/
├── components/      # UI components (Layout, Feed, Modals)
├── context/         # AuthContext, SocketContext (Global State)
├── pages/           # High-level route components
├── hooks/           # Custom React hooks (if any)
└── assets/          # Static images and global CSS
```

### State Management
- **AuthContext**: Manages user session, JWT persistence, and login status.
- **SocketContext**: Handles the listener logic for Real-time events triggered by the backend.

---

## 🔧 Key Dependencies
- **Axios**: Configured with interceptors for seamless API calls.
- **React Icons**: A comprehensive set of developer-focused icons.
- **Canvas Confetti**: For delightful "welcome" and "success" micro-interactions.

## 🔮 Future Enhancements
- **Skeleton Loading**: Improve perceived performance with content placeholders.
- **Dark/Light Toggle**: Allow users to switch themes.
- **Offline Support**: PWA capabilities for mobile use.

---

## 🌐 Deployment
Optimized for deployment on **Vercel**. 
1. `npm run build`
2. Set `VITE_API_URL` to your production backend URL in Vercel settings.
