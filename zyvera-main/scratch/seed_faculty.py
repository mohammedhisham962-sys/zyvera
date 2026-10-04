import sqlite3, hashlib, secrets, hmac

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    iterations = 600000
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), bytes.fromhex(salt), iterations)
    return f'pbkdf2_sha256${iterations}${salt}${key.hex()}'

def verify_password(password: str, hashed_str: str) -> bool:
    try:
        algorithm, iterations_str, salt_hex, hash_hex = hashed_str.split('$')
        salt = bytes.fromhex(salt_hex)
        iterations = int(iterations_str)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
        return hmac.compare_digest(key.hex(), hash_hex)
    except Exception as e:
        print('Error verifying:', e)
        return False

conn = sqlite3.connect('cyber_shield_chat.db')
cursor = conn.cursor()

# Update professor_x
p_hash = hash_password('secres2026!')
cursor.execute("UPDATE users SET password_hash = ?, role = 'faculty', status = 'ACTIVE', is_verified = 1 WHERE username = 'professor_x'", (p_hash,))

cursor.execute("""
    INSERT INTO faculty_credentials (username, password_plain, email, department, created_by, created_at, status)
    VALUES ('professor_x', 'secres2026!', 'professor_x@aigra.edu', 'Institute of Threat Defense & Intelligence', 'de4thnote', '2026-10-01 10:00:00', 'ACTIVE')
    ON CONFLICT(username) DO UPDATE SET
        password_plain = 'secres2026!',
        status = 'ACTIVE'
""")

conn.commit()

# Verify
cursor.execute("SELECT password_hash FROM users WHERE username = 'professor_x'")
fetched = cursor.fetchone()[0]
conn.close()

print('Hash stored:', fetched[:30], '...')
print('Verify secres2026!:', verify_password('secres2026!', fetched))
