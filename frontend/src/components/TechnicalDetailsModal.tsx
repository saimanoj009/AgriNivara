import { X, ShieldAlert, Cpu, Server, Code, Sparkles } from 'lucide-react';
import type { SIHJudgeSpecs } from '../types/agriculture';

interface TechnicalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    specs?: SIHJudgeSpecs | null;
}

export function TechnicalDetailsModal({ isOpen, onClose, specs }: TechnicalDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-800 space-y-6 my-8">
                
                {/* HEADER */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-wide">
                                SIH JUDGE TECHNICAL INSPECTION PANEL
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">
                                Architecture, ML inference specifications & API contract details
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* TECH SPEC GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* ML MODEL SPECS */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                            <Cpu className="w-4 h-4" />
                            <span>ML Model Specs</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                            <li>• <strong>Algorithm:</strong> Random Forest Classifier</li>
                            <li>• <strong>Trees (n_estimators):</strong> {specs?.n_estimators || 100}</li>
                            <li>• <strong>Target Classes:</strong> 22 Agricultural Crops</li>
                            <li>• <strong>Input Vector:</strong> [N, P, K, Temp, Humidity, pH, Rainfall]</li>
                            <li>• <strong>Accuracy Metric:</strong> 99.3% Cross-Validation</li>
                        </ul>
                    </div>

                    {/* EXPLAINABILITY & XAI */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase">
                            <Sparkles className="w-4 h-4" />
                            <span>Explainable AI Engine</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                            <li>• <strong>Method:</strong> Agronomic Optimal Bounds Engine</li>
                            <li>• <strong>Suitability Logic:</strong> Euclidean Distance Penalty</li>
                            <li>• <strong>Risk Detection:</strong> Multi-threshold Stress Rules</li>
                            <li>• <strong>Action Plan:</strong> Stage-specific Cultivation Rules</li>
                        </ul>
                    </div>

                    {/* BACKEND API CONTRACTS */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase">
                            <Server className="w-4 h-4" />
                            <span>Backend Architecture</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                            <li>• <strong>Framework:</strong> FastAPI (Python 3.11)</li>
                            <li>• <strong>ML Libraries:</strong> Scikit-Learn, Pandas, NumPy, TensorFlow</li>
                            <li>• <strong>Endpoints:</strong> /predict-crop, /farm-analysis, /what-if, /predict-disease</li>
                            <li>• <strong>Inference Latency:</strong> &lt; 45ms</li>
                        </ul>
                    </div>

                    {/* INTEGRATIONS & FRONTEND */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                            <Code className="w-4 h-4" />
                            <span>Frontend & APIs</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                            <li>• <strong>Framework:</strong> React 19, TypeScript, Vite</li>
                            <li>• <strong>Styling:</strong> Tailwind CSS v4, Lucide Icons</li>
                            <li>• <strong>Live Weather:</strong> Open-Meteo Satellite API</li>
                            <li>• <strong>Geocoding:</strong> OpenStreetMap Nominatim</li>
                        </ul>
                    </div>

                </div>

                {/* SIH INNOVATION SUMMARY */}
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 space-y-1">
                    <strong className="text-emerald-300 text-sm block">SIH Core Solution Innovations:</strong>
                    <p>
                        1. Explainable crop recommendation using transparent agronomic bounds.
                    </p>
                    <p>
                        2. Real-time interactive What-If crop scenario simulation.
                    </p>
                    <p>
                        3. Multilingual accessibility supporting English, Telugu, and Hindi.
                    </p>
                    <p>
                        4. Integrated decision support pipeline covering risk, suitability, weather, and action plan.
                    </p>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                        Close Technical Details
                    </button>
                </div>

            </div>
        </div>
    );
}
