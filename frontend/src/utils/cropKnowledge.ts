import type {
    ExplainabilityItem,
    FarmInputs,
    RiskItem,
    SuitabilityScores,
    ActionPlan,
    AlternativeAnalysis,
    SoilIntelligence
} from '../types/agriculture';

export interface CropRequirement {
    N: [number, number, number]; // min, max, optimal
    P: [number, number, number];
    K: [number, number, number];
    temperature: [number, number, number];
    humidity: [number, number, number];
    ph: [number, number, number];
    rainfall: [number, number, number];
}

export const CROP_REQUIREMENTS_DATABASE: Record<string, CropRequirement> = {
    rice: {
        N: [60, 120, 90], P: [35, 60, 48], K: [35, 50, 42],
        temperature: [20.0, 30.0, 24.0], humidity: [70.0, 90.0, 82.0],
        ph: [5.5, 7.2, 6.4], rainfall: [150.0, 300.0, 220.0]
    },
    maize: {
        N: [60, 100, 80], P: [35, 60, 48], K: [15, 30, 20],
        temperature: [18.0, 29.0, 23.0], humidity: [55.0, 75.0, 65.0],
        ph: [5.5, 7.5, 6.3], rainfall: [60.0, 120.0, 90.0]
    },
    chickpea: {
        N: [20, 60, 40], P: [55, 80, 68], K: [70, 90, 80],
        temperature: [17.0, 22.0, 19.0], humidity: [14.0, 20.0, 17.0],
        ph: [6.0, 8.5, 7.2], rainfall: [65.0, 95.0, 80.0]
    },
    kidneybeans: {
        N: [15, 40, 20], P: [55, 80, 67], K: [15, 25, 20],
        temperature: [15.0, 24.0, 20.0], humidity: [18.0, 25.0, 21.0],
        ph: [5.5, 6.0, 5.7], rainfall: [95.0, 150.0, 110.0]
    },
    pigeonpeas: {
        N: [15, 40, 20], P: [55, 80, 68], K: [18, 30, 20],
        temperature: [27.0, 38.0, 31.0], humidity: [45.0, 68.0, 55.0],
        ph: [5.0, 7.5, 6.2], rainfall: [90.0, 200.0, 150.0]
    },
    mothbeans: {
        N: [15, 40, 22], P: [35, 60, 48], K: [15, 25, 20],
        temperature: [24.0, 32.0, 28.0], humidity: [40.0, 65.0, 53.0],
        ph: [3.5, 10.0, 7.0], rainfall: [30.0, 75.0, 50.0]
    },
    mungbean: {
        N: [15, 40, 20], P: [35, 60, 48], K: [15, 25, 20],
        temperature: [27.0, 30.0, 28.5], humidity: [80.0, 90.0, 85.0],
        ph: [6.2, 7.2, 6.7], rainfall: [35.0, 60.0, 50.0]
    },
    blackgram: {
        N: [35, 60, 40], P: [55, 80, 67], K: [15, 25, 19],
        temperature: [25.0, 35.0, 30.0], humidity: [60.0, 75.0, 65.0],
        ph: [6.5, 7.8, 7.1], rainfall: [60.0, 75.0, 68.0]
    },
    lentil: {
        N: [15, 40, 20], P: [55, 80, 68], K: [15, 25, 20],
        temperature: [18.0, 30.0, 24.0], humidity: [60.0, 70.0, 65.0],
        ph: [5.9, 7.8, 6.8], rainfall: [35.0, 55.0, 45.0]
    },
    pomegranate: {
        N: [15, 40, 20], P: [10, 30, 20], K: [35, 45, 40],
        temperature: [18.0, 25.0, 22.0], humidity: [85.0, 95.0, 90.0],
        ph: [5.5, 7.2, 6.4], rainfall: [100.0, 115.0, 107.0]
    },
    banana: {
        N: [80, 120, 100], P: [70, 95, 82], K: [45, 55, 50],
        temperature: [25.0, 31.0, 27.0], humidity: [75.0, 85.0, 80.0],
        ph: [5.5, 6.5, 6.0], rainfall: [90.0, 120.0, 100.0]
    },
    mango: {
        N: [15, 40, 20], P: [15, 40, 27], K: [25, 35, 30],
        temperature: [27.0, 36.0, 31.0], humidity: [45.0, 55.0, 50.0],
        ph: [4.5, 7.0, 5.8], rainfall: [85.0, 100.0, 95.0]
    },
    grapes: {
        N: [15, 40, 23], P: [120, 145, 133], K: [195, 205, 200],
        temperature: [8.0, 42.0, 24.0], humidity: [80.0, 85.0, 82.0],
        ph: [5.5, 6.5, 6.0], rainfall: [65.0, 75.0, 70.0]
    },
    watermelon: {
        N: [80, 120, 99], P: [5, 30, 17], K: [45, 55, 50],
        temperature: [24.0, 27.0, 25.5], humidity: [80.0, 90.0, 85.0],
        ph: [6.0, 6.8, 6.4], rainfall: [40.0, 60.0, 50.0]
    },
    muskmelon: {
        N: [80, 120, 100], P: [5, 30, 17], K: [45, 55, 50],
        temperature: [27.0, 30.0, 28.5], humidity: [90.0, 95.0, 92.0],
        ph: [6.0, 6.8, 6.4], rainfall: [20.0, 30.0, 25.0]
    },
    apple: {
        N: [0, 40, 20], P: [120, 145, 134], K: [195, 205, 200],
        temperature: [21.0, 24.0, 22.5], humidity: [90.0, 95.0, 92.0],
        ph: [5.5, 6.5, 6.0], rainfall: [100.0, 125.0, 112.0]
    },
    orange: {
        N: [0, 40, 20], P: [5, 30, 16], K: [5, 15, 10],
        temperature: [10.0, 35.0, 23.0], humidity: [90.0, 95.0, 92.0],
        ph: [6.0, 8.0, 7.0], rainfall: [100.0, 120.0, 110.0]
    },
    papaya: {
        N: [35, 70, 50], P: [45, 70, 59], K: [45, 55, 50],
        temperature: [23.0, 44.0, 33.0], humidity: [90.0, 95.0, 92.0],
        ph: [6.5, 7.0, 6.7], rainfall: [40.0, 250.0, 140.0]
    },
    coconut: {
        N: [15, 40, 22], P: [5, 30, 17], K: [25, 35, 30],
        temperature: [25.0, 29.0, 27.0], humidity: [90.0, 98.0, 94.0],
        ph: [5.5, 6.5, 6.0], rainfall: [130.0, 225.0, 175.0]
    },
    cotton: {
        N: [100, 140, 118], P: [35, 60, 46], K: [15, 25, 19],
        temperature: [22.0, 26.0, 24.0], humidity: [75.0, 85.0, 80.0],
        ph: [6.0, 8.0, 6.9], rainfall: [60.0, 90.0, 80.0]
    },
    jute: {
        N: [60, 90, 78], P: [35, 60, 47], K: [35, 45, 40],
        temperature: [23.0, 26.0, 25.0], humidity: [70.0, 90.0, 80.0],
        ph: [6.0, 7.5, 6.7], rainfall: [150.0, 200.0, 175.0]
    },
    coffee: {
        N: [80, 120, 101], P: [15, 35, 29], K: [25, 35, 30],
        temperature: [23.0, 28.0, 25.5], humidity: [50.0, 60.0, 55.0],
        ph: [6.0, 7.5, 6.8], rainfall: [115.0, 200.0, 160.0]
    }
};

