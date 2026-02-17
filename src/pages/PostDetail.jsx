import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaHeart, FaComment, FaGithub, FaUser, FaChevronLeft, FaChevronRight, FaPaperPlane, FaTimes, FaTrash, FaEllipsisV } from "react-icons/fa";
import api from "../services/api";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";

const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("f_auto,q_auto")) return url;
    const parts = url.split("/upload/");
    return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
};

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showPostOptions, setShowPostOptions] = useState(false);
    const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum distance for a swipe to be recognized (in pixels)
    const minSwipeDistance = 50;

    // Prevent scrolling when comments modal is open
    useEffect(() => {
        if (showCommentsModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showCommentsModal]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await api.get(`/posts/${id}`);
                setPost(data);
                setLikesCount(data?.likes?.length || 0);
                setIsLiked(data?.likes?.includes(user?._id) || false);
                setIsFollowing(data?.user?.followers?.includes(user?._id) || false);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching post:", error);
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, user]);

    const handleFollow = async () => {
        if (!user || !post) return;
        try {
            await api.put(`/users/follow/${post.user._id}`);
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error("Follow failed", err);
        }
    };

    const handleLike = async () => {
        if (!user) return;
        try {
            const { data } = await api.put(`/posts/like/${id}`);
            setLikesCount(data.likes);
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const { data } = await api.post(`/posts/comment/${id}`, { text: commentText });
            setPost({ ...post, comments: data });
            setCommentText("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleDeleteClick = (commentId) => {
        setCommentToDelete(commentId);
        setShowDeleteModal(true);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            const { data } = await api.delete(`/posts/comment/${id}/${commentToDelete}`);
            setPost({ ...post, comments: data });
            setShowDeleteModal(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error("Error deleting comment:", error);
            setShowDeleteModal(false);
        }
    };

    const handleDeletePost = async () => {
        try {
            await api.delete(`/posts/${id}`);
            navigate("/"); // Or current category/feed
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Please try again.");
        }
    };

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        } else if (isRightSwipe && images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    if (loading) return <Loader text="Unfolding the project details..." />;

    if (!post) return <div className="text-center py-20 text-fg-muted">Project not found.</div>;

    const isOwnPost = user?._id === post?.user?._id;
    const images = post?.images && post?.images?.length > 0 ? post.images : (post?.image ? [post.image] : []);


    return (
        <div className="fixed inset-0 z-50 bg-canvas-default/95 backdrop-blur-2xl flex items-center justify-center lg:p-4 overflow-hidden animate-in fade-in duration-500">
            {/* Close Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-6 right-6 z-[70] text-fg-subtle hover:text-white bg-white/5 hover:bg-accent p-3 rounded-2xl transition-all duration-300 shadow-3xl backdrop-blur-md border border-white/5 group"
                title="ESC to Close"
            >
                <FaTimes size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="w-full h-full lg:max-w-7xl lg:h-[90vh] mx-auto glass-card lg:rounded-[2.5rem] overflow-hidden border-white/5 shadow-3xl flex flex-col lg:flex-row relative animate-in zoom-in-95 duration-500">

                {/* Mobile Header */}
                <div className="lg:hidden p-5 pt-16 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.02] shrink-0">
                    <Link to={`/profile/${post?.user?._id}`} className="flex items-center group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            {post?.user?.profilePic ? (
                                <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-10 h-10 rounded-2xl object-cover border border-white/10 relative z-10" />
                            ) : (
                                <div className="w-10 h-10 rounded-2xl bg-canvas-inset border border-white/5 flex items-center justify-center relative z-10">
                                    <FaUser size={16} className="text-fg-subtle opacity-20" />
                                </div>
                            )}
                        </div>
                        <div className="ml-4">
                            <h3 className="font-black text-sm text-fg-default group-hover:text-accent transition uppercase tracking-widest italic font-mono">{post?.user?.name || 'Developer'}</h3>
                        </div>
                    </Link>
                    {user && post.user._id !== user._id && (
                        <button
                            onClick={handleFollow}
                            className={`font-black text-[10px] uppercase tracking-[0.2em] px-5 py-2 rounded-xl transition-all duration-300 shadow-xl ${isFollowing
                                ? "text-fg-subtle bg-white/5 border border-white/5"
                                : "text-white bg-accent shadow-accent/20 hover:scale-105 active:scale-95"
                                }`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    )}
                </div>

                {/* Left/Top Side: Image Gallery */}
                <div
                    className="lg:w-2/3 h-[40vh] md:h-[60vh] lg:h-full bg-canvas-inset flex items-center justify-center relative border-r border-white/[0.03] group shrink-0 lg:shrink-1 overflow-hidden touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {images.length > 0 ? (
                        <>
                            <div className="absolute inset-0 bg-accent blur-[120px] opacity-10"></div>
                            <img
                                src={getOptimizedUrl(images[currentImageIndex])}
                                alt={post.title}
                                className="w-full h-full object-contain relative z-10 p-4 lg:p-12 transition-all duration-700"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                        className="absolute left-8 bg-black/40 hover:bg-accent text-white p-5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block z-20 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90"
                                    >
                                        <FaChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                        className="absolute right-8 bg-black/40 hover:bg-accent text-white p-5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block z-20 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90"
                                    >
                                        <FaChevronRight size={16} />
                                    </button>
                                    <div className="absolute bottom-8 flex gap-3 px-4 w-full justify-center z-20">
                                        {images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentImageIndex(i)}
                                                className={`h-1.5 rounded-full transition-all duration-500 scale-110 ${i === currentImageIndex ? 'bg-accent w-10 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/20 w-4 hover:bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-fg-subtle py-20 lg:py-0 relative z-10">
                            <FaPaperPlane size={64} className="mb-6 opacity-10 animate-pulse text-accent" />
                            <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Zero Visuals Discovered</p>
                        </div>
                    )}
                </div>

                {/* Right/Bottom Side: Social/Details Sidebar */}
                <div className="lg:w-1/3 flex flex-col bg-canvas-subtle/40 backdrop-blur-xl overflow-y-auto lg:overflow-hidden relative">
                    {/* Desktop Header */}
                    <div className="hidden lg:flex p-8 border-b border-white/[0.03] items-center justify-between bg-white/[0.02] relative z-20">
                        <Link to={`/profile/${post?.user?._id}`} className="flex items-center group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                {post?.user?.profilePic ? (
                                    <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-12 h-12 rounded-[1.25rem] object-cover border border-white/10 relative z-10" />
                                ) : (
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-canvas-inset border border-white/5 flex items-center justify-center relative z-10">
                                        <FaUser size={20} className="text-fg-subtle opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="ml-4">
                                <h3 className="font-black text-fg-default group-hover:text-accent transition uppercase tracking-widest italic font-mono">{post?.user?.name || 'Developer'}</h3>
                                <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-0.5 opacity-80">PRO MEMBER</p>
                            </div>
                        </Link>
                        {user && post?.user?._id !== user._id && (
                            <button
                                onClick={handleFollow}
                                className={`font-black text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl transition-all duration-300 border shadow-2xl ${isFollowing
                                    ? "text-fg-subtle border-white/5 bg-white/5 hover:bg-white/10"
                                    : "text-white bg-accent border-accent hover:bg-accent-hover shadow-accent/20 hover:scale-105 active:scale-95"
                                    }`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">

                        {/* Mobile Interactions */}
                        <div className="lg:hidden p-6 flex items-center justify-between border-b border-white/[0.03] bg-white/[0.01]">
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2.5 group transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-fg-subtle hover:text-red-500'}`}
                                >
                                    <div className={`p-2 rounded-xl bg-white/5 group-hover:bg-red-500/10 transition-colors ${isLiked ? 'bg-red-500/10' : ''}`}>
                                        <FaHeart size={18} className={isLiked ? "animate-jump" : ""} />
                                    </div>
                                    <span className="text-xs font-black italic font-mono">{likesCount}</span>
                                </button>
                                <button
                                    onClick={() => setShowCommentsModal(true)}
                                    className="flex items-center gap-2.5 text-fg-subtle hover:text-accent transition-all group"
                                >
                                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-accent/10 transition-colors">
                                        <FaComment size={18} />
                                    </div>
                                    <span className="text-xs font-black italic font-mono">{post?.comments?.length || 0}</span>
                                </button>
                            </div>
                            {post.githubRepoLink && (
                                <a href={post.githubRepoLink} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 hover:bg-accent text-fg-subtle hover:text-white rounded-xl transition-all shadow-xl">
                                    <FaGithub size={18} />
                                </a>
                            )}
                        </div>

                        <div className="p-8 md:p-10 space-y-10">
                            <div className="relative">
                                <div className="flex justify-between items-start mb-6 group/title">
                                    <h1 className="text-2xl md:text-3xl font-black text-fg-default uppercase tracking-tight italic leading-tight group-hover/title:text-accent transition-colors">
                                        {post.title}
                                    </h1>
                                    {isOwnPost && (
                                        <div className="relative ml-4">
                                            <button
                                                onClick={() => setShowPostOptions(!showPostOptions)}
                                                className="text-white/20 hover:text-accent p-3 bg-white/5 hover:bg-accent/10 rounded-2xl transition-all"
                                            >
                                                <FaEllipsisV size={12} />
                                            </button>
                                            {showPostOptions && (
                                                <div className="absolute right-0 mt-3 w-56 glass-card border-white/10 rounded-2xl shadow-3xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <button
                                                        onClick={() => {
                                                            setShowPostDeleteModal(true);
                                                            setShowPostOptions(false);
                                                        }}
                                                        className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 flex items-center gap-4 transition-all"
                                                    >
                                                        <FaTrash size={12} /> Terminate Project
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-accent/40 to-transparent rounded-full opacity-0 group-hover-sidebar:opacity-100 transition-opacity"></div>
                                    <p className="text-fg-muted text-sm md:text-base leading-relaxed whitespace-pre-line font-medium opacity-80 italic">
                                        {post.text}
                                    </p>
                                </div>
                            </div>

                            {post.techStack && post.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-2.5">
                                    {post.techStack.map((tech, i) => (
                                        <span key={i} className="bg-accent/5 text-accent border border-accent/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent/10 transition-colors cursor-default">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {post.githubRepoLink && (
                                <a
                                    href={post.githubRepoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden lg:flex items-center justify-center gap-4 w-full bg-white/5 hover:bg-accent text-fg-default hover:text-white py-4 rounded-[1.25rem] transition-all duration-300 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl border border-white/5 hover:scale-[1.02] active:scale-95 group/gh"
                                >
                                    <FaGithub size={18} className="group-hover/gh:rotate-12 transition-transform" /> Repository
                                </a>
                            )}

                            {/* Comments Section - Desktop Only */}
                            <div className="hidden lg:block pt-10 border-t border-white/[0.03]">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] italic">
                                        Collaboration Pulse
                                    </h4>
                                    <div className="flex-1 h-px bg-white/[0.03]"></div>
                                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-black italic">
                                        {post?.comments?.length || 0}
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    {post?.comments?.map((comment, i) => (
                                        <div key={i} className="flex gap-4 group/comment animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                                            <Link to={`/profile/${comment?.user?._id}`} className="shrink-0 relative">
                                                <div className="absolute inset-0 bg-accent blur-md opacity-0 group-hover/comment:opacity-20 transition-opacity"></div>
                                                {comment?.user?.profilePic ? (
                                                    <img src={getOptimizedUrl(comment.user.profilePic)} className="w-8 h-8 rounded-xl object-cover border border-white/10 relative z-10" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-xl bg-canvas-inset flex items-center justify-center border border-white/5 relative z-10">
                                                        <FaUser size={12} className="text-fg-subtle opacity-20" />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-4 border border-white/[0.03] transition-colors relative">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <Link to={`/profile/${comment?.user?._id}`} className="font-black text-[11px] text-fg-default hover:text-accent transition-colors truncate pr-2 uppercase tracking-wider italic">
                                                            {comment?.user?.name}
                                                        </Link>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <span className="text-[9px] text-fg-subtle opacity-40 italic uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                            {user?._id === comment?.user?._id && (
                                                                <button
                                                                    onClick={() => handleDeleteClick(comment._id)}
                                                                    className="text-red-500/30 hover:text-red-500 transition-all p-1 hover:scale-110"
                                                                >
                                                                    <FaTrash size={10} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-fg-muted leading-relaxed break-words font-medium">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(post?.comments?.length || 0) === 0 && (
                                        <div className="py-16 text-center space-y-4 glass-card rounded-3xl border-dashed border-white/5">
                                            <FaComment size={32} className="mx-auto text-accent opacity-10 animate-pulse" />
                                            <p className="text-[10px] font-black text-fg-subtle uppercase tracking-[0.2em] italic">Silent Workspace. Drop a thought?</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions (Desktop Only) */}
                    <div className="hidden lg:block p-8 border-t border-white/[0.03] bg-canvas-subtle/80 backdrop-blur-2xl sticky bottom-0 shrink-0 z-30">
                        <div className="flex items-center gap-10 mb-6 px-1">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-90 group/like ${isLiked ? 'text-red-500' : 'text-fg-subtle hover:text-red-500'}`}
                            >
                                <div className={`p-2.5 rounded-xl bg-white/5 group-hover/like:bg-red-500/10 transition-colors ${isLiked ? 'bg-red-500/10' : ''}`}>
                                    <FaHeart size={18} className={isLiked ? "animate-jump" : ""} />
                                </div>
                                <span className="italic">{likesCount}</span>
                            </button>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-fg-subtle italic">
                                <div className="p-2.5 rounded-xl bg-white/5">
                                    <FaComment size={18} />
                                </div>
                                {post?.comments?.length || 0}
                            </div>
                        </div>

                        <form onSubmit={handleComment} className="flex gap-3">
                            <div className="flex-1 relative group/input text-left">
                                <div className="absolute inset-0 bg-accent/5 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
                                {user?.profilePic && (
                                    <img
                                        src={getOptimizedUrl(user.profilePic)}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg object-cover border border-white/10 shadow-xl hidden md:block z-10"
                                    />
                                )}
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Execute your thoughts..."
                                    className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 text-xs md:text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all placeholder:text-fg-subtle/30 relative z-10 ${user?.profilePic ? 'md:pl-12 pl-5' : 'px-5'}`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="bg-accent hover:bg-accent-hover text-white p-4 rounded-2xl disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 z-10 relative group/send"
                            >
                                <FaPaperPlane size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Mobile Comments Bottom Sheet */}
            {showCommentsModal && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div
                        className="absolute inset-0 bg-canvas-default/80 backdrop-blur-xl animate-in fade-in duration-500"
                        onClick={() => setShowCommentsModal(false)}
                    ></div>
                    <div className="absolute bottom-0 left-0 right-0 glass-card rounded-t-[3rem] border-t border-white/[0.05] h-[85vh] flex flex-col animate-in slide-in-from-bottom-2 duration-500 shadow-3xl">
                        {/* Handle */}
                        <div className="w-full flex justify-center p-6" onClick={() => setShowCommentsModal(false)}>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full"></div>
                        </div>

                        <div className="px-8 pb-6 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.01]">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-fg-default italic">Collaboration Pulse</h3>
                            <button onClick={() => setShowCommentsModal(false)} className="p-2.5 bg-white/5 rounded-xl text-fg-subtle hover:text-white transition-all">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
                            {post?.comments?.map((comment, i) => (
                                <div key={i} className="flex gap-5 group/mob-comment">
                                    <Link to={`/profile/${comment?.user?._id}`} className="shrink-0 relative">
                                        <div className="absolute inset-0 bg-accent blur-md opacity-20 group-hover/mob-comment:opacity-40 transition-opacity"></div>
                                        {comment?.user?.profilePic ? (
                                            <img src={getOptimizedUrl(comment.user.profilePic)} className="w-10 h-10 rounded-2xl object-cover border border-white/10 relative z-10" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-2xl bg-canvas-inset border border-white/5 flex items-center justify-center relative z-10">
                                                <FaUser size={14} className="text-fg-subtle opacity-20" />
                                            </div>
                                        )}
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <Link to={`/profile/${comment?.user?._id}`} className="font-black text-xs text-fg-default uppercase tracking-wide italic">
                                                {comment?.user?.name}
                                            </Link>
                                            <span className="text-[9px] text-fg-subtle opacity-40 italic uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[13px] text-fg-muted leading-relaxed font-medium">{comment.text}</p>
                                        {user?._id === comment?.user?._id && (
                                            <button
                                                onClick={() => handleDeleteClick(comment._id)}
                                                className="text-[9px] font-black text-red-500/50 mt-3 uppercase tracking-[0.2em] bg-red-500/5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                                            >
                                                Delete Thought
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(post?.comments?.length || 0) === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 py-20">
                                    <FaComment size={64} className="text-accent" />
                                    <p className="font-black uppercase tracking-[0.3em] text-[10px] font-mono">Silent Pulse Territory</p>
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="p-8 border-t border-white/[0.03] bg-canvas-subtle/80 backdrop-blur-2xl">
                            <form onSubmit={(e) => { handleComment(e); }} className="flex gap-4">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-white/5 border border-white/5 rounded-[1.5rem] px-6 py-4 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent/40 outline-none transition-all placeholder:text-fg-subtle/30 shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="bg-accent text-white p-5 rounded-[1.5rem] disabled:opacity-30 transition-all shadow-xl shadow-accent/20 active:scale-90"
                                >
                                    <FaPaperPlane size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-canvas-default/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="glass-card border-white/5 rounded-[2.5rem] p-10 max-w-sm w-full relative shadow-3xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                            <FaTrash size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-fg-default mb-3 uppercase tracking-tight italic font-mono">Purge Thought?</h3>
                        <p className="text-fg-subtle text-sm mb-10 font-medium leading-relaxed">This action will permanently remove your contribution to the pulse.</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteComment}
                                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Confirm Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-fg-default font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/5"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Delete Confirmation Modal */}
            {showPostDeleteModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-canvas-default/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowPostDeleteModal(false)}></div>
                    <div className="glass-card border-white/5 rounded-[3rem] p-12 max-w-md w-full relative shadow-3xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                            <FaTrash size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-3xl font-black text-fg-default mb-4 uppercase tracking-tight italic font-mono">Terminate Project?</h3>
                        <p className="text-fg-subtle text-base mb-12 font-medium leading-relaxed">Every interaction, every insight, and every line will be erased from the collective memory. Confirm termination?</p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleDeletePost}
                                className="w-full py-5 rounded-[1.5rem] bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-red-900/60 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Execute Termination
                            </button>
                            <button
                                onClick={() => setShowPostDeleteModal(false)}
                                className="w-full py-5 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-fg-default font-black text-xs uppercase tracking-[0.3em] transition-all border border-white/5"
                            >
                                Abort Mission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetail;
