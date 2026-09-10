import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react';

import {
    Sparkles,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Send,
    X,
    Bot,
    User,
    Sprout,
} from 'lucide-react';

import type { Language } from '../types/agriculture';
import { askAgriNivaraApi } from '../services/api';
import type { ChatContext, ChatHistoryItem } from '../services/api';
import { useFarm } from '../context/FarmContext';

interface Message {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    lang: Language;
    timestamp: string;
    isError?: boolean;
}

// farmerContext prop kept for backward compat but farm data comes from FarmContext
interface AskAgriNivaraFloatingProps {
    farmerContext?: {
        location?: string;
        crop?: string;
        weatherCondition?: string;
        temperature?: number;
        disease?: string;
    };
}

export const AskAgriNivaraFloating: React.FC<
    AskAgriNivaraFloatingProps
> = ({ farmerContext }) => {
    // Pull live farm data from global context
    const { farmProfile, weather, irrigationDecision } = useFarm();

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [selectedLang, setSelectedLang] =
        useState<Language>('en');

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    // Multi-turn conversation history sent to the API
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const recognitionRef = useRef<any>(null);

    // ---------------------------------------------------------
    // TIME
    // ---------------------------------------------------------

    const getTimeString = (): string => {
        return new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ---------------------------------------------------------
    // BUILD RICH FARM CONTEXT FOR AI
    // ---------------------------------------------------------

    const buildChatContext = useCallback((): ChatContext => {
        const locationStr = typeof farmProfile.location === 'string'
            ? farmProfile.location
            : farmProfile.location ?? '';

        return {
            location: locationStr,
            crop: farmProfile.primary_crop ?? '',
            crop_stage: farmProfile.crop_stage ?? '',
            soil: {
                N: farmProfile.N,
                P: farmProfile.P,
                K: farmProfile.K,
                ph: farmProfile.ph,
                moisture: farmProfile.moisture_pct,
                soil_type: farmProfile.soil_type ?? '',
            },
            weather: weather
                ? {
                      temperature: weather.temperature,
                      humidity: weather.humidity,
                      rainfall: weather.rainfall,
                      condition: weather.condition ?? '',
                      risk: weather.risk ?? '',
                  }
                : undefined,
            irrigation: irrigationDecision
                ? {
                      status_code: irrigationDecision.status_code,
                      status_label: irrigationDecision.status_label,
                      reason: irrigationDecision.reason,
                      action_tip: irrigationDecision.action_tip,
                  }
                : undefined,
        };
    }, [farmProfile, weather, irrigationDecision]);

    // ---------------------------------------------------------
    // SPEECH LANGUAGE CODES
    // ---------------------------------------------------------

    const speechLanguageCodes: Record<
        Language,
        string
    > = {
        en: 'en-IN',
        te: 'te-IN',
        hi: 'hi-IN',
    };

    // ---------------------------------------------------------
    // WELCOME MESSAGES
    // ---------------------------------------------------------

    const welcomeMessages: Record<
        Language,
        string
    > = {
        en:
            'Namaste! I am AgriNivara AI. Ask me anything about your crops, soil NPK, weather risks, diseases, irrigation, fertilizers, crop health, or produce selling.',

        te:
            'నమస్కారం! నేను అగ్రినివార AI. మీ పంటలు, నేల NPK, వాతావరణం, తెగుళ్లు, నీటిపారుదల, ఎరువులు, పంట ఆరోగ్యం లేదా పంటల అమ్మకం గురించి ఏ ప్రశ్న అయినా అడగండి.',

        hi:
            'नमस्ते! मैं एग्रीनिवार AI हूँ। अपनी फसल, मिट्टी NPK, मौसम, बीमारी, सिंचाई, खाद, फसल स्वास्थ्य या उपज बिक्री के बारे में कोई भी सवाल पूछें।',
    };

    const quickPrompts: Record<Language, Array<{ label: string; query: string }>> = {
        en: [
            { label: '🌱 What to grow?', query: 'What crop should I grow based on my soil and weather?' },
            { label: '💧 Irrigation advice', query: 'Do I need to irrigate my crop today?' },
            { label: '🍂 Yellow leaves', query: 'Why are my crop leaves turning yellow?' },
            { label: '🧪 Fertilizer NPK', query: 'What NPK fertilizer dosage do I need?' },
        ],
        te: [
            { label: '🌱 ఏ పంట వేయాలి?', query: 'నా నేల మరియు వాతావరణానికి ఏ పంట అనుకూలం?' },
            { label: '💧 నీటిపారుదల సలహా', query: 'ఈరోజు పంటకు నీరు పెట్టాలా?' },
            { label: '🍂 పసుపు ఆకులు', query: 'పంట ఆకులు పసుపు రంగులోకి మారితే ఏం చేయాలి?' },
            { label: '🧪 ఎరువుల NPK', query: 'పంటకు ఎరువుల మోతాదు ఎంత వేయాలి?' },
        ],
        hi: [
            { label: '🌱 कौन सी फसल लगाएं?', query: 'मेरी मिट्टी और मौसम के लिए कौन सी फसल उपयुक्त है?' },
            { label: '💧 सिंचाई सलाह', query: 'क्या आज मेरी फसल को सिंचाई की आवश्यकता है?' },
            { label: '🍂 पीली पत्तियां', query: 'फसल की पत्तियां पीली क्यों हो रही हैं?' },
            { label: '🧪 खाद NPK सलाह', query: 'फसल के लिए NPK खाद की मात्रा कितनी होनी चाहिए?' },
        ],
    };

    // ---------------------------------------------------------
    // INITIAL WELCOME
    // ---------------------------------------------------------

    useEffect(() => {
        setMessages((prev) => {
            if (prev.length === 0 || (prev.length === 1 && prev[0].id === 'welcome')) {
                return [
                    {
                        id: 'welcome',
                        sender: 'assistant',
                        text: welcomeMessages[selectedLang],
                        lang: selectedLang,
                        timestamp: getTimeString(),
                    },
                ];
            }
            return prev;
        });
    }, [selectedLang]);

    // ---------------------------------------------------------
    // AUTO SCROLL
    // ---------------------------------------------------------

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [messages, isThinking]);

    // ---------------------------------------------------------
    // VOICE INPUT
    // ---------------------------------------------------------

    const toggleListening = (): void => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                'Voice input is not supported by this browser. Please use Google Chrome or type your question.'
            );
            return;
        }

        try {
            const recognition =
                new SpeechRecognition();

            recognitionRef.current = recognition;

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.lang =
                speechLanguageCodes[selectedLang];

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (
                event: any
            ) => {
                const transcript =
                    event?.results?.[0]?.[0]?.transcript?.trim();

                setIsListening(false);

                if (!transcript) {
                    return;
                }

                setInput(transcript);

                // Send voice question through
                // exactly the same AI pipeline.
                void handleSend(transcript);
            };

            recognition.onerror = (
                event: any
            ) => {
                console.error(
                    'Speech recognition error:',
                    event?.error
                );

                setIsListening(false);
                if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
                    alert('Microphone access was denied. Please allow microphone permissions in your browser settings to ask questions using voice.');
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } catch (error) {
            console.error(
                'Unable to start speech recognition:',
                error
            );

            setIsListening(false);
        }
    };

    // ---------------------------------------------------------
    // TEXT TO SPEECH
    // ---------------------------------------------------------

    const speakText = (
        text: string,
        lang: Language
    ): void => {
        if (
            typeof window === 'undefined' ||
            !('speechSynthesis' in window)
        ) {
            return;
        }

        // Stop current speech.
        window.speechSynthesis.cancel();

        // If already speaking, this click simply stops it.
        if (isSpeaking) {
            setIsSpeaking(false);
            return;
        }

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang =
            speechLanguageCodes[lang];

        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
        };

        setIsSpeaking(true);

        window.speechSynthesis.speak(
            utterance
        );
    };

    // ---------------------------------------------------------
    // AGRICULTURAL FALLBACK
    // ---------------------------------------------------------

    const generateAnswer = (
        userQuery: string,
        lang: Language
    ): string => {
        const query =
            userQuery.toLowerCase();

        const location =
            farmerContext?.location ||
            'your farm location';

        const crop =
            farmerContext?.crop ||
            'your crop';

        const temperature =
            farmerContext?.temperature !==
                undefined
                ? `${farmerContext.temperature}°C`
                : 'the current temperature';

        // -----------------------------------------------------
        // IRRIGATION
        // -----------------------------------------------------

        if (
            query.includes('irrigat') ||
            query.includes('water') ||
            query.includes('నీరు') ||
            query.includes('నీటిపారుదల') ||
            query.includes('सिंचाई') ||
            query.includes('पानी')
        ) {
            if (lang === 'te') {
                return `${location} ప్రాంతంలో ${temperature} ఉష్ణోగ్రత ఉంది. నేల తేమను పరిశీలించి అవసరమైనప్పుడు మాత్రమే నీటిపారుదల చేయండి. వర్షం వచ్చే అవకాశం ఉంటే అదనపు నీటిని నివారించండి.`;
            }

            if (lang === 'hi') {
                return `${location} में ${temperature} तापमान है। मिट्टी की नमी जांचकर आवश्यकता के अनुसार ही सिंचाई करें। यदि बारिश की संभावना है तो अतिरिक्त सिंचाई से बचें।`;
            }

            return `For ${crop} at ${location}, check soil moisture before irrigation. Avoid unnecessary watering when rainfall is expected. Drip irrigation can help reduce water loss and deliver water closer to the root zone.`;
        }

        // -----------------------------------------------------
        // DISEASE / PESTS
        // -----------------------------------------------------

        if (
            query.includes('disease') ||
            query.includes('pest') ||
            query.includes('blight') ||
            query.includes('yellow') ||
            query.includes('fungus') ||
            query.includes('insect') ||
            query.includes('తెగులు') ||
            query.includes('పురుగు') ||
            query.includes('పసుపు') ||
            query.includes('बीमारी') ||
            query.includes('कीड़ा') ||
            query.includes('पीला')
        ) {
            if (lang === 'te') {
                return `${crop} పంటలో ఆకులు పసుపు రంగులోకి మారడం లేదా మచ్చలు కనిపిస్తే ముందుగా ఆకులను పరిశీలించండి. ఫంగల్ వ్యాధులు, పురుగు దాడి లేదా పోషక లోపం కారణం కావచ్చు. ఖచ్చితమైన నిర్ధారణ కోసం Plant Diagnostics లో ఆకు ఫోటోను అప్లోడ్ చేయండి.`;
            }

            if (lang === 'hi') {
                return `${crop} में पत्तियां पीली पड़ रही हैं या धब्बे दिखाई दे रहे हैं तो पहले पत्तियों की जांच करें। इसका कारण फंगल रोग, कीट या पोषक तत्वों की कमी हो सकता है। सटीक जांच के लिए Plant Diagnostics में पत्ती की फोटो अपलोड करें।`;
            }

            return `If your ${crop} has yellowing leaves, spots, or pest damage, inspect the leaves carefully. Possible causes include fungal disease, insects, or nutrient deficiency. Upload a leaf image in Plant Diagnostics for a more precise diagnosis.`;
        }

        // -----------------------------------------------------
        // FERTILIZER / NPK / SOIL
        // -----------------------------------------------------

        if (
            query.includes('fertilizer') ||
            query.includes('npk') ||
            query.includes('nitrogen') ||
            query.includes('phosphorus') ||
            query.includes('potassium') ||
            query.includes('soil') ||
            query.includes('ఎరువు') ||
            query.includes('ఎరువులు') ||
            query.includes('నేల') ||
            query.includes('సారం') ||
            query.includes('खाद') ||
            query.includes('मिट्टी')
        ) {
            if (lang === 'te') {
                return `${crop} పంటకు N, P, K పోషకాలు సమతుల్యంగా అవసరం. నేల పరీక్ష ఫలితాలను ఆధారంగా చేసుకుని ఎరువుల మోతాదును నిర్ణయించడం ఉత్తమం.`;
            }

            if (lang === 'hi') {
                return `${crop} के लिए नाइट्रोजन, फॉस्फोरस और पोटैशियम संतुलित मात्रा में आवश्यक हैं। खाद की मात्रा तय करने के लिए मिट्टी की जांच के परिणामों का उपयोग करना सबसे अच्छा है।`;
            }

            return `For ${crop}, nitrogen, phosphorus and potassium should be supplied according to crop stage and soil-test results. Avoid applying excessive fertilizer without checking the soil nutrient status.`;
        }

        // -----------------------------------------------------
        // PRODUCE SELLING
        // -----------------------------------------------------

        if (
            query.includes('sell') ||
            query.includes('price') ||
            query.includes('mandi') ||
            query.includes('market') ||
            query.includes('produce') ||
            query.includes('crop selling') ||
            query.includes('ధర') ||
            query.includes('అమ్మ') ||
            query.includes('మార్కెట్') ||
            query.includes('बेचना') ||
            query.includes('दाम') ||
            query.includes('बाजार')
        ) {
            if (lang === 'te') {
                return `మీ పంటను AgriNivara లోని Produce Market విభాగంలో జాబితా చేయవచ్చు. పంట పరిమాణం, నాణ్యత, తేమ, ప్రదేశం మరియు పంట ఫోటోను నమోదు చేయండి. అడ్మిన్ కొనుగోలు లేదా సైట్ విజిట్ కోసం మీ అభ్యర్థనను పరిశీలించవచ్చు.`;
            }

            if (lang === 'hi') {
                return `आप अपनी उपज को AgriNivara के Produce Market में सूचीबद्ध कर सकते हैं। फसल की मात्रा, गुणवत्ता, नमी, स्थान और फसल की फोटो दर्ज करें। एडमिन खरीद या साइट विजिट के लिए आपके अनुरोध की समीक्षा कर सकता है।`;
            }

            return `You can list your harvested produce in the AgriNivara Produce Market. Add the crop quantity, quality, moisture, location and crop image. The admin can review the request and take the appropriate procurement or site-visit action.`;
        }

        // -----------------------------------------------------
        // WEATHER
        // -----------------------------------------------------

        if (
            query.includes('weather') ||
            query.includes('rain') ||
            query.includes('temperature') ||
            query.includes('humidity') ||
            query.includes('వాతావరణ') ||
            query.includes('వర్షం') ||
            query.includes('తేమ') ||
            query.includes('मौसम') ||
            query.includes('बारिश') ||
            query.includes('नमी')
        ) {
            if (lang === 'te') {
                return `${location} కోసం ప్రస్తుత వాతావరణ పరిస్థితులను Weather Intelligence విభాగంలో చూడండి. వర్షపాతం, ఉష్ణోగ్రత మరియు తేమ ఆధారంగా వ్యవసాయ నిర్ణయాలు తీసుకోండి.`;
            }

            if (lang === 'hi') {
                return `${location} के लिए वर्तमान मौसम की जानकारी Weather Intelligence सेक्शन में देखें। बारिश, तापमान और नमी के आधार पर खेती से जुड़े निर्णय लें।`;
            }

            return `You can check the latest weather information for ${location} in the Weather Intelligence section. Use rainfall, temperature and humidity information when planning irrigation, spraying and other farm activities.`;
        }

        // -----------------------------------------------------
        // CROP
        // -----------------------------------------------------

        if (
            query.includes('crop') ||
            query.includes('plant') ||
            query.includes('grow') ||
            query.includes('పంట') ||
            query.includes('మొక్క') ||
            query.includes('फसल') ||
            query.includes('पौधा')
        ) {
            if (lang === 'te') {
                return `${location} లో ${crop} పంటకు సంబంధించిన వ్యవసాయ నిర్ణయాలలో నేల పరిస్థితి, వాతావరణం, నీటి లభ్యత మరియు పంట ఆరోగ్యాన్ని పరిగణనలోకి తీసుకోండి.`;
            }

            if (lang === 'hi') {
                return `${location} में ${crop} की खेती के लिए मिट्टी की स्थिति, मौसम, पानी की उपलब्धता और फसल स्वास्थ्य को ध्यान में रखें।`;
            }

            return `For ${crop} cultivation in ${location}, consider soil condition, weather, water availability, crop health and the current crop growth stage before making farm decisions.`;
        }

        // -----------------------------------------------------
        // DEFAULT
        // -----------------------------------------------------

        if (lang === 'te') {
            return `నేను ${crop} పంట నిర్వహణ, నేల, నీటిపారుదల, ఎరువులు, వాతావరణం, తెగుళ్లు, పంట ఆరోగ్యం మరియు పంటల అమ్మకం గురించి సహాయం చేయగలను. మీ వ్యవసాయ ప్రశ్నను వివరంగా అడగండి.`;
        }

        if (lang === 'hi') {
            return `मैं ${crop} की खेती, मिट्टी, सिंचाई, खाद, मौसम, बीमारी, फसल स्वास्थ्य और उपज बिक्री से जुड़े सवालों में सहायता कर सकता हूँ। अपना कृषि प्रश्न विस्तार से पूछें।`;
        }

        return `I can help with ${crop} cultivation, irrigation, soil and NPK, fertilizers, weather risks, pests and diseases, crop health, and produce selling. Please ask your agricultural question in detail.`;
    };

    // ---------------------------------------------------------
    // SEND MESSAGE
    // ---------------------------------------------------------

    const handleSend = async (
        textToSend?: string
    ): Promise<void> => {
        const text = (
            textToSend ?? input
        ).trim();

        if (!text || isThinking) {
            return;
        }

        const currentLanguage =
            selectedLang;

        const userMessage: Message = {
            id: `${Date.now()}-user`,
            sender: 'user',
            text,
            lang: currentLanguage,
            timestamp: getTimeString(),
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setInput('');
        setIsThinking(true);

        try {
            console.log(
                '[Ask AgriNivara] Sending:',
                text
            );

            const response =
                await askAgriNivaraApi(
                    text,
                    currentLanguage,
                    buildChatContext(),
                    // Send last 10 turns (5 exchanges) for memory
                    chatHistory.slice(-10)
                );

            console.log(
                '[Ask AgriNivara] Response:',
                response
            );

            const botAnswer =
                response?.answer?.trim();

            if (!botAnswer) {
                throw new Error(
                    'AI backend returned an empty response.'
                );
            }

            const assistantMessage: Message = {
                id: `${Date.now()}-assistant`,
                sender: 'assistant',
                text: botAnswer,
                lang: currentLanguage,
                timestamp: getTimeString(),
            };

            setMessages((previous) => [
                ...previous,
                assistantMessage,
            ]);

            // Append to history (keep last 20 turns)
            setChatHistory((prev) => {
                const nextHistory: ChatHistoryItem[] = [
                    ...prev,
                    { role: 'user', text },
                    { role: 'assistant', text: botAnswer },
                ];
                return nextHistory.slice(-20);
            });

            speakText(
                botAnswer,
                currentLanguage
            );
        } catch (error) {
            console.error(
                '[Ask AgriNivara] Backend failed:',
                error
            );

            // Local fallback.
            const fallbackAnswer =
                generateAnswer(
                    text,
                    currentLanguage
                );

            const fallbackMessage: Message = {
                id: `${Date.now()}-fallback`,
                sender: 'assistant',
                text: fallbackAnswer,
                lang: currentLanguage,
                timestamp: getTimeString(),
            };

            setMessages((previous) => [
                ...previous,
                fallbackMessage,
            ]);

            speakText(
                fallbackAnswer,
                currentLanguage
            );
        } finally {
            setIsThinking(false);
        }
    };

    // ---------------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------------

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();

            if (
                typeof window !== 'undefined' &&
                'speechSynthesis' in window
            ) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // ---------------------------------------------------------
    // UI
    // ---------------------------------------------------------

    return (
        <div className="fixed bottom-5 right-5 z-50">

            {/* FLOATING BUTTON */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() =>
                        setIsOpen(true)
                    }
                    className="
                        flex items-center gap-2.5
                        px-4 py-3
                        rounded-full
                        bg-gradient-to-r
                        from-emerald-500
                        via-teal-500
                        to-emerald-600
                        text-slate-950
                        font-black
                        text-xs
                        uppercase
                        tracking-wider
                        shadow-2xl
                        shadow-emerald-500/40
                        hover:scale-105
                        active:scale-95
                        transition-all
                        border
                        border-emerald-300/40
                        cursor-pointer
                        group
                        animate-bounce
                    "
                >
                    <div
                        className="
                            p-1
                            rounded-full
                            bg-slate-950/20
                            text-slate-950
                            group-hover:rotate-12
                            transition-transform
                        "
                    >
                        <Sprout className="w-4 h-4" />
                    </div>

                    <span>
                        🌱 Ask AgriNivara
                    </span>
                </button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <div
                    className="
                        w-[92vw]
                        sm:w-[420px]
                        h-[580px]
                        bg-slate-950/95
                        backdrop-blur-2xl
                        border
                        border-emerald-500/30
                        rounded-3xl
                        shadow-2xl
                        shadow-slate-950
                        flex
                        flex-col
                        overflow-hidden
                        animate-in
                        fade-in
                        slide-in-from-bottom-5
                        duration-300
                    "
                >

                    {/* HEADER */}
                    <div
                        className="
                            px-5
                            py-4
                            bg-gradient-to-r
                            from-emerald-950/90
                            via-slate-900
                            to-slate-950
                            border-b
                            border-emerald-500/20
                            flex
                            items-center
                            justify-between
                        "
                    >
                        <div className="flex items-center gap-2.5">

                            <div
                                className="
                                    w-9
                                    h-9
                                    rounded-2xl
                                    bg-emerald-500/20
                                    border
                                    border-emerald-400/40
                                    flex
                                    items-center
                                    justify-center
                                    text-emerald-400
                                "
                            >
                                <Bot className="w-5 h-5" />
                            </div>

                            <div>
                                <h4
                                    className="
                                        text-sm
                                        font-black
                                        text-white
                                        flex
                                        items-center
                                        gap-1.5
                                    "
                                >
                                    Ask AgriNivara AI

                                    <span
                                        className="
                                            w-2
                                            h-2
                                            rounded-full
                                            bg-emerald-400
                                            animate-pulse
                                        "
                                    />
                                </h4>

                                <p
                                    className="
                                        text-[10px]
                                        text-emerald-400
                                        font-bold
                                    "
                                >
                                    Multilingual Agricultural Assistant
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">

                            {/* LANGUAGE */}
                            <select
                                value={selectedLang}
                                onChange={(event) =>
                                    setSelectedLang(
                                        event.target.value as Language
                                    )
                                }
                                className="
                                    bg-slate-900
                                    border
                                    border-emerald-500/30
                                    text-emerald-300
                                    text-xs
                                    font-bold
                                    rounded-lg
                                    px-2
                                    py-1
                                    outline-none
                                "
                            >
                                <option value="en">
                                    English
                                </option>

                                <option value="te">
                                    తెలుగు
                                </option>

                                <option value="hi">
                                    हिन्दी
                                </option>
                            </select>

                            {/* CLOSE */}
                            <button
                                type="button"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                className="
                                    p-1.5
                                    text-slate-400
                                    hover:text-white
                                    rounded-lg
                                    hover:bg-slate-800
                                    transition
                                "
                                aria-label="Close Ask AgriNivara"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* MESSAGES */}
                    <div
                        className="
                            flex-1
                            p-4
                            overflow-y-auto
                            space-y-3.5
                            bg-slate-950/60
                        "
                    >
                        {messages.map(
                            (message) => (
                                <div
                                    key={message.id}
                                    className={`
                                        flex
                                        items-start
                                        gap-2.5
                                        ${message.sender ===
                                            'user'
                                            ? 'flex-row-reverse'
                                            : ''
                                        }
                                    `}
                                >

                                    {/* AVATAR */}
                                    <div
                                        className={`
                                            w-7
                                            h-7
                                            rounded-xl
                                            flex
                                            items-center
                                            justify-center
                                            text-xs
                                            shrink-0
                                            ${message.sender ===
                                                'user'
                                                ? 'bg-slate-800 text-slate-200'
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            }
                                        `}
                                    >
                                        {message.sender ===
                                            'user' ? (
                                            <User className="w-4 h-4" />
                                        ) : (
                                            <Bot className="w-4 h-4" />
                                        )}
                                    </div>

                                    {/* MESSAGE */}
                                    <div
                                        className={`
                                            max-w-[80%]
                                            p-3.5
                                            rounded-2xl
                                            text-xs
                                            space-y-1.5
                                            shadow-md
                                            ${message.sender ===
                                                'user'
                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                                            }
                                        `}
                                    >
                                        <p
                                            className="
                                                leading-relaxed
                                                font-medium
                                                whitespace-pre-wrap
                                            "
                                        >
                                            {message.text}
                                        </p>

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                text-[9px]
                                                text-slate-400/80
                                                pt-1
                                            "
                                        >
                                            <span>
                                                {message.timestamp}
                                            </span>

                                            {message.sender ===
                                                'assistant' && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            speakText(
                                                                message.text,
                                                                message.lang
                                                            )
                                                        }
                                                        className="
                                                        hover:text-emerald-300
                                                        transition
                                                    "
                                                        title={
                                                            isSpeaking
                                                                ? 'Stop speaking'
                                                                : 'Read aloud'
                                                        }
                                                    >
                                                        {isSpeaking ? (
                                                            <VolumeX
                                                                className="
                                                                w-3
                                                                h-3
                                                                text-emerald-400
                                                            "
                                                            />
                                                        ) : (
                                                            <Volume2
                                                                className="
                                                                w-3
                                                                h-3
                                                                text-emerald-400
                                                            "
                                                            />
                                                        )}
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {/* THINKING */}
                        {isThinking && (
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    text-emerald-400
                                    p-3
                                    rounded-2xl
                                    bg-slate-900/80
                                    border
                                    border-slate-800
                                    w-max
                                    animate-pulse
                                "
                            >
                                <Sparkles
                                    className="
                                        w-4
                                        h-4
                                        animate-spin
                                    "
                                />

                                <span>
                                    AgriNivara is analyzing your question...
                                </span>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* INPUT FOOTER */}
                    <div
                        className="
                            p-3
                            bg-slate-950
                            border-t
                            border-slate-800/80
                            space-y-2
                        "
                    >
                        {/* QUICK ACTION CHIPS */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                            {quickPrompts[selectedLang]?.map((qp, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSend(qp.query)}
                                    disabled={isThinking}
                                    className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer disabled:opacity-50"
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">

                            {/* INPUT */}
                            <input
                                type="text"
                                value={input}
                                onChange={(event) =>
                                    setInput(
                                        event.target.value
                                    )
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                        'Enter'
                                    ) {
                                        event.preventDefault();

                                        void handleSend();
                                    }
                                }}
                                placeholder={
                                    selectedLang ===
                                        'te'
                                        ? 'మీ వ్యవసాయ ప్రశ్నను అడగండి...'
                                        : selectedLang ===
                                            'hi'
                                            ? 'अपना कृषि सवाल यहाँ पूछें...'
                                            : 'Ask about your farm, crops, irrigation...'
                                }
                                className="
                                    flex-1
                                    bg-slate-900
                                    border
                                    border-slate-800
                                    focus:border-emerald-500
                                    rounded-xl
                                    px-3.5
                                    py-2.5
                                    text-xs
                                    text-white
                                    placeholder-slate-500
                                    outline-none
                                "
                                disabled={
                                    isThinking
                                }
                            />

                            {/* MICROPHONE */}
                            <button
                                type="button"
                                onClick={
                                    toggleListening
                                }
                                disabled={
                                    isThinking
                                }
                                className={`
                                    p-2.5
                                    rounded-xl
                                    border
                                    text-xs
                                    font-bold
                                    transition
                                    ${isListening
                                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                                        : 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800'
                                    }
                                `}
                                title={
                                    isListening
                                        ? 'Stop listening'
                                        : 'Ask using voice'
                                }
                            >
                                {isListening ? (
                                    <MicOff className="w-4 h-4" />
                                ) : (
                                    <Mic className="w-4 h-4" />
                                )}
                            </button>

                            {/* SEND */}
                            <button
                                type="button"
                                onClick={() =>
                                    void handleSend()
                                }
                                disabled={
                                    !input.trim() ||
                                    isThinking
                                }
                                className="
                                    p-2.5
                                    rounded-xl
                                    bg-emerald-500
                                    hover:bg-emerald-400
                                    text-slate-950
                                    font-bold
                                    transition
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                "
                                title="Send question"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                        {/* VOICE STATUS */}
                        {isListening && (
                            <div
                                className="
                                    mt-2
                                    text-center
                                    text-[10px]
                                    text-rose-400
                                    font-semibold
                                    animate-pulse
                                "
                            >
                                🎙️ Listening... Speak your agricultural question
                            </div>
                        )}

                        {isSpeaking && (
                            <div
                                className="
                                    mt-2
                                    text-center
                                    text-[10px]
                                    text-emerald-400
                                    font-semibold
                                "
                            >
                                🔊 AgriNivara is speaking...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AskAgriNivaraFloating;