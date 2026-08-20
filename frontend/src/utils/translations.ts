import type { Language } from '../types/agriculture';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
    en: {
        appTitle: "AGRI NIVARA",
        appSubtitle: "AI-POWERED FARM DECISION SUPPORT SYSTEM",
        cropRecommendation: "Crop Recommendation",
        dashboard: "Dashboard",
        diseaseDetection: "Disease Detection",
        yieldPrediction: "Yield Prediction",
        weather: "Weather Intelligence",
        analyzeMyFarm: "ANALYZE MY FARM",
        analyzing: "Analyzing Farm Conditions...",
        
        // Sections
        farmConditions: "Farm Soil & Location Parameters",
        aiRecommendation: "AI Recommended Crop",
        whyThisCrop: "Why This Crop? (Explainable AI)",
        farmSuitability: "Multi-Factor Farm Suitability",
        riskAnalysis: "Agricultural Risk Analysis",
        topAlternatives: "Top Alternative Crops",
        actionPlan: "Smart Farm Action Plan",
        whatIfSimulator: "Interactive What-If Crop Simulator",
        soilIntelligence: "Soil Intelligence & NPK Analysis",
        weatherIntelligence: "Live Weather & 5-Day Forecast",
        decisionSummary: "Farm Executive Decision Summary",
        technicalDetails: "SIH Judge Technical Details",
        futureModules: "Future Innovation Capabilities",
        
        // Labels
        nitrogen: "Nitrogen (N)",
        phosphorus: "Phosphorus (P)",
        potassium: "Potassium (K)",
        temperature: "Temperature (°C)",
        humidity: "Humidity (%)",
        ph: "Soil pH",
        rainfall: "Seasonal Rainfall (mm)",
        location: "Farm Location",
        confidence: "AI Prediction Confidence",
        ranking: "Rank",
        crop: "Crop",
        soilFit: "Soil Fit",
        weatherFit: "Weather Fit",
        waterFit: "Water Fit",
        riskLevel: "Risk Level",

        // Action Plan Tabs
        beforePlanting: "BEFORE PLANTING",
        duringGrowth: "DURING GROWTH",
        warning: "WARNINGS & RISKS",
        nextAction: "RECOMMENDED NEXT ACTION",

        // Statuses
        good: "GOOD",
        moderate: "MODERATE",
        needsAttention: "NEEDS ATTENTION",
        low: "LOW",
        high: "HIGH",
        acidic: "ACIDIC",
        suitable: "SUITABLE",
        alkaline: "ALKALINE",

        // What-If
        currentConditions: "CURRENT FARM CONDITIONS",
        changedConditions: "SIMULATED / CHANGED CONDITIONS",
        simulateChange: "RUN SIMULATION",
        resetSimulator: "RESET TO ORIGINAL INPUTS",

        // Badges / Tags
        aiModelTag: "[AI/ML PREDICTION]",
        ruleBasedTag: "[AGRONOMIC RULE ENGINE]",
        liveDataTag: "[LIVE WEATHER DATA]",
        simulatedTag: "[SIMULATION]",
        futureTag: "[FUTURE / COMING SOON]",

        // Speech
        listenAudio: "Listen to Voice Advisory",
        stopAudio: "Stop Voice Advisory",
        speaking: "Speaking advisory...",

        // Judge Specs
        judgeModalTitle: "SIH Judge Technical Inspection Panel",
        modelArchitecture: "Model Architecture",
        explainabilityMethod: "Explainability Method",
        inferenceTime: "Inference Latency",
        datasetDetails: "Training Dataset Specs",
        apiContracts: "Backend API Contracts",

        // Future Modules
        iotStream: "ESP32 / IoT Sensor Stream",
        diseaseScanner: "Plant Leaf Disease Scanner",
        smartIrrigation: "Evapotranspiration Irrigation Index",
        marketPrices: "Mandi Market Price Intelligence"
    },

    te: {
        appTitle: "అగ్రి నివార",
        appSubtitle: "ఏఐ ఆధారిత వ్యవసాయ నిర్ణయ మద్దతు వ్యవస్థ",
        cropRecommendation: "పంట సిఫార్సు",
        dashboard: "డాష్‌బోర్డ్",
        diseaseDetection: "తెగుళ్ల గుర్తింపు",
        yieldPrediction: "దిగుబడి అంచనా",
        weather: "వాతావరణ పరిజ్ఞానం",
        analyzeMyFarm: "నా పొలాన్ని విశ్లేషించండి",
        analyzing: "పొలం పరిస్థితులను విశ్లేషిస్తోంది...",

        // Sections
        farmConditions: "నేల మరియు ప్రాంత పారామితులు",
        aiRecommendation: "ఏఐ సిఫార్సు చేసిన పంట",
        whyThisCrop: "ఈ పంటే ఎందుకు? (ఎక్స్‌ప్లేనబుల్ ఏఐ)",
        farmSuitability: "పొలం అనుకూలత స్కోర్లు",
        riskAnalysis: "వ్యవసాయ ప్రమాద విశ్లేషణ",
        topAlternatives: "ప్రత్యామ్నాయ పంటలు",
        actionPlan: "స్మార్ట్ ఫార్మ్ యాక్షన్ ప్లాన్",
        whatIfSimulator: "ఇంటరాక్టివ్ వాట్-ఇఫ్ సిమ్యులేటర్",
        soilIntelligence: "నేల పోషకాల విశ్లేషణ (NPK)",
        weatherIntelligence: "వాతావరణ మరియు 5 రోజుల అంచనా",
        decisionSummary: "వ్యవసాయ నిర్ణయ సారాంశం",
        technicalDetails: "SIH జడ్జ్ సాంకేతిక వివరాలు",
        futureModules: "భావి ఆవిష్కరణ మాడ్యూల్స్",

        // Labels
        nitrogen: "నత్రజని (N)",
        phosphorus: "భాస్వరం (P)",
        potassium: "పొటాషియం (K)",
        temperature: "ఉష్ణోగ్రత (°C)",
        humidity: "తేమ (%)",
        ph: "నేల pH",
        rainfall: "వర్షపాతం (mm)",
        location: "పొలం ప్రాంతం",
        confidence: "ఏఐ అంచనా విశ్వసనీయత",
        ranking: "ర్యాంక్",
        crop: "పంట",
        soilFit: "నేల అనుకూలత",
        weatherFit: "వాతావరణ అనుకూలత",
        waterFit: "నీటి అనుకూలత",
        riskLevel: "ప్రమాద స్థాయి",

        // Action Plan Tabs
        beforePlanting: "నాటు వేసే ముందు",
        duringGrowth: "పంట పెరుగుదల సమయంలో",
        warning: "హెచ్చరికలు మరియు ప్రమాదాలు",
        nextAction: "తదుపరి చేయాల్సిన పని",

        // Statuses
        good: "బాగుంది",
        moderate: "మధ్యస్థం",
        needsAttention: "శ్రద్ధ అవసరం",
        low: "తక్కువ",
        high: "ఎక్కువ",
        acidic: "ఆమ్ల గుణం",
        suitable: "అనుకూలం",
        alkaline: "క్షార గుణం",

        // What-If
        currentConditions: "ప్రస్తుత పొలం పరిస్థితులు",
        changedConditions: "మార్చిన పరిస్థితులు (సిమ్యులేషన్)",
        simulateChange: "సిమ్యులేషన్ చేయండి",
        resetSimulator: "యథాస్థితికి తీసుకురండి",

        // Badges / Tags
        aiModelTag: "[ఏఐ/ఎంఎల్ అంచనా]",
        ruleBasedTag: "[వ్యవసాయ సూత్రాలు]",
        liveDataTag: "[లైవ్ వాతావరణ సమాచారం]",
        simulatedTag: "[సిమ్యులేషన్]",
        futureTag: "[భవిష్యత్తు మాడ్యూల్]",

        // Speech
        listenAudio: "వాయిస్ సలహా వినండి",
        stopAudio: "వాయిస్ ఆపండి",
        speaking: "వాయిస్ చెబుతోంది...",

        // Judge Specs
        judgeModalTitle: "SIH జడ్జ్ సాంకేతిక తనిఖీ ప్యానెల్",
        modelArchitecture: "మోడల్ నిర్మాణం",
        explainabilityMethod: "వివరణాత్మక విధానం",
        inferenceTime: "పనిచేసే సమయం (ల్యాటెన్సీ)",
        datasetDetails: "డేటాసెట్ వివరాలు",
        apiContracts: "బ్యాకెండ్ API ఒప్పందాలు",

        // Future Modules
        iotStream: "ESP32 / IoT సెన్సార్ స్ట్రీమ్",
        diseaseScanner: "ఆకుల తెగుళ్ల స్కేనర్",
        smartIrrigation: "స్మార్ట్ సాగునీటి సూచీ",
        marketPrices: "మార్కెట్ ధరల పరిజ్ఞానం"
    },

    hi: {
        appTitle: "कृषि निवारा",
        appSubtitle: "एआई-संचालित स्मार्ट कृषि निर्णय सहायता प्रणाली",
        cropRecommendation: "फसल सिफारिश",
        dashboard: "डैशबोर्ड",
        diseaseDetection: "रोग पहचान",
        yieldPrediction: "उपज अनुमान",
        weather: "मौसम की जानकारी",
        analyzeMyFarm: "मेरे खेत का विश्लेषण करें",
        analyzing: "खेत की स्थितियों का विश्लेषण किया जा रहा है...",

        // Sections
        farmConditions: "मिट्टी एवं स्थान पैरामीटर",
        aiRecommendation: "एआई अनुशंसित फसल",
        whyThisCrop: "यही फसल क्यों? (व्याख्यात्मक एआई)",
        farmSuitability: "खेत की उपयुक्तता स्कोर",
        riskAnalysis: "कृषि जोखिम विश्लेषण",
        topAlternatives: "शीर्ष वैकल्पिक फसलें",
        actionPlan: "स्मार्ट फार्म कार्य योजना",
        whatIfSimulator: "इंटरएक्टिव वॉट-इफ सिमुलेटर",
        soilIntelligence: "मिट्टी पोषण विश्लेषण (NPK)",
        weatherIntelligence: "मौसम एवं 5-दिवसीय पूर्वानुमान",
        decisionSummary: "कृषि निर्णय सारांश",
        technicalDetails: "SIH जज तकनीकी विवरण",
        futureModules: "भावी नवाचार मॉड्यूल",

        // Labels
        nitrogen: "नाइट्रोजन (N)",
        phosphorus: "फास्फोरस (P)",
        potassium: "पोटेशियम (K)",
        temperature: "तापमान (°C)",
        humidity: "आर्द्रता (%)",
        ph: "मिट्टी pH",
        rainfall: "वर्षा (mm)",
        location: "खेत का स्थान",
        confidence: "एआई भविष्यवाणी विश्वसनीयता",
        ranking: "रैंक",
        crop: "फसल",
        soilFit: "मिट्टी उपयुक्तता",
        weatherFit: "मौसम उपयुक्तता",
        waterFit: "जल उपयुक्तता",
        riskLevel: "जोखिम स्तर",

        // Action Plan Tabs
        beforePlanting: "बुआई से पहले",
        duringGrowth: "फसल वृद्धि के दौरान",
        warning: "चेतावनी एवं जोखिम",
        nextAction: "अनुशंसित अगला कदम",

        // Statuses
        good: "उत्तम",
        moderate: "मध्यम",
        needsAttention: "ध्यान देने योग्य",
        low: "कम",
        high: "अधिक",
        acidic: "अम्लीय",
        suitable: "उपयुक्त",
        alkaline: "क्षारीय",

        // What-If
        currentConditions: "वर्तमान खेत की स्थिति",
        changedConditions: "सिमुलेटेड / परिवर्तित स्थिति",
        simulateChange: "सिमुलेशन चलाएं",
        resetSimulator: "मूल स्थिति पर रीसेट करें",

        // Badges / Tags
        aiModelTag: "[एआई/एमएल अनुमान]",
        ruleBasedTag: "[कृषि नियम इंजन]",
        liveDataTag: "[लाइव मौसम डेटा]",
        simulatedTag: "[सिमुलेशन]",
        futureTag: "[भावी क्षमता]",

        // Speech
        listenAudio: "आवाज में सलाह सुनें",
        stopAudio: "आवाज बंद करें",
        speaking: "सलाह बोली जा रही है...",

        // Judge Specs
        judgeModalTitle: "SIH जज तकनीकी निरीक्षण पैनल",
        modelArchitecture: "मॉडल आर्किटेक्चर",
        explainabilityMethod: "व्याख्यात्मक विधि",
        inferenceTime: "अनुमान समय (विलंबता)",
        datasetDetails: "डेटासेट का विवरण",
        apiContracts: "बैकएंड एपीआई अनुबंध",

        // Future Modules
        iotStream: "ESP32 / IoT सेंसर स्ट्रीम",
        diseaseScanner: "पौधों की पत्तियों के रोग का स्कैनर",
        smartIrrigation: "स्मार्ट सिंचाई सूचकांक",
        marketPrices: "मंडी बाजार मूल्य जानकारी"
    }
};

export function t(key: string, lang: Language = 'en'): string {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
}
