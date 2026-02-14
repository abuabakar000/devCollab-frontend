import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext, { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import PostDetail from "./pages/PostDetail";
import Onboarding from "./pages/Onboarding";
import OnboardingProfilePic from "./pages/OnboardingProfilePic";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import { SocketProvider } from "./context/SocketContext";


import Loader from "./components/Loader";

const ProtectedRoute = ({ children }) => {

  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader fullScreen />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/profile-pic" element={
                <ProtectedRoute>
                  <OnboardingProfilePic />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/welcome" element={
                <ProtectedRoute>
                  <OnboardingWelcome />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/create-post" element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              } />
              <Route path="/profile/:id" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } />
              <Route path="/posts/:id" element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
