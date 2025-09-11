import json
import sys

def build_geography_dataset():
    """
    Builds geography dataset in NDJSON format.
    Outputs State → District → AC → Block → GP → Village hierarchies.
    Integrates with real data source (placeholder for government API).
    """
    # Placeholder for real data source integration
    # In production, fetch from government API like https://api.data.gov.in or local database
    import requests  # Placeholder import

    try:
        # Example: Fetch from a government API (replace with actual endpoint)
        response = requests.get("https://api.example.gov.in/geography/chhattisgarh")
        if response.status_code == 200:
            data = response.json()
        else:
            # Fallback to mock data if API fails
            data = {
                "state": "छत्तीसगढ़",
                "districts": [
                    {
                        "name": "रायगढ़",
                        "acs": [
                            {
                                "name": "रायगढ़",
                                "blocks": [
                                    {
                                        "name": "रायगढ़",
                                        "gps": [
                                            {
                                                "name": "रायगढ़",
                                                "villages": [
                                                    {"name": "रायगढ़", "pincode": "496001"},
                                                    {"name": "खरसिया", "pincode": "496001"}
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
    except Exception as e:
        # Fallback to mock data on error
        print(f"Error fetching real data: {e}")
        data = {
            "state": "छत्तीसगढ़",
            "districts": [
                {
                    "name": "रायगढ़",
                    "acs": [
                        {
                            "name": "रायगढ़",
                            "blocks": [
                                {
                                    "name": "रायगढ़",
                                    "gps": [
                                        {
                                            "name": "रायगढ़",
                                            "villages": [
                                                {"name": "रायगढ़", "pincode": "496001"},
                                                {"name": "खरसिया", "pincode": "496001"}
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }

    # Generate NDJSON
    yield json.dumps(data, ensure_ascii=False)

if __name__ == "__main__":
    for line in build_geography_dataset():
        print(line)
