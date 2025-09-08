prompts = {
    "location": """
Extract locations from the following Hindi text, with character offsets.

Example 1: "आज रायगढ़ में विकास कार्यों की समीक्षा की। #विकास"
Output: {"locations": [{"text": "रायगढ़", "start": 4, "end": 11}]}

Example 2: "दिल्ली में बैठक में सम्मिलित हुआ। @PMOIndia"
Output: {"locations": [{"text": "दिल्ली", "start": 0, "end": 6}]}

Text: {text}
""",
    "theme": """
Extract themes or purposes from the following Hindi text, inferring implicit elements like "माताओं-बहनों को" implies "महिला सशक्तिकरण".

Example 1: "आज रायगढ़ में विकास कार्यों की समीक्षा की। #विकास"
Output: {"themes": ["विकास"], "purpose": "review"}

Example 2: "महतारी वंदन योजना के लाभार्थियों को सलाम।"
Output: {"themes": ["महिला सशक्तिकरण"], "purpose": "promote welfare"}

Text: {text}
""",
    "tags_activities": """
Extract hashtags (@mentions) and activities from the Hindi text, with offsets.

Example 1: "दिल्ली में बैठक में सम्मिलित हुआ। @PMOIndia"
Output: {"tags": [{"text": "@PMOIndia", "start": 25, "end": 35}], "activities": ["बैठक"]}

Example 2: "कृषि शोध केंद्र का दौरा। #कृषि"
Output: {"tags": [{"text": "#कृषि", "start": 20, "end": 26}], "activities": ["दौरा"]}

Text: {text}
""",
    "sentiment": """
Classify sentiment of the Hindi text: positive, negative, neutral.

Example 1: "आज रायगढ़ में विकास कार्यों की समीक्षा की। #विकास"
Output: {"sentiment": "neutral"}

Example 2: "स्वच्छता अभियान में भाग लिया। #स्वच्छता"
Output: {"sentiment": "positive"}

Text: {text}
""",
    "purpose": """
Determine the purpose of the post: e.g., "promote", "condolence", "meet", "announce".

Example 1: "राष्ट्रीय स्वयं सेवक संघ के देवलोक गमन का समाचार अत्यंत दुःखद है। @RSSorg"
Output: {"purpose": "condolence"}

Example 2: "नवोन्मेष प्रदर्शनी का उद्घाटन।"
Output: {"purpose": "announce"}

Text: {text}
""",
    "schemes_events": """
Extract government schemes and events, inferring names.

Example 1: "जनकल्याण योजनाओं की समीक्षा।"
Output: {"schemes": ["जनकल्याण योजना"], "events": []}

Example 2: "चक्रधर समारोह के प्रस्तुतियों की झलकियां 📍 रामलीला मैदान, रायगढ़"
Output: {"schemes": [], "events": ["चक्रधर समारोह"]}

Text: {text}
"""
}
