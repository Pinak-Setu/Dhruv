# api/src/parsing/prompts.py

# Prompts for the LangExtract model
# These are designed to extract specific entities from X posts.

# A generic prompt structure that can be adapted
BASE_PROMPT_TEMPLATE = """
Extract the specified information from the following text.

Text: "{text}"

Information to extract: {entity_name}
"""

# Specific prompts for different entities
EXTRACTION_PROMPTS = {
    "theme": {
        "prompt": BASE_PROMPT_TEMPLATE.format(
            text="{text}", 
            entity_name="The main theme or topic. Examples: 'महिला सशक्तिकरण', 'विकास कार्य', 'स्वास्थ्य', 'राजनीति'."
        ),
        "examples": [
            {"text": "आज रायगढ़ में विकास कार्यों की समीक्षा की। #विकास", "answer": "विकास कार्य"},
            {"text": "महिला स्व-सहायता समूहों से संवाद।", "answer": "महिला सशक्तिकरण"},
        ]
    },
    "sentiment": {
        "prompt": BASE_PROMPT_TEMPLATE.format(
            text="{text}",
            entity_name="The sentiment of the text. Choose from: 'positive', 'negative', 'neutral'."
        ),
        "examples": [
            {"text": "प्रदेशवासियों की सुख-समृद्धि की प्रार्थना।", "answer": "positive"},
            {"text": "दर्दनाक हादसे में तीन लोगों की मृत्यु...", "answer": "negative"},
        ]
    },
    "location": {
        "prompt": BASE_PROMPT_TEMPLATE.format(
            text="{text}",
            entity_name="The primary location mentioned. Example: 'रायपुर', 'दिल्ली'."
        ),
        "examples": [
            {"text": "आज रायगढ़ में विकास कार्यों की समीक्षा की।", "answer": "रायगढ़"},
            {"text": "दिल्ली में बैठक में सम्मिलित हुआ।", "answer": "दिल्ली"},
        ]
    }
}