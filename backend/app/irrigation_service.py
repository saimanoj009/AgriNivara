"""
AgriNivara - Smart Irrigation Decision Service
Synthesizes real-time agro-meteorological telemetry, forecast rainfall, soil moisture,
crop growth stage, and atmospheric demand into actionable qualitative irrigation advisories.
Zero fabricated water volume numbers.
"""

from typing import Dict, Any, Optional

def evaluate_irrigation_decision(
    temperature: float,
    humidity: float,
    rainfall_today: float = 0.0,
    rainfall_forecast_48h: float = 0.0,
    rain_prob_48h: float = 0.0,
    soil_moisture: Optional[float] = None,
    crop_type: str = "General Crops",
    crop_stage: str = "Vegetative",
    irrigation_method: str = "Drip Irrigation",
    location: str = "India"
) -> Dict[str, Any]:
    """
    Computes an agronomic, qualitative irrigation advisory.
    Returns status_code, status_label, priority, title, reason, action_tip, method_guidance, and factor breakdown.
    """
    est_moisture = soil_moisture if soil_moisture is not None else 65.0

    # 1. Incoming heavy rainfall -> DELAY
    if rainfall_today >= 20.0 or rainfall_forecast_48h >= 25.0 or rain_prob_48h >= 70.0:
        return {
            "status_code": "HEAVY_RAIN_DELAY",
            "status_label": "HEAVY RAIN EXPECTED — DELAY IRRIGATION",
            "priority": "HIGH",
            "title": "Natural Precipitation Anticipated",
            "reason": (
                f"Rainfall forecast indicates substantial precipitation "
                f"({rainfall_forecast_48h:.1f}mm expected, {rain_prob_48h}% probability). "
                f"Applying irrigation now would risk soil waterlogging, root asphyxiation, and fertilizer leaching."
            ),
            "action_tip": "Suspend all irrigation pumps. Inspect field drainage bunds and clear excess water outlets.",
            "method_guidance": "Zero irrigation required. Rely on natural rainfall.",
            "factors": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall_today": rainfall_today,
                "rainfall_forecast_48h": rainfall_forecast_48h,
                "rain_prob_48h": rain_prob_48h,
                "soil_moisture_pct": est_moisture,
                "crop": crop_type,
                "crop_stage": crop_stage,
                "location": location
            }
        }

    # 2. Extreme Heat & Low Humidity -> WATER STRESS DETECTED
    if temperature >= 35.0 and humidity <= 45.0:
        return {
            "status_code": "WATER_STRESS_DETECTED",
            "status_label": "WATER STRESS DETECTED — IRRIGATE NOW",
            "priority": "CRITICAL",
            "title": "Severe Atmospheric Evaporative Deficit",
            "reason": (
                f"High temperature ({temperature}°C) combined with dry air ({humidity}% relative humidity) "
                f"drives rapid evapotranspiration. Soil moisture ({est_moisture:.0f}%) is depleting rapidly for {crop_type}."
            ),
            "action_tip": "Initiate early morning irrigation (5:00 AM – 8:30 AM). Avoid daytime watering to prevent scald.",
            "method_guidance": f"Apply deep root-zone soaking via {irrigation_method}. Mulching recommended to conserve moisture.",
            "factors": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall_today": rainfall_today,
                "rainfall_forecast_48h": rainfall_forecast_48h,
                "rain_prob_48h": rain_prob_48h,
                "soil_moisture_pct": est_moisture,
                "crop": crop_type,
                "crop_stage": crop_stage,
                "location": location
            }
        }

    # 3. High moisture or saturated humidity -> NO IRRIGATION REQUIRED
    if est_moisture >= 75.0 or (humidity >= 85.0 and temperature <= 28.0):
        return {
            "status_code": "NO_IRRIGATION_REQUIRED",
            "status_label": "NO IRRIGATION REQUIRED",
            "priority": "LOW",
            "title": "Soil Moisture Reserve Adequate",
            "reason": (
                f"Current soil moisture ({est_moisture:.0f}%) and atmospheric humidity ({humidity}%) "
                f"adequately support {crop_type} at the {crop_stage} stage without additional pumping."
            ),
            "action_tip": "Conserve ground water and power. Monitor foliage for fungal symptoms under humid conditions.",
            "method_guidance": "No supplemental water needed for the next 24 to 36 hours.",
            "factors": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall_today": rainfall_today,
                "rainfall_forecast_48h": rainfall_forecast_48h,
                "rain_prob_48h": rain_prob_48h,
                "soil_moisture_pct": est_moisture,
                "crop": crop_type,
                "crop_stage": crop_stage,
                "location": location
            }
        }

    # 4. Moderate rain chance -> WAIT & MONITOR
    if rain_prob_48h >= 40.0 and rain_prob_48h < 70.0:
        return {
            "status_code": "WAIT",
            "status_label": "WAIT & MONITOR WEATHER",
            "priority": "MODERATE",
            "title": "Moderate Rain Probability in 48-Hour Forecast",
            "reason": (
                f"Weather models show a {rain_prob_48h:.0f}% chance of localized precipitation. "
                f"Existing soil moisture ({est_moisture:.0f}%) is sufficient to safely wait 12–18 hours."
            ),
            "action_tip": "Re-check soil dampness 2 inches below surface this evening before running pumps.",
            "method_guidance": "Hold irrigation on standby. Activate only if skies clear and topsoil dries.",
            "factors": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall_today": rainfall_today,
                "rainfall_forecast_48h": rainfall_forecast_48h,
                "rain_prob_48h": rain_prob_48h,
                "soil_moisture_pct": est_moisture,
                "crop": crop_type,
                "crop_stage": crop_stage,
                "location": location
            }
        }

    # 5. Normal Warm/Dry conditions -> IRRIGATE NOW or IRRIGATE LATER
    if temperature >= 29.0 and rain_prob_48h < 35.0:
        return {
            "status_code": "IRRIGATE_NOW",
            "status_label": "IRRIGATE NOW (SCHEDULED CYCLE)",
            "priority": "HIGH",
            "title": "Optimal Scheduled Irrigation Window",
            "reason": (
                f"Warm temperature ({temperature}°C) with dry forecast for the next 48 hours. "
                f"{crop_type} in {crop_stage} stage requires active moisture replenishment."
            ),
            "action_tip": f"Execute scheduled watering cycle today using {irrigation_method}.",
            "method_guidance": f"Standard duration irrigation via {irrigation_method} during cool morning or dusk hours.",
            "factors": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall_today": rainfall_today,
                "rainfall_forecast_48h": rainfall_forecast_48h,
                "rain_prob_48h": rain_prob_48h,
                "soil_moisture_pct": est_moisture,
                "crop": crop_type,
                "crop_stage": crop_stage,
                "location": location
            }
        }

    # Default mild condition -> IRRIGATE LATER
    return {
        "status_code": "IRRIGATE_LATER",
        "status_label": "IRRIGATE LATER (EVENING WINDOW)",
        "priority": "MODERATE",
        "title": "Evening Maintenance Cycle Recommended",
        "reason": (
            f"Moderate ambient temperature ({temperature}°C) and steady humidity ({humidity}%). "
            f"Evening watering minimizes solar evaporation and promotes deep root penetration."
        ),
        "action_tip": "Schedule watering between 6:00 PM and 9:00 PM for optimal efficiency.",
        "method_guidance": f"Moderate cycle via {irrigation_method}.",
        "factors": {
            "temperature": temperature,
            "humidity": humidity,
            "rainfall_today": rainfall_today,
            "rainfall_forecast_48h": rainfall_forecast_48h,
            "rain_prob_48h": rain_prob_48h,
            "soil_moisture_pct": est_moisture,
            "crop": crop_type,
            "crop_stage": crop_stage,
            "location": location
        }
    }
