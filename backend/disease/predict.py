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

DISEASE_GUIDANCE: Dict[str, Dict[str, str]] = {
    "Apple___Apple_scab": {
        "treatment": "Apply captan, mancozeb, or copper fungicide spray at green tip stage. Prune affected branches.",
        "prevention": "Rake and compost fallen leaves in autumn, prune tree canopy to allow sunlight and airflow."
    },
    "Apple___Black_rot": {
        "treatment": "Prune out dead wood and cankers 6-8 inches below affected area. Apply captan during petal fall.",
        "prevention": "Remove mummified fruit from trees and ground; sterilize pruning shears between cuts."
    },
    "Apple___Cedar_apple_rust": {
        "treatment": "Apply myclobutanil or propiconazole fungicide when galls swell on nearby cedars in spring.",
        "prevention": "Plant rust-resistant apple cultivars; prune nearby cedar or juniper galls if feasible."
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "treatment": "Apply strobilurin or triazole fungicides if lesions appear on the ear leaf before tassel.",
        "prevention": "Rotate with non-host crops like soybean; incorporate crop residues to reduce fungal overwintering."
    },
    "Corn_(maize)___Common_rust_": {
        "treatment": "Fungicide treatment usually not needed unless pustules appear early and weather is cool and moist.",
        "prevention": "Plant resistant corn hybrids; plant early in the season to evade late-season rust spore showers."
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "treatment": "Apply foliar fungicides at tassel emergence if lesions are present on or near the ear leaf.",
        "prevention": "Utilize resistant hybrid varieties; implement 1-2 year crop rotation with non-grass crops."
    },
    "Grape___Black_rot": {
        "treatment": "Apply myclobutanil, azoxystrobin, or copper spray starting from bud break to 4 weeks post-bloom.",
        "prevention": "Prune out mummified berries and infected canes; maintain open canopy for rapid drying."
    },
    "Grape___Esca_(Black_Measles)": {
        "treatment": "No chemical cure for established Esca. Protect pruning wounds with wound sealants or Trichoderma.",
        "prevention": "Prune during dry winter periods; remove severely infected vines to avoid vineyard spread."
    },
    "Potato___Early_blight": {
        "treatment": "Spray chlorothalonil, mancozeb, or azoxystrobin on concentric target-pattern lesions.",
        "prevention": "Avoid overhead sprinkler irrigation; maintain adequate nitrogen and potassium levels."
    },
    "Potato___Late_blight": {
        "treatment": "URGENT: Apply systemic fungicide (metalaxyl, dimethomorph, or cymoxanil) immediately upon detection.",
        "prevention": "Plant certified disease-free seed tubers; destroy infected cull piles; harvest only during dry weather."
    },
    "Tomato___Bacterial_spot": {
        "treatment": "Spray fixed copper mixed with mancozeb, or apply certified biological sprays like Bacillus subtilis.",
        "prevention": "Use drip irrigation; never work in fields when foliage is wet; rotate with non-solanaceous crops."
    },
    "Tomato___Early_blight": {
        "treatment": "Remove lower infected leaves; apply copper or chlorothalonil fungicide at first sign of target spots.",
        "prevention": "Stake plants off the ground; mulch soil around stems to prevent soil-splash onto leaves."
    },
    "Tomato___Late_blight": {
        "treatment": "URGENT: Apply metalaxyl-M or copper hydroxide fungicide immediately. Remove heavily infected plants.",
        "prevention": "Space tomato plants widely for maximum ventilation; avoid wet leaves overnight."
    },
    "Tomato___Leaf_Mold": {
        "treatment": "Apply copper fungicides or sulfur-based sprays on lower leaf surfaces.",
        "prevention": "Improve greenhouse/polyhouse ventilation; keep relative humidity below 85%."
    },
    "Tomato___Septoria_leaf_spot": {
        "treatment": "Prune infected lower foliage; apply chlorothalonil or copper-based sprays every 7-10 days.",
        "prevention": "Rotate crops on a 3-year cycle; sanitize garden stakes and wire cages."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "treatment": "Apply neem oil, insecticidal soap, or abamectin miticide targeting undersides of leaves.",
        "prevention": "Avoid water stress; encourage predatory mites; hose down foliage to reduce dust and webs."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "treatment": "Viruses cannot be cured once inside the plant. Remove and destroy infected plants promptly.",
        "prevention": "Control whitefly vectors using yellow sticky traps and systemic imidacloprid or neem spray."
    },
    "healthy": {
        "treatment": "No chemical treatment necessary. Foliage exhibits vigorous chlorophyll and cellular integrity.",
        "prevention": "Maintain balanced NPK nutrition, scheduled soil moisture, and regular scouting."
    }
}

def get_disease_guidance(disease_name: str) -> Dict[str, str]:
    """Retrieve tailored agronomic treatment and prevention guidance for a predicted disease class."""
    if "healthy" in disease_name.lower():
        return DISEASE_GUIDANCE["healthy"]
    if disease_name in DISEASE_GUIDANCE:
        return DISEASE_GUIDANCE[disease_name]
    # Fallback generic crop advice
    return {
        "treatment": "Apply approved broad-spectrum organic or copper fungicide. Prune heavily infected foliage.",
        "prevention": "Ensure good field airflow, balanced drip irrigation, crop rotation, and routine plant scouting."
    }
