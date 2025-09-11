import json
import sys

def build_geography_dataset():
    """
    Builds geography dataset in NDJSON format.
    Outputs State → District → AC → Block → GP → Village hierarchies.
    """
    # Mock data for Chhattisgarh (can be replaced with real data source)
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
