import os

filepath = "index.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    start_idx = content.find('id="panel-welcome"')
    if start_idx != -1:
        # print 3000 chars from start_idx
        print(content[start_idx:start_idx+3500])
    else:
        print("panel-welcome not found.")
else:
    print(f"File {filepath} not found.")
