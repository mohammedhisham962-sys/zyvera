import re
import os

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    panels = re.findall(r'<div id="panel-[^"]+"', content)
    print("Found panels:")
    for p in panels:
        print(p)
else:
    print(f"File {filepath} not found.")
