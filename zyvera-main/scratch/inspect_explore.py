import os
import re

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Let's find matches of "explore" or "hubs" with some surrounding text
    matches = re.finditer(r'explore', content, re.IGNORECASE)
    print("Matches for 'explore':")
    for m in matches:
        start = max(0, m.start() - 100)
        end = min(len(content), m.end() + 100)
        print(f"[{m.start()}]: {content[start:end]}")
        print("-" * 50)
else:
    print(f"File {filepath} not found.")
