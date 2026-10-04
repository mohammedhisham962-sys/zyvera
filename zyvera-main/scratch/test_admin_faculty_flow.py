import urllib.request
import json
import http.cookiejar

BASE_URL = "http://127.0.0.1:8080"

def run_test():
    print("=== Testing Admin & Faculty Unified Login & Credential Vault ===")
    
    # Setup cookie jar for Admin session
    admin_cj = http.cookiejar.CookieJar()
    admin_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(admin_cj))

    # 1. Admin Login through the unified login portal
    login_payload = json.dumps({"username": "de4thnote", "password": "aigr44dmin4123"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/login", data=login_payload, headers={"Content-Type": "application/json"})
    res = admin_opener.open(req)
    admin_data = json.loads(res.read().decode('utf-8'))
    print(f"1. Admin Login Response: {admin_data}")
    assert admin_data["status"] == "authenticated"
    assert admin_data["role"] == "admin"
    assert admin_data["username"] == "de4thnote"

    # 2. Admin retrieves Faculty Credentials from Vault
    req = urllib.request.Request(f"{BASE_URL}/api/admin/faculty_credentials")
    res = admin_opener.open(req)
    vault_data = json.loads(res.read().decode('utf-8'))
    print(f"2. Admin Vault Query (Total faculty: {len(vault_data['credentials'])}):")
    for fac in vault_data["credentials"]:
        print(f"   - Faculty: {fac['username']} | Password: {fac['password_plain']} | Dept: {fac['department']}")

    # 3. Admin provisions new faculty credentials for dr_reed
    new_faculty = {
        "username": "dr_reed",
        "password": "Crypt0#Reed99",
        "email": "reed@aigra.edu",
        "department": "Quantum Cryptography & Defense"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/admin/faculty_credentials",
        data=json.dumps(new_faculty).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res = admin_opener.open(req)
    prov_data = json.loads(res.read().decode('utf-8'))
    print(f"3. Admin Provisioning Result: {prov_data}")
    assert prov_data["status"] == "success"

    # 4. Verify dr_reed appears in Admin Vault
    res = admin_opener.open(urllib.request.Request(f"{BASE_URL}/api/admin/faculty_credentials"))
    vault_data = json.loads(res.read().decode('utf-8'))
    usernames = [f["username"] for f in vault_data["credentials"]]
    print(f"4. Updated Vault Usernames: {usernames}")
    assert "dr_reed" in usernames

    # 5. Faculty dr_reed logs in through the EXACT SAME login portal
    faculty_cj = http.cookiejar.CookieJar()
    faculty_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(faculty_cj))
    fac_login_payload = json.dumps({"username": "dr_reed", "password": "Crypt0#Reed99"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/login", data=fac_login_payload, headers={"Content-Type": "application/json"})
    res = faculty_opener.open(req)
    fac_data = json.loads(res.read().decode('utf-8'))
    print(f"5. Faculty dr_reed Login via Same Portal: {fac_data}")
    assert fac_data["status"] == "authenticated"
    assert fac_data["role"] == "faculty"
    assert fac_data["username"] == "dr_reed"

    # 6. Verify that dr_reed CANNOT access the Faculty Credential Vault (Admin only!)
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/admin/faculty_credentials")
        faculty_opener.open(req)
        print("ERROR: Faculty was able to access the admin vault!")
        assert False
    except urllib.error.HTTPError as e:
        print(f"6. Faculty Access to Vault Denied as expected: HTTP {e.code} ({e.reason})")
        assert e.code == 403

    # 7. Also test professor_x login with assigned credentials (secres2026!)
    prof_cj = http.cookiejar.CookieJar()
    prof_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(prof_cj))
    prof_login_payload = json.dumps({"username": "professor_x", "password": "secres2026!"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/login", data=prof_login_payload, headers={"Content-Type": "application/json"})
    res = prof_opener.open(req)
    prof_data = json.loads(res.read().decode('utf-8'))
    print(f"7. Faculty professor_x Login via Same Portal: {prof_data}")
    assert prof_data["status"] == "authenticated"
    assert prof_data["role"] == "faculty"

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
