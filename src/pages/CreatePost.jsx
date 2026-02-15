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
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
            <div className="bg-canvas-subtle p-6 md:p-10 rounded-2xl shadow-xl border border-border-default">
                <h1 className="text-2xl md:text-3xl font-extrabold text-fg-default mb-2 tracking-tight">Share Your Project</h1>
                <p className="text-fg-muted mb-8 text-xs md:text-sm font-medium">Let others see what you've been working on</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <div className="group">
                        <label className="block text-[10px] md:text-xs font-black text-fg-muted uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-accent">Project Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-3.5 md:py-3 border border-border-default focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20 text-base md:text-sm"
                            required
                            placeholder="e.g., AI Code Assistant"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-[10px] md:text-xs font-black text-fg-muted uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-accent">Description</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-4 h-48 border border-border-default focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20 resize-none leading-relaxed text-base md:text-sm"
                            required
                            placeholder="What makes this project special? List key features and technologies used..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="group">
                            <label className="block text-[10px] md:text-xs font-black text-fg-muted uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-accent">Tech Stack</label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-3.5 md:py-3 border border-border-default focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20 text-base md:text-sm"
                                placeholder="React, Tailwind, Node.js"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-[10px] md:text-xs font-black text-fg-muted uppercase tracking-widest mb-2.5 ml-1 transition-colors group-focus-within:text-accent">GitHub Repository</label>
                            <input
                                type="url"
                                value={githubRepoLink}
                                onChange={(e) => setGithubRepoLink(e.target.value)}
                                className="w-full bg-canvas-default text-fg-default rounded-xl px-4 py-3.5 md:py-3 border border-border-default focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20 text-base md:text-sm"
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-black text-fg-muted uppercase tracking-widest mb-2.5 ml-1">Project Screenshots (Optional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-border-muted border-dashed rounded-2xl bg-canvas-default/50 hover:bg-canvas-default hover:border-accent/40 transition-all duration-300 cursor-pointer relative group">
                            <div className="space-y-3 text-center">
                                <div className="mx-auto h-12 w-12 text-fg-muted group-hover:text-accent group-hover:scale-110 transition-all duration-300">
                                    <svg
                                        className="h-full w-full"
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
                                </div>
                                <div className="flex flex-col md:flex-row items-center justify-center text-sm">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-lg font-black text-accent hover:text-accent-hover focus-within:outline-none px-2 py-1 bg-accent/5 hover:bg-accent/10 transition-all"
                                    >
                                        <span>Click to upload</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            multiple
                                            onChange={(e) => setImages(Array.from(e.target.files))}
                                        />
                                    </label>
                                    <p className="hidden md:block pl-1 text-fg-muted">or drag/drop</p>
                                </div>
                                <p className="text-[10px] md:text-xs text-fg-muted font-medium opacity-60">PNG, JPG, GIF up to 5 files</p>

                                {images.length > 0 && (
                                    <div className="mt-4 p-3 bg-canvas-subtle rounded-xl border border-border-muted/30 animate-in zoom-in-95 duration-200">
                                        <p className="text-[11px] text-accent font-black uppercase tracking-widest mb-1">{images.length} Files Ready</p>
                                        <p className="text-[10px] text-fg-muted truncate max-w-[200px] mx-auto opacity-70">
                                            {images.map(img => img.name).join(", ")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full shadow-2xl shadow-accent/20 ${loading ? 'py-2' : 'py-4 md:py-5'} rounded-xl transition-all active:scale-95 disabled:grayscale`}
                        >
                            {loading ? <Loader size="sm" text="Broadcasting Project..." /> : <span className="text-base font-black uppercase tracking-[0.2em]">Publish Project</span>}
                        </button>
                    </div>

                </form>
            </div>
        </div>

    );
};

export default CreatePost;
