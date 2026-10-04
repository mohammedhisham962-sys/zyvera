import os
import re

filepath = "index_backup.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    links = re.findall(r'<link[^>]+>', content)
    print("Link tags found:")
    for l in links:
        print(l)
else:
    print(f"File {filepath} not found.")
