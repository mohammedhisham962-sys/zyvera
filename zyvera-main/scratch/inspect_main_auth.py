import os
import re

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # search for HTTP_401, 401, Unauthorized, HTTP 401, credentials, auth, session
    matches = re.finditer(r'HTTPException\([^)]*status_code=401[^)]*\)', content)
    print("=== Matches for HTTPException status_code=401 ===")
    for m in matches:
        start = max(0, m.start() - 100)
        end = min(len(content), m.end() + 100)
        print(content[start:end])
        print("-" * 50)
        
    matches2 = re.finditer(r'401', content)
    print("=== Matches for 401 ===")
    for m in matches2:
        start = max(0, m.start() - 100)
        end = min(len(content), m.end() + 100)
        print(content[start:end])
        print("-" * 50)
else:
    print(f"File {filepath} not found.")
