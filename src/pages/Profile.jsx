import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import { FaGithub, FaLink, FaUserEdit, FaUser, FaLinkedin, FaComment, FaHeart, FaTh, FaThList, FaTimes } from "react-icons/fa";
import { BsGrid3X3 } from "react-icons/bs";

const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("f_auto,q_auto")) return url;
    const parts = url.split("/upload/");
    return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
};

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [userList, setUserList] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");
                // Fetch user data
                const userRes = await api.get(`/users/${id}`);
                setProfileUser(userRes.data);

                // Fetch user posts
                const postsRes = await api.get(`/posts/user/${id}`);
                setPosts(postsRes.data);

            } catch (err) {
                console.error("Failed to load profile", err);
                setError("User not found or failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const handleFollow = async () => {
        if (!currentUser) return;
        try {
            const { data } = await api.put(`/users/follow/${id}`);
            setProfileUser(data);
        } catch (err) {
            console.error("Follow failed", err);
        }
    };

    const isFollowing = profileUser?.followers?.includes(currentUser?._id);

    const openFollowersModal = async () => {
        setModalTitle("Followers");
        setShowUserModal(true);
        setModalLoading(true);
        try {
            const { data } = await api.get(`/users/${id}/followers`);
            setUserList(data);
        } catch (err) {
            console.error("Failed to fetch followers", err);
        } finally {
            setModalLoading(false);
        }
    };

    const openFollowingModal = async () => {
        setModalTitle("Following");
        setShowUserModal(true);
        setModalLoading(true);
        try {
            const { data } = await api.get(`/users/${id}/following`);
            setUserList(data);
        } catch (err) {
            console.error("Failed to fetch following", err);
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) return <Loader text="Assembling profile data..." />;

    if (error || !profileUser) return (
        <div className="text-center mt-20">
            <div className="bg-canvas-subtle p-10 rounded-2xl border border-border-default max-w-md mx-auto">
                <FaUser size={48} className="text-fg-muted mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-fg-default mb-2">{error || "User not found"}</h2>
                <p className="text-fg-muted mb-6">The profile you are looking for does not exist or has been removed.</p>
                <button onClick={() => window.history.back()} className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-xl transition">
                    Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-canvas-subtle rounded-2xl p-8 mb-12 border border-border-default shadow-sm relative overflow-hidden">
                {/* Subtle decorative accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500 opacity-80 animate-gradient"></div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    {/* Top Row: PFP and Stats (Mobile Row, Desktop Column-like) */}
                    <div className="flex items-center md:items-start gap-6 md:gap-10">
                        <div className="relative shrink-0">
                            {profileUser.profilePic ? (
                                <img
                                    src={profileUser.profilePic}
                                    alt={profileUser.name}
                                    className="w-20 h-20 md:w-32 md:h-32 rounded-2xl object-cover border-2 border-border-default shadow-lg"
                                />
                            ) : (
                                <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl bg-canvas-default border-2 border-border-default flex items-center justify-center text-fg-muted shadow-lg">
                                    <FaUser className="size-8 md:size-12" />
                                </div>
                            )}
                        </div>

                        {/* Stats Row for Mobile (beside PFP) */}
                        <div className="flex-1 md:hidden">
                            <div className="flex justify-center items-center text-center gap-1.5 px-1">
                                <div className="flex flex-col min-w-0">
                                    <span className="font-black text-lg text-fg-default">{posts.length}</span>
                                    <span className="text-fg-muted text-[9px] uppercase tracking-tighter font-bold truncate">Posts</span>
                                </div>
                                <div className="w-px h-6 bg-border-muted/30 mx-1"></div>
                                <div className="flex flex-col min-w-0 cursor-pointer" onClick={openFollowersModal}>
                                    <span className="font-black text-lg text-fg-default">{profileUser.followers?.length || 0}</span>
                                    <span className="text-fg-muted text-[9px] uppercase tracking-tighter font-bold truncate">Followers</span>
                                </div>
                                <div className="w-px h-6 bg-border-muted/30 mx-1"></div>
                                <div className="flex flex-col min-w-0 cursor-pointer" onClick={openFollowingModal}>
                                    <span className="font-black text-lg text-fg-default">{profileUser.following?.length || 0}</span>
                                    <span className="text-fg-muted text-[9px] uppercase tracking-tighter font-bold truncate">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-fg-default mb-0.5">{profileUser.name}</h1>
                                <p className="text-fg-muted font-medium text-xs md:text-sm italic mb-4">{profileUser.email}</p>

                                {/* Stats for Desktop (under name) */}
                                <div className="hidden md:flex gap-8 text-sm mb-1">
                                    <div className="flex gap-1 items-baseline">
                                        <span className="font-black text-fg-default">{posts.length}</span>
                                        <span className="text-fg-muted text-[10px] uppercase tracking-wider font-bold">Posts</span>
                                    </div>
                                    <div
                                        className="flex gap-1 items-baseline cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={openFollowersModal}
                                    >
                                        <span className="font-black text-fg-default">{profileUser.followers?.length || 0}</span>
                                        <span className="text-fg-muted text-[10px] uppercase tracking-wider font-bold">Followers</span>
                                    </div>
                                    <div
                                        className="flex gap-1 items-baseline cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={openFollowingModal}
                                    >
                                        <span className="font-black text-fg-default">{profileUser.following?.length || 0}</span>
                                        <span className="text-fg-muted text-[10px] uppercase tracking-wider font-bold">Following</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                {currentUser && currentUser._id === id ? (
                                    <Link to="/profile/edit" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-canvas-default hover:bg-border-muted text-fg-default px-6 py-2.5 rounded-xl border border-border-default transition-all duration-200 text-sm font-bold shadow-sm">
                                        <FaUserEdit className="text-accent" /> Edit Profile
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl transition-all duration-200 text-sm font-black uppercase tracking-widest shadow-lg ${isFollowing
                                                ? "bg-canvas-default text-fg-default border border-border-default hover:bg-border-muted"
                                                : "bg-accent hover:bg-accent-hover text-white shadow-accent/20"
                                                }`}
                                        >
                                            {isFollowing ? "Unfollow" : "Follow"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('open-chat', { detail: profileUser }));
                                            }}
                                            className="p-3 bg-canvas-default hover:bg-border-muted text-accent rounded-xl border border-border-default transition-all duration-200 shadow-sm"
                                            title="Message"
                                        >
                                            <FaComment size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <p className="text-fg-muted mb-6 text-sm md:text-base leading-relaxed max-w-2xl">{profileUser.bio || "Crafting something amazing in the dev world..."}</p>

                        {profileUser.techStack && profileUser.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {profileUser.techStack.map((tech, i) => (
                                    <span key={i} className="bg-canvas-default text-accent px-3 py-1 rounded-lg text-[10px] md:text-xs font-mono border border-border-muted shadow-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-6 border-t border-border-muted pt-6 mt-2 overflow-x-auto no-scrollbar">
                            {profileUser.linkedinLink && (
                                <a href={profileUser.linkedinLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-fg-muted hover:text-fg-default transition-colors text-xs md:text-sm font-medium shrink-0">
                                    <FaLinkedin size={18} className="text-fg-default" /> LinkedIn
                                </a>
                            )}
                            {profileUser.githubLink && (
                                <a href={profileUser.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-fg-muted hover:text-fg-default transition-colors text-xs md:text-sm font-medium shrink-0">
                                    <FaGithub size={18} className="text-fg-default" /> GitHub
                                </a>
                            )}
                            {profileUser.portfolioLink && (
                                <a href={profileUser.portfolioLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-fg-muted hover:text-fg-default transition-colors text-xs md:text-sm font-medium shrink-0">
                                    <FaLink size={16} className="text-fg-default" /> Portfolio
                                </a>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Posts Grid Section */}
            <div className="border-t border-border-muted mt-4 md:mt-8 pt-6 md:pt-8 bg-canvas-default md:bg-transparent">
                <div className="flex items-center justify-center gap-8 mb-4 md:mb-8">
                    <div className="flex items-center gap-2 text-fg-default border-t-2 border-fg-default pt-3 -mt-[calc(24px+12px+3px)] md:-mt-[calc(32px+12px+3px)] transition-all">
                        <BsGrid3X3 size={12} className="md:size-4" />
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">Projects</span>
                    </div>
                </div>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-px md:gap-4 lg:gap-6 px-px md:px-0">
                        {posts.map(post => {
                            const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
                            const thumbnail = images.length > 0 ? getOptimizedUrl(images[0]) : null;

                            return (
                                <Link
                                    key={post._id}
                                    to={`/posts/${post._id}`}
                                    className="relative aspect-square bg-canvas-subtle overflow-hidden group cursor-pointer hover:brightness-75 transition-all"
                                >
                                    {thumbnail ? (
                                        <img
                                            src={thumbnail}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-canvas-default/50">
                                            <FaUser size={24} className="text-fg-muted opacity-10" />
                                        </div>
                                    )}

                                    {/* Hover Overlay - Desktop Only */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-6">
                                        <div className="flex items-center gap-2 text-white font-bold">
                                            <FaHeart size={18} />
                                            <span className="text-sm">{post.likes.length}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white font-bold">
                                            <FaComment size={18} />
                                            <span className="text-sm">{post.comments.length}</span>
                                        </div>
                                    </div>

                                    {/* Multiple images indicator */}
                                    {images.length > 1 && (
                                        <div className="absolute top-2 right-2 md:top-3 md:right-3 pointer-events-none">
                                            <div className="bg-canvas-default/30 backdrop-blur-md p-1 rounded-md">
                                                <BsGrid3X3 size={10} className="text-white drop-shadow-sm" />
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-canvas-subtle mx-4 md:mx-0 rounded-2xl border border-dashed border-border-default">
                        <BsGrid3X3 size={48} className="mx-auto mb-4 text-fg-muted opacity-20" />
                        <p className="text-fg-muted font-medium">No posts yet</p>
                        <p className="text-fg-muted text-sm mt-2">When {currentUser?._id === id ? 'you' : 'they'} post, they'll appear here</p>
                    </div>
                )}
            </div>

            {/* MODAL MOUNT POINT */}
            <UserListModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title={modalTitle}
                users={userList}
                loading={modalLoading}
            />
        </div>
    );
};

/* USER LIST MODAL COMPONENT */
const UserListModal = ({ isOpen, onClose, title, users, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-canvas-subtle border border-border-default rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-border-default flex items-center justify-between bg-canvas-default/50">
                    <h3 className="text-xl font-black text-fg-default uppercase tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-canvas-default rounded-full text-fg-muted hover:text-fg-default transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader size="sm" text="" />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="divide-y divide-border-muted/30">
                            {users.map(user => (
                                <Link
                                    key={user._id}
                                    to={`/profile/${user._id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-4 hover:bg-canvas-default rounded-2xl transition-all duration-200 group"
                                >
                                    {user.profilePic ? (
                                        <img
                                            src={user.profilePic}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-xl object-cover border border-border-muted group-hover:border-accent transition-colors"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-canvas-subtle border border-border-muted flex items-center justify-center text-fg-muted group-hover:border-accent transition-colors">
                                            <FaUser size={20} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-fg-default truncate group-hover:text-accent transition-colors">{user.name}</h4>
                                        <p className="text-xs text-fg-muted truncate">{user.bio || "No bio yet"}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <FaUser size={40} className="mx-auto mb-4 text-fg-muted opacity-20" />
                            <p className="text-fg-muted font-medium">No one found yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
