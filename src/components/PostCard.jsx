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
    const [likes, setLikes] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id));

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
        <div className="bg-canvas-subtle rounded-3xl shadow-lg mb-4 md:mb-8 overflow-hidden border border-border-default hover:border-accent/30 transition-all duration-300 group">
            <Link to={`/posts/${post._id}`} className="block overflow-hidden">
                {(post.images && post.images.length > 0) ? (
                    <img
                        src={getOptimizedUrl(post.images[0])}
                        alt={post.title}
                        className="w-full aspect-[16/10] md:h-72 object-cover border-b border-border-muted group-hover:scale-105 transition-transform duration-700"
                    />
                ) : post.image ? (
                    <img
                        src={getOptimizedUrl(post.image)}
                        alt={post.title}
                        className="w-full aspect-[16/10] md:h-72 object-cover border-b border-border-muted group-hover:scale-105 transition-transform duration-700"
                    />
                ) : null}
            </Link>
            <div className="p-4 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                    <Link to={`/profile/${post.user._id}`} className="flex items-center group/user">
                        {post.user.profilePic ? (
                            <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-8 h-8 md:w-12 md:h-12 rounded-xl mr-3 object-cover border border-border-default group-hover/user:border-accent transition-colors" />
                        ) : (
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-canvas-default border border-border-muted flex items-center justify-center mr-3 group-hover/user:border-accent transition-colors">
                                <FaUser className="text-fg-muted size-3 md:size-5" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-sm md:text-lg text-fg-default group-hover/user:text-accent transition">{post.user.name}</h3>
                            <p className="text-fg-muted text-[10px] md:text-xs uppercase tracking-widest font-black opacity-60">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                    </Link>
                </div>

                <Link to={`/posts/${post._id}`} className="block mb-4">
                    <h2 className="text-lg md:text-2xl font-black text-fg-default mb-2 group-hover:text-accent transition uppercase tracking-tight">{post.title}</h2>
                    <p className="text-fg-muted whitespace-pre-line text-xs md:text-base leading-relaxed line-clamp-2 md:line-clamp-3 opacity-90">{post.text}</p>
                </Link>

                {post.techStack && post.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {post.techStack.map((tech, index) => (
                            <span key={index} className="bg-canvas-default text-accent text-[10px] md:text-xs px-2.5 py-1 rounded-lg border border-border-muted font-mono font-bold shadow-sm">
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-border-muted pt-4 md:pt-6 mt-2">
                    <div className="flex space-x-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-fg-muted hover:text-red-500"} transition text-xs md:text-sm font-bold uppercase tracking-wider`}
                        >
                            <FaHeart size={16} className={isLiked ? "animate-jump" : ""} />
                            <span>{likes}</span>
                        </button>
                        <Link to={`/posts/${post._id}`} className="flex items-center space-x-2 text-fg-muted hover:text-accent transition text-xs md:text-sm font-bold uppercase tracking-wider">
                            <FaComment size={16} />
                            <span>{post.comments.length}</span>
                        </Link>
                    </div>

                    {post.githubRepoLink && (
                        <a
                            href={post.githubRepoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-fg-muted hover:text-fg-default transition text-xs md:text-sm font-black uppercase tracking-widest bg-canvas-default px-3 py-1.5 rounded-lg border border-border-muted shadow-sm"
                        >
                            <FaGithub size={16} />
                            <span className="hidden xs:inline">Source</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;
