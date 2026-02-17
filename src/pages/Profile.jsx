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
        <div className="max-w-4xl mx-auto py-10 px-4 md:px-0">
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 mb-12 border-accent/5 relative overflow-hidden group/profile shadow-3xl">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-accent/20"></div>

                <div className="flex flex-col md:flex-row gap-8 md:gap-14">
                    {/* Top Row: PFP and Stats */}
                    <div className="flex items-center md:items-start gap-8 md:gap-14">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-accent blur-2xl opacity-10 group-profile-hover:opacity-20 transition-opacity"></div>
                            {profileUser.profilePic ? (
                                <img
                                    src={getOptimizedUrl(profileUser.profilePic)}
                                    alt={profileUser.name}
                                    className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] object-cover border border-white/10 shadow-2xl relative z-10"
                                />
                            ) : (
                                <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] bg-canvas-inset border border-white/5 flex items-center justify-center text-fg-subtle shadow-2xl relative z-10">
                                    <FaUser size={40} className="opacity-20" />
                                </div>
                            )}
                        </div>

                        {/* Stats Row for Mobile */}
                        <div className="flex-1 md:hidden">
                            <div className="flex justify-between items-center text-center gap-0">
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-black text-lg text-fg-default italic">{posts.length}</span>
                                    <span className="text-fg-subtle text-[7px] uppercase tracking-normal font-black">Posts</span>
                                </div>
                                <div className="w-px h-5 bg-white/5"></div>
                                <div className="flex flex-col min-w-0 flex-1 cursor-pointer" onClick={openFollowersModal}>
                                    <span className="font-black text-lg text-fg-default italic">{profileUser.followers?.length || 0}</span>
                                    <span className="text-fg-subtle text-[7px] uppercase tracking-normal font-black">Followers</span>
                                </div>
                                <div className="w-px h-5 bg-white/5"></div>
                                <div className="flex flex-col min-w-0 flex-1 cursor-pointer" onClick={openFollowingModal}>
                                    <span className="font-black text-lg text-fg-default italic">{profileUser.following?.length || 0}</span>
                                    <span className="text-fg-subtle text-[7px] uppercase tracking-normal font-black">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-left relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-5xl font-black text-fg-default italic uppercase tracking-tight">
                                    {profileUser.name}
                                </h1>
                                <p className="text-accent font-bold text-[10px] md:text-sm tracking-widest opacity-80 mb-6 uppercase">
                                    {profileUser.email}
                                </p>

                                {/* Stats for Desktop */}
                                <div className="hidden md:flex gap-10 text-sm">
                                    <div className="flex gap-2 items-baseline group/stat">
                                        <span className="font-black text-2xl text-fg-default italic group-hover/stat:text-accent transition-colors">{posts.length}</span>
                                        <span className="text-fg-subtle text-[10px] uppercase tracking-[0.2em] font-black">Posts</span>
                                    </div>
                                    <div
                                        className="flex gap-2 items-baseline cursor-pointer group/stat"
                                        onClick={openFollowersModal}
                                    >
                                        <span className="font-black text-2xl text-fg-default italic group-hover/stat:text-accent transition-colors">{profileUser.followers?.length || 0}</span>
                                        <span className="text-fg-subtle text-[10px] uppercase tracking-[0.2em] font-black">Followers</span>
                                    </div>
                                    <div
                                        className="flex gap-2 items-baseline cursor-pointer group/stat"
                                        onClick={openFollowingModal}
                                    >
                                        <span className="font-black text-2xl text-fg-default italic group-hover/stat:text-accent transition-colors">{profileUser.following?.length || 0}</span>
                                        <span className="text-fg-subtle text-[10px] uppercase tracking-[0.2em] font-black">Following</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {currentUser && currentUser._id === id ? (
                                    <Link to="/profile/edit" className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] text-fg-default px-8 py-3.5 rounded-2xl border border-white/5 transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-xl group/edit">
                                        <FaUserEdit className="text-accent group-hover/edit:scale-110 transition-transform" size={18} /> Edit Profile
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            className={`flex-1 md:flex-none px-10 py-3.5 rounded-2xl transition-all duration-300 text-xs font-black uppercase tracking-[0.2em] shadow-2xl ${isFollowing
                                                ? "bg-white/5 text-fg-muted border border-white/5 hover:bg-white/10"
                                                : "bg-accent hover:bg-accent-hover text-white shadow-accent/20 hover:scale-105 active:scale-95"
                                                }`}
                                        >
                                            {isFollowing ? "Unfollow" : "Follow"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('open-chat', { detail: profileUser }));
                                            }}
                                            className="p-4 bg-white/5 hover:bg-white/10 text-accent rounded-2xl border border-white/5 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
                                            title="Message"
                                        >
                                            <FaComment size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <p className="text-fg-muted mb-8 text-sm md:text-lg leading-relaxed max-w-2xl font-medium opacity-80 group-profile-hover:opacity-100 transition-opacity italic">
                            {profileUser.bio || "Building the next generation of digital experiences..."}
                        </p>

                        {profileUser.techStack && profileUser.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 mb-10">
                                {profileUser.techStack.map((tech, i) => (
                                    <span key={i} className="bg-accent/5 text-accent px-4 py-1.5 rounded-full text-[10px] md:text-xs font-mono font-bold border border-accent/10 tracking-widest uppercase hover:bg-accent/10 transition-colors cursor-default">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-y-4 gap-x-4 md:gap-8 border-t border-white/[0.03] pt-8">
                            {profileUser.linkedinLink && (
                                <a href={profileUser.linkedinLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-fg-subtle hover:text-accent transition-all duration-300 text-[10px] md:text-xs font-black uppercase tracking-widest group/link shrink-0">
                                    <FaLinkedin size={14} className="text-fg-default group-hover/link:text-accent transition-colors md:w-5 md:h-5" /> LinkedIn
                                </a>
                            )}
                            {profileUser.githubLink && (
                                <a href={profileUser.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-fg-subtle hover:text-accent transition-all duration-300 text-[10px] md:text-xs font-black uppercase tracking-widest group/link shrink-0">
                                    <FaGithub size={14} className="text-fg-default group-hover/link:text-accent transition-colors md:w-5 md:h-5" /> GitHub
                                </a>
                            )}
                            {profileUser.portfolioLink && (
                                <a href={profileUser.portfolioLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-fg-subtle hover:text-accent transition-all duration-300 text-[10px] md:text-xs font-black uppercase tracking-widest group/link shrink-0">
                                    <FaLink size={12} className="text-fg-default group-hover/link:text-accent transition-colors md:w-4.5 md:h-4.5" /> Portfolio
                                </a>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Posts Grid Section */}
            <div className="mt-10 md:mt-20">
                <div className="flex items-center gap-6 mb-10">
                    <div className="flex items-center gap-3 text-fg-default group cursor-default">
                        <BsGrid3X3 size={18} className="text-accent" />
                        <span className="text-sm font-black uppercase tracking-[0.3em] italic">Showcase</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                </div>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 lg:gap-10">
                        {posts.map(post => {
                            const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
                            const thumbnail = images.length > 0 ? getOptimizedUrl(images[0]) : null;

                            return (
                                <Link
                                    key={post._id}
                                    to={`/posts/${post._id}`}
                                    className="relative aspect-square glass-card rounded-3xl overflow-hidden group/item cursor-pointer shadow-2xl neon-border"
                                >
                                    {thumbnail ? (
                                        <img
                                            src={thumbnail}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-canvas-inset">
                                            <FaUser size={32} className="text-white/5" />
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-canvas-default/60 backdrop-blur-sm opacity-0 group-hover/item:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-4 text-center">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-white line-clamp-1">{post.title}</h4>
                                        <div className="flex items-center gap-6 text-white font-black italic">
                                            <div className="flex items-center gap-2">
                                                <FaHeart size={16} className="text-red-500" />
                                                <span className="text-xs">{post.likes.length}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaComment size={16} className="text-accent" />
                                                <span className="text-xs">{post.comments.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-24 text-center glass-card rounded-[2.5rem] border-dashed border-white/5">
                        <BsGrid3X3 size={48} className="mx-auto mb-6 text-fg-subtle opacity-20" />
                        <p className="text-fg-default font-black uppercase tracking-widest text-sm mb-2">No Innovations Yet</p>
                        <p className="text-fg-subtle text-xs font-medium">Capture your first breakthrough today.</p>
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-canvas-default/80 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-md glass-card border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-white/[0.03] flex items-center justify-between">
                    <h3 className="text-xl font-black text-fg-default uppercase tracking-widest italic font-mono">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 rounded-2xl text-fg-subtle hover:text-fg-default transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-thin">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader size="sm" text="" />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-2">
                            {users.map(user => (
                                <Link
                                    key={user._id}
                                    to={`/profile/${user._id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-4 hover:bg-white/[0.03] rounded-3xl transition-all duration-300 group/item"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-accent blur-lg opacity-0 group-hover/item:opacity-20 transition-opacity"></div>
                                        {user.profilePic ? (
                                            <img
                                                src={getOptimizedUrl(user.profilePic)}
                                                alt={user.name}
                                                className="w-14 h-14 rounded-2xl object-cover border border-white/10 relative z-10"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-canvas-inset border border-white/5 flex items-center justify-center text-fg-subtle relative z-10">
                                                <FaUser size={20} className="opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 z-10">
                                        <h4 className="font-bold text-fg-default truncate group-hover/item:text-accent transition-colors">{user.name}</h4>
                                        <p className="text-[11px] text-fg-subtle truncate uppercase tracking-widest font-bold opacity-60">{user.bio || "Crafting code..."}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <FaUser size={40} className="mx-auto mb-4 text-fg-subtle opacity-10" />
                            <p className="text-fg-subtle text-xs font-black uppercase tracking-widest">Empty Space</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
