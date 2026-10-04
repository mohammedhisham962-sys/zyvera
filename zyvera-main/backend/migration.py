import os
import sqlite3
import random
from datetime import datetime
from backend.supabase_client import supabase, supabase_admin, upload_base64_file

def migrate_sqlite_to_supabase(admin_credentials):
    if not supabase_admin:
        print("[MIGRATION] Admin client not configured. Skipping database migration.")
        return
        
    try:
        # Check if already migrated
        res = supabase_admin.table("settings").select("value").eq("key", "migrated_to_supabase").execute()
        if res.data and res.data[0]["value"] == "true":
            print("[MIGRATION] Database has already been migrated to Supabase.")
            return
    except Exception as e:
        print(f"[MIGRATION] Pre-migration check: {e}")
        
    db_path = "cyber_shield_chat.db"
    if not os.path.exists(db_path):
        print(f"[MIGRATION] SQLite database ({db_path}) not found. Skipping migration.")
        return
        
    print("[MIGRATION] Starting database migration from SQLite to Supabase PostgreSQL...")
    
    sqlite_conn = sqlite3.connect(db_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()
    
    # 1. Migrate settings
    try:
        sqlite_cursor.execute("SELECT key, value FROM settings")
        for row in sqlite_cursor.fetchall():
            supabase_admin.table("settings").upsert({"key": row["key"], "value": row["value"]}).execute()
        print("[MIGRATION] settings migrated.")
    except Exception as e:
        print(f"[MIGRATION] settings migration failed: {e}")
        
    # 2. Migrate users to Supabase Auth & profiles table
    users_map = {} # Maps username -> user_id
    try:
        sqlite_cursor.execute("SELECT username, email, role, status FROM users")
        for row in sqlite_cursor.fetchall():
            username = row["username"].strip().lower()
            email = row["email"].strip().lower() if row["email"] else f"{username}@aigra.edu"
            role = row["role"]
            status = row["status"]
            
            # Check if profile already exists in Supabase
            p_res = supabase_admin.table("profiles").select("id").eq("username", username).execute()
            if p_res.data:
                users_map[username] = p_res.data[0]["id"]
                print(f"[MIGRATION] User profile for {username} already exists.")
                continue
                
            try:
                # Set temporary password
                temp_pwd = f"{username.capitalize()}123!"
                if username == "professor_x":
                    temp_pwd = "faculty123"
                    
                auth_user = supabase_admin.auth.admin.create_user({
                    "email": email,
                    "password": temp_pwd,
                    "email_confirm": True,
                    "user_metadata": {
                        "username": username,
                        "role": role
                    }
                })
                
                user_id = auth_user.user.id
                users_map[username] = user_id
                
                # Insert profile
                supabase_admin.table("profiles").insert({
                    "id": user_id,
                    "username": username,
                    "email": email,
                    "role": role,
                    "status": status
                }).execute()
                print(f"[MIGRATION] Migrated auth user and profile for: {username}")
            except Exception as auth_err:
                print(f"[MIGRATION] Error migrating user {username}: {auth_err}")
    except Exception as e:
        print(f"[MIGRATION] users migration failed: {e}")

    # Seed Admin users configured in environment variables
    for admin_uname, admin_pwd in admin_credentials.items():
        admin_uname_clean = admin_uname.strip().lower()
        try:
            admin_email = f"{admin_uname_clean}@aigra.edu"
            p_res = supabase_admin.table("profiles").select("id").eq("username", admin_uname_clean).execute()
            if not p_res.data:
                auth_user = supabase_admin.auth.admin.create_user({
                    "email": admin_email,
                    "password": admin_pwd,
                    "email_confirm": True,
                    "user_metadata": {
                        "username": admin_uname_clean,
                        "role": "admin"
                    }
                })
                supabase_admin.table("profiles").insert({
                    "id": auth_user.user.id,
                    "username": admin_uname_clean,
                    "email": admin_email,
                    "role": "admin",
                    "status": "ACTIVE"
                }).execute()
                print(f"[MIGRATION] Created admin auth and profile for {admin_uname_clean}")
        except Exception as admin_err:
            print(f"[MIGRATION] Error seeding admin {admin_uname_clean}: {admin_err}")

    # 3. Migrate student stats
    try:
        sqlite_cursor.execute("SELECT username, xp, coins, level, completed_tasks FROM student_stats")
        for row in sqlite_cursor.fetchall():
            # Check if profile exists (since stats references profiles)
            p_res = supabase_admin.table("profiles").select("username").eq("username", row["username"]).execute()
            if p_res.data:
                supabase_admin.table("student_stats").upsert({
                    "username": row["username"],
                    "xp": row["xp"],
                    "coins": row["coins"],
                    "level": row["level"],
                    "completed_tasks": row["completed_tasks"]
                }).execute()
        print("[MIGRATION] student_stats migrated.")
    except Exception as e:
        print(f"[MIGRATION] student_stats migration failed: {e}")

    # 4. Migrate chat history
    try:
        sqlite_cursor.execute("SELECT username, sender, message, timestamp FROM chat_history")
        for row in sqlite_cursor.fetchall():
            p_res = supabase_admin.table("profiles").select("username").eq("username", row["username"]).execute()
            if p_res.data:
                supabase_admin.table("chat_history").insert({
                    "username": row["username"],
                    "sender": row["sender"],
                    "message": row["message"],
                    "timestamp": row["timestamp"]
                }).execute()
        print("[MIGRATION] chat_history migrated.")
    except Exception as e:
        print(f"[MIGRATION] chat_history migration failed: {e}")

    # 5. Migrate incidents (and upload files if base64 detected)
    try:
        sqlite_cursor.execute("SELECT title, category, description, reporter, status, solution, timestamp, image_data, voice_data FROM incidents")
        for row in sqlite_cursor.fetchall():
            p_res = supabase_admin.table("profiles").select("username").eq("username", row["reporter"]).execute()
            if p_res.data:
                image_url = row["image_data"]
                if image_url and image_url.startswith("data:"):
                    image_url = upload_base64_file("cybershield-media", "incidents", "migrated_image.png", image_url)
                
                voice_url = row["voice_data"]
                if voice_url and voice_url.startswith("data:"):
                    voice_url = upload_base64_file("cybershield-media", "incidents", "migrated_voice.wav", voice_url)
                
                supabase_admin.table("incidents").insert({
                    "title": row["title"],
                    "category": row["category"],
                    "description": row["description"],
                    "reporter": row["reporter"],
                    "status": row["status"],
                    "solution": row["solution"],
                    "timestamp": row["timestamp"],
                    "image_data": image_url,
                    "voice_data": voice_url
                }).execute()
        print("[MIGRATION] incidents migrated.")
    except Exception as e:
        print(f"[MIGRATION] incidents migration failed: {e}")

    # 6. Migrate academic posts
    try:
        sqlite_cursor.execute("SELECT title, content, author, timestamp, file_name, file_type, file_data FROM academic_posts")
        for row in sqlite_cursor.fetchall():
            p_res = supabase_admin.table("profiles").select("username").eq("username", row["author"]).execute()
            if p_res.data:
                file_url = row["file_data"]
                if file_url and file_url.startswith("data:"):
                    file_url = upload_base64_file("cybershield-media", "academic_posts", row["file_name"] or "file", file_url)
                
                supabase_admin.table("academic_posts").insert({
                    "title": row["title"],
                    "content": row["content"],
                    "author": row["author"],
                    "timestamp": row["timestamp"],
                    "file_name": row["file_name"],
                    "file_type": row["file_type"],
                    "file_data": file_url
                }).execute()
        print("[MIGRATION] academic_posts migrated.")
    except Exception as e:
        print(f"[MIGRATION] academic_posts migration failed: {e}")

    # 7. Migrate sessions
    try:
        sqlite_cursor.execute("SELECT session_id, username, role, ip_address, user_agent, os, browser, created_at, active FROM sessions")
        for row in sqlite_cursor.fetchall():
            p_res = supabase_admin.table("profiles").select("username").eq("username", row["username"]).execute()
            if p_res.data:
                supabase_admin.table("sessions").upsert({
                    "session_id": row["session_id"],
                    "username": row["username"],
                    "role": row["role"],
                    "ip_address": row["ip_address"],
                    "user_agent": row["user_agent"],
                    "os": row["os"],
                    "browser": row["browser"],
                    "created_at": row["created_at"],
                    "active": row["active"]
                }).execute()
        print("[MIGRATION] sessions migrated.")
    except Exception as e:
        print(f"[MIGRATION] sessions migration failed: {e}")

    # 8. Migrate activity logs
    try:
        sqlite_cursor.execute("SELECT username, role, action, ip_address, device, timestamp FROM activity_logs")
        for row in sqlite_cursor.fetchall():
            p_res = supabase_admin.table("profiles").select("username").eq("username", row["username"]).execute()
            if p_res.data:
                supabase_admin.table("activity_logs").insert({
                    "username": row["username"],
                    "role": row["role"],
                    "action": row["action"],
                    "ip_address": row["ip_address"],
                    "device": row["device"],
                    "timestamp": row["timestamp"]
                }).execute()
        print("[MIGRATION] activity_logs migrated.")
    except Exception as e:
        print(f"[MIGRATION] activity_logs migration failed: {e}")

    # 9. Migrate blacklisted IPs
    try:
        sqlite_cursor.execute("SELECT ip_address, reason, reference_id, timestamp FROM blacklisted_ips")
        for row in sqlite_cursor.fetchall():
            supabase_admin.table("blacklisted_ips").upsert({
                "ip_address": row["ip_address"],
                "reason": row["reason"],
                "reference_id": row["reference_id"],
                "timestamp": row["timestamp"]
            }).execute()
        print("[MIGRATION] blacklisted_ips migrated.")
    except Exception as e:
        print(f"[MIGRATION] blacklisted_ips migration failed: {e}")
        
    sqlite_conn.close()
    
    # Save migration status flag
    try:
        supabase_admin.table("settings").upsert({"key": "migrated_to_supabase", "value": "true"}).execute()
        print("[MIGRATION] Migration successfully completed and flag set!")
    except Exception as e:
        print(f"[MIGRATION] Failed to set migration status flag: {e}")
