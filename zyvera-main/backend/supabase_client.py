1import os
import base64
import re
import uuid
from typing import Optional
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[SUPABASE] WARNING: SUPABASE_URL or SUPABASE_KEY is missing in your environment configuration.")

# Initialize the public Anon client
supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Initialize the secure Admin (Service Role) client
supabase_admin: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
else:
    print("[SUPABASE] WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Admin-related auth features will fall back or error out.")

def upload_base64_file(bucket_name: str, folder: str, file_name: str, base64_data: str) -> str:
    """
    Decodes a base64 Data URL and uploads it to a Supabase storage bucket,
    returning the internal storage path of the uploaded asset.
    """
    if not supabase:
        print("[SUPABASE STORAGE] Client not initialized. Returning raw base64 data.")
        return base64_data

    if not base64_data or not isinstance(base64_data, str) or not base64_data.startswith("data:"):
        # Not a valid base64 data URL, return as is
        return base64_data

    try:
        # Parse data URL format: data:<mime_type>;base64,<data>
        match = re.match(r"^data:(.*?);base64,(.*)$", base64_data)
        if not match:
            return base64_data
            
        content_type = match.group(1)
        raw_base64 = match.group(2)
        file_bytes = base64.b64decode(raw_base64)
        
        # Clean file name and prepend unique identifier to prevent collisions
        safe_file_name = re.sub(r"[^a-zA-Z0-9._-]", "_", file_name)
        unique_name = f"{uuid.uuid4().hex}_{safe_file_name}"
        path = f"{folder}/{unique_name}"
        
        # Use admin client to bypass default RLS policies for uploads if admin client is available
        client = supabase_admin if supabase_admin else supabase
        
        # Upload binary data
        client.storage.from_(bucket_name).upload(
            path=path,
            file=file_bytes,
            file_options={"content-type": content_type, "x-upsert": "true"}
        )
        
        print(f"[SUPABASE STORAGE] Successfully uploaded {file_name} to bucket {bucket_name}. Path: {path}")
        return path
    except Exception as e:
        print(f"[SUPABASE STORAGE] Upload failed for file {file_name}: {e}")
        # Return original data URL as fallback so the app continues functioning
        return base64_data

def get_signed_url(bucket_name: str, path: str, expires_in: int = 900) -> str:
    """
    Generates a temporary signed URL for a private storage asset path.
    """
    if not supabase or not path or not isinstance(path, str):
        return path
    if path.startswith("data:") or path.startswith("http"):
        return path
    try:
        client = supabase_admin if supabase_admin else supabase
        res = client.storage.from_(bucket_name).create_signed_url(path, expires_in)
        if isinstance(res, dict):
            return res.get("signedURL") or res.get("signed_url") or path
        elif isinstance(res, str):
            return res
        return path
    except Exception as e:
        print(f"[SUPABASE STORAGE] Failed to create signed URL for path {path}: {e}")
        return path

