import os

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # print lines 214 to 300
    for j in range(213, min(len(lines), 300)):
        print(f"{j+1}: {lines[j]}", end="")
else:
    print(f"File {filepath} not found.")
