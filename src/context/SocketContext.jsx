import { createContext, useContext, useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import AuthContext from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [pusher, setPusher] = useState(null);
    const [channel, setChannel] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [incomingMessage, setIncomingMessage] = useState(null);

    useEffect(() => {
        if (user) {
            const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
                cluster: import.meta.env.VITE_PUSHER_CLUSTER,
            });

            // Log connection state for debugging
            pusherInstance.connection.bind("connected", () => {
                console.log("✅ Pusher connected");
            });
            pusherInstance.connection.bind("error", (err) => {
                console.error("❌ Pusher connection error:", err);
            });

            const userChannel = pusherInstance.subscribe(`user-${user._id}`);

            userChannel.bind("pusher:subscription_succeeded", () => {
                console.log(`✅ Subscribed to channel: user-${user._id}`);
            });
            userChannel.bind("pusher:subscription_error", (err) => {
                console.error("❌ Channel subscription error:", err);
            });

            userChannel.bind("new-notification", (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);
                console.log("New Notification received:", notification);
            });

            userChannel.bind("new-message", (data) => {
                console.log("REAL-TIME MESSAGE RECEIVED via Pusher:", data);
                setIncomingMessage(data);
            });

            setPusher(pusherInstance);
            setChannel(userChannel);

            return () => {
                userChannel.unbind_all();
                pusherInstance.unsubscribe(`user-${user._id}`);
                pusherInstance.disconnect();
                setPusher(null);
                setChannel(null);
            };
        } else {
            if (pusher) {
                pusher.disconnect();
                setPusher(null);
                setChannel(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{
            pusher,
            channel,
            notifications,
            setNotifications,
            unreadCount,
            setUnreadCount,
            incomingMessage,
            setIncomingMessage,
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
