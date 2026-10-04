import re

with open('src/js/app_react.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update BreadcrumbBar tabNames to include faculty
target_bc = "        profile: 'Cadet Profile & Transcript'\n    };"
replacement_bc = "        profile: 'Cadet Profile & Transcript',\n        faculty: 'Faculty Student Hub & Live Telemetry'\n    };"
if target_bc in code:
    code = code.replace(target_bc, replacement_bc, 1)
    print("1. BreadcrumbBar updated.")

# 2. Update AcademyNavbar to include Faculty Hub for faculty/admin
target_nav = """    const navLinks = [
        { id: 'home', label: 'Academy Home', icon: 'fa-landmark' },
        { id: 'courses', label: 'Curriculum & Labs', icon: 'fa-graduation-cap' },
        { id: 'academic', label: 'Academic Control Hub', icon: 'fa-building-columns' },
        { id: 'toolkit', label: 'Security Toolkit', icon: 'fa-toolbox' },
        { id: 'intel', label: 'Threat Intel', icon: 'fa-shield-halved' },
        { id: 'assessment', label: 'Assessments', icon: 'fa-clipboard-check' },
        { id: 'soc', label: 'SOC Console', icon: 'fa-tower-observation' },
        { id: 'mentor', label: 'AI Mentor', icon: 'fa-brain' },
    ];"""

replacement_nav = """    const navLinks = [
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
if target_nav in code:
    code = code.replace(target_nav, replacement_nav, 1)
    print("2. AcademyNavbar navLinks updated.")

# 3. Add Faculty Student Hub to user menu dropdown
target_menu = """                                    <button className="menu-action-item" onClick={() => { setActiveTab('profile'); setIsUserMenuOpen(false); }}>
                                        <i className="fa-solid fa-id-card text-[#6B216D]"></i>
                                        <span>Student Record & XP</span>
                                    </button>"""

replacement_menu = """                                    {(user.role === 'faculty' || user.role === 'admin') && (
                                        <button className="menu-action-item font-bold text-[#4A154B] bg-[#F7F2F6]" onClick={() => { setActiveTab('faculty'); setIsUserMenuOpen(false); }}>
                                            <i className="fa-solid fa-chalkboard-user text-[#4A154B]"></i>
                                            <span>Faculty Student Hub (Live)</span>
                                        </button>
                                    )}
                                    <button className="menu-action-item" onClick={() => { setActiveTab('profile'); setIsUserMenuOpen(false); }}>
                                        <i className="fa-solid fa-id-card text-[#6B216D]"></i>
                                        <span>Student Record & XP</span>
                                    </button>"""
if target_menu in code:
    code = code.replace(target_menu, replacement_menu, 1)
    print("3. AcademyNavbar dropdown updated.")

# 4. Replace AuthModal with CreativeAuthLandingPage, FacultyStudentHubPage, upgraded AuthModal
with open('scratch/new_sections.js', 'r', encoding='utf-8') as f:
    new_sections_code = f.read()

auth_modal_pattern = re.compile(
    r'/\* ==========================================================================\s+AUTHENTICATION MODAL[\s\S]+?/\* ==========================================================================\s+ACADEMY FOOTER',
    re.MULTILINE
)
match = auth_modal_pattern.search(code)
if match:
    code = code[:match.start()] + new_sections_code.strip() + "\n\n/* ==========================================================================\n   ACADEMY FOOTER" + code[match.end():]
    print("4. AuthModal replaced with CreativeAuthLandingPage, FacultyStudentHubPage, and new AuthModal.")

# 5. Replace App() with enhanced App supporting isGuestMode, recordUserActivity, and FacultyStudentHubPage route
target_app = """function App() {
    // Current Active Page / Navigation Tab
    // 'home' | 'courses' | 'academic' | 'toolkit' | 'intel' | 'assessment' | 'soc' | 'mentor' | 'profile'
    const [activeTab, setActiveTab] = useState('home');
    const [activeLabId, setActiveLabId] = useState(null); // When inside a specific lab workstation

    // User & Authentication State
    const [user, setUser] = useState(null); // { username, role, provider, verified }
    const [studentStats, setStudentStats] = useState({ xp: 350, coins: 40, level: 1, completed_tasks: '' });
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Course Enrollment Tracking State (Identity verified requirement)
    const [enrolledCourses, setEnrolledCourses] = useState(() => {
        try {
            const saved = localStorage.getItem('aigra_enrolled_courses');
            return saved ? JSON.parse(saved) : ['crypto'];
        } catch(e) {
            return ['crypto'];
        }
    });

    const handleEnrollCourse = (courseId, courseTitle) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return false;
        }
        if (!enrolledCourses.includes(courseId)) {
            const updated = [...enrolledCourses, courseId];
            setEnrolledCourses(updated);
            try {
                localStorage.setItem('aigra_enrolled_courses', JSON.stringify(updated));
            } catch(e) {}
        }
        return true;
    };

    // Global Search / Quick Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Load auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setAuthLoading(true);
        // First check local persisted session (e.g. Google SSO or local session)
        try {
            const localSession = localStorage.getItem('aigra_user_session');
            if (localSession) {
                const parsed = JSON.parse(localSession);
                if (parsed && parsed.username) {
                    setUser(parsed);
                }
            }
        } catch(e) {}

        try {
            const res = await fetch('/api/check_status');
            const data = await res.json();
            if (data.status === 'authenticated') {
                setUser({ username: data.username, role: data.role, verified: true });
                fetchStudentStats();
            } else if (!localStorage.getItem('aigra_user_session')) {
                setUser(null);
            }
        } catch (e) {
            console.error("Auth status error:", e);
        } finally {
            setAuthLoading(false);
        }
    };

    const fetchStudentStats = async () => {
        try {
            const res = await fetch('/api/student/stats');
            if (res.ok) {
                const data = await res.json();
                setStudentStats(data);
            }
        } catch (e) {
            console.error("Student stats error:", e);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (e) {
            console.error("Logout error:", e);
        }
        try {
            localStorage.removeItem('aigra_user_session');
        } catch(e) {}
        setUser(null);
        setActiveTab('home');
        setIsUserMenuOpen(false);
    };

    const awardXp = async (taskId, taskName, xpAmount = 100) => {
        setStudentStats(prev => ({
            ...prev,
            xp: (prev.xp || 0) + xpAmount,
            coins: (prev.coins || 0) + 20,
            level: Math.floor(((prev.xp || 0) + xpAmount) / 1000) + 1,
            completed_tasks: prev.completed_tasks ? `${prev.completed_tasks},${taskId}` : taskId
        }));

        try {
            await fetch('/api/student/stats/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId, task_name: taskName })
            });
        } catch (e) {
            console.log("Stats synced locally.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#221224]">
            {/* Institutional Top Navbar */}
            <AcademyNavbar 
                activeTab={activeTab} 
                setActiveTab={(tab) => { setActiveTab(tab); setActiveLabId(null); }}
                user={user} 
                studentStats={studentStats}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                isUserMenuOpen={isUserMenuOpen}
                setIsUserMenuOpen={setIsUserMenuOpen}
            />

            {/* Breadcrumbs Sub-Bar */}
            <BreadcrumbBar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                activeLabId={activeLabId}
                setActiveLabId={setActiveLabId}
            />

            {/* Main Page Content */}
            <main className="flex-1 main-wrapper">
                {activeTab === 'home' && (
                    <HomePage 
                        setActiveTab={setActiveTab} 
                        user={user} 
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                        onStartLab={(labId) => { setActiveTab('courses'); setActiveLabId(labId); }}
                    />
                )}

                {activeTab === 'courses' && (
                    <CoursesPage 
                        activeLabId={activeLabId}
                        setActiveLabId={setActiveLabId}
                        studentStats={studentStats}
                        onAwardXp={awardXp}
                        user={user}
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                        enrolledCourses={enrolledCourses}
                        onEnrollCourse={handleEnrollCourse}
                    />
                )}

                {activeTab === 'academic' && (
                    <AcademicControlHubPage 
                        user={user} 
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                        onSwitchToLab={(labId) => { setActiveTab('courses'); setActiveLabId(labId); }}
                    />
                )}

                {activeTab === 'toolkit' && (
                    <ToolkitPage user={user} />
                )}

                {activeTab === 'intel' && (
                    <ThreatIntelPage />
                )}

                {activeTab === 'assessment' && (
                    <AssessmentPage user={user} onAwardXp={awardXp} />
                )}

                {activeTab === 'soc' && (
                    <SocConsolePage user={user} />
                )}

                {activeTab === 'mentor' && (
                    <MentorAiPage user={user} />
                )}

                {activeTab === 'profile' && (
                    <CadetProfilePage 
                        user={user} 
                        studentStats={studentStats}
                        setActiveTab={setActiveTab}
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                    />
                )}
            </main>"""

replacement_app = """function App() {
    // Current Active Page / Navigation Tab
    // 'home' | 'courses' | 'academic' | 'toolkit' | 'intel' | 'assessment' | 'soc' | 'mentor' | 'profile' | 'faculty'
    const [activeTab, setActiveTab] = useState('home');
    const [activeLabId, setActiveLabId] = useState(null); // When inside a specific lab workstation

    // User & Authentication State
    const [user, setUser] = useState(null); // { username, role, provider, verified }
    const [studentStats, setStudentStats] = useState({ xp: 350, coins: 40, level: 1, completed_tasks: '' });
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isGuestMode, setIsGuestMode] = useState(false);

    // Global real-time activity recording to actual SQLite database
    const recordUserActivity = useCallback(async (action, category, details) => {
        try {
            await fetch('/api/activity/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user?.username || 'cadet_explorer',
                    role: user?.role || 'student',
                    action: action,
                    category: category || 'General',
                    details: typeof details === 'string' ? details : JSON.stringify(details || '')
                })
            });
        } catch(e) {
            console.error("Activity record error:", e);
        }
    }, [user]);

    // Course Enrollment Tracking State (Identity verified requirement)
    const [enrolledCourses, setEnrolledCourses] = useState(() => {
        try {
            const saved = localStorage.getItem('aigra_enrolled_courses');
            return saved ? JSON.parse(saved) : ['crypto'];
        } catch(e) {
            return ['crypto'];
        }
    });

    const handleEnrollCourse = (courseId, courseTitle) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return false;
        }
        if (!enrolledCourses.includes(courseId)) {
            const updated = [...enrolledCourses, courseId];
            setEnrolledCourses(updated);
            try {
                localStorage.setItem('aigra_enrolled_courses', JSON.stringify(updated));
            } catch(e) {}
            recordUserActivity(`Enrolled into Course: ${courseTitle || courseId}`, 'course', `Course ID: ${courseId}`);
        }
        return true;
    };

    // Global Search / Quick Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Load auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setAuthLoading(true);
        // First check local persisted session (e.g. Google SSO or local session)
        try {
            const localSession = localStorage.getItem('aigra_user_session');
            if (localSession) {
                const parsed = JSON.parse(localSession);
                if (parsed && parsed.username) {
                    setUser(parsed);
                }
            }
        } catch(e) {}

        try {
            const res = await fetch('/api/check_status');
            const data = await res.json();
            if (data.status === 'authenticated') {
                setUser({ username: data.username, role: data.role, verified: true });
                fetchStudentStats();
            } else if (!localStorage.getItem('aigra_user_session')) {
                setUser(null);
            }
        } catch (e) {
            console.error("Auth status error:", e);
        } finally {
            setAuthLoading(false);
        }
    };

    const fetchStudentStats = async () => {
        try {
            const res = await fetch('/api/student/stats');
            if (res.ok) {
                const data = await res.json();
                setStudentStats(data);
            }
        } catch (e) {
            console.error("Student stats error:", e);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (e) {
            console.error("Logout error:", e);
        }
        try {
            localStorage.removeItem('aigra_user_session');
        } catch(e) {}
        setUser(null);
        setIsGuestMode(false);
        setActiveTab('home');
        setIsUserMenuOpen(false);
    };

    const awardXp = async (taskId, taskName, xpAmount = 100) => {
        setStudentStats(prev => ({
            ...prev,
            xp: (prev.xp || 0) + xpAmount,
            coins: (prev.coins || 0) + 20,
            level: Math.floor(((prev.xp || 0) + xpAmount) / 1000) + 1,
            completed_tasks: prev.completed_tasks ? `${prev.completed_tasks},${taskId}` : taskId
        }));

        try {
            await fetch('/api/student/stats/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId, task_name: taskName })
            });
        } catch (e) {
            console.log("Stats synced locally.");
        }

        recordUserActivity(`Completed Practical Task: ${taskName}`, 'lab', `Task ID: ${taskId}, +${xpAmount} XP`);
    };

    // Splash Loader while validating session
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#4A154B] text-white flex items-center justify-center text-2xl mx-auto shadow-lg animate-pulse">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-[#4A154B] tracking-wider uppercase">AIGRA CYBER ACADEMY</div>
                        <div className="text-xs text-[#8A788F] font-semibold mt-1">Connecting Live Operations Telemetry...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Creative Authentication Landing Page before entering website
    if (!user && !isGuestMode) {
        return (
            <CreativeAuthLandingPage 
                onSuccess={(userData) => {
                    setUser(userData);
                    fetchStudentStats();
                    recordUserActivity('Authenticated Clearance', 'auth', `Logged in as ${userData.username} (${userData.role}) via ${userData.provider || 'Portal'}`);
                }}
                onExploreAsGuest={() => {
                    setIsGuestMode(true);
                    recordUserActivity('Guest Explorer Access', 'auth', 'Browsing public course curriculum');
                }}
            />
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#221224]">
            {/* Institutional Top Navbar */}
            <AcademyNavbar 
                activeTab={activeTab} 
                setActiveTab={(tab) => { setActiveTab(tab); setActiveLabId(null); }}
                user={user} 
                studentStats={studentStats}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                isUserMenuOpen={isUserMenuOpen}
                setIsUserMenuOpen={setIsUserMenuOpen}
            />

            {/* Breadcrumbs Sub-Bar */}
            <BreadcrumbBar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                activeLabId={activeLabId}
                setActiveLabId={setActiveLabId}
            />

            {/* Main Page Content */}
            <main className="flex-1 main-wrapper">
                {activeTab === 'home' && (
                    <HomePage 
                        setActiveTab={setActiveTab} 
                        user={user} 
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                        onStartLab={(labId) => { setActiveTab('courses'); setActiveLabId(labId); }}
                    />
                )}

                {activeTab === 'courses' && (
                    <CoursesPage 
                        activeLabId={activeLabId}
                        setActiveLabId={setActiveLabId}
                        studentStats={studentStats}
                        onAwardXp={awardXp}
                        user={user}
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                        enrolledCourses={enrolledCourses}
                        onEnrollCourse={handleEnrollCourse}
                    />
                )}

                {activeTab === 'academic' && (
                    <AcademicControlHubPage 
                        user={user} 
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                        onSwitchToLab={(labId) => { setActiveTab('courses'); setActiveLabId(labId); }}
                    />
                )}

                {activeTab === 'toolkit' && (
                    <ToolkitPage user={user} />
                )}

                {activeTab === 'intel' && (
                    <ThreatIntelPage />
                )}

                {activeTab === 'assessment' && (
                    <AssessmentPage user={user} onAwardXp={awardXp} />
                )}

                {activeTab === 'soc' && (
                    <SocConsolePage user={user} />
                )}

                {activeTab === 'mentor' && (
                    <MentorAiPage user={user} />
                )}

                {activeTab === 'profile' && (
                    <CadetProfilePage 
                        user={user} 
                        studentStats={studentStats}
                        setActiveTab={setActiveTab}
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                    />
                )}

                {activeTab === 'faculty' && (
                    <FacultyStudentHubPage 
                        user={user} 
                        onRecordActivity={recordUserActivity}
                    />
                )}
            </main>"""

if target_app in code:
    code = code.replace(target_app, replacement_app, 1)
    print("5. App function updated.")
else:
    print("WARNING: target_app not found!")

# Validate balances
opens = {'{': '}', '(': ')', '[': ']'}
counts = {'{': 0, '}': 0, '(': 0, ')': 0, '[': 0, ']': 0}
for char in code:
    if char in counts:
        counts[char] += 1

print('FINAL Braces delta:', counts['{'] - counts['}'])
print('FINAL Parens delta:', counts['('] - counts[')'])
print('FINAL Brackets delta:', counts['['] - counts[']'])

if counts['{'] == counts['}'] and counts['('] == counts[')'] and counts['['] == counts[']']:
    with open('src/js/app_react.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Successfully wrote updated code to src/js/app_react.js!")
else:
    print("ERROR: Unbalanced tokens, aborted write to src/js/app_react.js.")
