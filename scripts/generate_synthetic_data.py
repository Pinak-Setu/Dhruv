import json
import random

def generate_synthetic_tweets():
    """Generates 5000 synthetic tweets based on specified requirements."""

    # --- Data for Generation ---
    locations = [
        "Raipur", "Bilaspur", "Durg", "Bhilai", "Korba", "Raigarh", "Rajnandgaon",
        "Jagdalpur", "Ambikapur", "Chirmiri", "Bhatapara", "Dhamtari", "Mahasamund",
        "Kanker", "Jashpur", "Bastar", "Surguja", "Naya Raipur", "Kawardha", "Janjgir"
    ]

    themes = {
        "infra": {
            "templates": [
                "Today, inspected the ongoing construction of the {location} ring road. #vikas",
                "The new {location} Eco Park was inaugurated, a gift to the people. #development",
                "Foundation stone laid for the new school building in {location}. #education #infra"
            ],
            "keywords": ["road", "bridge", "school", "hospital", "park"]
        },
        "politics": {
            "templates": [
                "Attended a party workers meeting in {location}. Discussed strategy for upcoming elections. @BJP4CGState",
                "Addressed a large public rally in {location}. The energy of the crowd was amazing! #jantaseva",
                "Met with the Finance Minister to discuss the new GST reforms. #GST #economy"
            ],
            "keywords": ["meeting", "rally", "election", "GST", "policy"]
        },
        "culture": {
            "templates": [
                "The {location} Chakradhar Samaroh was a huge success. #culture #art",
                "Happy to celebrate the festival of Holi with the people of {location}.",
                "Inaugurated a new art exhibition in {location} today. #tradition"
            ],
            "keywords": ["festival", "samaroh", "exhibition", "culture"]
        },
        "social": {
            "templates": [
                "Distributed aid under the Mahtari Vandan Yojana in {location}. #womensupport",
                "Visited a health camp in {location}. #healthforall",
                "Our new Homestay Policy will boost tourism and jobs in regions like {location}. #tourism"
            ],
            "keywords": ["yojana", "health", "education", "women", "jobs"]
        }
    }

    variants = {
        "rozgar": ["rojgar", "rojgaar"],
        "vikas": ["vikaas", "development"],
        "swachhata": ["swachhta", "swachata", "cleanliness"],
        "samaroh": ["samaroh", "smaroh"]
    }

    # --- Messiness Functions ---
    def add_typo(text):
        if len(text) < 5: return text
        pos = random.randint(1, len(text) - 2)
        char = chr(random.randint(97, 122)) # random lowercase letter
        return text[:pos] + char + text[pos+1:]

    def mix_hinglish(text):
        words = text.split()
        if not words: return text
        pos = random.randint(0, len(words) - 1)
        # Simple replacement of a common Hindi word with an English one
        if "meeting" in themes["politics"]["keywords"]: words[pos] = "meeting"
        elif "development" in themes["infra"]["keywords"]: words[pos] = "development"
        return " ".join(words)

    def remove_punctuation(text):
        return text.replace(".", "").replace(",", "")

    messiness_injectors = [add_typo, mix_hinglish, remove_punctuation]

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
            "id": f"synthetic_{i+1}",
            "timestamp": f"2024-01-{random.randint(1,28):02d}T10:00:00Z",
            "content": content,
            "user": "OPChoudhary_Ind",
            "source": "synthetic"
        }
        generated_tweets.append(tweet)

    # --- Save to File ---
    output_path = "temp_data/opc_tweets_5000.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(generated_tweets, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully generated 5000 synthetic tweets and saved to {output_path}")

if __name__ == "__main__":
    generate_synthetic_tweets()
