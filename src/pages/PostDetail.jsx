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

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await api.get(`/posts/${id}`);
                setPost(data);
                setLikesCount(data.likes.length);
                setIsLiked(data.likes.includes(user?._id));
                setIsFollowing(data.user.followers?.includes(user?._id));
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

    if (loading) return <Loader text="Unfolding the project details..." />;

    if (!post) return <div className="text-center py-20 text-fg-muted">Project not found.</div>;

    const isOwnPost = user?._id === post.user._id;
    const images = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center lg:p-4 overflow-hidden">
            {/* Close Button - Always visible, better placed on mobile */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-4 right-4 z-[70] text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 p-2.5 rounded-full transition shadow-lg lg:top-6 lg:right-6 backdrop-blur-md border border-white/10"
            >
                <FaTimes size={18} />
            </button>

            <div className="w-full h-full lg:max-w-7xl lg:h-[90vh] mx-auto bg-canvas-subtle lg:rounded-3xl overflow-hidden border border-border-default shadow-2xl flex flex-col lg:flex-row relative">

                {/* Mobile Header (Top) - Only on small screens */}
                <div className="lg:hidden p-4 pt-16 border-b border-border-muted flex items-center justify-between bg-canvas-subtle shrink-0">
                    <Link to={`/profile/${post.user._id}`} className="flex items-center group">
                        {post.user.profilePic ? (
                            <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-9 h-9 rounded-full object-cover border border-border-default" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-canvas-default border border-border-default flex items-center justify-center">
                                <FaUser size={14} className="text-fg-muted" />
                            </div>
                        )}
                        <div className="ml-3">
                            <h3 className="font-bold text-sm text-fg-default group-hover:text-accent transition">{post.user.name}</h3>
                        </div>
                    </Link>
                    {user && post.user._id !== user._id && (
                        <button
                            onClick={handleFollow}
                            className={`font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all duration-200 border ${isFollowing
                                ? "text-fg-muted border-border-default bg-canvas-default"
                                : "text-accent border-accent/30 hover:bg-accent/10"
                                }`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    )}
                </div>

                {/* Left/Top Side: Image Gallery */}
                <div className="lg:w-2/3 h-[50vh] md:h-[60vh] lg:h-full bg-black flex items-center justify-center relative border-r border-border-muted group shrink-0 lg:shrink-1 overflow-hidden">
                    {images.length > 0 ? (
                        <>
                            <img
                                src={getOptimizedUrl(images[currentImageIndex])}
                                alt={post.title}
                                className="w-full h-full object-contain"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                        className="absolute left-4 bg-black/30 hover:bg-black/60 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
                                    >
                                        <FaChevronLeft size={14} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                        className="absolute right-4 bg-black/30 hover:bg-black/60 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
                                    >
                                        <FaChevronRight size={14} />
                                    </button>
                                    <div className="absolute bottom-4 flex gap-1.5 px-4 w-full justify-center">
                                        {images.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 rounded-full transition-all ${i === currentImageIndex ? 'bg-accent w-6' : 'bg-white/20 w-3'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-fg-muted py-20 lg:py-0">
                            <FaPaperPlane size={48} className="mb-4 opacity-10" />
                            <p className="text-sm font-bold uppercase tracking-widest">No screenshots</p>
                        </div>
                    )}
                </div>

                {/* Right/Bottom Side: Social/Details Sidebar */}
                <div className="lg:w-1/3 flex flex-col bg-canvas-subtle overflow-y-auto lg:overflow-hidden">
                    {/* Desktop Header (Sidebar Top) - Hidden on Mobile */}
                    <div className="hidden lg:flex p-6 border-b border-border-muted items-center justify-between bg-canvas-default/30 backdrop-blur-sm">
                        <Link to={`/profile/${post.user._id}`} className="flex items-center group">
                            {post.user.profilePic ? (
                                <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-11 h-11 rounded-xl object-cover border border-border-default" />
                            ) : (
                                <div className="w-11 h-11 rounded-xl bg-canvas-default border border-border-default flex items-center justify-center">
                                    <FaUser size={18} className="text-fg-muted" />
                                </div>
                            )}
                            <div className="ml-3">
                                <h3 className="font-bold text-fg-default group-hover:text-accent transition">{post.user.name}</h3>
                            </div>
                        </Link>
                        {user && post.user._id !== user._id && (
                            <button
                                onClick={handleFollow}
                                className={`font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-xl transition-all duration-200 border ${isFollowing
                                    ? "text-fg-muted border-border-default hover:bg-canvas-default"
                                    : "text-accent border-accent/30 hover:bg-accent/5 hover:border-accent"
                                    }`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">

                        {/* Mobile Interactions (Right under image) */}
                        <div className="lg:hidden p-4 flex items-center justify-between border-b border-border-muted/30">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 group transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-fg-default hover:text-red-500'}`}
                                >
                                    <FaHeart size={20} className={isLiked ? "animate-jump" : ""} />
                                    <span className="text-sm font-black">{likesCount}</span>
                                </button>
                                <button className="flex items-center gap-2 text-fg-default">
                                    <FaComment size={20} />
                                    <span className="text-sm font-black">{post.comments.length}</span>
                                </button>
                            </div>
                            {post.githubRepoLink && (
                                <a href={post.githubRepoLink} target="_blank" rel="noopener noreferrer" className="text-fg-muted hover:text-accent transition">
                                    <FaGithub size={20} />
                                </a>
                            )}
                        </div>

                        <div className="p-4 md:p-6 space-y-6">
                            <div>
                                <div className="flex justify-between items-start mb-2 group">
                                    <h1 className="text-xl md:text-2xl font-black text-fg-default uppercase tracking-tight group-hover:text-accent transition-colors">{post.title}</h1>
                                    {isOwnPost && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowPostOptions(!showPostOptions)}
                                                className="text-fg-muted hover:text-fg-default p-2 rounded-full transition-colors"
                                            >
                                                <FaEllipsisV size={12} />
                                            </button>
                                            {showPostOptions && (
                                                <div className="absolute right-0 mt-2 w-48 bg-canvas-default border border-border-default rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button
                                                        onClick={() => {
                                                            setShowPostDeleteModal(true);
                                                            setShowPostOptions(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition"
                                                    >
                                                        <FaTrash size={10} /> Delete Project
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="text-fg-muted text-xs md:text-sm leading-relaxed whitespace-pre-line opacity-80">{post.text}</p>
                            </div>

                            {post.techStack && post.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {post.techStack.map((tech, i) => (
                                        <span key={i} className="bg-canvas-default text-accent border border-border-muted px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider shadow-sm">
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
                                    className="hidden lg:flex items-center justify-center gap-2 w-full bg-canvas-default hover:bg-border-muted border border-border-default text-fg-default py-3 rounded-xl transition font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-accent/5"
                                >
                                    <FaGithub size={16} /> View Source Code
                                </a>
                            )}

                            {/* Comments Section */}
                            <div className="pt-4 border-t border-border-muted/30">
                                <h4 className="text-[10px] font-black text-fg-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    Pulse Activity <span className="bg-accent text-white px-2 py-0.5 rounded-full text-[9px] animate-pulse">{post.comments.length}</span>
                                </h4>
                                <div className="space-y-5">
                                    {post.comments.map((comment, i) => (
                                        <div key={i} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                            <Link to={`/profile/${comment.user._id}`} className="shrink-0 transition-all hover:scale-105">
                                                {comment.user.profilePic ? (
                                                    <img src={getOptimizedUrl(comment.user.profilePic)} className="w-7 h-7 rounded-lg object-cover border border-border-muted" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-lg bg-canvas-default flex items-center justify-center border border-border-muted">
                                                        <FaUser size={10} className="text-fg-muted" />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-canvas-default/50 rounded-2xl p-3 border border-border-muted/30 shadow-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <Link to={`/profile/${comment.user._id}`} className="font-bold text-[11px] text-fg-default hover:text-accent transition-colors truncate pr-2">
                                                            {comment.user.name}
                                                        </Link>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-[9px] text-fg-muted opacity-50">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                            {user?._id === comment.user._id && (
                                                                <button
                                                                    onClick={() => handleDeleteClick(comment._id)}
                                                                    className="text-red-500/50 hover:text-red-500 transition-colors p-1"
                                                                >
                                                                    <FaTrash size={9} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-fg-muted leading-relaxed break-words">{comment.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {post.comments.length === 0 && (
                                        <div className="py-10 text-center space-y-3">
                                            <FaComment size={24} className="mx-auto text-fg-muted opacity-10" />
                                            <p className="text-[10px] font-bold text-fg-muted uppercase tracking-widest italic">Silent Pulse. Be the first.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions (Desktop: Interaction row, Both: Comment Input) */}
                    <div className="p-4 md:p-6 border-t border-border-muted bg-canvas-subtle/95 backdrop-blur-md sticky bottom-0 shrink-0">
                        {/* Desktop Only Actions */}
                        <div className="hidden lg:flex items-center gap-6 mb-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isLiked ? 'text-red-500 shadow-red-500/10' : 'text-fg-muted hover:text-red-500'}`}
                            >
                                <FaHeart size={18} className={isLiked ? "animate-jump" : ""} /> {likesCount}
                            </button>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-fg-muted">
                                <FaComment size={18} /> {post.comments.length}
                            </div>
                        </div>

                        <form onSubmit={handleComment} className="flex gap-2">
                            <div className="flex-1 relative">
                                {user?.profilePic && (
                                    <img
                                        src={getOptimizedUrl(user.profilePic)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg object-cover border border-border-default shadow-sm hidden md:block"
                                    />
                                )}
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className={`w-full bg-canvas-default border border-border-default rounded-xl py-3 text-xs md:text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all placeholder:text-fg-muted/30 ${user?.profilePic ? 'md:pl-11 pl-4' : 'px-4'}`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="bg-accent hover:bg-accent-hover text-white p-3 rounded-xl disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-accent/20"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-canvas-subtle border border-border-default rounded-2xl p-6 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-fg-default mb-2">Delete Comment?</h3>
                        <p className="text-fg-muted text-sm mb-6">This action cannot be undone. Are you sure you want to remove this comment?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-canvas-default border border-border-default text-fg-default font-semibold text-sm hover:bg-border-muted transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteComment}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-900/20 transition active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Delete Confirmation Modal */}
            {showPostDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPostDeleteModal(false)}></div>
                    <div className="bg-canvas-subtle border border-border-default rounded-2xl p-6 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-fg-default mb-2">Delete Post?</h3>
                        <p className="text-fg-muted text-sm mb-6">This action is permanent and will remove all comments and likes. Are you sure?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPostDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-canvas-default border border-border-default text-fg-default font-semibold text-sm hover:bg-border-muted transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePost}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-900/20 transition active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetail;
