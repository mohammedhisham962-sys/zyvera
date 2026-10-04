import re

with open('src/js/app_react.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Read the enhanced FacultyStudentHubPage code
with open('scratch/new_faculty_hub.js', 'r', encoding='utf-8') as f:
    new_faculty_hub = f.read()

# Replace FacultyStudentHubPage
pattern = re.compile(r'function FacultyStudentHubPage\(\{ user, onRecordActivity \}\) \{[\s\S]+?function AuthModal', re.MULTILINE)
match = pattern.search(code)
if match:
    code = code[:match.start()] + new_faculty_hub.strip() + "\n\n/* ==========================================================================\n   AUTHENTICATION MODAL\n   ========================================================================== */\nfunction AuthModal" + code[match.end():]
    print("1. FacultyStudentHubPage replaced with Admin Vault included.")
else:
    print("WARNING: FacultyStudentHubPage pattern not found!")

# 2. Update subtitle in CreativeAuthLandingPage
old_p = """                        <p className="text-xs sm:text-sm text-[#5D4B60] mt-1.5 max-w-md mx-auto">
                            {authMode === 'login' 
                                ? 'Authenticate with single sign-on or enter your institutional credentials to access live operational theaters.'
                                : 'Enroll into the Institute of Threat Defense to access certified hands-on laboratories and real-time SOC consoles.'}
                        </p>"""

new_p = """                        <p className="text-xs sm:text-sm text-[#5D4B60] mt-1.5 max-w-md mx-auto">
                            {authMode === 'login' 
                                ? 'Unified login gateway for Students, Faculty & Admin. Faculty credentials are generated and provided exclusively by Admin (de4thnote).'
                                : 'Enroll into the Institute of Threat Defense as Cadet. (Faculty accounts are strictly issued and managed by the Admin).'}
                        </p>"""

if old_p in code:
    code = code.replace(old_p, new_p, 1)
    print("2. CreativeAuthLandingPage subtitle updated.")
else:
    print("WARNING: old_p subtitle not found!")

# 3. Update faculty pill in CreativeAuthLandingPage
old_pill = """                                <i className="fa-solid fa-chalkboard-user text-[#7B287D]"></i>
                                <span>Faculty: professor_x</span>"""

new_pill = """                                <i className="fa-solid fa-chalkboard-user text-[#7B287D]"></i>
                                <span>Faculty: professor_x (Issued by Admin)</span>"""

if old_pill in code:
    code = code.replace(old_pill, new_pill, 1)
    print("3. CreativeAuthLandingPage faculty pill updated.")

# 4. Update faculty pill in AuthModal
old_modal_pill = """                    <button
                        type="button"
                        onClick={() => handleQuickFill('faculty')}
                        className="px-2 py-0.5 rounded bg-white border border-[#D9CEBF] text-[#4A154B] text-[10px] font-bold"
                    >
                        Faculty: professor_x
                    </button>"""

new_modal_pill = """                    <button
                        type="button"
                        onClick={() => handleQuickFill('faculty')}
                        className="px-2 py-0.5 rounded bg-white border border-[#D9CEBF] text-[#4A154B] text-[10px] font-bold"
                        title="Username and password issued by Admin"
                    >
                        Faculty: professor_x (Issued by Admin)
                    </button>"""

if old_modal_pill in code:
    code = code.replace(old_modal_pill, new_modal_pill, 1)
    print("4. AuthModal faculty pill updated.")

# Check token balances
counts = {'{': 0, '}': 0, '(': 0, ')': 0, '[': 0, ']': 0}
for char in code:
    if char in counts:
        counts[char] += 1

print('Braces delta:', counts['{'] - counts['}'])
print('Parens delta:', counts['('] - counts[')'])
print('Brackets delta:', counts['['] - counts[']'])

if counts['{'] == counts['}'] and counts['('] == counts[')'] and counts['['] == counts[']']:
    with open('src/js/app_react.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: src/js/app_react.js updated successfully!")
else:
    print("ERROR: Token delta is not 0. Write aborted.")
