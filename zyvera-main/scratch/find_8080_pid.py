import ctypes
from ctypes import wintypes

# Win32 API to find owner PID of TCP port
MIB_TCP_STATE_LISTEN = 2

class MIB_TCPROW_OWNER_PID(ctypes.Structure):
    _fields_ = [
        ("dwState", wintypes.DWORD),
        ("dwLocalAddr", wintypes.DWORD),
        ("dwLocalPort", wintypes.DWORD),
        ("dwRemoteAddr", wintypes.DWORD),
        ("dwRemotePort", wintypes.DWORD),
        ("dwOwningPid", wintypes.DWORD),
    ]

class MIB_TCPTABLE_OWNER_PID(ctypes.Structure):
    _fields_ = [
        ("dwNumEntries", wintypes.DWORD),
        ("table", MIB_TCPROW_OWNER_PID * 1),
    ]

size = wintypes.DWORD(0)
ctypes.windll.iphlpapi.GetExtendedTcpTable(None, ctypes.byref(size), True, 2, 5, 0)
buf = (ctypes.c_ubyte * size.value)()
res = ctypes.windll.iphlpapi.GetExtendedTcpTable(buf, ctypes.byref(size), True, 2, 5, 0)

num_entries = wintypes.DWORD.from_buffer_copy(bytes(buf[:4])).value
row_size = ctypes.sizeof(MIB_TCPROW_OWNER_PID)
for i in range(num_entries):
    offset = 4 + i * row_size
    row = MIB_TCPROW_OWNER_PID.from_buffer_copy(bytes(buf[offset:offset+row_size]))
    port = socket_port = socket_port = ((row.dwLocalPort & 0xFF) << 8) | ((row.dwLocalPort >> 8) & 0xFF)
    if port == 8080:
        print(f"Port 8080 is owned by PID: {row.dwOwningPid}, state: {row.dwState}")
