import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ShieldCheck, LockKeyhole } from "lucide-react";
import { loginApi, saveAuthSession } from "../services/api";

function Login() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const value = identifier.trim();
        const isAdmin = value === "Admin";

        if (!value || !password) {
            setError("Please enter your username/mobile number and password.");
            return;
        }

        if (!isAdmin && (!/^\d{10}$/.test(value))) {
            setError("Enter a valid 10-digit mobile number, or use the Admin username.");
            return;
        }

        setLoading(true);
        try {
            // ✅ Calls /auth/login via loginApi
            const auth = await loginApi(value, password);
            saveAuthSession(auth);

            // Redirect based on role
            navigate(auth.role === "admin" ? "/admin" : "/dashboard", { replace: true });
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg">
                        <Leaf size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900">AGRINIVARA</h1>
                        <p className="text-[10px] tracking-[0.22em] text-green-700 font-bold">AI SMART AGRICULTURE</p>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to access your personalized farm intelligence.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-7 space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">Username / Mobile Number</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="10-digit mobile or Admin"
                            autoComplete="username"
                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
                        <LockKeyhole size={16} className="mb-1" />
                        <b>Secure Login</b>
                        <p className="mt-1 text-emerald-700">Only registered users can enter.</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-slate-700">
                        <ShieldCheck size={16} className="mb-1" />
                        <b>Admin Access</b>
                        <p className="mt-1">Separate protected dashboard.</p>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link to="/signup" className="font-bold text-green-700 hover:text-green-800">Create Account</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
