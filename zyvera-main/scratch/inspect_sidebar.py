import os
import re

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # find nav-list block
    idx = content.find('class="nav-list"')
    if idx != -1:
        print(content[idx:idx+4000])
    else:
        print("nav-list not found")
else:
    print(f"File {filepath} not found.")
