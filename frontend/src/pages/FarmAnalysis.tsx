import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function FarmAnalysis() {
    const [formData, setFormData] = useState({
        N: "",
        P: "",
        K: "",
        temperature: "",
        humidity: "",
        ph: "",
        rainfall: "",
    });

    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAnalyze = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setLoading(true);
        setResult("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/predict-crop`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        N: Number(formData.N),
                        P: Number(formData.P),
                        K: Number(formData.K),
                        temperature: Number(formData.temperature),
                        humidity: Number(formData.humidity),
                        ph: Number(formData.ph),
                        rainfall: Number(formData.rainfall),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Prediction failed");
            }

            setResult(data.recommended_crop);

        } catch (error) {
            console.error(error);
            setResult(
                "Unable to connect to AgriNivara server."
            );
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">

            <div className="mx-auto max-w-4xl">

                {/* HEADER */}
                <div className="mb-8">
                    <p className="text-sm font-semibold text-green-700">
                        AGRINIVARA
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Farm Analysis
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Enter your soil and environmental conditions
                        to receive a suitable crop recommendation.
                    </p>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleAnalyze}
                    className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
                >

                    <div className="grid gap-5 md:grid-cols-2">

                        {[
                            ["N", "Nitrogen (N)"],
                            ["P", "Phosphorus (P)"],
                            ["K", "Potassium (K)"],
                            ["temperature", "Temperature (°C)"],
                            ["humidity", "Humidity (%)"],
                            ["ph", "Soil pH"],
                            ["rainfall", "Rainfall (mm)"],
                        ].map(([name, label]) => (
                            <div key={name}>
                                <label className="text-sm font-medium text-slate-700">
                                    {label}
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    name={name}
                                    value={
                                        formData[
                                        name as keyof typeof formData
                                        ]
                                    }
                                    onChange={handleChange}
                                    required
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    placeholder={`Enter ${label}`}
                                />
                            </div>
                        ))}

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-7 w-full rounded-lg bg-green-700 py-3.5 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Analyzing Farm..."
                            : "Analyze Farm & Recommend Crop"}
                    </button>

                </form>

                {/* RESULT */}
                {result && (
                    <div className="mt-6 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">

                        <p className="text-sm font-medium text-slate-500">
                            Recommended Crop
                        </p>

                        <h2 className="mt-2 text-3xl font-bold capitalize text-green-700">
                            {result}
                        </h2>

                    </div>
                )}

            </div>

        </div>
    );
}

export default FarmAnalysis;