export function getCropRequirements(cropName: string): CropRequirement {
    const key = cropName.toLowerCase().replace(/[^a-z]/g, '');
    return CROP_REQUIREMENTS_DATABASE[key] || {
        N: [20, 100, 60], P: [20, 80, 45], K: [20, 100, 50],
        temperature: [18.0, 32.0, 25.0], humidity: [40.0, 85.0, 65.0],
        ph: [5.5, 7.5, 6.5], rainfall: [50.0, 200.0, 120.0]
    };
}

export function calcFeatureSuitability(val: number, minV: number, maxV: number, optV: number) {
    if (val >= minV && val <= maxV) {
        const span = Math.max(1.0, maxV - minV);
        const dist = Math.abs(val - optV);
        const score = Math.max(70, Math.min(100, Math.round(100 - (dist / span) * 40)));
        return { score, status: 'good' as const };
    } else if (val < minV) {
        const def = minV - val;
        const score = Math.max(20, Math.round(70 - def * 2));
        return { score, status: (score >= 50 ? 'moderate' : 'warning') as 'moderate' | 'warning' };
    } else {
        const exc = val - maxV;
        const score = Math.max(20, Math.round(70 - exc * 2));
        return { score, status: (score >= 50 ? 'moderate' : 'warning') as 'moderate' | 'warning' };
    }
}

