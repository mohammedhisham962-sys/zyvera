import subprocess

out = subprocess.check_output('netstat -ano', shell=True).decode()
pids = set()
for line in out.splitlines():
    if ':8080 ' in line and 'LISTENING' in line:
        parts = line.strip().split()
        if len(parts) >= 5:
            pids.add(parts[-1])
print('Listening PIDs on 8080:', pids)
for pid in pids:
    try:
        task_out = subprocess.check_output(f'tasklist /FI "PID eq {pid}"', shell=True).decode()
        print(task_out)
    except Exception as e:
        print(f'Error querying pid {pid}: {e}')
