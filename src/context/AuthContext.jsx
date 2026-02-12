import { createContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // Verify token and get user data
                    const { data } = await api.get("/users/me");
                    setUser(data);
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        // Fetch user details immediately after login to populate state completely
        const userRes = await api.get("/users/me");
        setUser(userRes.data);
        return userRes.data;
    };

    // Register function
    const register = async (name, email, password) => {
        console.log("Attempting registration for:", email);
        const { data } = await api.post("/auth/register", { name, email, password });
        console.log("Registration successful, received token:", !!data.token);
        localStorage.setItem("token", data.token);

        console.log("Fetching user profile...");
        const userRes = await api.get("/users/me");
        console.log("User profile fetched:", userRes.data?._id);
        setUser(userRes.data);
        return userRes.data;
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
