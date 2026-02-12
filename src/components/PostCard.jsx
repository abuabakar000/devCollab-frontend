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
        <div className="bg-canvas-subtle rounded-xl shadow-sm mb-6 overflow-hidden border border-border-default hover:border-border-muted transition duration-200">
            <Link to={`/posts/${post._id}`}>
                {(post.images && post.images.length > 0) ? (
                    <img
                        src={getOptimizedUrl(post.images[0])}
                        alt={post.title}
                        className="w-full h-64 object-cover border-b border-border-muted"
                    />
                ) : post.image ? (
                    <img
                        src={getOptimizedUrl(post.image)}
                        alt={post.title}
                        className="w-full h-64 object-cover border-b border-border-muted"
                    />
                ) : null}
            </Link>
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <Link to={`/profile/${post.user._id}`} className="flex items-center group">
                        {post.user.profilePic ? (
                            <img src={getOptimizedUrl(post.user.profilePic)} alt={post.user.name} className="w-10 h-10 rounded-full mr-3 object-cover border border-border-default" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-canvas-default border border-border-muted flex items-center justify-center mr-3">
                                <FaUser className="text-fg-muted" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-fg-default group-hover:text-accent transition">{post.user.name}</h3>
                            <p className="text-fg-muted text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                    </Link>
                </div>

                <Link to={`/posts/${post._id}`} className="group">
                    <h2 className="text-xl font-bold text-fg-default mb-2 group-hover:text-accent transition">{post.title}</h2>
                    <p className="text-fg-muted mb-4 whitespace-pre-line text-sm leading-relaxed line-clamp-3">{post.text}</p>
                </Link>

                {post.techStack && post.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.techStack.map((tech, index) => (
                            <span key={index} className="bg-canvas-default text-accent text-xs px-2 py-1 rounded-full border border-border-muted font-mono">
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-border-muted pt-4 mt-2">
                    <div className="flex space-x-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : "text-fg-muted hover:text-red-500"} transition text-sm`}
                        >
                            <FaHeart />
                            <span>{likes}</span>
                        </button>
                        <Link to={`/posts/${post._id}`} className="flex items-center space-x-1 text-fg-muted hover:text-accent transition text-sm">
                            <FaComment />
                            <span>{post.comments.length}</span>
                        </Link>
                    </div>

                    {post.githubRepoLink && (
                        <a
                            href={post.githubRepoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-fg-muted hover:text-fg-default transition text-sm"
                        >
                            <FaGithub size={16} />
                            <span>View Code</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;