export function generateExplainability(inputs: FarmInputs, cropName: string): ExplainabilityItem[] {
    const reqs = getCropRequirements(cropName);
    const cropCap = cropName.charAt(0).toUpperCase() + cropName.slice(1);

    const items: Array<{ key: string; label: string; val: number; req: [number, number, number]; unit: string }> = [
        { key: 'N', label: 'Nitrogen level', val: inputs.N, req: reqs.N, unit: ' mg/kg' },
        { key: 'P', label: 'Phosphorus level', val: inputs.P, req: reqs.P, unit: ' mg/kg' },
        { key: 'K', label: 'Potassium level', val: inputs.K, req: reqs.K, unit: ' mg/kg' },
        { key: 'temperature', label: 'Temperature', val: inputs.temperature, req: reqs.temperature, unit: '°C' },
        { key: 'humidity', label: 'Humidity', val: inputs.humidity, req: reqs.humidity, unit: '%' },
        { key: 'ph', label: 'Soil pH', val: inputs.ph, req: reqs.ph, unit: '' },
        { key: 'rainfall', label: 'Rainfall', val: inputs.rainfall, req: reqs.rainfall, unit: ' mm' },
    ];

    return items.map(item => {
        const [minV, maxV, optV] = item.req;
        const res = calcFeatureSuitability(item.val, minV, maxV, optV);
        let msg = '';

        if (res.status === 'good') {
            msg = `${item.label} (${item.val}${item.unit}) is within optimal range (${minV}-${maxV}${item.unit}) for ${cropCap}.`;
        } else if (item.val < minV) {
            msg = `${item.label} (${item.val}${item.unit}) is below minimum target (${minV}${item.unit}) for ${cropCap}.`;
        } else {
            msg = `${item.label} (${item.val}${item.unit}) exceeds preferred maximum (${maxV}${item.unit}) for ${cropCap}.`;
        }

        return {
            feature: item.label,
            key: item.key,
            status: res.status,
            score: res.score,
            actual_value: item.val,
            optimal_range: `${minV} - ${maxV}${item.unit}`,
            message: msg
        };
    });
}

export function generateSuitabilityScores(inputs: FarmInputs, cropName: string): SuitabilityScores {
    const reqs = getCropRequirements(cropName);

    const soilScore = (
        calcFeatureSuitability(inputs.ph, ...reqs.ph).score * 0.4 +
        calcFeatureSuitability(inputs.N, ...reqs.N).score * 0.2 +
        calcFeatureSuitability(inputs.P, ...reqs.P).score * 0.2 +
        calcFeatureSuitability(inputs.K, ...reqs.K).score * 0.2
    );

    const weatherScore = (
        calcFeatureSuitability(inputs.temperature, ...reqs.temperature).score * 0.6 +
        calcFeatureSuitability(inputs.humidity, ...reqs.humidity).score * 0.4
    );

    const waterScore = calcFeatureSuitability(inputs.rainfall, ...reqs.rainfall).score;

    const nutrientScore = (
        calcFeatureSuitability(inputs.N, ...reqs.N).score +
        calcFeatureSuitability(inputs.P, ...reqs.P).score +
        calcFeatureSuitability(inputs.K, ...reqs.K).score
    ) / 3.0;

    const overall = Math.round(soilScore * 0.3 + weatherScore * 0.3 + waterScore * 0.25 + nutrientScore * 0.15);

    let status: 'GOOD' | 'MODERATE' | 'NEEDS ATTENTION' = 'GOOD';
    if (overall < 55) status = 'NEEDS ATTENTION';
    else if (overall < 75) status = 'MODERATE';

    return {
        soil: Math.round(soilScore),
        weather: Math.round(weatherScore),
        water: Math.round(waterScore),
        nutrients: Math.round(nutrientScore),
        overall,
        status
    };
}

