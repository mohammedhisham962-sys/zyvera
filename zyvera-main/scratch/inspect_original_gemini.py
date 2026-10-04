import os
import re

filepath = "index_backup.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    matches = list(re.finditer(r'gemini', content, re.IGNORECASE))
    print(f"Found {len(matches)} matches in index_backup.html:")
    for m in matches[:10]:
        start = max(0, m.start() - 100)
        end = min(len(content), m.end() + 150)
        print(f"[{m.start()}]: {content[start:end]}")
        print("-" * 50)
else:
    print(f"File {filepath} not found.")
