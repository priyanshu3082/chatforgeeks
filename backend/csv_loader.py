import os
import uuid
import shutil
from pathlib import Path
from database import load_csv_to_db

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def process_csv_upload(file_content: bytes, original_filename: str) -> dict:
    """Save uploaded CSV and load it into the database."""
    # Generate a safe table name from filename
    stem = Path(original_filename).stem
    table_name = "".join(c if c.isalnum() else "_" for c in stem).lower()[:50]
    if not table_name or table_name[0].isdigit():
        table_name = f"table_{table_name}"

    # Save file temporarily
    temp_path = UPLOAD_DIR / f"{uuid.uuid4()}_{original_filename}"
    temp_path.write_bytes(file_content)

    try:
        result = load_csv_to_db(str(temp_path), table_name)
    finally:
        if temp_path.exists():
            temp_path.unlink()

    return result
