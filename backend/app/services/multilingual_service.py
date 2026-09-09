import os
import json
import re
import html
import urllib.parse
import httpx
import asyncio
from typing import Dict, Any, List, Optional, Tuple, Callable
from app.config import settings

LANGUAGE_MAP = {
    "kannada": "Kannada",
    "kannada (ಕನ್ನಡ)": "Kannada",
    "kn": "Kannada",
    "ಕನ್ನಡ": "Kannada",
    
    "hindi": "Hindi",
    "hindi (हिंदी)": "Hindi",
    "hi": "Hindi",
    "हिंदी": "Hindi",
    
    "tamil": "Tamil",
    "tamil (தமிழ்)": "Tamil",
    "ta": "Tamil",
    "தமிழ்": "Tamil",
    
    "telugu": "Telugu",
    "telugu (తెలుగు)": "Telugu",
    "te": "Telugu",
    "తెలుగు": "Telugu",
    
    "malayalam": "Malayalam",
    "malayalam (മലയാളം)": "Malayalam",
    "ml": "Malayalam",
    "മലയാളം": "Malayalam",
    
    "bengali": "Bengali",
    "bengali (বাংলা)": "Bengali",
    "bn": "Bengali",
    "বাংলা": "Bengali",
    
    "marathi": "Marathi",
    "marathi (मराठी)": "Marathi",
    "mr": "Marathi",
    "मराठी": "Marathi",
    
    "gujarati": "Gujarati",
    "gujarati (ગુજરાતી)": "Gujarati",
    "gu": "Gujarati",
    "ગુજરાતી": "Gujarati",
    
    "spanish": "Spanish",
    "spanish (español)": "Spanish",
    "es": "Spanish",
    "español": "Spanish",
    
    "french": "French",
    "french (français)": "French",
    "fr": "French",
    "français": "French",
    
    "german": "German",
    "german (deutsch)": "German",
    "de": "German",
    "deutsch": "German",
    
    "japanese": "Japanese",
    "japanese (日本語)": "Japanese",
    "ja": "Japanese",
    "日本語": "Japanese",
    
    "chinese": "Chinese",
    "chinese (simplified)": "Chinese",
    "zh": "Chinese",
    "中文": "Chinese",
    
    "arabic": "Arabic",
    "arabic (العربية)": "Arabic",
    "ar": "Arabic",
    "العربية": "Arabic",
    
    "portuguese": "Portuguese",
    "portuguese (português)": "Portuguese",
    "pt": "Portuguese",
    "português": "Portuguese",
    
    "english": "English",
    "english (united states)": "English",
    "english (uk)": "English",
    "en": "English",
}

LANGUAGE_CODE_MAP = {
    "Kannada": "kn",
    "Hindi": "hi",
    "Tamil": "ta",
    "Telugu": "te",
    "Malayalam": "ml",
    "Bengali": "bn",
    "Marathi": "mr",
    "Gujarati": "gu",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Japanese": "ja",
    "Chinese": "zh-CN",
    "Arabic": "ar",
    "Portuguese": "pt",
    "English": "en"
}

