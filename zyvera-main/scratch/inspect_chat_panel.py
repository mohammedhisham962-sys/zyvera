import os

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    start_idx = content.find('id="panel-chat"')
    if start_idx != -1:
        print(content[start_idx:start_idx+3000])
    else:
        print("panel-chat not found.")
else:
    print(f"File {filepath} not found.")
