import os

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    found = False
    for idx, line in enumerate(lines):
        if "</head>" in line.lower():
            print(f"Found </head> on line {idx+1}:")
            for j in range(max(0, idx - 2), min(len(lines), idx + 3)):
                print(f"{j+1}: {lines[j]}", end="")
            found = True
            break
    if not found:
        print("</head> not found.")
else:
    print(f"File {filepath} not found.")