# Curated Technical & Enterprise Dictionary
OFFLINE_DICTIONARY: Dict[str, Dict[str, str]] = {
    "Kannada": {
        "Executive Summary": "ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಾರಾಂಶ",
        "Strategic Briefing": "ಕಾರ್ಯತಂತ್ರದ ಸಂಕ್ಷಿಪ್ತ ವರದಿ",
        "Key Findings": "ಪ್ರಮುಖ ಸಂಶೋಧನೆಗಳು",
        "Key Finding": "ಪ್ರಮುಖ ಸಂಶೋಧನೆ",
        "Quantified Telemetry": "ಪರಿಮಾಣಾತ್ಮಕ ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ಮೆಟ್ರಿಕ್ಸ್",
        "Operational Risks": "ಕಾರ್ಯಾಚರಣೆಯ ಅಪಾಯಗಳು ಮತ್ತು ಸವಾಲುಗಳು",
        "Action Directives": "ಕಾರ್ಯತಂತ್ರದ ನಿರ್ದೇಶನಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿ",
        "Recommendations": "ಶಿಫಾರಸುಗಳು",
        "Conclusion": "ತೀರ್ಮಾನ ಮತ್ತು ಮುಂದಿನ ಹೆಜ್ಜೆಗಳು",
        "Slide": "ಸ್ಲೈಡ್",
        "Overview": "ಅವಲೋಕನ",
        "Timeline": "ಸಮಯರೇಖೆ",
        "Status": "ಸ್ಥಿತಿ",
        "Verified": "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
        "High Priority": "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ",
        "Immediate Priority": "ತಕ್ಷಣದ ಆದ್ಯತೆ",
        "Critical Priority": "ನಿರ್ಣಾಯಕ ಆದ್ಯತೆ",
        "Strategic Priority": "ಕಾರ್ಯತಂತ್ರದ ಆದ್ಯತೆ",
        "Discussion Question": "ಚರ್ಚೆಯ ಪ್ರಶ್ನೆ",
        "Security Advisory": "ಭದ್ರತಾ ಸಲಹೆ",
        "Threat Advisory": "ಭದ್ರತಾ ಸಲಹೆ",
        "Operational Advisory": "ಕಾರ್ಯಾಚರಣೆಯ ಸಲಹೆ",
        "Advisory": "ಸಲಹೆ",
        "Mitigation Plan": "ಶಮನ ಯೋಜನೆ",
        "Executive Board & Technical Engineers": "ಕಾರ್ಯನಿರ್ವಾಹಕ ಮಂಡಳಿ ಮತ್ತು ತಾಂತ್ರಿಕ ಇಂಜಿನಿಯರ್‌ಗಳು",
        "Executive Leadership & Board of Directors": "ಕಾರ್ಯನಿರ್ವಾಹಕ ನಾಯಕತ್ವ ಮತ್ತು ನಿರ್ದೇಶಕರ ಮಂಡಳಿ",
        "Professional & Strategic": "ವೃತ್ತಿಪರ ಮತ್ತು ಕಾರ್ಯತಂತ್ರದ",
        "Professional & Authoritative": "ವೃತ್ತಿಪರ ಮತ್ತು ಅಧಿಕೃತ",
        "Executive Briefing Dossier": "ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಂಕ್ಷಿಪ್ತ ದಾಖಲೆ",
        "Executive Briefing": "ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ",
        "LinkedIn Brief": "ಲಿಂಕ್ಡ್ಇನ್ ಸಂಕ್ಷಿಪ್ತ ವರದಿ",
        "X Thread": "X ಥ್ರೆಡ್",
        "Presentation Deck": "ಪ್ರಸ್ತುತಿ ಡೆಕ್",
        "Infographic Blueprint": "ಇನ್ಫೋಗ್ರಾಫಿಕ್ ಬ್ಲೂಪ್ರಿಂಟ್",
        "Video Script": "ವೀಡಿಯೊ ಸ್ಕ್ರಿಪ್ಟ್",
        "Mode 2: Source & Verify": "ಮೋಡ್ ೨: ಮೂಲ ಮತ್ತು ಪರಿಶೀಲಿಸಿ",
        "Mode 1: Source Only": "ಮೋಡ್ ೧: ಮೂಲ ಮಾತ್ರ",
        "Mode 3: Deep Research": "ಮೋಡ್ ೩: ಆಳವಾದ ಸಂಶೋಧನೆ",
        "SOURCE_AND_VERIFY": "ಮೋಡ್ ೨: ಮೂಲ ಮತ್ತು ಪರಿಶೀಲಿಸಿ",
        "SOURCE_ONLY": "ಮೋಡ್ ೧: ಮೂಲ ಮಾತ್ರ",
        "DEEP_RESEARCH": "ಮೋಡ್ ೩: ಆಳವಾದ ಸಂಶೋಧನೆ",
        "Authoritative Ground Truth": "ಅಧಿಕೃತ ಗ್ರೌಂಡ್ ಟ್ರುತ್",
        "Primary Source Narrative": "ಪ್ರಾಥಮಿಕ ಮೂಲ ವಿವರಣೆ",
        "Executive Explainer Video": "ಕಾರ್ಯನಿರ್ವಾಹಕ ವಿವರಣಾತ್ಮಕ ವೀಡಿಯೊ",
        "Reference": "ಉಲ್ಲೇಖ",
        "Classification": "ವರ್ಗೀಕರಣ",
        "Audience": "ಪ್ರೇಕ್ಷಕರು",
        "Tone": "ಧಾಟಿ",
        "Analysis for": "ವಿಶ್ಲೇಷಣೆ -",
        "HIGH IMPORTANCE / MANDATORY REMEDIATION": "ಹೆಚ್ಚಿನ ಪ್ರಾಮುಖ್ಯತೆ / ಕಡ್ಡಾಯ ಪರಿಹಾರ",
        "RESTRICTED / EXECUTIVE TIER-1": "ನಿರ್ಬಂಧಿತ / ಉನ್ನತ ಮಟ್ಟದ ಕಾರ್ಯನಿರ್ವಾಹಕ ಶ್ರೇಣಿ",
        "CONFIDENTIAL / AIR-GAPPED SANDBOX": "ಗೌಪ್ಯ / ಪ್ರತ್ಯೇಕಿಸಿದ ಸುರಕ್ಷಿತ ವಾತಾವರಣ",
        "MULTI-TIER INTELLIGENCE DOSSIER / 8-TIER": "ಬಹು-ಹಂತದ ಗುಪ್ತಚರ ಡಾಕ್ಯುಮೆಂಟ್",
        "100% PRIMARY DOCUMENT BOUND (ZERO EXTERNAL SEARCH)": "೧೦೦% ಮೂಲ ದಾಖಲೆಗೆ ಮಾತ್ರ ಬದ್ಧ (ಬಾಹ್ಯ ಹುಡುಕಾಟ ರಹಿತ)",
        "100% VERIFIED SOURCE GROUNDED (TIER 1/2 CHECKED)": "೧೦೦% ಪರಿಶೀಲಿತ ಮೂಲ ಆಧಾರಿತ (ಹಂತ ೧/೨ ಪರಿಶೀಲನೆ)",
        "CROSS-SOURCE SYNTHESIS & 8-TIER VERIFIED": "ಕ್ರಾಸ್-ಮೂಲ ಸಂಶ್ಲೇಷಣೆ ಮತ್ತು ೮-ಹಂತ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
        "EXECUTIVE BRIEFING & STRATEGIC DOSSIER": "ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಂಕ್ಷಿಪ್ತ ವರದಿ ಮತ್ತು ಕಾರ್ಯತಂತ್ರದ ದಾಖಲೆ",
        "PAGE 1 OF 3: STRATEGIC CONTEXT & QUANTIFIED SCORECARD": "ಪುಟ ೧ / ೩: ಕಾರ್ಯತಂತ್ರದ ಸನ್ನಿವೇಶ ಮತ್ತು ಪರಿಮಾಣಾತ್ಮಕ ಸ್ಕೋರ್‌ಕಾರ್ಡ್",
        "PAGE 2 OF 3: IN-DEPTH OPERATIONAL ANALYSIS & RISK MATRIX": "ಪುಟ ೨ / ೩: ಆಳವಾದ ಕಾರ್ಯಾಚರಣೆಯ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಅಪಾಯದ ಮ್ಯಾಟ್ರಿಕ್ಸ್",
        "PAGE 2 OF 3: IN-DEPTH OPERATIONAL ANALYSIS, EVIDENCE & RISK MATRIX": "ಪುಟ ೨ / ೩: ಆಳವಾದ ಕಾರ್ಯಾಚರಣೆಯ ವಿಶ್ಲೇಷಣೆ, ಸಾಕ್ಷ್ಯ ಮತ್ತು ಅಪಾಯದ ಮ್ಯಾಟ್ರಿಕ್ಸ್",
        "PAGE 3 OF 3: PHASED ACTION ROADMAP & GOVERNANCE DIRECTIVES": "ಪುಟ ೩ / ೩: ಹಂತ-ಹಂತದ ಕಾರ್ಯ ಮಾರ್ಗಸೂಚಿ ಮತ್ತು ಆಡಳಿತ ನಿರ್ದೇಶನಗಳು",
        "Document Classification": "ದಾಖಲೆಯ ವರ್ಗೀಕರಣ",
        "Target Audience": "ಉದ್ದೇಶಿತ ಪ್ರೇಕ್ಷಕರು",
        "Grounding Status": "ಮೂಲ ಪರಿಶೀಲನೆ ಸ್ಥಿತಿ",
        "Research Engine Mode": "ಸಂಶೋಧನಾ ಎಂಜಿನ್ ಮೋಡ್",
        "Language": "ಭಾಷೆ",
        "Key Telemetry Metric": "ಪ್ರಮುಖ ಮೆಟ್ರಿಕ್",
        "Measured / Extracted Value": "ಅಳತೆ / ಹೊರತೆಗೆದ ಮೌಲ್ಯ",
        "Operational Context": "ಕಾರ್ಯಾಚರಣೆಯ ಸನ್ನಿವೇಶ",
        "Verification Source": "ಪರಿಶೀಲನಾ ಮೂಲ",
        "Entity / System / Stakeholder": "ಘಟಕ / ವ್ಯವಸ್ಥೆ / ಮಧ್ಯಸ್ಥಗಾರ",
        "Classification Type": "ವರ್ಗೀಕರಣ ಪ್ರಕಾರ",
        "Operational Role & Impact": "ಕಾರ್ಯಾಚರಣೆಯ ಪಾತ್ರ ಮತ್ತು ಪರಿಣಾಮ",
        "Risk Factor & Exposure": "ಅಪಾಯದ ಅಂಶ",
        "Severity Level": "ತೀವ್ರತೆಯ ಮಟ್ಟ",
        "Potential Operational Impact": "ಸಂಭಾವ್ಯ ಕಾರ್ಯಾಚರಣೆಯ ಪರಿಣಾಮ",
        "Mitigation Feasibility": "ಶಮನದ ಕಾರ್ಯಸಾಧ್ಯತೆ",
        "Reviewer Role": "ವಿಮರ್ಶಕರ ಪಾತ್ರ",
        "Name & Title": "ಹೆಸರು ಮತ್ತು ಹುದ್ದೆ",
        "Approval Status": "ಅನುಮೋದನೆ ಸ್ಥಿತಿ",
        "Signature / Timestamp": "ಸಹಿ / ಸಮಯಮುದ್ರೆ",
        "Executive Sponsor": "ಕಾರ್ಯನಿರ್ವಾಹಕ ಪ್ರಾಯೋಜಕರು",
        "Chief Strategy Officer / VP": "ಮುಖ್ಯ ಕಾರ್ಯತಂತ್ರ ಅಧಿಕಾರಿ / ವಿಪಿ",
        "APPROVED FOR EXECUTION": "ಕಾರ್ಯಗತಗೊಳಿಸಲು ಅನುಮೋದಿಸಲಾಗಿದೆ",
        "Lead Technical Analyst": "ಮುಖ್ಯ ತಾಂತ್ರಿಕ ವಿಶ್ಲೇಷಕರು",
        "Principal Domain Specialist": "ಪ್ರಧಾನ ವಿಷಯ ತಜ್ಞರು",
        "VERIFIED FACTUAL GROUNDING": "ಪರಿಶೀಲಿಸಿದ ವಾಸ್ತವಿಕ ಆಧಾರ",
        "Compliance Officer": "ಅನುಸರಣಾ ಅಧಿಕಾರಿ",
        "Enterprise Risk & Governance": "ಉದ್ಯಮದ ಅಪಾಯ ಮತ್ತು ಆಡಳಿತ",
        "CONCURRENCE RECORDED": "ಒಪ್ಪಿಗೆ ದಾಖಲಿಸಲಾಗಿದೆ",
        "Digitally Certified": "ಡಿಜಿಟಲ್ ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ",
        "Primary Intelligence Index": "ಪ್ರಾಥಮಿಕ ಗುಪ್ತಚರ ಸೂಚ್ಯಂಕ",
        "Confidence Rating": "ವಿಶ್ವಾಸಾರ್ಹತೆ ರೇಟಿಂಗ್",
        "Document Information Density": "ದಾಖಲೆಯ ಮಾಹಿತಿ ಸಾಂದ್ರತೆ",
        "Synthesized Key Claims": "ಸಂಶ್ಲೇಷಿತ ಪ್ರಮುಖ ಹೇಳಿಕೆಗಳು",
        "Executive Leadership": "ಕಾರ್ಯನಿರ್ವಾಹಕ ನಾಯಕತ್ವ",
        "Operational Infrastructure": "ಕಾರ್ಯಾಚರಣಾ ಮೂಲಸೌಕರ್ಯ",
        "ORGANIZATION": "ಸಂಸ್ಥೆ",
        "SYSTEM": "ವ್ಯವಸ್ಥೆ",
        "HIGH": "ಹೆಚ್ಚು",
        "MEDIUM": "ಮಧ್ಯಮ",
        "LOW": "ಕಡಿಮೆ",
        "CRITICAL": "ನಿರ್ಣಾಯಕ",
        "STRATEGIC": "ಕಾರ್ಯತಂತ್ರದ",
        "High": "ಹೆಚ್ಚು",
        "Medium": "ಮಧ್ಯಮ",
        "Low": "ಕಡಿಮೆ",
        "Primary Source": "ಪ್ರಾಥಮಿಕ ಮೂಲ",
        "External Verified": "ಬಾಹ್ಯ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
        "Deep Synthesis": "ಆಳವಾದ ಸಂಶ್ಲೇಷಣೆ",
        "Source Base": "ಮೂಲ ನೆಲೆ",
        "Page 1": "ಪುಟ ೧",
        "Page 2": "ಪುಟ ೨",
        "Page 3": "ಪುಟ ೩",
        "characters": "ಅಕ್ಷರಗಳು",
        "verified points": "ಪರಿಶೀಲಿಸಿದ ಅಂಶಗಳು",
    },
    "Hindi": {
        "Executive Summary": "कार्यकारी सारांश",
        "Strategic Briefing": "रणनीतिक संक्षिप्त विवरण",
        "Key Findings": "प्रमुख निष्कर्ष",
        "Key Finding": "प्रमुख निष्कर्ष",
        "Quantified Telemetry": "मात्रात्मक मेट्रिक्स और टेलीमेट्री",
        "Operational Risks": "परिचालन जोखिम और प्रभाव",
        "Action Directives": "रणनीतिक कार्रवाई निर्देश और रोडमैप",
        "Recommendations": "सिफारिशें",
        "Conclusion": "निष्कर्ष और मुख्य संदेश",
        "Slide": "स्लाइड",
        "Overview": "अवलोकन",
        "Timeline": "समयरेखा",
        "Status": "स्थिति",
        "Verified": "सत्यापित",
        "High Priority": "उच्च प्राथमिकता",
        "Immediate Priority": "तत्काल प्राथमिकता",
        "Critical Priority": "अति महत्वपूर्ण प्राथमिकता",
        "Strategic Priority": "रणनीतिक प्राथमिकता",
        "Discussion Question": "चर्चा का प्रश्न",
        "Security Advisory": "सुरक्षा सलाह",
        "Mitigation Plan": "शमन योजना",
        "Executive Board & Technical Engineers": "कार्यकारी बोर्ड और तकनीकी इंजीनियर",
        "Executive Leadership & Board of Directors": "कार्यकारी नेतृत्व और निदेशक मंडल",
        "Professional & Strategic": "पेशेवर और रणनीतिक",
        "Professional & Authoritative": "पेशेवर और आधिकारिक",
        "Mode 2: Source & Verify": "मोड 2: स्रोत और सत्यापन",
        "Mode 1: Source Only": "मोड 1: केवल स्रोत",
        "Mode 3: Deep Research": "मोड 3: गहन शोध",
        "RESTRICTED / EXECUTIVE TIER-1": "प्रतिबंधित / कार्यकारी टियर-1",
        "CONFIDENTIAL / AIR-GAPPED SANDBOX": "गोपनीय / पृथक सुरक्षित वातावरण",
        "MULTI-TIER INTELLIGENCE DOSSIER / 8-TIER": "बहु-स्तरीय खुफिया डोजियर",
        "100% PRIMARY DOCUMENT BOUND (ZERO EXTERNAL SEARCH)": "100% प्राथमिक दस्तावेज बाध्य (शून्य बाहरी खोज)",
        "100% VERIFIED SOURCE GROUNDED (TIER 1/2 CHECKED)": "100% सत्यापित स्रोत आधारित (टियर 1/2 जाँचा गया)",
        "EXECUTIVE BRIEFING & STRATEGIC DOSSIER": "कार्यकारी ब्रीफिंग और रणनीतिक डोजियर",
        "PAGE 1 OF 3: STRATEGIC CONTEXT & QUANTIFIED SCORECARD": "पृष्ठ 1 / 3: रणनीतिक संदर्भ और मात्रात्मक स्कोरकार्ड",
        "PAGE 2 OF 3: IN-DEPTH OPERATIONAL ANALYSIS & RISK MATRIX": "पृष्ठ 2 / 3: गहन परिचालन विश्लेषण और जोखिम मैट्रिक्स",
        "PAGE 3 OF 3: PHASED ACTION ROADMAP & GOVERNANCE DIRECTIVES": "पृष्ठ 3 / 3: चरणबद्ध कार्य रोडमैप और शासन निर्देश",
        "Document Classification": "दस्तावेज़ वर्गीकरण",
        "Target Audience": "लक्षित दर्शक",
        "Grounding Status": "स्रोत सत्यापन स्थिति",
        "Research Engine Mode": "शोध इंजन मोड",
        "Language": "भाषा",
        "Key Telemetry Metric": "प्रमुख मेट्रिक",
        "Measured / Extracted Value": "मापा गया / निकाला गया मान",
        "Operational Context": "परिचालन संदर्भ",
        "Verification Source": "सत्यापन स्रोत",
        "Entity / System / Stakeholder": "इकाई / प्रणाली / हितधारक",
        "Classification Type": "वर्गीकरण प्रकार",
        "Operational Role & Impact": "परिचालन भूमिका और प्रभाव",
        "Risk Factor & Exposure": "जोखिम कारक और प्रभाव",
        "Severity Level": "गंभीरता स्तर",
        "Potential Operational Impact": "संभावित परिचालन प्रभाव",
        "Mitigation Feasibility": "शमन व्यवहार्यता",
        "Reviewer Role": "समीक्षक की भूमिका",
        "Name & Title": "नाम और पद",
        "Approval Status": "स्वीकृति स्थिति",
        "Signature / Timestamp": "हस्ताक्षर / समय टिकट",
        "Executive Sponsor": "कार्यकारी प्रायोजक",
        "APPROVED FOR EXECUTION": "कार्यान्वयन के लिए स्वीकृत",
        "Lead Technical Analyst": "प्रमुख तकनीकी विश्लेषक",
        "VERIFIED FACTUAL GROUNDING": "सत्यापित तथ्यात्मक आधार",
        "Compliance Officer": "अनुपालन अधिकारी",
        "CONCURRENCE RECORDED": "सहमति दर्ज की गई",
        "Digitally Certified": "डिजिटल रूप से प्रमाणित",
    },
    "Spanish": {
        "Executive Summary": "Resumen Ejecutivo",
        "Strategic Briefing": "Informe Estratégico",
        "Key Findings": "Conclusiones Clave",
        "Quantified Telemetry": "Telemetría y Métricas Cuantitativas",
        "Operational Risks": "Riesgos Operativos",
        "Action Directives": "Directivas y Hoja de Ruta",
        "Recommendations": "Recomendaciones",
        "Conclusion": "Conclusión",
        "Slide": "Diapositiva",
        "Overview": "Descripción General",
        "Status": "Estado",
        "Verified": "Verificado",
        "High Priority": "Alta Prioridad",
        "Immediate Priority": "Prioridad Inmediata",
        "Executive Board & Technical Engineers": "Junta Directiva e Ingenieros Técnicos",
        "Mode 2: Source & Verify": "Modo 2: Fuente y Verificación",
        "Mode 1: Source Only": "Modo 1: Solo Fuente",
        "Mode 3: Deep Research": "Modo 3: Investigación Profunda",
        "Document Classification": "Clasificación del Documento",
        "Target Audience": "Público Objetivo",
        "Grounding Status": "Estado de Verificación",
        "Research Engine Mode": "Modo del Motor de Investigación",
        "Language": "Idioma",
    }
}

