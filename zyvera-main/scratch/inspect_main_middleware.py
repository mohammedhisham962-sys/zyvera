import os

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    found = False
    for idx, line in enumerate(lines):
        if "call_next" in line:
            print(f"Found call_next on line {idx+1}:")
            # print surrounding 40 lines
            for j in range(max(0, idx - 20), min(len(lines), idx + 25)):
                print(f"{j+1}: {lines[j]}", end="")
            found = True
            break
    if not found:
        print("call_next not found.")
else:
    print(f"File {filepath} not found.")
