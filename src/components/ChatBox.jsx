import { useState, useEffect, useRef, useContext } from "react";
import { useSocket } from "../context/SocketContext";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaCircle, FaArrowLeft } from "react-icons/fa";
import { IoSend, IoChatbubbleEllipsesSharp } from "react-icons/io5";

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null); // The user you're chatting with
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [conversations, setConversations] = useState([]);
    const { socket, onlineUsers } = useSocket();
    const scrollRef = useRef();
    const activeChatRef = useRef(activeChat);
    const isOpenRef = useRef(isOpen);

    // Sync refs with state
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // Fetch Conversations users have had
    const fetchConversations = async () => {
        try {
            console.log("Fetching conversations...");
            const { data } = await api.get("/messages/conversations");
            const users = await Promise.all(data.map(async (id) => {
                const res = await api.get(`/users/${id}`);
                return res.data;
            }));
            setConversations(users);
        } catch (err) {
            console.error("Fetch conversations failed:", err);
        }
    };

    // Socket listeners for messages
    useEffect(() => {
        if (!socket) return;

        console.log("ChatBox: Registering socket listeners");

        const handleGetOnlineUsers = (users) => {
            // Already handled in SocketContext if we want, but keeping for ChatBox specific logic
            // Actually SocketContext provides onlineUsers, we can just use that
        };

        const handleGetMessage = (data) => {
            console.log("REAL-TIME MESSAGE RECEIVED:", data);

            // Auto-open chat if it's not open
            if (!isOpenRef.current) {
                console.log("Auto-opening chat...");
                setIsOpen(true);
                isOpenRef.current = true;
            }

            const senderData = {
                _id: data.senderId,
                name: data.senderName,
                profilePic: data.senderPic
            };

            // Switch to the sender if not already active
            if (!activeChatRef.current || activeChatRef.current._id !== data.senderId) {
                console.log("Switching active chat to:", data.senderName);
                activeChatRef.current = senderData;
                setActiveChat(senderData);
            }

            // If the chat is open with this user, update messages
            if (activeChatRef.current?._id === data.senderId) {
                setMessages((prev) => [...prev, { sender: data.senderId, text: data.text }]);
            }

            // Always trigger a refresh of conversations to update previews/list
            fetchConversations();
        };

        socket.on("getOnlineUsers", handleGetOnlineUsers);
        socket.on("getMessage", handleGetMessage);

        return () => {
            console.log("ChatBox: Cleaning up socket listeners");
            socket.off("getOnlineUsers", handleGetOnlineUsers);
            socket.off("getMessage", handleGetMessage);
        };
    }, [socket]); // Only depend on socket

    // Initial fetch of conversations when opened
    useEffect(() => {
        if (user && isOpen) fetchConversations();
    }, [user, isOpen]);

    // Listen for external open-chat events (from Profile page)
    useEffect(() => {
        const handleOpenChat = (e) => {
            setIsOpen(true);
            setActiveChat(e.detail);
        };
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    // Listen for toggle-chat event (from Navbar inbox icon)
    useEffect(() => {
        const handleToggleChat = () => {
            setIsOpen(prev => !prev);
        };
        window.addEventListener('toggle-chat', handleToggleChat);
        return () => window.removeEventListener('toggle-chat', handleToggleChat);
    }, []);

    // Fetch Messages for active chat
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/messages/${activeChat._id}`);
                setMessages(data);
            } catch (err) {
                console.error("Fetch messages failed:", err);
            }
        };
        if (activeChat) fetchMessages();
    }, [activeChat]);

    // Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const messageData = {
            receiverId: activeChat._id,
            text: inputText,
        };

        try {
            const { data } = await api.post("/messages", messageData);
            socket.emit("sendMessage", {
                senderId: user._id,
                senderName: user.name,
                senderPic: user.profilePic,
                receiverId: activeChat._id,
                text: inputText,
            });
            setMessages((prev) => [...prev, data]);
            setInputText("");
            // Refresh conversations list to update preview of the chat we just sent to
            fetchConversations();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    const getOptimizedUrl = (url) => {
        if (!url || !url.includes("cloudinary.com")) return url;
        const parts = url.split("/upload/");
        return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-3 w-[260px] sm:w-[300px] md:w-[330px] lg:w-[350px] h-[380px] md:h-[450px] lg:h-[500px] bg-canvas-subtle border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="p-3 md:p-4 bg-canvas-default border-b border-border-default flex justify-between items-center bg-gradient-to-r from-accent/10 to-transparent">
                        <div className="flex items-center gap-2 md:gap-3">
                            {activeChat ? (
                                <>
                                    <button onClick={() => setActiveChat(null)} className="text-fg-muted hover:text-fg-default p-1 mr-1 transition-colors">
                                        <FaArrowLeft size={14} />
                                    </button>
                                    <div className="relative">
                                        {activeChat.profilePic ? (
                                            <img src={getOptimizedUrl(activeChat.profilePic)} alt={activeChat.name} className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-border-muted flex items-center justify-center text-fg-muted">
                                                <FaUser size={12} />
                                            </div>
                                        )}
                                        {onlineUsers.some(u => u.userId === activeChat._id) && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 border-2 border-canvas-subtle rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs md:text-sm font-bold text-fg-default truncate w-[80px] md:w-[120px]">{activeChat.name}</h4>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <IoChatbubbleEllipsesSharp className="text-accent text-sm md:text-base mr-2" />
                                    <h4 className="text-xs md:text-sm font-bold text-fg-default">Messages</h4>
                                </>
                            )}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-fg-muted hover:text-fg-default p-1 text-sm md:text-base">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Conversations List / Messages */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scrollbar-thin">
                        {!activeChat ? (
                            <div className="space-y-1 md:space-y-2">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-16 md:py-20">
                                        <p className="text-[10px] md:text-xs text-fg-muted font-bold uppercase tracking-widest">No chats yet</p>
                                    </div>
                                ) : (
                                    conversations.map((c) => (
                                        <button
                                            key={c._id}
                                            onClick={() => setActiveChat(c)}
                                            className="w-full flex items-center gap-3 p-2 md:p-3 rounded-xl hover:bg-canvas-default transition group text-left border border-transparent hover:border-border-default"
                                        >
                                            <div className="relative shrink-0">
                                                {c.profilePic ? (
                                                    <img src={getOptimizedUrl(c.profilePic)} alt={c.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-border-muted flex items-center justify-center text-fg-muted">
                                                        <FaUser size={14} />
                                                    </div>
                                                )}
                                                {onlineUsers.some(u => u.userId === c._id) && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 md:w-3 h-2.5 md:h-3 bg-green-500 border-2 border-canvas-subtle rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs md:text-sm font-bold text-fg-default group-hover:text-accent truncate">{c.name}</h5>
                                                <p className="text-[10px] md:text-xs text-fg-muted truncate">{c.bio || "Click to message"}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] p-2 md:p-3 rounded-xl md:rounded-2xl text-xs md:text-sm ${msg.sender === user._id
                                        ? "bg-accent text-white rounded-br-none"
                                        : "bg-canvas-default border border-border-default text-fg-default rounded-bl-none"
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input */}
                    {activeChat && (
                        <form onSubmit={handleSendMessage} className="p-2 md:p-3 bg-canvas-default border-t border-border-default flex gap-2">
                            <input
                                type="text"
                                placeholder="Message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-1 bg-canvas-subtle border border-border-default rounded-xl px-3 py-1.5 md:py-2 text-xs md:text-sm outline-none focus:border-accent"
                            />
                            <button type="submit" className="btn-primary p-2 md:p-2.5 rounded-xl shadow-none">
                                <IoSend size={16} />
                            </button>

                        </form>
                    )}
                </div>
            )}

            {/* Toggle Button - Hidden when open */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn-primary w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full p-0 shadow-2xl hover:scale-110 active:scale-90"
                >
                    <div className="relative">
                        <IoChatbubbleEllipsesSharp className="text-xl md:text-2xl" />
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 md:w-3 h-2.5 md:h-3 bg-green-400 border-2 border-accent rounded-full animate-pulse"></div>
                    </div>
                </button>
            )}
        </div>
    );
};

export default ChatBox;
