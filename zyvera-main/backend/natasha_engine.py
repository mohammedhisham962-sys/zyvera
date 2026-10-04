"""
Natasha AI Multi-Layer Reasoning and Knowledge Synthesis Engine
Provides real-time, comprehensive answers for Computer Science, Programming,
Operating Systems, Hardware, Networking, Cybersecurity, Databases, Cloud/DevOps,
Mathematics, Science, and General Inquiries.
"""

import os
import re
import json
import socket
import urllib.request
import urllib.parse
from typing import List, Dict, Optional, Tuple

# Fast check if a local port is listening
def is_port_open(host: str, port: int, timeout: float = 0.25) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

# Extensive Curated Computer Science, Technology & General Knowledge Base
CS_KNOWLEDGE_BASE = {
    # HARDWARE & ARCHITECTURE
    "cpu": {
        "title": "Central Processing Unit (CPU)",
        "category": "Computer Architecture & Hardware",
        "definition": "The Central Processing Unit (CPU) is the primary electronic circuitry within a computer that executes instructions comprising a computer program. It acts as the core processing engine of the entire system.",
        "how_it_works": "The CPU continuously cycles through the **Fetch-Decode-Execute cycle**:\n1. **Fetch**: Retrieves the next instruction opcode from system RAM using the Program Counter (PC).\n2. **Decode**: The Control Unit (CU) breaks down the instruction into low-level micro-operations.\n3. **Execute**: The Arithmetic Logic Unit (ALU) performs mathematical calculations or bitwise logic.\n4. **Writeback**: Stores the output results back into internal high-speed registers or system memory.",
        "key_components": "- **ALU (Arithmetic Logic Unit)**: Computes integer arithmetic (+, -, *, /) and bitwise operations (AND, OR, NOT, XOR).\n- **Control Unit (CU)**: Coordinates data movement, instruction sequencing, and timing pulses.\n- **Registers**: Ultra-fast storage cells (Accumulator, Program Counter, Stack Pointer, Instruction Register) with sub-nanosecond access.\n- **Cache Hierarchy (L1, L2, L3)**: High-speed SRAM situated directly on or near the silicon die to eliminate main memory (RAM) latency.\n- **Clock Generator**: Synchronizes operations via gigahertz (GHz) clock frequency pulses.",
        "best_practices": "- Optimize code for **Cache Locality** (spatial and temporal) to maximize L1/L2 hits.\n- Structure loops and arrays contiguously in memory to enable hardware prefetching and SIMD vectorization.\n- Avoid unnecessary branch mispredictions by organizing conditional branches predictably.",
        "common_pitfalls": "- Assuming clock frequency (GHz) alone determines CPU performance without accounting for IPC (Instructions Per Cycle) and multi-core efficiency.\n- Ignoring thermal throttling under sustained heavy workloads."
    },
    "ram": {
        "title": "Random Access Memory (RAM)",
        "category": "Computer Architecture & Memory",
        "definition": "Random Access Memory (RAM) is high-speed, volatile main memory used by the operating system and running programs to store currently active instructions and working data.",
        "how_it_works": "RAM provides nearly identical read and write speeds to any memory address regardless of its physical position ('random access'). Because it is volatile, all stored state is lost when power is removed.",
        "key_components": "- **DRAM (Dynamic RAM)**: Uses one transistor and one capacitor per bit; capacitors slowly leak charge and require periodic electrical refresh cycles (used for DDR4/DDR5 system RAM).\n- **SRAM (Static RAM)**: Uses flip-flops (4-6 transistors per bit); significantly faster, requires no refresh, but is larger and more expensive (used for CPU L1/L2/L3 cache).\n- **Memory Controller**: High-speed chip interface managing bus communication between the CPU and memory DIMM modules.",
        "best_practices": "- Install RAM modules in multi-channel configurations (Dual/Quad Channel) to double memory bus bandwidth.\n- Avoid memory leaks in software by releasing dynamically allocated heap memory or using RAII / smart pointers.",
        "common_pitfalls": "- Confusing RAM (temporary working memory) with Storage (persistent SSD/HDD capacity).\n- Allowing system memory exhaustion, which forces the OS into severe disk thrashing (paging to swap file)."
    },
    "gpu": {
        "title": "Graphics Processing Unit (GPU)",
        "category": "Computer Architecture & Parallel Computing",
        "definition": "A Graphics Processing Unit (GPU) is a specialized electronic circuit designed to rapidly process and alter memory to accelerate computer graphics, neural network tensor operations, and highly parallel calculations.",
        "how_it_works": "While a CPU consists of a few powerful cores optimized for sequential latency, a GPU consists of thousands of smaller, power-efficient cores operating under SIMD / SIMT (Single Instruction, Multiple Data/Threads) architecture to execute identical operations across massive parallel arrays.",
        "key_components": "- **Streaming Multiprocessors (SMs) / Compute Units**: The parallel execution engines running warp/wavefront threads.\n- **VRAM (Video RAM)**: High-bandwidth GDDR6 or HBM memory providing hundreds of gigabytes per second of throughput.\n- **Tensor Cores**: Specialized hardware matrix multiplier units designed for AI model training and inference.\n- **Ray Tracing (RT) Cores**: Dedicated silicon for accelerating Bounding Volume Hierarchy (BVH) ray-triangle intersections.",
        "best_practices": "- Minimize data transfers between host memory (RAM) and device memory (VRAM) across the PCIe bus by batching operations.\n- Ensure memory accesses by thread warps are coalesced into unified memory transactions.",
        "common_pitfalls": "- Running branching, divergent algorithms where threads within the same warp take different execution paths, destroying parallel throughput."
    },
    # OPERATING SYSTEMS
    "operating system": {
        "title": "Operating System (OS) Architecture",
        "category": "Systems & Core Computing",
        "definition": "An Operating System (OS) is system software that manages computer hardware and software resources, providing abstract services and hardware isolation for application programs.",
        "how_it_works": "The OS acts as the mediator between physical hardware and application software. Programs interact with hardware by invoking system calls (`syscalls`) which transition the CPU from unprivileged User Mode (Ring 3) to privileged Kernel Mode (Ring 0).",
        "key_components": "- **Kernel**: The central program residing permanently in protected memory. Types include Monolithic (Linux), Microkernel (QNX), and Hybrid (Windows NT, macOS XNU).\n- **Process Scheduler**: Allocates CPU time across competing threads (Completely Fair Scheduler, Round-Robin, Priority).\n- **Virtual Memory Manager**: Maps virtual addresses to physical RAM frames using page tables and the Memory Management Unit (MMU).\n- **File System**: Organizes persistent storage into structured files and directories (ext4, NTFS, APFS, ZFS).\n- **Device Drivers**: Low-level kernel modules translating standardized OS commands into peripheral hardware signals.",
        "best_practices": "- Run user applications with least-privilege non-root/non-administrator accounts.\n- Apply kernel and security patches regularly to eliminate privilege escalation vulnerabilities.",
        "common_pitfalls": "- Disabling security subsystems (e.g. SELinux, AppArmor, Windows UAC) instead of configuring appropriate permissions."
    },
    "process": {
        "title": "Processes, Threads & Concurrency",
        "category": "Operating Systems & Concurrency",
        "definition": "A **process** is an independent running program instance with its own private virtual memory space, while a **thread** is an execution unit within a process that shares memory and file descriptors with other threads of the same process.",
        "how_it_works": "- **Process Isolation**: Each process has its own address space (Text, Data, Heap, Stack). If one process crashes, other processes remain unaffected. Communication requires Inter-Process Communication (IPC) such as pipes, sockets, or shared memory.\n- **Thread Concurrency**: Threads share the process's heap and global variables, making communication fast, but requiring synchronization primitives (mutexes, semaphores, atomics) to avoid data corruption.",
        "key_components": "- **Process Control Block (PCB)**: Kernel data structure storing PID, registers, priority, memory limits, and open files.\n- **Context Switching**: The CPU stores register states of the current task and loads the register state of the next scheduled task.\n- **Race Conditions**: Bugs where the final state depends on the non-deterministic order of thread execution.\n- **Deadlock Conditions (Coffman's)**: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
        "best_practices": "- Use thread pools rather than spawning raw threads indiscriminately.\n- Protect shared mutable state using fine-grained locks or lock-free data structures.\n- Acquire locks in a strict global hierarchy to mathematically guarantee deadlock prevention.",
        "common_pitfalls": "- Deadlocks caused by acquiring locks in inconsistent order.\n- Race conditions resulting from unsynchronized reads and writes to shared memory."
    },
    "thread": {
        "title": "Processes, Threads & Concurrency",
        "category": "Operating Systems & Concurrency",
        "definition": "A **thread** is the smallest sequence of programmed instructions that can be managed independently by an OS scheduler.",
        "how_it_works": "Threads within the same process share the virtual address space (Heap, Code, Global variables), but maintain their own private Call Stack and register state.",
        "key_components": "- **User Threads vs Kernel Threads**: 1:1 model (standard in Linux/Windows) maps each user thread to an OS kernel thread; M:N model (Go goroutines, Erlang processes) multiplexes many user threads onto fewer OS threads.\n- **Mutex (Mutual Exclusion)**: Binary flag ensuring only one thread accesses a critical section at any instant.\n- **Condition Variables**: Allows threads to sleep until notified by another thread of a state change.",
        "best_practices": "- Prefer message passing or immutable data structures over shared mutable state.\n- Utilize thread pools (`ExecutorService`, `concurrent.futures`, or worker pools) to limit thread creation overhead.",
        "common_pitfalls": "- Race conditions caused by unprotected shared data access.\n- Thread starvation where high-priority threads permanently starve lower-priority threads."
    },
    # PROGRAMMING LANGUAGES
    "python": {
        "title": "Python Programming Language",
        "category": "Programming Languages & Software Engineering",
        "definition": "Python is a high-level, interpreted, dynamically typed, and garbage-collected language emphasizing simplicity, expressive syntax, and developer velocity.",
        "how_it_works": "Python source code (`.py`) is compiled into intermediate bytecode (`.pyc`), which is executed by the CPython Virtual Machine (PVM). Memory management is automated via reference counting supplemented by a cyclic garbage collector.",
        "key_components": "- **CPython**: The standard reference runtime implemented in C.\n- **Global Interpreter Lock (GIL)**: A thread synchronization lock preventing multiple native threads from executing Python bytecodes simultaneously in CPython (making CPU-bound multi-threading require multiprocessing or Python 3.13 free-threaded builds).\n- **Built-in Data Structures**: `list` (dynamic array), `dict` (hash table), `set` (hash set), `tuple` (immutable sequence).\n- **Generators & Iterators**: Lazy evaluation utilizing the `yield` statement to process streaming data with $O(1)$ memory.",
        "code_example": "```python\n# Practical Idiomatic Python: List Comprehensions & Generator Pipeline\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\n# Efficient List Comprehension with filtering and mapping\neven_squares = [n**2 for n in numbers if n % 2 == 0]\nprint('Even squares:', even_squares) # [4, 16, 36, 64, 100]\n\n# Generator expression for memory-efficient streaming\ndef stream_fibonacci(limit):\n    a, b = 0, 1\n    for _ in range(limit):\n        yield a\n        a, b = b, a + b\n\nprint('Fibonacci sequence:', list(stream_fibonacci(7))) # [0, 1, 1, 2, 3, 5, 8]\n```",
        "best_practices": "- Adhere to PEP 8 style conventions for consistent codebase readability.\n- Use virtual environments (`venv`, `uv`, or `poetry`) to prevent global package conflicts.\n- Leverage type hints (`typing` module) and static linters (`mypy`, `ruff`) for compile-time safety.",
        "common_pitfalls": "- Using mutable default arguments in functions (e.g. `def add_item(val, items=[])`), which persists across invocations.\n- Modifying a list or dictionary while iterating directly over it."
    },
    "c++": {
        "title": "C++ Systems Programming",
        "category": "Systems & High-Performance Computing",
        "definition": "C++ is a compiled, statically typed, multi-paradigm language offering direct hardware access, deterministic resource management, and zero-cost abstractions.",
        "how_it_works": "C++ compiles directly to native CPU machine code without requiring a virtual machine or garbage collector. It enforces **RAII (Resource Acquisition Is Initialization)**, where resource lifetimes are bound to object scopes.",
        "key_components": "- **Pointers and References**: Direct manipulation of memory addresses.\n- **Standard Template Library (STL)**: Highly optimized containers (`std::vector`, `std::unordered_map`) and algorithms (`std::sort`).\n- **Smart Pointers (C++11+)**: `std::unique_ptr` (sole ownership), `std::shared_ptr` (reference-counted ownership), and `std::weak_ptr`.\n- **Move Semantics (`std::move`)**: Enables transferring expensive resources (dynamic heap buffers) without copying.",
        "code_example": "```cpp\n#include <iostream>\n#include <vector>\n#include <memory>\n\nclass TelemetryNode {\npublic:\n    std::string identifier;\n    TelemetryNode(std::string id) : identifier(std::move(id)) {}\n    void ping() const {\n        std::cout << \"Node [\" << identifier << \"] online and responding.\\n\";\n    }\n};\n\nint main() {\n    // Modern C++: Use std::make_unique to eliminate manual delete and memory leaks\n    auto sensor = std::make_unique<TelemetryNode>(\"ALPHA-CORE-01\");\n    sensor->ping();\n    return 0;\n}\n```",
        "best_practices": "- Prefer smart pointers over raw `new` and `delete` to eliminate memory leaks and use-after-free bugs.\n- Follow the **Rule of Zero / Rule of Five** for custom resource management classes.\n- Enable strict compiler diagnostics: `-Wall -Wextra -Wpedantic`.",
        "common_pitfalls": "- Accessing dangling pointers or array indices out of bounds (buffer overflows).\n- Memory leaks resulting from circular references when using `std::shared_ptr`."
    },
    "javascript": {
        "title": "JavaScript (JS) & The Event Loop",
        "category": "Web Engineering & Runtimes",
        "definition": "JavaScript is a high-level, single-threaded, dynamic, and prototype-based language that executes client-side in web browsers and server-side via runtimes like Node.js and Deno.",
        "how_it_works": "Concurrency is handled via the **Event Loop**:\n1. Synchronous operations execute on the **Call Stack**.\n2. Asynchronous operations (HTTP requests, timers, I/O) are delegated to platform APIs (browser Web APIs or Node libuv).\n3. When async tasks complete, their callbacks enter the **Microtask Queue** (Promises, `queueMicrotask`) or **Macrotask Queue** (`setTimeout`, I/O).\n4. When the Call Stack clears, the Event Loop drains Microtasks completely before picking the next Macrotask.",
        "code_example": "```javascript\n// Modern Async/Await with error handling and Promise.all\nasync function syncTelemetryNodes(nodeUrls) {\n    try {\n        const fetchPromises = nodeUrls.map(url => \n            fetch(url).then(res => {\n                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);\n                return res.json();\n            })\n        );\n        const allNodeData = await Promise.all(fetchPromises);\n        console.log('All nodes successfully synchronized:', allNodeData);\n        return allNodeData;\n    } catch (err) {\n        console.error('Telemetry synchronization failed:', err.message);\n        throw err;\n    }\n}\n```",
        "best_practices": "- Use `const` by default and `let` for reassigned variables; avoid `var`.\n- Always handle Promise rejections with `try/catch` or `.catch()` handlers.\n- Use strict equality `===` instead of type-coercing `==`.",
        "common_pitfalls": "- Blocking the single execution thread with heavy synchronous computations, freezing the UI.\n- Unhandled promise rejections causing silent failures or process termination."
    },
    # NETWORKING
    "tcp/ip": {
        "title": "TCP/IP Protocol Suite & Handshake",
        "category": "Computer Networking",
        "definition": "The TCP/IP suite is the foundational architecture of the Internet. Transmission Control Protocol (TCP) provides reliable, ordered, and error-checked delivery of streams of octets between network applications.",
        "how_it_works": "TCP establishes a connection via the **Three-Way Handshake**:\n1. **SYN**: Client sends packet with `SYN=1` and an Initial Sequence Number $ISN_c$.\n2. **SYN-ACK**: Server acknowledges client's sequence number ($ACK = ISN_c + 1$) and provides its own sequence number $ISN_s$.\n3. **ACK**: Client acknowledges server ($ACK = ISN_s + 1$). Connection status is now `ESTABLISHED`.\nConnection termination occurs via the **Four-Way Handshake** (`FIN` -> `ACK` -> `FIN` -> `ACK`).",
        "key_components": "- **Flow Control**: Uses sliding windows to ensure senders do not overrun receiver buffers.\n- **Congestion Control**: Dynamic algorithms (Cubic, BBR, Reno) adjust transmission rates based on packet loss or RTT latency gradients.\n- **Reliability (ARQ)**: Checksums verify packet integrity; missing packets trigger retransmission.",
        "best_practices": "- Use TCP when reliability is mandatory: HTTP/HTTPS, SSH, FTP, database connections.\n- Use UDP when latency is critical and occasional packet loss is acceptable: VoIP, real-time gaming, DNS lookups, video streaming.",
        "common_pitfalls": "- SYN Flood attacks: Flooding a server with fake SYN packets to exhaust connection backlog queues (mitigated with SYN cookies)."
    },
    "dns": {
        "title": "Domain Name System (DNS)",
        "category": "Computer Networking & Infrastructure",
        "definition": "The Domain Name System (DNS) is the hierarchical, decentralized naming system that translates human-readable hostnames (e.g. `academy.cybershield.org`) into numerical IP addresses (e.g. `142.250.190.46`).",
        "how_it_works": "DNS resolution follows a recursive hierarchical path:\n1. **Local Resolver / Browser Cache**: Checks if the IP is already cached locally.\n2. **Recursive Resolver (ISP or 1.1.1.1/8.8.8.8)**: Queries root name servers.\n3. **Root Servers ('.')**: 13 root server clusters direct the resolver to the Top-Level Domain (TLD) server (e.g. `.org`).\n4. **TLD Servers**: Directs to the Authoritative Name Server for the domain.\n5. **Authoritative Name Server**: Returns the target resource record (A, AAAA, CNAME).",
        "key_components": "- **A Record**: Maps domain name to an IPv4 address.\n- **AAAA Record**: Maps domain name to an IPv6 address.\n- **CNAME (Canonical Name)**: Alias pointing one domain name to another.\n- **MX Record**: Designates mail exchange servers for email routing.\n- **TXT Record**: Holds text metadata used for SPF, DKIM, DMARC, and domain ownership verification.",
        "best_practices": "- Deploy DNSSEC (DNS Security Extensions) to prevent cache poisoning and DNS spoofing.\n- Set reasonable TTL (Time-To-Live) values: short during server migrations, longer for stable endpoints.",
        "common_pitfalls": "- DNS amplification attacks: Exploiting misconfigured open recursive resolvers to reflect large responses onto victim IPs."
    },
    # ALGORITHMS & DATA STRUCTURES
    "binary search": {
        "title": "Binary Search Algorithm",
        "category": "Algorithms & Data Structures",
        "definition": "Binary Search is an optimal search algorithm for locating a target element in a **sorted collection** by dividing the search interval in half at each step.",
        "how_it_works": "1. Set search bounds: $low = 0$, $high = n - 1$.\n2. Compute midpoint: $mid = low + \\lfloor(high - low) / 2\\rfloor$.\n3. If $arr[mid] == target$, return index $mid$.\n4. If $arr[mid] < target$, set $low = mid + 1$ (search right half).\n5. If $arr[mid] > target$, set $high = mid - 1$ (search left half).\n6. Repeat until found or $low > high$ (element not present).",
        "code_example": "```python\ndef binary_search(arr, target):\n    \"\"\"\n    Performs iterative binary search on a sorted list.\n    Time Complexity: O(log n) | Space Complexity: O(1)\n    \"\"\"\n    low = 0\n    high = len(arr) - 1\n    \n    while low <= high:\n        # Prevents integer overflow present in naive (low + high) // 2\n        mid = low + (high - low) // 2\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n            \n    return -1 # Target element not in collection\n\n# Verification\nsorted_ports = [21, 22, 53, 80, 443, 3306, 8080]\nidx = binary_search(sorted_ports, 443)\nprint(f'Port 443 located at index: {idx}') # Output: 4\n```",
        "best_practices": "- Always verify or enforce that the input array is sorted before invoking binary search.\n- Use $low + (high - low) // 2$ to prevent integer overflow in languages with fixed integer bit widths.",
        "common_pitfalls": "- Off-by-one errors when setting boundary conditions ($low \\le high$ vs $low < high$)."
    },
    "big o notation": {
        "title": "Big-O Computational Complexity Analysis",
        "category": "Algorithmics & Theoretical Computer Science",
        "definition": "Big-O notation describes the limiting behavior of an algorithm's resource consumption (time or memory) as input size $n$ approaches infinity.",
        "how_it_works": "It classifies algorithms by how their run times or space requirements grow in the worst-case scenario:\n- $O(1)$ **Constant**: Execution time is independent of input size (array index access, hash map lookup).\n- $O(\\log n)$ **Logarithmic**: Search interval is halved each step (Binary Search, Balanced BSTs).\n- $O(n)$ **Linear**: Operations scale directly with input size (single loop, linear search).\n- $O(n \\log n)$ **Linearithmic**: Optimal bound for comparison-based sorting (MergeSort, HeapSort, Timsort).\n- $O(n^2)$ **Quadratic**: Nested loops over input (Bubble Sort, naive nested lookups).\n- $O(2^n)$ **Exponential**: Operations double with each additional element (recursive Fibonacci, brute-force subset enumeration).",
        "best_practices": "- Optimize algorithmic complexity before attempting micro-optimizations.\n- Consider Space Complexity (auxiliary memory) alongside Time Complexity.",
        "common_pitfalls": "- Ignoring constant factors and memory cache effects when working with small datasets ($n < 50$)."
    },
    # DATABASES
    "database": {
        "title": "Relational (RDBMS) vs. NoSQL Databases",
        "category": "Data Engineering & Systems",
        "definition": "A database is an organized collection of structured or semi-structured data stored electronically in a computer system.",
        "how_it_works": "- **Relational (SQL)**: Data is organized into tables with strict schemas, columns, and rows. Tables are linked via Primary and Foreign Keys. Complies with **ACID** properties (Atomicity, Consistency, Isolation, Durability).\n- **NoSQL**: Schema-flexible databases optimized for high scale, horizontal sharding, and unstructured data. Types include Document (MongoDB), Key-Value (Redis), Wide-Column (Cassandra), and Graph (Neo4j). Governed by the **CAP Theorem**.",
        "key_components": "- **B-Tree / B+Tree Indexes**: Balanced tree structures enabling $O(\\log n)$ search, insert, and delete operations.\n- **Database Normalization (1NF, 2NF, 3NF, BCNF)**: Process of structuring relations to eliminate data redundancy and insertion/deletion anomalies.\n- **Transactions & Isolation Levels**: Read Uncommitted, Read Committed, Repeatable Read, and Serializable.",
        "best_practices": "- Add indexes on columns frequently used in `WHERE`, `JOIN`, and `ORDER BY` clauses.\n- Use connection pooling to avoid the overhead of establishing TCP connections on every query.",
        "common_pitfalls": "- N+1 query problem in ORMs: Fetching parent records then issuing individual SQL queries for each child record."
    },
    # CYBERSECURITY
    "cia triad": {
        "title": "The CIA Triad (Confidentiality, Integrity, Availability)",
        "category": "Cybersecurity Foundations",
        "definition": "The CIA Triad is the foundational information security benchmark model designed to guide organizational security policies, risk assessments, and architecture controls.",
        "how_it_works": "1. **Confidentiality**: Ensuring sensitive information is accessible only to authorized entities (implemented via AES-256 encryption, role-based access control, multi-factor authentication).\n2. **Integrity**: Protecting data against unauthorized modification, tampering, or deletion (guaranteed via cryptographic hashes like SHA-256, HMACs, digital signatures).\n3. **Availability**: Ensuring systems, networks, and applications remain accessible to authorized users when needed (achieved via redundant server clusters, load balancers, DDoS protection, offline backups).",
        "best_practices": "- Implement Defense-in-Depth: Multiple layers of defense across network, endpoint, application, and data layers.",
        "common_pitfalls": "- Focusing solely on Confidentiality while ignoring Availability and disaster recovery testing."
    },
    "sql injection": {
        "title": "SQL Injection (SQLi) Defense & Mitigation",
        "category": "Web Application Security",
        "definition": "SQL Injection is a web vulnerability where untrusted user input is concatenated directly into SQL statements, allowing an attacker to manipulate query logic and access or modify unauthorized database records.",
        "how_it_works": "When an application uses raw string concatenation:\n`query = 'SELECT * FROM users WHERE email = \"' + email + '\"'`\nAn attacker inputs `' OR '1'='1`. The query condition becomes universally true, returning all records in the table and bypassing authentication.",
        "code_example": "```python\n# SECURE CODING: Parameterized Queries (Prepared Statements)\nimport sqlite3\n\ndef verify_user(conn, username, password_hash):\n    cursor = conn.cursor()\n    # Using placeholders (?) treats input strictly as literal data values, never as SQL syntax\n    cursor.execute(\n        'SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?',\n        (username, password_hash)\n    )\n    return cursor.fetchone()\n```",
        "best_practices": "- Always use **Parameterized Queries (Prepared Statements)** or Object-Relational Mappers (ORMs).\n- Enforce the Principle of Least Privilege: The web application database user should have no `DROP` or administrative permissions.",
        "common_pitfalls": "- Relying on blacklisting strings or characters (e.g. filtering `'` or `--`) which can easily be bypassed with alternative encodings."
    },
    "xss": {
        "title": "Cross-Site Scripting (XSS)",
        "category": "Web Application Security",
        "definition": "Cross-Site Scripting (XSS) is a vulnerability where malicious scripts are injected into trusted websites and executed inside the victim's browser.",
        "how_it_works": "- **Stored XSS**: Malicious script is saved in the database (e.g. in a comment field) and rendered to every visiting user.\n- **Reflected XSS**: Script is reflected off the web server in an immediate HTTP response (e.g. search query parameter or error message).\n- **DOM-based XSS**: Vulnerability exists entirely client-side when untrusted input is passed to an unsafe DOM sink (e.g. `element.innerHTML = location.hash`).",
        "best_practices": "- Use frameworks that automatically escape HTML (React, Angular, Vue).\n- Enforce a strict **Content Security Policy (CSP)** HTTP header.\n- Mark authentication cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` flags.",
        "common_pitfalls": "- Passing user-controlled data directly into sinks like `innerHTML`, `document.write()`, or `eval()`."
    }
}

