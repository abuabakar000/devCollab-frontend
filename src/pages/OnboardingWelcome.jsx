import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-onboard.png";
import { FaArrowRight } from "react-icons/fa";

const OnboardingWelcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-canvas-default relative overflow-hidden">
            {/* Subtle aesthetic backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-lg text-center space-y-8 -translate-y-10">
                <div className="space-y-2 animate-in fade-in zoom-in duration-700">
                    <img
                        src={logo}
                        alt="DevCollab"
                        className="h-40 w-auto mx-auto object-contain select-none drop-shadow-2xl"
                        style={{ filter: 'brightness(1.1)' }}
                    />
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white tracking-tighter">You're all set!</h1>
                        <p className="text-fg-muted text-lg font-medium">
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
