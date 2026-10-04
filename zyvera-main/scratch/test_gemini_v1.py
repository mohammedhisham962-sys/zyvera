import urllib.request
import json

url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=DUMMY"
body = {"contents": [{"parts": [{"text": "hello"}]}]}
req = urllib.request.Request(
    url,
    data=json.dumps(body).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req) as r:
        print("Success:", r.read().decode())
except urllib.error.HTTPError as e:
    print("HTTPError Code:", e.code)
    print("HTTPError Body:", e.read().decode())
except Exception as e:
    print("Error:", e)