_GLOBAL_TRANSLATION_CACHE: Dict[Tuple[str, str], str] = {}

class MultilingualService:
    """
    Universal High-Fidelity Translation & Localization Engine.
    Translates arbitrary document contents, paragraphs, sentences, headings, tables,
    slides, tweets, video scenes, and blueprints into any requested target language.
    """

    @staticmethod
    def clean_language_name(lang: Optional[str]) -> str:
        if not lang or not isinstance(lang, str):
            return "English"
        cleaned = lang.strip().lower()
        return LANGUAGE_MAP.get(cleaned, lang.strip())

    @staticmethod
    def is_english(lang: Optional[str]) -> bool:
        normalized = MultilingualService.clean_language_name(lang)
        return normalized.lower() in ["english", "en"]

    @staticmethod
    def get_lang_code(target_language: str) -> str:
        norm_name = MultilingualService.clean_language_name(target_language)
        return LANGUAGE_CODE_MAP.get(norm_name, "en")

    @staticmethod
    async def fetch_translation_chunk(text_chunk: str, lang_code: str, client: Optional[httpx.AsyncClient] = None) -> str:
        """
        Translates a single text chunk with memory caching and multiple provider fallbacks.
        """
        cleaned = text_chunk.strip()
        if not cleaned or lang_code == "en":
            return text_chunk

        # Pure numbers, code symbols, or punctuation
        if re.match(r'^[\d\s\.,\-%/:#\*\|_`]+$', cleaned):
            return text_chunk

        cache_key = (cleaned, lang_code)
        if cache_key in _GLOBAL_TRANSLATION_CACHE:
            return _GLOBAL_TRANSLATION_CACHE[cache_key]

        # 1. Primary: Google Mobile Web Endpoint
        url = f"https://translate.google.com/m?sl=auto&tl={lang_code}&q={urllib.parse.quote(cleaned)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        }

        async def _do_req(c: httpx.AsyncClient) -> Optional[str]:
            try:
                resp = await c.get(url, headers=headers)
                if resp.status_code == 200:
                    m = re.search(r'class="result-container">([^<]+)<', resp.text)
                    if m:
                        tr_val = html.unescape(m.group(1)).strip()
                        if tr_val:
                            return tr_val
            except Exception:
                pass
            return None

        result_val = None
        if client:
            result_val = await _do_req(client)
        else:
            try:
                async with httpx.AsyncClient(timeout=8.0) as local_client:
                    result_val = await _do_req(local_client)
            except Exception:
                pass

        if result_val:
            _GLOBAL_TRANSLATION_CACHE[cache_key] = result_val
            return result_val

        # 2. Fallback to dictionary if available
        norm_lang_name = None
        for name, code in LANGUAGE_CODE_MAP.items():
            if code == lang_code:
                norm_lang_name = name
                break
        if norm_lang_name and norm_lang_name in OFFLINE_DICTIONARY:
            d = OFFLINE_DICTIONARY[norm_lang_name]
            if cleaned in d:
                _GLOBAL_TRANSLATION_CACHE[cache_key] = d[cleaned]
                return d[cleaned]

        return text_chunk

    @staticmethod
    async def translate_text(text: str, target_language: str, format_type: str = "general") -> str:
        """
        Translates full text or markdown completely into target_language while preserving
        markdown headers, tables, bullet points, numbers, and technical formatting.
        """
        norm_lang = MultilingualService.clean_language_name(target_language)
        if MultilingualService.is_english(norm_lang) or not text or not str(text).strip():
            return text

        lang_code = MultilingualService.get_lang_code(norm_lang)
        text_str = str(text)

        # 1. First, translate markdown paragraphs and tables concurrently
        paragraphs = text_str.split("\n\n")
        limits = httpx.Limits(max_keepalive_connections=20, max_connections=30)

        try:
            async with httpx.AsyncClient(timeout=10.0, limits=limits) as client:
                async def translate_paragraph(para: str) -> str:
                    lines = para.split("\n")
                    # Check if entire paragraph is a markdown table
                    if all(l.strip().startswith("|") and l.strip().endswith("|") for l in lines if l.strip()):
                        tr_lines = []
                        for l in lines:
                            stripped = l.strip()
                            if re.match(r'^\|[\s:\-\|]+\|$', stripped):
                                tr_lines.append(l)
                            else:
                                cells = stripped.split("|")[1:-1]
                                tr_cell_tasks = []
                                cell_meta = []
                                for cell in cells:
                                    c_str = cell.strip()
                                    is_bold = c_str.startswith("**") and c_str.endswith("**")
                                    is_code = c_str.startswith("`") and c_str.endswith("`")
                                    is_italic = c_str.startswith("*") and c_str.endswith("*") and not is_bold
                                    clean_c = c_str.strip("*` ")
                                    cell_meta.append((is_bold, is_code, is_italic, clean_c))
                                    if clean_c and re.search(r'[a-zA-Z]{2,}', clean_c):
                                        tr_cell_tasks.append(MultilingualService.fetch_translation_chunk(clean_c, lang_code, client))
                                    else:
                                        tr_cell_tasks.append(None)

                                cell_results = await asyncio.gather(*[t for t in tr_cell_tasks if t is not None])
                                res_iter = iter(cell_results)
                                row_cells = []
                                for is_bold, is_code, is_italic, clean_c in cell_meta:
                                    if clean_c:
                                        if re.search(r'[a-zA-Z]{2,}', clean_c):
                                            tr_c = next(res_iter)
                                        else:
                                            tr_c = clean_c
                                        if is_bold:
                                            tr_c = f"**{tr_c}**"
                                        elif is_code:
                                            tr_c = f"`{tr_c}`"
                                        elif is_italic:
                                            tr_c = f"*{tr_c}*"
                                        row_cells.append(f" {tr_c} ")
                                    else:
                                        row_cells.append(" ")
                                tr_lines.append("|" + "|".join(row_cells) + "|")
                        return "\n".join(tr_lines)

                    # Standard paragraphs, lists, and headings
                    tr_lines = []
                    for line in lines:
                        stripped = line.strip()
                        if not stripped or stripped in ["---", "***", "___"]:
                            tr_lines.append(line)
                            continue

                        # Header: #, ##, ###, ####
                        m_head = re.match(r'^(#{1,6}\s*)(.*)$', line)
                        if m_head:
                            prefix = m_head.group(1)
                            content = m_head.group(2)
                            if re.search(r'[a-zA-Z]{2,}', content):
                                tr_content = await MultilingualService.fetch_translation_chunk(content, lang_code, client)
                            else:
                                tr_content = content
                            tr_lines.append(f"{prefix}{tr_content}")
                            continue

                        # List items: - , * , • , 1. 
                        m_list = re.match(r'^(\s*(?:[-*•]|\d+[\.\)])\s+)(.*)$', line)
                        if m_list:
                            prefix = m_list.group(1)
                            content = m_list.group(2)
                            if re.search(r'[a-zA-Z]{2,}', content):
                                tr_content = await MultilingualService.fetch_translation_chunk(content, lang_code, client)
                            else:
                                tr_content = content
                            tr_lines.append(f"{prefix}{tr_content}")
                            continue

                        # Blockquote: > 
                        m_quote = re.match(r'^(\s*>\s*)(.*)$', line)
                        if m_quote:
                            prefix = m_quote.group(1)
                            content = m_quote.group(2)
                            if re.search(r'[a-zA-Z]{2,}', content):
                                tr_content = await MultilingualService.fetch_translation_chunk(content, lang_code, client)
                            else:
                                tr_content = content
                            tr_lines.append(f"{prefix}{tr_content}")
                            continue

                        # Normal line
                        if re.search(r'[a-zA-Z]{2,}', stripped):
                            tr_line = await MultilingualService.fetch_translation_chunk(stripped, lang_code, client)
                        else:
                            tr_line = stripped
                        tr_lines.append(tr_line)

                    return "\n".join(tr_lines)

                para_results = await asyncio.gather(*[translate_paragraph(p) for p in paragraphs])
                translated_md = "\n\n".join(para_results)
        except Exception:
            translated_md = text_str

        # 2. Refine standard enterprise titles, table headers, and badges via dictionary
        final_result = MultilingualService._offline_translate(translated_md, norm_lang)
        return final_result

    @staticmethod
    def _offline_translate(text: str, target_language: str) -> str:
        """
        Applies curated enterprise terms and template regexes to polish translated markdown.
        """
        norm_lang = MultilingualService.clean_language_name(target_language)
        if MultilingualService.is_english(norm_lang) or not text:
            return text

        result = MultilingualService._apply_template_patterns(text, norm_lang)

        dict_data = OFFLINE_DICTIONARY.get(norm_lang, {})
        if dict_data:
            sorted_phrases = sorted(dict_data.items(), key=lambda x: len(x[0]), reverse=True)
            for en_phrase, localized_phrase in sorted_phrases:
                if re.match(r'^[a-zA-Z0-9_\s]+$', en_phrase):
                    pattern = r'\b' + re.escape(en_phrase) + r'\b'
                else:
                    pattern = re.escape(en_phrase)
                result = re.sub(pattern, localized_phrase, result, flags=re.IGNORECASE)

        return result

    @staticmethod
    def _apply_template_patterns(text: str, target_language: str) -> str:
        if not text or not text.strip():
            return text

        result = text
        if target_language == "Kannada":
            # Title & Header Table
            result = re.sub(r'#\s*EXECUTIVE BRIEFING & STRATEGIC DOSSIER:\s*', '# ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಂಕ್ಷಿಪ್ತ ವರದಿ ಮತ್ತು ಕಾರ್ಯತಂತ್ರದ ದಾಖಲೆ: ', result, flags=re.IGNORECASE)
            result = re.sub(r'##\s*📄\s*PAGE 1 OF 3:\s*STRATEGIC CONTEXT & QUANTIFIED SCORECARD', '## 📄 ಪುಟ ೧ / ೩: ಕಾರ್ಯತಂತ್ರದ ಸನ್ನಿವೇಶ ಮತ್ತು ಪರಿಮಾಣಾತ್ಮಕ ಸ್ಕೋರ್‌ಕಾರ್ಡ್', result, flags=re.IGNORECASE)
            result = re.sub(r'##\s*📄\s*PAGE 2 OF 3:\s*IN-DEPTH OPERATIONAL ANALYSIS & RISK MATRIX', '## 📄 ಪುಟ ೨ / ೩: ಆಳವಾದ ಕಾರ್ಯಾಚರಣೆಯ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಅಪಾಯದ ಮ್ಯಾಟ್ರಿಕ್ಸ್', result, flags=re.IGNORECASE)
            result = re.sub(r'##\s*📄\s*PAGE 2 OF 3:\s*IN-DEPTH OPERATIONAL ANALYSIS, EVIDENCE & RISK MATRIX', '## 📄 ಪುಟ ೨ / ೩: ಆಳವಾದ ಕಾರ್ಯಾಚರಣೆಯ ವಿಶ್ಲೇಷಣೆ, ಸಾಕ್ಷ್ಯ ಮತ್ತು ಅಪಾಯದ ಮ್ಯಾಟ್ರಿಕ್ಸ್', result, flags=re.IGNORECASE)
            result = re.sub(r'##\s*📄\s*PAGE 3 OF 3:\s*PHASED ACTION ROADMAP & GOVERNANCE DIRECTIVES', '## 📄 ಪುಟ ೩ / ೩: ಹಂತ-ಹಂತದ ಕಾರ್ಯ ಮಾರ್ಗಸೂಚಿ ಮತ್ತು ಆಡಳಿತ ನಿರ್ದೇಶನಗಳು', result, flags=re.IGNORECASE)

            # Headings 1.x
            result = re.sub(r'###\s*1\.1\s*Strategic Executive Overview & Problem Statement', '### ೧.೧ ಕಾರ್ಯತಂತ್ರದ ಕಾರ್ಯನಿರ್ವಾಹಕ ಅವಲೋಕನ ಮತ್ತು ಸಮಸ್ಯೆ ವಿವರಣೆ', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*1\.2\s*Core Mission Objectives & Operational Scope', '### ೧.೨ ಪ್ರಮುಖ ಧ್ಯೇಯೋದ್ದೇಶಗಳು ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಯ ವ್ಯಾಪ್ತಿ', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*1\.3\s*High-Impact Quantified Telemetry Scorecard', '### ೧.೩ ಉನ್ನತ-ಪರಿಣಾಮದ ಪರಿಮಾಣಾತ್ಮಕ ಅಂಕಿಅಂಶಗಳ ಸ್ಕೋರ್‌ಕಾರ್ಡ್', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*1\.4\s*Primary Strategic Key Messages', '### ೧.೪ ಪ್ರಾಥಮಿಕ ಕಾರ್ಯತಂತ್ರದ ಪ್ರಮುಖ ಸಂದೇಶಗಳು', result, flags=re.IGNORECASE)

            # Headings 2.x
            result = re.sub(r'###\s*2\.1\s*Chronological Milestones & Event Trajectory', '### ೨.೧ ಕಾಲಾನುಕ್ರಮದ ಮೈಲಿಗಲ್ಲುಗಳು ಮತ್ತು ಘಟನಾ ಹಾದಿ', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*2\.2\s*Deep-Dive Breakdown of Verified Evidence Base', '### ೨.೨ ಪರಿಶೀಲಿಸಿದ ಪುರಾವೆಗಳ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*2\.[34]\s*Key Entity & Systems Impact Mapping', '### ೨.೩ ಪ್ರಮುಖ ಘಟಕಗಳು ಮತ್ತು ವ್ಯವಸ್ಥೆಗಳ ಪರಿಣಾಮ ಮ್ಯಾಪಿಂಗ್', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*2\.[45]\s*Enterprise Risk & Vulnerability Matrix', '### ೨.೪ ಉದ್ಯಮದ ಅಪಾಯ ಮತ್ತು ದುರ್ಬಲತೆಯ ಮ್ಯಾಟ್ರಿಕ್ಸ್', result, flags=re.IGNORECASE)

            # Headings 3.x
            result = re.sub(r'###\s*3\.1\s*Phased Implementation Roadmap', '### ೩.೧ ಹಂತ-ಹಂತದ ಅನುಷ್ಠಾನ ಮಾರ್ಗಸೂಚಿ', result, flags=re.IGNORECASE)
            result = re.sub(r'####\s*🚀\s*Phase 1:\s*Immediate Execution & Tactical Containment\s*\(Days 0–30\)', '#### 🚀 ಹಂತ ೧: ತಕ್ಷಣದ ಕಾರ್ಯಗತಗೊಳಿಸುವಿಕೆ ಮತ್ತು ನಿಯಂತ್ರಣ (ದಿನಗಳು ೦–೩೦)', result, flags=re.IGNORECASE)
            result = re.sub(r'####\s*🛠️\s*Phase 2:\s*Systematic Remediation & Process Hardening\s*\(Days 30–90\)', '#### 🛠️ ಹಂತ ೨: ವ್ಯವಸ್ಥಿತ ಪರಿಹಾರ ಮತ್ತು ಪ್ರಕ್ರಿಯೆ ಬಲಪಡಿಸುವಿಕೆ (ದಿನಗಳು ೩೦–೯೦)', result, flags=re.IGNORECASE)
            result = re.sub(r'####\s*🏛️\s*Phase 3:\s*Long-Term Enterprise Resilience & Scalability\s*\(Days 90\+\)', '#### 🏛️ ಹಂತ ೩: ದೀರ್ಘಾವಧಿಯ ಉದ್ಯಮ ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವ ಮತ್ತು ವಿಸ್ತರಣೆ (ದಿನಗಳು ೯೦+)', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*3\.2\s*Human-in-the-Loop Governance & Compliance Directives', '### ೩.೨ ಮಾನವ-ಮೇಲ್ವಿಚಾರಣಾ ಆಡಳಿತ ಮತ್ತು ಅನುಸರಣಾ ನಿರ್ದೇಶನಗಳು', result, flags=re.IGNORECASE)
            result = re.sub(r'###\s*3\.3\s*Executive Sign-Off & Authority Ledger', '### ೩.೩ ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಹಿ ಮತ್ತು ಅಧಿಕಾರ ದಾಖಲೆ', result, flags=re.IGNORECASE)

            # Topic tags
            result = re.sub(r'\bTopic Focus:\s*', 'ವಿಷಯ ಗಮನ: ', result, flags=re.IGNORECASE)
            result = re.sub(r'\bTopic:\s*', 'ವಿಷಯ: ', result, flags=re.IGNORECASE)

            # Advisory & Deliverable patterns
            result = re.sub(r'#\s*OPERATIONAL & TECHNICAL ADVISORY', '# ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ತಾಂತ್ರಿಕ ಭದ್ರತಾ ಸಲಹೆ', result, flags=re.IGNORECASE)
            result = re.sub(r'#\s*PRESENTATION DECK.*?:\s*', '# ಪ್ರಸ್ತುತಿ ಡೆಕ್: ', result, flags=re.IGNORECASE)
            result = re.sub(r'#\s*INFOGRAPHIC VISUAL BLUEPRINT.*?:\s*', '# ಇನ್ಫೋಗ್ರಾಫಿಕ್ ದೃಶ್ಯ ಬ್ಲೂಪ್ರಿಂಟ್: ', result, flags=re.IGNORECASE)
            result = re.sub(r'#\s*VIDEO STORYBOARD & SCRIPT.*?:\s*', '# ವೀಡಿಯೊ ಸ್ಟೋರಿಬೋರ್ಡ್ ಮತ್ತು ಸ್ಕ್ರಿಪ್ಟ್: ', result, flags=re.IGNORECASE)

            def slide_repl(m):
                num = m.group(1).strip()
                s_title = m.group(2).strip()
                return f"## ಸ್ಲೈಡ್ {num}: {s_title}"
            result = re.sub(r'##\s*Slide\s*(\d+):\s*(.+)', slide_repl, result, flags=re.IGNORECASE)

            def sc_repl(m):
                num = m.group(1).strip()
                dur = m.group(2).strip()
                return f"### ದೃಶ್ಯ {num} ({dur} ಸೆಕೆಂಡು)"
            result = re.sub(r'###\s*SCENE\s*(\d+)\s*\(([\d]+)s\)', sc_repl, result, flags=re.IGNORECASE)

        elif target_language == "Hindi":
            result = re.sub(r'#\s*EXECUTIVE BRIEFING & STRATEGIC DOSSIER:\s*', '# कार्यकारी ब्रीफिंग और रणनीतिक डोजियर: ', result, flags=re.IGNORECASE)
            result = re.sub(r'##\s*📄\s*PAGE 1 OF 3:\s*STRATEGIC CONTEXT & QUANTIFIED SCORECARD', '## 📄 पृष्ठ 1 / 3: रणनीतिक संदर्भ और मात्रात्मक स्कोरकार्ड', result, flags=re.IGNORECASE)
            result = re.sub(r'##\s*📄\s*PAGE 2 OF 3:\s*IN-DEPTH OPERATIONAL ANALYSIS & RISK MATRIX', '## 📄 पृष्ठ 2 / 3: गहन परिचालन विश्लेषण और जोखिम मैट्रिक्स', result, flags=re.IGNORECASE)
            result = re.sub(r'##\s*📄\s*PAGE 3 OF 3:\s*PHASED ACTION ROADMAP & GOVERNANCE DIRECTIVES', '## 📄 पृष्ठ 3 / 3: चरणबद्ध कार्य रोडमैप और शासन निर्देश', result, flags=re.IGNORECASE)

        return result

    @staticmethod
    async def translate_structured_data(structured_data: Dict[str, Any], target_language: str, format_type: str) -> Dict[str, Any]:
        """
        Translates all human-readable fields of structured data payloads (slides, tweets, video scenes, etc.)
        comprehensively and concurrently into target_language.
        """
        norm_lang = MultilingualService.clean_language_name(target_language)
        if MultilingualService.is_english(norm_lang) or not structured_data:
            return structured_data

        copied_data = json.loads(json.dumps(structured_data))
        copied_data["language"] = norm_lang
        lang_code = MultilingualService.get_lang_code(norm_lang)

        # Collect all translatable string references across the structure
        extract_tasks: List[Tuple[Callable[[str], None], str]] = []

        # Slide Deck
        if "slides" in copied_data and isinstance(copied_data["slides"], list):
            if copied_data.get("deck_title"):
                def set_dt(val): copied_data["deck_title"] = val
                extract_tasks.append((set_dt, str(copied_data["deck_title"])))
            for s in copied_data["slides"]:
                if s.get("title"):
                    def set_st(val, sl=s): sl["title"] = val
                    extract_tasks.append((set_st, str(s["title"])))
                if s.get("subtitle"):
                    def set_sub(val, sl=s): sl["subtitle"] = val
                    extract_tasks.append((set_sub, str(s["subtitle"])))
                if s.get("speaker_notes"):
                    def set_sn(val, sl=s): sl["speaker_notes"] = val
                    extract_tasks.append((set_sn, str(s["speaker_notes"])))
                if "bullets" in s and isinstance(s["bullets"], list):
                    for b_idx in range(len(s["bullets"])):
                        def set_sb(val, sl=s, bi=b_idx): sl["bullets"][bi] = val
                        extract_tasks.append((set_sb, str(s["bullets"][b_idx])))

        # Twitter Thread
        if "tweets" in copied_data and isinstance(copied_data["tweets"], list):
            for t_idx, t in enumerate(copied_data["tweets"]):
                if isinstance(t, dict):
                    t_text = t.get("text", "")
                    def set_tw_d(val, tw=t): tw["text"] = val
                    extract_tasks.append((set_tw_d, str(t_text)))
                elif isinstance(t, str):
                    def set_tw_s(val, ti=t_idx): copied_data["tweets"][ti] = val
                    extract_tasks.append((set_tw_s, str(t)))

        # Video Package
        if "scenes" in copied_data and isinstance(copied_data["scenes"], list):
            if copied_data.get("title"):
                def set_vt(val): copied_data["title"] = val
                extract_tasks.append((set_vt, str(copied_data["title"])))
            for sc in copied_data["scenes"]:
                for key in ["title", "visual_prompt", "visual_description", "narration", "narration_text", "on_screen_text", "subtitle"]:
                    if sc.get(key):
                        def set_sc_field(val, sc_ref=sc, k=key): sc_ref[k] = val
                        extract_tasks.append((set_sc_field, str(sc[key])))

        # LinkedIn Post Metadata
        if format_type == "linkedin":
            if copied_data.get("hook"):
                def set_hook(val): copied_data["hook"] = val
                extract_tasks.append((set_hook, str(copied_data["hook"])))
            if copied_data.get("call_to_action"):
                def set_cta(val): copied_data["call_to_action"] = val
                extract_tasks.append((set_cta, str(copied_data["call_to_action"])))

        # Infographic Datapoints
        if "datapoints" in copied_data and isinstance(copied_data["datapoints"], list):
            for dp in copied_data["datapoints"]:
                if dp.get("label"):
                    def set_dpl(val, dpref=dp): dpref["label"] = val
                    extract_tasks.append((set_dpl, str(dp["label"])))
                if dp.get("description"):
                    def set_dpd(val, dpref=dp): dpref["description"] = val
                    extract_tasks.append((set_dpd, str(dp["description"])))

        # Executive Summary sections
        if "sections" in copied_data and isinstance(copied_data["sections"], list):
            for s_idx in range(len(copied_data["sections"])):
                def set_sec(val, si=s_idx): copied_data["sections"][si] = val
                extract_tasks.append((set_sec, str(copied_data["sections"][s_idx])))

        if not extract_tasks:
            return copied_data

        # Concurrently translate all extracted string fields in a single pooled session
        limits = httpx.Limits(max_keepalive_connections=20, max_connections=30)
        try:
            async with httpx.AsyncClient(timeout=10.0, limits=limits) as client:
                async def _tr_one(setter, orig_str):
                    if re.search(r'[a-zA-Z]{2,}', orig_str):
                        tr_val = await MultilingualService.fetch_translation_chunk(orig_str, lang_code, client)
                    else:
                        tr_val = orig_str
                    # Refine via offline dictionary
                    refined = MultilingualService._offline_translate(tr_val, norm_lang)
                    setter(refined)

                await asyncio.gather(*[_tr_one(setter, orig_s) for setter, orig_s in extract_tasks])
        except Exception:
            pass

        return copied_data

    @staticmethod
    async def localize_artefact(result: Dict[str, Any], target_language: str, format_type: str = "general") -> Dict[str, Any]:
        """
        Master localization method for an artefact dictionary (title, raw_content, structured_data).
        Translates every single sentence, heading, table, bullet, and structured field into target_language.
        """
        norm_lang = MultilingualService.clean_language_name(target_language)
        if MultilingualService.is_english(norm_lang):
            return result

        title = result.get("title", "")
        raw_content = result.get("raw_content", "")
        structured_data = result.get("structured_data", {})

        # Concurrently localize title, content, and structured data
        t_title_task = MultilingualService.translate_text(title, norm_lang, format_type)
        t_content_task = MultilingualService.translate_text(raw_content, norm_lang, format_type)
        t_struct_task = MultilingualService.translate_structured_data(structured_data, norm_lang, format_type)

        translated_title, translated_content, translated_structured = await asyncio.gather(
            t_title_task, t_content_task, t_struct_task
        )

        return {
            "title": translated_title,
            "raw_content": translated_content,
            "structured_data": translated_structured
        }