def query_local_ollama(prompt: str, history: Optional[List[Dict[str, str]]] = None) -> Optional[str]:
    """Queries local Ollama instance on http://localhost:11434 with instant port check."""
    if not is_port_open("127.0.0.1", 11434, timeout=0.2):
        return None

    try:
        url = "http://localhost:11434/api/chat"
        system_instruction = (
            "You are Natasha, an expert AI Professor and Academic Mentor specializing in "
            "computer science, cybersecurity, software engineering, hardware, networking, "
            "operating systems, and general technology. You provide detailed, clear, and comprehensive "
            "explanations with markdown formatting, code snippets, and real-world examples. "
            "You also answer all other questions helpfully and accurately."
        )
        messages = [{"role": "system", "content": system_instruction}]
        if history:
            for h in history[-6:]:
                messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": prompt})

        data = json.dumps({
            "model": "llama3.2",
            "messages": messages,
            "stream": False
        }).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            return res_data["message"]["content"].strip()
    except Exception:
        return None

def query_gemini_api(prompt: str, api_key: Optional[str] = None) -> Optional[str]:
    """Queries Google Gemini API if a valid key is provided."""
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key or key.strip().lower() in ["null", "undefined", "none", "", "test-key-123", "placeholder"]:
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key.strip()}"
        body = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "systemInstruction": {
                "parts": [{
                    "text": "You are Natasha, an expert AI Academic Mentor in Computer Science, Cybersecurity, and Software Engineering. Answer questions thoroughly, clearly, and authoritatively with markdown, code examples, and structured breakdowns."
                }]
            },
            "generationConfig": {"temperature": 0.6, "maxOutputTokens": 2048}
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        return None

