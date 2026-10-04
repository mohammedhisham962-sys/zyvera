import os

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    found = False
    for idx, line in enumerate(lines):
        if 'id="panel-hub-defense"' in line:
            print(f"Found id=\"panel-hub-defense\" on line {idx+1}:")
            # print surrounding 30 lines
            for j in range(max(0, idx - 2), min(len(lines), idx + 35)):
                print(f"{j+1}: {lines[j]}", end="")
            found = True
            break
    if not found:
        print("panel-hub-defense not found.")
else:
    print(f"File {filepath} not found.")
