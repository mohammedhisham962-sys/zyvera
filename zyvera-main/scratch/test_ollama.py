import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=2) as response:
        data = json.loads(response.read().decode())
        print("Ollama is running!")
        print("Models:", data)
except Exception as e:
    print("Ollama is not running or failed:", e)
