import re

# Read current app_react.js
with open('src/js/app_react.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update AcademyNavbar navigation links based on user role
target_nav = """    const navLinks = [
        { id: 'home', label: 'Academy Home', icon: 'fa-landmark' },
        { id: 'courses', label: 'Curriculum & Labs', icon: 'fa-graduation-cap' },
        { id: 'academic', label: 'Academic Control Hub', icon: 'fa-building-columns' },
        { id: 'toolkit', label: 'Security Toolkit', icon: 'fa-toolbox' },
        { id: 'intel', label: 'Threat Intel', icon: 'fa-shield-halved' },
        { id: 'assessment', label: 'Assessments', icon: 'fa-clipboard-check' },
        { id: 'soc', label: 'SOC Console', icon: 'fa-tower-observation' },
        { id: 'mentor', label: 'AI Mentor', icon: 'fa-brain' },
    ];

    if (user && (user.role === 'faculty' || user.role === 'admin')) {
        navLinks.push({ id: 'faculty', label: 'Faculty Student Hub', icon: 'fa-chalkboard-user' });
    }"""

replacement_nav = """    // Student-accessible modules: Learn & Try the Tools
    const navLinks = [
        { id: 'home', label: 'Academy Home', icon: 'fa-landmark' },
        { id: 'courses', label: 'Curriculum & Labs', icon: 'fa-graduation-cap' }, // Learning
        { id: 'toolkit', label: 'Security Toolkit', icon: 'fa-toolbox' }, // Try tools
        { id: 'intel', label: 'Threat Intel', icon: 'fa-shield-halved' }, // Try tools
        { id: 'assessment', label: 'Assessments', icon: 'fa-clipboard-check' }, // Try tools
        { id: 'soc', label: 'SOC Console', icon: 'fa-tower-observation' }, // Try tools
        { id: 'mentor', label: 'AI Mentor', icon: 'fa-brain' }, // Learning
    ];

    // Administrative Control Hub (Admin only)
    if (user && user.role === 'admin') {
        navLinks.splice(2, 0, { id: 'academic', label: 'Academic Control Hub', icon: 'fa-building-columns' });
    }

    // Live Monitoring Telemetry (Monitoring only done by Admin and Faculty)
    if (user && (user.role === 'faculty' || user.role === 'admin')) {
        navLinks.push({ id: 'faculty', label: 'Live Monitoring Hub', icon: 'fa-chalkboard-user' });
    }"""

if target_nav in code:
    code = code.replace(target_nav, replacement_nav, 1)
    print("1. AcademyNavbar navLinks updated according to RBAC.")
else:
    print("WARNING: target_nav not found!")

# 2. Update AcademicControlHubPage with student access guard
target_hub_guard = """function AcademicControlHubPage({ user, onOpenAuth, onSwitchToLab }) {
    const [hubTab, setHubTab] = useState('leaderboard');"""

replacement_hub_guard = """function AcademicControlHubPage({ user, onOpenAuth, onSwitchToLab }) {
    const [hubTab, setHubTab] = useState('leaderboard');

    // Students have access only to learn and try tools
    if (user && user.role === 'student') {
        return (
            <div className="section-container py-16">
                <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-[#E8DFD5] shadow-lg text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#4A154B] text-white flex items-center justify-center text-xl mx-auto shadow-md">
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#221224]">Cadet Learning Access</h2>
                    <p className="text-sm text-[#5D4B60]">
                        Cadets have permission to learn in hands-on laboratories and try diagnostic security tools. Administrative desks and registrar configurations are reserved for Staff & Administrators.
                    </p>
                    <div className="flex justify-center gap-3 pt-4 border-t border-[#F0EAE2]">
                        <button onClick={() => onSwitchToLab('crypto')} className="btn btn-primary text-xs py-2 px-4 shadow-sm">
                            <i className="fa-solid fa-laptop-code mr-1.5"></i> Launch Practical Labs
                        </button>
                    </div>
                </div>
            </div>
        );
    }"""

if target_hub_guard in code:
    code = code.replace(target_hub_guard, replacement_hub_guard, 1)
    print("2. AcademicControlHubPage student guard added.")
else:
    print("WARNING: target_hub_guard not found!")

# Verify token balance
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
    print("Saved app_react.js successfully!")
else:
    print("ERROR: Token delta is not 0, aborted.")
