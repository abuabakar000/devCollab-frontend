import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../context/AuthContext";
import { FaBars, FaTimes, FaUser, FaHome, FaPlusCircle, FaSignOutAlt, FaUserEdit, FaBell, FaHeart, FaComment, FaUserPlus } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import api from "../services/api";
import logo from "../assets/logo.png";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const isOnboarding = location.pathname.startsWith("/onboarding");
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const { socket, notifications, setNotifications, unreadCount, setUnreadCount } = useSocket();

    // Notification handling with shared socket
    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const { data } = await api.get("/notifications");
                setNotifications(data);
                // Set initial unread count
                const unread = data.filter(n => !n.read).length;
                setUnreadCount(unread);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchNotifs();
    }, [user, setNotifications, setUnreadCount]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
        setIsNotifOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleMarkAsRead = async () => {
        if (!isNotifOpen && notifications.some(n => !n.read)) {
            try {
                await api.put("/notifications/read");
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            } catch (err) {
                console.error(err);
            }
        }
        setIsNotifOpen(!isNotifOpen);
    };

    const getOptimizedUrl = (url) => {
        if (!url || !url.includes("cloudinary.com")) return url;
        const parts = url.split("/upload/");
        return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case "like": return <FaHeart className="text-red-500" />;
            case "comment": return <FaComment className="text-blue-500" />;
            case "follow": return <FaUserPlus className="text-green-500" />;
            default: return <FaBell className="text-accent" />;
        }
    };

    const getNotifMessage = (notif) => {
        const name = <span className="font-bold text-fg-default">{notif.sender?.name}</span>;
        switch (notif.type) {
            case "like": return <>{name} liked your project <span className="font-bold text-accent">"{notif.post?.title}"</span></>;
            case "comment": return <>{name} commented on your project <span className="font-bold text-accent">"{notif.post?.title}"</span></>;
            case "follow": return <>{name} started following you</>;
            default: return "New interaction on your profile";
        }
    };

    return (
        <nav className="bg-canvas-subtle border-b border-border-default sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-[70px]">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center transition hover:opacity-80 h-full overflow-hidden">
                        <img src={logo} alt="DevCollab" className="h-[160px] w-auto object-contain select-none translate-y-1" style={{ filter: 'brightness(1.2)' }} />
                    </Link>

                    {/* Right Section */}
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        {isAuthPage ? (
                            /* Auth Pages: Join Community only */
                            <Link
                                to="/register"
                                className="btn-primary px-5 py-2.5 h-auto leading-none"
                            >
                                Join Community
                            </Link>
                        ) : isOnboarding ? (
                            /* Onboarding Pages: Profile only */
                            user && (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center space-x-2 focus:outline-none group"
                                    >
                                        <div className="relative">
                                            {user.profilePic ? (
                                                <img
                                                    src={getOptimizedUrl(user.profilePic)}
                                                    alt="Profile"
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-border-default group-hover:border-accent transition-colors"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-canvas-default border-2 border-border-default flex items-center justify-center text-fg-muted group-hover:border-accent group-hover:text-accent transition-all">
                                                    <FaUser size={14} />
                                                </div>
                                            )}
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-canvas-subtle rounded-full"></div>
                                        </div>
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-48 bg-canvas-subtle border border-border-default rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-3 border-b border-border-muted bg-canvas-default/50">
                                                <p className="text-xs font-bold text-fg-default truncate">{user.name}</p>
                                                <p className="text-[10px] text-fg-muted truncate">{user.email}</p>
                                            </div>
                                            <div className="p-1">
                                                <Link
                                                    to={`/profile/${user._id}`}
                                                    className="flex items-center space-x-3 px-3 py-2 text-sm text-fg-muted hover:text-fg-default hover:bg-canvas-default rounded-lg transition-colors group"
                                                >
                                                    <FaUser className="text-accent group-hover:scale-110 transition-transform" />
                                                    <span>View Profile</span>
                                                </Link>
                                                <div className="h-px bg-border-muted my-1 mx-2"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors group"
                                                >
                                                    <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            /* Regular Pages: Full Menu */
                            <>
                                <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                                    <Link to="/" className="flex items-center space-x-2 text-sm font-semibold text-fg-muted hover:text-accent transition-all duration-200 cursor-pointer hover:scale-110">
                                        <FaHome className="text-lg" />
                                        <span>Home</span>
                                    </Link>

                                    {user ? (
                                        <>
                                            <Link to="/create-post" className="flex items-center space-x-2 text-sm font-semibold text-fg-muted hover:text-accent transition-all duration-200 cursor-pointer hover:scale-110">
                                                <FaPlusCircle className="text-lg" />
                                                <span>Post</span>
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    const chatEvent = new CustomEvent('toggle-chat');
                                                    window.dispatchEvent(chatEvent);
                                                }}
                                                className="flex items-center space-x-2 text-sm font-semibold text-fg-muted hover:text-accent transition-all duration-200 focus:outline-none cursor-pointer hover:scale-110"
                                                title="Messages"
                                            >
                                                <IoChatbubbleEllipsesSharp className="text-lg" />
                                                <span>Inbox</span>
                                            </button>

                                            {/* Notifications */}
                                            <div className="relative" ref={notifRef}>
                                                <button
                                                    onClick={handleMarkAsRead}
                                                    className="flex items-center space-x-2 text-sm font-semibold text-fg-muted hover:text-accent transition-all duration-200 focus:outline-none cursor-pointer hover:scale-110"
                                                >
                                                    <FaBell className="text-lg" />
                                                    <span>Notifications</span>
                                                    {unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-canvas-subtle animate-bounce">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </button>

                                                {isNotifOpen && (
                                                    <div className="absolute right-0 mt-3 w-80 max-h-[400px] bg-canvas-subtle border border-border-default rounded-xl shadow-2xl overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <div className="p-3 border-b border-border-muted bg-canvas-default/50 sticky top-0 z-10">
                                                            <h3 className="text-xs font-black uppercase tracking-widest text-fg-default">Notifications</h3>
                                                        </div>
                                                        <div className="divide-y divide-border-muted">
                                                            {notifications.length === 0 ? (
                                                                <div className="p-8 text-center text-fg-muted">
                                                                    <FaBell size={24} className="mx-auto mb-2 opacity-20" />
                                                                    <p className="text-xs">No notifications yet</p>
                                                                </div>
                                                            ) : (
                                                                notifications.map((n) => (
                                                                    <Link
                                                                        key={n._id}
                                                                        to={n.type === "follow" ? `/profile/${n.sender?._id}` : `/posts/${n.post?._id}`}
                                                                        onClick={() => setIsNotifOpen(false)}
                                                                        className={`p-3 flex gap-3 hover:bg-canvas-default transition-colors border-b last:border-b-0 border-border-muted/30 ${!n.read ? "bg-accent/[0.03]" : ""}`}
                                                                    >
                                                                        <div className="relative shrink-0">
                                                                            {n.sender?.profilePic ? (
                                                                                <img src={n.sender.profilePic} className="w-8 h-8 rounded-full border border-border-default object-cover" alt="" />
                                                                            ) : (
                                                                                <div className="w-8 h-8 rounded-full bg-canvas-default flex items-center justify-center text-fg-muted border border-border-default">
                                                                                    <FaUser size={12} />
                                                                                </div>
                                                                            )}
                                                                            <div className="absolute -bottom-1 -right-1 bg-canvas-subtle rounded-full p-0.5 shadow-sm border border-border-muted/20">
                                                                                {getNotifIcon(n.type)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] text-fg-muted leading-relaxed">
                                                                                {getNotifMessage(n)}
                                                                            </p>
                                                                            <p className="text-[10px] text-fg-muted mt-1 opacity-50 font-medium">
                                                                                {new Date(n.createdAt).toLocaleDateString()}
                                                                            </p>
                                                                        </div>
                                                                        {!n.read && <div className="w-2 h-2 bg-accent rounded-full shrink-0 self-center"></div>}
                                                                    </Link>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <Link to="/login" className="text-sm font-semibold text-fg-muted hover:text-fg-default transition">Login</Link>
                                    )}
                                </div>

                                {user ? (
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="flex items-center space-x-2 focus:outline-none group"
                                        >
                                            <div className="relative">
                                                {user.profilePic ? (
                                                    <img
                                                        src={getOptimizedUrl(user.profilePic)}
                                                        alt="Profile"
                                                        className="w-8 h-8 rounded-full object-cover border-2 border-border-default group-hover:border-accent transition-colors"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-canvas-default border-2 border-border-default flex items-center justify-center text-fg-muted group-hover:border-accent group-hover:text-accent transition-all">
                                                        <FaUser size={14} />
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-canvas-subtle rounded-full"></div>
                                            </div>
                                        </button>

                                        {isProfileDropdownOpen && (
                                            <div className="absolute right-0 mt-3 w-48 bg-canvas-subtle border border-border-default rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="px-4 py-3 border-b border-border-muted bg-canvas-default/50">
                                                    <p className="text-xs font-bold text-fg-default truncate">{user.name}</p>
                                                    <p className="text-[10px] text-fg-muted truncate">{user.email}</p>
                                                </div>
                                                <div className="p-1">
                                                    <Link
                                                        to={`/profile/${user._id}`}
                                                        className="flex items-center space-x-3 px-3 py-2 text-sm text-fg-muted hover:text-fg-default hover:bg-canvas-default rounded-lg transition-colors group"
                                                    >
                                                        <FaUser className="text-accent group-hover:scale-110 transition-transform" />
                                                        <span>View Profile</span>
                                                    </Link>
                                                    <Link
                                                        to={`/profile/edit`}
                                                        className="flex items-center space-x-3 px-3 py-2 text-sm text-fg-muted hover:text-fg-default hover:bg-canvas-default rounded-lg transition-colors group"
                                                    >
                                                        <FaUserEdit className="text-accent group-hover:scale-110 transition-transform" />
                                                        <span>Edit Profile</span>
                                                    </Link>
                                                    <div className="h-px bg-border-muted my-1 mx-2"></div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-100 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors group"
                                                    >
                                                        <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
                                                        <span>Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to="/register"
                                        className="btn-primary px-5 py-2.5 h-auto leading-none"
                                    >
                                        Join Community
                                    </Link>
                                )}

                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="md:hidden p-2 text-fg-muted hover:text-fg-default hover:bg-canvas-default rounded-lg transition-colors focus:outline-none"
                                >
                                    {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {!isAuthPage && !isOnboarding && isMobileMenuOpen && (
                    <div className="md:hidden py-6 border-t border-border-muted bg-canvas-subtle animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col space-y-4">
                            <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-fg-muted hover:text-accent hover:bg-canvas-default rounded-xl transition-all">
                                <FaHome size={20} />
                                <span className="font-semibold text-lg">Home</span>
                            </Link>
                            {user ? (
                                <>
                                    <Link to="/create-post" className="flex items-center space-x-3 px-4 py-3 text-fg-muted hover:text-accent hover:bg-canvas-default rounded-xl transition-all">
                                        <FaPlusCircle size={20} />
                                        <span className="font-semibold text-lg">Post</span>
                                    </Link>
                                    <Link to={`/profile/${user._id}`} className="flex items-center space-x-3 px-4 py-3 text-fg-muted hover:text-accent hover:bg-canvas-default rounded-xl transition-all">
                                        <FaUser size={20} />
                                        <span className="font-semibold text-lg">View Profile</span>
                                    </Link>
                                    <Link to={`/profile/edit`} className="flex items-center space-x-3 px-4 py-3 text-fg-muted hover:text-accent hover:bg-canvas-default rounded-xl transition-all">
                                        <FaUserEdit size={20} />
                                        <span className="font-semibold text-lg">Edit Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-left"
                                    >
                                        <FaSignOutAlt size={20} />
                                        <span className="font-semibold text-lg">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4 pt-2">
                                    <Link to="/login" className="block text-center text-fg-muted hover:text-fg-default font-semibold text-lg py-2">Login</Link>
                                    <Link to="/register" className="block text-center bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-2xl shadow-lg transition shadow-accent/20">Join Community</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
