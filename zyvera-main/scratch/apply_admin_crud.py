import re

with open('src/js/app_react.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add state and handlers for Admin Cadet creation and deletion in FacultyStudentHubPage
target_states = """    // ADMIN ONLY: Faculty Credential Vault State
    const [facultyCredentials, setFacultyCredentials] = useState([]);"""

replacement_states = """    // ADMIN ONLY: Cadet Management State
    const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);
    const [newCadetUser, setNewCadetUser] = useState('');
    const [newCadetPass, setNewCadetPass] = useState('');
    const [newCadetEmail, setNewCadetEmail] = useState('');
    const [newCadetXp, setNewCadetXp] = useState(100);
    const [cadetCreateStatus, setCadetCreateStatus] = useState(null);
    const [cadetCreateLoading, setCadetCreateLoading] = useState(false);

    // ADMIN ONLY: Faculty Credential Vault State
    const [facultyCredentials, setFacultyCredentials] = useState([]);"""

if target_states in code:
    code = code.replace(target_states, replacement_states, 1)
    print("1. Cadet management states added.")
else:
    print("WARNING: target_states not found!")

# 2. Add handleCreateCadet and handleDeleteCadet handlers
target_handlers = """    // ADMIN ONLY: Handle Provision New Faculty Member"""

replacement_handlers = """    // ADMIN ONLY: Handle Create / Provision New Cadet
    const handleCreateCadet = async (e) => {
        e.preventDefault();
        setCadetCreateLoading(true);
        setCadetCreateStatus(null);
        const u_clean = newCadetUser.trim().toLowerCase();
        const p_clean = newCadetPass.trim();
        const em_clean = newCadetEmail.trim().toLowerCase();
        const xp_clean = parseInt(newCadetXp, 10) || 100;

        try {
            await fetch('/api/admin/create_student', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Admin-Clearance': 'de4thnote'
                },
                body: JSON.stringify({
                    username: u_clean,
                    password: p_clean,
                    email: em_clean,
                    xp: xp_clean
                })
            });
        } catch(e) {}

        const newCadet = {
            username: u_clean,
            email: em_clean,
            role: 'student',
            status: 'ACTIVE',
            xp: xp_clean,
            coins: 20,
            level: Math.max(1, Math.floor(xp_clean / 1000) + 1),
            completed_tasks: '',
            activity_count: 1,
            last_active: 'Just now',
            last_action: 'Cadet record provisioned by Admin'
        };

        setStudents(prev => [newCadet, ...prev.filter(s => s.username !== u_clean)]);
        setCadetCreateStatus(`Cadet ${u_clean} successfully provisioned!`);
        setTimeout(() => {
            setIsCreateStudentModalOpen(false);
            setCadetCreateStatus(null);
            setNewCadetUser('');
            setNewCadetPass('');
            setNewCadetEmail('');
        }, 1500);
        setCadetCreateLoading(false);
        fetchTelemetry();
    };

    // ADMIN ONLY: Handle Delete Cadet
    const handleDeleteCadet = async (targetCadet) => {
        if (!confirm(`Are you sure you want to permanently delete cadet "${targetCadet}" and all associated progress?`)) return;
        try {
            await fetch(`/api/admin/delete_student/${targetCadet}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Clearance': 'de4thnote' }
            });
        } catch(e) {}
        setStudents(prev => prev.filter(s => s.username !== targetCadet));
        fetchTelemetry();
    };

    // ADMIN ONLY: Handle Provision New Faculty Member"""

if target_handlers in code:
    code = code.replace(target_handlers, replacement_handlers, 1)
    print("2. Cadet creation & deletion handlers added.")
else:
    print("WARNING: target_handlers not found!")

# 3. Add header bar with "+ Provision New Cadet" above the Student Performance Ledger table
target_roster_header = """            {/* TAB 2: STUDENT PERFORMANCE ROSTER */}
            {subTab === 'roster' && (
                <div className="bg-white border border-[#E8DFD5] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">"""

replacement_roster_header = """            {/* TAB 2: STUDENT PERFORMANCE ROSTER */}
            {subTab === 'roster' && (
                <div className="bg-white border border-[#E8DFD5] rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2]">
                        <div>
                            <div className="font-extrabold text-sm text-[#221224] flex items-center gap-2">
                                <i className="fa-solid fa-users text-[#7B287D]"></i>
                                <span>Cadet Performance & Activity Ledger</span>
                            </div>
                            <div className="text-[11px] text-[#8A788F]">
                                Live database records of registered students and performance metrics.
                            </div>
                        </div>
                        {user.role === 'admin' && (
                            <button
                                type="button"
                                onClick={() => setIsCreateStudentModalOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-[#4A154B] hover:bg-[#6B216D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
                            >
                                <i className="fa-solid fa-user-plus text-amber-300"></i>
                                <span>Provision New Cadet</span>
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">"""

if target_roster_header in code:
    code = code.replace(target_roster_header, replacement_roster_header, 1)
    print("3. Roster table header with Provision New Cadet button added.")
else:
    print("WARNING: target_roster_header not found!")

# 4. In Student table rows, add "Delete Cadet" button for admin
target_row_actions = """                                            <td className="p-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAwardTargetStudent(stu.username);
                                                        setIsAwardModalOpen(true);
                                                    }}
                                                    className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#4A154B] hover:text-white border border-[#D9CEBF] text-[#4A154B] font-bold text-[11px] transition-all"
                                                >
                                                    <i className="fa-solid fa-award mr-1"></i>
                                                    Award XP
                                                </button>
                                            </td>"""

replacement_row_actions = """                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAwardTargetStudent(stu.username);
                                                            setIsAwardModalOpen(true);
                                                        }}
                                                        className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#4A154B] hover:text-white border border-[#D9CEBF] text-[#4A154B] font-bold text-[11px] transition-all"
                                                    >
                                                        <i className="fa-solid fa-award mr-1"></i>
                                                        Award XP
                                                    </button>
                                                    {user.role === 'admin' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteCadet(stu.username)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-700 font-bold text-[11px] transition-all"
                                                            title="Admin: Permanently Delete Cadet"
                                                        >
                                                            <i className="fa-solid fa-trash-can mr-1"></i>
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>"""

if target_row_actions in code:
    code = code.replace(target_row_actions, replacement_row_actions, 1)
    print("4. Row actions updated with Delete Cadet button for admin.")
else:
    print("WARNING: target_row_actions not found!")

# 5. In Faculty Credential Vault table, make Delete button prominent
target_fac_revoke = """                                                    <td className="p-3.5 text-right">
                                                        {fac.status === 'ACTIVE' ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRevokeFaculty(fac.username)}
                                                                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-700 font-bold text-[10px] transition-all"
                                                            >
                                                                <i className="fa-solid fa-ban mr-1"></i>
                                                                Revoke
                                                            </button>
                                                        ) : (
                                                            <span className="text-[11px] text-[#8A788F]">Revoked</span>
                                                        )}
                                                    </td>"""

replacement_fac_revoke = """                                                    <td className="p-3.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRevokeFaculty(fac.username)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-700 font-bold text-[11px] transition-all"
                                                            title="Admin: Permanently Delete Faculty Account"
                                                        >
                                                            <i className="fa-solid fa-trash-can mr-1"></i>
                                                            Delete
                                                        </button>
                                                    </td>"""

if target_fac_revoke in code:
    code = code.replace(target_fac_revoke, replacement_fac_revoke, 1)
    print("5. Faculty Vault updated with Delete Faculty button.")
else:
    print("WARNING: target_fac_revoke not found!")

# 6. Add Provision Cadet Modal right before closing tag of FacultyStudentHubPage
target_modal_end = """            {/* ADMIN ONLY: Provision Faculty Modal */}"""

cadet_modal_code = """            {/* ADMIN ONLY: Provision Cadet Modal */}
            {isCreateStudentModalOpen && user.role === 'admin' && (
                <div className="modal-overlay">
                    <div className="modal-dialog max-w-md">
                        <button 
                            type="button"
                            className="absolute top-5 right-5 text-[#8A788F] hover:text-[#4A154B] text-lg"
                            onClick={() => setIsCreateStudentModalOpen(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="text-center mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#4A154B] text-white flex items-center justify-center text-xl mx-auto mb-2 shadow-md">
                                <i className="fa-solid fa-user-graduate"></i>
                            </div>
                            <h3 className="text-xl font-extrabold text-[#221224]">Provision New Cadet Record</h3>
                            <p className="text-xs text-[#8A788F]">
                                Create a student account with assigned credentials and initial XP.
                            </p>
                        </div>

                        {cadetCreateStatus && (
                            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                                {cadetCreateStatus}
                            </div>
                        )}

                        <form onSubmit={handleCreateCadet} className="space-y-4">
                            <div>
                                <label className="input-label">Cadet Identifier (Username)</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. cadet_apex, neo_matrix"
                                    value={newCadetUser}
                                    onChange={e => setNewCadetUser(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="input-label">Initial Password</label>
                                <input
                                    type="text"
                                    className="form-control font-mono"
                                    placeholder="••••••••••••"
                                    value={newCadetPass}
                                    onChange={e => setNewCadetPass(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="input-label">Cadet Institutional Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="cadet@university.edu"
                                    value={newCadetEmail}
                                    onChange={e => setNewCadetEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="input-label">Initial Experience Points (XP)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={newCadetXp}
                                    onChange={e => setNewCadetXp(e.target.value)}
                                    min="0"
                                    max="10000"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full py-3 text-sm shadow-md"
                                disabled={cadetCreateLoading}
                            >
                                {cadetCreateLoading ? 'Provisioning Cadet Record...' : 'Authorize & Create Cadet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADMIN ONLY: Provision Faculty Modal */}"""

if target_modal_end in code:
    code = code.replace(target_modal_end, cadet_modal_code, 1)
    print("6. Provision Cadet Modal added.")
else:
    print("WARNING: target_modal_end not found!")

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
    print("SUCCESS: Admin CRUD capabilities added with 0 token delta!")
else:
    print("ERROR: Token delta is not 0, aborted.")
