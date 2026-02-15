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
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="bg-canvas-subtle p-8 rounded-3xl border border-border-default shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-purple-500 to-pink-500 animate-gradient"></div>

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-fg-default tracking-tight">Edit Profile</h2>
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-canvas-default rounded-full text-fg-muted transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById("profilePicInput").click()}>
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-accent shadow-xl group-hover:opacity-75 transition-all" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-canvas-default border-4 border-border-default flex items-center justify-center text-fg-muted group-hover:border-accent transition-all">
                                    <FaUser size={48} />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaCamera className="text-white text-3xl drop-shadow-lg" />
                            </div>
                        </div>
                        <input id="profilePicInput" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        <p className="text-xs font-bold text-fg-muted uppercase tracking-widest">Change Profile Picture</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-fg-muted uppercase tracking-wider ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-canvas-default/50 border border-border-default px-4 py-3 rounded-xl text-fg-default focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                                required
                                placeholder="Username"
                            />
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-fg-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                                <FaTools size={12} className="text-accent" /> Tech Stack (comma separated)
                            </label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                className="w-full bg-canvas-default/50 border border-border-default px-4 py-3 rounded-xl text-fg-default focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                                placeholder="React, Node.js, Tailwind..."
                            />
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-fg-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                                <FaLinkedin size={12} className="text-accent" /> LinkedIn Profile
                            </label>
                            <input
                                type="url"
                                value={linkedinLink}
                                onChange={(e) => setLinkedinLink(e.target.value)}
                                className="w-full bg-canvas-default/50 border border-border-default px-4 py-3 rounded-xl text-fg-default focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>

                        {/* GitHub */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-fg-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                                <FaGithub size={12} className="text-accent" /> GitHub Link
                            </label>
                            <input
                                type="url"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                                className="w-full bg-canvas-default/50 border border-border-default px-4 py-3 rounded-xl text-fg-default focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                                placeholder="https://github.com/ak/..." />
                        </div>

                        {/* Portfolio */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-fg-muted uppercase tracking-wider ml-1 flex items-center gap-2">
                                <FaLink size={12} className="text-accent" /> Portfolio/Website
                            </label>
                            <input
                                type="url"
                                value={portfolioLink}
                                onChange={(e) => setPortfolioLink(e.target.value)}
                                className="w-full bg-canvas-default/50 border border-border-default px-4 py-3 rounded-xl text-fg-default focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                                placeholder="https://portfolio.com/..."
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-fg-muted uppercase tracking-wider ml-1">Bio</label>
                        <textarea
                            rows="4"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-canvas-default/50 border border-border-default px-4 py-3 rounded-xl text-fg-default focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none resize-none"
                            placeholder="Tell the community about yourself..."
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-secondary flex-1 border border-border-default px-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                        >
                            {loading ? (
                                <Loader size="sm" text="Updating..." button />
                            ) : (
                                <><FaSave /> Save Changes</>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4">
                    <div className="w-full max-w-2xl bg-canvas-subtle rounded-3xl overflow-y-auto max-h-[calc(100vh-40px)] scrollbar-thin shadow-2xl border border-border-default">
                        <div className="p-5 md:p-6 border-b border-border-default flex justify-between items-center sticky top-0 bg-canvas-subtle z-10">
                            <h3 className="text-xl font-black text-fg-default">Adjust Profile Picture</h3>
                            <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-canvas-default rounded-full text-fg-muted transition">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="relative h-[300px] md:h-[400px] w-full bg-black">
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

                        <div className="p-6 md:p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black text-fg-muted uppercase tracking-widest">
                                    <span>Zoom</span>
                                    <span>{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="w-full h-2 bg-canvas-default rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowCropper(false)}
                                    className="btn-secondary flex-1 border border-border-default h-12 md:h-14"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="btn-primary flex-1 h-12 md:h-14"
                                >
                                    <FaCheck /> Apply Frame
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-fg-muted text-sm font-medium hidden md:block">Drag to reposition your photo</p>
                </div>
            )}
        </div>
    );
};

export default EditProfile;
