

import os
import json
import hashlib
import time
from datetime import datetime, timedelta
from .dataset_builders.geography_builder import build_geography_dataset
from .dataset_builders.festival_builder import build_festival_dataset
from .dataset_builders.poi_builder import build_poi_dataset

# Placeholder for database connection (e.g., psycopg2 for Postgres)
# import psycopg2

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data')
CHECKSUM_FILE = os.path.join(DATA_DIR, 'dataset_checksums.json')

def compute_checksum(data: str) -> str:
    """Compute SHA256 checksum for data integrity."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def load_checksums() -> dict:
    """Load previous checksums from file."""
    if os.path.exists(CHECKSUM_FILE):
        with open(CHECKSUM_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_checksums(checksums: dict):
    """Save checksums to file."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(CHECKSUM_FILE, 'w', encoding='utf-8') as f:
        json.dump(checksums, f, indent=2)

def run_etl_for_builder(builder_func, dataset_name: str):
    """Run ETL for a specific dataset builder."""
    print(f"Running ETL for {dataset_name}...")

    # Collect data
    data_lines = list(builder_func())
    data = '\n'.join(data_lines)

    # Compute checksum
    checksum = compute_checksum(data)

    # Load previous checksums
    checksums = load_checksums()

    # Check if data has changed
    if checksums.get(dataset_name) == checksum:
        print(f"No changes for {dataset_name}, skipping update.")
        return

    # Placeholder: Insert into Postgres dims
    # conn = psycopg2.connect(...)
    # cursor = conn.cursor()
    # for line in data_lines:
    #     record = json.loads(line)
    #     # Insert logic here (e.g., INSERT INTO dim_geography ...)
    # cursor.close()
    # conn.close()

    print(f"Updated {dataset_name} with {len(data_lines)} records.")

    # Update checksum
    checksums[dataset_name] = checksum
    save_checksums(checksums)

def run_monthly_etl():
    """Run monthly ETL for all dataset builders."""
    print("Starting monthly ETL pipeline...")

    # Check if it's time for monthly refresh (placeholder logic)
    # In production, use a scheduler like cron or Airflow
    last_run_file = os.path.join(DATA_DIR, 'last_etl_run.txt')
    now = datetime.now()

    if os.path.exists(last_run_file):
        with open(last_run_file, 'r') as f:
            last_run_str = f.read().strip()
            last_run = datetime.fromisoformat(last_run_str)
            if now - last_run < timedelta(days=30):
                print("Monthly ETL not due yet.")
                return

    # Run ETL for each builder
    run_etl_for_builder(build_geography_dataset, 'geography')
    run_etl_for_builder(build_festival_dataset, 'festival')
    run_etl_for_builder(build_poi_dataset, 'poi')

    # Update last run
    with open(last_run_file, 'w') as f:
        f.write(now.isoformat())

    print("Monthly ETL completed.")

if __name__ == "__main__":
    run_monthly_etl()
