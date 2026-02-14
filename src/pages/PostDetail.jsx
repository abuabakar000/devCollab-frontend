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
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center lg:p-4 overflow-y-auto lg:overflow-hidden">
            {/* Close Button - Outside the card */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-4 right-4 z-[60] text-white hover:text-gray-300 bg-black/50 hover:bg-black/80 p-3 rounded-full transition shadow-lg lg:top-6 lg:right-6 backdrop-blur-sm border border-white/10"
            >
                <FaTimes size={20} />
            </button>

            <div className="max-w-7xl w-full mx-auto bg-canvas-subtle lg:rounded-3xl overflow-hidden border border-border-default shadow-2xl flex flex-col lg:flex-row h-full lg:h-[90vh] relative">

                {/* Left Side: Image Gallery */}
                <div className="lg:w-2/3 bg-black flex items-center justify-center relative border-r border-border-muted group">
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
                                        className="absolute left-4 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                        className="absolute right-4 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaChevronRight />
                                    </button>
                                    <div className="absolute bottom-6 flex gap-2">
                                        {images.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 w-8 rounded-full transition-all ${i === currentImageIndex ? 'bg-accent' : 'bg-white/30'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-fg-muted py-20">
                            <FaPaperPlane size={48} className="mb-4 opacity-20" />
                            <p>No screenshots provided</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Social/Details Sidebar */}
                <div className="lg:w-1/3 flex flex-col bg-canvas-subtle">
                    {/* Header */}
                    <div className="p-6 border-b border-border-muted flex items-center justify-between">
                        <Link to={`/profile/${post.user._id}`} className="flex items-center group">
                            {post.user.profilePic ? (
                                <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-12 h-12 rounded-full object-cover border border-border-default" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-canvas-default border border-border-default flex items-center justify-center">
                                    <FaUser className="text-fg-muted" />
                                </div>
                            )}
                            <div className="ml-3">
                                <h3 className="font-bold text-fg-default group-hover:text-accent transition">{post.user.name}</h3>
                            </div>
                        </Link>
                        {user && post.user._id !== user._id && (
                            <button
                                onClick={handleFollow}
                                className={`font-bold text-sm px-4 py-1.5 rounded-lg transition-all duration-200 ${isFollowing
                                    ? "text-fg-muted border border-border-default hover:bg-canvas-default"
                                    : "text-accent hover:text-accent-hover hover:bg-accent/10"
                                    }`}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>
                        )}
                    </div>

                    {/* Content Area (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <h1 className="text-2xl font-bold text-fg-default">{post.title}</h1>
                                {isOwnPost && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowPostOptions(!showPostOptions)}
                                            className="text-fg-muted hover:text-fg-default p-2 rounded-full transition-colors"
                                        >
                                            <FaEllipsisV />
                                        </button>
                                        {showPostOptions && (
                                            <div className="absolute right-0 mt-2 w-48 bg-canvas-subtle border border-border-default rounded-xl shadow-xl z-50 overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        setShowPostDeleteModal(true);
                                                        setShowPostOptions(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition"
                                                >
                                                    <FaTrash size={12} /> Delete Post
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-fg-muted text-sm leading-relaxed whitespace-pre-line">{post.text}</p>
                        </div>

                        {post.techStack && post.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.techStack.map((tech, i) => (
                                    <span key={i} className="bg-canvas-default text-accent border border-border-muted px-3 py-1 rounded-lg text-xs font-mono">
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
                                className="flex items-center justify-center gap-2 w-full bg-canvas-default hover:bg-border-muted border border-border-default text-fg-default py-3 rounded-xl transition font-semibold text-sm"
                            >
                                <FaGithub size={18} /> View Source Code
                            </a>
                        )}

                        {/* Comments Section */}
                        <div className="pt-4 border-t border-border-muted">
                            <h4 className="font-bold text-fg-default mb-6 flex items-center gap-2">
                                Comments <span className="bg-canvas-default px-2 py-0.5 rounded-md text-xs border border-border-muted">{post.comments.length}</span>
                            </h4>
                            <div className="space-y-6">
                                {post.comments.map((comment, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <Link to={`/profile/${comment.user._id}`} className="shrink-0 transition-opacity hover:opacity-80">
                                            {comment.user.profilePic ? (
                                                <img src={getOptimizedUrl(comment.user.profilePic)} className="w-8 h-8 rounded-full object-cover border border-border-muted" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-canvas-default flex items-center justify-center border border-border-muted">
                                                    <FaUser size={12} className="text-fg-muted" />
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex-1">
                                            <div className="bg-canvas-default rounded-2xl p-4 border border-border-muted shadow-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <Link to={`/profile/${comment.user._id}`} className="font-bold text-xs text-fg-default hover:text-accent transition-colors">
                                                        {comment.user.name}
                                                    </Link>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] text-fg-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        {user?._id === comment.user._id && (
                                                            <button
                                                                onClick={() => handleDeleteClick(comment._id)}
                                                                className="text-red-500 hover:text-red-400 transition-colors cursor-pointer p-1 -m-1"
                                                                title="Delete comment"
                                                            >
                                                                <FaTrash size={10} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-fg-muted leading-relaxed">{comment.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {post.comments.length === 0 && (
                                    <p className="text-center text-fg-muted text-xs py-10 italic">Be the first to comment on this project...</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer: Actions & Comment Input */}
                    <div className="p-6 border-t border-border-muted bg-canvas-subtle/80 backdrop-blur-sm sticky bottom-0">
                        <div className="flex items-center gap-6 mb-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-fg-muted hover:text-red-500'}`}
                            >
                                <FaHeart /> {likesCount} Likes
                            </button>
                            <div className="flex items-center gap-2 text-sm font-bold text-fg-muted">
                                <FaComment /> {post.comments.length} Comments
                            </div>
                        </div>

                        <form onSubmit={handleComment} className="flex gap-2">
                            <div className="flex-1 relative">
                                {user?.profilePic && (
                                    <img
                                        src={getOptimizedUrl(user.profilePic)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full object-cover border border-border-default shadow-sm"
                                    />
                                )}
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className={`w-full bg-canvas-default border border-border-default rounded-xl py-3 text-sm focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all placeholder:text-fg-muted/40 ${user?.profilePic ? 'pl-11' : 'px-4'}`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="btn-primary p-3 rounded-xl shadow-none"
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
