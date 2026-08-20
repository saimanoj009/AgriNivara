import { useState } from "react";
import { Leaf } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuthSession, signupApi } from "../services/api";

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", mobile: "", location: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim() || !/^\d{10}$/.test(form.mobile)) {
            setError("Please enter a name and valid 10-digit mobile number.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const auth = await signupApi(form.name, form.mobile, form.location, form.password);
            saveAuthSession(auth);
            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            setError(err.message || "Unable to create account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white">
                        <Leaf size={22} />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900">AGRINIVARA</h1>
                        <p className="text-[9px] tracking-widest text-green-700 font-bold">SMART AGRICULTURE</p>
                    </div>
                </div>

                <div className="mt-7">
                    <h2 className="text-2xl font-bold text-slate-900">Create your farmer account</h2>
                    <p className="mt-2 text-sm text-slate-500">Your account keeps your farm intelligence private and personalized.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                    <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600" />
                    <input value={form.mobile} onChange={e => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600" />
                    <input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Village / City / District" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600" />
                    <input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Create password (min 6 characters)" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600" />
                    <input type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} placeholder="Confirm password" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-600" />

                    {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

                    <button disabled={loading} className="w-full rounded-xl bg-green-700 py-3.5 font-bold text-white hover:bg-green-800 disabled:opacity-60">
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="font-bold text-green-700">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
