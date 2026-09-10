"""
AgriNivara - Plant Disease Prediction Module
Provides plant disease class mappings, disease guidance recommendations,
and helper inference routines for the deep learning CNN model.
"""

from typing import List, Dict, Any, Tuple
import numpy as np

PLANT_DISEASE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

DISEASE_DETAILS: Dict[str, Dict[str, str]] = {
    "Apple___Apple_scab": {
        "title": "Apple Scab",
        "crop": "Apple",
        "meaning": "Fungal infection caused by Venturia inaequalis leading to olive-green or black velvety spots on leaves and fruit.",
        "possible_causes": "Frequent spring rains, extended leaf wetness, and cool humid weather (15–24°C).",
        "treatment": "Apply captan, mancozeb, or copper-based fungicide spray at green-tip stage. Prune infected shoots.",
        "prevention": "Rake and compost fallen leaves in autumn, prune tree canopy to allow sunlight penetration and rapid foliage drying."
    },
    "Apple___Black_rot": {
        "title": "Apple Black Rot (Frogeye Leaf Spot)",
        "crop": "Apple",
        "meaning": "Fungal disease caused by Botryosphaeria obtusa producing brown circular spots with purple margins on leaves and dark fruit rot.",
        "possible_causes": "Overwintering fungi in dead twigs, mummified fruits, and bark cankers.",
        "treatment": "Prune out dead wood and cankers 6–8 inches below affected zone. Apply captan or thiophanate-methyl during petal fall.",
        "prevention": "Sanitize tools, remove mummified fruit from trees and orchard floor, maintain balanced tree vigor."
    },
    "Apple___Cedar_apple_rust": {
        "title": "Cedar Apple Rust",
        "crop": "Apple",
        "meaning": "Gymnosporangium fungal rust requiring both apple trees and nearby junipers/cedars to complete its life cycle.",
        "possible_causes": "Proximity to eastern red cedar or juniper trees during warm, rainy spring mornings.",
        "treatment": "Apply myclobutanil or propiconazole fungicide when galls swell on nearby cedars in early spring.",
        "prevention": "Plant rust-resistant apple cultivars; prune nearby cedar or juniper galls if feasible."
    },
    "Apple___healthy": {
        "title": "Apple Foliage Healthy",
        "crop": "Apple",
        "meaning": "Leaves display vibrant chlorophyll pigmentation and healthy cell structure.",
        "possible_causes": "Optimal nutrition, clean canopy management, and absence of active fungal pathogens.",
        "treatment": "No chemical treatment needed.",
        "prevention": "Maintain balanced NPK fertilization, adequate watering, and seasonal pest monitoring."
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "title": "Corn Gray Leaf Spot",
        "crop": "Corn (Maize)",
        "meaning": "Cercospora zeae-maydis fungal disease causing rectangular tan-to-gray lesions restricted by leaf veins.",
        "possible_causes": "Prolonged high relative humidity (>90%) and warm temperatures (25–30°C) with zero-till residue.",
        "treatment": "Apply strobilurin or triazole fungicides (azoxystrobin, pyraclostrobin) if lesions appear before tassel emergence.",
        "prevention": "Rotate with non-host crops (soybean/pulses); incorporate residue deep into soil to minimize spore overwintering."
    },
    "Corn_(maize)___Common_rust_": {
        "title": "Corn Common Rust",
        "crop": "Corn (Maize)",
        "meaning": "Puccinia sorghi fungal rust producing brick-red to dark brown powdery pustules scattered on upper leaf surfaces.",
        "possible_causes": "Cool, moist weather (16–23°C) and windblown spores arriving from southern regions.",
        "treatment": "Fungicide treatment is only required if infection is severe before silking. Use pyraclostrobin or tebuconazole.",
        "prevention": "Plant resistant hybrid seed varieties; plant early in the season to avoid late-season rust spore showers."
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "title": "Corn Northern Leaf Blight",
        "crop": "Corn (Maize)",
        "meaning": "Exserohilum turcicum causing long, elliptical, grayish-green cigar-shaped lesions across leaves.",
        "possible_causes": "Moderate temperatures (18–27°C), heavy dews, and frequent rain during mid-vegetative stages.",
        "treatment": "Apply foliar fungicides at tassel emergence if lesions are present on or near the ear leaf.",
        "prevention": "Utilize resistant hybrid varieties; implement 1–2 year crop rotation with non-grass crops."
    },
    "Corn_(maize)___healthy": {
        "title": "Corn Foliage Healthy",
        "crop": "Corn (Maize)",
        "meaning": "Vigorous maize leaves showing strong chlorophyll synthesis and structural integrity.",
        "possible_causes": "Balanced soil fertility, adequate rainfall/irrigation, and robust hybrid resistance.",
        "treatment": "No chemical treatment required.",
        "prevention": "Maintain side-dressed nitrogen and scout for fall armyworm regularly."
    },
    "Grape___Black_rot": {
        "title": "Grape Black Rot",
        "crop": "Grape",
        "meaning": "Guignardia bidwellii fungus causing reddish-brown leaf spots with dark borders and shriveling black mummified berries.",
        "possible_causes": "Warm, wet weather (21–27°C) and unpruned mummified fruit clusters on vines.",
        "treatment": "Apply myclobutanil, mancozeb, or azoxystrobin spray starting from bud break to 4 weeks post-bloom.",
        "prevention": "Prune out mummified berries and infected canes; train vines for open canopy and rapid solar drying."
    },
    "Grape___Esca_(Black_Measles)": {
        "title": "Grape Esca (Black Measles)",
        "crop": "Grape",
        "meaning": "Complex vascular trunk fungal disease producing tiger-stripe interveinal leaf chlorosis and spotted berries.",
        "possible_causes": "Fungal entry through large pruning wounds during wet winter conditions.",
        "treatment": "No curative chemical spray exists for established Esca. Protect fresh pruning wounds with wound sealants.",
        "prevention": "Prune only during dry periods; sterilize pruning shears between vines; excise severely infected vine trunks."
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "title": "Grape Leaf Blight (Isariopsis Clavispora)",
        "crop": "Grape",
        "meaning": "Fungal leaf blight producing dark brown irregular spots on foliage, leading to premature defoliation.",
        "possible_causes": "High ambient humidity and overcrowded canopy restricting air circulation.",
        "treatment": "Apply copper oxychloride (0.25%) or carbendazim spray on upper and lower leaf surfaces.",
        "prevention": "Shoot thinning to improve ventilation; ensure good drainage and avoid overhead irrigation."
    },
    "Grape___healthy": {
        "title": "Grape Foliage Healthy",
        "crop": "Grape",
        "meaning": "Vigorous grape vine leaves with clean surfaces and balanced vegetative growth.",
        "possible_causes": "Effective canopy management, balanced potash nutrition, and dry foliage conditions.",
        "treatment": "No treatment required.",
        "prevention": "Maintain trellis training and preventive bio-fungicide sprays during monsoon periods."
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "title": "Citrus Greening (Huanglongbing / HLB)",
        "crop": "Citrus / Orange",
        "meaning": "Destructive bacterial disease (Candidatus Liberibacter asiaticus) spread by Asian citrus psyllids, causing blotchy mottle leaves and bitter, misshapen fruit.",
        "possible_causes": "Transmission by citrus psyllid insects (Diaphorina citri) and infected grafting buds.",
        "treatment": "Bacteria cannot be cured in mature trees. Heavily infected declining trees should be removed to protect the orchard.",
        "prevention": "Aggressively control psyllids using yellow sticky traps and systemic insecticides (imidacloprid/thiamethoxam); plant certified disease-free nursery stock."
    },
    "Peach___Bacterial_spot": {
        "title": "Peach Bacterial Spot",
        "crop": "Peach",
        "meaning": "Xanthomonas arboricola pv. pruni bacteria causing small angular water-soaked leaf spots that drop out, giving a 'shot-hole' appearance.",
        "possible_causes": "Warm, windy, wet springs and sandy soils with blowing dust causing micro-abrasions on leaves.",
        "treatment": "Apply preventive oxytetracycline or low-rate fixed copper sprays from bud burst through petal fall.",
        "prevention": "Avoid excessive nitrogen which promotes overly lush tender growth; plant windbreaks."
    },
    "Peach___healthy": {
        "title": "Peach Foliage Healthy",
        "crop": "Peach",
        "meaning": "Vibrant green foliage with no signs of bacterial shot-hole or leaf curl.",
        "possible_causes": "Proper orchard hygiene, balanced micro-nutrients (Zinc, Boron), and good aeration.",
        "treatment": "No treatment needed.",
        "prevention": "Apply standard dormant copper wash before bud swell in winter."
    },
    "Pepper,_bell___Bacterial_spot": {
        "title": "Bell Pepper Bacterial Spot",
        "crop": "Bell Pepper",
        "meaning": "Xanthomonas campestris bacteria causing small, dark, water-soaked circular lesions with chlorotic halos.",
        "possible_causes": "Warm temperatures (24–30°C), overhead sprinkler watering, and working in wet fields.",
        "treatment": "Apply fixed copper hydroxide mixed with mancozeb or bio-fungicide Bacillus subtilis.",
        "prevention": "Switch to drip irrigation; use certified disease-free seed; practice 2–3 year crop rotation away from solanaceous crops."
    },
    "Pepper,_bell___healthy": {
        "title": "Bell Pepper Foliage Healthy",
        "crop": "Bell Pepper",
        "meaning": "Healthy pepper leaves showing strong photosynthesis and robust bloom potential.",
        "possible_causes": "Optimum moisture, correct NPK balance, and good greenhouse/field sanitation.",
        "treatment": "No treatment required.",
        "prevention": "Maintain calcium levels to prevent blossom end rot and inspect for aphids/thrips."
    },
    "Potato___Early_blight": {
        "title": "Potato Early Blight",
        "crop": "Potato",
        "meaning": "Alternaria solani fungal infection causing concentric dark brown rings (target-board pattern) on older lower leaves.",
        "possible_causes": "Alternating wet and dry periods, plant stress, nutrient deficiency, and warm temperatures (24–29°C).",
        "treatment": "Apply chlorothalonil, mancozeb, or azoxystrobin spray upon first noticing lower leaf target spots.",
        "prevention": "Maintain balanced nitrogen and potassium fertility; use drip irrigation; avoid mechanical injury to foliage."
    },
    "Potato___Late_blight": {
        "title": "Potato Late Blight",
        "crop": "Potato",
        "meaning": "Aggressive oomycete pathogen (Phytophthora infestans) producing large water-soaked brown/black lesions with white fuzzy sporulation on leaf undersides.",
        "possible_causes": "Cool, humid weather (10–20°C) with persistent fog, dew, or rain.",
        "treatment": "URGENT: Spray systemic fungicides (metalaxyl-M + mancozeb, cymoxanil, or dimethomorph) immediately across the field.",
        "prevention": "Plant certified disease-free seed tubers; eliminate cull piles; destroy vines 2 weeks prior to harvest."
    },
    "Potato___healthy": {
        "title": "Potato Foliage Healthy",
        "crop": "Potato",
        "meaning": "Dense, clean potato foliage with no pathogen sporulation.",
        "possible_causes": "Good seed tuber quality, well-drained soil, and balanced hilling.",
        "treatment": "No chemical treatment required.",
        "prevention": "Monitor weather for late blight forecast alerts and hill rows properly."
    },
    "Tomato___Bacterial_spot": {
        "title": "Tomato Bacterial Spot",
        "crop": "Tomato",
        "meaning": "Xanthomonas bacteria causing small (2–3mm) black angular water-soaked spots on leaves and scabby raised spots on green fruit.",
        "possible_causes": "Overhead irrigation, driving rainstorms, high temperatures (25–30°C), and contaminated seeds.",
        "treatment": "Spray fixed copper mixed with mancozeb, or apply certified biological sprays like Bacillus subtilis.",
        "prevention": "Always use drip irrigation; never handle plants when foliage is wet; rotate with non-solanaceous crops."
    },
    "Tomato___Early_blight": {
        "title": "Tomato Early Blight",
        "crop": "Tomato",
        "meaning": "Alternaria linariae fungus producing distinct concentric circular 'target spots' starting on lower leaves, surrounded by yellow halos.",
        "possible_causes": "Warm weather (24–29°C), humid microclimate, soil splashing onto lower leaves, and plant heavy fruit load stress.",
        "treatment": "Prune out infected lower leaves; apply copper hydroxide or chlorothalonil fungicide promptly.",
        "prevention": "Stake plants off the soil; apply straw/plastic mulch around plant bases to prevent soil splash."
    },
    "Tomato___Late_blight": {
        "title": "Tomato Late Blight",
        "crop": "Tomato",
        "meaning": "Highly destructive Phytophthora infestans causing rapid olive-brown greasy leaf collapse with white fungal down on leaf undersides.",
        "possible_causes": "Cool temperatures (15–22°C) combined with high relative humidity (>90%) and rain.",
        "treatment": "URGENT: Apply systemic curative fungicide (metalaxyl-M, cymoxanil, or mandipropamid) immediately. Destroy heavily infected plants.",
        "prevention": "Widen plant spacing for rapid drying; avoid late evening irrigation; plant resistant cultivars."
    },
    "Tomato___Leaf_Mold": {
        "title": "Tomato Leaf Mold",
        "crop": "Tomato",
        "meaning": "Passalora fulva fungus causing pale green/yellow spots on upper leaf surfaces and olive-brown velvety mold on undersides.",
        "possible_causes": "High humidity (>85%) in polyhouses, greenhouses, or dense humid field canopies.",
        "treatment": "Spray copper fungicides or sulfur-based protectants targeting the lower leaf surfaces.",
        "prevention": "Maximize greenhouse ventilation; prune excess foliage; maintain humidity below 85%."
    },
    "Tomato___Septoria_leaf_spot": {
        "title": "Tomato Septoria Leaf Spot",
        "crop": "Tomato",
        "meaning": "Septoria lycopersici fungus causing numerous tiny circular spots (1–3mm) with grayish-white centers and dark brown margins.",
        "possible_causes": "Splashing raindrops, prolonged leaf wetness, and moderate temperatures (20–25°C).",
        "treatment": "Prune infected lower foliage; spray chlorothalonil or copper-based fungicides at 7–10 day intervals.",
        "prevention": "Rotate crops on a 3-year cycle; mulch soil surface; sanitize tomato stakes and cages."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "title": "Tomato Two-Spotted Spider Mite",
        "crop": "Tomato",
        "meaning": "Tetranychus urticae arachnid pests feeding on leaf cell sap, producing fine yellow stippling and webbing on leaf undersides.",
        "possible_causes": "Hot, dry, and dusty weather conditions accompanied by water stress.",
        "treatment": "Apply neem oil (1500 ppm), potassium salts of fatty acids, or abamectin miticide targeting undersides of foliage.",
        "prevention": "Maintain adequate irrigation to avoid drought stress; wash down dusty field edges; conserve predatory phytoseiid mites."
    },
    "Tomato___Target_Spot": {
        "title": "Tomato Target Spot",
        "crop": "Tomato",
        "meaning": "Corynespora cassiicola fungus creating brown lesions with concentric rings on leaves, stems, and fruit.",
        "possible_causes": "Warm, humid tropical conditions with prolonged canopy moisture.",
        "treatment": "Spray azoxystrobin, difenoconazole, or copper fungicides at early disease detection.",
        "prevention": "Ensure wide plant spacing; maintain trellis support; remove old crop residues."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "title": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "crop": "Tomato",
        "meaning": "Begomovirus transmitted by silverleaf whiteflies causing severe upward leaf cupping, yellow margins, stunted growth, and flower drop.",
        "possible_causes": "Whitefly (Bemisia tabaci) insect vector populations feeding on crops.",
        "treatment": "Viruses cannot be cured with fungicides. Promptly rogue out (uproot and bury/burn) infected plants.",
        "prevention": "Control whiteflies using yellow sticky traps and systemic insecticides (acetamiprid/imidacloprid); install 50-mesh insect-proof netting in nurseries."
    },
    "Tomato___Tomato_mosaic_virus": {
        "title": "Tomato Mosaic Virus (ToMV)",
        "crop": "Tomato",
        "meaning": "Tobamovirus causing mottled light/dark green mosaic patterns on leaves, fern-like distortion, and uneven fruit ripening.",
        "possible_causes": "Mechanical transmission by tools, hands, clothing, and infected seed stock.",
        "treatment": "No chemical cure. Remove and safely dispose of infected plants to protect remaining crops.",
        "prevention": "Wash hands with soap/skim milk before handling plants; disinfect pruning tools with 10% trisodium phosphate (TSP)."
    },
    "Tomato___healthy": {
        "title": "Tomato Foliage Healthy",
        "crop": "Tomato",
        "meaning": "Leaves exhibit healthy dark green chlorophyll, strong turgidity, and no pathogen lesions.",
        "possible_causes": "Optimal nutrition (balanced N:P:K:Ca:Mg), clean soil mulch, and good airflow.",
        "treatment": "No chemical treatment needed.",
        "prevention": "Maintain scheduled drip fertigation and scout weekly for early pathogen signs."
    },
    "healthy": {
        "title": "Crop Foliage Healthy",
        "crop": "Crop",
        "meaning": "Foliage exhibits vigorous chlorophyll concentration and cellular integrity with no active disease symptoms.",
        "possible_causes": "Balanced agronomic care, proper soil moisture, and effective crop scouting.",
        "treatment": "No chemical treatment necessary.",
        "prevention": "Maintain balanced NPK nutrition, scheduled drip irrigation, and routine scouting."
    }
}

