import os
import re

filepath = "index_backup.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    inputs = re.findall(r'<input[^>]+class="[^"]+"[^>]*>', content)
    print("Inputs found:")
    for inp in inputs[:10]:
        print(inp)
    
    textareas = re.findall(r'<textarea[^>]+class="[^"]+"[^>]*>', content)
    print("Textareas found:")
    for ta in textareas[:5]:
        print(ta)
else:
    print(f"File {filepath} not found.")
