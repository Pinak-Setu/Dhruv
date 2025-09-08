import json
import random

def generate_hindi_synthetic_tweets():
    """Generates 5000 synthetic tweets in Hindi/Devanagari."""

    # --- Data for Generation (in Devanagari) ---
    locations = [
        "रायपुर", "बिलासपुर", "दुर्ग", "भिलाई", "कोरबा", "रायगढ़", "राजनांदगांव",
        "जगदलपुर", "अंबिकापुर", "चिरमिरी", "भाटापारा", "धमतरी", "महासमुंद",
        "कांकेर", "जशपुर", "बस्तर", "सरगुजा", "नया रायपुर", "कवर्धा", "जांजगीर"
    ]

    themes = {
        "infra": {
            "templates": [
                "आज {location} में चल रहे रिंग रोड के निर्माण का निरीक्षण किया। #विकास",
                "नए {location} इको पार्क का उद्घाटन किया गया, जो जनता के लिए एक उपहार है। #छत्तीसगढ़",
                "{location} में नए स्कूल भवन की आधारशिला रखी। #शिक्षा #इंफ्रा"
            ],
            "keywords": ["सड़क", "पुल", "स्कूल", "अस्पताल", "पार्क"]
        },
        "politics": {
            "templates": [
                "{location} में पार्टी कार्यकर्ताओं की बैठक में शामिल हुआ। आगामी चुनावों की रणनीति पर चर्चा हुई। @BJP4CGState",
                "{location} में एक विशाल जनसभा को संबोधित किया। भीड़ की ऊर्जा अद्भुत थी! #जनसेवा",
                "नए जीएसटी सुधारों पर चर्चा के लिए वित्त मंत्री से मुलाकात की। #GST #अर्थव्यवस्था"
            ],
            "keywords": ["बैठक", "रैली", "चुनाव", "GST", "नीति"]
        },
        "culture": {
            "templates": [
                "{location} का चक्रधर समारोह बहुत सफल रहा। #संस्कृति #कला",
                "{location} के लोगों के साथ होली का त्योहार मनाकर खुशी हुई।",
                "आज {location} में एक नई कला प्रदर्शनी का उद्घाटन किया। #परंपरा"
            ],
            "keywords": ["त्योहार", "समारोह", "प्रदर्शनी", "संस्कृति"]
        },
        "social": {
            "templates": [
                "{location} में महतारी वंदन योजना के तहत सहायता वितरित की। #महिलासशक्तिकरण",
                "{location} में एक स्वास्थ्य शिविर का दौरा किया। #सबकेलिएस्वास्थ्य",
                "हमारी नई होम स्टे नीति {location} जैसे क्षेत्रों में पर्यटन और रोजगार को बढ़ावा देगी। #पर्यटन"
            ],
            "keywords": ["योजना", "स्वास्थ्य", "शिक्षा", "महिला", "रोजगार"]
        }
    }

    variants = {
        "रोजगार": ["रोजगार", "रोज़गार"], # With and without nukta
        "विकास": ["विकास", "विकास"],
        "स्वच्छता": ["स्वच्छता", "स्वछता"], # Common typo
        "समारोह": ["समारोह", "समारो"]
    }

    # --- Messiness Functions ---
    def add_devanagari_typo(text):
        if len(text) < 5: return text
        pos = random.randint(1, len(text) - 2)
        # Replace a character with a nearby Devanagari character
        char_code = ord(text[pos])
        if 0x0900 < char_code < 0x097F: # Devanagari block
            new_char_code = char_code + random.choice([-1, 1])
            text = text[:pos] + chr(new_char_code) + text[pos+1:]
        return text

    def mix_hinglish(text):
        words = text.split()
        if not words or len(words) < 3: return text
        pos = random.randint(0, len(words) - 1)
        # Replace a common Hindi word with an English one
        if "बैठक" in text: words[pos] = "meeting"
        elif "विकास" in text: words[pos] = "development"
        elif "स्कूल" in text: words[pos] = "school"
        return " ".join(words)

    def remove_punctuation(text):
        return text.replace(".", "").replace(",", "")

    messiness_injectors = [add_devanagari_typo, mix_hinglish, remove_punctuation]

    # --- Generation Loop ---
    generated_tweets = []
    for i in range(5000):
        theme_key = random.choice(list(themes.keys()))
        theme = themes[theme_key]
        location = random.choice(locations)
        
        template = random.choice(theme["templates"])
        content = template.format(location=location)

        # Apply variants
        for word, var_list in variants.items():
            if word in content:
                content = content.replace(word, random.choice(var_list))

        # Apply messiness
        if random.random() < 0.5: # 50% chance of being messy
            injector = random.choice(messiness_injectors)
            content = injector(content)

        tweet = {
            "id": f"synthetic_hindi_{i+1}",
            "timestamp": f"2024-01-{random.randint(1,28):02d}T10:00:00Z",
            "content": content,
            "user": "OPChoudhary_Ind",
            "source": "synthetic"
        }
        generated_tweets.append(tweet)

    # --- Save to File ---
    output_path = "temp_data/opc_tweets_5000_hindi.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(generated_tweets, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully generated 5000 Hindi synthetic tweets and saved to {output_path}")

if __name__ == "__main__":
    generate_hindi_synthetic_tweets()
