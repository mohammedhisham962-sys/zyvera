import os

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    found = False
    for idx, line in enumerate(reversed(lines)):
        real_idx = len(lines) - 1 - idx
        if "</body>" in line.lower():
            print(f"Found </body> on line {real_idx+1}:")
            for j in range(max(0, real_idx - 5), min(len(lines), real_idx + 2)):
                print(f"{j+1}: {lines[j]}", end="")
            found = True
            break
    if not found:
        print("</body> not found.")
else:
    print(f"File {filepath} not found.")
