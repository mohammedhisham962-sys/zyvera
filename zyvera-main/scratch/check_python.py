import subprocess

out = subprocess.check_output('tasklist /V /FO CSV', shell=True).decode(errors='ignore')
lines = [l for l in out.splitlines() if 'python' in l.lower() or 'uvicorn' in l.lower()]
print('Found Python tasks in tasklist:')
for l in lines:
    print(l)
