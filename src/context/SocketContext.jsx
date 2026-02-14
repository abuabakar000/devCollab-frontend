import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import AuthContext from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            const socketInstance = io(import.meta.env.VITE_API_URL, {
                query: { userId: user._id },
            });

            setSocket(socketInstance);

            socketInstance.emit("join", user._id);

            socketInstance.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            socketInstance.on("newNotification", (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                // Optional: Play sound or show toast
                console.log("New Notification received:", notification);
            });

            return () => {
                socketInstance.disconnect();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{
            socket,
            onlineUsers,
            notifications,
            setNotifications,
            unreadCount,
            setUnreadCount
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