export function generateRiskAnalysis(inputs: FarmInputs, cropName: string): RiskItem[] {
    const reqs = getCropRequirements(cropName);
    const risks: RiskItem[] = [];

    // Temp Risk
    const [minT, maxT] = reqs.temperature;
    if (inputs.temperature > maxT + 4) {
        risks.push({
            title: 'High Temperature Heat Stress Risk',
            severity: 'HIGH',
            reason: `Temperature (${inputs.temperature}°C) exceeds max threshold (${maxT}°C) for ${cropName}.`,
            mitigation: 'Implement micro-sprinklers or crop shade nets to protect against heat stress.'
        });
    } else if (inputs.temperature > maxT) {
        risks.push({
            title: 'Moderate Heat Stress Risk',
            severity: 'MODERATE',
            reason: `Temperature (${inputs.temperature}°C) is slightly above optimal zone (${maxT}°C).`,
            mitigation: 'Increase irrigation frequency to avoid thermal leaf wilting.'
        });
    } else if (inputs.temperature < minT - 3) {
        risks.push({
            title: 'Cold Growth Retardation Risk',
            severity: 'HIGH',
            reason: `Temperature (${inputs.temperature}°C) is below crop minimum (${minT}°C).`,
            mitigation: 'Apply organic mulch to preserve root zone warmth.'
        });
    } else {
        risks.push({
            title: 'Temperature Thermal Risk',
            severity: 'LOW',
            reason: 'Current temperature is within safe crop tolerance range.',
            mitigation: 'Standard seasonal thermal tracking.'
        });
    }

    // Rainfall / Moisture Risk
    const [minR, maxR] = reqs.rainfall;
    if (inputs.rainfall < minR) {
        const severity = (minR - inputs.rainfall) > 40 ? 'HIGH' : 'MODERATE';
        risks.push({
            title: 'Drought / Water Deficit Stress Risk',
            severity,
            reason: `Current rainfall (${inputs.rainfall}mm) falls short of ${cropName} requirement (${minR}mm).`,
            mitigation: 'Supplemental drip irrigation will be critical during flowering and pod development.'
        });
    } else if (inputs.rainfall > maxR + 40) {
        risks.push({
            title: 'Waterlogging & Root Asphyxiation Risk',
            severity: 'HIGH',
            reason: `Rainfall (${inputs.rainfall}mm) exceeds soil absorption limit (${maxR}mm).`,
            mitigation: 'Clear field drainage gutters to prevent standing water and root rot.'
        });
    } else {
        risks.push({
            title: 'Rainfall Supply Risk',
            severity: 'LOW',
            reason: 'Water supply aligns well with crop evapotranspiration demand.',
            mitigation: 'Maintain standard moisture management.'
        });
    }

    // Soil pH Risk
    const [minPh, maxPh] = reqs.ph;
    if (inputs.ph < minPh) {
        risks.push({
            title: 'Soil Acidity & Metal Toxicity Risk',
            severity: inputs.ph < minPh - 0.8 ? 'HIGH' : 'MODERATE',
            reason: `Soil pH (${inputs.ph}) is acidic relative to target (${minPh}-${maxPh}).`,
            mitigation: 'Apply agricultural lime (calcium carbonate) to increase soil pH.'
        });
    } else if (inputs.ph > maxPh) {
        risks.push({
            title: 'Alkaline Micro-Nutrient Lockout Risk',
            severity: inputs.ph > maxPh + 0.8 ? 'HIGH' : 'MODERATE',
            reason: `Soil pH (${inputs.ph}) is alkaline relative to target (${minPh}-${maxPh}).`,
            mitigation: 'Incorporate agricultural sulfur or organic compost to restore pH balance.'
        });
    } else {
        risks.push({
            title: 'Soil pH Risk',
            severity: 'LOW',
            reason: 'Soil pH is well-balanced for optimal nutrient bioavailability.',
            mitigation: 'Maintain organic humus content.'
        });
    }

    return risks;
}

