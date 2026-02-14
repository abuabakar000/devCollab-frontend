import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import AuthContext from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
            });

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                newSocket.emit("join", user._id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
                setSocket(null);
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
