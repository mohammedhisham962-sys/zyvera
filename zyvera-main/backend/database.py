import sqlite3
import hashlib
import os

DB_FILE = "cyber_shield_chat.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 1. Chat History
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            sender TEXT,
            message TEXT,
            timestamp TEXT
        )
    """)
    
    # 2. Sessions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            username TEXT,
            role TEXT,
            ip_address TEXT,
            user_agent TEXT,
            os TEXT,
            browser TEXT,
            created_at TEXT,
            active INTEGER
        )
    """)
    
    # 3. Activity Logs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            role TEXT,
            action TEXT,
            ip_address TEXT,
            device TEXT,
            timestamp TEXT
        )
    """)
    
    # 4. Student Stats
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_stats (
            username TEXT PRIMARY KEY,
            xp INTEGER,
            coins INTEGER,
            level INTEGER,
            completed_tasks TEXT
        )
    """)
    
    # 5. Blacklisted IPs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blacklisted_ips (
            ip_address TEXT PRIMARY KEY,
            reason TEXT,
            reference_id TEXT,
            timestamp TEXT
        )
    """)
    
    # 6. Users
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            email TEXT,
            password_hash TEXT,
            role TEXT,
            status TEXT,
            verification_code TEXT,
            is_verified INTEGER,
            two_factor_secret TEXT,
            two_factor_enabled INTEGER,
            reset_token TEXT,
            reset_token_expiry TEXT
        )
    """)
    
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Password Hashing Utilities
def hash_password(password: str, salt: bytes = None) -> str:
    iterations = 600000
    if salt is None:
        salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${hashed.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash:
        return False
    if stored_hash.startswith("pbkdf2_sha256$"):
        parts = stored_hash.split("$")
        if len(parts) == 4:
            iterations = int(parts[1])
            salt = bytes.fromhex(parts[2])
            expected = parts[3]
            hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations).hex()
            return hashed == expected
    else:
        # Legacy static salt fallback
        legacy_salt = b"aigra_cybershield_salt"
        legacy_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), legacy_salt, 100000).hex()
        return legacy_hash == stored_hash
    return False
