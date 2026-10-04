import os

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    idx = content.find('def query_ollama')
    if idx != -1:
        print("=== def query_ollama rest ===")
        print(content[idx+500:idx+2500])
    else:
        print("def query_ollama not found.")
else:
    print(f"File {filepath} not found.")