export function generateActionPlan(inputs: FarmInputs, cropName: string, risks: RiskItem[]): ActionPlan {
    const cropCap = cropName.charAt(0).toUpperCase() + cropName.slice(1);

    const before_planting = [
        `Prepare seedbeds with fine tilth suitable for ${cropCap}.`,
        `Verify nutrient status: Nitrogen ${inputs.N}, Phosphorus ${inputs.P}, Potassium ${inputs.K}, pH ${inputs.ph}.`,
        `Incorporate well-rotted farmyard manure or vermicompost 15 days before sowing.`
    ];

    const during_growth = [
        `Monitor soil moisture weekly; maintain optimal root zone moisture during critical growth stages.`,
        `Split nitrogen fertilizer application into basal and top-dressing phases for higher uptake efficiency.`,
        `Inspect crop leaves bi-weekly for early signs of pest or fungal infection.`
    ];

    const warning = risks
        .filter(r => r.severity === 'HIGH' || r.severity === 'MODERATE')
        .map(r => `${r.title}: ${r.mitigation}`);

    if (warning.length === 0) {
        warning.push('No severe water, temperature, or nutrient warnings active for your farm conditions.');
    }

    const next_action = [
        `Source certified high-quality seed varieties of ${cropCap} tailored for local agro-climatic conditions.`,
        `Adjust sowing depth (3-5cm) based on seed size and current moisture status.`,
        `Consult Open-Meteo 7-day weather forecast prior to scheduling sowing or fertilizer applications.`
    ];

    return {
        before_planting,
        during_growth,
        warning,
        next_action
    };
}

export function getSoilIntelligence(inputs: FarmInputs): SoilIntelligence {
    const N = inputs.N > 80 ? 'HIGH' : (inputs.N < 40 ? 'LOW' : 'MODERATE');
    const P = inputs.P > 60 ? 'HIGH' : (inputs.P < 30 ? 'LOW' : 'MODERATE');
    const K = inputs.K > 60 ? 'HIGH' : (inputs.K < 30 ? 'LOW' : 'MODERATE');
    const ph = inputs.ph < 6.0 ? 'ACIDIC' : (inputs.ph > 7.5 ? 'ALKALINE' : 'SUITABLE');

    return {
        N, P, K, ph,
        disclaimer: 'Decision-support indicator based on standard agronomic ranges; not a replacement for laboratory soil test reports.'
    };
}

export function generateAlternativeAnalysis(
    inputs: FarmInputs,
    topPredictions: Array<{ crop: string; confidence: number }>
): AlternativeAnalysis[] {
    return topPredictions.map(pred => {
        const suit = generateSuitabilityScores(inputs, pred.crop);
        const risks = generateRiskAnalysis(inputs, pred.crop);
        const highCount = risks.filter(r => r.severity === 'HIGH').length;
        const riskRating: 'LOW' | 'MODERATE' | 'HIGH' = highCount >= 2 ? 'HIGH' : (highCount === 1 ? 'MODERATE' : 'LOW');

        return {
            crop: pred.crop,
            confidence: pred.confidence,
            soil_fit: `${suit.soil}%`,
            weather_fit: `${suit.weather}%`,
            water_fit: `${suit.water}%`,
            risk_rating: riskRating
        };
    });
}
