import os

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # print lines 301 to 330
    for j in range(300, min(len(lines), 330)):
        print(f"{j+1}: {lines[j]}", end="")
else:
    print(f"File {filepath} not found.")
