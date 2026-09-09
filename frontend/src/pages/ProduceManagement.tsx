import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    PackageCheck,
    Plus,
    Sparkles,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Calendar,
    MapPin,
    Warehouse,
    Upload,
    Clock,
    FileImage,
    ChevronRight,
    Edit3,
    Send,
    Eye,
    RefreshCw,
    X,
    Info,
    ShieldCheck,
} from 'lucide-react';
import { fetchMyProduceApi, submitProduceApi } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';
import { UnifiedLocationSelector } from '../components/UnifiedLocationSelector';

interface ProduceItem {
    id: number;
    crop_name: string;
    quantity: number;
    unit: string;
    harvest_date: string;
    quality_grade: string;
    moisture_pct?: number;
    storage_condition: string;
    location: string;
    expected_price: number;
    notes?: string;
    photo_data?: string;
    status: string;
    admin_notes?: string;
    created_at: string;
    advisory?: {
        spoilage_risk: string;
        storage_advice: string;
        handling_advice: string;
        sale_readiness: string;
    };
}

interface SubmitSuccessData {
    id: number;
    crop_name: string;
    quantity: number;
    unit: string;
    expected_price: number;
    location: string;
    submitted_at: string;
    advisory?: {
        spoilage_risk: string;
        storage_advice: string;
        handling_advice: string;
        sale_readiness: string;
    };
}

type FormStep = 'form' | 'review' | 'submitting' | 'success';

const WORKFLOW_STEPS = [
    'Submitted',
    'Under Review',
    'Site Visit Requested',
    'Site Visit Completed',
    'Purchase Approved',
    'Completed',
];

