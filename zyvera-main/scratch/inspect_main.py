import re
import os

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # find lines with @app
    endpoints = []
    lines = content.split("\n")
    for i, line in enumerate(lines):
        if "@app." in line:
            endpoints.append((i+1, line))
    
    print(f"Found {len(endpoints)} endpoints in main.py:")
    for idx, (line_num, text) in enumerate(endpoints):
        print(f"Line {line_num}: {text}")
else:
    print(f"File {filepath} not found.")
