import os

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    idx = content.find('save_config')
    if idx != -1:
        print("=== save_config found ===")
        print(content[idx-100:idx+1500])
    else:
        print("save_config not found.")
else:
    print(f"File {filepath} not found.")
