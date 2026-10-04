import os
import re

filepath = "scratch/script_0.js"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    matches = re.finditer(r'gemini', content, re.IGNORECASE)
    print("Matches in scratch/script_0.js:")
    for m in matches:
        start = max(0, m.start() - 100)
        end = min(len(content), m.end() + 200)
        print(f"[{m.start()}]: {content[start:end]}")
        print("-" * 50)
else:
    print(f"File {filepath} not found.")
