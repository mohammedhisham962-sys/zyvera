import sqlite3

# Test queries directly on database logic
conn = sqlite3.connect('cyber_shield_chat.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT id, username, password_plain, email, department, created_by, created_at, status FROM faculty_credentials")
rows = cursor.fetchall()
print("Stored faculty credentials in vault:")
for r in rows:
    print(dict(r))
conn.close()
