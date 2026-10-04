import os

filepath = "main.py"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Let's search for '/api/chat' and '/api/scam/analyze' and print their definitions
    chat_idx = content.find('"/api/chat"')
    if chat_idx != -1:
        print("=== /api/chat ===")
        print(content[chat_idx:chat_idx+1500])
    
    scam_idx = content.find('"/api/scam/analyze"')
    if scam_idx != -1:
        print("=== /api/scam/analyze ===")
        print(content[scam_idx:scam_idx+1500])
else:
    print(f"File {filepath} not found.")
