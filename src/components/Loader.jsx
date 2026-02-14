import { useState, useEffect } from "react";
import { FaProjectDiagram } from "react-icons/fa";

const Loader = ({ fullScreen = false, size = "md", text = "Connecting to the grid...", button = false }) => {
    const [isTakingLong, setIsTakingLong] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsTakingLong(true), 5000);
        return () => clearTimeout(timer);
    }, []);
    const sizeClasses = {
        sm: "w-8 h-8 text-xl",
        md: "w-12 h-12 text-2xl",
        lg: "w-16 h-16 text-4xl"
    };

    const loaderContent = (
        <div className={`flex items-center justify-center gap-3 animate-in fade-in duration-500 ${button ? '' : 'flex-col gap-6'}`}>
            {/* Branded Loader Design */}
            <div className="relative">
                {/* Outer Glow Ring */}
                <div className={`absolute inset-0 rounded-full bg-accent/20 blur-xl animate-pulse`}></div>

                {/* Spinning Ring */}
                <div className={`${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} border-2 border-accent/20 border-t-accent rounded-full animate-spin`}></div>

                {/* Center Icon */}
                {!button && (
                    <div className="absolute inset-0 flex items-center justify-center text-accent/40">
                        <FaProjectDiagram size={size === 'sm' ? 12 : size === 'md' ? 18 : 24} />
                    </div>
                )}
            </div>

            {text && (
                <div className={`flex flex-col items-center ${button ? 'items-start gap-0' : 'gap-1'}`}>
                    <p className="text-fg-default font-black uppercase tracking-[0.2em] text-[10px] opacity-80">{text}</p>
                    {isTakingLong && !button && (
                        <p className="text-accent text-[9px] font-bold uppercase tracking-widest animate-pulse mt-1">
                            Server signature taking longer than expected...
                        </p>
                    )}
                    {!button && (
                        <div className="h-[2px] w-8 bg-accent/20 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-accent w-1/2 animate-[shimmer_1.5s_infinite_linear]"></div>
                        </div>
                    )}
                </div>
            )}

            {!button && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(200%); }
                    }
                `}} />
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[100] bg-canvas-default flex flex-col items-center justify-center">
                {/* Subtle atmosphere background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-4">
                        <span className="text-2xl font-black text-white tracking-widest uppercase opacity-20 select-none">DevCollab</span>
                    </div>
                    {loaderContent}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${button ? 'w-auto h-auto p-0' : 'w-full h-full p-12'}`}>
            {loaderContent}
        </div>
    );
};

export default Loader;
