import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8080"

def make_request(path, method="GET", body=None, headers=None):
    if headers is None:
        headers = {}
    url = f"{BASE_URL}{path}"
    data = None
    if body:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_headers = response.info()
            res_body = json.loads(response.read().decode("utf-8"))
            return res_body, res_headers
    except urllib.error.HTTPError as e:
        print(f"HTTPError on {path}: {e.code} - {e.read().decode('utf-8')}")
        raise e
    except Exception as e:
        print(f"Exception on {path}: {e}")
        raise e

print("=== STARTING BACKEND INTEGRATION TEST ===")

# 1. Health check
res, _ = make_request("/api/health")
print("Health Check:", res)
assert res["status"] == "healthy"

# 2. Check initial auth status (unauthenticated)
res, _ = make_request("/api/check_status")
print("Initial Auth Status:", res)
assert res["status"] == "unauthenticated"

# 3. Signup test
signup_data = {
    "username": "test_operative_2",
    "email": "test2@aigra.portal",
    "password": "Password123!"
}
try:
    res, _ = make_request("/api/signup", "POST", signup_data)
    print("Signup Response:", res)
except Exception as e:
    # If already exists in DB, it might fail. That's fine for re-runs.
    print("Signup skipped or failed (User might already exist):", e)

# 4. Login test
login_data = {
    "username": "test_operative_2",
    "password": "Password123!"
}
res, headers = make_request("/api/login", "POST", login_data)
print("Login Response:", res)
assert res["status"] == "authenticated"
assert res["username"] == "test_operative_2"

# Extract Set-Cookie header
cookies = headers.get_all("Set-Cookie")
session_cookie = ""
csrf_cookie = ""
csrf_token_val = ""
if cookies:
    for c in cookies:
        if "session_id=" in c:
            session_cookie = c.split(";")[0]
        elif "csrf_token=" in c:
            csrf_cookie = c.split(";")[0]
            csrf_token_val = csrf_cookie.split("=")[1]
print("Acquired Session Cookie:", session_cookie)
print("Acquired CSRF Cookie:", csrf_cookie)

# 5. Check authenticated auth status
auth_headers = {}
if session_cookie:
    auth_headers["Cookie"] = f"{session_cookie}; {csrf_cookie}" if csrf_cookie else session_cookie
res, _ = make_request("/api/check_status", "GET", headers=auth_headers)
print("Authenticated Check Status:", res)
assert res["status"] == "authenticated"
assert res["username"] == "test_operative_2"

# 6. Test AI Command Explainer (Simulation Mode)
explain_data = {
    "command": "nmap -sS -A -T4 10.0.0.1",
    "shell": "Bash",
    "api_key": ""
}
res, _ = make_request("/api/ai/explain_command", "POST", explain_data)
print("AI Explain Command (Simulation Mode):")
print(res["result"][:250] + "...")
assert "nmap" in res["result"].lower()
assert res["mode"] == "simulation"

# 7. Test AI Log Explainer (Simulation Mode)
log_data = {
    "log": "Failed password for invalid user admin from 192.168.1.105 port 54823 ssh2",
    "format": "Auth / Syslog",
    "api_key": ""
}
res, _ = make_request("/api/ai/explain_log", "POST", log_data)
print("AI Explain Log (Simulation Mode):")
print(res["result"][:250] + "...")
assert "brute force" in res["result"].lower()
assert res["mode"] == "simulation"

# 8. Test Logout
logout_headers = auth_headers.copy()
if csrf_token_val:
    logout_headers["X-CSRF-Token"] = csrf_token_val
res, _ = make_request("/api/logout", "POST", headers=logout_headers)
print("Logout Response:", res)
assert res["status"] == "logged_out"

print("=== ALL BACKEND ENDPOINTS PASSED SUCCESSFULLY ===")
