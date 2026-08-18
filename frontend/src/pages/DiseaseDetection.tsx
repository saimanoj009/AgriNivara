import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, ShieldCheck, Loader2, Leaf } from "lucide-react";
import { predictDiseaseApi } from "../services/api";

export default function DiseaseDetection() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const selectFile = (f?: File) => {
        if (!f) return;
        setFile(f); setResult(null); setError("");
        setPreview(URL.createObjectURL(f));
    };

    const detect = async () => {
        if (!file) { setError("Please upload a clear crop/leaf image first."); return; }
        setLoading(true); setError("");
        try { setResult(await predictDiseaseApi(file)); }
        catch (e: any) { setError(e.message || "Disease detection failed."); }
        finally { setLoading(false); }
    };

    return <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
        <header className="border-b border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft size={17}/> Dashboard</Link>
                <div className="flex items-center gap-2 font-black"><Leaf className="text-emerald-600"/> AgriNivara</div>
            </div>
        </header>
        <main className="max-w-5xl mx-auto px-5 py-10">
            <div className="text-center">
                <p className="text-xs font-black tracking-widest text-emerald-700">AI PLANT HEALTH</p>
                <h1 className="mt-2 text-3xl font-black">Crop Disease Detection</h1>
                <p className="mt-2 text-slate-500">Upload a leaf image and let the trained vision model identify likely disease.</p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                    <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center hover:bg-emerald-50">
                        {preview ? <img src={preview} className="max-h-64 rounded-xl object-contain" alt="Selected leaf" /> : <>
                            <Upload className="text-emerald-600" size={42}/>
                            <p className="mt-4 font-bold">Choose leaf image</p>
                            <p className="mt-1 text-sm text-slate-500">JPG, PNG or WEBP</p>
                        </>}
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => selectFile(e.target.files?.[0])}/>
                    </label>
                    <button onClick={detect} disabled={loading} className="mt-5 w-full rounded-xl bg-emerald-700 py-3.5 font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
                        {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18}/> Analyzing image...</span> : "Detect Disease"}
                    </button>
                    {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                </div>

                <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 font-bold"><ShieldCheck className="text-emerald-600"/> AI Result</div>
                    {!result ? <div className="mt-16 text-center text-slate-400"><p>Upload an image to view the prediction.</p><p className="mt-2 text-xs">AI output is decision support, not a substitute for expert agronomic diagnosis.</p></div> :
                        <div className="mt-8">
                            <p className="text-sm text-slate-500">Likely condition</p>
                            <h2 className="mt-1 text-2xl font-black text-emerald-700">{result.predicted_disease?.replaceAll("_", " ")}</h2>
                            <p className="mt-3 text-sm font-bold">Confidence: {result.confidence}%</p>
                            <div className="mt-4 h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{width:`${Math.min(100,result.confidence || 0)}%`}}/></div>
                            <div className="mt-6 space-y-2">{result.top_predictions?.map((p:any,i:number)=><div key={i} className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span>{p.disease?.replaceAll("_"," ")}</span><b>{p.confidence}%</b></div>)}</div>
                        </div>}
                </div>
            </div>
        </main>
    </div>;
}
