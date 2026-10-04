function FacultyStudentHubPage({ user, onRecordActivity }) {
    const [subTab, setSubTab] = useState('stream'); // 'stream' | 'roster' | 'vault'
    const [activities, setActivities] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [autoPoll, setAutoPoll] = useState(true);
    const [searchCadet, setSearchCadet] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Commendation Modal State
    const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
    const [awardTargetStudent, setAwardTargetStudent] = useState('');
    const [awardXpAmount, setAwardXpAmount] = useState(100);
    const [awardReason, setAwardReason] = useState('Excellence in Lab Exploits & Defensive Engineering');
    const [awardStatus, setAwardStatus] = useState(null);
    const [awardLoading, setAwardLoading] = useState(false);

    // ADMIN ONLY: Faculty Credential Vault State
    const [facultyCredentials, setFacultyCredentials] = useState([]);
    const [vaultLoading, setVaultLoading] = useState(false);
    const [revealedPasswords, setRevealedPasswords] = useState({});
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
    const [newFacultyUser, setNewFacultyUser] = useState('');
    const [newFacultyPass, setNewFacultyPass] = useState('');
    const [newFacultyEmail, setNewFacultyEmail] = useState('');
    const [newFacultyDept, setNewFacultyDept] = useState('Institute of Threat Defense & Intelligence');
    const [provisionStatus, setProvisionStatus] = useState(null);
    const [provisionLoading, setProvisionLoading] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(null);

    // Fetch Live Data (Activities & Students)
    const fetchTelemetry = useCallback(async () => {
        try {
            const [actRes, stuRes] = await Promise.all([
                fetch('/api/faculty/activities?limit=100'),
                fetch('/api/faculty/students')
            ]);

            if (actRes.ok) {
                const actData = await actRes.json();
                if (actData.activities) {
                    setActivities(actData.activities);
                }
            }

            if (stuRes.ok) {
                const stuData = await stuRes.json();
                if (stuData.students) {
                    setStudents(stuData.students);
                }
            }

            setLastSync(new Date().toLocaleTimeString());
        } catch (e) {
            console.error("Telemetry fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // ADMIN ONLY: Fetch Faculty Credentials Vault
    const fetchFacultyCredentials = useCallback(async () => {
        if (user?.role !== 'admin') return;
        setVaultLoading(true);
        try {
            const res = await fetch('/api/admin/faculty_credentials', {
                headers: { 'X-Admin-Clearance': 'de4thnote' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.credentials) setFacultyCredentials(data.credentials);
            }
        } catch (e) {
            console.error("Vault fetch error:", e);
        } finally {
            setVaultLoading(false);
        }
    }, [user]);

    // Initial load and polling every 4 seconds
    useEffect(() => {
        fetchTelemetry();
        if (user?.role === 'admin') {
            fetchFacultyCredentials();
        }
        if (!autoPoll) return;
        const interval = setInterval(fetchTelemetry, 4000);
        return () => clearInterval(interval);
    }, [autoPoll, fetchTelemetry, fetchFacultyCredentials, user]);

    // Handle Award XP Submission
    const handleAwardXp = async (e) => {
        e.preventDefault();
        if (!awardTargetStudent) return;
        setAwardLoading(true);
        setAwardStatus(null);

        try {
            const res = await fetch('/api/faculty/award_xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_username: awardTargetStudent,
                    xp_amount: parseInt(awardXpAmount, 10) || 100,
                    reason: awardReason
                })
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setAwardStatus(`Successfully awarded +${awardXpAmount} XP to ${awardTargetStudent}!`);
                setTimeout(() => {
                    setIsAwardModalOpen(false);
                    setAwardStatus(null);
                }, 1600);
                fetchTelemetry();
            } else {
                setAwardStatus(data.detail || "Failed to dispatch commendation.");
            }
        } catch(err) {
            setAwardStatus("Error: " + err.message);
        } finally {
            setAwardLoading(false);
        }
    };

    // ADMIN ONLY: Handle Provision New Faculty Member
    const handleProvisionFaculty = async (e) => {
        e.preventDefault();
        setProvisionLoading(true);
        setProvisionStatus(null);

        try {
            const res = await fetch('/api/admin/faculty_credentials', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Admin-Clearance': 'de4thnote'
                },
                body: JSON.stringify({
                    username: newFacultyUser.trim().toLowerCase(),
                    password: newFacultyPass.trim(),
                    email: newFacultyEmail.trim().toLowerCase(),
                    department: newFacultyDept.trim()
                })
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setProvisionStatus(`Clearance Granted: Faculty credentials issued for ${newFacultyUser}!`);
                setTimeout(() => {
                    setIsProvisionModalOpen(false);
                    setProvisionStatus(null);
                    setNewFacultyUser('');
                    setNewFacultyPass('');
                    setNewFacultyEmail('');
                }, 1600);
                fetchFacultyCredentials();
                fetchTelemetry();
            } else {
                setProvisionStatus(data.detail || "Failed to provision faculty credentials.");
            }
        } catch(err) {
            setProvisionStatus("Error: " + err.message);
        } finally {
            setProvisionLoading(false);
        }
    };

    // ADMIN ONLY: Revoke Faculty Member
    const handleRevokeFaculty = async (username) => {
        if (!confirm(`Are you sure you want to revoke faculty clearance for ${username}?`)) return;
        try {
            const res = await fetch(`/api/admin/faculty_credentials/${username}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Clearance': 'de4thnote' }
            });
            if (res.ok) {
                fetchFacultyCredentials();
                fetchTelemetry();
            }
        } catch(e) {
            console.error("Revoke error:", e);
        }
    };

    // Generate Strong Random Password
    const handleGeneratePass = () => {
        const words = ['Krypton', 'Cipher', 'Vortex', 'Sentinel', 'Shield', 'Matrix', 'Nexus', 'Bastion'];
        const num = Math.floor(1000 + Math.random() * 9000);
        const special = ['!', '@', '#', '$'][Math.floor(Math.random() * 4)];
        const randWord = words[Math.floor(Math.random() * words.length)];
        setNewFacultyPass(`${randWord}${special}${num}`);
    };

    // Copy to clipboard
    const handleCopyCredentials = (u, p) => {
        const text = `AIGRA Cyber Academy Faculty Clearance\nUsername: ${u}\nPassword: ${p}\nPortal: http://127.0.0.1:8080/`;
        navigator.clipboard?.writeText(text);
        setCopyFeedback(u);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    // Clearance Verification Check
    const hasFacultyClearance = user && (user.role === 'faculty' || user.role === 'admin');

    if (!hasFacultyClearance) {
        return (
            <div className="section-container py-16">
                <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-[#E8DFD5] shadow-lg text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center text-2xl mx-auto">
                        <i className="fa-solid fa-lock"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#221224]">Classified Operations Hub</h2>
                    <p className="text-sm text-[#5D4B60]">
                        The Faculty Student Hub is restricted to Certified Instructors and Root Administrators (<code className="font-bold text-[#4A154B]">de4thnote</code>). Your current session clearance is: <span className="badge badge-plum uppercase">{user?.role || 'Guest'}</span>.
                    </p>
                    <div className="pt-4 border-t border-[#F0EAE2] text-xs text-[#8A788F]">
                        If you are faculty or admin, please log in with your authorized credentials.
                    </div>
                </div>
            </div>
        );
    }

    // Filter Activities
    const filteredActivities = activities.filter(act => {
        const matchesUser = !searchCadet || (act.username && act.username.toLowerCase().includes(searchCadet.toLowerCase()));
        if (!matchesUser) return false;
        if (categoryFilter === 'all') return true;
        if (categoryFilter === 'lab') return (act.action && (act.action.toLowerCase().includes('lab') || act.action.toLowerCase().includes('workstation')));
        if (categoryFilter === 'quiz') return (act.action && (act.action.toLowerCase().includes('quiz') || act.action.toLowerCase().includes('assessment') || act.action.toLowerCase().includes('exam')));
        if (categoryFilter === 'toolkit') return (act.action && (act.action.toLowerCase().includes('scan') || act.action.toLowerCase().includes('osint') || act.action.toLowerCase().includes('encrypt') || act.action.toLowerCase().includes('toolkit')));
        if (categoryFilter === 'ai_query') return (act.action && (act.action.toLowerCase().includes('natasha') || act.action.toLowerCase().includes('ai') || act.action.toLowerCase().includes('mentor')));
        if (categoryFilter === 'auth') return (act.action && (act.action.toLowerCase().includes('auth') || act.action.toLowerCase().includes('login') || act.action.toLowerCase().includes('sso')));
        return true;
    });

    // Filter Students
    const filteredStudents = students.filter(s => {
        return !searchCadet || (s.username && s.username.toLowerCase().includes(searchCadet.toLowerCase())) || (s.email && s.email.toLowerCase().includes(searchCadet.toLowerCase()));
    });

    // Compute metrics
    const totalCadets = students.length;
    const totalActivities = activities.length;
    const avgXp = totalCadets > 0 ? Math.round(students.reduce((acc, curr) => acc + (curr.xp || 0), 0) / totalCadets) : 0;

    return (
        <div className="section-container space-y-8 py-8">
            {/* Header Masthead */}
            <div className="bg-white border border-[#E8DFD5] rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`badge uppercase tracking-wider text-[10px] ${
                                user.role === 'admin' ? 'bg-[#4A154B] text-white' : 'badge-plum'
                            }`}>
                                <i className={`fa-solid ${user.role === 'admin' ? 'fa-crown text-amber-300' : 'fa-chalkboard-user'} mr-1`}></i>
                                Clearance Level: {user.role.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                LIVE DB TELEMETRY ({lastSync || 'Connecting...'})
                            </span>
                            {user.role === 'admin' && (
                                <span className="badge bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                                    <i className="fa-solid fa-key mr-1"></i> FACULTY CREDENTIAL VAULT UNLOCKED
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#221224] tracking-tight">
                            Faculty Student Hub & Live Operations Ledger
                        </h1>
                        <p className="text-xs sm:text-sm text-[#5D4B60] mt-1 max-w-2xl">
                            Real-time tracking of cadet actions, laboratory completions, diagnostic runs, and academic commendations. Zero simulated data.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setAutoPoll(!autoPoll)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                                autoPoll 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                    : 'bg-[#FAF7F2] border-[#D9CEBF] text-[#8A788F]'
                            }`}
                        >
                            <i className={`fa-solid ${autoPoll ? 'fa-satellite-dish' : 'fa-pause'}`}></i>
                            <span>Auto-Stream: {autoPoll ? 'ON (4s)' : 'PAUSED'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={fetchTelemetry}
                            disabled={loading}
                            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-2"
                        >
                            <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`}></i>
                            <span>Refresh Now</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (students.length > 0) setAwardTargetStudent(students[0].username);
                                setIsAwardModalOpen(true);
                            }}
                            className="btn btn-primary text-xs py-2 px-3.5 flex items-center gap-2 shadow-sm"
                        >
                            <i className="fa-solid fa-award text-amber-300"></i>
                            <span>Award Commendation & XP</span>
                        </button>

                        {/* Admin Provision Faculty Button */}
                        {user.role === 'admin' && (
                            <button
                                type="button"
                                onClick={() => setIsProvisionModalOpen(true)}
                                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                            >
                                <i className="fa-solid fa-user-plus"></i>
                                <span>Provision Faculty Member</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-icon-wrapper bg-[#4A154B] text-white">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <div>
                        <div className="stat-number">{totalCadets}</div>
                        <div className="stat-label">Active Monitored Cadets</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper bg-emerald-700 text-white">
                        <i className="fa-solid fa-wave-square"></i>
                    </div>
                    <div>
                        <div className="stat-number">{totalActivities}</div>
                        <div className="stat-label">Live Platform Events Logged</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper bg-[#7B287D] text-white">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div>
                        <div className="stat-number">{avgXp} XP</div>
                        <div className="stat-label">Average Cadet Score</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper bg-[#221224] text-white">
                        <i className="fa-solid fa-key text-amber-300"></i>
                    </div>
                    <div>
                        <div className="stat-number">
                            {user.role === 'admin' ? `${facultyCredentials.length} Staff` : 'Classified'}
                        </div>
                        <div className="stat-label">
                            {user.role === 'admin' ? 'Faculty Credentials In Vault' : 'Admin Restricted Vault'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#E8DFD5] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setSubTab('stream')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                            subTab === 'stream' 
                                ? 'bg-[#4A154B] text-white shadow-sm' 
                                : 'bg-white border border-[#D9CEBF] text-[#5D4B60] hover:bg-[#FAF7F2]'
                        }`}
                    >
                        <i className="fa-solid fa-satellite-dish"></i>
                        <span>Live Student Activity Stream</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                            {filteredActivities.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubTab('roster')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                            subTab === 'roster' 
                                ? 'bg-[#4A154B] text-white shadow-sm' 
                                : 'bg-white border border-[#D9CEBF] text-[#5D4B60] hover:bg-[#FAF7F2]'
                        }`}
                    >
                        <i className="fa-solid fa-users-viewfinder"></i>
                        <span>Student Performance Ledger</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                            {filteredStudents.length}
                        </span>
                    </button>

                    {/* ADMIN ONLY TAB: Faculty Credential Vault */}
                    {user.role === 'admin' && (
                        <button
                            type="button"
                            onClick={() => setSubTab('vault')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                                subTab === 'vault' 
                                    ? 'bg-amber-600 text-white shadow-sm' 
                                    : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                            }`}
                        >
                            <i className="fa-solid fa-key"></i>
                            <span>Faculty Credential Vault (Admin Only)</span>
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
                                {facultyCredentials.length}
                            </span>
                        </button>
                    )}
                </div>

                {/* Cadet Search */}
                {subTab !== 'vault' && (
                    <div className="relative w-full sm:w-64">
                        <span className="absolute left-3 top-2.5 text-[#8A788F] text-xs">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Filter by cadet identifier..."
                            value={searchCadet}
                            onChange={e => setSearchCadet(e.target.value)}
                            className="form-control pl-8 py-1.5 text-xs w-full"
                        />
                    </div>
                )}
            </div>

            {/* TAB 1: LIVE ACTIVITY STREAM */}
            {subTab === 'stream' && (
                <div className="space-y-4">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[#8A788F] font-bold mr-1">Activity Type:</span>
                        {[
                            { id: 'all', label: 'All Operations' },
                            { id: 'lab', label: 'Labs & Workstations' },
                            { id: 'quiz', label: 'Quizzes & Diplomas' },
                            { id: 'toolkit', label: 'Diagnostic Tools' },
                            { id: 'ai_query', label: 'Natasha AI Q&A' },
                            { id: 'auth', label: 'SSO & Logins' }
                        ].map(pill => (
                            <button
                                key={pill.id}
                                type="button"
                                onClick={() => setCategoryFilter(pill.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                                    categoryFilter === pill.id
                                        ? 'bg-[#7B287D] text-white shadow-sm'
                                        : 'bg-white border border-[#E8DFD5] text-[#5D4B60] hover:bg-[#FAF7F2]'
                                }`}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>

                    {/* Stream Content */}
                    <div className="bg-white border border-[#E8DFD5] rounded-2xl overflow-hidden shadow-sm">
                        {filteredActivities.length === 0 ? (
                            <div className="p-12 text-center text-[#8A788F] space-y-2">
                                <i className="fa-solid fa-inbox text-3xl"></i>
                                <div className="font-bold text-sm">No activity recorded for this criteria</div>
                                <p className="text-xs">Activities will populate in real time as students use labs, tools, or assessments.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F0EAE2] max-h-[600px] overflow-y-auto">
                                {filteredActivities.map((act, idx) => (
                                    <div key={act.id || idx} className="p-4 hover:bg-[#FAF7F2] transition-colors flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#4A154B] flex items-center justify-center font-bold text-sm shrink-0">
                                                {act.username ? act.username.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-extrabold text-sm text-[#221224]">{act.username}</span>
                                                    <span className={`badge text-[9px] uppercase ${
                                                        act.role === 'admin' ? 'bg-[#4A154B] text-white' :
                                                        act.role === 'faculty' ? 'badge-plum' : 'badge-green'
                                                    }`}>
                                                        {act.role}
                                                    </span>
                                                    <span className="text-[11px] text-[#8A788F]">
                                                        <i className="fa-regular fa-clock mr-1"></i>
                                                        {act.timestamp}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-semibold text-[#4A154B] mt-1">
                                                    {act.action}
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-[#8A788F] mt-1">
                                                    {act.device && (
                                                        <span><i className="fa-solid fa-laptop text-[10px] mr-1"></i>{act.device}</span>
                                                    )}
                                                    {act.ip_address && (
                                                        <span><i className="fa-solid fa-network-wired text-[10px] mr-1"></i>{act.ip_address}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="badge badge-plum text-[10px] shrink-0 font-mono">
                                            LIVE LOG #{act.id || (idx + 1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: STUDENT PERFORMANCE ROSTER */}
            {subTab === 'roster' && (
                <div className="bg-white border border-[#E8DFD5] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7F2] border-b border-[#E8DFD5] font-extrabold text-[#4A154B] uppercase text-[10px]">
                                <tr>
                                    <th className="p-3.5">Cadet Identity</th>
                                    <th className="p-3.5">Level & Rank</th>
                                    <th className="p-3.5">Real-Time XP</th>
                                    <th className="p-3.5">Labs / Tasks Solved</th>
                                    <th className="p-3.5">Total Activity Logs</th>
                                    <th className="p-3.5">Last Active</th>
                                    <th className="p-3.5">Last Logged Action</th>
                                    <th className="p-3.5 text-right">Faculty Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EAE2]">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-[#8A788F]">
                                            No enrolled students found matching search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((stu, i) => (
                                        <tr key={i} className="hover:bg-[#FAF7F2] transition-colors">
                                            <td className="p-3.5 font-bold text-[#221224]">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs">
                                                        {stu.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div>{stu.username}</div>
                                                        <div className="text-[10px] text-[#8A788F] font-normal">{stu.email || 'institutional'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className="badge badge-plum text-[10px] font-extrabold">
                                                    LVL {stu.level || 1}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-extrabold text-[#7B287D]">
                                                {stu.xp || 0} XP
                                            </td>
                                            <td className="p-3.5 font-semibold text-[#5D4B60]">
                                                {stu.completed_tasks ? stu.completed_tasks.split(',').filter(Boolean).length : 0} Solved
                                            </td>
                                            <td className="p-3.5 font-bold text-[#221224]">
                                                {stu.activity_count || 0} events
                                            </td>
                                            <td className="p-3.5 text-[#8A788F] text-[11px]">
                                                {stu.last_active || 'Enrolled'}
                                            </td>
                                            <td className="p-3.5 max-w-xs truncate text-[#5D4B60] text-[11px]" title={stu.last_action}>
                                                {stu.last_action || 'Enrolled'}
                                            </td>
                                            <td className="p-3.5 text-right">
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
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: ADMIN ONLY - FACULTY CREDENTIAL VAULT */}
            {subTab === 'vault' && user.role === 'admin' && (
                <div className="space-y-4">
                    {/* Security Notice Banner */}
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                                <i className="fa-solid fa-shield-halved"></i>
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-amber-950">
                                    CLASSIFIED FACULTY CREDENTIAL VAULT • ROOT ADMIN CLEARANCE ONLY
                                </h3>
                                <p className="text-xs text-amber-800 mt-0.5">
                                    Faculty credentials cannot be created via public signup. Usernames and passwords are generated and provided exclusively by Admin (<code className="font-bold">de4thnote</code>). These credentials and passwords can only be seen by the Admin.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsProvisionModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm transition-all"
                        >
                            <i className="fa-solid fa-key"></i>
                            <span>Issue New Faculty Credentials</span>
                        </button>
                    </div>

                    {/* Credential Ledger Table */}
                    <div className="bg-white border border-[#E8DFD5] rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]">
                            <div className="font-bold text-sm text-[#221224] flex items-center gap-2">
                                <i className="fa-solid fa-vault text-[#7B287D]"></i>
                                <span>Active Faculty Accounts & Issued Passwords</span>
                            </div>
                            <span className="badge badge-plum text-[11px] font-mono">
                                Total: {facultyCredentials.length} Faculty Officers
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#FAF7F2] border-b border-[#E8DFD5] font-extrabold text-[#4A154B] uppercase text-[10px]">
                                    <tr>
                                        <th className="p-3.5">Faculty Username</th>
                                        <th className="p-3.5">Department & Discipline</th>
                                        <th className="p-3.5">Institutional Email</th>
                                        <th className="p-3.5">Assigned Password (Admin Eyes Only)</th>
                                        <th className="p-3.5">Provisioned By</th>
                                        <th className="p-3.5">Clearance Status</th>
                                        <th className="p-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0EAE2]">
                                    {facultyCredentials.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-[#8A788F]">
                                                No faculty credentials in vault. Click "Issue New Faculty Credentials" to provision staff.
                                            </td>
                                        </tr>
                                    ) : (
                                        facultyCredentials.map((fac) => {
                                            const isRevealed = !!revealedPasswords[fac.username];
                                            const isCopied = copyFeedback === fac.username;
                                            return (
                                                <tr key={fac.id || fac.username} className="hover:bg-[#FAF7F2] transition-colors">
                                                    <td className="p-3.5 font-bold text-[#221224]">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs">
                                                                <i className="fa-solid fa-chalkboard-user"></i>
                                                            </div>
                                                            <div>
                                                                <div className="font-extrabold text-[#4A154B]">{fac.username}</div>
                                                                <div className="text-[10px] text-[#8A788F]">Role: faculty</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5 font-semibold text-[#5D4B60]">
                                                        {fac.department || 'Institute of Threat Defense & Intelligence'}
                                                    </td>
                                                    <td className="p-3.5 text-[#5D4B60] font-mono text-[11px]">
                                                        {fac.email}
                                                    </td>
                                                    <td className="p-3.5 font-mono">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 rounded bg-[#F4EFEA] border border-[#D9CEBF] font-bold text-xs text-[#221224] tracking-wide">
                                                                {isRevealed ? fac.password_plain : '••••••••••••'}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRevealedPasswords(prev => ({ ...prev, [fac.username]: !isRevealed }))}
                                                                className="text-[#8A788F] hover:text-[#4A154B] p-1"
                                                                title={isRevealed ? "Hide Password" : "Show Password"}
                                                            >
                                                                <i className={`fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyCredentials(fac.username, fac.password_plain)}
                                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                                                    isCopied 
                                                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                                                        : 'bg-white text-[#4A154B] border-[#D9CEBF] hover:bg-[#FAF7F2]'
                                                                }`}
                                                                title="Copy Credentials to give to Faculty"
                                                            >
                                                                <i className={`fa-solid ${isCopied ? 'fa-check' : 'fa-copy'} mr-1`}></i>
                                                                {isCopied ? 'Copied!' : 'Copy'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5 text-[#8A788F] text-[11px]">
                                                        <span className="font-bold text-[#4A154B]">{fac.created_by || 'de4thnote'}</span>
                                                        <div className="text-[10px]">{fac.created_at || '2026-10-01'}</div>
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className={`badge text-[10px] font-bold uppercase ${
                                                            fac.status === 'ACTIVE' ? 'badge-green' : 'badge-plum'
                                                        }`}>
                                                            {fac.status || 'ACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-right">
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
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Commendation Modal */}
            {isAwardModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-dialog max-w-md">
                        <button 
                            type="button"
                            className="absolute top-5 right-5 text-[#8A788F] hover:text-[#4A154B] text-lg"
                            onClick={() => setIsAwardModalOpen(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="text-center mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl mx-auto mb-2 shadow-md">
                                <i className="fa-solid fa-award"></i>
                            </div>
                            <h3 className="text-xl font-extrabold text-[#221224]">Dispatch Faculty Commendation</h3>
                            <p className="text-xs text-[#8A788F]">Award real-time XP and commendation to cadet database record</p>
                        </div>

                        {awardStatus && (
                            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                                {awardStatus}
                            </div>
                        )}

                        <form onSubmit={handleAwardXp} className="space-y-4">
                            <div>
                                <label className="input-label">Target Cadet Identifier</label>
                                <select 
                                    className="form-control"
                                    value={awardTargetStudent}
                                    onChange={e => setAwardTargetStudent(e.target.value)}
                                    required
                                >
                                    {students.map(s => (
                                        <option key={s.username} value={s.username}>
                                            {s.username} (Current: {s.xp} XP - LVL {s.level})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="input-label">XP Grant Amount</label>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {[50, 100, 250, 500].map(amt => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setAwardXpAmount(amt)}
                                            className={`py-1.5 rounded-lg text-xs font-extrabold border transition-colors ${
                                                awardXpAmount === amt 
                                                    ? 'bg-[#4A154B] text-white border-[#4A154B]' 
                                                    : 'bg-white border-[#D9CEBF] text-[#4A154B] hover:bg-[#FAF7F2]'
                                            }`}
                                        >
                                            +{amt} XP
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={awardXpAmount}
                                    onChange={e => setAwardXpAmount(parseInt(e.target.value, 10) || 0)}
                                    min="10"
                                    max="5000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="input-label">Commendation Rationale / Citation</label>
                                <textarea
                                    className="form-control min-h-[80px]"
                                    value={awardReason}
                                    onChange={e => setAwardReason(e.target.value)}
                                    placeholder="e.g. Exceptional incident response drill completion..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full py-3 text-sm shadow-md"
                                disabled={awardLoading}
                            >
                                {awardLoading ? 'Dispatching Commendation...' : 'Dispatch Commendation & Update Live Ledger'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADMIN ONLY: Provision Faculty Modal */}
            {isProvisionModalOpen && user.role === 'admin' && (
                <div className="modal-overlay">
                    <div className="modal-dialog max-w-lg">
                        <button 
                            type="button"
                            className="absolute top-5 right-5 text-[#8A788F] hover:text-[#4A154B] text-lg"
                            onClick={() => setIsProvisionModalOpen(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="text-center mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-xl mx-auto mb-2 shadow-md">
                                <i className="fa-solid fa-user-shield"></i>
                            </div>
                            <h3 className="text-xl font-extrabold text-[#221224]">Provision Faculty Credentials</h3>
                            <p className="text-xs text-[#8A788F]">
                                Create faculty credentials to be provided to the instructor. Only the Admin can view this vault.
                            </p>
                        </div>

                        {provisionStatus && (
                            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                                {provisionStatus}
                            </div>
                        )}

                        <form onSubmit={handleProvisionFaculty} className="space-y-4">
                            <div>
                                <label className="input-label">Faculty Identifier (Username)</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. dr_cypher, professor_reed"
                                    value={newFacultyUser}
                                    onChange={e => setNewFacultyUser(e.target.value)}
                                    required
                                />
                                <div className="text-[10px] text-[#8A788F] mt-1">3-25 lowercase alphanumeric characters.</div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="input-label mb-0">Assigned Password</label>
                                    <button
                                        type="button"
                                        onClick={handleGeneratePass}
                                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900"
                                    >
                                        <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                                        Generate Secure Pass
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="form-control font-mono"
                                    placeholder="e.g. Bastion!9841"
                                    value={newFacultyPass}
                                    onChange={e => setNewFacultyPass(e.target.value)}
                                    required
                                />
                                <div className="text-[10px] text-[#8A788F] mt-1">
                                    This password will be securely saved in the Admin Vault so you can view, copy, and provide it to the faculty member.
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Faculty Institutional Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="faculty@aigra.edu"
                                    value={newFacultyEmail}
                                    onChange={e => setNewFacultyEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="input-label">Academic Department / Specialization</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. Threat Intelligence & Malware Analysis"
                                    value={newFacultyDept}
                                    onChange={e => setNewFacultyDept(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full py-3 text-sm shadow-md bg-amber-700 hover:bg-amber-800 border-none"
                                disabled={provisionLoading}
                            >
                                {provisionLoading ? 'Authorizing & Creating Account...' : 'Issue Clearance & Save to Vault'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}