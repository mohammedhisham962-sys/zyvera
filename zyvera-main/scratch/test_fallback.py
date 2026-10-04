import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8080"

# Query with invalid key
url = f"{BASE_URL}/api/ai/tutor"
body = {
    "message": "What is SQL Injection?",
    "history": [],
    "api_key": "INVALID_KEY_123"
}
data = json.dumps(body).encode("utf-8")
req = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)

print("Querying /api/ai/tutor with invalid API key...")
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode("utf-8"))
        print("Response received successfully!")
        print("Mode:", res.get("mode"))
        print("Contains SQL Injection:", "sql injection" in res.get("result", "").lower())
        print("Contains fallback note:", "offline simulation" in res.get("result", "").lower())
        assert res.get("mode") == "simulation"
        print("SUCCESS: Endpoint gracefully fell back to simulation mode!")
except Exception as e:
    print("FAILED: Endpoint raised error:", e)
    raise e
