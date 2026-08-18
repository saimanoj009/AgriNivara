import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Leaf,
    Menu,
    ShieldCheck,
    Sprout,
    TrendingUp,
    X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Landing() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-slate-900">

            {/* NAVBAR */}
            <header className="border-b border-slate-100 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

                    {/* LOGO */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
                            <Leaf size={22} strokeWidth={2} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                AGRINIVARA
                            </h1>

                            <p className="text-[10px] font-medium tracking-[0.18em] text-slate-400">
                                SMART AGRICULTURE
                            </p>
                        </div>
                    </div>

                    {/* DESKTOP NAVIGATION */}
                    <nav className="hidden items-center gap-8 md:flex">
                        <a
                            href="#solutions"
                            className="text-sm font-medium text-slate-600 transition hover:text-green-700"
                        >
                            Solutions
                        </a>

                        <a
                            href="#how-it-works"
                            className="text-sm font-medium text-slate-600 transition hover:text-green-700"
                        >
                            How It Works
                        </a>

                        <a
                            href="#impact"
                            className="text-sm font-medium text-slate-600 transition hover:text-green-700"
                        >
                            Impact
                        </a>

                        <a
                            href="#about"
                            className="text-sm font-medium text-slate-600 transition hover:text-green-700"
                        >
                            About
                        </a>
                    </nav>

                    {/* DESKTOP BUTTONS */}
                    <div className="hidden items-center gap-3 md:flex">

                        {/* LOGIN */}
                        <Link
                            to="/login"
                            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Login
                        </Link>

                        {/* GET STARTED */}
                        <Link
                            to="/signup"
                            className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-lg p-2 text-slate-700 md:hidden"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {menuOpen && (
                    <div className="border-t border-slate-100 px-6 py-5 md:hidden">
                        <div className="flex flex-col gap-4">

                            <a
                                href="#solutions"
                                className="text-sm font-medium"
                            >
                                Solutions
                            </a>

                            <a
                                href="#how-it-works"
                                className="text-sm font-medium"
                            >
                                How It Works
                            </a>

                            <a
                                href="#impact"
                                className="text-sm font-medium"
                            >
                                Impact
                            </a>

                            <a
                                href="#about"
                                className="text-sm font-medium"
                            >
                                About
                            </a>

                            {/* MOBILE LOGIN */}
                            <Link
                                to="/login"
                                className="rounded-lg border border-slate-200 py-3 text-center text-sm font-semibold"
                            >
                                Login
                            </Link>

                            {/* MOBILE SIGNUP */}
                            <Link
                                to="/signup"
                                className="rounded-lg bg-green-700 py-3 text-center text-sm font-semibold text-white"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* HERO */}
            <main>

                <section className="relative overflow-hidden">

                    <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-green-50 blur-3xl" />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

                        {/* HERO TEXT */}
                        <div>

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-600" />

                                <span className="text-xs font-semibold tracking-wide text-green-800">
                                    INTELLIGENT AGRICULTURE PLATFORM
                                </span>
                            </div>

                            <h2 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                                Better decisions.
                                <span className="block text-green-700">
                                    Better farming.
                                </span>
                            </h2>

                            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                                AgriNivara brings crop intelligence, disease detection,
                                yield insights, weather information, and agricultural risk
                                analysis together in one simple platform.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                                {/* HERO GET STARTED */}
                                <Link
                                    to="/signup"
                                    className="group inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-700/10 transition hover:bg-green-800"
                                >
                                    Get Started

                                    <ArrowRight
                                        size={18}
                                        className="transition group-hover:translate-x-1"
                                    />
                                </Link>

                                <a
                                    href="#solutions"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Explore Solutions

                                    <ChevronRight size={17} />
                                </a>
                            </div>

                            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">

                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2
                                        size={17}
                                        className="text-green-600"
                                    />
                                    Farmer-focused
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2
                                        size={17}
                                        className="text-green-600"
                                    />
                                    Data-driven
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2
                                        size={17}
                                        className="text-green-600"
                                    />
                                    Easy to use
                                </div>
                            </div>
                        </div>

                        {/* HERO DASHBOARD PREVIEW */}
                        <div className="relative">

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60">

                                <div className="flex items-center justify-between border-b border-slate-100 pb-5">

                                    <div>
                                        <p className="text-xs font-medium text-slate-400">
                                            FARM INTELLIGENCE
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                                            Today's Overview
                                        </h3>
                                    </div>

                                    <div className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                                        Healthy
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-5">

                                    {/* CROP SUITABILITY */}
                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <div className="flex items-center justify-between">

                                            <p className="text-xs font-medium text-slate-500">
                                                Crop Suitability
                                            </p>

                                            <Sprout
                                                size={18}
                                                className="text-green-600"
                                            />
                                        </div>

                                        <p className="mt-3 text-3xl font-bold text-slate-900">
                                            94%
                                        </p>

                                        <p className="mt-1 text-xs text-green-700">
                                            Highly suitable
                                        </p>
                                    </div>

                                    {/* DISEASE RISK */}
                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <div className="flex items-center justify-between">

                                            <p className="text-xs font-medium text-slate-500">
                                                Disease Risk
                                            </p>

                                            <ShieldCheck
                                                size={18}
                                                className="text-green-600"
                                            />
                                        </div>

                                        <p className="mt-3 text-3xl font-bold text-slate-900">
                                            Low
                                        </p>

                                        <p className="mt-1 text-xs text-green-700">
                                            No major alerts
                                        </p>
                                    </div>

                                    {/* RECOMMENDED CROP */}
                                    <div className="col-span-2 rounded-xl border border-green-100 bg-green-50/60 p-4">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <p className="text-xs font-medium text-green-800">
                                                    RECOMMENDED CROP
                                                </p>

                                                <p className="mt-1 text-xl font-bold text-slate-900">
                                                    Groundnut
                                                </p>

                                            </div>

                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">

                                                <Leaf
                                                    size={21}
                                                    className="text-green-700"
                                                />

                                            </div>
                                        </div>

                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">

                                            <div className="h-full w-[91%] rounded-full bg-green-600" />

                                        </div>

                                        <div className="mt-2 flex justify-between text-xs">

                                            <span className="text-slate-500">
                                                Suitability score
                                            </span>

                                            <span className="font-bold text-green-700">
                                                91%
                                            </span>

                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-4">

                                    <div className="flex items-center gap-2">

                                        <TrendingUp
                                            size={17}
                                            className="text-green-600"
                                        />

                                        <span className="text-xs text-slate-500">
                                            Yield outlook
                                        </span>

                                    </div>

                                    <span className="text-sm font-bold text-slate-900">
                                        Positive
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SOLUTIONS */}
                <section
                    id="solutions"
                    className="border-t border-slate-100 bg-slate-50/60"
                >
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

                        <div className="max-w-2xl">

                            <p className="text-sm font-bold tracking-widest text-green-700">
                                ONE PLATFORM
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                Everything farmers need to make better decisions.
                            </h2>

                            <p className="mt-4 leading-7 text-slate-600">
                                AgriNivara combines multiple agricultural intelligence
                                capabilities into one easy-to-use platform.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            {[
                                {
                                    icon: Sprout,
                                    title: "Crop Intelligence",
                                    text: "Identify suitable crops using agricultural and environmental data.",
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Disease Detection",
                                    text: "Analyze crop images and identify potential diseases early.",
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Yield Insights",
                                    text: "Understand expected yield and factors affecting productivity.",
                                },
                                {
                                    icon: Leaf,
                                    title: "Farm Risk",
                                    text: "Understand weather, crop, and disease-related agricultural risks.",
                                },
                            ].map((item) => {

                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-slate-200/50"
                                    >

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                                            <Icon size={22} />
                                        </div>

                                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                                            {item.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {item.text}
                                        </p>

                                        <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-green-700">
                                            Explore
                                            <ArrowRight size={15} />
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section
                    id="how-it-works"
                    className="bg-white"
                >
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

                        <div className="text-center">

                            <p className="text-sm font-bold tracking-widest text-green-700">
                                HOW IT WORKS
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                From farm data to actionable insights.
                            </h2>
                        </div>

                        <div className="mt-14 grid gap-8 md:grid-cols-3">

                            {[
                                {
                                    number: "01",
                                    title: "Tell us about your farm",
                                    text: "Provide location, soil, crop, and other relevant farm information.",
                                },
                                {
                                    number: "02",
                                    title: "AgriNivara analyzes",
                                    text: "Our intelligence engine processes agricultural and environmental data.",
                                },
                                {
                                    number: "03",
                                    title: "Get clear recommendations",
                                    text: "Receive understandable insights that support smarter farming decisions.",
                                },
                            ].map((item) => (

                                <div
                                    key={item.number}
                                    className="relative"
                                >

                                    <div className="text-5xl font-bold text-green-100">
                                        {item.number}
                                    </div>

                                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 leading-7 text-slate-500">
                                        {item.text}
                                    </p>

                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section
                    id="about"
                    className="border-t border-slate-100 bg-slate-950"
                >
                    <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">

                        <p className="text-sm font-bold tracking-widest text-green-400">
                            AGRICULTURE, REIMAGINED
                        </p>

                        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Helping farmers make decisions with greater confidence.
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
                            AgriNivara is designed to turn complex agricultural data into
                            simple, practical insights for farmers.
                        </p>

                        <Link
                            to="/signup"
                            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-500"
                        >
                            Get Started
                            <ArrowRight size={18} />
                        </Link>

                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-slate-950">

                <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-slate-800 px-6 py-6 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">

                    <p>
                        © 2026 AgriNivara. Built for smarter agriculture.
                    </p>

                    <p>
                        Intelligent Agriculture • Better Decisions
                    </p>

                </div>
            </footer>
        </div>
    );
}

export default Landing;