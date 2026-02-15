import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import logo from "../assets/logo-onboard.png";
import { FaArrowRight } from "react-icons/fa";

const OnboardingWelcome = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-3 md:p-6 bg-canvas-default relative overflow-hidden">
            {/* Subtle aesthetic backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-lg text-center space-y-3 md:space-y-8 -translate-y-6 md:-translate-y-10">
                <div className="space-y-2 animate-in fade-in zoom-in duration-700">
                    <img
                        src={logo}
                        alt="DevCollab"
                        className="h-24 md:h-40 w-auto mx-auto object-contain select-none drop-shadow-2xl"
                        style={{ filter: 'brightness(1.1)' }}
                    />
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter">You're all set!</h1>
                        <p className="text-fg-muted text-sm md:text-lg font-medium">
                            Welcome to the community of professional developers.
                        </p>
                    </div>
                </div>

                <div className="pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <button
                        onClick={() => navigate("/")}
                        className="btn-primary px-10 py-4 mx-auto"
                    >
                        <span>Get Started</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="mt-4 text-fg-muted/50 text-sm font-bold uppercase tracking-widest">
                        Your profile is ready to go
                    </p>
                </div>

            </div>
        </div>
    );

};

export default OnboardingWelcome;
