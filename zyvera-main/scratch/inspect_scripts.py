import os
import re

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    scripts = re.findall(r'<script[^>]*>.*?</script>', content, re.DOTALL)
    print(f"Found {len(scripts)} script tags in index.html.")
    for idx, s in enumerate(scripts):
        print(f"Script {idx}: length {len(s)}")
        if len(s) < 500:
            print(s)
        else:
            print(s[:300] + " ... [TRUNCATED] ... " + s[-200:])
        print("="*40)
else:
    print(f"File {filepath} not found.")