def format_disease_title(class_name: str) -> str:
    """Format machine class string into clean farmer-friendly title."""
    if class_name in DISEASE_DETAILS:
        return DISEASE_DETAILS[class_name]["title"]
    # Fallback cleanup
    clean = class_name.replace("___", " - ").replace("_", " ")
    return clean.title()

def get_disease_guidance(disease_name: str) -> Dict[str, str]:
    """Retrieve tailored agronomic diagnosis and guidance for a predicted disease class."""
    if "healthy" in disease_name.lower():
        details = DISEASE_DETAILS.get(disease_name, DISEASE_DETAILS["healthy"])
    elif disease_name in DISEASE_DETAILS:
        details = DISEASE_DETAILS[disease_name]
    else:
        # Fallback generic crop advice
        crop_part = disease_name.split("___")[0].replace("_", " ")
        details = {
            "title": format_disease_title(disease_name),
            "crop": crop_part,
            "meaning": f"Pathogen infection identified on {crop_part} foliage.",
            "possible_causes": "High ambient humidity, extended leaf wetness, or vector insect activity.",
            "treatment": "Apply approved broad-spectrum organic or copper fungicide. Prune heavily infected leaves.",
            "prevention": "Ensure good field airflow, balanced drip irrigation, crop rotation, and routine plant scouting."
        }
    return details
