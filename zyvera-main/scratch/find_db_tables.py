import os
import re

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # find CREATE TABLE
    matches = re.finditer(r'CREATE TABLE IF NOT EXISTS \w+ \([^)]+\)', content, re.DOTALL | re.IGNORECASE)
    print("Matches:")
    for m in matches:
        print(m.group(0))
        print("-" * 50)
else:
    print(f"File {filepath} not found.")
