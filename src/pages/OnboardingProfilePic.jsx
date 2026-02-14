import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";
import { FaUser, FaCamera, FaCheck, FaArrowRight, FaTimes } from "react-icons/fa";
import Cropper from "react-easy-crop";
import getCroppedImg, { blobURLtoFile } from "../utils/getCroppedImg";

const OnboardingProfilePic = () => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(null);
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
        if (!profilePic) {
            navigate("/onboarding/welcome");
            return;
        }


        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            if (profilePic) {
                formData.append("profilePic", profilePic);
            }

            await api.put("/users/update", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Force reload to update all UI elements with the new profile pic
            window.location.href = "/onboarding/welcome";

        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload profile picture");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        window.location.href = "/onboarding/welcome";
    };


    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-canvas-default">
            <div className="relative z-10 w-full max-w-xl -translate-y-6">
                <div className="bg-canvas-subtle p-6 md:p-10 rounded-3xl shadow-2xl border border-border-default">
                    <div className="mb-6 text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-2 ring-1 ring-accent/20">
                            <FaCamera size={28} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Add a profile picture</h2>
                        <p className="text-fg-muted max-w-sm mx-auto text-lg">
                            Show the community who you are.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-sm mb-6 text-center font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-6">
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => document.getElementById("profilePicInput").click()}
                        >
                            <div className="w-32 h-32 rounded-full bg-canvas-default border-4 border-border-default overflow-hidden flex items-center justify-center text-fg-muted group-hover:border-accent transition-all duration-300 shadow-2xl">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUser size={48} className="opacity-20" />
                                )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                                <FaCamera className="text-white text-2xl" />
                            </div>
                        </div>

                        <input
                            id="profilePicInput"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                        />

                        <div className="w-full space-y-3">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? (
                                    <Loader size="sm" text="Uploading..." button />
                                ) : (
                                    <>
                                        <span>{preview ? "Save and Finish" : "Finish Setup"}</span>
                                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleSkip}
                                className="btn-secondary w-full"
                            >
                                {preview ? "Remove and Skip" : "I'll do this later"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-canvas-subtle rounded-3xl overflow-hidden shadow-2xl border border-border-default">
                        <div className="p-6 border-b border-border-default flex justify-between items-center">
                            <h3 className="text-xl font-black text-fg-default">Adjust Your Photo</h3>
                            <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-canvas-default rounded-full text-fg-muted transition">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="relative h-[400px] w-full bg-black">
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

                        <div className="p-8 space-y-6">
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
                                    className="btn-secondary flex-1 border border-border-default"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="btn-primary flex-1"
                                >
                                    <FaCheck /> Apply Frame
                                </button>

                            </div>
                        </div>
                    </div>
                    <p className="mt-6 text-fg-muted text-sm font-medium">Drag to reposition your photo</p>
                </div>
            )}
        </div>
    );
};

export default OnboardingProfilePic;
