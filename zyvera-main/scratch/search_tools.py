import os
import re

tools = [
    "AI Learning Tools",
    "Explain This Command",
    "Explain This Log",
    "Explain This Vulnerability",
    "CTF Hint Generator",
    "Security Report Generator",
    "Attack-Scenario Generator",
    "Cybersecurity Study Assistant",
    "AI Cybersecurity Tutor"
]

files_to_check = [
    "index.html",
    "main.py",
    "main_refactored_final.py",
    "index_refactored.html",
    "index_v2.html"
]

for filename in files_to_check:
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()
        print(f"=== Checking {filename} ===")
        for t in tools:
            matches = list(re.finditer(re.escape(t), content, re.IGNORECASE))
            if matches:
                print(f"Found '{t}' {len(matches)} times.")
    else:
        print(f"File {filename} not found.")
