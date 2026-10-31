#!/usr/bin/env python3
"""
Moodle Submission Packaging Script for Practical No. 6
Student: Ayush (PRN: 2304362)
Generates: 2304362_Ayush_P6_StudentAPI.zip (strictly excluding node_modules and .env)
"""

import os
import zipfile

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
ZIP_FILENAME = "2304362_Ayush_P6_StudentAPI.zip"
ZIP_PATH = os.path.join(PROJECT_DIR, ZIP_FILENAME)

EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    '.vscode',
    '__pycache__'
}

EXCLUDE_FILES = {
    '.env',
    '.env.local',
    ZIP_FILENAME,
    '.DS_Store',
    'Thumbs.db'
}

def create_zip():
    print(f"Creating submission archive: {ZIP_FILENAME}")
    file_count = 0

    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(PROJECT_DIR):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if file in EXCLUDE_FILES or file.endswith('.zip'):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, PROJECT_DIR)

                zipf.write(full_path, rel_path)
                file_count += 1
                print(f"  + Added: {rel_path}")

    size_kb = os.path.getsize(ZIP_PATH) / 1024
    print("\n" + "=" * 60)
    print(f"Archive Created Successfully: {ZIP_FILENAME}")
    print(f"Total Files Packed: {file_count}")
    print(f"Archive File Size: {size_kb:.2f} KB")
    print("=" * 60)

if __name__ == "__main__":
    create_zip()
