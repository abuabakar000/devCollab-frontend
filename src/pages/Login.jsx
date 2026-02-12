import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo-onboard.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="min-h-[calc(100vh-70px)] flex flex-col lg:flex-row lg:h-[calc(100vh-70px)] lg:overflow-hidden">

            {/* Left Panel: Branding */}
            <div className="w-full lg:w-1/2 bg-canvas-default flex flex-col items-center justify-center py-12 px-6 lg:p-12 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-border-default shrink-0">
                {/* Dynamic Animated Background */}
                <div className="absolute inset-0 z-0">
                    {/* Primary Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-float-slow"></div>

                    {/* Secondary Accents */}
                    <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] animate-float-medium"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow"></div>

                    {/* Technical Grid Overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, #E6EDF3 1px, transparent 0)`,
                            backgroundSize: '32px 32px'
                        }}
                    ></div>
                </div>

                <div className="relative z-10 text-center space-y-8">

                    <img
                        src={logo}
                        alt="DevCollab"
                        className="h-24 w-auto mx-auto object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-700"
                    />
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <h1 className="text-lg font-black text-white">
                            Show what you build. Connect with who matters.
                        </h1>

                    </div>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="lg:w-1/2 bg-canvas-subtle flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="mb-10 text-left">
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Login</h2>
                        <p className="text-fg-muted font-medium">Welcome back to your workspace.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-8 font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-fg-muted uppercase tracking-widest ml-1">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-canvas-default text-fg-default rounded-2xl px-5 py-4 border border-border-default focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20 text-lg"
                                required
                                placeholder="Email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-fg-muted uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-canvas-default text-fg-default rounded-2xl px-5 py-4 border border-border-default focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all duration-300 placeholder-fg-muted/20 text-lg pr-14"
                                    required
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-accent transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="btn-primary w-full py-5 text-xl shadow-[0_0_30px_rgba(47,129,247,0.2)]"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-border-muted text-center lg:text-left">
                        <p className="text-fg-muted font-medium">
                            Don't have an account? <Link to="/register" className="text-accent font-black hover:text-accent-hover transition-colors ml-1">Join the community</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Login;
