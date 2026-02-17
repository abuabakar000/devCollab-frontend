import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";
import { FaSearch, FaUser, FaTimes } from "react-icons/fa";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await api.get("/posts");
                setPosts(data);
            } catch (err) {
                setError("Failed to load projects.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Search logic with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const { data } = await api.get(`/users/search?q=${searchQuery}`);
                    setSearchResults(data);
                    setShowResults(true);
                } catch (err) {
                    console.error("Search failed:", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) {
        return <Loader text="Loading amazing projects..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-8">{error}</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

                {/* Left Sidebar - Search & Info */}
                <div className="w-full lg:w-[320px] lg:sticky lg:top-28 h-fit self-start order-2 lg:order-1">
                    <div className="relative mb-10" ref={searchRef}>
                        <h2 className="text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1 flex items-center gap-2">
                            <span className="w-4 h-px bg-fg-subtle opacity-30"></span>
                            Find Developers
                        </h2>
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle group-focus-within:text-accent transition-colors duration-300" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery && setShowResults(true)}
                                className="w-full bg-white/[0.02] border border-white/5 pl-12 pr-10 py-4 rounded-2xl text-fg-default focus:ring-4 focus:ring-accent/5 focus:border-accent/40 outline-none transition-all duration-300 shadow-2xl placeholder:text-fg-subtle/30"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg-default transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && (searchResults.length > 0 || isSearching) && (
                            <div className="absolute top-full left-0 w-full mt-4 glass-card rounded-2xl shadow-3xl z-50 overflow-hidden ring-1 ring-white/5">
                                {isSearching ? (
                                    <div className="p-8">
                                        <Loader size="sm" text="Searching network..." />
                                    </div>
                                ) : (
                                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                        <div className="p-2 space-y-1">
                                            {searchResults.map((user) => (
                                                <Link
                                                    key={user._id}
                                                    to={`/profile/${user._id}`}
                                                    onClick={() => setShowResults(false)}
                                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-300 group/item"
                                                >
                                                    <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/5 group-hover/item:border-accent/40 transition-colors shrink-0 shadow-lg">
                                                        {user.profilePic ? (
                                                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-canvas-inset flex items-center justify-center text-fg-subtle">
                                                                <FaUser size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm text-fg-default group-hover/item:text-accent transition-colors truncate">{user.name}</h4>
                                                        <p className="text-[11px] text-fg-subtle truncate">{user.email}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {showResults && searchQuery && !isSearching && searchResults.length === 0 && (
                            <div className="absolute top-full left-0 w-full mt-4 glass-card rounded-2xl p-8 text-center shadow-3xl z-50">
                                <p className="text-fg-subtle text-xs italic uppercase tracking-widest opacity-60">No users found</p>
                            </div>
                        )}
                    </div>

                    {/* Optional Info Card in Sidebar */}
                    <div className="hidden lg:block glass-card p-6 rounded-3xl border-accent/5">
                        <h3 className="text-xs font-black text-accent uppercase tracking-widest mb-3">Trending Projects</h3>
                        <p className="text-fg-subtle text-[11px] leading-relaxed mb-4">
                            Discover the most liked projects from the developer community this week.
                        </p>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="flex-1 max-w-[750px] order-1 lg:order-2">
                    <div className="flex flex-col mb-10 md:mb-14">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl md:text-5xl font-black text-fg-default tracking-tight uppercase italic">
                                News Feed
                            </h1>
                            <div className="px-4 py-1.5 glass-card rounded-full text-[10px] md:text-xs font-black text-accent uppercase tracking-widest border-accent/10">
                                {posts.length} Innovations
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group cursor-default h-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_15px_rgba(var(--accent-rgb),1)]"></div>
                                <span className="text-[10px] md:text-xs font-black text-accent uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]">
                                    Community Pulse
                                </span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-accent/30 to-transparent"></div>
                        </div>
                    </div>

                    {posts.length === 0 ? (
                        <div className="bg-canvas-subtle border border-border-default rounded-3xl p-12 text-center shadow-sm">
                            <p className="text-fg-muted font-medium">No Posts shared yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="space-y-4 md:space-y-10">
                            {posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Home;
