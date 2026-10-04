import re
with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

for m in re.finditer(r'@app\.post\("/api/logout"\)', content):
    start = m.start()
    lines = content[:start].count('\n') + 1
    print(f"Match at index {start}, line {lines}:")
    print(content[start:start+350])
    print("=" * 60)
