import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import ChatBox from "./ChatBox";

const Layout = ({ children }) => {
    const location = useLocation();
    const isPostDetail = location.pathname.startsWith("/posts/");
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
    const isOnboarding = location.pathname.startsWith("/onboarding");


    return (
        <div className="min-h-screen bg-canvas-default text-fg-default font-sans overflow-x-hidden">
            {!isPostDetail && <Navbar />}
            <main className={`${(!isPostDetail && !isAuthPage) ? "container mx-auto px-4 py-8" : ""}`}>
                {children}
            </main>

            {/* Hide ChatBox on auth and onboarding pages */}
            {!isAuthPage && !isOnboarding && <ChatBox />}
        </div>

    );
};

export default Layout;