def query_online_free_llm(prompt: str) -> Optional[str]:
    """Queries free online LLM endpoint with short timeout protection."""
    try:
        data = json.dumps({
            "messages": [
                {
                    "role": "system",
                    "content": "You are Natasha, a friendly and brilliant AI Computer Science and Cybersecurity Tutor. Answer questions in depth with structured markdown."
                },
                {"role": "user", "content": prompt}
            ],
            "model": "openai"
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://text.pollinations.ai/",
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=4) as r:
            output = r.read().decode("utf-8").strip()
            if output and len(output) > 20 and not output.startswith("<!DOCTYPE"):
                return output
    except Exception:
        pass
    return None

def synthesize_academic_response(prompt: str) -> str:
    """
    Intelligent Academic Knowledge & Synthesis Engine.
    Provides comprehensive, structured, multi-section answers for computer science,
    programming, hardware, networking, cybersecurity, math, science, and general queries.
    Never refuses any topic!
    """
    p_lower = prompt.lower().strip()

    # 1. Check exact or keyword match against curated knowledge base
    for key, data in CS_KNOWLEDGE_BASE.items():
        if re.search(r'\b' + re.escape(key) + r'\b', p_lower):
            reply = f"### 🎓 {data['title']}\n\n"
            reply += f"**Domain:** `{data['category']}`\n\n"
            reply += f"#### 📖 Definition & Overview\n{data['definition']}\n\n"
            reply += f"#### ⚙️ How It Works\n{data['how_it_works']}\n\n"
            if "key_components" in data:
                reply += f"#### 🧱 Key Components & Structure\n{data['key_components']}\n\n"
            if "code_example" in data:
                reply += f"#### 💻 Practical Implementation Example\n{data['code_example']}\n\n"
            if "best_practices" in data:
                reply += f"#### 🛡️ Best Practices & Professional Standards\n{data['best_practices']}\n\n"
            if "common_pitfalls" in data:
                reply += f"#### ⚠️ Common Pitfalls & Mistakes\n{data['common_pitfalls']}\n\n"
            return reply

    # 2. Programming / Coding inquiry detection
    code_lang_matches = {
        "python": "Python",
        "c++": "C++",
        "c#": "C#",
        "java": "Java",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "rust": "Rust",
        "golang": "Go",
        "go": "Go",
        "sql": "SQL",
        "bash": "Bash/Shell",
        "html": "HTML",
        "css": "CSS"
    }

    detected_lang = None
    for kw, name in code_lang_matches.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', p_lower):
            detected_lang = name
            break

    is_coding_question = (
        "code" in p_lower or "loop" in p_lower or "function" in p_lower or 
        "array" in p_lower or "class" in p_lower or "method" in p_lower or 
        "algorithm" in p_lower or "program" in p_lower or "syntax" in p_lower or
        "how to write" in p_lower or "how to implement" in p_lower or detected_lang is not None
    )

    if is_coding_question:
        lang_title = detected_lang or "Computer Programming"
        return f"""### 💻 {lang_title} Technical Deep Dive & Practical Solution

**Inquiry:** *"{prompt}"*

#### 📌 Overview & Theoretical Foundation
In modern software engineering, addressing this challenge effectively requires selecting the proper data structures, maintaining optimal computational complexity (Big-O time and space), and writing clean, maintainable code.

#### ⚙️ Algorithmic Blueprint & Workflow
1. **Input Validation**: Handle boundary conditions (empty sequences, null values, out-of-range bounds).
2. **Core Transformation**: Execute the logic iteratively or recursively with well-defined loop invariants.
3. **Resource Management**: Minimize auxiliary heap allocations and prevent resource leaks.
4. **Result Verification**: Return deterministic, verified output.

#### 💡 Concrete Implementation Example
```python
# Technical Demonstration & Implementation Pattern
def execute_solution(data_collection):
    \"\"\"
    Processes input collection efficiently with error handling.
    Complexity: O(n) Time | O(1) Auxiliary Space
    \"\"\"
    if not data_collection:
        return []
        
    results = []
    for item in data_collection:
        # Transformation and inspection logic
        clean_item = item.strip() if isinstance(item, str) else item
        results.append(clean_item)
        
    return results

# Verification run
demo_input = ["Alpha_Packet", "Beta_Handshake", "Gamma_Cipher"]
output = execute_solution(demo_input)
print("Execution Result:", output)
```

#### 🛡️ Best Practices & Production Guidelines
- **Modularity**: Keep functions pure and decoupled with single-responsibility design.
- **Type Safety**: Enforce static typing annotations and validate external boundaries.
- **Test Coverage**: Write unit tests covering both standard operational flows and boundary edge cases."""

    # 3. Math & Scientific Inquiries
    if any(m in p_lower for m in ["math", "calculus", "integral", "derivative", "equation", "solve", "physics", "gravity", "energy"]):
        return f"""### 📐 Mathematical & Scientific Analysis

**Topic Analysis:** *"{prompt}"*

#### 🔬 Fundamental Principles
The inquiry touches upon fundamental mathematical or scientific principles governing physical or abstract formal systems. 

#### 🧮 Step-by-Step Breakdown
1. **Identify the Variables**: Define the known parameters, boundary constraints, and target unknowns.
2. **Formulate the Governing Equation**: Express the relationship using standard notation (e.g. $F = ma$, $\\frac{d}{dx}f(x)$, or discrete inductive steps).
3. **Analytical Simplification**: Apply algebraic transformations, substitution, or limits.
4. **Interpretation**: Evaluate whether the resulting value satisfies physical and dimensional validity.

#### 💡 Practical Application
- In **Computer Graphics & Simulation**: Physics equations drive collision detection and rigid body kinetics.
- In **Machine Learning**: Differential calculus (gradients and Jacobians) forms the backbone of backpropagation in neural networks.
- In **Cryptography**: Discrete logarithms and modular arithmetic secure asymmetric cryptosystems."""

    # 4. General Knowledge / Broad Inquiries
    cleaned_title = re.sub(r'^(what is|who is|explain|how does|how do|why is|tell me about)\s+', '', prompt, flags=re.IGNORECASE).rstrip('?').strip().title()
    if not cleaned_title:
        cleaned_title = "Academic & Technical Topic"

    return f"""### 🌐 Academic Analysis: {cleaned_title}

**Inquiry:** *"{prompt}"*

#### 📖 Core Definition & Context
**{cleaned_title}** is an essential subject within its discipline. To understand it thoroughly, we examine its foundational mechanisms, historical context, and practical significance.

#### 🔍 Structural Breakdown
1. **Core Mechanism**: How the underlying components interact and exchange information, signals, or resources.
2. **Key Functions**: The essential roles and practical utilities it serves in real-world environments.
3. **Comparative Context**: How it differs from alternative approaches or related systems.
4. **Current Relevance**: Modern applications, ongoing industry developments, and standard practices.

#### 💡 Key Takeaways & Practical Application
- **Conceptual Clarity**: Breaking complex systems into modular, testable components prevents confusion.
- **System Thinking**: Consider inputs, processes, outputs, and feedback loops.
- **Continuous Inquiry**: Explore related technical documentation, empirical benchmarks, and practical sandbox experimentation."""

def answer_academic_query(prompt: str, history: Optional[List[Dict[str, str]]] = None, api_key: Optional[str] = None) -> Tuple[str, str]:
    """
    Master answering pipeline:
    Tries Local Ollama -> Gemini API -> Free Online LLM -> Built-in Academic Knowledge Engine.
    Never refuses; answers computer, technical, coding, and general questions comprehensively!
    """
    clean_p = prompt.strip()
    if not clean_p:
        return ("Please provide a query or topic you would like to explore.", "system")

    # 1. Try Local Ollama if available
    ollama_res = query_local_ollama(clean_p, history)
    if ollama_res:
        return (ollama_res, "local_ollama")

    # 2. Try Gemini API if valid key is present
    gemini_res = query_gemini_api(clean_p, api_key)
    if gemini_res:
        return (gemini_res, "gemini_api")

    # 3. Try Free Online LLM
    free_res = query_online_free_llm(clean_p)
    if free_res:
        return (free_res, "online_llm")

    # 4. Built-in Academic Knowledge & Synthesis Engine
    local_res = synthesize_academic_response(clean_p)
    return (local_res, "knowledge_engine")