const SPOILAGE_RISK_COLORS: Record<string, string> = {
    LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    MODERATE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    HIGH: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

function getStepIndex(status: string) {
    if (status === 'Rejected') return -1;
    const idx = WORKFLOW_STEPS.indexOf(status);
    return idx !== -1 ? idx : 0;
}

export default function ProduceManagement() {
    const [produceList, setProduceList] = useState<ProduceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSubmit, setShowSubmit] = useState(false);
    const [formStep, setFormStep] = useState<FormStep>('form');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<SubmitSuccessData | null>(null);

    // Form state — ALL EMPTY BY DEFAULT
    const [cropName, setCropName] = useState('');
    const [variety, setVariety] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('Quintals');
    const [harvestDate, setHarvestDate] = useState('');
    const [qualityGrade, setQualityGrade] = useState('Grade A (Premium)');
    const [moisturePct, setMoisturePct] = useState('');
    const [storageCondition, setStorageCondition] = useState('Covered Warehouse');
    const [location, setLocation] = useState('');
    const [expectedPrice, setExpectedPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const photoInputRef = useRef<HTMLInputElement>(null);

    const loadProduce = async () => {
        setLoading(true);
        try {
            const data = await fetchMyProduceApi();
            setProduceList(data);
        } catch (err: any) {
            console.error('Produce load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduce();
    }, []);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            setError('Photo must be smaller than 3 MB.');
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const validateForm = (): boolean => {
        const errs: Record<string, string> = {};
        if (!cropName.trim()) errs.cropName = 'Crop name is required.';
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0)
            errs.quantity = 'Enter a valid quantity greater than 0.';
        if (!expectedPrice || isNaN(Number(expectedPrice)) || Number(expectedPrice) <= 0)
            errs.expectedPrice = 'Enter a valid expected price.';
        if (!location.trim()) errs.location = 'Storage/farm location is required.';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setError('');
            setFormStep('review');
        }
    };

    const handleSubmit = async () => {
        setError('');
        setFormStep('submitting');
        setSubmitting(true);

        try {
            const result = await submitProduceApi({
                crop_name: cropName.trim(),
                quantity: parseFloat(quantity),
                unit,
                harvest_date: harvestDate || new Date().toISOString().split('T')[0],
                quality_grade: qualityGrade,
                moisture_pct: moisturePct ? parseFloat(moisturePct) : undefined,
                storage_condition: storageCondition,
                location: location.trim(),
                expected_price: parseFloat(expectedPrice),
                notes: notes.trim() || undefined,
                image: photoFile || undefined,
            });

            setSuccessData({
                id: result.id,
                crop_name: cropName.trim(),
                quantity: parseFloat(quantity),
                unit,
                expected_price: parseFloat(expectedPrice),
                location: location.trim(),
                submitted_at: new Date().toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }),
                advisory: result.advisory,
            });

            setFormStep('success');
            await loadProduce();
        } catch (err: any) {
            console.error('Produce submit error:', err);
            setError(
                err.message ||
                'Unable to submit your listing. Please check your connection and try again.'
            );
            setFormStep('review');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setCropName('');
        setVariety('');
        setQuantity('');
        setUnit('Quintals');
        setHarvestDate('');
        setQualityGrade('Grade A (Premium)');
        setMoisturePct('');
        setStorageCondition('Covered Warehouse');
        setLocation('');
        setExpectedPrice('');
        setNotes('');
        setPhotoFile(null);
        setPhotoPreview('');
        setFormErrors({});
        setError('');
        setSuccessData(null);
        setFormStep('form');
    };

    const InputClass =
        'w-full rounded-xl bg-[#0C241E] border border-[#143B30] px-4 py-3 text-sm text-[#F3EBDD] placeholder-[#738A7C] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884]/30 outline-none transition';
    const SelectClass =
        'w-full rounded-xl bg-[#0C241E] border border-[#143B30] px-4 py-3 text-sm text-[#F3EBDD] focus:border-[#00B884] outline-none transition';
    const LabelClass = 'text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1';
    const ErrorClass = 'text-xs text-rose-400 mt-1';

    return (
        <div className="min-h-screen bg-[#071C17] text-[#F3EBDD] pb-20 selection:bg-[#00B884] selection:text-[#071C17]">
            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-[#0A211B]/90 backdrop-blur-xl border-b border-[#143B30] px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#102D25] hover:bg-[#143B30] text-xs font-bold text-[#00B884] border border-[#143B30] transition"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <AgriLogo size="sm" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#00B884]/15 border border-[#00B884]/30 text-[10px] font-bold text-[#00B884] uppercase tracking-wider">
                        Direct Procurement Engine
                    </span>
                    <button
                        onClick={loadProduce}
                        className="p-2 rounded-xl bg-[#102D25] border border-[#143B30] text-[#A8B9AE] hover:text-[#00B884] hover:border-[#00B884]/40 transition cursor-pointer"
                        title="Refresh listings"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#00B884]">
                            Post-Harvest Commerce
                        </span>
                        <h1 className="text-3xl font-extrabold text-[#F3EBDD] tracking-tight mt-1">
                            Produce Market & Direct Sale
                        </h1>
                        <p className="text-xs text-[#A8B9AE] mt-1">
                            Submit harvested crops for AI post-harvest advisories and direct procurement workflows.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 p-1.5 bg-[#102D25] border border-[#143B30] rounded-2xl shrink-0 self-start md:self-auto shadow-md">
                        <button
                            onClick={() => {
                                setShowSubmit(false);
                                resetForm();
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                !showSubmit
                                    ? 'bg-gradient-to-r from-[#00B884] to-[#00956B] text-[#071C17] font-extrabold shadow-md'
                                    : 'text-[#A8B9AE] hover:text-[#F3EBDD]'
                            }`}
                        >
                            <PackageCheck className="w-4 h-4" />
                            <span>My Harvest Listings ({produceList.length})</span>
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowSubmit(true);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                showSubmit
                                    ? 'bg-gradient-to-r from-[#00B884] to-[#00956B] text-[#071C17] font-extrabold shadow-md'
                                    : 'text-[#A8B9AE] hover:text-[#F3EBDD]'
                            }`}
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ List New Produce</span>
                        </button>
                    </div>
                </div>

                {/* MY LISTINGS VIEW */}
                {!showSubmit && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="py-20 text-center space-y-3">
                                <Loader2 className="w-8 h-8 text-[#00B884] animate-spin mx-auto" />
                                <p className="text-xs text-[#A8B9AE] font-bold">Loading produce inventory...</p>
                            </div>
                        ) : produceList.length === 0 ? (
                            <div className="bg-[#102D25] border border-[#143B30] rounded-3xl p-12 text-center space-y-4 shadow-xl">
                                <Warehouse className="w-12 h-12 text-[#738A7C] mx-auto" />
                                <div>
                                    <h3 className="text-lg font-black text-[#F3EBDD]">No Produce Listings Yet</h3>
                                    <p className="text-xs text-[#A8B9AE] mt-1 max-w-md mx-auto">
                                        Submit your harvested grain, fruit, or vegetable produce to receive storage advisories and connect with procurement buyers.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowSubmit(true);
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00B884] to-[#00956B] text-[#071C17] font-black text-xs transition inline-flex items-center gap-2 shadow-lg shadow-[#00B884]/20 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> List Your First Produce
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {produceList.map((item) => {
                                    const currentStepIdx = getStepIndex(item.status);
                                    const isRejected = item.status === 'Rejected';
                                    const isCompleted = item.status === 'Completed';

                                    return (
                                        <div key={item.id} className="bg-[#102D25] border border-[#143B30] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                                            {/* Item Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#143B30]">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 rounded-2xl bg-[#0C241E] border border-[#143B30] text-[#00B884] font-black text-lg">
                                                        🌾
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-xl font-black text-[#F3EBDD]">{item.crop_name}</h3>
                                                            <span className="px-2.5 py-0.5 rounded-full bg-[#0C241E] text-[#00B884] border border-[#143B30] text-xs font-bold">
                                                                {item.quantity} {item.unit}
                                                            </span>
                                                            <span className="text-[10px] text-[#738A7C] font-bold">Listing #{item.id}</span>
                                                        </div>
                                                        <p className="text-xs text-[#A8B9AE] mt-0.5 flex items-center gap-2 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5 text-[#00B884]" /> {item.location}
                                                            </span>
                                                            {item.harvest_date && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3.5 h-3.5 text-[#738A7C]" /> Harvested {item.harvest_date}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-xs text-[#A8B9AE] block font-extrabold uppercase">Expected Price</span>
                                                    <span className="text-2xl font-black text-[#00B884]">
                                                        ₹{item.expected_price.toLocaleString()}
                                                        <span className="text-xs text-[#A8B9AE] font-normal"> / {item.unit}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Progress Bar */}
                                            <div className="space-y-3 p-4 rounded-2xl bg-[#0C241E] border border-[#143B30]">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-[#A8B9AE] uppercase tracking-wider flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 text-[#00B884]" /> Procurement Status:
                                                    </span>
                                                    <span
                                                        className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] uppercase ${
                                                            isRejected
                                                                ? 'bg-rose-950/50 text-rose-300 border-rose-800/40'
                                                                : isCompleted
                                                                ? 'bg-[#00B884]/20 text-[#00B884] border-[#00B884]/40'
                                                                : 'bg-teal-950/50 text-teal-300 border-teal-800/40'
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>

                                                {isRejected ? (
                                                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                                        <span>This listing was not approved for procurement.{item.admin_notes && ` Admin note: ${item.admin_notes}`}</span>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-6 gap-1 pt-2">
                                                        {WORKFLOW_STEPS.map((step, idx) => {
                                                            const isPassed = idx <= currentStepIdx;
                                                            const isCurrent = idx === currentStepIdx;
                                                            return (
                                                                <div key={idx} className="space-y-1 text-center">
                                                                    <div
                                                                        className={`h-2 rounded-full transition-all ${
                                                                            isPassed
                                                                                ? 'bg-gradient-to-r from-[#00B884] to-teal-400'
                                                                                : 'bg-[#143B30]'
                                                                        } ${isCurrent ? 'ring-2 ring-[#00B884] ring-offset-1 ring-offset-[#0C241E]' : ''}`}
                                                                    />
                                                                    <span
                                                                        className={`text-[9px] font-bold block leading-tight ${
                                                                            isCurrent
                                                                                ? 'text-[#00B884] font-extrabold'
                                                                                : isPassed
                                                                                ? 'text-[#A8B9AE]'
                                                                                : 'text-[#738A7C]/60'
                                                                        }`}
                                                                    >
                                                                        {step}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {item.admin_notes && !isRejected && (
                                                    <div className="mt-2 p-3 rounded-xl bg-[#102D25] border border-[#00B884]/30 text-xs text-[#A8B9AE] flex items-start gap-2">
                                                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#00B884]" />
                                                        <span><strong className="text-[#F3EBDD]">Procurement Note:</strong> {item.admin_notes}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Specs & Advisory */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-[#0C241E] border border-[#143B30] space-y-2 text-xs">
                                                    <span className="font-extrabold text-[#738A7C] uppercase tracking-wider block">Quality & Storage Specs</span>
                                                    <div className="grid grid-cols-2 gap-2 text-[#F3EBDD]">
                                                        <div><span className="text-[#A8B9AE]">Grade:</span> <strong>{item.quality_grade}</strong></div>
                                                        <div><span className="text-[#A8B9AE]">Moisture:</span> <strong>{item.moisture_pct ? `${item.moisture_pct}%` : 'Standard'}</strong></div>
                                                        <div><span className="text-[#A8B9AE]">Storage:</span> <strong>{item.storage_condition}</strong></div>
                                                        <div><span className="text-[#A8B9AE]">Listed:</span> <strong>{new Date(item.created_at).toLocaleDateString('en-IN')}</strong></div>
                                                    </div>
                                                </div>

                                                {item.advisory && (
                                                    <div className="p-4 rounded-2xl bg-[#0C241E] border border-[#00B884]/30 space-y-2 text-xs">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-black text-[#00B884] uppercase tracking-wider flex items-center gap-1">
                                                                <Sparkles className="w-3.5 h-3.5 text-[#00B884]" /> Post-Harvest Advisory
                                                            </span>
                                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                                                item.advisory.spoilage_risk === 'LOW' 
                                                                    ? 'bg-[#00B884]/20 text-[#00B884] border-[#00B884]/40'
                                                                    : item.advisory.spoilage_risk === 'HIGH'
                                                                    ? 'bg-rose-950/50 text-rose-300 border-rose-800/40'
                                                                    : 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                                                            }`}>
                                                                {item.advisory.spoilage_risk} RISK
                                                            </span>
                                                        </div>
                                                        <p className="text-[#A8B9AE]"><strong className="text-[#F3EBDD]">Storage:</strong> {item.advisory.storage_advice}</p>
                                                        <p className="text-[#A8B9AE]"><strong className="text-[#F3EBDD]">Handling:</strong> {item.advisory.handling_advice}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* FORM STEP 1 — FILL DETAILS */}
                {showSubmit && formStep === 'form' && (
                    <div className="bg-[#102D25] border border-[#143B30] rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 shadow-xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[#143B30]">
                            <div>
                                <h3 className="text-xl font-black text-[#F3EBDD]">List Your Harvest Produce</h3>
                                <p className="text-xs text-[#A8B9AE] mt-1">Enter your harvest details to request direct procurement inspection.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[#00B884]/15 border border-[#00B884]/30 text-[#00B884] text-xs font-bold">
                                Step 1 / 3
                            </span>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-bold flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleReview} className="space-y-5">
                            {/* Crop & Variety */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={LabelClass}>Crop Name *</label>
                                    <input
                                        type="text"
                                        value={cropName}
                                        onChange={(e) => {
                                            setCropName(e.target.value);
                                            setFormErrors((p) => ({ ...p, cropName: '' }));
                                        }}
                                        placeholder="e.g. Rice, Wheat, Cotton, Tomato"
                                        className={InputClass}
                                    />
                                    {formErrors.cropName && <p className={ErrorClass}>{formErrors.cropName}</p>}
                                </div>
                                <div>
                                    <label className={LabelClass}>
                                        Variety / Type <span className="text-[#738A7C] normal-case font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={variety}
                                        onChange={(e) => setVariety(e.target.value)}
                                        placeholder="e.g. Sona Masoori, BPT 5204"
                                        className={InputClass}
                                    />
                                </div>
                            </div>

                            {/* Quantity & Unit */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className={LabelClass}>Quantity *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={quantity}
                                        onChange={(e) => {
                                            setQuantity(e.target.value);
                                            setFormErrors((p) => ({ ...p, quantity: '' }));
                                        }}
                                        placeholder="Enter quantity"
                                        className={InputClass}
                                    />
                                    {formErrors.quantity && <p className={ErrorClass}>{formErrors.quantity}</p>}
                                </div>
                                <div>
                                    <label className={LabelClass}>Unit *</label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className={SelectClass}
                                    >
                                        <option value="Kg">Kg</option>
                                        <option value="Quintals">Quintals (100 kg)</option>
                                        <option value="Tons">Tons (1000 kg)</option>
                                        <option value="Bags">Bags (50 kg)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Harvest Date, Grade, Moisture */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={LabelClass}>Harvest Date</label>
                                    <input
                                        type="date"
                                        value={harvestDate}
                                        onChange={(e) => setHarvestDate(e.target.value)}
                                        className={InputClass}
                                    />
                                </div>
                                <div>
                                    <label className={LabelClass}>Quality Grade</label>
                                    <select
                                        value={qualityGrade}
                                        onChange={(e) => setQualityGrade(e.target.value)}
                                        className={SelectClass}
                                    >
                                        <option value="Grade A (Premium)">Grade A — Premium</option>
                                        <option value="Grade B (Standard)">Grade B — Standard</option>
                                        <option value="Grade C (Commercial)">Grade C — Commercial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={LabelClass}>
                                        Moisture % <span className="text-[#738A7C] normal-case font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={moisturePct}
                                        onChange={(e) => setMoisturePct(e.target.value)}
                                        placeholder="e.g. 13.5"
                                        className={InputClass}
                                    />
                                </div>
                            </div>

                            {/* Storage & Price */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={LabelClass}>Storage Condition</label>
                                    <select
                                        value={storageCondition}
                                        onChange={(e) => setStorageCondition(e.target.value)}
                                        className={SelectClass}
                                    >
                                        <option value="Covered Warehouse">Covered Warehouse</option>
                                        <option value="Silo / Airtight Storage">Silo / Airtight Storage</option>
                                        <option value="Cold Storage">Cold Storage</option>
                                        <option value="Open Storage Shed">Open Storage Shed</option>
                                        <option value="Farm / Field Storage">Farm / Field Storage</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={LabelClass}>Expected Price (₹ / {unit}) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={expectedPrice}
                                        onChange={(e) => {
                                            setExpectedPrice(e.target.value);
                                            setFormErrors((p) => ({ ...p, expectedPrice: '' }));
                                        }}
                                        placeholder="Enter expected price per unit"
                                        className={InputClass}
                                    />
                                    {formErrors.expectedPrice && <p className={ErrorClass}>{formErrors.expectedPrice}</p>}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className={LabelClass}>Farm / Storage Location *</label>
                                <UnifiedLocationSelector
                                    value={location}
                                    onChange={(val) => {
                                        setLocation(val);
                                        setFormErrors((p) => ({ ...p, location: '' }));
                                    }}
                                    placeholder="Search city, district, or use GPS..."
                                    inputId="produce-location-input"
                                />
                                {formErrors.location && <p className={ErrorClass}>{formErrors.location}</p>}
                            </div>

                            {/* Photo */}
                            <div>
                                <label className={LabelClass}>
                                    Produce Photo <span className="text-[#738A7C] normal-case font-normal">(optional, max 3 MB)</span>
                                </label>
                                <div
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-[#0C241E] border border-[#143B30] border-dashed hover:border-[#00B884] transition cursor-pointer"
                                    onClick={() => photoInputRef.current?.click()}
                                >
                                    {photoPreview ? (
                                        <div className="relative shrink-0">
                                            <img src={photoPreview} alt="Produce preview" className="w-16 h-16 object-cover rounded-xl border border-[#143B30]" />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 p-0.5 rounded-full bg-rose-600 text-white cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPhotoFile(null);
                                                    setPhotoPreview('');
                                                }}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-[#102D25] border border-[#143B30] flex items-center justify-center text-[#738A7C] shrink-0">
                                            <FileImage className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-[#F3EBDD] font-semibold flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-[#00B884]" />
                                            {photoFile ? photoFile.name : 'Upload a photo of your produce'}
                                        </p>
                                        <p className="text-xs text-[#738A7C] mt-0.5">Click to select — JPG, PNG, WebP</p>
                                    </div>
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoSelect}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className={LabelClass}>
                                    Additional Details <span className="text-[#738A7C] normal-case font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Add details about cultivation, readiness for loading, transport, etc."
                                    className={`${InputClass} resize-none`}
                                />
                            </div>

                            {/* Next */}
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00B884] to-[#00956B] hover:from-[#00c990] hover:to-[#00a879] font-black text-[#071C17] text-sm shadow-lg shadow-[#00B884]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Eye className="w-4 h-4" />
                                <span>Review Listing Before Submitting</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 2 — REVIEW LISTING PREVIEW */}
                {showSubmit && formStep === 'review' && (
                    <div className="bg-[#102D25] border border-[#143B30] rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 shadow-xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[#143B30]">
                            <div>
                                <h3 className="text-xl font-black text-[#F3EBDD] flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-[#00B884]" /> Review Your Produce Listing
                                </h3>
                                <p className="text-xs text-[#A8B9AE] mt-1">
                                    Verify entered details before submitting to the procurement workflow.
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[#00B884]/15 border border-[#00B884]/30 text-[#00B884] text-xs font-bold">
                                Step 2 / 3
                            </span>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-bold flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">{error}</p>
                                    <p className="text-rose-300 mt-1 font-normal">Check your connection and try again.</p>
                                </div>
                            </div>
                        )}

                        {/* Preview Card */}
                        <div className="p-6 rounded-2xl bg-[#0C241E] border border-[#143B30] space-y-4">
                            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#143B30]">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-[#102D25] border border-[#143B30] text-2xl">🌾</div>
                                    <div>
                                        <h4 className="text-2xl font-black text-[#F3EBDD]">
                                            {cropName}
                                            {variety && <span className="text-base text-[#A8B9AE] font-semibold ml-2">({variety})</span>}
                                        </h4>
                                        <p className="text-[#00B884] font-bold text-sm">{quantity} {unit}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-[#738A7C] font-bold uppercase">Expected Price</p>
                                    <p className="text-2xl font-black text-[#00B884]">
                                        ₹{parseFloat(expectedPrice).toLocaleString()}
                                        <span className="text-xs text-[#A8B9AE] font-normal"> /{unit}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-[#102D25] border border-[#143B30]">
                                    <p className="text-[#738A7C] font-bold uppercase mb-1">Grade</p>
                                    <p className="text-[#F3EBDD] font-bold">{qualityGrade}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#102D25] border border-[#143B30]">
                                    <p className="text-[#738A7C] font-bold uppercase mb-1">Storage</p>
                                    <p className="text-[#F3EBDD] font-bold">{storageCondition}</p>
                                </div>
                                {moisturePct && (
                                    <div className="p-3 rounded-xl bg-[#102D25] border border-[#143B30]">
                                        <p className="text-[#738A7C] font-bold uppercase mb-1">Moisture</p>
                                        <p className="text-[#F3EBDD] font-bold">{moisturePct}%</p>
                                    </div>
                                )}
                                {harvestDate && (
                                    <div className="p-3 rounded-xl bg-[#102D25] border border-[#143B30]">
                                        <p className="text-[#738A7C] font-bold uppercase mb-1">Harvest Date</p>
                                        <p className="text-[#F3EBDD] font-bold">{harvestDate}</p>
                                    </div>
                                )}
                                <div className="p-3 rounded-xl bg-[#102D25] border border-[#143B30] col-span-2 sm:col-span-1">
                                    <p className="text-[#738A7C] font-bold uppercase mb-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-[#00B884]" /> Location
                                    </p>
                                    <p className="text-[#F3EBDD] font-bold truncate">{location}</p>
                                </div>
                            </div>

                            {notes && (
                                <div className="p-3 rounded-xl bg-[#102D25] border border-[#143B30] text-xs">
                                    <p className="text-[#738A7C] font-bold uppercase mb-1 flex items-center gap-1">
                                        <Info className="w-3 h-3 text-[#00B884]" /> Notes
                                    </p>
                                    <p className="text-[#A8B9AE]">{notes}</p>
                                </div>
                            )}

                            {photoPreview && (
                                <img src={photoPreview} alt="Produce" className="w-full max-h-40 object-cover rounded-xl border border-[#143B30]" />
                            )}
                        </div>

                        <div className="p-3 rounded-xl bg-[#0C241E] border border-[#00B884]/30 text-xs text-[#A8B9AE] flex items-start gap-2">
                            <Info className="w-4 h-4 text-[#00B884] shrink-0 mt-0.5" />
                            <span>Upon submission, your listing will be registered with the district procurement portal and assigned an official Listing ID.</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setError('');
                                    setFormStep('form');
                                }}
                                className="flex-1 py-3 rounded-xl bg-[#0C241E] hover:bg-[#143B30] font-bold text-[#A8B9AE] hover:text-[#F3EBDD] text-sm transition flex items-center justify-center gap-2 border border-[#143B30] cursor-pointer"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Details
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00B884] to-[#00956B] hover:from-[#00c990] hover:to-[#00a879] font-black text-[#071C17] text-sm shadow-lg shadow-[#00B884]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                Submit Listing
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3 — SUBMITTING ANIMATION */}
                {showSubmit && formStep === 'submitting' && (
                    <div className="bg-[#102D25] border border-[#143B30] rounded-3xl p-12 max-w-3xl mx-auto text-center space-y-6 shadow-xl">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-4 border-[#00B884]/20 animate-ping" />
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#0C241E] border border-[#00B884]/40">
                                <Loader2 className="w-8 h-8 text-[#00B884] animate-spin" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#F3EBDD]">Submitting Your Produce Listing...</h3>
                            <p className="text-xs text-[#A8B9AE] mt-2">
                                Registering harvest batch, generating AI post-harvest advisory, and assigning listing ID.
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 4 — SUCCESS CONFIRMATION */}
                {showSubmit && formStep === 'success' && (
                    <div className="bg-[#102D25] border border-[#143B30] rounded-3xl p-8 max-w-3xl mx-auto space-y-6 shadow-xl">
                        <div className="text-center space-y-3">
                            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#0C241E] border-2 border-[#00B884] mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-[#00B884]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#F3EBDD]">Produce Listed Successfully</h3>
                                <p className="text-xs text-[#A8B9AE] mt-1">Your harvest produce listing has been confirmed by the backend server.</p>
                            </div>
                        </div>

                        {successData && (
                            <div className="p-6 rounded-2xl bg-[#0C241E] border border-[#143B30] space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#143B30]">
                                    <div>
                                        <p className="text-lg font-black text-[#F3EBDD]">{successData.crop_name}</p>
                                        <p className="text-[#00B884] font-bold text-sm">{successData.quantity} {successData.unit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-[#738A7C] font-bold uppercase">Listing ID</p>
                                        <p className="text-xl font-black text-[#00B884]">#{successData.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p className="text-[#738A7C] font-bold uppercase">Expected Price</p>
                                        <p className="text-[#F3EBDD] font-bold">₹{successData.expected_price.toLocaleString()} / {successData.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#738A7C] font-bold uppercase">Status</p>
                                        <span className="px-2.5 py-0.5 rounded-full bg-[#00B884]/20 text-[#00B884] border border-[#00B884]/40 text-[11px] font-black">
                                            Submitted
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[#738A7C] font-bold uppercase flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-[#00B884]" /> Location
                                        </p>
                                        <p className="text-[#F3EBDD] font-bold">{successData.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#738A7C] font-bold uppercase flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-[#00B884]" /> Submitted
                                        </p>
                                        <p className="text-[#F3EBDD] font-bold">{successData.submitted_at}</p>
                                    </div>
                                </div>

                                {successData.advisory && (
                                    <div className="p-4 rounded-xl bg-[#102D25] border border-[#00B884]/30 space-y-2 text-xs">
                                        <p className="font-black text-[#00B884] uppercase tracking-wider flex items-center gap-1">
                                            <Sparkles className="w-3.5 h-3.5 text-[#00B884]" /> AI Post-Harvest Advisory
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#A8B9AE] font-bold">Spoilage Risk:</span>
                                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${
                                                successData.advisory.spoilage_risk === 'LOW'
                                                    ? 'bg-[#00B884]/20 text-[#00B884] border-[#00B884]/40'
                                                    : successData.advisory.spoilage_risk === 'HIGH'
                                                    ? 'bg-rose-950/50 text-rose-300 border-rose-800/40'
                                                    : 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                                            }`}>
                                                {successData.advisory.spoilage_risk}
                                            </span>
                                        </div>
                                        <p className="text-[#A8B9AE]"><strong className="text-[#F3EBDD]">Storage:</strong> {successData.advisory.storage_advice}</p>
                                        <p className="text-[#A8B9AE]"><strong className="text-[#F3EBDD]">Handling:</strong> {successData.advisory.handling_advice}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowSubmit(false);
                                }}
                                className="flex-1 py-3 rounded-xl bg-[#0C241E] hover:bg-[#143B30] font-bold text-[#A8B9AE] hover:text-[#F3EBDD] text-sm transition flex items-center justify-center gap-2 border border-[#143B30] cursor-pointer"
                            >
                                <PackageCheck className="w-4 h-4" />
                                View My Listings
                            </button>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowSubmit(true);
                                }}
                                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00B884] to-[#00956B] hover:from-[#00c990] hover:to-[#00a879] font-black text-[#071C17] text-sm shadow-lg shadow-[#00B884]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Submit Another Batch
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
