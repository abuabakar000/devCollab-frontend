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
    const { incomingMessage, setIncomingMessage } = useSocket();
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

    // Handle incoming Pusher messages
    useEffect(() => {
        if (!incomingMessage) return;

        const data = incomingMessage;
        console.log("Processing incoming message:", data);

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

        // Clear the incoming message so it doesn't re-trigger
        setIncomingMessage(null);
    }, [incomingMessage]);

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
            // Server will trigger Pusher event for the receiver
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
            {/* Backdrop for Mobile Chat */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-canvas-default/60 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="relative z-[100] mb-3 w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] h-[75vh] md:h-[550px] bg-canvas-subtle border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="p-4 bg-canvas-default border-b border-border-default flex justify-between items-center bg-gradient-to-r from-accent/10 to-transparent">
                        <div className="flex items-center gap-3">
                            {activeChat ? (
                                <>
                                    <button onClick={() => setActiveChat(null)} className="text-fg-muted hover:text-fg-default p-2 mr-1 transition-colors">
                                        <FaArrowLeft size={16} />
                                    </button>
                                    <div className="relative">
                                        {activeChat.profilePic ? (
                                            <img src={getOptimizedUrl(activeChat.profilePic)} alt={activeChat.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-border-default" />
                                        ) : (
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-border-muted flex items-center justify-center text-fg-muted">
                                                <FaUser size={14} />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-canvas-subtle rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm md:text-base font-bold text-fg-default truncate max-w-[120px] md:max-w-[180px]">{activeChat.name}</h4>
                                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Active Now</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mr-1">
                                        <IoChatbubbleEllipsesSharp className="text-accent text-xl" />
                                    </div>
                                    <h4 className="text-sm md:text-base font-black uppercase tracking-widest text-fg-default">Messages</h4>
                                </>
                            )}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-fg-muted hover:text-fg-default p-2 bg-canvas-default/50 hover:bg-canvas-default rounded-xl transition-all shadow-sm">
                            <FaTimes size={16} />
                        </button>
                    </div>

                    {/* Conversations List / Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                        {!activeChat ? (
                            <div className="space-y-2">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-24">
                                        <div className="w-16 h-16 bg-canvas-default rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-muted/20">
                                            <FaComments size={24} className="opacity-20 text-fg-muted" />
                                        </div>
                                        <p className="text-xs text-fg-muted font-bold uppercase tracking-widest">No conversations yet</p>
                                        <p className="text-[10px] text-fg-muted mt-2 opacity-50 px-8">Start a conversation from a user's profile</p>
                                    </div>
                                ) : (
                                    conversations.map((c) => (
                                        <button
                                            key={c._id}
                                            onClick={() => setActiveChat(c)}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-canvas-default transition-all group text-left border border-transparent hover:border-border-default shadow-sm hover:shadow-md"
                                        >
                                            <div className="relative shrink-0">
                                                {c.profilePic ? (
                                                    <img src={getOptimizedUrl(c.profilePic)} alt={c.name} className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-accent transition-all" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-border-muted flex items-center justify-center text-fg-muted">
                                                        <FaUser size={18} />
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-canvas-subtle rounded-full"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-sm font-bold text-fg-default group-hover:text-accent truncate transition-colors">{c.name}</h5>
                                                <p className="text-[11px] text-fg-muted truncate opacity-70">{c.bio || "Click to open conversation"}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start animate-in slide-in-from-left-2 duration-300"}`}>
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] md:text-sm shadow-sm ${msg.sender === user._id
                                        ? "bg-accent text-white rounded-br-none font-medium"
                                        : "bg-canvas-default border border-border-default text-fg-default rounded-bl-none"
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    {activeChat && (
                        <div className="p-4 bg-canvas-default border-t border-border-default">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Write a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="flex-1 bg-canvas-subtle border border-border-muted hover:border-border-default focus:border-accent rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-fg-muted/40"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="btn-primary w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                >
                                    <IoSend size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Button - Immersive size on mobile */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn-primary w-14 h-14 md:w-16 md:h-16 rounded-full p-0 shadow-2xl hover:scale-110 active:scale-90 transition-all group border-4 border-canvas-default flex items-center justify-center relative"
                >
                    <div className="relative">
                        <IoChatbubbleEllipsesSharp className="text-2xl md:text-3xl group-hover:rotate-6 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-accent rounded-full animate-pulse shadow-sm"></div>
                    </div>
                    {/* Visual Ripple effect */}
                    <div className="absolute inset-0 rounded-full animate-ping bg-accent/20 -z-10 group-hover:animate-none"></div>
                </button>
            )}
        </div>
    );
};

export default ChatBox;
