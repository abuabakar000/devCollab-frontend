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
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-700">
            <div className="glass-card p-8 md:p-14 rounded-[2.5rem] shadow-3xl border-white/5 relative overflow-hidden group">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent blur-[100px] opacity-10"></div>

                <div className="relative z-10 mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-fg-default mb-4 tracking-tighter italic uppercase">
                        Broadcast <span className="text-accent">Innovation</span>
                    </h1>
                    <p className="text-fg-subtle text-sm md:text-base font-medium opacity-60 italic">
                        Deploy your breakthrough to the global collective.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest mb-10 animate-in slide-in-from-top-4 duration-500 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10 md:space-y-12">
                    <div className="group/field relative">
                        <label className="block text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within/field:text-accent transition-colors">Project Identity</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/[0.03] text-fg-default rounded-2xl px-6 py-4 border border-white/5 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none transition-all duration-500 placeholder:text-white/10 text-lg font-bold italic"
                            required
                            placeholder="e.g., NEURAL INTERFACE v1.0"
                        />
                    </div>

                    <div className="group/field relative">
                        <label className="block text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within/field:text-accent transition-colors">Documentation</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-white/[0.03] text-fg-default rounded-[1.5rem] px-6 py-6 h-56 border border-white/5 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none transition-all duration-500 placeholder:text-white/10 resize-none leading-relaxed text-sm font-medium italic"
                            required
                            placeholder="Detail the technical breakthrough, architecture, and vision..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div className="group/field relative">
                            <label className="block text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within/field:text-accent transition-colors">Tech Stack</label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                className="w-full bg-white/[0.03] text-fg-default rounded-2xl px-6 py-4 border border-white/5 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none transition-all duration-500 placeholder:text-white/10 text-xs font-black uppercase tracking-widest"
                                placeholder="REACT, TAILWIND, NODE.JS"
                            />
                        </div>

                        <div className="group/field relative">
                            <label className="block text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within/field:text-accent transition-colors">Github Matrix</label>
                            <input
                                type="url"
                                value={githubRepoLink}
                                onChange={(e) => setGithubRepoLink(e.target.value)}
                                className="w-full bg-white/[0.03] text-fg-default rounded-2xl px-6 py-4 border border-white/5 focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none transition-all duration-500 placeholder:text-white/10 text-xs font-bold"
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>

                    <div className="group/upload">
                        <label className="block text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1">Visual Evidence</label>
                        <div className="mt-1 flex justify-center px-8 pt-12 pb-12 border-2 border-white/5 border-dashed rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] hover:border-accent/30 transition-all duration-500 cursor-pointer relative group/drop overflow-hidden">
                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/drop:opacity-100 transition-opacity"></div>
                            <div className="space-y-6 text-center relative z-10">
                                <div className="mx-auto h-16 w-16 text-fg-subtle/20 group-hover/drop:text-accent group-hover/drop:scale-110 transition-all duration-500">
                                    <svg className="h-full w-full" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-accent px-6 py-3 bg-accent/5 hover:bg-accent/15 transition-all outline-none">
                                        <span>Initialize Upload</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={(e) => setImages(Array.from(e.target.files))} />
                                    </label>
                                    <p className="mt-4 text-[10px] font-bold text-fg-subtle uppercase tracking-widest opacity-40 italic">Drag & Drop visual data</p>
                                </div>
                                <p className="text-[9px] text-fg-subtle/30 font-black uppercase tracking-[0.2em]">MAX 5 FILES • PNG, JPG, GIF</p>

                                {images.length > 0 && (
                                    <div className="mt-6 p-4 glass-card rounded-2xl border-accent/20 animate-in zoom-in-95 duration-500 shadow-2xl">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                            <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">{images.length} Units Ready</p>
                                        </div>
                                        <p className="text-[9px] text-fg-subtle/50 truncate max-w-[250px] mx-auto font-mono">
                                            {images.map(img => img.name.toUpperCase()).join(" || ")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full shadow-3xl shadow-accent/20 ${loading ? 'py-4' : 'py-6 md:py-7'} rounded-[1.5rem] bg-accent hover:bg-accent-hover text-white transition-all duration-500 active:scale-95 disabled:grayscale disabled:opacity-40 group/submit relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000"></div>
                            {loading ? <Loader size="sm" text="COMMENCING BROADCAST..." /> : <span className="text-sm font-black uppercase tracking-[0.4em] italic font-mono">Publish to Matrix</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
