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
        <div className="w-full max-w-[1500px] lg:px-12 py-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                {/* Left Sidebar - Search & Info */}
                <div className="w-full lg:w-[320px] lg:sticky lg:top-[100px] h-fit self-start order-1 lg:order-1">
                    <div className="relative mb-8" ref={searchRef}>
                        <h2 className="text-xs font-black text-fg-muted uppercase tracking-[0.2em] mb-4 ml-1">Find Developers</h2>
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery && setShowResults(true)}
                                className="w-full bg-canvas-subtle border border-border-default pl-12 pr-10 py-4 rounded-2xl text-fg-default focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-xl"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-default transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown - now adjusted for sidebar width */}
                        {showResults && (searchResults.length > 0 || isSearching) && (
                            <div className="absolute top-full left-0 w-full mt-3 bg-canvas-subtle border border-border-default rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-opacity-95">
                                {isSearching ? (
                                    <div className="p-8">
                                        <Loader size="sm" text="Searching users..." />
                                    </div>
                                ) : (
                                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                        <div className="p-3">
                                            {searchResults.map((user) => (
                                                <Link
                                                    key={user._id}
                                                    to={`/profile/${user._id}`}
                                                    onClick={() => setShowResults(false)}
                                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-canvas-default transition group"
                                                >
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border-default group-hover:border-accent transition-colors shrink-0">
                                                        {user.profilePic ? (
                                                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-border-muted flex items-center justify-center text-fg-muted">
                                                                <FaUser size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm text-fg-default group-hover:text-accent transition-colors truncate">{user.name}</h4>
                                                        <p className="text-[11px] text-fg-muted truncate">{user.email}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {showResults && searchQuery && !isSearching && searchResults.length === 0 && (
                            <div className="absolute top-full left-0 w-full mt-3 bg-canvas-subtle border border-border-default rounded-2xl p-6 text-center shadow-2xl z-50">
                                <p className="text-fg-muted text-xs font-medium">No one found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Feed */}
                <div className="flex-1 max-w-[700px] order-2 lg:order-2">
                    <div className="flex items-center justify-between mb-8 border-b border-border-default pb-4">
                        <h1 className="text-2xl font-black text-fg-default tracking-tight uppercase">Latest Posts</h1>
                        <div className="text-xs font-bold text-fg-muted uppercase tracking-widest">{posts.length} Posts</div>
                    </div>

                    {posts.length === 0 ? (
                        <div className="bg-canvas-subtle border border-border-default rounded-3xl p-12 text-center shadow-sm">
                            <p className="text-fg-muted font-medium">No Posts shared yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
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
