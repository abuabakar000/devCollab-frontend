import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";

const CreatePost = () => {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [techStack, setTechStack] = useState("");
    const [githubRepoLink, setGithubRepoLink] = useState("");
    const [images, setImages] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("text", text);
        formData.append("techStack", techStack);
        formData.append("githubRepoLink", githubRepoLink);

        // Append all images
        images.forEach((img) => {
            formData.append("images", img);
        });

        try {
            console.log(`Submitting formData with ${images.length} images...`);
            const response = await api.post("/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Post created:", response.data);
            navigate("/");
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to create project.";
            setError(errorMsg);
            console.error("Upload error detail:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4">
            <div className="bg-canvas-subtle p-8 md:p-10 rounded-2xl shadow-xl border border-border-default">
                <h1 className="text-3xl font-extrabold text-fg-default mb-2 tracking-tight">Share Your Project</h1>
                <p className="text-fg-muted mb-8 text-sm">Let others see what you've been working on</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-2 ml-1">Project Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 placeholder-fg-muted/30"
                            required
                            placeholder="e.g., AI Code Assistant"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-2 ml-1">Description</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-3 h-40 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 placeholder-fg-muted/30 resize-none leading-relaxed"
                            required
                            placeholder="What makes this project special? List key features and technologies used..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-2 ml-1">Tech Stack</label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 placeholder-fg-muted/30"
                                placeholder="React, Tailwind, Node.js"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-2 ml-1">GitHub Repository</label>
                            <input
                                type="url"
                                value={githubRepoLink}
                                onChange={(e) => setGithubRepoLink(e.target.value)}
                                className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 placeholder-fg-muted/30"
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-fg-muted uppercase tracking-wider mb-2 ml-1">Screenshot (Optional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-default border-dashed rounded-xl bg-canvas-default hover:bg-canvas-subtle transition-colors cursor-pointer relative">
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-fg-muted"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-400">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent-hover focus-within:outline-none"
                                    >
                                        <span>Upload files</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            multiple
                                            onChange={(e) => setImages(Array.from(e.target.files))}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-fg-muted">PNG, JPG, GIF up to 5 files</p>
                                {images.length > 0 && (
                                    <p className="text-xs text-accent font-semibold mt-2">
                                        {images.length} files selected: {images.map(img => img.name).join(", ")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full ${loading ? 'py-2' : ''}`}
                        >
                            {loading ? <Loader size="sm" text="Broadcasting Project..." /> : "Publish Project"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreatePost;
