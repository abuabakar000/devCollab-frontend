import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import { FaGithub, FaLinkedin, FaGlobe, FaRocket, FaArrowRight } from "react-icons/fa";

const Onboarding = () => {
    const { user } = useContext(AuthContext);
    const [portfolioLink, setPortfolioLink] = useState("");
    const [githubLink, setGithubLink] = useState("");
    const [linkedinLink, setLinkedinLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.put("/users/profile", {
                portfolioLink,
                githubLink,
                linkedinLink,
            });
            navigate("/onboarding/profile-pic");

        } catch (err) {
            setError(err.response?.data?.message || "Failed to update links. Please try again.");
            console.error("Onboarding update error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate("/onboarding/profile-pic");
    };


    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-canvas-default">
            <div className="relative z-10 w-full max-w-xl -translate-y-4">
                <div className="bg-canvas-subtle p-6 md:p-10 rounded-3xl shadow-2xl border border-border-default">

                    <div className="mb-4 text-center space-y-1">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 text-accent mb-2 ring-1 ring-accent/20">
                            <FaRocket size={24} className="animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Set up your profile</h2>
                        <p className="text-fg-muted max-w-sm mx-auto text-base">
                            Let the developer world find you.
                        </p>
                    </div>


                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-8 text-center font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6">
                            {/* Portfolio Link */}
                            <div className="group">
                                <label className="block text-[11px] font-black text-fg-muted uppercase tracking-[0.2em] mb-3 ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                                    Portfolio Website
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-fg-muted group-focus-within:text-accent transition-colors">
                                        <FaGlobe size={18} />
                                    </div>
                                    <input
                                        type="url"
                                        value={portfolioLink}
                                        onChange={(e) => setPortfolioLink(e.target.value)}
                                        className="w-full bg-canvas-default/50 text-fg-default rounded-2xl pl-12 pr-4 py-4 border border-border-default hover:border-border-default/80 focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20"
                                        placeholder="https://yourportfolio.dev"
                                    />
                                </div>
                            </div>

                            {/* GitHub Link */}
                            <div className="group">
                                <label className="block text-[11px] font-black text-fg-muted uppercase tracking-[0.2em] mb-3 ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                                    GitHub Profile
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-fg-muted group-focus-within:text-white transition-colors">
                                        <FaGithub size={18} />
                                    </div>
                                    <input
                                        type="url"
                                        value={githubLink}
                                        onChange={(e) => setGithubLink(e.target.value)}
                                        className="w-full bg-canvas-default/50 text-fg-default rounded-2xl pl-12 pr-4 py-4 border border-border-default hover:border-border-default/80 focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20"
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                            </div>

                            {/* LinkedIn Link */}
                            <div className="group">
                                <label className="block text-[11px] font-black text-fg-muted uppercase tracking-[0.2em] mb-3 ml-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
                                    LinkedIn Profile
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-fg-muted group-focus-within:text-[#0A66C2] transition-colors">
                                        <FaLinkedin size={18} />
                                    </div>
                                    <input
                                        type="url"
                                        value={linkedinLink}
                                        onChange={(e) => setLinkedinLink(e.target.value)}
                                        className="w-full bg-canvas-default/50 text-fg-default rounded-2xl pl-12 pr-4 py-3.5 border border-border-default hover:border-border-default/80 focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                <span>{loading ? "Optimizing Profile..." : "Complete Setup"}</span>
                                {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="btn-secondary w-full text-sm tracking-wide"
                            >
                                I'll do this later
                            </button>
                        </div>


                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
