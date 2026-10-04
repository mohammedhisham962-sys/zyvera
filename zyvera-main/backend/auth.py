import os
import secrets
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db_connection, hash_password, verify_password

router = APIRouter()

# Default admin & faculty credentials fallback
ADMIN_CREDENTIALS = {
    "de4thnote": os.getenv("ADMIN_PASSWORD_DE4THNOTE", "burr1edonhe4ven"),
    "reiz": os.getenv("ADMIN_PASSWORD_REIZ", "heavenofreiz")
}
FACULTY_CREDENTIALS = {
    "professor_x": os.getenv("FACULTY_PASSWORD_DEFAULT", "faculty123")
}

class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

def get_session_user(request: Request) -> dict:
    session_id = request.cookies.get("session_id") or request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=401, detail="Authentication session missing.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username, role FROM sessions WHERE session_id = ? AND active = 1",
        (session_id,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    
    return {"username": row["username"], "role": row["role"], "session_id": session_id}

@router.post("/api/signup")
async def signup(req: SignupRequest):
    username = req.username.strip().lower()
    email = req.email.strip().lower()
    
    if not username or not email or not req.password:
        raise HTTPException(status_code=400, detail="All fields are required.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
    if cursor.fetchone() or username in ADMIN_CREDENTIALS or username in FACULTY_CREDENTIALS:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists.")
    
    # Insert new user
    pass_hash = hash_password(req.password)
    try:
        cursor.execute(
            """INSERT INTO users (username, email, password_hash, role, status, is_verified) 
               VALUES (?, ?, ?, 'student', 'Active', 1)""",
            (username, email, pass_hash)
        )
        
        # Initialize student stats
        cursor.execute(
            "INSERT OR IGNORE INTO student_stats (username, xp, coins, level, completed_tasks) VALUES (?, 0, 0, 1, '[]')",
            (username,)
        )
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    conn.close()
    return {"message": "Account created successfully."}

@router.post("/api/login")
async def login(req: LoginRequest, request: Request, response: Response):
    username = req.username.strip().lower()
    password = req.password
    
    role = None
    authenticated = False
    
    # 1. Check if admin
    if username in ADMIN_CREDENTIALS:
        if password == ADMIN_CREDENTIALS[username]:
            role = "admin"
            authenticated = True
            
    # 2. Check if faculty
    elif username in FACULTY_CREDENTIALS:
        if password == FACULTY_CREDENTIALS[username]:
            role = "faculty"
            authenticated = True
            
    # 3. Check regular users
    else:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash, role FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row and verify_password(password, row["password_hash"]):
            role = row["role"]
            authenticated = True
            
    if not authenticated:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    
    # Create session
    session_id = secrets.token_urlsafe(32)
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("User-Agent", "Unknown")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO sessions (session_id, username, role, ip_address, user_agent, os, browser, created_at, active)
           VALUES (?, ?, ?, ?, ?, 'Unknown OS', 'Unknown Browser', ?, 1)""",
        (session_id, username, role, client_ip, user_agent, datetime.now().isoformat())
    )
    
    # Log Activity
    cursor.execute(
        """INSERT INTO activity_logs (username, role, action, ip_address, device, timestamp)
           VALUES (?, ?, 'User Login', ?, ?, ?)""",
        (username, role, client_ip, user_agent[:50], datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    )
    conn.commit()
    conn.close()
    
    # Set Cookies
    response.set_cookie(key="session_id", value=session_id, httponly=True, secure=False, samesite="lax")
    
    return {
        "status": "authenticated",
        "role": role,
        "username": username,
        "session_id": session_id
    }

@router.post("/api/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id") or request.headers.get("X-Session-ID")
    if session_id:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE sessions SET active = 0 WHERE session_id = ?", (session_id,))
        conn.commit()
        conn.close()
        
    response.delete_cookie("session_id")
    return {"status": "logged_out"}

@router.get("/api/check_status")
async def check_status(request: Request):
    try:
        user = get_session_user(request)
        return {"status": "authenticated", "role": user["role"], "username": user["username"]}
    except Exception:
        return {"status": "unauthenticated"}
