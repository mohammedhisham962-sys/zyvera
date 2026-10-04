import os
import re

filepath = "index_backup.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    idx = content.find("function switchPanel")
    if idx != -1:
        print("=== switchPanel ===")
        print(content[idx:idx+1500])
    else:
        # Search case-insensitive
        matches = re.finditer(r'switchPanel', content, re.IGNORECASE)
        print("Matches for switchPanel:")
        for m in matches:
            start = max(0, m.start() - 100)
            end = min(len(content), m.end() + 200)
            print(content[start:end])
            print("-" * 50)
else:
    print(f"File {filepath} not found.")
