import re

# Read app_react.js
path = "src/js/app_react.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update AcademicControlHubPage default lab from 'crypto' to 'intro-cia'
content = content.replace("onSwitchToLab('crypto')", "onSwitchToLab('intro-cia')")

# 2. Update HomePage featured tracks to highlight Beginner Foundations
old_featured_marker = """            {/* Featured Academic Curriculum Tracks */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#221224]">Featured Academic Pathways</h2>
                        <p className="text-sm text-[#5D4B60]">Structured modular courses with real terminal challenges</p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('courses')}>
                        <span>View All Modules</span>
                        <i className="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                </div>

                <div className="grid-3">
                    {/* Track 1: Cryptography */}"""

new_featured_section = """            {/* Featured Academic Curriculum Tracks */}
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B287D] dark:text-[#DEC0E1] uppercase tracking-wider mb-1">
                            <i className="fa-solid fa-graduation-cap"></i> Core Beginner Curriculum
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#221224] dark:text-[#FAF5FB]">Beginner Cybersecurity Pathways</h2>
                        <p className="text-sm text-[#5D4B60] dark:text-[#D4C3D8]">Foundational courses designed specifically for newcomers to ethical defense and security operations</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('courses')}>
                        <span>View Full 8-Course Beginner Syllabus</span>
                        <i className="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                </div>

                <div className="grid-3">
                    {/* Course 1: Foundations & CIA Triad */}
                    <div className="card card-hover flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="badge badge-plum">Fundamentals</span>
                                <span className="text-xs text-[#8A788F] font-semibold"><i className="fa-regular fa-clock mr-1"></i> 30 mins</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#221224] dark:text-[#FAF5FB]">Cybersecurity Foundations & CIA Triad</h3>
                            <p className="text-sm text-[#5D4B60] dark:text-[#D4C3D8] leading-relaxed">
                                Master Confidentiality, Integrity, and Availability. Model threat actors, audit security policy baselines, and investigate unauthorized cloud leaks.
                            </p>
                            <div className="space-y-2 pt-2 border-t border-[#F0EAE2] dark:border-[#382042] text-xs text-[#5D4B60] dark:text-[#D4C3D8]">
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> CIA Triad & Threat Actor Models</div>
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> Cloud S3 Bucket Leak Incident Audit</div>
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> Earn +150 XP Cadet Clearance</div>
                            </div>
                        </div>
                        <div className="pt-6 mt-4 border-t border-[#F0EAE2] dark:border-[#382042] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="badge badge-green"><i className="fa-solid fa-seedling mr-1"></i> Beginner 01</span>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => onStartLab('intro-cia')}>
                                Start Lab &rarr;
                            </button>
                        </div>
                    </div>

                    {/* Course 2: Networking Essentials */}
                    <div className="card card-hover flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="badge badge-plum">Networking</span>
                                <span className="text-xs text-[#8A788F] font-semibold"><i className="fa-regular fa-clock mr-1"></i> 45 mins</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#221224] dark:text-[#FAF5FB]">Networking & Protocol Essentials</h3>
                            <p className="text-sm text-[#5D4B60] dark:text-[#D4C3D8] leading-relaxed">
                                Learn the OSI 7-layer model, TCP/IP stack, critical service ports (21, 22, 53, 80, 443), the 3-way handshake, and packet capture triage.
                            </p>
                            <div className="space-y-2 pt-2 border-t border-[#F0EAE2] dark:border-[#382042] text-xs text-[#5D4B60] dark:text-[#D4C3D8]">
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> TCP 3-Way Handshake (SYN/ACK)</div>
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> Plaintext vs Encrypted Traffic Triage</div>
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> Earn +200 XP Certification Credit</div>
                            </div>
                        </div>
                        <div className="pt-6 mt-4 border-t border-[#F0EAE2] dark:border-[#382042] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="badge badge-green"><i className="fa-solid fa-seedling mr-1"></i> Beginner 02</span>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => onStartLab('net-protocols')}>
                                Start Lab &rarr;
                            </button>
                        </div>
                    </div>

                    {/* Course 3: Linux CLI & OS Defense */}
                    <div className="card card-hover flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="badge badge-plum">Linux Security</span>
                                <span className="text-xs text-[#8A788F] font-semibold"><i className="fa-regular fa-clock mr-1"></i> 40 mins</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#221224] dark:text-[#FAF5FB]">Linux CLI & Terminal Defense</h3>
                            <p className="text-sm text-[#5D4B60] dark:text-[#D4C3D8] leading-relaxed">
                                Practical command-line defense. Navigate directory structures, audit /etc/passwd for unauthorized backdoors, and remediate permissions with chmod.
                            </p>
                            <div className="space-y-2 pt-2 border-t border-[#F0EAE2] dark:border-[#382042] text-xs text-[#5D4B60] dark:text-[#D4C3D8]">
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> Octal Permissions (chmod 600/755)</div>
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> Linux User & Group Account Audit</div>
                                <div className="flex items-center gap-2"><i className="fa-solid fa-check text-[#166534] dark:text-[#4ADE80]"></i> Earn +200 XP Certification Credit</div>
                            </div>
                        </div>
                        <div className="pt-6 mt-4 border-t border-[#F0EAE2] dark:border-[#382042] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="badge badge-green"><i className="fa-solid fa-seedling mr-1"></i> Beginner 03</span>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => onStartLab('linux-basics')}>
                                Start Lab &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </div>"""

# Replace in HomePage
if old_featured_marker in content:
    # Find until the end of the grid-3
    end_marker = "            {/* Academic Notices & Dean's Bulletins */}"
    start_pos = content.find("            {/* Featured Academic Curriculum Tracks */}")
    end_pos = content.find(end_marker)
    if start_pos != -1 and end_pos != -1:
        content = content[:start_pos] + new_featured_section + "\n\n" + content[end_pos:]
        print("Updated HomePage featured curriculum section.")
    else:
        print("Could not find start/end positions for HomePage featured.")
else:
    print("Old featured marker not exact match, checking alternative.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Step 1 done.")
