import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";
import { FaUser, FaCamera, FaSave, FaTimes, FaGithub, FaLink, FaTools, FaLinkedin, FaCheck } from "react-icons/fa";
import Cropper from "react-easy-crop";
import getCroppedImg, { blobURLtoFile } from "../utils/getCroppedImg";

const EditProfile = () => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [techStack, setTechStack] = useState(user?.techStack?.join(", ") || "");
    const [githubLink, setGithubLink] = useState(user?.githubLink || "");
    const [portfolioLink, setPortfolioLink] = useState(user?.portfolioLink || "");
    const [linkedinLink, setLinkedinLink] = useState(user?.linkedinLink || "");
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(user?.profilePic || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Cropper State
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImage(reader.result);
                setShowCropper(true);
            };
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropSave = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            setPreview(croppedImage);

            // Convert blob URL back to a File object for upload
            const file = await blobURLtoFile(croppedImage, "profile-pic.jpg");
            setProfilePic(file);

            setShowCropper(false);
        } catch (e) {
            console.error(e);
            setError("Failed to crop image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("bio", bio);
            formData.append("techStack", techStack.split(",").map(t => t.trim()));
            formData.append("githubLink", githubLink);
            formData.append("portfolioLink", portfolioLink);
            formData.append("linkedinLink", linkedinLink);
            if (profilePic) {
                formData.append("profilePic", profilePic);
            }

            const { data } = await api.put("/users/update", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Update local user context
            login(localStorage.getItem("token"), data);

            // Hard reload to refresh all global state (Navbar, Cache, etc.)
            window.location.href = `/profile/${user._id}`;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 md:py-20 px-4 animate-in fade-in duration-700">
            <div className="glass-card p-8 md:p-14 rounded-[2.5rem] border-white/5 shadow-3xl relative overflow-hidden group">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent blur-[100px] opacity-10"></div>

                <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-fg-default tracking-tighter italic font-mono uppercase">
                            Refine <span className="text-accent">Identity</span>
                        </h2>
                        <p className="text-fg-subtle text-sm font-medium opacity-60 mt-2 italic">Adjust your presence in the matrix.</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="p-4 bg-white/5 hover:bg-accent text-fg-subtle hover:text-white rounded-2xl transition-all duration-300 border border-white/5 group/close"
                    >
                        <FaTimes size={18} className="group-hover/close:rotate-90 transition-transform" />
                    </button>
                </div>

                {error && (
                    <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-500 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center gap-6 relative z-10 group/avatar">
                        <div className="relative cursor-pointer" onClick={() => document.getElementById("profilePicInput").click()}>
                            <div className="absolute inset-0 bg-accent blur-2xl opacity-20 group-hover/avatar:opacity-40 transition-opacity"></div>
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] object-cover border border-white/10 shadow-3xl relative z-10 transition-transform duration-500 group-hover/avatar:scale-105" />
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-fg-subtle relative z-10 group-hover/avatar:border-accent/40 transition-all duration-500">
                                    <FaUser size={48} className="opacity-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 z-20 bg-black/40 rounded-[2.5rem] backdrop-blur-sm">
                                <FaCamera className="text-white text-3xl" />
                            </div>
                        </div>
                        <input id="profilePicInput" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] italic">Update Avatar</p>
                            <div className="h-px w-8 bg-accent/20 mt-2"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 relative z-10">
                        {/* Name */}
                        <div className="group/field">
                            <label className="text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1 block group-focus-within/field:text-accent transition-colors font-mono">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-fg-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none font-bold italic font-mono"
                                required
                                placeholder="Username"
                            />
                        </div>

                        {/* Tech Stack */}
                        <div className="group/field">
                            <label className="italic uppercase tracking-[0.3em] mb-4 ml-1 block group-focus-within/field:text-accent transition-colors flex items-center gap-2 font-bold">
                                <FaTools size={12} className="text-accent/40" /> Tech Stack
                            </label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-fg-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none text-xs font-black uppercase tracking-widest font-mono"
                                placeholder="React, Node.js, Tailwind..."
                            />
                        </div>

                        {/* LinkedIn */}
                        <div className="group/field">
                            <label className="italic uppercase tracking-[0.3em] mb-4 ml-1 block group-focus-within/field:text-accent transition-colors flex items-center gap-2 font-bold">
                                <FaLinkedin size={12} className="text-accent/40" /> LinkedIn Profile
                            </label>
                            <input
                                type="url"
                                value={linkedinLink}
                                onChange={(e) => setLinkedinLink(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-fg-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none text-xs font-bold"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>

                        {/* GitHub */}
                        <div className="group/field">
                            <label className="italic uppercase tracking-[0.3em] mb-4 ml-1 block group-focus-within/field:text-accent transition-colors flex items-center gap-2 font-bold">
                                <FaGithub size={12} className="text-accent/40" /> GitHub Matrix
                            </label>
                            <input
                                type="url"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-fg-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none text-xs font-bold"
                                placeholder="https://github.com/ak/..." />
                        </div>

                        {/* Portfolio */}
                        <div className="group/field md:col-span-2">
                            <label className="italic uppercase tracking-[0.3em] mb-4 ml-1 block group-focus-within/field:text-accent transition-colors flex items-center gap-2 font-bold">
                                <FaLink size={12} className="text-accent/40" /> Portfolio Hub
                            </label>
                            <input
                                type="url"
                                value={portfolioLink}
                                onChange={(e) => setPortfolioLink(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl text-fg-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none text-xs font-bold"
                                placeholder="https://portfolio.com/..."
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="group/field relative z-10">
                        <label className="text-[10px] font-black text-fg-subtle uppercase tracking-[0.3em] mb-4 ml-1 block group-focus-within/field:text-accent transition-colors font-mono">Biography</label>
                        <textarea
                            rows="5"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 px-6 py-6 rounded-[1.5rem] text-fg-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none text-sm font-medium italic leading-relaxed"
                            placeholder="Tell the collective about your vision..."
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col md:flex-row gap-4 pt-8 relative z-10">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-fg-subtle font-black text-[10px] uppercase tracking-[0.3em] border border-white/5 transition-all"
                        >
                            Abort Changes
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-3xl shadow-accent/20 transition-all active:scale-95 disabled:grayscale group/save relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/save:translate-x-full transition-transform duration-1000"></div>
                            {loading ? (
                                <Loader size="sm" text="SYNCING..." button />
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    <FaSave size={14} /> Synchronize Profile
                                </span>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 z-[100] bg-canvas-default/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
                    <div className="w-full max-w-2xl glass-card rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-3xl border border-white/5 flex flex-col max-h-[95vh] md:max-h-[90vh] animate-in zoom-in-95 duration-500">
                        {/* Header - Sticky */}
                        <div className="p-6 md:p-10 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.02] shrink-0 sticky top-0 z-20 backdrop-blur-md">
                            <div>
                                <h3 className="text-xl font-black text-fg-default uppercase tracking-tight italic">Frame Calibration</h3>
                                <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1 opacity-60">Optimize your presence</p>
                            </div>
                            <button onClick={() => setShowCropper(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-fg-subtle hover:text-white transition-all">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto relative bg-black min-h-[300px]">
                            <div className="absolute inset-0">
                                <Cropper
                                    image={image}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            </div>
                        </div>

                        {/* Footer - Sticky */}
                        <div className="p-6 md:p-12 bg-canvas-subtle/80 backdrop-blur-xl shrink-0 border-t border-white/[0.03] sticky bottom-0 z-20">
                            <div className="flex gap-3 md:gap-4">
                                <button
                                    onClick={() => setShowCropper(false)}
                                    className="flex-1 py-4 md:py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-fg-subtle font-black text-[10px] uppercase tracking-[0.3em] border border-white/5 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="flex-1 py-4 md:py-5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-3xl shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3"
                                >
                                    <FaCheck /> Lock Frame
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfile;
