import { Link } from "react-router-dom";
import { FaGithub, FaHeart, FaComment, FaCode, FaUser } from "react-icons/fa";
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import api from "../services/api";

const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("f_auto,q_auto")) return url;
    const parts = url.split("/upload/");
    return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
};

const PostCard = ({ post }) => {
    const { user } = useContext(AuthContext);
    const [likes, setLikes] = useState(post?.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(post?.likes?.includes(user?._id) || false);

    const handleLike = async () => {
        if (!user) return; // Or redirect to login
        try {
            const { data } = await api.put(`/posts/like/${post._id}`);
            setLikes(data.likes);
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    return (
        <div className="glass-card rounded-[2rem] mb-6 md:mb-10 overflow-hidden neon-border group/card">
            <Link to={`/posts/${post._id}`} className="block overflow-hidden relative aspect-[16/9] md:aspect-[21/9]">
                {(post.images && post.images.length > 0) ? (
                    <img
                        src={getOptimizedUrl(post.images[0])}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-1000"
                    />
                ) : post.image ? (
                    <img
                        src={getOptimizedUrl(post.image)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full bg-canvas-inset flex items-center justify-center">
                        <FaCode size={48} className="text-white/5" />
                    </div>
                )}
                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-canvas-subtle/80 via-transparent to-transparent opacity-60"></div>
            </Link>

            <div className="p-5 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    {post?.user && (
                        <Link to={`/profile/${post.user._id}`} className="flex items-center group/user">
                            <div className="relative">
                                {post.user.profilePic ? (
                                    <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl mr-4 object-cover border border-white/5 group-hover/user:border-accent transition-colors shadow-lg" />
                                ) : (
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-canvas-inset border border-white/5 flex items-center justify-center mr-4 group-hover/user:border-accent transition-colors">
                                        <FaUser className="text-fg-subtle size-4" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm md:text-base text-fg-default group-hover/user:text-accent transition truncate">{post.user.name}</h3>
                                <p className="text-fg-subtle text-[10px] md:text-xs font-medium">
                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                                </p>
                            </div>
                        </Link>
                    )}

                    {post.githubRepoLink && (
                        <a
                            href={post.githubRepoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-fg-muted hover:text-fg-default transition-all duration-300"
                            title="View Source"
                        >
                            <FaGithub size={18} />
                        </a>
                    )}
                </div>

                <Link to={`/posts/${post._id}`} className="block mb-6 group/title">
                    <h2 className="text-xl md:text-3xl font-black text-fg-default mb-3 group-hover/title:text-accent transition-colors tracking-tight leading-tight uppercase italic">
                        {post.title}
                    </h2>
                    <p className="text-fg-muted text-sm md:text-lg leading-relaxed line-clamp-2 opacity-80 font-medium">
                        {post.text}
                    </p>
                </Link>

                <div className="flex flex-wrap gap-2.5 mb-8">
                    {post.techStack && post.techStack.map((tech, index) => (
                        <span key={index} className="bg-accent/5 text-accent text-[10px] md:text-xs px-3.5 py-1.5 rounded-full border border-accent/10 font-bold tracking-wider uppercase hover:bg-accent/10 transition-colors">
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="flex items-center space-x-6 pt-6 border-t border-white/[0.03]">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2.5 py-2 px-4 rounded-xl transition-all duration-300 ${isLiked ? "bg-red-500/10 text-red-500" : "bg-white/5 text-fg-muted hover:bg-red-500/5 hover:text-red-500"}`}
                    >
                        <FaHeart size={18} className={isLiked ? "animate-bounce" : ""} />
                        <span className="text-sm font-black italic">{likes}</span>
                    </button>
                    <Link
                        to={`/posts/${post?._id}`}
                        className="flex items-center space-x-2.5 py-2 px-4 rounded-xl bg-white/5 text-fg-muted hover:bg-accent/5 hover:text-accent transition-all duration-300"
                    >
                        <FaComment size={18} />
                        <span className="text-sm font-black italic">{post?.comments?.length || 0}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
