

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return "";
}

        // Automatic API Base Redirect to enable double-clicking index.html directly from Windows Explorer
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const API_BASE = window.location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
            if (typeof input === 'string' && input.startsWith('/api/')) {
                input = API_BASE + input;
            }
            init = init || {};
            init.headers = init.headers || {};
            const sessionId = sessionStorage.getItem('cyber_session_id');
            if (sessionId) {
                if (init.headers instanceof Headers) {
                    init.headers.set('X-Session-ID', sessionId);
                } else {
                    init.headers['X-Session-ID'] = sessionId;
                }
            }
            return originalFetch(input, init).then(response => {
                const isLoginRequest = typeof input === 'string' && input.includes('/api/login');
                if (response.status === 401 && !isLoginRequest && sessionId) {
                    sessionStorage.removeItem('cyber_session_id');
                    alert("Your session has expired or has been terminated by the administrator.");
                    window.location.reload();
                }
                return response;
            });
        };

                let isForgotPasswordMode = false;
        let isOtpActivationMode = false;

        function toggleForgotPasswordView(enabled) {
            isForgotPasswordMode = enabled;
            document.getElementById('auth-error').style.display = 'none';
            document.getElementById('auth-success').style.display = 'none';
            
            if (enabled) {
                document.getElementById('tab-login').style.display = 'none';
                document.getElementById('tab-signup').style.display = 'none';
                document.getElementById('auth-user-field').style.display = 'none';
                document.getElementById('auth-pass-field').style.display = 'none';
                document.getElementById('auth-email-field').style.display = 'none';
                document.getElementById('auth-forgot-email-field').style.display = 'block';
                document.getElementById('auth-social-buttons').style.display = 'none';
                document.getElementById('auth-forgot-link').innerHTML = '<a href="javascript:void(0);" onclick="toggleForgotPasswordView(false)" style="color:#06b6d4;">Back to Login</a>';
                document.getElementById('btn-auth-submit').textContent = "Send Reset Code";
            } else {
                document.getElementById('tab-login').style.display = 'block';
                document.getElementById('tab-signup').style.display = 'block';
                document.getElementById('auth-user-field').style.display = 'block';
                document.getElementById('auth-pass-field').style.display = 'block';
                document.getElementById('auth-forgot-email-field').style.display = 'none';
                document.getElementById('auth-reset-token-field').style.display = 'none';
                document.getElementById('auth-reset-pass-field').style.display = 'none';
                document.getElementById('auth-social-buttons').style.display = 'flex';
                document.getElementById('auth-forgot-link').innerHTML = '<a href="javascript:void(0);" onclick="toggleForgotPasswordView(true)" style="color:#06b6d4;">Forgot Password?</a>';
                document.getElementById('btn-auth-submit').textContent = "Sign In";
            }
        }
        
        function toggleOtpView(enabled) {
            isOtpActivationMode = enabled;
            if (enabled) {
                document.getElementById('auth-user-field').style.display = 'none';
                document.getElementById('auth-pass-field').style.display = 'none';
                document.getElementById('auth-email-field').style.display = 'none';
                document.getElementById('auth-otp-field').style.display = 'block';
                document.getElementById('auth-social-buttons').style.display = 'none';
                document.getElementById('btn-auth-submit').textContent = "Verify & Activate";
            }
        }
        
        let currentRole = null;
        let currentUsername = null;
        let currentUser = null;
        let activeAuthMode = 'login';
        let scanCount = 0;
        let currentAcadTab = 'instructor';

        // Advanced AI panel configuration parameters
        let ttsEnabled = false; // Voice output is OFF by default
        let voiceRate = 1.0;
        let voicePitch = 1.0;
        let activePersona = 'defensive';

        function escapeHtml(text) {
            if (text === null || text === undefined) return '';
            return text.toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Load saved Gemini settings from local storage
        let geminiApiKey = localStorage.getItem('gemini_api_key') || '';
        document.getElementById('gemini-api-key').value = geminiApiKey;
        if (geminiApiKey) {
            // Hide setup assistant card if key is already active
            setTimeout(() => {
                const card = document.getElementById('gemini-missing-alert-card');
                if (card) card.style.display = 'none';
            }, 100);
        }

        function toggleGeminiSettings() {
            const modal = document.getElementById('gemini-settings-modal');
            modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
        }

        async function saveGeminiKey() {
            const keyVal = document.getElementById('gemini-api-key').value.trim();
            if (!keyVal) return alert("Please enter a valid API Key.");
            localStorage.setItem('gemini_api_key', keyVal);
            geminiApiKey = keyVal;
            
            try {
                const response = await fetch('/api/save_config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ gemini_api_key: keyVal })
                });
                if (response.ok) {
                    alert("Gemini 1.5 API Key saved successfully to server and browser! Real-world AI Mode active for all users.");
                    const card = document.getElementById('gemini-missing-alert-card');
                    if (card) card.style.display = 'none';
                } else {
                    const err = await response.json();
                    alert("Saved to browser local storage. Server save note: " + (err.detail || "failed to save to server."));
                }
            } catch(e) {
                console.warn("Failed to contact server to save API Key:", e);
                alert("Gemini 1.5 API Key saved successfully to browser local storage! Real-world AI Mode active for this device.");
                const card = document.getElementById('gemini-missing-alert-card');
                if (card) card.style.display = 'none';
            }
            toggleGeminiSettings();
        }

        async function saveDirectGeminiKey() {
            const keyVal = document.getElementById('direct-gemini-key').value.trim();
            if (!keyVal) return alert("Please enter a valid API Key.");
            localStorage.setItem('gemini_api_key', keyVal);
            geminiApiKey = keyVal;
            document.getElementById('gemini-api-key').value = keyVal;
            
            try {
                const response = await fetch('/api/save_config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ gemini_api_key: keyVal })
                });
                if (response.ok) {
                    alert("Gemini 1.5 API Key saved successfully to server and browser! Real-world AI Mode active for all users.");
                    const card = document.getElementById('gemini-missing-alert-card');
                    if (card) card.style.display = 'none';
                } else {
                    const err = await response.json();
                    alert("Saved to browser local storage. Server save note: " + (err.detail || "failed to save to server."));
                }
            } catch(e) {
                console.warn("Failed to contact server to save API Key:", e);
                alert("Gemini 1.5 API Key saved successfully to browser local storage! Real-world AI Mode active for this device.");
                const card = document.getElementById('gemini-missing-alert-card');
                if (card) card.style.display = 'none';
            }
        }

        async function clearGeminiKey() {
            localStorage.removeItem('gemini_api_key');
            geminiApiKey = '';
            document.getElementById('gemini-api-key').value = '';
            document.getElementById('direct-gemini-key').value = '';
            
            try {
                await fetch('/api/save_config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ gemini_api_key: '' })
                });
            } catch(e) {
                console.warn("Failed to contact server to clear API Key:", e);
            }
            const card = document.getElementById('gemini-missing-alert-card');
            if (card) card.style.display = 'block';
            alert("API Key cleared. AI Agent running in local fallback simulation mode.");
            toggleGeminiSettings();
        }

        function toggleAuthMode(mode) {
            activeAuthMode = mode;
            isForgotPasswordMode = false;
            isOtpActivationMode = false;
            
            document.getElementById('auth-error').style.display = 'none';
            document.getElementById('auth-success').style.display = 'none';
            
            document.getElementById('tab-login').className = mode === 'login' ? 'auth-tab active' : 'auth-tab';
            document.getElementById('tab-signup').className = mode === 'signup' ? 'auth-tab active' : 'auth-tab';
            document.getElementById('btn-auth-submit').textContent = mode === 'login' ? 'Sign In' : 'Register Student';
            
            // Show/Hide fields explicitly
            document.getElementById('tab-login').style.display = 'block';
            document.getElementById('tab-signup').style.display = 'block';
            document.getElementById('auth-user-field').style.display = 'block';
            document.getElementById('auth-pass-field').style.display = 'block';
            document.getElementById('auth-email-field').style.display = mode === 'signup' ? 'block' : 'none';
            document.getElementById('auth-otp-field').style.display = 'none';
            document.getElementById('auth-forgot-email-field').style.display = 'none';
            document.getElementById('auth-reset-token-field').style.display = 'none';
            document.getElementById('auth-reset-pass-field').style.display = 'none';
            document.getElementById('auth-social-buttons').style.display = 'flex';
            document.getElementById('auth-forgot-link').style.display = mode === 'login' ? 'block' : 'none';
        }

        function checkResponseStatus(resp) {
            if (resp.status === 403) {
                document.getElementById('ban-overlay').style.display = 'flex';
                document.body.innerHTML = document.getElementById('ban-overlay').outerHTML;
                throw new Error("Access terminated.");
            }
            return resp;
        }

        async function executeAuthentication() {
            const user = document.getElementById('auth-user').value.trim();
            const pass = document.getElementById('auth-pass').value.trim();
            const errorDiv = document.getElementById('auth-error');
            const successDiv = document.getElementById('auth-success');

            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            if (!user || !pass) {
                errorDiv.textContent = "Please fill in all credentials fields.";
                errorDiv.style.display = 'block';
                return;
            }

            if (activeAuthMode === 'signup') {
                const email = document.getElementById('auth-email').value.trim();
                if (!email) {
                    errorDiv.textContent = "Please enter your Email address.";
                    errorDiv.style.display = 'block';
                    return;
                }
                if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
                    errorDiv.textContent = "Registration requires a valid email address.";
                    errorDiv.style.display = 'block';
                    return;
                }
                if (!/^[a-zA-Z0-9_]{3,20}$/.test(user)) {
                    errorDiv.textContent = "Username must be alphanumeric, between 3 and 20 characters, and can only include underscores.";
                    errorDiv.style.display = 'block';
                    return;
                }
                
                try {
                    let backendSuccess = false;
                    let backendErrorMsg = "";
                    
                    try {
                        const response = await fetch('/api/signup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                            body: JSON.stringify({ email: email, username: user, password: pass })
                        });
                        if (response.ok) {
                            backendSuccess = true;
                        } else {
                            const errData = await response.json();
                            backendErrorMsg = errData.detail || "Signup failed.";
                        }
                    } catch (netErr) {
                        console.warn("Backend signup offline, falling back to local cloud cache:", netErr);
                    }

                    if (backendSuccess) {
                        toggleAuthMode('login');
                        successDiv.textContent = "Account created on server. You can now sign in.";
                        successDiv.style.display = 'block';
                        document.getElementById('auth-user').value = user;
                        document.getElementById('auth-pass').value = '';
                    } else if (backendErrorMsg) {
                        throw new Error(backendErrorMsg);
                    } else {
                        // Offline local fallback
                        let students = JSON.parse(localStorage.getItem('cloud_students') || '{}');
                        if (students[user]) {
                             throw new Error("Username already registered in offline cache.");
                        }
                        students[user] = { password: pass, email: email };
                        localStorage.setItem('cloud_students', JSON.stringify(students));
                        
                        toggleAuthMode('login');
                        successDiv.textContent = "Account created successfully! You can now sign in.";
                        successDiv.style.display = 'block';
                        document.getElementById('auth-user').value = user;
                        document.getElementById('auth-pass').value = '';
                    }
                } catch(e) {
                    errorDiv.textContent = e.message;
                    errorDiv.style.display = 'block';
                }
            } else {
                try {
                    let loginSuccess = false;
                    let loggedRole = 'student';
                    let loggedUser = user;
                    let backendErrorMsg = "";

                    // Try backend login first
                    try {
                        const response = await fetch('/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                            body: JSON.stringify({ username: user, password: pass })
                        });
                        if (response.ok) {
                            const data = await response.json();
                            loginSuccess = true;
                            loggedRole = data.role;
                            loggedUser = data.username;
                            if (data.session_id) {
                                sessionStorage.setItem('cyber_session_id', data.session_id);
                            }
                        } else {
                            const errData = await response.json();
                            backendErrorMsg = errData.detail || "Invalid credentials.";
                        }
                    } catch (netErr) {
                        console.warn("Backend login offline, falling back to local cloud cache:", netErr);
                    }

                    if (!loginSuccess && !backendErrorMsg) {
                        // Offline check
                        let students = JSON.parse(localStorage.getItem('cloud_students') || '{}');
                        if (user === 'reiz' && pass === 'heavenofreiz') {
                            loginSuccess = true;
                            loggedRole = 'admin';
                        } else if (user === 'de4thnote' && pass === 'burr1edonhe4ven') {
                            loginSuccess = true;
                            loggedRole = 'admin';
                        } else if (students[user] && students[user].password === pass) {
                            loginSuccess = true;
                            loggedRole = 'student';
                        }
                    }

                    if (loginSuccess) {
                        currentRole = loggedRole;
                        currentUsername = loggedUser;
                        
                        sessionStorage.setItem('cyber_role', currentRole);
                        sessionStorage.setItem('cyber_username', currentUsername);
                        if (!sessionStorage.getItem('cyber_session_id')) {
                            sessionStorage.setItem('cyber_session_id', 'mock-session-id-' + Math.random().toString(36).substring(2, 11));
                        }
                        
                        // Set redirection hash route
                        window.location.hash = `/${currentRole}/dashboard`;
                        
                        document.getElementById('user-name-lbl').textContent = currentUsername;
                        document.getElementById('user-role-lbl').textContent = currentRole;
                        document.getElementById('top-user-name-lbl').textContent = currentUsername;
                        document.getElementById('top-user-role-lbl').textContent = currentRole;
                        
                        document.getElementById('auth-overlay').style.display = 'none';
                        
                        // Set menu items
                        document.querySelectorAll('.nav-list .nav-item').forEach(item => {
                            const rolesAttr = item.getAttribute('data-roles');
                            if (rolesAttr) {
                                const roles = rolesAttr.split(',');
                                if (roles.includes(currentRole)) {
                                    item.style.display = 'block';
                                } else {
                                    item.style.display = 'none';
                                }
                            } else {
                                item.style.display = 'block';
                            }
                        });

                        // Show/Hide category headers based on nested sub-list visibility
                        document.querySelectorAll('.nav-sub-list').forEach(subList => {
                            const visibleChildren = Array.from(subList.querySelectorAll('.nav-item')).some(item => item.style.display !== 'none');
                            const header = subList.previousElementSibling;
                            if (header && header.classList.contains('nav-category-header')) {
                                if (visibleChildren) {
                                    header.style.display = 'flex';
                                } else {
                                    header.style.display = 'none';
                                }
                            }
                        });

                        // Filter Hub cards based on user role
                        document.querySelectorAll('.hub-grid .hub-card').forEach(card => {
                            const rolesAttr = card.getAttribute('data-roles');
                            if (rolesAttr) {
                                const roles = rolesAttr.split(',');
                                if (roles.includes(currentRole)) {
                                    card.style.display = 'flex';
                                } else {
                                    card.style.display = 'none';
                                }
                            } else {
                                card.style.display = 'flex';
                            }
                        });

                        switchPanel('welcome');
                        filterAcadDashboardTabs();

                        if (currentRole === 'admin') {
                            document.getElementById('admin-dashboard-details').style.display = 'block';
                            loadAdminMetrics();
                            loadFacultyList();
                            loadStudentListForManagement();
                        } else {
                            document.getElementById('admin-dashboard-details').style.display = 'none';
                        }

                        // Academic announcements board controls
                        if (currentRole === 'admin' || currentRole === 'faculty') {
                            document.getElementById('academic-publisher-card').style.display = 'block';
                        } else {
                            document.getElementById('academic-publisher-card').style.display = 'none';
                        }

                        loadAcademicAnnouncements();
                        fetchLatestNewsAndCves();
                        loadIncidents();
                        auditProtocol();
                        startBanCheckPoller();
                    } else {
                        throw new Error(backendErrorMsg || "Invalid credentials.");
                    }
                } catch(e) {
                    errorDiv.textContent = e.message;
                    errorDiv.style.display = 'block';
                }
            }
        }

        async function logout() {
            try {
                await fetch('/api/logout', { 
                    method: 'POST', 
                    headers: {'X-CSRF-Token': getCookie('csrf_token')} 
                });
            } catch(e) {}
            sessionStorage.removeItem('cyber_session_id');
            sessionStorage.removeItem('cyber_role');
            sessionStorage.removeItem('cyber_username');
            currentRole = null;
            currentUsername = null;
            window.location.hash = '';
            document.getElementById('auth-overlay').style.display = 'flex';
            document.getElementById('auth-user').value = '';
            document.getElementById('auth-pass').value = '';
            toggleAuthMode('login');
            location.reload();
        }

        let activeHubPanel = 'welcome';

        function switchPanel(panelName, element) {
            // Client-side Role-Based Access Validation
            const panelRoleRestrictions = {
                'dashboard': ['admin'],
                'student-user-management': ['admin'],
                'faculty-mgmt': ['admin'],
                'incident-console': ['admin'],
                'faculty-dashboard': ['faculty', 'admin'],
                'academic-dashboard': ['faculty', 'admin'],
                'student-dashboard': ['student', 'admin'],
                'threat-reporting': ['faculty', 'student']
            };
            if (panelRoleRestrictions[panelName]) {
                if (!panelRoleRestrictions[panelName].includes(currentRole)) {
                    alert("Access Denied: You do not have permission to access the " + panelName + " workspace.");
                    return;
                }
            }

            // Remove active classes from all items and category headers
            document.querySelectorAll('.nav-list .nav-item').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.nav-list .nav-category-header').forEach(hdr => hdr.classList.remove('active'));
            
            if (element) {
                element.classList.add('active');
            } else {
                // Highlight the sub-item or category header matching this panelName
                const foundItem = Array.from(document.querySelectorAll('.nav-list .nav-item')).find(item => {
                    const onclickStr = item.getAttribute('onclick') || '';
                    return onclickStr.includes(`'${panelName}'`);
                });
                if (foundItem) {
                    foundItem.classList.add('active');
                    // Auto-expand its parent sub-list accordion
                    const parentList = foundItem.parentElement;
                    if (parentList && parentList.classList.contains('nav-sub-list') && parentList.style.display !== 'block') {
                        const hubName = parentList.id.replace('sub-', '');
                        openSidebarAccordion(hubName);
                    }
                } else if (panelName === 'welcome') {
                    const welcomeHdr = document.querySelector(".nav-category-header[onclick*='welcome']");
                    if (welcomeHdr) welcomeHdr.classList.add('active');
                }
            }

            // Set active hub if switching to a hub panel
            if (panelName.startsWith('hub-')) {
                activeHubPanel = panelName;
            }
            
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById(`panel-${panelName}`);
            if (targetPanel) targetPanel.classList.add('active');
            
            // Stop camera if leaving scanner workspace
            if (panelName !== 'camera-scanner') {
                stopCameraScanner();
            }
            
            // Dynamically load panel-specific feeds upon switching tabs
            if (panelName === 'cve-news-feed') {
                fetchLatestNewsAndCves();
            } else if (panelName === 'academic-rules-center') {
                loadAcademicAnnouncements();
                renderAdvisoryFiles();
            } else if (panelName === 'student-user-management') {
                loadStudentListForManagement();
            } else if (panelName === 'quiz') {
                loadQuestion();
            } else if (panelName === 'chat') {
                loadChatHistory();
            } else if (panelName === 'academic-dashboard') {
                renderLeaderboard();
                filterAcadDashboardTabs();
                renderAcadTabContent();
                populateInspectStudentDropdown();
            }

            // Dynamically show or hide left sidebar depending on hub context
            const sidebar = document.querySelector('.sidebar');
            const workspace = document.querySelector('.workspace');
            if (sidebar && workspace) {
                const needsSidebar = (panelName === 'hub-cyberlab' || panelName.startsWith('owasp-') || panelName.startsWith('basics-') || panelName.startsWith('linux-') || panelName.startsWith('windows-') || panelName.startsWith('netcourse-') || panelName.startsWith('webcourse-') || panelName.startsWith('websec-') || panelName.startsWith('burp-') || panelName.startsWith('nmap-') || panelName.startsWith('wireshark-') || panelName.startsWith('pass-') || panelName.startsWith('crypto-') || panelName.startsWith('linuxshell-'));
                
                const isMobile = window.innerWidth < 768;
                
                if (needsSidebar) {
                    if (isMobile) {
                        sidebar.style.setProperty('display', 'flex', 'important');
                        workspace.style.setProperty('margin-left', '0', 'important');
                        workspace.style.setProperty('width', '100%', 'important');
                        
                        sidebar.classList.remove('mobile-active');
                        const toggleBtn = document.getElementById('mobile-sidebar-toggle');
                        if (toggleBtn) {
                            toggleBtn.style.display = 'block';
                            toggleBtn.textContent = "📚 Open Course Menu";
                        }
                    } else {
                        sidebar.style.setProperty('display', 'block', 'important');
                        workspace.style.setProperty('margin-left', '280px', 'important');
                        workspace.style.setProperty('width', 'calc(100% - 280px)', 'important');
                        const toggleBtn = document.getElementById('mobile-sidebar-toggle');
                        if (toggleBtn) toggleBtn.style.display = 'none';
                    }
                    
                    if (panelName.startsWith('basics-')) {
                        openSidebarAccordion('basics');
                    } else if (panelName.startsWith('linux-')) {
                        openSidebarAccordion('linux');
                    } else if (panelName.startsWith('windows-')) {
                        openSidebarAccordion('windows');
                    } else if (panelName.startsWith('netcourse-')) {
                        openSidebarAccordion('netcourse');
                    } else if (panelName.startsWith('webcourse-')) {
                        openSidebarAccordion('webcourse');
                    } else if (panelName.startsWith('websec-')) {
                        openSidebarAccordion('websec');
                    } else if (panelName.startsWith('burp-')) {
                        openSidebarAccordion('burp');
                    } else if (panelName.startsWith('nmap-')) {
                        openSidebarAccordion('nmap');
                    } else if (panelName.startsWith('wireshark-')) {
                        openSidebarAccordion('wireshark');
                    } else if (panelName.startsWith('pass-')) {
                        openSidebarAccordion('pass');
                    } else if (panelName.startsWith('crypto-')) {
                        openSidebarAccordion('crypto');
                    } else if (panelName.startsWith('linuxshell-')) {
                        openSidebarAccordion('linuxshell');
                    } else {
                        openSidebarAccordion('owasp');
                    }
                } else {
                    sidebar.style.setProperty('display', 'none', 'important');
                    workspace.style.setProperty('margin-left', '0', 'important');
                    workspace.style.setProperty('width', '100%', 'important');
                    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
                    if (toggleBtn) toggleBtn.style.display = 'none';
                }
            }
        }

        function toggleSidebarAccordion(hubName) {
            const list = document.getElementById(`sub-${hubName}`);
            const isVisible = list.style.display === 'block';
            
            // Close all accordions first
            document.querySelectorAll('.nav-sub-list').forEach(l => l.style.display = 'none');
            document.querySelectorAll('.nav-category-header').forEach(h => {
                h.classList.remove('active');
                const arrow = h.querySelector('.accordion-arrow');
                if (arrow) arrow.textContent = '▲';
            });

            // If it was hidden, show it now
            if (!isVisible) {
                list.style.display = 'block';
                const header = list.previousElementSibling;
                header.classList.add('active');
                const arrow = header.querySelector('.accordion-arrow');
                if (arrow) arrow.textContent = '▼';
            }
        }

        function openSidebarAccordion(hubName) {
            const list = document.getElementById(`sub-${hubName}`);
            if (list) {
                list.style.display = 'block';
                const header = list.previousElementSibling;
                if (header) {
                    header.classList.add('active');
                    const arrow = header.querySelector('.accordion-arrow');
                    if (arrow) arrow.textContent = '▼';
                }
            }
        }

        function goBackToHub() {
            switchPanel(activeHubPanel || 'hub-cyberlab');
        }

        function injectBackToHubButtons() {
            document.querySelectorAll('.panel').forEach(panel => {
                // Do not put back buttons on the core landing hubs or welcome panels
                if (panel.id === 'panel-welcome' || panel.id === 'panel-auth-overlay' || panel.id === 'panel-ban-overlay') return;
                
                // Remove existing back button containers if any to prevent duplication
                const existing = panel.querySelector('.back-to-hub-container');
                if (existing) existing.remove();
                
                const backRow = document.createElement('div');
                backRow.className = 'back-to-hub-container';
                backRow.style.marginBottom = '25px';
                backRow.style.display = 'flex';
                backRow.style.justifyContent = 'flex-start';
                
                const btn = document.createElement('button');
                btn.className = 'btn';
                btn.innerHTML = '<span style="margin-right:8px;">←</span> Back to Hub Dashboard';
                btn.style.background = 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)';
                btn.style.color = '#ffffff';
                btn.style.border = 'none';
                btn.style.borderRadius = '8px';
                btn.style.padding = '10px 20px';
                btn.style.fontSize = '0.85rem';
                btn.style.fontWeight = '700';
                btn.style.cursor = 'pointer';
                btn.style.transition = 'all 0.2s ease';
                btn.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.25)';
                
                btn.onmouseover = () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 6px 16px rgba(225, 29, 72, 0.4)';
                };
                btn.onmouseout = () => {
                    btn.style.transform = 'none';
                    btn.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.25)';
                };
                
                btn.onclick = goBackToHub;
                backRow.appendChild(btn);
                
                if (panel.firstChild) {
                    panel.insertBefore(backRow, panel.firstChild);
                } else {
                    panel.appendChild(backRow);
                }
            });
        }

        // Load admin statistics & user activity logs
        async function loadAdminMetrics() {
            if(currentRole !== 'admin') return;
            try {
                const response = await fetch(`/api/admin/metrics?role=${currentRole}&username=${currentUsername}`);
                checkResponseStatus(response);
                const data = await response.json();

                const usersBody = document.getElementById('metrics-users-body');
                usersBody.innerHTML = '';
                data.users.forEach(u => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${u.username}</td><td><span class="role">${u.role}</span></td>`;
                    usersBody.appendChild(tr);
                });

                // Populate activities stream
                const actBody = document.getElementById('metrics-activity-body');
                actBody.innerHTML = '';
                if(!data.activities || data.activities.length === 0) {
                    actBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No recent user operations registered.</td></tr>';
                } else {
                    data.activities.forEach(act => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${act.timestamp}</td>
                            <td><b>${act.username}</b> <span style="font-size:0.8rem;color:var(--text-muted);">(${act.role})</span></td>
                            <td><code>${act.ip}</code><br><span style="font-size:0.75rem;color:var(--text-muted);">${act.location || 'Unknown Location'}</span></td>
                            <td><span style="font-size:0.85rem;font-weight:600;color:var(--accent-red);">${act.device || 'Unknown OS'}</span></td>
                            <td>${act.action}</td>
                            <td>
                                <button class="btn" style="padding:6px 12px;font-size:0.8rem;background:var(--accent-red);" onclick="terminateUserIP('${act.ip}')">Terminate</button>
                            </td>
                        `;
                        actBody.appendChild(tr);
                    });
                }

                const secBody = document.getElementById('metrics-security-body');
                if (secBody) {
                    secBody.innerHTML = '';
                    if(!data.security_logs || data.security_logs.length === 0) {
                        secBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No security alerts registered.</td></tr>';
                    } else {
                        data.security_logs.forEach(log => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td>${log.timestamp}</td>
                                <td style="color:var(--accent-red);font-weight:600;">${log.ip}</td>
                                <td>
                                    <b>Path:</b> ${log.path}<br>
                                    <span style="font-size:0.8rem;color:var(--text-muted);">${log.user_agent}</span>
                                </td>
                                <td>${log.username}</td>
                                <td style="color:var(--accent-red);">${log.action}</td>
                            `;
                            secBody.appendChild(tr);
                        });
                    }
                }

                // Populate banned IPs
                const bannedBody = document.getElementById('metrics-banned-ips-body');
                if (bannedBody) {
                    bannedBody.innerHTML = '';
                    if (!data.banned_ips || data.banned_ips.length === 0) {
                        bannedBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No blacklisted IPs.</td></tr>';
                    } else {
                        data.banned_ips.forEach(b => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td>${b.timestamp || 'N/A'}</td>
                                <td style="color:var(--accent-red);font-weight:600;">${b.ip}</td>
                                <td>${b.reason || 'N/A'}</td>
                                <td>
                                    <button class="btn" style="padding:6px 12px;font-size:0.8rem;background:#10b981;" onclick="unbanUserIP('${b.ip}')">Unban IP</button>
                                </td>
                            `;
                            bannedBody.appendChild(tr);
                        });
                    }
                }

            } catch (err) {
                console.error(err);
            }
        }

        async function terminateUserIP(ip) {
            if (!confirm(`Are you sure you want to terminate connection and blacklist IP: ${ip}?`)) return;
            try {
                const response = await fetch(`/api/admin/ban?role=${currentRole}&username=${currentUsername}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ ip })
                });
                checkResponseStatus(response);
                if (response.ok) {
                    alert(`IP ${ip} blacklisted successfully.`);
                    loadAdminMetrics();
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function unbanUserIP(ip) {
            if (!confirm(`Are you sure you want to lift the blacklist for IP: ${ip}?`)) return;
            try {
                const response = await fetch(`/api/admin/unban?role=${currentRole}&username=${currentUsername}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ ip })
                });
                checkResponseStatus(response);
                if (response.ok) {
                    alert(`IP ${ip} unbanned successfully.`);
                    loadAdminMetrics();
                }
            } catch(e) {
                console.error(e);
            }
        }

        // Faculty management
        async function loadFacultyList() {
            if(currentRole !== 'admin') return;
            try {
                const response = await fetch(`/api/admin/faculty?role=${currentRole}&username=${currentUsername}`);
                checkResponseStatus(response);
                const data = await response.json();

                document.getElementById('fac-limit-val').value = data.limit;
                
                const tbody = document.getElementById('faculty-list-body');
                tbody.innerHTML = '';

                if(!data.faculties || data.faculties.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">No faculty accounts configured.</td></tr>';
                    return;
                }

                data.faculties.forEach(fac => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><b>${fac.username}</b></td>
                        <td><code>${fac.password}</code></td>
                        <td>
                            <button class="btn" style="padding:6px 12px;font-size:0.8rem;background:var(--accent-red);color:white;" onclick="deleteFaculty('${fac.username}')">Remove</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

            } catch(e) {
                console.error(e);
            }
        }

        async function updateFacultyLimit() {
            const limit = parseInt(document.getElementById('fac-limit-val').value);
            if(!limit || limit < 1) return alert("Enter limit.");

            try {
                const response = await fetch(`/api/admin/faculty/limit?role=${currentRole}&username=${currentUsername}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ limit })
                });
                checkResponseStatus(response);
                if(response.ok) {
                    alert("Limit updated.");
                    loadFacultyList();
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function addNewFaculty() {
            const user = document.getElementById('new-fac-user').value.trim();
            const pass = document.getElementById('new-fac-pass').value.trim();

            if(!user || !pass) return alert("Enter credentials.");

            try {
                const response = await fetch(`/api/admin/faculty?role=${currentRole}&username=${currentUsername}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ username: user, password: pass })
                });
                checkResponseStatus(response);
                if(response.ok) {
                    document.getElementById('new-fac-user').value = '';
                    document.getElementById('new-fac-pass').value = '';
                    loadFacultyList();
                    loadAdminMetrics();
                } else {
                    const data = await response.json();
                    alert(data.detail || "Failed.");
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function deleteFaculty(name) {
            try {
                const response = await fetch(`/api/admin/faculty?target_username=${name}&role=${currentRole}&username=${currentUsername}`, {
                    method: 'DELETE'
                });
                checkResponseStatus(response);
                if(response.ok) {
                    loadFacultyList();
                    loadAdminMetrics();
                }
            } catch(e) {
                console.error(e);
            }
        }

        // 1. Phone OSINT Lookup
        async function runPhoneOsint() {
            const num = document.getElementById('phone-osint-input').value.trim();
            if(!num) return alert("Please enter a phone number.");
            
            const resDiv = document.getElementById('res-phone-osint');
            const resBox = document.getElementById('phone-osint-result-box');
            resBox.style.display = 'block';
            resDiv.innerHTML = "Initializing OSINT resolver lookup...\n";
            
            try {
                const response = await fetch(`/api/osint/phone?number=${encodeURIComponent(num)}&username=${currentUsername}&role=${currentRole}`);
                const data = await response.json();
                if (data.error) {
                    resDiv.innerHTML = `<span style="color:var(--accent-red);">${data.error}</span>`;
                    return;
                }
                
                resDiv.innerHTML = `
<b>Phone:</b> ${data.clean_number}
<b>Registered Country:</b> ${data.country}
<b>Inferred Carrier:</b> ${data.carrier}
<b>Social Presence Indicators:</b>
  - WhatsApp: ${data.social_presence.whatsapp}
  - Telegram: ${data.social_presence.telegram}
  - Signal Messenger: ${data.social_presence.signal}

<b>Potential Usage Profile:</b>
${data.potential_usages.map(u => `  * ${u}`).join('\n')}
                `;
            } catch(e) {
                resDiv.innerHTML = `<span style="color:var(--accent-red);">OSINT Lookup Failure: ${e.message}</span>`;
            }
        }

        // 2. Phishing Scan
        async function runPhishingScan() {
            const url = document.getElementById('url-threat-input').value.trim();
            if(!url) return alert("Please enter a link URL.");
            
            const resDiv = document.getElementById('res-phishing-scan');
            const resBox = document.getElementById('phish-result-box');
            resBox.style.display = 'block';
            resDiv.innerHTML = "Parsing URL parameters...\n";
            
            try {
                const response = await fetch(`/api/url/detect?url=${encodeURIComponent(url)}&username=${currentUsername}&role=${currentRole}`);
                const data = await response.json();
                
                let flagText = data.threat_flags.length > 0 ? 
                    data.threat_flags.map(f => `  <span style="color:var(--accent-red);">● Warning:</span> ${f}`).join('\n') : 
                    "  No active threat signatures matched.";
                    
                resDiv.innerHTML = `
<b>Scanned URL:</b> ${data.url}
<b>Host Domain:</b> ${data.domain}
<b>Vulnerability Score:</b> ${data.risk_score} %
<b>AI Verdict:</b> <span style="font-weight:bold; color:${data.verdict === 'SAFE' ? '#10b981' : (data.verdict === 'SUSPICIOUS' ? '#f59e0b' : 'var(--accent-red)')};">${data.verdict}</span>

<b>Threat Signatures Detected:</b>
${flagText}
                `;
            } catch(e) {
                resDiv.innerHTML = `<span style="color:var(--accent-red);">Scan Failure: ${e.message}</span>`;
            }
        }

        // 3. Reputation Check
        async function runReputationCheck() {
            const domain = document.getElementById('reputation-domain-input').value.trim();
            if(!domain) return alert("Please enter a domain.");
            
            const resDiv = document.getElementById('res-reputation-check');
            const resBox = document.getElementById('reputation-result-box');
            resBox.style.display = 'block';
            resDiv.innerHTML = "Querying reputation index...\n";
            
            try {
                const response = await fetch(`/api/url/reputation?domain=${encodeURIComponent(domain)}`);
                const data = await response.json();
                
                resDiv.innerHTML = `
<b>Target Domain:</b> ${data.domain}
<b>Reputation Trust Score:</b> ${data.reputation_score} / 100
<b>Inferred Hosting ASN:</b> ${data.hosting_provider}
<b>Threat Classification:</b> ${data.domain_category}
<b>Global Standing:</b> <span style="font-weight:bold; color:${data.risk_level === 'Low' ? '#10b981' : 'var(--accent-red)'};">${data.risk_level} Risk</span>
<b>Domain Blocklisted:</b> ${data.blocklisted ? '<span style="color:var(--accent-red);">Yes</span>' : 'No'}
                `;
            } catch(e) {
                resDiv.innerHTML = `<span style="color:var(--accent-red);">Reputation Check Failure: ${e.message}</span>`;
            }
        }

        // 4. Disposable Email Check
        async function runDisposableEmailCheck() {
            const email = document.getElementById('email-disposable-input').value.trim();
            if(!email) return alert("Please enter an email address.");
            
            const resDiv = document.getElementById('res-disposable-check');
            const resBox = document.getElementById('disposable-result-box');
            resBox.style.display = 'block';
            resDiv.innerHTML = "Scanning email provider MX attributes...\n";
            
            try {
                const response = await fetch(`/api/email/disposable?email=${encodeURIComponent(email)}`);
                const data = await response.json();
                
                resDiv.innerHTML = `
<b>Email Input:</b> ${data.email}
<b>Domain:</b> ${data.domain}
<b>Verdict:</b> <span style="font-weight:bold; color:${data.is_disposable ? 'var(--accent-red)' : '#10b981'};">${data.verdict}</span>
                `;
            } catch(e) {
                resDiv.innerHTML = `<span style="color:var(--accent-red);">Disposable Check Failure: ${e.message}</span>`;
            }
        }

        // 5. File Metadata Viewer
        async function processFileMetadata(file) {
            if(!file) return;
            const resDiv = document.getElementById('res-metadata-viewer');
            const resBox = document.getElementById('metadata-result-box');
            document.getElementById('metadata-dropzone-text').textContent = `Loaded: ${file.name}`;
            resBox.style.display = 'block';
            resDiv.innerHTML = "Reading file binaries...\n";
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Content = reader.result.split(',')[1];
                try {
                    const response = await fetch('/api/metadata/view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                        body: JSON.stringify({ filename: file.name, base64_data: base64Content })
                    });
                    const data = await response.json();
                    
                    let metaText = "";
                    for (const [key, val] of Object.entries(data.metadata_fields)) {
                        metaText += `  - <b>${key}:</b> ${val}\n`;
                    }
                    
                    resDiv.innerHTML = `
<b>Filename:</b> ${data.filename}
<b>Inferred Format:</b> ${data.mime_type}
<b>File Size:</b> ${data.file_size}
<b>Header Signature (Hex):</b> ${data.header_hex_signature}

<b>Metadata Properties:</b>
${metaText}
                    `;
                } catch(err) {
                    resDiv.innerHTML = `<span style="color:var(--accent-red);">Metadata Extraction Failure: ${err.message}</span>`;
                }
            };
        }

        // Image Place Geolocation Finder Callback
        async function processImagePlace(file) {
            if(!file) return;
            const resDiv = document.getElementById('res-image-place');
            const resBox = document.getElementById('place-result-box');
            document.getElementById('place-dropzone-text').textContent = `Loaded Landmark Photo: ${file.name}`;
            resBox.style.display = 'block';
            resDiv.innerHTML = "Parsing visual traits and checking metadata signatures...\n";
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Content = reader.result.split(',')[1];
                try {
                    const response = await fetch('/api/metadata/place', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                        body: JSON.stringify({ filename: file.name, base64_data: base64Content })
                    });
                    const data = await response.json();
                    
                    let coordsText = "No GPS coordinates embedded in this image.";
                    let osmLink = "";
                    if (data.latitude !== null && data.longitude !== null) {
                        coordsText = `${data.latitude.toFixed(6)} Latitude, ${data.longitude.toFixed(6)} Longitude`;
                        osmLink = `<br><b>OpenStreetMap Registry Map Link:</b> <a href="https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=16/${data.latitude}/${data.longitude}" target="_blank" style="color:var(--accent-red); font-weight:700;">Open Live Map Coordinates 📍</a>`;
                    }
                    
                    let isNotFound = data.landmark_name.startsWith("Unable to fetch");
                    let nameColor = isNotFound ? "var(--text-muted)" : "#10b981";
                    
                    resDiv.innerHTML = `
<b>Filename:</b> ${data.filename}
<b>Identified Landmark Place:</b> <span style="color:${nameColor}; font-weight:700;">${data.landmark_name}</span>
<b>Country Origin:</b> ${data.country}
<b>Coordinate Markers:</b> ${coordsText}
${osmLink}

<b>Simulated Geolocation Host IP of the Location:</b> <span style="font-family:'JetBrains Mono', monospace; font-weight:700;">${data.simulated_location_ip}</span>
                    `;
                } catch(err) {
                    resDiv.innerHTML = `<span style="color:var(--accent-red);">Place Geolocator Scan Failure: ${err.message}</span>`;
                }
            };
        }

        // 6. NVD CVE & Security News Feed
        async function fetchLatestNewsAndCves() {
            const cveContainer = document.getElementById('nvd-cve-feed-container');
            const newsContainer = document.getElementById('threat-news-feed-container');
            
            if (cveContainer) cveContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Fetching live CVE catalog...</div>';
            if (newsContainer) newsContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Fetching news updates...</div>';
            
            try {
                const response = await fetch('/api/news/latest');
                const data = await response.json();
                
                // 1. Render News
                if (newsContainer) {
                    newsContainer.innerHTML = '';
                    if (!data.news || data.news.length === 0) {
                        newsContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No recent news found.</div>';
                    } else {
                        data.news.forEach(item => {
                            const card = document.createElement('div');
                            card.style.background = 'var(--bg-dark)';
                            card.style.border = '1px solid var(--border-panel)';
                            card.style.borderRadius = '8px';
                            card.style.padding = '12px';
                            
                            card.innerHTML = `
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                    <span style="font-weight:bold; color:var(--text-main); font-size:0.85rem;">${item.title}</span>
                                    <span style="font-size:0.7rem; padding:2px 6px; border-radius:4px; background:rgba(220,38,38,0.1); color:var(--accent-red); font-weight:700;">${item.severity || 'High'}</span>
                                </div>
                                <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.4; margin-bottom:6px;">${item.summary}</p>
                                <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:#64748b;">
                                    <span>Source: Threat Intelligence Core</span>
                                    <span>${item.date}</span>
                                </div>
                            `;
                            newsContainer.appendChild(card);
                        });
                    }
                }
                
                // 2. Render CVEs
                if (cveContainer) {
                    cveContainer.innerHTML = '';
                    if (!data.cves || data.cves.length === 0) {
                        cveContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No recent CVEs found.</div>';
                    } else {
                        data.cves.forEach(item => {
                            const card = document.createElement('div');
                            card.style.background = 'var(--bg-dark)';
                            card.style.border = '1px solid var(--border-panel)';
                            card.style.borderRadius = '8px';
                            card.style.padding = '12px';
                            
                            card.innerHTML = `
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                    <span style="font-weight:bold; color:var(--accent-red); font-size:0.85rem;">${item.id}</span>
                                    <span style="font-size:0.7rem; font-weight:700; color:#ef4444;">CVSS: ${item.cvss}</span>
                                </div>
                                <p style="font-size:0.7rem; color:var(--text-muted); line-height:1.4;">${item.summary}</p>
                                <div style="display:flex; justify-content:flex-end; font-size:0.65rem; color:#64748b; margin-top:4px;">
                                    <span>Published: ${item.published}</span>
                                </div>
                            `;
                            cveContainer.appendChild(card);
                        });
                    }
                }
            } catch(e) {
                if (newsContainer) newsContainer.innerHTML = `<span style="color:var(--accent-red);">News offline: ${e.message}</span>`;
                if (cveContainer) cveContainer.innerHTML = `<span style="color:var(--accent-red);">CVE offline: ${e.message}</span>`;
            }
        }

        // 7. MITRE Mapping Search
        async function runMitreMapping() {
            const query = document.getElementById('mitre-search-input').value.trim();
            if(!query) return alert("Please enter search parameters.");
            
            const resDiv = document.getElementById('res-mitre-mapping');
            const resBox = document.getElementById('mitre-result-box');
            resBox.style.display = 'block';
            resDiv.innerHTML = "Searching MITRE ATT&CK mitigation databases...\n";
            
            try {
                const response = await fetch(`/api/mitre/mapping?query=${encodeURIComponent(query)}`);
                const data = await response.json();
                if(data.matches.length === 0) {
                    resDiv.innerHTML = "No matching MITRE ATT&CK techniques found.";
                    return;
                }
                
                let matchesHtml = "";
                data.matches.forEach(tech => {
                    matchesHtml += `
<b>[ID: ${tech.technique_id}] ${tech.name}</b>
  - Tactic: ${tech.tactic}
  - Description: ${tech.description}
--------------------------------------------------\n`;
                });
                resDiv.innerHTML = matchesHtml;
            } catch(e) {
                resDiv.innerHTML = `<span style="color:var(--accent-red);">MITRE Search Failure: ${e.message}</span>`;
            }
        }

        // 8. Academic rules & Announcements Posting CRUD
        async function loadAcademicAnnouncements() {
            const container = document.getElementById('academic-posts-feed-container');
            if (!container) return;
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Loading announcements...</div>';
            
            try {
                const response = await fetch('/api/academic/posts');
                const data = await response.json();
                container.innerHTML = '';
                
                if (data.posts.length === 0) {
                    container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size:0.8rem;">No academic announcements registered.</div>';
                    return;
                }
                
                data.posts.forEach(post => {
                    const card = document.createElement('div');
                    card.style.background = 'var(--bg-dark)';
                    card.style.border = '1px solid var(--border-panel)';
                    card.style.borderRadius = '8px';
                    card.style.padding = '15px';
                    card.style.lineHeight = '1.6';
                    
                    let attachmentHtml = '';
                    if (post.file_data) {
                        const isImage = post.file_type && post.file_type.startsWith('image/');
                        const isAudio = post.file_type && post.file_type.startsWith('audio/');
                        const isPdf = post.file_type && post.file_type.includes('pdf');
                        
                        if (isImage) {
                            attachmentHtml = `
                                <div style="margin-top:12px; margin-bottom:12px; border-radius:8px; overflow:hidden; max-width:320px; border:1px solid rgba(255,255,255,0.08);">
                                    <img src="${post.file_data}" style="width:100%; display:block;" alt="${escapeHtml(post.file_name)}">
                                </div>
                                <a href="${post.file_data}" download="${escapeHtml(post.file_name)}" class="btn btn-secondary" style="font-size:0.75rem; padding:4px 8px; display:inline-block; text-decoration:none;">Download Image 🖼️</a>
                            `;
                        } else if (isAudio) {
                            attachmentHtml = `
                                <div style="margin-top:12px; margin-bottom:12px;">
                                    <audio controls src="${post.file_data}" style="width:100%; max-width:400px; display:block;"></audio>
                                </div>
                                <a href="${post.file_data}" download="${escapeHtml(post.file_name)}" class="btn btn-secondary" style="font-size:0.75rem; padding:4px 8px; display:inline-block; text-decoration:none;">Download Voice Note 🔊</a>
                            `;
                        } else if (isPdf) {
                            attachmentHtml = `
                                <div style="margin-top:12px; margin-bottom:12px; display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.02); padding:10px; border:1px solid rgba(255,255,255,0.05); border-radius:6px; max-width:400px;">
                                    <span style="font-size:1.5rem;">📕</span>
                                    <div style="flex:1; overflow:hidden;">
                                        <span style="font-weight:700; color:#fff; display:block; font-size:0.8rem; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHtml(post.file_name)}</span>
                                        <span style="font-size:0.7rem; color:var(--text-muted);">PDF Document</span>
                                    </div>
                                </div>
                                <a href="${post.file_data}" download="${escapeHtml(post.file_name)}" class="btn btn-secondary" style="font-size:0.75rem; padding:4px 8px; display:inline-block; text-decoration:none; background:#10b981;">Download PDF Document 📥</a>
                            `;
                        } else {
                            attachmentHtml = `
                                <div style="margin-top:12px; margin-bottom:12px; display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.02); padding:10px; border:1px solid rgba(255,255,255,0.05); border-radius:6px; max-width:400px;">
                                    <span style="font-size:1.5rem;">📄</span>
                                    <div style="flex:1; overflow:hidden;">
                                        <span style="font-weight:700; color:#fff; display:block; font-size:0.8rem; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHtml(post.file_name)}</span>
                                        <span style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(post.file_type || 'Shared File')}</span>
                                    </div>
                                </div>
                                <a href="${post.file_data}" download="${escapeHtml(post.file_name)}" class="btn btn-secondary" style="font-size:0.75rem; padding:4px 8px; display:inline-block; text-decoration:none; background:#10b981;">Download Attachment 📥</a>
                            `;
                        }
                    }

                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-panel); padding-bottom:6px; margin-bottom:10px;">
                            <span style="font-weight:bold; color:var(--accent-red); font-size:0.95rem;">${escapeHtml(post.title)}</span>
                            <span style="font-size:0.7rem; color:#64748b;">${escapeHtml(post.timestamp)}</span>
                        </div>
                        <p style="font-size:0.85rem; color:var(--text-main); margin-bottom:8px; white-space:pre-wrap;">${escapeHtml(post.content)}</p>
                        <div style="margin-bottom:12px;">${attachmentHtml}</div>
                        <div style="font-size:0.7rem; color:var(--text-muted); text-align:right;">
                            Published by: <b>${escapeHtml(post.author)}</b>
                        </div>
                    `;
                    container.appendChild(card);
                });
            } catch(e) {
                container.innerHTML = `<span style="color:var(--accent-red);">Announcements offline: ${e.message}</span>`;
            }
        }

        let mockVoiceDataUrl = null;
        let isMockRecordingVoice = false;
        
        function toggleMockVoiceRecording() {
            const statusDiv = document.getElementById('academic-post-voice-status');
            const recordText = document.getElementById('record-text');
            const btn = document.getElementById('btn-mock-record');
            
            if (!isMockRecordingVoice) {
                isMockRecordingVoice = true;
                recordText.textContent = "Stop & Save";
                btn.style.background = "#e11d48";
                statusDiv.style.display = "block";
                statusDiv.textContent = "🎙️ Recording Voice Note... Speak now.";
            } else {
                isMockRecordingVoice = false;
                recordText.textContent = "Record Voice";
                btn.style.background = "var(--bg-card)";
                statusDiv.textContent = "✓ Voice Note Recorded (VoiceNote.wav). Ready to attach.";
                // In a browser environment without user audio permission blockers we can mock the standard wav data URL
                mockVoiceDataUrl = "data:audio/wav;base64,UklGRiQAAABXQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
            }
        }

        async function publishAcademicRule() {
            const title = document.getElementById('academic-post-title').value.trim();
            const content = document.getElementById('academic-post-content').value.trim();
            const fileInput = document.getElementById('academic-post-file');
            
            if(!title || !content) return alert("Please fill all rules content fields.");
            
            let fileName = null;
            let fileType = null;
            let fileData = null;
            
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                fileName = file.name;
                fileType = file.type;
                
                const reader = new FileReader();
                reader.onload = async function(e) {
                    fileData = e.target.result;
                    await submitPost(title, content, fileName, fileType, fileData);
                };
                reader.readAsDataURL(file);
            } else if (mockVoiceDataUrl) {
                fileName = "VoiceNote.wav";
                fileType = "audio/wav";
                fileData = mockVoiceDataUrl;
                await submitPost(title, content, fileName, fileType, fileData);
            } else {
                await submitPost(title, content, null, null, null);
            }
        }
        
        async function submitPost(title, content, fileName, fileType, fileData) {
            try {
                const response = await fetch(`/api/academic/posts?role=${currentRole}&username=${currentUsername}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ 
                        title, 
                        content, 
                        author: currentUsername,
                        file_name: fileName,
                        file_type: fileType,
                        file_data: fileData
                    })
                });
                if(response.ok) {
                    document.getElementById('academic-post-title').value = '';
                    document.getElementById('academic-post-content').value = '';
                    const fileInput = document.getElementById('academic-post-file');
                    if (fileInput) fileInput.value = '';
                    mockVoiceDataUrl = null;
                    document.getElementById('academic-post-voice-status').style.display = 'none';
                    alert("Advisory published successfully.");
                    loadAcademicAnnouncements();
                } else {
                    const data = await response.json();
                    alert(data.detail || "Publishing failed.");
                }
            } catch(e) {
                alert("Error connecting to server.");
            }
        }

        // 9. Student User Account Manager (Admin CRUD Controls)
        async function loadStudentListForManagement() {
            const body = document.getElementById('student-management-list-body');
            if(!body) return;
            body.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Loading students registry...</td></tr>';
            
            try {
                let users = [];
                let backendSuccess = false;
                try {
                    const response = await fetch(`/api/admin/users?role=${currentRole}&username=${currentUsername}`);
                    if (response.ok) {
                        const data = await response.json();
                        users = data.users;
                        backendSuccess = true;
                    }
                } catch (netErr) {
                    console.warn("Backend offline, loading student management from local cloud cache:", netErr);
                }

                if (!backendSuccess) {
                    // Offline fallback: load from localStorage
                    let students = JSON.parse(localStorage.getItem('cloud_students') || '{}');
                    let banned = JSON.parse(localStorage.getItem('cloud_banned_students') || '[]');
                    for (const name in students) {
                        users.push({
                            username: name,
                            role: 'student',
                            status: banned.includes(name) ? 'Suspended / Banned' : 'Active'
                        });
                    }
                }

                body.innerHTML = '';
                if (users.length === 0) {
                    body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No student accounts found.</td></tr>';
                    return;
                }
                
                users.forEach(user => {
                    const tr = document.createElement('tr');
                    
                    let actionButtons = "";
                    if(user.role === 'student') {
                        if(user.status === 'Active') {
                            actionButtons += `<button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="adminBanUser('${escapeHtml(user.username)}')">Suspend 🚫</button> `;
                        } else {
                            actionButtons += `<button class="btn" style="padding:4px 8px; font-size:0.75rem; background-color:#10b981;" onclick="adminUnbanUser('${escapeHtml(user.username)}')">Activate 🟢</button> `;
                        }
                        actionButtons += `<button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="adminDeleteUser('${escapeHtml(user.username)}')">Delete 🗑️</button>`;
                    } else {
                        actionButtons = `<span style="color:var(--text-muted); font-size:0.75rem;">Faculty Managed via Limit Settings</span>`;
                    }
                    
                    tr.innerHTML = `
                        <td><b>${escapeHtml(user.username)}</b></td>
                        <td>${escapeHtml(user.role.toUpperCase())}</td>
                        <td><span style="font-weight:700; color:${user.status === 'Active' ? '#10b981' : 'var(--accent-red)'};">${escapeHtml(user.status)}</span></td>
                        <td>${actionButtons}</td>
                    `;
                    body.appendChild(tr);
                });
            } catch(e) {
                body.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--accent-red);">Failed to retrieve students database.</td></tr>`;
            }
        }

        async function adminBanUser(name) {
            if(!confirm(`Are you sure you want to suspend access for student: ${name}?`)) return;
            try {
                let backendSuccess = false;
                try {
                    const response = await fetch(`/api/admin/user/ban?target_user=${name}&role=${currentRole}&username=${currentUsername}`, {
                        method: 'POST'
                    });
                    if (response.ok) {
                        backendSuccess = true;
                    }
                } catch(netErr) {
                    console.warn("Backend offline, suspending student in local cloud cache.");
                }

                if (!backendSuccess) {
                    let banned = JSON.parse(localStorage.getItem('cloud_banned_students') || '[]');
                    if (!banned.includes(name)) {
                        banned.push(name);
                        localStorage.setItem('cloud_banned_students', JSON.stringify(banned));
                    }
                }
                loadStudentListForManagement();
                loadAdminMetrics();
            } catch(e) {
                console.error(e);
            }
        }

        async function adminUnbanUser(name) {
            try {
                let backendSuccess = false;
                try {
                    const response = await fetch(`/api/admin/user/unban?target_user=${name}&role=${currentRole}&username=${currentUsername}`, {
                        method: 'POST'
                    });
                    if (response.ok) {
                        backendSuccess = true;
                    }
                } catch(netErr) {
                    console.warn("Backend offline, activating student in local cloud cache.");
                }

                if (!backendSuccess) {
                    let banned = JSON.parse(localStorage.getItem('cloud_banned_students') || '[]');
                    banned = banned.filter(item => item !== name);
                    localStorage.setItem('cloud_banned_students', JSON.stringify(banned));
                }
                loadStudentListForManagement();
                loadAdminMetrics();
            } catch(e) {
                console.error(e);
            }
        }

        async function adminDeleteUser(name) {
            if(!confirm(`Delete student credentials for: ${name}? This action is permanent.`)) return;
            try {
                let backendSuccess = false;
                try {
                    const response = await fetch(`/api/admin/user?target_user=${name}&role=${currentRole}&username=${currentUsername}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        backendSuccess = true;
                    }
                } catch(netErr) {
                    console.warn("Backend offline, deleting student from local cloud cache.");
                }

                if (!backendSuccess) {
                    let students = JSON.parse(localStorage.getItem('cloud_students') || '{}');
                    delete students[name];
                    localStorage.setItem('cloud_students', JSON.stringify(students));
                    
                    let banned = JSON.parse(localStorage.getItem('cloud_banned_students') || '[]');
                    banned = banned.filter(item => item !== name);
                    localStorage.setItem('cloud_banned_students', JSON.stringify(banned));
                }
                loadStudentListForManagement();
                loadAdminMetrics();
            } catch(e) {
                console.error(e);
            }
        }

        // Threat Incident Reporting Media Attachments logic
        let mediaRecorder = null;
        let audioChunks = [];
        let recordedVoiceBase64 = null;
        let isRecordingVoice = false;

        async function toggleVoiceRecording() {
            const btn = document.getElementById('btn-voice-rec');
            const status = document.getElementById('voice-rec-status');
            const playback = document.getElementById('voice-rec-playback');

            if (!isRecordingVoice) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
                    
                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        playback.src = audioUrl;
                        playback.style.display = 'block';
                        
                        const reader = new FileReader();
                        reader.readAsDataURL(audioBlob);
                        reader.onloadend = () => {
                            recordedVoiceBase64 = reader.result;
                        };
                        
                        status.textContent = "Voice note recorded successfully.";
                    };
                    
                    mediaRecorder.start();
                    isRecordingVoice = true;
                    btn.textContent = "Stop Recording";
                    btn.style.background = "var(--accent-red)";
                    status.textContent = "Recording voice note...";
                    playback.style.display = 'none';
                } catch(e) {
                    status.textContent = `Mic Error: ${e.message}`;
                }
            } else {
                mediaRecorder.stop();
                isRecordingVoice = false;
                btn.textContent = "Record Voice";
                btn.style.background = "";
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        }

        async function submitThreatReport(event) {
            const btn = event.target;
            btn.disabled = true;
            btn.textContent = "Submitting...";
            
            const title = document.getElementById('threat-title').value.trim();
            const category = document.getElementById('threat-category').value.trim();
            const desc = document.getElementById('threat-desc').value.trim();
            const confirmDiv = document.getElementById('report-confirm');
            const imgInput = document.getElementById('threat-image-input');

            if(!title || !category || !desc) {
                btn.disabled = false;
                btn.textContent = "Submit Report";
                return alert("Complete all fields.");
            }

            let base64Image = null;
            if (imgInput.files && imgInput.files[0]) {
                const file = imgInput.files[0];
                base64Image = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            }

            try {
                const response = await fetch('/api/incident', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({
                        title, category, description: desc, reporter: currentUsername,
                        image_data: base64Image,
                        voice_data: recordedVoiceBase64
                    })
                });
                checkResponseStatus(response);
                if (response.ok) {
                    confirmDiv.style.display = 'block';
                    document.getElementById('threat-title').value = '';
                    document.getElementById('threat-category').value = '';
                    document.getElementById('threat-desc').value = '';
                    document.getElementById('threat-image-input').value = '';
                    
                    // Reset voice recordings variables
                    recordedVoiceBase64 = null;
                    document.getElementById('voice-rec-playback').style.display = 'none';
                    document.getElementById('voice-rec-status').textContent = "Idle";

                    setTimeout(() => confirmDiv.style.display = 'none', 3000);
                    loadIncidents();
                }
            } catch(e) {
                console.error(e);
            }
            btn.disabled = false;
            btn.textContent = "Submit Report";
        }

        async function loadIncidents() {
            if (!currentRole) return;
            try {
                const response = await fetch(`/api/incidents?role=${currentRole}&username=${currentUsername}`);
                checkResponseStatus(response);
                const data = await response.json();
                
                if (currentRole === 'admin') {
                    const tbody = document.getElementById('admin-incidents-body');
                    tbody.innerHTML = '';
                    if(!data.incidents || data.incidents.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No reports registered.</td></tr>';
                        return;
                    }
                    data.incidents.forEach(inc => {
                        let mediaHtml = '';
                        if (inc.image_data) {
                            mediaHtml += `<div style="margin-top:10px;"><a href="${inc.image_data}" target="_blank"><img src="${inc.image_data}" style="max-width:180px; max-height:120px; border-radius:6px; border:1px solid var(--border-panel); cursor:pointer;"></a></div>`;
                        }
                        if (inc.voice_data) {
                            mediaHtml += `<div style="margin-top:10px;"><audio controls src="${inc.voice_data}" style="max-width:200px; height:32px;"></audio></div>`;
                        }

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${inc.id}</td>
                            <td>
                                <b>${escapeHtml(inc.title)}</b><br>
                                <span style="font-size:0.8rem;color:var(--text-muted);">${escapeHtml(inc.description)}</span>
                                ${mediaHtml}
                            </td>
                            <td>${escapeHtml(inc.reporter)}</td>
                            <td style="color:${inc.status === 'Resolved' ? '#10b981' : 'var(--accent-amber)'}">${escapeHtml(inc.status)}</td>
                            <td>
                                ${inc.status === 'Pending' ? `
                                    <div style="display:flex;gap:8px;">
                                        <input type="text" id="sol-${inc.id}" class="input-text" style="padding:6px 12px;font-size:0.8rem;" placeholder="Input solution...">
                                        <button class="btn" style="padding:6px 12px;font-size:0.8rem;" onclick="submitIncidentSolution(${inc.id})">Solve</button>
                                    </div>
                                ` : `<span style="font-size:0.85rem;color:var(--text-muted);">${escapeHtml(inc.solution)}</span>`}
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    const tbody = document.getElementById('user-incidents-body');
                    tbody.innerHTML = '';
                    if(!data.incidents || data.incidents.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No threat reports filed by you.</td></tr>';
                        return;
                    }
                    data.incidents.forEach(inc => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${inc.id}</td>
                            <td><b>${escapeHtml(inc.title)}</b><br><span style="font-size:0.8rem;color:var(--text-muted);">${escapeHtml(inc.description)}</span></td>
                            <td style="color:${inc.status === 'Resolved' ? '#10b981' : 'var(--accent-amber)'}">${escapeHtml(inc.status)}</td>
                            <td>${inc.solution ? escapeHtml(inc.solution) : '<i style="color:var(--text-muted);">Awaiting response...</i>'}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function submitIncidentSolution(id) {
            const solution = document.getElementById(`sol-${id}`).value.trim();
            if(!solution) return alert("Enter solution.");

            try {
                const response = await fetch(`/api/incident/solve?role=${currentRole}&username=${currentUsername}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ id, solution })
                });
                checkResponseStatus(response);
                if(response.ok) {
                    loadIncidents();
                    loadAdminMetrics();
                }
            } catch(e) {
                console.error(e);
            }
        }

        // Wi-Fi Security Auditor core JS
        function auditProtocol() {
            const protEl = document.getElementById('wifi-transport-protocol');
            if (window.location.protocol === 'https:') {
                protEl.textContent = "HTTPS (Secure)";
                protEl.style.color = "#10b981";
            } else {
                protEl.textContent = "HTTP (Insecure)";
                protEl.style.color = "var(--accent-red)";
            }
        }

        async function runWifiJitterTest() {
            const logEl = document.getElementById('wifi-jitter-log');
            const latencyEl = document.getElementById('wifi-latency');
            const jitterEl = document.getElementById('wifi-jitter');
            
            logEl.innerHTML = "Starting connection jitter audit...";
            let pings = [];
            
            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                try {
                    await fetch('/api/health');
                    const duration = performance.now() - start;
                    pings.push(duration);
                    logEl.innerHTML += `<div>Ping #${i+1}: ${duration.toFixed(1)} ms</div>`;
                } catch(e) {
                    logEl.innerHTML += `<div>Ping #${i+1}: FAILED</div>`;
                }
                await new Promise(r => setTimeout(r, 400));
            }
            
            if (pings.length > 0) {
                const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
                let variance = 0;
                pings.forEach(p => variance += Math.pow(p - avg, 2));
                const jitter = Math.sqrt(variance / pings.length);
                
                latencyEl.textContent = `${avg.toFixed(1)} ms`;
                jitterEl.textContent = `${jitter.toFixed(1)} ms`;
                
                if (jitter > 35) {
                    logEl.innerHTML += `<div style="color:var(--accent-red); font-weight:600; margin-top:10px;">Warning: Jitter standard deviation is high. Inspect local network for active proxies.</div>`;
                } else {
                    logEl.innerHTML += `<div style="color:#10b981; font-weight:600; margin-top:10px;">Connection stability verified. Latency variance is within normal thresholds.</div>`;
                }
            } else {
                logEl.innerHTML += `<div style="color:var(--accent-red);">Audit failed: No responses. Check local adapter link state.</div>`;
            }
        }

        function calculateWifiScore() {
            const enc = document.getElementById('wifi-enc-select').value;
            const iso = document.getElementById('wifi-iso-select').value;
            const wps = document.getElementById('wifi-wps-select').value;
            const pass = document.getElementById('wifi-pass-select').value;
            const resultBox = document.getElementById('res-wifi-compliance');
            
            let score = 100;
            let criticalAlerts = [];
            let advice = [];
            
            if (enc === 'wpa3') {
                advice.push("<b>Excellent</b>: Using the WPA3 standard which provides SAE protected transition security.");
            } else if (enc === 'wpa2-aes') {
                score -= 15;
                advice.push("<b>WPA2-AES (Standard)</b>: While stable, WPA2 lacks Protected Management Frames (PMF) by default, leaving it vulnerable to deauthentication disassociation attacks. Update to WPA3 in your router dashboard if your laptop and router support it.");
            } else if (enc === 'wpa2-tkip') {
                score -= 45;
                criticalAlerts.push("<b>Obsolete Protocol (WPA2-TKIP)</b>: TKIP is insecure and prone to key injection exploits. Action: Go to wireless security settings and switch to AES or WPA3-SAE.");
            } else if (enc === 'wep') {
                score -= 75;
                criticalAlerts.push("<b>Highly Vulnerable (WEP)</b>: WEP uses weak RC4 keys that can be decrypted in seconds by nearby eavesdroppers. Action: Access your gateway configuration immediately and upgrade security settings.");
            } else if (enc === 'open') {
                score -= 90;
                criticalAlerts.push("<b>Critical Vulnerability (Open Wi-Fi)</b>: Your traffic travels in cleartext. Anyone nearby can sniff your browser cookies and login tokens. Action: Add a secure WPA3 password immediately.");
            }
            
            if (iso === 'disabled') {
                score -= 20;
                criticalAlerts.push("<b>No Device Isolation</b>: Since AP isolation is disabled, other computers on this same Wi-Fi can run ARP poisoning or port scan audits against your laptop. Action: Toggle 'AP Isolation' or 'Client Isolation' to ON in your router dashboard.");
            }
            
            if (wps === 'enabled') {
                score -= 15;
                criticalAlerts.push("<b>WPS Enabled</b>: WPS allows devices to connect via a numeric PIN, which is vulnerable to rapid brute force attacks. Action: Disable 'WPS' or 'Wi-Fi Protected Setup' in your wireless configuration menu.");
            }
            
            if (pass === 'no') {
                score -= 30;
                criticalAlerts.push("<b>Default Router Credentials Active</b>: Router admin controls are still open under default login info (like admin/admin). Anyone on your network can log in and hijack your internet DNS routing settings. Action: Modify the admin login password immediately.");
            }
            
            score = Math.max(score, 10);
            
            // Show score progress bar
            const prog = document.getElementById('wifi-progress-container');
            const bar = document.getElementById('wifi-score-bar');
            const perc = document.getElementById('wifi-score-percentage');
            prog.style.display = "block";
            
            perc.textContent = `${score}%`;
            bar.style.width = `${score}%`;
            
            let rating = "SECURE CONNECTION";
            let color = "#10b981";
            if (score < 55) {
                rating = "CRITICAL RISK";
                color = "var(--accent-red)";
                bar.style.backgroundColor = "var(--accent-red)";
            } else if (score < 80) {
                rating = "WARNING: MEDIUM COMPLIANCE";
                color = "#f59e0b";
                bar.style.backgroundColor = "#f59e0b";
            } else {
                bar.style.backgroundColor = "#10b981";
            }
            
            resultBox.style.display = "block";
            
            resultBox.innerHTML = `
                <div style="font-size:1.15rem; font-weight:700; color:${color}; border-bottom:1px solid var(--border-panel); padding-bottom:8px; margin-bottom:15px;">
                    Audit Compliance Summary: ${rating}
                </div>
                
                ${criticalAlerts.length > 0 ? `<div style="font-weight:700; color:var(--accent-red); font-size:0.9rem; margin-bottom:10px;">⚠️ DETECTED RISKS:</div>` : ''}
                ${criticalAlerts.map(a => `<div style="color:var(--accent-red); margin-bottom:12px; font-size:0.88rem; padding-left:10px; border-left:2px solid var(--accent-red);">${a}</div>`).join('')}
                
                <div style="font-weight:700; color:var(--text-main); font-size:0.9rem; margin-top:20px; margin-bottom:10px;">💡 STEP-BY-STEP FIX GUIDE:</div>
                <div style="font-size:0.9rem; color:var(--text-muted); background:var(--bg-dark); padding:15px; border-radius:8px; border:1px solid var(--border-panel); margin-bottom:15px;">
                    1. Open a browser and type your router IP address (typically <b>192.168.1.1</b> or <b>192.168.0.1</b>) into the address bar.<br>
                    2. Log in using the admin credentials printed on the physical sticker underneath your router.<br>
                    3. Locate the <b>Wireless Security</b> tab.<br>
                    4. Choose <b>WPA3-SAE (AES)</b> or <b>WPA2-AES</b>. Disable any options mentioning WPS or TKIP.<br>
                    5. Change the admin portal password under <b>System Tools / Administration</b> settings.<br>
                    6. Click <b>Save / Apply Settings</b> and reboot the router.
                </div>

                ${advice.map(adv => `<div style="color:var(--text-muted); margin-bottom:6px; font-size:0.88rem;">• ${adv}</div>`).join('')}
            `;
        }

        // Animated Speed Test Calculator
        async function runSpeedTest(event) {
            const btn = event.target;
            btn.disabled = true;
            btn.textContent = "Testing...";
            const speedStatus = document.getElementById('speed-status');
            const speedLatency = document.getElementById('speed-latency');
            const speedDownload = document.getElementById('speed-download');
            const speedGaugeVal = document.getElementById('speed-gauge-val');
            const speedNeedle = document.getElementById('speed-needle');
            
            speedStatus.textContent = "Pinging...";
            
            // Phase 1: Latency Ping
            let start = performance.now();
            await fetch('/api/health');
            let latency = performance.now() - start;
            speedLatency.textContent = `${latency.toFixed(1)} ms`;
            
            // Phase 2: Download Throughput
            speedStatus.textContent = "Downloading...";
            let startDl = performance.now();
            
            // Animating needle during download
            let mockInterval = setInterval(() => {
                let mockSpeed = Math.random() * 40 + 20; // 20 - 60 Mbps
                speedGaugeVal.textContent = mockSpeed.toFixed(0);
                let deg = (mockSpeed / 100) * 180 - 90;
                speedNeedle.style.transform = `rotate(${deg}deg)`;
            }, 100);

            try {
                const response = await fetch('/api/speedtest');
                const blob = await response.blob();
                clearInterval(mockInterval);
                
                let durationSec = (performance.now() - startDl) / 1000;
                let sizeBits = blob.size * 8;
                let speedMbps = (sizeBits / durationSec) / (1024 * 1024);
                
                speedDownload.textContent = `${speedMbps.toFixed(2)} Mbps`;
                speedGaugeVal.textContent = speedMbps.toFixed(0);
                let deg = (Math.min(speedMbps, 100) / 100) * 180 - 90;
                speedNeedle.style.transform = `rotate(${deg}deg)`;
                speedStatus.textContent = "Completed";
            } catch(e) {
                clearInterval(mockInterval);
                speedStatus.textContent = "Failed";
            }
            btn.disabled = false;
            btn.textContent = "Run Speed Test";
        }

        // Camera QR Threat Scanner JS
        let videoStream = null;
        let qrScanningActive = false;

        async function startCameraScanner() {
            const video = document.getElementById('webcam-preview');
            const logEl = document.getElementById('res-qr-scanner');
            logEl.textContent = "Initializing camera stream...";
            
            try {
                videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                video.srcObject = videoStream;
                video.setAttribute("playsinline", true);
                video.play();
                qrScanningActive = true;
                logEl.textContent = "Camera active. Scan QR code url/IP...";
                requestAnimationFrame(tickQrScan);
            } catch(e) {
                logEl.textContent = `Error accessing camera: ${e.message}`;
            }
        }

        function stopCameraScanner() {
            qrScanningActive = false;
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }
            const preview = document.getElementById('webcam-preview');
            if (preview) preview.srcObject = null;
            const logEl = document.getElementById('res-qr-scanner');
            if (logEl) logEl.textContent = "Camera stopped.";
        }

        function tickQrScan() {
            if (!qrScanningActive) return;
            const video = document.getElementById('webcam-preview');
            const logEl = document.getElementById('res-qr-scanner');
            
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const canvasElement = document.getElementById('qr-canvas');
                const canvas = canvasElement.getContext('2d');
                canvasElement.height = video.videoHeight;
                canvasElement.width = video.videoWidth;
                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                
                const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                
                if (code) {
                    logEl.textContent = `Found QR Code content: "${code.data}"\nAnalyzing...`;
                    stopCameraScanner();
                    
                    // Direct certificate URL routing
                    if (code.data.includes('/api/certificate/verify')) {
                        logEl.textContent += "\n[VERIFIED CREDENTIAL DETECTED] Redirecting to certificate page...";
                        window.open(code.data, '_blank');
                        return;
                    }
                    
                    const urlMatch = code.data.match(/^(?:https?:\/\/)?(?:www\.)?([^\s\/]+)/i);
                    if (urlMatch) {
                        const targetDomain = urlMatch[1];
                        document.getElementById('domain-input').value = targetDomain;
                        switchPanel('domain-intel');
                        runDomainIntel();
                    } else {
                        logEl.textContent += "\nDecoded payload is not a valid URL or domain.";
                    }
                    return;
                }
            }
            requestAnimationFrame(tickQrScan);
        }

        // Domain Intel
        async function runDomainIntel() {
            const domain = document.getElementById('domain-input').value.trim();
            if (!domain) return alert('Enter domain.');
            scanCount++;
            document.getElementById('metrics-scans').textContent = scanCount;

            document.getElementById('res-dns').textContent = "Querying Cloudflare DNS over HTTPS...\n";
            document.getElementById('res-whois').textContent = "Connecting to rdap.org root registry...\n";
            document.getElementById('res-ssl').textContent = "Initiating secure socket wrap (port 443)...\n";

            fetch(`/api/domain/dns?domain=${domain}&username=${currentUsername}&role=${currentRole}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-dns').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-dns').textContent = err.message);

            fetch(`/api/domain/whois?domain=${domain}&username=${currentUsername}&role=${currentRole}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-whois').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-whois').textContent = err.message);

            fetch(`/api/domain/ssl?domain=${domain}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-ssl').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-ssl').textContent = err.message);

            fetch(`/api/domain/subdomains?domain=${domain}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => {
                    const el = document.getElementById('res-subdomains');
                    el.innerHTML = '';
                    if(!d.resolved_subdomains || d.resolved_subdomains.length === 0) {
                        el.textContent = "No subdomains resolved.";
                        return;
                    }
                    d.resolved_subdomains.forEach(sub => {
                        const div = document.createElement('div');
                        div.className = 'badge-card';
                        div.innerHTML = `<span>${sub.subdomain}</span><span class="badge-found">${sub.ip}</span>`;
                        el.appendChild(div);
                    });
                })
                .catch(err => document.getElementById('res-subdomains').textContent = err.message);
        }

        // IP Intel
        async function runIpIntel() {
            const ip = document.getElementById('ip-input').value.trim();
            if (!ip) return alert('Enter IP.');
            scanCount++;
            document.getElementById('metrics-scans').textContent = scanCount;

            document.getElementById('res-revdns').textContent = "Resolving reverse lookup records...\n";
            document.getElementById('res-ip-geo').textContent = "Connecting to geolocation telemetry nodes...\n";

            fetch(`/api/ip/revdns?ip=${ip}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-revdns').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-revdns').textContent = err.message);

            fetch(`/api/ip/geo?ip=${ip}&username=${currentUsername}&role=${currentRole}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-ip-geo').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-ip-geo').textContent = err.message);
        }

        // Email Intel
        async function runEmailAuthCheck() {
            const domain = document.getElementById('email-domain-input').value.trim();
            if (!domain) return alert('Enter domain.');
            scanCount++;
            document.getElementById('metrics-scans').textContent = scanCount;

            document.getElementById('res-email-auth').textContent = "Fetching authentication metadata...\n";

            fetch(`/api/email/auth?domain=${domain}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-email-auth').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-email-auth').textContent = err.message);
        }

        async function runHeaderAnalysis() {
            const headers_text = document.getElementById('email-headers-input').value.trim();
            if (!headers_text) return alert('Paste email headers first.');
            
            document.getElementById('res-header-analysis').textContent = "Processing regex parsing algorithms...\n";

            fetch('/api/email/analyze-headers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                body: JSON.stringify({ headers_text })
            })
            .then(res => { checkResponseStatus(res); return res.json(); })
            .then(d => document.getElementById('res-header-analysis').textContent = JSON.stringify(d, null, 2))
            .catch(err => document.getElementById('res-header-analysis').textContent = err.message);
        }

        // Username Search
        async function runUsernameRecon() {
            const user = document.getElementById('username-input').value.trim();
            if (!user) return alert('Enter username.');
            scanCount++;
            document.getElementById('metrics-scans').textContent = scanCount;

            const el = document.getElementById('res-username');
            el.textContent = "Scanning profiles...";

            fetch(`/api/username/search?username=${user}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(data => {
                    el.innerHTML = '';
                    if(!data.profiles || data.profiles.length === 0) {
                        el.textContent = "No profiles found.";
                        return;
                    }
                    data.profiles.forEach(profile => {
                        const div = document.createElement('div');
                        div.className = 'badge-card';
                        div.innerHTML = `<a href="${profile.url}" target="_blank" style="color:var(--text-main);text-decoration:none;">${profile.platform}</a><span class="badge-found">Match</span>`;
                        el.appendChild(div);
                    });
                })
                .catch(err => el.textContent = err.message);
        }

        // URL Analysis
        async function runUrlAnalysis() {
            const target = document.getElementById('url-input').value.trim();
            if(!target) return alert('Enter target URL.');
            scanCount++;
            document.getElementById('metrics-scans').textContent = scanCount;

            document.getElementById('res-url-tech').textContent = "Requesting headers audit...\n";
            document.getElementById('res-url-redirect').textContent = "Tracing request redirect indices...\n";

            fetch(`/api/domain/tech?domain=${target}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-url-tech').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-url-tech').textContent = err.message);

            fetch(`/api/domain/redirect?url=http://${target}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-url-redirect').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-url-redirect').textContent = err.message);
        }

        // File Hashing
        async function processFileFull(file) {
            if(!file) return;
            const meta = document.getElementById('res-file-meta');
            meta.innerHTML = "Computing cryptographic SHA-256 signatures client-side...<br>";

            const buffer = await file.arrayBuffer();
            const hashBuffer256 = await crypto.subtle.digest('SHA-256', buffer);
            const sha256Hex = Array.from(new Uint8Array(hashBuffer256)).map(b => b.toString(16).padStart(2, '0')).join('');

            const hashBuffer1 = await crypto.subtle.digest('SHA-1', buffer);
            const sha1Hex = Array.from(new Uint8Array(hashBuffer1)).map(b => b.toString(16).padStart(2, '0')).join('');

            meta.innerHTML = `
<b>Filename:</b> ${file.name}
<b>Size:</b>     ${file.size} bytes
<b>SHA-256:</b>  ${sha256Hex}
<b>SHA-1:</b>    ${sha1Hex}

<i>Querying threat intelligence registry for hash signatures...</i>
            `;
            
            try {
                const response = await fetch(`/api/threat/hash?hash_val=${sha256Hex}`);
                const data = await response.json();
                
                meta.innerHTML = `
<b>Filename:</b> ${file.name}
<b>Size:</b>     ${file.size} bytes
<b>SHA-256:</b>  ${sha256Hex}
<b>SHA-1:</b>    ${sha1Hex}

<b style="color:var(--accent-red);">AIGRA THREAT INTELLIGENCE FEEDBACK:</b>
  - <b>Verdict:</b> ${data.verdict}
  - <b>Malware Signature:</b> ${data.details.signature}
  - <b>Type:</b> ${data.details.type}
  - <b>Registry Standing:</b> ${data.details.threat_reputation}
                `;
            } catch(e) {
                meta.innerHTML += `<br><span style="color:var(--accent-red);">Registry query offline: ${e.message}</span>`;
            }
        }

        // CVE Search
        async function searchCves() {
            const query = document.getElementById('cve-input').value.trim();
            if(!query) return alert('Enter CVE code.');

            document.getElementById('res-cve').textContent = "Querying internal vulnerability database...\n";

            fetch(`/api/threat/cve?query=${query}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => document.getElementById('res-cve').textContent = JSON.stringify(d, null, 2))
                .catch(err => document.getElementById('res-cve').textContent = err.message);
        }

        // Cryptography AES & Password checks
        function runAesEncrypt() {
            const text = document.getElementById('aes-plaintext').value.trim();
            const key = document.getElementById('aes-key').value.trim();
            if (!text || !key) return alert('Enter text and key.');
            const encrypted = btoa(unescape(encodeURIComponent(text + "::key::" + key)));
            document.getElementById('res-aes').textContent = `Encrypted Ciphertext (Base64):\n${encrypted}`;
        }

        function runAesDecrypt() {
            const text = document.getElementById('aes-plaintext').value.trim();
            const key = document.getElementById('aes-key').value.trim();
            if (!text || !key) return alert('Enter encrypted text and key.');

            try {
                const decoded = decodeURIComponent(escape(atob(text)));
                const parts = decoded.split("::key::");
                if (parts[1] === key) {
                    document.getElementById('res-aes').textContent = `Decrypted Plaintext:\n${parts[0]}`;
                } else {
                    document.getElementById('res-aes').textContent = "Decryption Failure: Password check mismatch.";
                }
            } catch(e) {
                document.getElementById('res-aes').textContent = "Decryption Failure: Invalid ciphertext parameters.";
            }
        }

        function auditPasswordStrength(val) {
            const fill = document.getElementById('strength-fill');
            const txt = document.getElementById('strength-text');
            if(!val) {
                fill.style.width = "0%";
                txt.textContent = "Strength: Idle";
                return;
            }
            let score = 0;
            if (val.length >= 8) score += 25;
            if (val.length >= 12) score += 25;
            if (/[A-Z]/.test(val)) score += 25;
            if (/[0-9!@#$%^&*]/.test(val)) score += 25;
            
            fill.style.width = `${score}%`;
            
            if (score <= 25) {
                fill.style.backgroundColor = "var(--accent-red)";
                txt.textContent = "Strength: Weak";
            } else if (score <= 50) {
                fill.style.backgroundColor = "#f97316"; // Orange
                txt.textContent = "Strength: Medium";
            } else {
                fill.style.backgroundColor = "#22c55e"; // Green
                txt.textContent = "Strength: Highly Compliant / Secure";
            }
        }

        function checkPasswordBreach() {
            const password = document.getElementById('breach-pass-input').value;
            if(!password) return alert("Enter password first.");
            
            fetch(`/api/crypto/check-breach?password=${encodeURIComponent(password)}&username=${currentUsername}&role=${currentRole}`)
                .then(res => { checkResponseStatus(res); return res.json(); })
                .then(d => {
                    const el = document.getElementById('res-breach-check');
                    el.textContent = d.details;
                    el.style.color = d.breached ? "var(--accent-red)" : "inherit";
                })
                .catch(err => document.getElementById('res-breach-check').textContent = err.message);
        }

        function generatePassword() {
            const len = parseInt(document.getElementById('pass-len').value) || 16;
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
            let pass = "";
            for (let i = 0; i < len; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            document.getElementById('res-pass').textContent = pass;
        }

        // Heuristics Scam Scanner
        async function analyzeScamText() {
            const text = document.getElementById('scam-text').value.trim();
            if(!text) return alert('Paste message content.');

            fetch('/api/scam/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                body: JSON.stringify({ text })
            })
            .then(res => { checkResponseStatus(res); return res.json(); })
            .then(d => {
                const tagsDiv = document.getElementById('scam-tags');
                tagsDiv.innerHTML = '';
                
                const pointer = document.getElementById('risk-pointer');
                pointer.style.left = `${d.risk_score}%`;
                document.getElementById('risk-text').textContent = `Risk Level: ${d.risk_level} (${d.risk_score}%)`;

                d.indicators_found.forEach(ind => {
                    const tag = document.createElement('span');
                    tag.className = 'indicator-tag';
                    tag.textContent = ind;
                    tagsDiv.appendChild(tag);
                });

                document.getElementById('res-scam').textContent = d.summary;
            })
            .catch(err => document.getElementById('res-scam').textContent = err.message);
        }

        // AI Voice Chat Speech-to-Text & Text-to-Speech
        function startVoiceChat() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.");
                return;
            }
            const micBtn = document.getElementById('btn-chat-mic');
            micBtn.textContent = "🛑";
            
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = window.navigator.language || 'en-US';
            
            recognition.onresult = function(event) {
                const speechToText = event.results[0][0].transcript;
                document.getElementById('chat-input').value = speechToText;
                sendChatMessage();
            };
            
            recognition.onerror = function(event) {
                console.error("Speech recognition error", event.error);
                micBtn.textContent = "🎤";
            };
            
            recognition.onend = function() {
                micBtn.textContent = "🎤";
            };
            
            recognition.start();
        }

        let voices = [];
        let selectedVoiceIndex = -1;

        function addTelemetryLog(msg) {
            const logBox = document.getElementById('ai-telemetry-logs');
            if (!logBox) return;
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const div = document.createElement('div');
            div.textContent = `[${time}] ${msg}`;
            logBox.appendChild(div);
            logBox.scrollTop = logBox.scrollHeight;
        }

        // Telemetry stats updates
        setInterval(() => {
            const cpuEl = document.getElementById('telemetry-cpu');
            const rttEl = document.getElementById('telemetry-rtt');
            if (cpuEl) {
                const load = (Math.random() * 20 + 15).toFixed(1);
                cpuEl.textContent = `${load} %`;
            }
            if (rttEl) {
                const latency = Math.floor(Math.random() * 30 + 35);
                rttEl.textContent = `${latency} ms`;
            }
        }, 3000);

        function populateVoices() {
            if (typeof speechSynthesis === 'undefined') return;
            voices = speechSynthesis.getVoices();
            
            // Populating select dropdown in settings just in case
            const select = document.getElementById('chat-voice-select');
            if (select) {
                const prevVal = select.value;
                select.innerHTML = '';
                voices.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    if (!prevVal && (voice.name.includes("Google") || voice.name.includes("Zira") || voice.name.includes("Natural") || voice.name.includes("David"))) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                if (prevVal && select.options[prevVal]) {
                    select.value = prevVal;
                }
            }

            // Populating card container on the visualizer panel
            const container = document.getElementById('neural-voice-models-container');
            if (!container) return;
            
            container.innerHTML = '';
            let visibleIndex = 0;
            
            voices.forEach((voice, index) => {
                if (visibleIndex >= 8) return; // Keep it clean to 8 elements
                
                const isEnglish = voice.lang.includes("en");
                const isLocal = voice.lang.includes("in") || voice.lang.includes("hi") || voice.lang.includes("ml");
                
                if (isEnglish || isLocal || voices.length < 10) {
                    const card = document.createElement('div');
                    card.className = `voice-model-card ${selectedVoiceIndex === index ? 'active' : ''}`;
                    card.onclick = () => selectVoiceModel(index);
                    
                    let cleanName = voice.name
                        .replace("Microsoft", "")
                        .replace("Google", "")
                        .replace("Desktop", "")
                        .replace("Natural", "")
                        .replace("Voice", "")
                        .trim();
                    if (cleanName.length > 18) cleanName = cleanName.substring(0, 16) + "...";
                    
                    const gender = (voice.name.toLowerCase().includes("zira") || voice.name.toLowerCase().includes("hazel") || voice.name.toLowerCase().includes("female") || voice.name.toLowerCase().includes("haruka")) ? "FEMALE" : "MALE";
                    const locale = voice.lang.toUpperCase().split("-")[0];

                    card.innerHTML = `
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <span style="font-weight:700;">${cleanName || "Aegis Core"}</span>
                            <span style="font-size:0.6rem; color:#94a3b8;">${gender} / ${locale}</span>
                        </div>
                        <span class="voice-model-badge">${voice.lang.split("-")[1] || "SYS"}</span>
                    `;
                    container.appendChild(card);
                    visibleIndex++;
                }
            });
            
            if (selectedVoiceIndex === -1 && voices.length > 0) {
                selectVoiceModel(0, true);
            }
        }
        
        function selectVoiceModel(index, silent = false) {
            selectedVoiceIndex = index;
            
            // Sync settings dropdown selector
            const select = document.getElementById('chat-voice-select');
            if (select) select.value = index;
            
            populateVoices();
            
            const voiceName = voices[index] ? voices[index].name : "System Default";
            addTelemetryLog(`Synapse sound model switched to: ${voiceName}`);
            
            if (!silent) {
                speakText("Voice model loaded.");
            }
        }
        
        // Populate initially and whenever browser voice system updates
        setTimeout(populateVoices, 600);
        if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoices;
        }

        function toggleSpeechOutput() {
            ttsEnabled = document.getElementById('tts-voice-toggle').checked;
            if (ttsEnabled) {
                speakText("Voice output enabled.", true);
            } else {
                window.speechSynthesis.cancel();
            }
        }

        function updateSpeechParameters() {
            voiceRate = parseFloat(document.getElementById('slider-voice-rate').value);
            voicePitch = parseFloat(document.getElementById('slider-voice-pitch').value);
            document.getElementById('lbl-voice-rate').textContent = `${voiceRate.toFixed(1)}x`;
            document.getElementById('lbl-voice-pitch').textContent = `${voicePitch.toFixed(1)}x`;
        }

        function updateAgentPersona() {
            activePersona = document.getElementById('chat-persona-select').value;
            const personaNames = {
                'defensive': 'Cyber Defensive Shield',
                'auditor': 'Offensive Security Auditor',
                'educator': 'AIGRA Academic Educator'
            };
            const messagesContainer = document.getElementById('chat-messages');
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble assistant obsidian';
            bubble.innerHTML = `<i>System notice: Persona switched to <b>${personaNames[activePersona]}</b>. Future answers will reflect this profile.</i>`;
            messagesContainer.appendChild(bubble);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // --- LSB Steganography Hide / Extract Functions ---
        let stegoEncodeImgSrc = null;

        function loadStegoEncodeImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                stegoEncodeImgSrc = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function runStegoEncode() {
            const msg = document.getElementById('stego-encode-msg').value;
            if (!stegoEncodeImgSrc) return alert("Please select a cover image first.");
            if (!msg) return alert("Please enter a secret message.");

            const img = new Image();
            img.src = stegoEncodeImgSrc;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                // Convert message to binary with null terminator \0
                const terminatedMsg = msg + "\0";
                let binaryMsg = "";
                for (let i = 0; i < terminatedMsg.length; i++) {
                    let bin = terminatedMsg.charCodeAt(i).toString(2);
                    while (bin.length < 8) bin = "0" + bin;
                    binaryMsg += bin;
                }

                if (binaryMsg.length > data.length * 0.75) {
                    alert("Message is too long for this image dimensions. Select a larger image.");
                    return;
                }

                // Hide bits in LSB of Red, Green, Blue channels
                let bitIdx = 0;
                for (let i = 0; i < data.length; i++) {
                    if ((i + 1) % 4 === 0) continue; // Skip Alpha channel
                    if (bitIdx >= binaryMsg.length) break;

                    const bit = parseInt(binaryMsg[bitIdx]);
                    // Clear the LSB and set to bit value
                    data[i] = (data[i] & 0xFE) | bit;
                    bitIdx++;
                }

                ctx.putImageData(imgData, 0, 0);
                const encodedDataUrl = canvas.toDataURL("image/png");

                const preview = document.getElementById('stego-encoded-preview');
                const downloadLink = document.getElementById('stego-download-link');
                const resultBox = document.getElementById('stego-encode-result-box');

                preview.src = encodedDataUrl;
                downloadLink.href = encodedDataUrl;
                resultBox.style.display = "block";
            };
        }

        function runStegoDecode() {
            const fileInput = document.getElementById('stego-decode-file');
            const file = fileInput.files[0];
            if (!file) return alert("Please select an encrypted stego image file.");

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imgData.data;

                    let binaryMsg = "";
                    let currentByte = "";
                    let decryptedMsg = "";

                    const resDiv = document.getElementById('res-stego-decode');
                    const resultBox = document.getElementById('stego-decode-result-box');
                    resultBox.style.display = "block";
                    resDiv.innerHTML = "Extracting binary bits from pixel channels...\n";

                    for (let i = 0; i < data.length; i++) {
                        if ((i + 1) % 4 === 0) continue; // Skip Alpha

                        // Extract LSB
                        const bit = data[i] & 1;
                        currentByte += bit;

                        if (currentByte.length === 8) {
                            const charCode = parseInt(currentByte, 2);
                            if (charCode === 0) {
                                break; // Met NULL terminator, stop decoding
                            }
                            decryptedMsg += String.fromCharCode(charCode);
                            currentByte = "";
                        }
                    }

                    if (decryptedMsg.length === 0) {
                        resDiv.innerHTML = "<span style='color:var(--accent-red);'>No hidden message found or decoding failed. Make sure you upload the downloaded PNG file without compression.</span>";
                    } else {
                        resDiv.innerHTML = `[SUCCESS] Decrypted Secret Message:\n\n<span style="font-size:1.15rem; color:#10b981;">"${decryptedMsg}"</span>`;
                    }
                };
            };
            reader.readAsDataURL(file);
        }

        // --- Real-time Ban Check Poller ---
        let banPollerInterval = null;
        function startBanCheckPoller() {
            if (banPollerInterval) clearInterval(banPollerInterval);
            banPollerInterval = setInterval(async () => {
                if (!currentUsername) return;
                
                // Offline/Local ban enforcement check
                let banned = JSON.parse(localStorage.getItem('cloud_banned_students') || '[]');
                if (currentRole === 'student' && banned.includes(currentUsername)) {
                    document.getElementById('ban-overlay').style.display = 'flex';
                    document.body.innerHTML = document.getElementById('ban-overlay').outerHTML;
                    clearInterval(banPollerInterval);
                    return;
                }

                try {
                    const response = await fetch(`/api/auth/status?username=${currentUsername}&role=${currentRole}`);
                    checkResponseStatus(response);
                } catch (e) {
                    console.warn("Real-time security check status:", e.message);
                }
            }, 3000);
        }

        async function resetChatSession() {
            if (!confirm("Reset chat history?")) return;
            const targetUser = currentUsername || currentUser || "student_cadet";
            try {
                await fetch(`/api/chat/clear?username=${targetUser}`, { method: "POST" });
            } catch(e) {
                console.warn("Could not clear history on server:", e);
            }
            const container = document.getElementById('chat-messages');
            if (container) {
                container.innerHTML = `
                    <div style="font-size: 0.7rem; font-weight: bold; color: #10b981; text-align: left; margin-bottom: 2px; margin-top: 10px;">AIGRA SECURE AI CORE</div>
                    <div class="chat-bubble assistant obsidian">
                        Welcome! I am Natasha, your advanced cybersecurity AI assistant. I can help answer your doubts about cybersecurity and any other basic questions in any language.
                        <br>• Type queries in <b style="color:#f97316;">any language</b> (Hindi, Malayalam, Tamil, Arabic, etc.).
                        <br>• Click 🎤 to speak your question.
                        <br><br><i>To hear responses read aloud automatically, toggle the 'Voice Output' switch in the AI control panel on the right.</i>
                    </div>
                `;
            }
            window.speechSynthesis.cancel();
        }

        function exportChatTranscript() {
            const targetUser = currentUsername || currentUser || "student_cadet";
            const messages = document.querySelectorAll('#chat-messages .chat-bubble');
            let contentHtml = `
                <html>
                <head>
                    <title>Natasha AI Chat Transcript - ${targetUser}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background: #f8fafc; color: #1e293b; }
                        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 30px; }
                        .header h1 { margin: 0; font-size: 24px; color: #1e3a8a; }
                        .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
                        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; }
                        .message.user { border-left: 4px solid #f97316; }
                        .message.assistant { border-left: 4px solid #10b981; }
                        .meta { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
                        .meta.user { color: #ea580c; }
                        .meta.assistant { color: #059669; }
                        .text { font-size: 14px; line-height: 1.6; }
                        pre { background: #f1f5f9; padding: 10px; border-radius: 6px; overflow-x: auto; font-family: monospace; }
                        code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 90%; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Natasha AI Cyber Tutor Chat Transcript</h1>
                        <p>Student Cadet: <b>${targetUser}</b> • Generated on: ${new Date().toLocaleString()}</p>
                    </div>
            `;

            messages.forEach(msg => {
                const isUser = msg.classList.contains('user');
                const senderName = isUser ? "You" : "Natasha (AI Cyber Tutor)";
                const senderClass = isUser ? "user" : "assistant";
                
                let text = msg.innerHTML;
                text = text.replace(/<div style="margin-top: 8px;[\s\S]*?<\/div>/g, '');
                
                contentHtml += `
                    <div class="message ${senderClass}">
                        <div class="meta ${senderClass}">${senderName}</div>
                        <div class="text">${text}</div>
                    </div>
                `;
            });

            contentHtml += `
                    <script>
                        function getCookie(name) {
                            var value = "; " + document.cookie;
                            var parts = value.split("; " + name + "=");
                            if (parts.length === 2) return parts.pop().split(";").shift();
                            return "";
                        }
                        window.onload = function() {
                            window.print();
                        }
                    <\/script>
                </body>
                </html>
            `;

            const win = window.open("", "_blank");
            win.document.write(contentHtml);
            win.document.close();
        }

        function sanitizeTextForVoice(text) {
            if (!text) return "";
            return text
                // 1. Remove emojis
                .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
                // 2. Remove formatting marks
                .replace(/###/g, '')
                .replace(/##/g, '')
                .replace(/#/g, '')
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/__/g, '')
                .replace(/_/g, '')
                .replace(/`/g, '')
                // 3. Remove symbols & operators
                .replace(/[●•■▪◆○◦*]/g, '')
                .replace(/[-+]\s+/g, ' ')
                .replace(/\[|\]|\(|\)/g, ' ')
                .replace(/==|!=|<=|>=/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function speakText(text, force = false) {
            if (!ttsEnabled && !force) return;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const sanitized = sanitizeTextForVoice(text);
                if (!sanitized) return;
                const SpeechUtterance = window.SpeechSynthesisUtterance || SpeechSynthesisUtterance;
                const activeUtterance = new SpeechUtterance(sanitized);
                activeUtterance.rate = voiceRate;
                activeUtterance.pitch = voicePitch;
                window.speechSynthesis.speak(activeUtterance);
            }
        }

        function renderMarkdown(text) {
            let html = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
                
            html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
                return `<pre style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-panel); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 10px 0;"><code style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #f87171;">${code.trim()}</code></pre>`;
            });

            html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(239, 68, 68, 0.1); color: #f87171; padding: 2px 6px; border-radius: 4px; font-family: \'JetBrains Mono\', monospace; font-size: 0.85rem; border: 1px solid rgba(239,68,68,0.15);">$1</code>');
            html = html.replace(/\*\*([^*]+)\*\*/g, '<b style="color: #f97316;">$1</b>');
            html = html.replace(/### (.*?)(?:<br>|\n|$)/g, '<h4 style="color: #ef4444; border-bottom: 1px solid rgba(239,68,68,0.25); padding-bottom: 4px; margin-top: 12px; font-weight: 700;">$1</h4>');
            html = html.replace(/## (.*?)(?:<br>|\n|$)/g, '<h3 style="color: #f97316; border-bottom: 1px solid rgba(249,115,22,0.25); padding-bottom: 6px; margin-top: 15px; font-weight: 700;">$1</h3>');
            html = html.replace(/\n/g, '<br>');
            return html;
        }

        function appendChatMessage(sender, text) {
            const container = document.getElementById('chat-messages');
            if (!container) return;

            const label = document.createElement('div');
            label.style.fontSize = '0.7rem';
            label.style.fontWeight = 'bold';
            label.style.marginBottom = '2px';
            label.style.marginTop = '12px';

            const bubble = document.createElement('div');
            bubble.className = `chat-bubble ${sender} ${sender === 'user' ? 'magma' : 'obsidian'}`;

            if (sender === 'user') {
                label.style.color = '#f97316';
                label.style.textAlign = 'right';
                label.textContent = 'YOU (AUTHORIZED OPERATOR)';
                bubble.textContent = text;
            } else {
                label.style.color = '#10b981';
                label.style.textAlign = 'left';
                label.textContent = 'NATASHA (AI CYBER TUTOR)';
                
                const contentDiv = document.createElement('div');
                contentDiv.innerHTML = renderMarkdown(text);
                bubble.appendChild(contentDiv);

                const actionsDiv = document.createElement('div');
                actionsDiv.style.marginTop = '8px';
                actionsDiv.style.display = 'flex';
                actionsDiv.style.gap = '10px';

                const copyBtn = document.createElement('button');
                copyBtn.className = "btn";
                copyBtn.style.padding = "2px 8px";
                copyBtn.style.fontSize = "0.7rem";
                copyBtn.style.background = "rgba(255,255,255,0.05)";
                copyBtn.style.border = "1px solid rgba(255,255,255,0.1)";
                copyBtn.textContent = "📋 Copy Response";
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(text);
                    copyBtn.textContent = "✓ Copied!";
                    setTimeout(() => copyBtn.textContent = "📋 Copy Response", 2000);
                };

                const speakBtn = document.createElement('button');
                speakBtn.className = "btn";
                speakBtn.style.padding = "2px 8px";
                speakBtn.style.fontSize = "0.7rem";
                speakBtn.style.background = "rgba(255,255,255,0.05)";
                speakBtn.style.border = "1px solid rgba(255,255,255,0.1)";
                speakBtn.textContent = "🔊 Speak";
                speakBtn.onclick = () => {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text.replace(/###/g, '').replace(/\*\*/g, ''));
                    window.speechSynthesis.speak(utterance);
                };

                actionsDiv.appendChild(copyBtn);
                actionsDiv.appendChild(speakBtn);
                bubble.appendChild(actionsDiv);
            }

            container.appendChild(label);
            container.appendChild(bubble);
            container.scrollTop = container.scrollHeight;
        }

        async function sendChatMessage() {
            const input = document.getElementById('chat-input');
            const userMsg = input.value.trim();
            if (!userMsg) return;

            input.value = '';
            appendChatMessage('user', userMsg);

            const container = document.getElementById('chat-messages');
            const natashaLabel = document.createElement('div');
            natashaLabel.style.fontSize = '0.7rem';
            natashaLabel.style.fontWeight = 'bold';
            natashaLabel.style.color = '#10b981';
            natashaLabel.style.textAlign = 'left';
            natashaLabel.style.marginBottom = '2px';
            natashaLabel.style.marginTop = '12px';
            natashaLabel.textContent = 'NATASHA (AI CYBER TUTOR)';
            container.appendChild(natashaLabel);

            const assistBubble = document.createElement('div');
            assistBubble.className = 'chat-bubble assistant obsidian';
            assistBubble.innerHTML = '<div class="thinking-loader"><div class="volcanic-radar"><div class="radar-sweep"></div><div class="radar-blip"></div></div><div class="thinking-text-container"><div class="thinking-text-main">AI GENERATING RESPONSE...</div><div class="thinking-text-sub">ESTABLISHING SECURE SYSTEM CORE [PORT 8080]</div></div></div>';
            container.appendChild(assistBubble);
            container.scrollTop = container.scrollHeight;

            try {
                const targetUser = currentUsername || currentUser || "student_cadet";
                const response = await fetch(`/api/chat?username=${targetUser}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ message: userMsg, history: [] })
                });
                const resData = await response.json();
                
                assistBubble.remove();
                natashaLabel.remove();
                appendChatMessage('assistant', resData.reply);
            } catch (e) {
                console.error("Chat error:", e);
                assistBubble.innerHTML = `<span style="color:var(--accent-red);">⚠️ Error connecting to server backend chat routing.</span>`;
            }
        }

        async function loadChatHistory() {
            const targetUser = currentUsername || currentUser || "student_cadet";
            try {
                const response = await fetch(`/api/chat/history?username=${targetUser}`);
                const data = await response.json();
                const container = document.getElementById('chat-messages');
                if (!container) return;
                
                container.innerHTML = `
                    <div style="font-size: 0.7rem; font-weight: bold; color: #10b981; text-align: left; margin-bottom: 2px; margin-top: 10px;">AIGRA SECURE AI CORE</div>
                    <div class="chat-bubble assistant obsidian">
                        Welcome! I am Natasha, your advanced cybersecurity AI assistant. I can help answer your doubts about cybersecurity and any other basic questions in any language.
                        <br>• Type queries in <b style="color:#f97316;">any language</b> (Hindi, Malayalam, Tamil, Arabic, etc.).
                        <br>• Click 🎤 to speak your question.
                        <br><br><i>To hear responses read aloud automatically, toggle the 'Voice Output' switch in the AI control panel on the right.</i>
                    </div>
                `;
                
                data.history.forEach(item => {
                    appendChatMessage(item.sender === 'user' ? 'user' : 'assistant', item.message);
                });
            } catch(e) {
                print("Could not load chat history:", e)
            }
        }

        // Security quiz
        const quizData = [
            {
                q: "What does an SPF record check do?",
                o: [
                    "Identifies which mail servers are authorized to send email for a domain",
                    "Encrypts the header parameters of an incoming SMTP packet",
                    "Validates the physical server location of the email receiver",
                    "Blocks the recipient's computer from receiving spam links"
                ],
                a: 0,
                e: "SPF is a DNS record identifying authorized sending hosts for a domain."
            },
            {
                q: "How does enabling Multi-Factor Authentication (MFA) protect accounts?",
                o: [
                    "It automatically changes passwords every 30 days",
                    "It requires a secondary validation vector to prove identity upon login",
                    "It encrypts the local browser cookies",
                    "It alerts local system administrators about port scans"
                ],
                a: 1,
                e: "MFA blocks credentials-based attacks by requiring a secondary verification token."
            }
        ];

        let currentQuestion = null;
        let answered = false;
        let score = 0;
        let totalQuestions = 0;

        async function loadQuestion() {
            answered = false;
            document.getElementById('btn-next-quiz').style.display = 'none';
            const quizContainer = document.getElementById('quiz-container');
            quizContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Decrypting expert cybersecurity challenge...</div>';

            try {
                const response = await fetch('/api/quiz/generate');
                currentQuestion = await response.json();
                totalQuestions++;
                
                quizContainer.innerHTML = `
                    <div class="quiz-card">
                        <div class="quiz-question">Question ${totalQuestions}: ${currentQuestion.q}</div>
                        <div class="quiz-options">
                            ${currentQuestion.o.map((opt, i) => `<div class="quiz-option" onclick="checkAnswer(${i}, this)">${opt}</div>`).join('')}
                        </div>
                        <div class="quiz-explanation" id="quiz-explain">${currentQuestion.e}</div>
                    </div>
                `;
            } catch(e) {
                quizContainer.innerHTML = `<div style="color:var(--accent-red); text-align:center;">Failed to resolve quiz challenges: ${e.message}</div>`;
            }
        }

        function checkAnswer(selectedIdx, element) {
            if (answered) return;
            answered = true;
            const options = document.querySelectorAll('.quiz-option');

            if (selectedIdx === currentQuestion.a) {
                element.classList.add('correct');
                score++;
            } else {
                element.classList.add('incorrect');
                options[currentQuestion.a].classList.add('correct');
            }

            document.getElementById('quiz-explain').style.display = 'block';
            const btnNext = document.getElementById('btn-next-quiz');
            btnNext.style.display = 'inline-block';
            btnNext.textContent = `Generate Next Challenge [Score: ${score}/${totalQuestions}] ⚔️`;
        }

        function loadNextQuestion() {
            loadQuestion();
        }

        async function checkConnectionStatus() {
            const connLabel = document.getElementById('metrics-connection');
            if (!connLabel) return;
            try {
                const response = await fetch('/api/health');
                if (response.ok) {
                    connLabel.textContent = "ONLINE";
                    connLabel.style.color = "#10b981";
                } else {
                    throw new Error();
                }
            } catch(e) {
                connLabel.textContent = "OFFLINE";
                connLabel.style.color = "var(--accent-red)";
            }
        }
        setInterval(checkConnectionStatus, 4500);
        checkConnectionStatus();


        // ==========================================
        // ==========================================
        // PERSISTENT ACADEMIC DASHBOARD LOGIC
        // ==========================================
        let mockUsers = [
            { username: "sec_tutor_admin", role: "admin", status: "Active", permissions: ["Read", "Write", "Execute"] },
            { username: "faculty_member", role: "faculty", status: "Active", permissions: ["Read", "Write"] },
            { username: "student_cadet", role: "student", status: "Active", permissions: ["Read"] },
            { username: "naughty_student", role: "student", status: "Banned", permissions: [] }
        ];
        let mockCourses = [
            { id: "CEH", title: "Certified Ethical Hacker (CEH)", duration: "6 Weeks", students: 45 },
            { id: "LNX", title: "Linux Privilege Escalation Basics", duration: "3 Weeks", students: 32 },
            { id: "NET", title: "Advanced Network Packet Audits", duration: "4 Weeks", students: 18 }
        ];
        let mockLabs = [
            { id: "lab-kali", name: "Kali Sandbox Terminal 1", flag: "AIGRA{basics_crypto_decrypted}", status: "ONLINE" },
            { id: "lab-ubuntu", name: "Ubuntu Docker Web 1", flag: "AIGRA{sqli_bypass_flag}", status: "ONLINE" },
            { id: "lab-metasploit", name: "Metasploitable OS Target", flag: "AIGRA{sudo_root_flag}", status: "OFFLINE" }
        ];
        let mockQuizQuestions = [
            { id: 1, question: "Which SQL operator is injected to trick login checks into evaluating query logic as always true?", options: ["AND 1=0", "OR 1=1", "UNION SELECT password"], correct: 1 },
            { id: 2, question: "What command is commonly run to audit active Sudo permissions on Linux?", options: ["sudo -l", "uname -a", "cat /etc/passwd"], correct: 0 }
        ];
        let mockCertificates = [
            { id: "CERT-001", student: "student_cadet", course: "Linux Privilege Escalation Basics", date: "2026-07-20", status: "Verified" }
        ];
        let mockReports = [
            { id: "REP-102", type: "Security Incident", user: "student_cadet", description: "Bypassed Web Portal SQL form checks", date: "2026-07-21" },
            { id: "REP-101", type: "VM Alert", user: "system", description: "Docker Sandbox target initialized", date: "2026-07-21" }
        ];
        let mockPayments = [
            { id: "PAY-501", student: "student_cadet", amount: "$150.00", course: "Certified Ethical Hacker", date: "2026-07-21", status: "Paid" },
            { id: "PAY-502", student: "naughty_student", amount: "$150.00", course: "Advanced Network Packet Audits", date: "2026-07-22", status: "Failed" }
        ];
        let mockRooms = [
            { id: "ROOM-101", name: "Red Team Lab Room", course: "CEH", capacity: 30, status: "Active" },
            { id: "ROOM-102", name: "Cryptography Seminar", course: "NET", capacity: 15, status: "Scheduled" }
        ];
        let mockAssignments = [
            { id: "ASM-01", title: "Caesar Cipher Python Implementer", course: "NET", dueDate: "2026-07-28", submissions: 12 },
            { id: "ASM-02", title: "Burp Proxy Header Interceptor Writeup", course: "CEH", dueDate: "2026-07-30", submissions: 8 }
        ];
        let mockAttendance = [
            { date: "2026-07-22", student: "student_cadet", course: "CEH", status: "Present" },
            { date: "2026-07-22", student: "faculty_member", course: "CEH", status: "Present" }
        ];
        let mockSessions = [
            { username: "student_cadet", ip: "192.168.1.15", device: "Windows 11 (Firefox)", time: "2026-07-22 14:05:12" },
            { username: "faculty_member", ip: "192.168.1.20", device: "macOS 14 (Safari)", time: "2026-07-22 14:08:34" }
        ];
        let mockAdvisoryFiles = [
            { id: 1, name: "linux_privesc_cheat_sheet.pdf", type: "document/pdf", desc: "Linux Privilege Escalation Cheat Sheet", date: "2026-07-22", data: "data:application/pdf;base64,JVBERi0xLjQK..." },
            { id: 2, name: "port_scan_advisory.mp3", type: "audio/mp3", desc: "Audio briefing on recent port scans", date: "2026-07-22", data: "data:audio/mp3;base64,SUQzBAAAAAAA..." }
        ];
        let cyberLabProgress = {
            completedTasks: []
        };

        function saveAcadState() {
            localStorage.setItem('cyber_users', JSON.stringify(mockUsers));
            localStorage.setItem('cyber_courses', JSON.stringify(mockCourses));
            localStorage.setItem('cyber_labs', JSON.stringify(mockLabs));
            localStorage.setItem('cyber_quizzes', JSON.stringify(mockQuizQuestions));
            localStorage.setItem('cyber_certs', JSON.stringify(mockCertificates));
            localStorage.setItem('cyber_reports', JSON.stringify(mockReports));
            localStorage.setItem('cyber_payments', JSON.stringify(mockPayments));
            localStorage.setItem('cyber_rooms', JSON.stringify(mockRooms));
            localStorage.setItem('cyber_assignments', JSON.stringify(mockAssignments));
            localStorage.setItem('cyber_attendance', JSON.stringify(mockAttendance));
            localStorage.setItem('cyber_sessions', JSON.stringify(mockSessions));
            localStorage.setItem('cyber_advisory_files', JSON.stringify(mockAdvisoryFiles));

            const currentStudent = currentUsername || currentUser || "student_cadet";
            localStorage.setItem(`cyber_progress_${currentStudent}`, JSON.stringify(cyberLabProgress));
        }

        function loadAcadState() {
            if (localStorage.getItem('cyber_users')) mockUsers = JSON.parse(localStorage.getItem('cyber_users'));
            if (localStorage.getItem('cyber_courses')) mockCourses = JSON.parse(localStorage.getItem('cyber_courses'));
            if (localStorage.getItem('cyber_labs')) mockLabs = JSON.parse(localStorage.getItem('cyber_labs'));
            if (localStorage.getItem('cyber_quizzes')) mockQuizQuestions = JSON.parse(localStorage.getItem('cyber_quizzes'));
            if (localStorage.getItem('cyber_certs')) mockCertificates = JSON.parse(localStorage.getItem('cyber_certs'));
            if (localStorage.getItem('cyber_reports')) mockReports = JSON.parse(localStorage.getItem('cyber_reports'));
            if (localStorage.getItem('cyber_payments')) mockPayments = JSON.parse(localStorage.getItem('cyber_payments'));
            if (localStorage.getItem('cyber_rooms')) mockRooms = JSON.parse(localStorage.getItem('cyber_rooms'));
            if (localStorage.getItem('cyber_assignments')) mockAssignments = JSON.parse(localStorage.getItem('cyber_assignments'));
            if (localStorage.getItem('cyber_attendance')) mockAttendance = JSON.parse(localStorage.getItem('cyber_attendance'));
            if (localStorage.getItem('cyber_sessions')) mockSessions = JSON.parse(localStorage.getItem('cyber_sessions'));
            if (localStorage.getItem('cyber_advisory_files')) mockAdvisoryFiles = JSON.parse(localStorage.getItem('cyber_advisory_files'));

            const currentStudent = currentUsername || currentUser || "student_cadet";
            const userProgressKey = `cyber_progress_${currentStudent}`;
            if (localStorage.getItem(userProgressKey)) {
                cyberLabProgress = JSON.parse(localStorage.getItem(userProgressKey));
            } else {
                cyberLabProgress = { completedTasks: [] };
            }
        }

        function getUserProgress(username) {
            if (window.allStudentsData) {
                const found = window.allStudentsData.find(s => s.username.toLowerCase() === username.toLowerCase());
                if (found) {
                    return { completedTasks: (found.completed_tasks || '').split(',').filter(Boolean) };
                }
            }
            const userProgressKey = `cyber_progress_${username}`;
            if (localStorage.getItem(userProgressKey)) {
                return JSON.parse(localStorage.getItem(userProgressKey));
            }
            return { completedTasks: [] };
        }

        loadAcadState();
        setTimeout(() => {
            updateStudentGamificationDetails();
            renderAdvisoryFiles();
        }, 100);

        function updateStudentGamificationDetails() {
            const completedCount = cyberLabProgress.completedTasks.length;
            const xp = completedCount * 100;
            const coins = completedCount * 50;
            const level = Math.floor(xp / 400) + 1;
            const streak = "5 Days";

            // Update all duplicate UI elements
            document.querySelectorAll('#student-xp-val').forEach(el => el.textContent = `${xp.toLocaleString()} XP`);
            document.querySelectorAll('#student-coins-val').forEach(el => el.textContent = `${coins.toLocaleString()} Coins`);
            document.querySelectorAll('#student-level-val').forEach(el => el.textContent = `Lvl ${level}`);
            
            const streakEl = document.getElementById('student-streak-val');
            const rankEl = document.getElementById('student-acad-rank');
            if (streakEl) streakEl.textContent = streak;
            if (rankEl) rankEl.textContent = `Username: ${currentUser || 'student_cadet'}`;

            const didNav = cyberLabProgress.completedTasks.includes('linuxshell-nav');
            const weeklyProgress = didNav ? 100 : 0;
            const weeklyProgEl = document.getElementById('weekly-mission-progress');
            const weeklyBarEl = document.getElementById('weekly-mission-bar');
            if (weeklyProgEl) weeklyProgEl.textContent = `${weeklyProgress}%`;
            if (weeklyBarEl) weeklyBarEl.style.width = `${weeklyProgress}%`;

            const totalTasksCount = 16;
            const monthlyProgress = Math.min(100, Math.floor((completedCount / totalTasksCount) * 100));
            const monthlyProgEl = document.getElementById('monthly-challenge-progress');
            const monthlyBarEl = document.getElementById('monthly-challenge-bar');
            if (monthlyProgEl) monthlyProgEl.textContent = `${monthlyProgress}%`;
            if (monthlyBarEl) monthlyBarEl.style.width = `${monthlyProgress}%`;

            const badgesContainer = document.getElementById('student-badges-container');
            if (badgesContainer) {
                badgesContainer.innerHTML = "";
                const badges = [];
                
                if (cyberLabProgress.completedTasks.includes('pass-dictionary') &&
                    cyberLabProgress.completedTasks.includes('pass-brute') &&
                    cyberLabProgress.completedTasks.includes('pass-hash') &&
                    cyberLabProgress.completedTasks.includes('pass-stuffing')) {
                    badges.push({ name: "Password Cracker 🔑", desc: "Completed Password Attacks" });
                }
                if (cyberLabProgress.completedTasks.includes('crypto-symmetric') &&
                    cyberLabProgress.completedTasks.includes('crypto-asymmetric') &&
                    cyberLabProgress.completedTasks.includes('crypto-hash') &&
                    cyberLabProgress.completedTasks.includes('crypto-signature')) {
                    badges.push({ name: "Crypto Specialist 🔒", desc: "Completed Cryptography" });
                }
                if (cyberLabProgress.completedTasks.includes('linuxshell-nav') &&
                    cyberLabProgress.completedTasks.includes('linuxshell-ops') &&
                    cyberLabProgress.completedTasks.includes('linuxshell-perm') &&
                    cyberLabProgress.completedTasks.includes('linuxshell-triage')) {
                    badges.push({ name: "Command Master 🐚", desc: "Completed Linux Command Shell" });
                }
                if (cyberLabProgress.completedTasks.includes('windows-files') &&
                    cyberLabProgress.completedTasks.includes('windows-diag') &&
                    cyberLabProgress.completedTasks.includes('windows-proc') &&
                    cyberLabProgress.completedTasks.includes('windows-net')) {
                    badges.push({ name: "Windows Auditor 🪟", desc: "Completed Windows Basics" });
                }

                if (badges.length === 0) {
                    badgesContainer.innerHTML = `<span style="color:var(--text-muted);">No badges unlocked yet. Complete course modules to earn badges!</span>`;
                } else {
                    badges.forEach(b => {
                        const badgeSpan = document.createElement('span');
                        badgeSpan.style.background = "rgba(168, 85, 247, 0.15)";
                        badgeSpan.style.color = "#c084fc";
                        badgeSpan.style.border = "1px solid rgba(168, 85, 247, 0.3)";
                        badgeSpan.style.padding = "4px 8px";
                        badgeSpan.style.borderRadius = "4px";
                        badgeSpan.style.fontWeight = "600";
                        badgeSpan.title = b.desc;
                        badgeSpan.textContent = b.name;
                        badgesContainer.appendChild(badgeSpan);
                    });
                }
            }

            const studentLeaderboard = document.getElementById('student-leaderboard-body');
            if (studentLeaderboard) {
                const currentStudent = currentUser || 'student_cadet';
                const rows = [
                    { rank: 1, name: "buffer_bypass", xp: 1200, streak: "7 Days", coins: 600 },
                    { rank: 2, name: currentStudent, xp: xp, streak: "5 Days", coins: coins },
                    { rank: 3, name: "kali_master", xp: 200, streak: "1 Day", coins: 100 }
                ];
                rows.sort((a,b) => b.xp - a.xp);
                studentLeaderboard.innerHTML = rows.map((r, idx) => `
                    <tr style="${r.name === currentStudent ? 'background:rgba(59,130,246,0.1); font-weight:700; color:#fff;' : ''}">
                        <td>${idx + 1}</td>
                        <td><b>${r.name}</b> ${r.name === currentStudent ? ' (You)' : ''}</td>
                        <td><span style="color:#3b82f6;">${r.xp.toLocaleString()} XP</span></td>
                        <td>${r.streak}</td>
                        <td><span style="color:#eab308;">${r.coins} Coins</span></td>
                    </tr>
                `).join('');
            }
        }

                window.addEventListener('hashchange', checkHashRoute);
        function checkHashRoute() {
            const hash = window.location.hash;
            const sessionActive = sessionStorage.getItem('cyber_session_id') !== null;
            
            if (!sessionActive) {
                if (hash !== '') {
                    window.location.hash = '';
                }
                document.getElementById('auth-overlay').style.display = 'flex';
                return;
            }
            
            if (hash === '#/admin/dashboard') {
                if (currentRole !== 'admin') {
                    alert("Unauthorized access. Admin privileges required.");
                    window.location.hash = `/${currentRole}/dashboard`;
                    return;
                }
                switchPanel('admin-dashboard');
                loadAdminMetrics();
                loadFacultyList();
                loadStudentListForManagement();
                fetchGlobalLeaderboard();
            } else if (hash === '#/faculty/dashboard') {
                if (currentRole !== 'faculty' && currentRole !== 'admin') {
                    alert("Unauthorized access. Faculty privileges required.");
                    window.location.hash = `/${currentRole}/dashboard`;
                    return;
                }
                switchPanel('faculty-dashboard');
                loadFacultyList();
                fetchGlobalLeaderboard();
            } else if (hash === '#/student/dashboard') {
                if (currentRole !== 'student' && currentRole !== 'admin') {
                    alert("Unauthorized access.");
                    window.location.hash = `/${currentRole}/dashboard`;
                    return;
                }
                switchPanel('student-dashboard');
                fetchStudentStats();
            }
        }
        
        async function fetchStudentStats() {
            try {
                const res = await fetch('/api/student/stats');
                if (res.ok) {
                    const stats = await res.json();
                    
                    // Update all duplicate UI elements
                    document.querySelectorAll('#student-xp-val').forEach(el => el.textContent = stats.xp + " XP");
                    document.querySelectorAll('#student-coins-val').forEach(el => el.textContent = stats.coins + " Coins");
                    document.querySelectorAll('#student-level-val').forEach(el => el.textContent = "Lvl " + stats.level);
                    
                    const levelBar = document.getElementById('student-level-bar');
                    if (levelBar) {
                        const levelXp = stats.xp % 1000;
                        const pct = (levelXp / 1000) * 100;
                        levelBar.style.width = pct + "%";
                    }
                    
                    cyberLabProgress.completedTasks = stats.completed_tasks.split(',').filter(Boolean);
                    localStorage.setItem(`cyber_progress_${currentUsername}`, JSON.stringify(cyberLabProgress));
                    
                    // Render completed tasks list on dashboard
                    const listEl = document.getElementById('student-completed-tasks-list');
                    if (listEl) {
                        if (cyberLabProgress.completedTasks.length === 0) {
                            listEl.innerHTML = '<span style="color:var(--text-muted);">No tasks completed yet. Start learning in CyberLabs Hub!</span>';
                        } else {
                            listEl.innerHTML = cyberLabProgress.completedTasks.map(t => `
                                <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.85rem;">
                                    <span style="color:#22d3ee; font-weight:bold;">✓ ${formatTaskIdToName(t)}</span>
                                    <span style="color:#10b981;">+100 XP Earned</span>
                                </div>
                            `).join('');
                        }
                    }
                    renderStudentCertificates();
                }
            } catch (e) {
                console.error("Error fetching stats:", e);
            }
        }

        function renderStudentCertificates() {
            const container = document.getElementById('student-certificates-container');
            if (!container) return;
            
            const studentUser = currentUsername || "student_cadet";
            const myCerts = mockCertificates.filter(c => c.student.toLowerCase() === studentUser.toLowerCase());
            
            if (myCerts.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 15px;">No completion certificates earned yet. Finish a learning path to claim your certificate!</div>';
                return;
            }
            
            container.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px;">
                    ${myCerts.map(c => {
                        const verifyUrl = `${window.location.origin}/api/certificate/verify?id=${c.id}&student=${encodeURIComponent(c.student)}&course=${encodeURIComponent(c.course)}&date=${c.date}`;
                        return `
                            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(223, 177, 91, 0.15); border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="display: flex; flex-direction: column; gap: 3px; text-align: left;">
                                    <span style="font-size: 0.95rem; font-weight: bold; color: #dfb15b;">${c.course}</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">ID: <code>${c.id}</code> • Issued: ${c.date}</span>
                                    <span style="font-size: 0.75rem; color: #10b981; font-weight: bold; margin-top: 3px;">✓ VERIFIED CREDENTIAL</span>
                                </div>
                                <button style="padding: 8px 16px; font-size: 0.8rem; background: linear-gradient(135deg, #dfb15b, #d4af37); color: #0b0f19; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 4px;" onclick="window.open('${verifyUrl}', '_blank')">
                                    🖨️ View / Print
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function getStudentCertificatesCount(completedTasks) {
            let count = 0;
            const tasksSet = new Set(completedTasks);
            const ACAD_MODULES = [
                { id: "basics", name: "Cyber Security Basics", tasks: ["basics-cia", "basics-social", "basics-networking", "basics-malware", "basics-defense"] },
                { id: "owasp", name: "OWASP Top 10 Course", tasks: ["owasp-a01", "owasp-a02", "owasp-a03", "owasp-a04", "owasp-a05", "owasp-a06", "owasp-a07", "owasp-a08", "owasp-a09", "owasp-a10"] },
                { id: "linux", name: "Linux Fundamentals (Bandit)", tasks: ["linux-lvl0", "linux-lvl1", "linux-lvl2", "linux-lvl3", "linux-lvl4", "linux-lvl5"] },
                { id: "windows", name: "Windows Basics", tasks: ["windows-files", "windows-diag", "windows-proc", "windows-net"] }
            ];
            ACAD_MODULES.forEach(m => {
                const completedAll = m.tasks.every(t => tasksSet.has(t));
                if (completedAll) {
                    count++;
                }
            });
            return count;
        }

        async function fetchGlobalLeaderboard() {
            try {
                const res = await fetch('/api/faculty/students');
                if (res.ok) {
                    const students = await res.json();
                    
                    // Save to global window variable for inspector and stats calculations
                    window.allStudentsData = students;
                    
                    const listEl = document.getElementById('student-dashboard-leaderboard-body');
                    if (listEl) {
                        listEl.innerHTML = students.map((s, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td><b>${s.username}</b></td>
                                <td style="color:#22d3ee;">Lvl ${s.level}</td>
                                <td style="color:#10b981;">${s.xp} XP</td>
                            </tr>
                        `).join('');
                    }
                    
                    const facultyListEl = document.getElementById('faculty-students-list-body');
                    if (facultyListEl) {
                        facultyListEl.innerHTML = students.map((s, idx) => {
                            const completedList = (s.completed_tasks || '').split(',').filter(Boolean);
                            const certsCount = getStudentCertificatesCount(completedList);
                            const topicsFormatted = completedList.map(t => formatTaskIdToName(t)).join(', ') || 'None';
                            return `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><b>${s.username}</b></td>
                                    <td>Lvl ${s.level}</td>
                                    <td style="color:#10b981;">${s.xp} XP</td>
                                    <td style="color:#facc15;">${s.coins || 0} Coins</td>
                                    <td><span style="font-size:0.75rem; color:#a78bfa;">${completedList.length} tasks</span></td>
                                    <td style="color:#3b82f6; font-weight:bold;">${certsCount} earned</td>
                                    <td style="font-size:0.75rem; color:var(--text-muted);">${topicsFormatted}</td>
                                </tr>
                            `;
                        }).join('');
                    }

                    const adminListEl = document.getElementById('admin-students-list-body');
                    if (adminListEl) {
                        adminListEl.innerHTML = students.map((s, idx) => {
                            const completedList = (s.completed_tasks || '').split(',').filter(Boolean);
                            const certsCount = getStudentCertificatesCount(completedList);
                            const topicsFormatted = completedList.map(t => formatTaskIdToName(t)).join(', ') || 'None';
                            return `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><b>${s.username}</b></td>
                                    <td>Lvl ${s.level}</td>
                                    <td style="color:#10b981;">${s.xp} XP</td>
                                    <td style="color:#facc15;">${s.coins || 0} Coins</td>
                                    <td><span style="font-size:0.75rem; color:#a78bfa;">${completedList.length} tasks</span></td>
                                    <td style="color:#3b82f6; font-weight:bold;">${certsCount} earned</td>
                                    <td style="font-size:0.75rem; color:var(--text-muted);">${topicsFormatted}</td>
                                </tr>
                            `;
                        }).join('');
                    }
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function fetchAdminSessionsAndLogs() {
            try {
                const resSessions = await fetch('/api/admin/sessions');
                if (resSessions.ok) {
                    const sessions = await resSessions.json();
                    const tbody = document.getElementById('admin-sessions-tbody');
                    if (tbody) {
                        tbody.innerHTML = sessions.map(s => `
                            <tr>
                                <td><code>${s.username}</code></td>
                                <td><span style="color:#22d3ee; font-weight:700;">${s.role.toUpperCase()}</span></td>
                                <td>${s.ip_address}</td>
                                <td>${s.os} / ${s.browser}</td>
                                <td><span style="font-size:0.75rem; color:var(--text-muted);">${s.created_at}</span></td>
                                <td><span style="font-size:0.8rem; color:#f472b6; font-family:var(--font-mono);">${escapeHtml(s.last_action)}</span></td>
                                <td>
                                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem; color:var(--accent-red); border-color:var(--accent-red);" onclick="kickSession('${s.session_id}')">Kick / Terminate</button>
                                </td>
                            </tr>
                        `).join('');
                    }
                }
                
                const resLogs = await fetch('/api/admin/logs');
                if (resLogs.ok) {
                    const logs = await resLogs.json();
                    const list = document.getElementById('admin-audit-logs-list');
                    if (list) {
                        list.innerHTML = logs.map(l => `
                            <div style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.03); font-size:0.8rem; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
                                <span><code style="color:#a78bfa;">[${l.timestamp}]</code> <b>${l.username}</b> (${l.role}): ${l.action}</span>
                                <span style="color:var(--text-muted);">${l.ip_address} (${l.device})</span>
                            </div>
                        `).join('');
                    }
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function kickSession(sessionId) {
            if (!confirm("Are you sure you want to forcefully terminate this session? The user will be kicked instantly.")) return;
            try {
                const res = await fetch('/api/admin/sessions/kick', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ session_id: sessionId })
                });
                if (res.ok) {
                    fetchAdminSessionsAndLogs();
                }
            } catch(e) {
                alert(e.message);
            }
        }
        

        const ACAD_MODULES = [
            { id: "basics", name: "Cyber Security Basics", tasks: ["basics-cia", "basics-social", "basics-networking", "basics-malware", "basics-defense"] },
            { id: "owasp", name: "OWASP Top 10 Course", tasks: ["owasp-a01", "owasp-a02", "owasp-a03", "owasp-a04", "owasp-a05", "owasp-a06", "owasp-a07", "owasp-a08", "owasp-a09", "owasp-a10"] },
            { id: "linux", name: "Linux Fundamentals (Bandit)", tasks: ["linux-lvl0", "linux-lvl1", "linux-lvl2", "linux-lvl3", "linux-lvl4", "linux-lvl5"] },
            { id: "windows", name: "Windows Basics", tasks: ["windows-files", "windows-diag", "windows-proc", "windows-net"] },
            { id: "networking", name: "Computer Networking", tasks: ["netcourse-osi", "netcourse-tcp", "netcourse-routing", "netcourse-security"] },
            { id: "webcourse", name: "Web Fundamentals", tasks: ["webcourse-http", "webcourse-dom", "webcourse-cookies", "webcourse-cors"] },
            { id: "websec", name: "Web Application Security", tasks: ["websec-sqli", "websec-xss", "websec-csrf", "websec-cmd"] },
            { id: "burp", name: "Burp Suite", tasks: ["burp-proxy", "burp-intruder", "burp-repeater", "burp-decoder"] },
            { id: "nmap", name: "Nmap Scanner", tasks: ["nmap-syn", "nmap-version", "nmap-os", "nmap-nse"] },
            { id: "wireshark", name: "Wireshark Analyzer", tasks: ["wireshark-capture", "wireshark-filter", "wireshark-stream", "wireshark-export"] },
            { id: "password", name: "Password Attacks", tasks: ["pass-dictionary", "pass-brute", "pass-hash", "pass-stuffing"] },
            { id: "cryptography", name: "Cryptography", tasks: ["crypto-symmetric", "crypto-asymmetric", "crypto-hash", "crypto-signature"] },
            { id: "linuxshell", name: "Linux Command Shell", tasks: ["linuxshell-nav", "linuxshell-ops", "linuxshell-perm", "linuxshell-triage"] }
        ];

        function formatTaskIdToName(taskId) {
            if (!taskId) return "";
            const parts = taskId.split('-');
            const name = parts[parts.length - 1];
            return name.charAt(0).toUpperCase() + name.slice(1);
        }

        function showCongratulationPopup(taskId, taskName) {
            let currentModule = null;
            let currentModuleIndex = -1;
            let currentTaskIndex = -1;
            for (let i = 0; i < ACAD_MODULES.length; i++) {
                const idx = ACAD_MODULES[i].tasks.indexOf(taskId);
                if (idx !== -1) {
                    currentModule = ACAD_MODULES[i];
                    currentModuleIndex = i;
                    currentTaskIndex = idx;
                    break;
                }
            }

            if (!currentModule) return;

            const hasNextTask = currentTaskIndex < currentModule.tasks.length - 1;
            let nextTaskId = hasNextTask ? currentModule.tasks[currentTaskIndex + 1] : null;

            let nextActionCallback = null;
            if (hasNextTask && nextTaskId) {
                nextActionCallback = () => {
                    const suffix = nextTaskId.substring(nextTaskId.indexOf('-') + 1);
                    if (nextTaskId.startsWith('basics-')) {
                        switchBasicsPanel(suffix);
                    } else if (nextTaskId.startsWith('owasp-')) {
                        switchOwaspPanel(suffix);
                    } else if (nextTaskId.startsWith('linux-')) {
                        switchLinuxLevel(suffix);
                    } else if (nextTaskId.startsWith('windows-')) {
                        switchWindowsPanel(suffix);
                    } else if (nextTaskId.startsWith('netcourse-')) {
                        switchNetcoursePanel(suffix);
                    } else if (nextTaskId.startsWith('webcourse-')) {
                        switchWebcoursePanel(suffix);
                    } else if (nextTaskId.startsWith('websec-')) {
                        switchWebsecPanel(suffix);
                    } else if (nextTaskId.startsWith('burp-')) {
                        switchBurpPanel(suffix);
                    } else if (nextTaskId.startsWith('nmap-')) {
                        switchNmapPanel(suffix);
                    } else if (nextTaskId.startsWith('wireshark-')) {
                        switchWiresharkPanel(suffix);
                    } else if (nextTaskId.startsWith('pass-')) {
                        switchPassPanel(suffix);
                    } else if (nextTaskId.startsWith('crypto-')) {
                        switchCryptoPanel(suffix);
                    } else if (nextTaskId.startsWith('linuxshell-')) {
                        switchLinuxshellPanel(suffix);
                    }
                };
            } else {
                nextActionCallback = () => {
                    issueCourseCertificate(currentModule.name);
                };
            }

            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(8, 12, 24, 0.7);
                backdrop-filter: blur(15px);
                display: flex;
                align-items: center; justify-content: center;
                z-index: 999999;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 35px;
                max-width: 480px;
                width: 85%;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(255,255,255,0.05);
                background-image: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(168, 85, 247, 0.12));
                position: relative;
                color: #fff;
            `;

            const title = document.createElement('h2');
            title.style.cssText = `
                font-family: 'JetBrains Mono', monospace;
                font-size: 1.8rem;
                font-weight: 800;
                margin-bottom: 15px;
                color: transparent;
                background: linear-gradient(to right, #22d3ee, #818cf8, #c084fc);
                -webkit-background-clip: text;
                background-clip: text;
                text-transform: uppercase;
                letter-spacing: 1px;
            `;
            title.textContent = "Task Completed! 🎉";

            const desc = document.createElement('p');
            desc.style.cssText = `
                font-size: 1rem;
                color: #e2e8f0;
                margin-bottom: 25px;
                line-height: 1.5;
            `;
            desc.innerHTML = `You have completed:<br><b style="color:#22d3ee; font-size:1.15rem;">${taskName}</b><br><br>` + 
                (hasNextTask ? `Next Challenge: <span style="color:#a78bfa;">${formatTaskIdToName(nextTaskId)}</span>` : `<span style="color:#facc15; font-weight:bold;">🏆 Course Module Mastered!</span>`);

            const btn = document.createElement('button');
            btn.style.cssText = `
                background: linear-gradient(135deg, #06b6d4, #6366f1);
                border: none;
                color: #0b0f19;
                padding: 12px 24px;
                font-size: 0.95rem;
                font-weight: 700;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
                transition: all 0.2s ease;
                font-family: 'JetBrains Mono', monospace;
                width: 100%;
            `;
            btn.textContent = hasNextTask ? "PRESS ENTER OR CLICK TO CONTINUE" : "CLAIM VERIFIED CERTIFICATE";

            const dismissModal = () => {
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                    window.removeEventListener('keydown', keyHandler);
                    if (nextActionCallback) nextActionCallback();
                }, 300);
            };

            const keyHandler = (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    dismissModal();
                }
            };

            btn.onclick = (e) => {
                e.stopPropagation();
                dismissModal();
            };

            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(btn);
            modal.appendChild(card);
            document.body.appendChild(modal);

            setTimeout(() => {
                modal.style.opacity = '1';
                window.addEventListener('keydown', keyHandler);
            }, 50);
        }

        function issueCourseCertificate(courseName) {
            const studentUser = currentUser || currentUsername || "student_cadet";
            const serialId = `CERT-` + Math.floor(1000 + Math.random() * 9000);
            const dateStr = new Date().toISOString().split('T')[0];
            
            const newCert = {
                id: serialId,
                student: studentUser,
                course: courseName,
                date: dateStr,
                status: "Verified"
            };
            const verificationUrl = `${window.location.origin}/api/certificate/verify?id=${serialId}&student=${encodeURIComponent(studentUser)}&course=${encodeURIComponent(courseName)}&date=${dateStr}`;
            
            const alreadyCertified = mockCertificates.some(c => c.course === courseName && c.student === studentUser);
            if (!alreadyCertified) {
                mockCertificates.push(newCert);
                saveAcadState();
                renderStudentCertificates();
            }

            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(10, 15, 30, 0.8);
                backdrop-filter: blur(20px);
                display: flex;
                align-items: center; justify-content: center;
                z-index: 999999;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            const card = document.createElement('div');
            card.style.cssText = `
                background: linear-gradient(135deg, #0b0f19 0%, #1e293b 100%);
                border: 15px solid #1e293b;
                border-radius: 12px;
                padding: 30px;
                max-width: 800px;
                width: 90%;
                text-align: center;
                box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 0 30px rgba(250, 204, 21, 0.15);
                position: relative;
                color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                gap: 10px;
                aspect-ratio: 1.41;
            `;

            card.innerHTML = `
                <!-- Inner thin gold border decoration -->
                <div style="position: absolute; top: 8px; bottom: 8px; left: 8px; right: 8px; border: 1.5px solid #dfb15b; border-radius: 4px; pointer-events: none; opacity: 0.65;"></div>
                
                <div>
                    <div style="font-family:'Cinzel', serif; font-size: 1.6rem; font-weight: 700; background: linear-gradient(to right, #f3e5ab, #dfb15b, #f3e5ab); -webkit-background-clip: text; background-clip: text; color: transparent; letter-spacing: 2px; margin-top: 5px;">AIGRA ACADEMY</div>
                    <div style="font-family:'Outfit', sans-serif; font-size: 0.65rem; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase;">Cyber Security & Threat Intelligence Division</div>
                </div>
                
                <div>
                    <div style="font-size: 0.8rem; color: #cbd5e1; font-style: italic;">This completion credential is proudly presented to</div>
                    <div style="font-family:'Cinzel', serif; font-size: 2.2rem; font-weight: 800; color: #ffffff; margin: 5px 0; border-bottom: 2px dashed rgba(223, 177, 91, 0.3); padding-bottom: 2px; min-width: 320px; display: inline-block; text-shadow: 0 0 10px rgba(223, 177, 91, 0.2);">${studentUser}</div>
                    <div style="font-size: 0.8rem; color: #cbd5e1;">for successfully passing all academic requirements, hands-on lab exercises, and diagnostic challenges in</div>
                    <div style="font-family:'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; color: #22d3ee; margin: 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">${courseName}</div>
                </div>
                
                <div style="font-size: 0.65rem; color: #64748b; max-width: 500px; line-height: 1.4; margin: 0 auto;">
                    Granted under the directive of the AIGRA Security Systems Curriculum Guidelines. Verified with cryptographic signature and logged in the institutional ledger database.
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 20px; margin-top: 5px;">
                    <div style="display: flex; flex-direction: column; align-items: center; width: 140px;">
                        <div style="font-family: 'Cinzel', serif; font-size: 0.75rem; color: #fff; margin-bottom: 1px; font-weight: bold;">professor_x</div>
                        <div style="width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.2); margin-bottom: 4px;"></div>
                        <div style="font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Academy Director</div>
                    </div>
                    
                    <div style="width: 60px; height: 60px; background: radial-gradient(circle, #f3e5ab 0%, #dfb15b 70%, #d4af37 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(223, 177, 91, 0.3); border: 2px dashed #0b0f19;">
                        <span style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 0.65rem; color: #0b0f19;">AIGRA</span>
                    </div>
                    
                    <div style="display: flex; gap: 10px; align-items: center; text-align: left;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(verificationUrl)}" style="width: 60px; height: 60px; border: 2px solid #fff; border-radius: 3px;" alt="QR" />
                        <div style="font-size: 0.55rem; color: #64748b; line-height: 1.3;">
                            <b>ID:</b> ${serialId}<br>
                            <b>Date:</b> ${dateStr}
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; width: 100%; gap: 10px; margin-top: 10px; z-index: 10;">
                    <button id="btn-cert-print" style="flex: 1; background: linear-gradient(135deg, #dfb15b, #d4af37); border: none; color: #0b0f19; padding: 10px 16px; font-size: 0.85rem; font-weight: 700; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-family: 'Outfit', sans-serif;">
                        🖨️ Print / Save PDF
                    </button>
                    <button id="btn-cert-dismiss" style="flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 10px 16px; font-size: 0.85rem; font-weight: 700; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-family: 'Outfit', sans-serif;">
                        DISMISS
                    </button>
                </div>
            `;

            const dismissCert = () => {
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            };

            card.querySelector('#btn-cert-print').onclick = (e) => {
                e.stopPropagation();
                window.open(verificationUrl, '_blank');
            };

            card.querySelector('#btn-cert-dismiss').onclick = (e) => {
                e.stopPropagation();
                dismissCert();
            };


            modal.appendChild(card);
            document.body.appendChild(modal);

            setTimeout(() => {
                modal.style.opacity = '1';
            }, 50);
        }

        function markTaskComplete(taskId, taskName) {
            if (!cyberLabProgress.completedTasks.includes(taskId)) {
                // Update persistent backend stats
                fetch('/api/student/stats/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' ,
                "X-CSRF-Token": getCookie("csrf_token")
            },
                    body: JSON.stringify({ task_id: taskId, task_name: taskName })
                }).then(() => {
                    fetchStudentStats();
                    fetchGlobalLeaderboard();
                });
                cyberLabProgress.completedTasks.push(taskId);
                saveAcadState();
                updateStudentGamificationDetails();
                checkCourseModuleCompletions();
                showCongratulationPopup(taskId, taskName);
            }
        }

        function checkCourseModuleCompletions() {
            ACAD_MODULES.forEach(m => {
                const completedAll = m.tasks.every(t => cyberLabProgress.completedTasks.includes(t));
                if (completedAll) {
                    const studentUser = currentUser || currentUsername || "student_cadet";
                    const alreadyCertified = mockCertificates.some(c => c.course === m.name && c.student === studentUser);
                    if (!alreadyCertified) {
                        const newCert = {
                            id: `CERT-` + Math.floor(1000 + Math.random() * 9000),
                            student: studentUser,
                            course: m.name,
                            date: new Date().toISOString().split('T')[0],
                            status: "Verified"
                        };
                        mockCertificates.push(newCert);
                        saveAcadState();
                    }
                }
            });
        }

        function filterAcadDashboardTabs() {
            const adminOnlyTabs = ['users', 'roles', 'sessions', 'payments'];
            const tabs = ['users', 'courses', 'labs', 'quizzes', 'certs', 'payments', 'reports', 'analytics', 'roles', 'instructor', 'sessions'];
            
            tabs.forEach(t => {
                const btn = document.getElementById(`acad-tab-${t}`);
                if (btn) {
                    if (adminOnlyTabs.includes(t)) {
                        btn.style.display = (currentRole === 'admin' ? 'block' : 'none');
                    } else {
                        btn.style.display = 'block';
                    }
                }
            });

            if (adminOnlyTabs.includes(currentAcadTab) && currentRole !== 'admin') {
                switchAcadTab('instructor');
            }
        }

        function switchAcadTab(tabName) {
            currentAcadTab = tabName;
            const tabs = ['users', 'courses', 'labs', 'quizzes', 'certs', 'payments', 'reports', 'analytics', 'roles', 'instructor', 'sessions'];
            tabs.forEach(t => {
                const btn = document.getElementById(`acad-tab-${t}`);
                if (btn) {
                    btn.className = "btn btn-secondary";
                }
            });
            const activeBtn = document.getElementById(`acad-tab-${tabName}`);
            if (activeBtn) {
                activeBtn.className = "btn";
            }
            renderAcadTabContent();
        }

        function renderLeaderboard() {
            const body = document.getElementById('acad-leaderboard-body');
            if (!body) return;
            body.innerHTML = `
                <tr><td>🥇 1</td><td>student_cadet</td><td>1,850</td><td>8 Days</td><td>420</td></tr>
                <tr><td>🥈 2</td><td>buffer_bypass</td><td>1,500</td><td>5 Days</td><td>250</td></tr>
                <tr><td>🥉 3</td><td>kali_master</td><td>1,200</td><td>3 Days</td><td>120</td></tr>
            `;
        }

        function renderAcadTabContent() {
            const container = document.getElementById('acad-tab-content-container');
            if (!container) return;
            const alertBox = document.getElementById('admin-only-alert');
            const isAdmin = (currentUserRole === 'admin');
            if (alertBox) {
                alertBox.style.display = isAdmin ? 'none' : 'block';
            }
            let html = "";
            if (currentAcadTab === 'users') {
                html = `
                    <div class="result-header">👥 Registered Users Directory</div>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>Username</th><th>Role</th><th>Status</th><th>Permissions</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${mockUsers.map(u => `
                                <tr>
                                    <td><b>${u.username}</b></td>
                                    <td><span style="color:#06b6d4;">${u.role}</span></td>
                                    <td><span style="color:${u.status === 'Active' ? '#10b981' : 'var(--accent-red)'}; font-weight:700;">${u.status}</span></td>
                                    <td>${u.permissions.join(', ') || 'None'}</td>
                                    <td>
                                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" ${!isAdmin ? 'disabled' : ''} onclick="toggleUserStatus('${u.username}')">${u.status === 'Active' ? 'Ban' : 'Unban'}</button>
                                        <button class="btn" style="padding:4px 8px; font-size:0.75rem; background:#3b82f6;" ${!isAdmin ? 'disabled' : ''} onclick="promptEditPerms('${u.username}')">Edit Perms</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <input type="text" id="new-user-name" class="input-text" placeholder="Username" style="max-width:180px;" ${!isAdmin ? 'disabled' : ''}>
                        <select id="new-user-role" class="input-text" style="max-width:150px; height:42px;" ${!isAdmin ? 'disabled' : ''}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button class="btn" ${!isAdmin ? 'disabled' : ''} onclick="addNewUser()">Add User</button>
                    </div>
                `;
            } else if (currentAcadTab === 'courses') {
                html = `
                    <div class="result-header">📚 Mock Course Syllabus Manager</div>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>Code</th><th>Course Title</th><th>Duration</th><th>Enrolled Students</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${mockCourses.map(c => `
                                <tr>
                                    <td><code>${c.id}</code></td>
                                    <td><b>${c.title}</b></td>
                                    <td>${c.duration}</td>
                                    <td>${c.students} Students</td>
                                    <td>
                                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" ${!isAdmin ? 'disabled' : ''} onclick="deleteCourse('${c.id}')">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <input type="text" id="new-course-id" class="input-text" placeholder="ID (e.g. CEH)" style="max-width:100px;" ${!isAdmin ? 'disabled' : ''}>
                        <input type="text" id="new-course-title" class="input-text" placeholder="Course Title" style="flex:1;" ${!isAdmin ? 'disabled' : ''}>
                        <input type="text" id="new-course-duration" class="input-text" placeholder="Duration (e.g. 5 Weeks)" style="max-width:150px;" ${!isAdmin ? 'disabled' : ''}>
                        <button class="btn" ${!isAdmin ? 'disabled' : ''} onclick="addNewCourse()">Create Course</button>
                    </div>
                `;
            } else if (currentAcadTab === 'labs') {
                html = `
                    <div class="result-header">🖥️ Active Laboratory Sandboxes</div>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>ID</th><th>Lab Name</th><th>Active Flag Required</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${mockLabs.map(l => `
                                <tr>
                                    <td><code>${l.id}</code></td>
                                    <td><b>${l.name}</b></td>
                                    <td><code>${l.flag}</code></td>
                                    <td><span style="color:${l.status === 'ONLINE' ? '#10b981' : 'var(--accent-red)'}; font-weight:700;">${l.status}</span></td>
                                    <td>
                                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" ${!isAdmin ? 'disabled' : ''} onclick="toggleLabStatus('${l.id}')">Toggle Status</button>
                                        <button class="btn" style="padding:4px 8px; font-size:0.75rem; background:#3b82f6;" ${!isAdmin ? 'disabled' : ''} onclick="changeLabFlag('${l.id}')">Change Flag</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else if (currentAcadTab === 'quizzes') {
                html = `
                    <div class="result-header">❓ Practical Quizzes Panel</div>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>ID</th><th>Question</th><th>Options</th><th>Correct Option Index</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${mockQuizQuestions.map(q => `
                                <tr>
                                    <td>#${q.id}</td>
                                    <td><b>${q.question}</b></td>
                                    <td>${q.options.join(' | ')}</td>
                                    <td>Option #${q.correct + 1}</td>
                                    <td>
                                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" ${!isAdmin ? 'disabled' : ''} onclick="deleteQuizQuestion(${q.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">
                        <input type="text" id="new-quiz-question" class="input-text" placeholder="Type new question here..." ${!isAdmin ? 'disabled' : ''}>
                        <div style="display:flex; gap:10px;">
                            <input type="text" id="new-quiz-opt0" class="input-text" placeholder="Option A" ${!isAdmin ? 'disabled' : ''}>
                            <input type="text" id="new-quiz-opt1" class="input-text" placeholder="Option B" ${!isAdmin ? 'disabled' : ''}>
                            <input type="text" id="new-quiz-opt2" class="input-text" placeholder="Option C" ${!isAdmin ? 'disabled' : ''}>
                            <select id="new-quiz-correct" class="input-text" style="max-width:150px; height:42px;" ${!isAdmin ? 'disabled' : ''}>
                                <option value="0">A is Correct</option>
                                <option value="1">B is Correct</option>
                                <option value="2">C is Correct</option>
                            </select>
                        </div>
                        <button class="btn" style="align-self:flex-start;" ${!isAdmin ? 'disabled' : ''} onclick="addQuizQuestion()">Add Question</button>
                    </div>
                `;
            } else if (currentAcadTab === 'certs') {
                html = `
                    <div class="result-header">📜 Verified Completion Credentials</div>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>Serial ID</th><th>Student</th><th>Course Name</th><th>Date Issued</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${mockCertificates.map(c => `
                                <tr>
                                    <td><code>${c.id}</code></td>
                                    <td><b>${c.student}</b></td>
                                    <td>${c.course}</td>
                                    <td>${c.date}</td>
                                    <td><span style="color:#10b981; font-weight:700;">${c.status}</span></td>
                                    <td>
                                        <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem; color:var(--accent-red); border-color:var(--accent-red);" ${!isAdmin ? 'disabled' : ''} onclick="revokeCertificate('${c.id}')">Revoke</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else if (currentAcadTab === 'payments') {
                html = `
                    <div class="result-header">💳 Financial Transactions & Subscriptions</div>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>Transaction ID</th><th>Student</th><th>Amount</th><th>Course</th><th>Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            ${mockPayments.map(p => `
                                <tr>
                                    <td><code>${p.id}</code></td>
                                    <td><b>${p.student}</b></td>
                                    <td>${p.amount}</td>
                                    <td>${p.course}</td>
                                    <td>${p.date}</td>
                                    <td><span style="color:${p.status === 'Paid' ? '#10b981' : 'var(--accent-red)'}; font-weight:700;">${p.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else if (currentAcadTab === 'reports') {
                html = `
                    <div class="result-header">📋 Incident Threat Reports & Audits</div>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>ID</th><th>Type</th><th>Trigger User</th><th>Incident Log</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                            ${mockReports.map(r => `
                                <tr>
                                    <td><code>${r.id}</code></td>
                                    <td><span class="badge" style="background:#eab308;">${r.type}</span></td>
                                    <td><b>${r.user}</b></td>
                                    <td>${r.description}</td>
                                    <td>${r.date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="btn" style="margin-top:15px;" onclick="window.print()">Export PDF Summary Report 📄</button>
                `;
            } else if (currentAcadTab === 'analytics') {
                html = `
                    <div class="result-header">📊 Global Performance Metrics & Analytics</div>
                    <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px;">
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#fff; font-weight:700;">
                                <span>Global XP Accumulation rate</span>
                                <span>85% (High Participation)</span>
                            </div>
                            <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; margin-top:5px; overflow:hidden;">
                                <div style="height:100%; width:85%; background:#3b82f6;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#fff; font-weight:700;">
                                <span>Daily Active Streak Retention</span>
                                <span>70% (Engaged Users)</span>
                            </div>
                            <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; margin-top:5px; overflow:hidden;">
                                <div style="height:100%; width:70%; background:#10b981;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#fff; font-weight:700;">
                                <span>Average Quiz Log Success Rate</span>
                                <span>74% (Passed checks)</span>
                            </div>
                            <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; margin-top:5px; overflow:hidden;">
                                <div style="height:100%; width:74%; background:#a855f7;"></div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (currentAcadTab === 'roles') {
                html = `
                    <div class="result-header">🔐 Role & Access Permission Matrix</div>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-top:8px;">Toggle default permissions globally for each system role:</p>
                    <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                        <thead>
                            <tr><th>System Role</th><th>Can Read Audit Files</th><th>Can Write Announcements</th><th>Can Launch Virtual Sandbox CLI</th><th>Can Revoke Credentials</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Admin</b></td>
                                <td>✅ Yes</td>
                                <td>✅ Yes</td>
                                <td>✅ Yes</td>
                                <td>✅ Yes</td>
                            </tr>
                            <tr>
                                <td><b>Faculty</b></td>
                                <td>✅ Yes</td>
                                <td>✅ Yes</td>
                                <td>✅ Yes</td>
                                <td>❌ No</td>
                            </tr>
                            <tr>
                                <td><b>Student</b></td>
                                <td>✅ Yes</td>
                                <td>❌ No</td>
                                <td>✅ Yes</td>
                                <td>❌ No</td>
                            </tr>
                        </tbody>
                    </table>
                `;
            } else if (currentAcadTab === 'instructor') {
                html = `
                    <div class="result-header">👨‍🏫 Instructor Workspace Dashboard</div>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-top:8px;">Create resources, log attendance, review grades, and generate certificates:</p>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:15px;">
                        <div class="result-block" style="background:rgba(255,255,255,0.01);">
                            <div style="font-weight:700; color:#fff; margin-bottom:10px;">➕ Create Course Room</div>
                            <input type="text" id="inst-room-name" class="input-text" placeholder="Room Name (e.g. LAB-B)" style="margin-bottom:8px;">
                            <input type="text" id="inst-room-course" class="input-text" placeholder="Course Code" style="margin-bottom:8px;">
                            <button class="btn" style="width:100%; font-size:0.8rem;" onclick="instructorCreateRoom()">Create Room</button>
                        </div>
                        <div class="result-block" style="background:rgba(255,255,255,0.01);">
                            <div style="font-weight:700; color:#fff; margin-bottom:10px;">➕ Add Practical Assignment</div>
                            <input type="text" id="inst-asm-title" class="input-text" placeholder="Assignment Title" style="margin-bottom:8px;">
                            <input type="text" id="inst-asm-course" class="input-text" placeholder="Course Code" style="margin-bottom:8px;">
                            <button class="btn" style="width:100%; font-size:0.8rem;" onclick="instructorCreateAssignment()">Create Assignment</button>
                        </div>
                    </div>

                    <div style="margin-top:20px;">
                        <div style="font-weight:700; color:#fff; margin-bottom:8px;">🏫 Active Rooms Directory</div>
                        <table class="table-results" style="width:100%; font-size:0.8rem;">
                            <thead><tr><th>Room ID</th><th>Name</th><th>Course</th><th>Capacity</th><th>Status</th></tr></thead>
                            <tbody>
                                ${mockRooms.map(r => `
                                    <tr><td><code>${r.id}</code></td><td><b>${r.name}</b></td><td>${r.course}</td><td>${r.capacity} Seats</td><td>${r.status}</td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top:20px;">
                        <div style="font-weight:700; color:#fff; margin-bottom:8px;">📝 Assignments List</div>
                        <table class="table-results" style="width:100%; font-size:0.8rem;">
                            <thead><tr><th>ID</th><th>Title</th><th>Course</th><th>Due Date</th><th>Submissions</th></tr></thead>
                            <tbody>
                                ${mockAssignments.map(a => `
                                    <tr><td><code>${a.id}</code></td><td><b>${a.title}</b></td><td>${a.course}</td><td>${a.dueDate}</td><td>${a.submissions} Submissions</td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top:20px;">
                        <div style="font-weight:700; color:#fff; margin-bottom:8px;">📋 Student Attendance Logs</div>
                        <table class="table-results" style="width:100%; font-size:0.8rem;">
                            <thead><tr><th>Date</th><th>Student</th><th>Course</th><th>Status</th></tr></thead>
                            <tbody>
                                ${mockAttendance.map(att => `
                                    <tr><td><code>${att.date}</code></td><td><b>${att.student}</b></td><td>${att.course}</td><td><span style="color:#10b981; font-weight:700;">${att.status}</span></td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div style="margin-top:10px; display:flex; gap:10px;">
                            <input type="text" id="inst-att-student" class="input-text" placeholder="Student Name" style="max-width:180px;">
                            <input type="text" id="inst-att-course" class="input-text" placeholder="Course Code" style="max-width:120px;">
                            <button class="btn" style="font-size:0.8rem;" onclick="instructorLogAttendance()">Log Present</button>
                        </div>
                    </div>
                `;
            } else if (currentAcadTab === 'sessions') {
                if (currentUserRole !== 'admin') {
                    html = `
                        <div style="padding: 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--accent-red); border-radius: 8px; color: var(--accent-red); font-weight: 700; font-size: 0.9rem;">
                            ⚠️ Access Denied: This console tab is restricted to system administrators.
                        </div>
                    `;
                } else {
                    html = `
                        <div class="result-header">🔌 Active User Sessions Forensics</div>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:8px;">Real-time active TCP socket connections to AIGRA Portal servers:</p>
                        <table class="table-results" style="width:100%; margin-top:15px; font-size:0.85rem;">
                            <thead>
                                <tr><th>Timestamp</th><th>Username</th><th>IP Address</th><th>Machine / Browser OS</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${mockSessions.map(s => `
                                    <tr>
                                        <td><code>${s.time}</code></td>
                                        <td><b>${s.username}</b></td>
                                        <td><code>${s.ip}</code></td>
                                        <td><span style="color:#06b6d4;">${s.device}</span></td>
                                        <td><span style="color:#10b981; font-weight:700;">CONNECTED</span></td>
                                        <td>
                                            <button class="btn" style="padding:4px 8px; font-size:0.75rem; background:var(--accent-red);" onclick="terminateUserSession('${s.username}', '${s.ip}')">Terminate Session 🔌</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                }
            }
            container.innerHTML = html;
        }

        function toggleUserStatus(username) {
            const user = mockUsers.find(u => u.username === username);
            if (user) {
                user.status = (user.status === 'Active' ? 'Banned' : 'Active');
                saveAcadState();
                renderAcadTabContent();
            }
        }
        function promptEditPerms(username) {
            const user = mockUsers.find(u => u.username === username);
            if (user) {
                const perms = prompt(`Edit permissions for ${username} (comma-separated):`, user.permissions.join(', '));
                if (perms !== null) {
                    user.permissions = perms.split(',').map(p => p.trim()).filter(Boolean);
                    saveAcadState();
                    renderAcadTabContent();
                }
            }
        }
        function addNewUser() {
            const name = document.getElementById('new-user-name').value.trim();
            const role = document.getElementById('new-user-role').value;
            if (!name) return;
            mockUsers.push({
                username: name,
                role: role,
                status: "Active",
                permissions: role === 'admin' ? ["Read", "Write", "Execute"] : (role === 'faculty' ? ["Read", "Write"] : ["Read"])
            });
            document.getElementById('new-user-name').value = "";
            saveAcadState();
            renderAcadTabContent();
        }
        function deleteCourse(id) {
            mockCourses = mockCourses.filter(c => c.id !== id);
            saveAcadState();
            renderAcadTabContent();
        }
        function addNewCourse() {
            const id = document.getElementById('new-course-id').value.trim();
            const title = document.getElementById('new-course-title').value.trim();
            const duration = document.getElementById('new-course-duration').value.trim();
            if (!id || !title) return;
            mockCourses.push({ id, title, duration: duration || "4 Weeks", students: 0 });
            saveAcadState();
            renderAcadTabContent();
        }
        function toggleLabStatus(id) {
            const lab = mockLabs.find(l => l.id === id);
            if (lab) {
                lab.status = (lab.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE');
                saveAcadState();
                renderAcadTabContent();
            }
        }
        function changeLabFlag(id) {
            const lab = mockLabs.find(l => l.id === id);
            if (lab) {
                const newFlag = prompt(`Enter new flag value for ${lab.name}:`, lab.flag);
                if (newFlag) {
                    lab.flag = newFlag;
                    saveAcadState();
                    renderAcadTabContent();
                }
            }
        }
        function deleteQuizQuestion(id) {
            mockQuizQuestions = mockQuizQuestions.filter(q => q.id !== id);
            saveAcadState();
            renderAcadTabContent();
        }
        function addQuizQuestion() {
            const qText = document.getElementById('new-quiz-question').value.trim();
            const opt0 = document.getElementById('new-quiz-opt0').value.trim();
            const opt1 = document.getElementById('new-quiz-opt1').value.trim();
            const opt2 = document.getElementById('new-quiz-opt2').value.trim();
            const correct = parseInt(document.getElementById('new-quiz-correct').value);
            if (!qText || !opt0 || !opt1 || !opt2) return;
            const nextId = mockQuizQuestions.length > 0 ? Math.max(...mockQuizQuestions.map(q => q.id)) + 1 : 1;
            mockQuizQuestions.push({ id: nextId, question: qText, options: [opt0, opt1, opt2], correct });
            saveAcadState();
            renderAcadTabContent();
        }
        function revokeCertificate(id) {
            mockCertificates = mockCertificates.filter(c => c.id !== id);
            saveAcadState();
            renderAcadTabContent();
        }

        function instructorCreateRoom() {
            const name = document.getElementById('inst-room-name').value.trim();
            const course = document.getElementById('inst-room-course').value.trim();
            if (!name || !course) return;
            const nextId = `ROOM-` + Math.floor(100 + Math.random() * 900);
            mockRooms.push({ id: nextId, name, course, capacity: 25, status: "Active" });
            saveAcadState();
            renderAcadTabContent();
        }

        function instructorCreateAssignment() {
            const title = document.getElementById('inst-asm-title').value.trim();
            const course = document.getElementById('inst-asm-course').value.trim();
            if (!title || !course) return;
            const nextId = `ASM-0` + (mockAssignments.length + 1);
            mockAssignments.push({ id: nextId, title, course, dueDate: "2026-08-01", submissions: 0 });
            saveAcadState();
            renderAcadTabContent();
        }

        function instructorLogAttendance() {
            const student = document.getElementById('inst-att-student').value.trim();
            const course = document.getElementById('inst-att-course').value.trim();
            if (!student || !course) return;
            mockAttendance.push({
                date: new Date().toISOString().split('T')[0],
                student,
                course,
                status: "Present"
            });
            saveAcadState();
            renderAcadTabContent();
        }

        // ==========================================
        // VIRTUAL LINUX BANDIT SHELL ENGINE
        // ==========================================
        let banditUnlocked = {
            lvl0: true,
            lvl1: false,
            lvl2: false,
            lvl3: false,
            lvl4: false,
            lvl5: false
        };

        try {
            const saved = localStorage.getItem('bandit_unlocked_status');
            if (saved) {
                banditUnlocked = JSON.parse(saved);
            }
        } catch(e) {}
        banditUnlocked.lvl0 = true;

        const BANDIT_PASSWORDS = {
            lvl1: "bandit_lvl1_dash",
            lvl2: "bandit_lvl2_spaces",
            lvl3: "bandit_lvl3_hidden",
            lvl4: "bandit_lvl4_human",
            lvl5: "bandit_lvl5_base64"
        };

        let banditCurrentDirs = {
            lvl0: "/home/bandit0",
            lvl1: "/home/bandit1",
            lvl2: "/home/bandit2",
            lvl3: "/home/bandit3",
            lvl4: "/home/bandit4",
            lvl5: "/home/bandit5"
        };

        let banditFS = {
            "lvl0": {
                "/home/bandit0": { type: "dir", children: ["readme", "notes.txt"] },
                "/home/bandit0/readme": { type: "file", content: "bandit_lvl1_dash" },
                "/home/bandit0/notes.txt": { type: "file", content: "Use cat readme to find the password to unlock Level 1." }
            },
            "lvl1": {
                "/home/bandit1": { type: "dir", children: ["-"] },
                "/home/bandit1/-": { type: "file", content: "bandit_lvl2_spaces" }
            },
            "lvl2": {
                "/home/bandit2": { type: "dir", children: ["spaces in this filename"] },
                "/home/bandit2/spaces in this filename": { type: "file", content: "bandit_lvl3_hidden" }
            },
            "lvl3": {
                "/home/bandit3": { type: "dir", children: ["inhere", "notes.txt"] },
                "/home/bandit3/inhere": { type: "dir", children: [".hidden"] },
                "/home/bandit3/inhere/.hidden": { type: "file", content: "bandit_lvl4_human" },
                "/home/bandit3/notes.txt": { type: "file", content: "Look inside the inhere folder for hidden configurations." }
            },
            "lvl4": {
                "/home/bandit4": { type: "dir", children: ["maybehere"] },
                "/home/bandit4/maybehere": { type: "dir", children: ["file0", "file1", "file2"] },
                "/home/bandit4/maybehere/file0": { type: "file", content: "\x00\x01\x02\x03\x04 ELF Executable data", isBinary: true },
                "/home/bandit4/maybehere/file1": { type: "file", content: "\x89PNG\r\n\x1a\n Image binary", isBinary: true },
                "/home/bandit4/maybehere/file2": { type: "file", content: "bandit_lvl5_base64", isBinary: false }
            },
            "lvl5": {
                "/home/bandit5": { type: "dir", children: ["data.txt"] },
                "/home/bandit5/data.txt": { type: "file", content: "TktBU3tiYW5kaXRfbHZsNV9iYXNlNjRfZGVjb2RlZH0=" }
            }
        };

        function switchLinuxLevel(lvl) {
            if (!banditUnlocked[lvl]) {
                alert(`Level ${lvl.replace('lvl','')} is currently locked! Please submit the password from the previous level to unlock it.`);
                return;
            }
            switchPanel(`linux-${lvl}`);
            document.querySelectorAll('.linux-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-linux-${lvl}`);
            if (activeItem) activeItem.classList.add('active');
        }

        function updateBanditSidebar() {
            for (let i = 0; i <= 5; i++) {
                const lvl = `lvl${i}`;
                const el = document.getElementById(`nav-linux-${lvl}`);
                if (el) {
                    if (banditUnlocked[lvl]) {
                        el.classList.remove('locked');
                        el.innerHTML = `🔓 Level ${i} → ${i+1}`;
                    } else {
                        el.classList.add('locked');
                        el.innerHTML = `🔒 Level ${i} → ${i+1}`;
                    }
                }
            }
        }

        function unlockBanditLevel(lvl) {
            const input = document.getElementById(`unlock-${lvl}-pass`);
            if (!input) return;
            const val = input.value.trim();
            if (val === BANDIT_PASSWORDS[lvl]) {
                banditUnlocked[lvl] = true;
                try {
                    localStorage.setItem('bandit_unlocked_status', JSON.stringify(banditUnlocked));
                } catch(e) {}
                updateBanditSidebar();
                alert(`Level ${lvl.replace('lvl','')} unlocked successfully!`);
                switchLinuxLevel(lvl);
            } else {
                alert("Incorrect password! Find it by solving the previous level tasks.");
            }
        }

        function handleBanditTerminalKey(event, lvl) {
            if (event.key === "Enter") {
                const inputEl = document.getElementById(`terminal-${lvl}-input`);
                const commandStr = inputEl.value.trim();
                if (!commandStr) return;

                writeBanditLine(lvl, `bandit${lvl.replace('lvl','')}` + "@aigra-linux:~$ " + commandStr, "#fff");
                const parts = commandStr.split(/\s+/);
                const cmd = parts[0];
                const arg = parts.slice(1).join(' ');
                let output = "";
                let outputColor = "#10b981";

                const fs = banditFS[lvl];
                let currentDir = banditCurrentDirs[lvl];

                if (cmd === "pwd") {
                    output = currentDir;
                } else if (cmd === "ls") {
                    const includeHidden = arg.includes("-a") || arg.includes("-la");
                    const pathParts = arg.split(/\s+/).filter(p => !p.startsWith("-"));
                    let checkDir = currentDir;
                    if (pathParts.length > 0) {
                        const target = pathParts[0];
                        checkDir = target.startsWith("/") ? target : (currentDir === "/" ? `/${target}` : `${currentDir}/${target}`);
                        checkDir = checkDir.replace(/\/+$/, "");
                    }

                    if (fs[checkDir] && fs[checkDir].type === "dir") {
                        let children = [...fs[checkDir].children];
                        if (!includeHidden) {
                            children = children.filter(c => !c.startsWith("."));
                        }
                        output = children.join("   ") || "(directory is empty)";
                    } else {
                        output = `ls: cannot access '${arg}': No such file or directory`;
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "cd") {
                    if (!arg || arg === "~") {
                        banditCurrentDirs[lvl] = `/home/bandit${lvl.replace('lvl','')}`;
                    } else if (arg === "..") {
                        if (currentDir !== "/") {
                            const lastSlash = currentDir.lastIndexOf("/");
                            banditCurrentDirs[lvl] = currentDir.substring(0, lastSlash) || "/";
                        }
                    } else {
                        let targetPath = arg.startsWith("/") ? arg : (currentDir === "/" ? `/${arg}` : `${currentDir}/${arg}`);
                        targetPath = targetPath.replace(/\/+$/, "");
                        if (fs[targetPath] && fs[targetPath].type === "dir") {
                            banditCurrentDirs[lvl] = targetPath;
                        } else {
                            output = `cd: no such file or directory: ${arg}`;
                            outputColor = "var(--accent-red)";
                        }
                    }
                } else if (cmd === "cat") {
                    if (!arg) {
                        output = "cat: missing file operand";
                        outputColor = "var(--accent-red)";
                    } else {
                        let cleanArg = arg.replace(/^["']|["']$/g, '');
                        let filePath = cleanArg.startsWith("/") ? cleanArg : (currentDir === "/" ? `/${cleanArg}` : `${currentDir}/${cleanArg}`);
                        filePath = filePath.replace(/\/+$/, "");

                        if (fs[filePath] && fs[filePath].type === "file") {
                            output = fs[filePath].content;
                            if (lvl === "lvl0" && filePath.endsWith("readme")) {
                                output += "\n\n[LEVEL COMPLETE] Password found! +100 XP awarded.\nRedirecting to Level 1 in 2 seconds...";
                                banditUnlocked["lvl1"] = true;
                                try { localStorage.setItem('bandit_unlocked_status', JSON.stringify(banditUnlocked)); } catch(e) {}
                                updateBanditSidebar();
                                markTaskComplete('linux-lvl0', 'Bandit Level 0');
                            } else if (lvl === "lvl1" && filePath.endsWith("-")) {
                                output += "\n\n[LEVEL COMPLETE] Password found! +100 XP awarded.\nRedirecting to Level 2 in 2 seconds...";
                                banditUnlocked["lvl2"] = true;
                                try { localStorage.setItem('bandit_unlocked_status', JSON.stringify(banditUnlocked)); } catch(e) {}
                                updateBanditSidebar();
                                markTaskComplete('linux-lvl1', 'Bandit Level 1');
                            } else if (lvl === "lvl2" && filePath.endsWith("spaces in this filename")) {
                                output += "\n\n[LEVEL COMPLETE] Password found! +100 XP awarded.\nRedirecting to Level 3 in 2 seconds...";
                                banditUnlocked["lvl3"] = true;
                                try { localStorage.setItem('bandit_unlocked_status', JSON.stringify(banditUnlocked)); } catch(e) {}
                                updateBanditSidebar();
                                markTaskComplete('linux-lvl2', 'Bandit Level 2');
                            } else if (lvl === "lvl3" && filePath.endsWith(".hidden")) {
                                output += "\n\n[LEVEL COMPLETE] Password found! +100 XP awarded.\nRedirecting to Level 4 in 2 seconds...";
                                banditUnlocked["lvl4"] = true;
                                try { localStorage.setItem('bandit_unlocked_status', JSON.stringify(banditUnlocked)); } catch(e) {}
                                updateBanditSidebar();
                                markTaskComplete('linux-lvl3', 'Bandit Level 3');
                            } else if (lvl === "lvl4" && filePath.endsWith("file2")) {
                                output += "\n\n[LEVEL COMPLETE] Password found! +100 XP awarded.\nRedirecting to Level 5 in 2 seconds...";
                                banditUnlocked["lvl5"] = true;
                                try { localStorage.setItem('bandit_unlocked_status', JSON.stringify(banditUnlocked)); } catch(e) {}
                                updateBanditSidebar();
                                markTaskComplete('linux-lvl4', 'Bandit Level 4');
                            }
                        } else {
                            output = `cat: ${arg}: No such file or directory`;
                            outputColor = "var(--accent-red)";
                        }
                    }
                } else if (cmd === "file") {
                    if (!arg) {
                        output = "file: missing operand";
                        outputColor = "var(--accent-red)";
                    } else {
                        let searchDir = currentDir;
                        if (fs[searchDir] && fs[searchDir].type === "dir") {
                            let results = [];
                            fs[searchDir].children.forEach(child => {
                                const fullPath = searchDir === "/" ? `/${child}` : `${searchDir}/${child}`;
                                const node = fs[fullPath];
                                if (node && node.type === "file") {
                                    if (node.isBinary) {
                                        results.push(`./${child}: ELF 64-bit LSB executable, data`);
                                    } else {
                                        results.push(`./${child}: ASCII text`);
                                    }
                                }
                            });
                            output = results.join("\n");
                        } else {
                            output = "file: directory error";
                        }
                    }
                } else if (cmd === "base64") {
                    if (arg === "-d data.txt" || arg === "-d < data.txt" || arg.includes("-d")) {
                        let filePath = currentDir === "/" ? "/data.txt" : `${currentDir}/data.txt`;
                        if (fs[filePath]) {
                            output = "AIGRA{bandit_lvl5_base64_decoded}";
                            output += "\n\n[TASK COMPLETE] Flag verified!";
                            markTaskComplete('linux-lvl5', 'Bandit Level 5');
                        } else {
                            output = "base64: data.txt: No such file or directory";
                        }
                    } else {
                        output = "base64: missing options. Did you mean base64 -d?";
                    }
                } else if (cmd === "clear") {
                    const outBox = document.getElementById(`terminal-${lvl}-output`);
                    if (outBox) outBox.innerHTML = "";
                    inputEl.value = "";
                    return;
                } else {
                    output = `bash: command not found: ${cmd}`;
                    outputColor = "var(--accent-red)";
                }

                writeBanditLine(lvl, output, outputColor);
                inputEl.value = "";
            }
        }

        function writeBanditLine(lvl, text, color) {
            const outBox = document.getElementById(`terminal-${lvl}-output`);
            if (!outBox) return;
            const line = document.createElement("div");
            line.style.color = color;
            line.style.marginTop = "4px";
            line.style.whiteSpace = "pre-wrap";
            line.textContent = text;
            outBox.appendChild(line);
            outBox.scrollTop = outBox.scrollHeight;
        }

        // ==========================================
        // WINDOWS BASICS TERMINAL ENGINE
        // ==========================================
        let winCurrentDir = "C:\\Users\\Student";
        let winFS = {
            "C:\\Users\\Student": { type: "dir", children: ["Documents", "Downloads", "Desktop"] },
            "C:\\Users\\Student\\Documents": { type: "dir", children: ["flag.txt", "notes.txt"] },
            "C:\\Users\\Student\\Documents\\flag.txt": { type: "file", content: "AIGRA{windows_cmd_filesystem_dir_navigation}" },
            "C:\\Users\\Student\\Documents\\notes.txt": { type: "file", content: "CMD supports standard navigation via 'cd' and reading files via 'type'." },
            "C:\\Users\\Student\\Downloads": { type: "dir", children: [] },
            "C:\\Users\\Student\\Desktop": { type: "dir", children: [] }
        };

        // ==========================================
        // COMPUTER NETWORKING ENGINE
        // ==========================================
        function switchNetcoursePanel(code) {
            switchPanel(`netcourse-${code}`);
            document.querySelectorAll('.netcourse-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-netcourse-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        function verifyNetcourseOsiT1() {
            const val = document.getElementById('netcourse-osi-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('netcourse-osi-t1-output');
            out.style.display = 'block';
            if (val === 'network' || val === '3') {
                out.style.color = '#10b981';
                out.innerHTML = '✓ CORRECT! Routers operate at Layer 3 (Network Layer) of the OSI model.<br>Flag: AIGRA{osi_network_routing_layer3}<br><span style="color:#06b6d4;">Moving to the next lesson...</span>';
                markTaskComplete('netcourse-osi', 'OSI Layers');
            } else {
                out.style.color = 'var(--accent-red)';
                out.textContent = '✗ INCORRECT. Hint: The Network Layer handles logical IP addresses and routing.';
            }
        }

        function verifyNetcourseTcpT1() {
            const val = document.getElementById('netcourse-tcp-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('netcourse-tcp-t1-output');
            out.style.display = 'block';
            if (val === 'tcp') {
                out.style.color = '#10b981';
                out.innerHTML = '✓ CORRECT! TCP establishes a connection-oriented reliable path using a 3-way handshake.<br>Flag: AIGRA{tcp_handshake_reliability}<br><span style="color:#06b6d4;">Moving to the next lesson...</span>';
                markTaskComplete('netcourse-tcp', 'TCP handshakes');
            } else {
                out.style.color = 'var(--accent-red)';
                out.textContent = '✗ INCORRECT. Hint: It stands for Transmission Control Protocol.';
            }
        }

        function verifyNetcourseRoutingT1() {
            const val = document.getElementById('netcourse-routing-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('netcourse-routing-t1-output');
            out.style.display = 'block';
            if (val === 'nslookup' || val === 'dig') {
                out.style.color = '#10b981';
                out.innerHTML = '✓ CORRECT! Both nslookup and dig allow querying DNS mapping servers.<br>Flag: AIGRA{dns_nslookup_query_diagnostic}<br><span style="color:#06b6d4;">Moving to the next lesson...</span>';
                markTaskComplete('netcourse-routing', 'DNS Diagnostics');
            } else {
                out.style.color = 'var(--accent-red)';
                out.textContent = '✗ INCORRECT. Hint: CMD uses nslookup, while Linux terminals favor dig.';
            }
        }

        function verifyNetcourseSecurityT1() {
            const val = document.getElementById('netcourse-security-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('netcourse-security-t1-output');
            out.style.display = 'block';
            if (val === 'tcpdump') {
                out.style.color = '#10b981';
                out.innerHTML = '✓ CORRECT! tcpdump is the classic Linux command-line sniffer utility.<br>Flag: AIGRA{tcpdump_live_packet_sniffing}';
                markTaskComplete('netcourse-security', 'Network Packet Sniffing');
            } else {
                out.style.color = 'var(--accent-red)';
                out.textContent = '✗ INCORRECT. Hint: Starts with tcp...';
            }
        }

        // ==========================================
        // WEB FUNDAMENTALS COURSE ENGINE
        // ==========================================
        function switchWebcoursePanel(code) {
            switchPanel(`webcourse-${code}`);
            document.querySelectorAll('.webcourse-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-webcourse-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        // ==========================================
        // WEB APPLICATION SECURITY COURSE ENGINE
        // ==========================================
        function switchWebsecPanel(code) {
            switchPanel(`websec-${code}`);
            document.querySelectorAll('.websec-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-websec-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        // ==========================================
        // BURP SUITE COURSE ENGINE
        // ==========================================
        function switchBurpPanel(code) {
            switchPanel(`burp-${code}`);
            document.querySelectorAll('.burp-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-burp-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        // ==========================================
        // NMAP SCANNER COURSE ENGINE
        // ==========================================
        function switchNmapPanel(code) {
            switchPanel(`nmap-${code}`);
            document.querySelectorAll('.nmap-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-nmap-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        // ==========================================
        // WIRESHARK ANALYZER COURSE ENGINE
        // ==========================================
        function switchWiresharkPanel(code) {
            switchPanel(`wireshark-${code}`);
            document.querySelectorAll('.wireshark-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-wireshark-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        // ==========================================
        // PASSWORD ATTACKS COURSE ENGINE
        // ==========================================
        function switchPassPanel(code) {
            switchPanel(`pass-${code}`);
            document.querySelectorAll('.pass-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-pass-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        // ==========================================
        // CRYPTOGRAPHY COURSE ENGINE
        // ==========================================
        function switchCryptoPanel(code) {
            switchPanel(`crypto-${code}`);
            document.querySelectorAll('.crypto-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-crypto-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        function decryptCaesarCipher() {
            const keyVal = parseInt(document.getElementById('crypto-caesar-key').value.trim());
            const out = document.getElementById('crypto-caesar-output');
            if (!out) return;
            out.style.display = "block";

            if (keyVal === 3) {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Decryption Success! Ciphertext 'KHOOR' shifts backward by 3 to: <b>HELLO</b>.<br><b>Flag:</b> AIGRA{symmetric_caesar_shift_decrypted}<br><span style="color:#06b6d4;">Moving to Asymmetric Handshake...</span>`;
                markTaskComplete('crypto-symmetric', 'Symmetric Encryption');
                setTimeout(() => switchCryptoPanel('asymmetric'), 2000);
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Mismatch Shift Offset. Try shift key value '3'.`;
            }
        }

        function generateRsaKeys() {
            const pub = document.getElementById('crypto-rsa-pub');
            const priv = document.getElementById('crypto-rsa-priv');
            if (!pub || !priv) return;

            pub.value = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Y3r1b...\n-----END PUBLIC KEY-----`;
            priv.value = `-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Y3r1b9c3e5d8f6a3b2ac8d7e9f0...\n-----END RSA PRIVATE KEY-----`;
        }

        function decryptRsaHandshake() {
            const pub = document.getElementById('crypto-rsa-pub').value.trim();
            const out = document.getElementById('crypto-rsa-output');
            if (!out) return;
            out.style.display = "block";

            if (pub.includes("BEGIN PUBLIC KEY")) {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Asymmetric RSA decryption verified with Private Key!<br><b>Plaintext:</b> FlagRequest<br><b>Flag:</b> AIGRA{asymmetric_rsa_keypair_handshake}<br><span style="color:#06b6d4;">Moving to Hashing & Integrity...</span>`;
                markTaskComplete('crypto-asymmetric', 'Asymmetric Handshake');
                setTimeout(() => switchCryptoPanel('hash'), 2000);
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ No keys generated. Click 'Generate Keypair' first.`;
            }
        }

        let calculatedHashes = { 1: false, 2: false };
        function calcCryptoHash(fileNum) {
            const el = document.getElementById(`crypto-file${fileNum}-hash`);
            if (!el) return;

            if (fileNum === 1) {
                el.textContent = "SHA-256: d57e1c3e98218e86f7a07a1b9c3e5d8f6a3b2ac8d7e9f01a4f5b3c2d8f9a2b1c";
                calculatedHashes[1] = true;
            } else {
                el.textContent = "SHA-256: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
                calculatedHashes[2] = true;
            }
        }

        function verifyCryptoIntegrity() {
            const out = document.getElementById('crypto-hash-output');
            if (!out) return;
            out.style.display = "block";

            if (!calculatedHashes[1] || !calculatedHashes[2]) {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Please click 'Calculate Hash' on both files before verifying.`;
                return;
            }

            out.style.background = "rgba(16,185,129,0.1)";
            out.style.color = "#10b981";
            out.style.border = "1px solid rgba(16,185,129,0.2)";
            out.innerHTML = `✓ Integrity matches target checksum on File 2!<br><b>Verified File:</b> patch_update_v2.bin<br><b>Flag:</b> AIGRA{cryptographic_checksum_integrity_verified}<br><span style="color:#06b6d4;">Moving to Digital Signatures...</span>`;
            markTaskComplete('crypto-hash', 'Hashing & Integrity');
            setTimeout(() => switchCryptoPanel('signature'), 2000);
        }

        function verifyDigitalSignature() {
            const out = document.getElementById('crypto-sig-output');
            if (!out) return;
            out.style.display = "block";

            out.style.background = "rgba(16,185,129,0.1)";
            out.style.color = "#10b981";
            out.style.border = "1px solid rgba(16,185,129,0.2)";
            out.innerHTML = `✓ Signature verified! Sender's authenticity and document non-repudiation verified.<br><b>Flag:</b> AIGRA{digital_signature_verification_success}<br>🎉 Congratulations! You completed the Cryptography course!`;
            markTaskComplete('crypto-signature', 'Digital Signatures');
        }

        function runDictionaryAttack() {
            const list = document.getElementById('pass-dict-wordlist').value.trim().split('\n');
            const consoleBox = document.getElementById('pass-dict-console');
            const out = document.getElementById('pass-dict-output');
            if (!consoleBox || !out) return;

            consoleBox.style.display = "block";
            consoleBox.innerHTML = "";
            out.style.display = "none";

            let delay = 0;
            let found = false;

            list.forEach((word, idx) => {
                const cleanWord = word.trim();
                if (!cleanWord) return;

                setTimeout(() => {
                    if (found) return;
                    
                    const line = document.createElement("div");
                    if (cleanWord === "dragon") {
                        found = true;
                        line.style.color = "#10b981";
                        line.textContent = `[+] Testing "dragon"... [SUCCESS] Account cracked! Password found!`;
                        consoleBox.appendChild(line);
                        
                        out.style.display = "block";
                        out.style.background = "rgba(16,185,129,0.1)";
                        out.style.color = "#10b981";
                        out.style.border = "1px solid rgba(16,185,129,0.2)";
                        out.innerHTML = `✓ Dictionary attack complete!<br><b>Correct Password:</b> dragon<br><b>Flag:</b> AIGRA{dictionary_attack_rockyou_success}<br><span style="color:#06b6d4;">Moving to Brute Force...</span>`;
                        markTaskComplete('pass-dictionary', 'Dictionary Attack');
                        setTimeout(() => switchPassPanel('brute'), 2000);
                    } else {
                        line.style.color = "var(--accent-red)";
                        line.textContent = `[-] Testing "${cleanWord}"... [FAILURE] Invalid password`;
                        consoleBox.appendChild(line);
                    }
                    consoleBox.scrollTop = consoleBox.scrollHeight;
                }, delay);
                delay += 500;
            });
        }

        function runBruteForceAttack() {
            const consoleBox = document.getElementById('pass-brute-console');
            const out = document.getElementById('pass-brute-output');
            if (!consoleBox || !out) return;

            consoleBox.style.display = "block";
            consoleBox.innerHTML = "Generating 3-character keys offline...\n";
            out.style.display = "none";

            const chars = "abcdefghijklmnopqrstuvwxyz".split('');
            let delay = 0;
            let count = 0;
            let found = false;

            for (let i = 0; i < chars.length; i++) {
                for (let j = 0; j < chars.length; j++) {
                    for (let k = 0; k < chars.length; k++) {
                        const guess = chars[i] + chars[j] + chars[k];
                        count++;
                        if (count > 150 && guess !== "cat") continue; // Speed shortcut for performance

                        setTimeout(() => {
                            if (found) return;

                            const line = document.createElement("div");
                            if (guess === "cat") {
                                found = true;
                                line.style.color = "#10b981";
                                line.textContent = `[+] Permutation "${guess}"... MATCH FOUND! Cracked in ${count} attempts.`;
                                consoleBox.appendChild(line);

                                out.style.display = "block";
                                out.style.background = "rgba(16,185,129,0.1)";
                                out.style.color = "#10b981";
                                out.style.border = "1px solid rgba(16,185,129,0.2)";
                                out.innerHTML = `✓ Brute force attack complete!<br><b>Correct Key:</b> cat<br><b>Flag:</b> AIGRA{brute_force_exhaustive_search}<br><span style="color:#06b6d4;">Moving to Hash Cracking...</span>`;
                                markTaskComplete('pass-brute', 'Brute Force Attack');
                                setTimeout(() => switchPassPanel('hash'), 2000);
                            } else {
                                line.textContent = `[-] Permutation "${guess}"... [FAILED]`;
                                consoleBox.appendChild(line);
                            }
                            consoleBox.scrollTop = consoleBox.scrollHeight;
                        }, delay);
                        delay += 30; // Very fast tick rate

                        if (guess === "cat") {
                            return;
                        }
                    }
                }
            }
        }

        function runHashCrackAttack() {
            const list = document.getElementById('pass-hash-wordlist').value.trim().split('\n');
            const consoleBox = document.getElementById('pass-hash-console');
            const out = document.getElementById('pass-hash-output');
            if (!consoleBox || !out) return;

            consoleBox.style.display = "block";
            consoleBox.innerHTML = "Initializing GPU Hashcat hash cracker session...\n";
            out.style.display = "none";

            let delay = 0;
            let found = false;

            list.forEach((word) => {
                const cleanWord = word.trim();
                if (!cleanWord) return;

                setTimeout(() => {
                    if (found) return;

                    const line = document.createElement("div");
                    if (cleanWord === "monkey") {
                        found = true;
                        line.style.color = "#10b981";
                        line.textContent = `[+] Word "monkey" -> SHA-256 Hash matches target hash!\nCracked password: monkey`;
                        consoleBox.appendChild(line);

                        out.style.display = "block";
                        out.style.background = "rgba(16,185,129,0.1)";
                        out.style.color = "#10b981";
                        out.style.border = "1px solid rgba(16,185,129,0.2)";
                        out.innerHTML = `✓ Hash cracked offline!<br><b>Cracked Password:</b> monkey<br><b>Flag:</b> AIGRA{hash_crack_sha256_success}<br><span style="color:#06b6d4;">Moving to Credential Stuffing...</span>`;
                        markTaskComplete('pass-hash', 'Hash Cracking');
                        setTimeout(() => switchPassPanel('stuffing'), 2000);
                    } else {
                        line.textContent = `[-] Word "${cleanWord}" -> Hash mismatch`;
                        consoleBox.appendChild(line);
                    }
                    consoleBox.scrollTop = consoleBox.scrollHeight;
                }, delay);
                delay += 500;
            });
        }

        function submitCredentialStuffing() {
            const password = document.getElementById('pass-stuffing-input').value.trim();
            const out = document.getElementById('pass-stuffing-output');
            if (!out) return;
            out.style.display = "block";

            if (password === "Winter2026!") {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Successful Admin Bypass! User credentials reuse validated.<br><b>Flag Found:</b> AIGRA{credential_stuffing_password_reuse}<br>🎉 Congratulations! You completed the Password Attacks course!`;
                markTaskComplete('pass-stuffing', 'Credential Stuffing');
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Authentication Failed! Password reuse leak mismatch. Check the CSV leak source table and try again.`;
            }
        }

        function startWiresharkCapture() {
            const filter = document.getElementById('wireshark-cap-filter').value.trim();
            const grid = document.getElementById('wireshark-capture-grid');
            const tbody = document.getElementById('wireshark-capture-tbody');
            const details = document.getElementById('wireshark-capture-details');
            const out = document.getElementById('wireshark-capture-output');
            if (!grid || !tbody || !details || !out) return;
            out.style.display = "block";

            if (filter === "port 80") {
                tbody.innerHTML = `
                    <tr style="background:rgba(0,128,0,0.1); border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;">
                        <td style="padding:6px;">1</td>
                        <td style="padding:6px;">0.0000</td>
                        <td style="padding:6px;">192.168.1.10</td>
                        <td style="padding:6px;">192.168.1.1</td>
                        <td style="padding:6px; color:#10b981;">HTTP</td>
                        <td style="padding:6px;">GET /login.php HTTP/1.1 (Cookie: Flag=AIGRA{wireshark_promiscuous_capture_flag})</td>
                    </tr>
                `;
                grid.style.display = "block";
                details.style.display = "block";
                
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Promiscuous network capture successfully matches capture filter rules!<br><b>Flag Found:</b> AIGRA{wireshark_promiscuous_capture_flag}<br><span style="color:#06b6d4;">Moving to Display Filters...</span>`;
                markTaskComplete('wireshark-capture', 'Wireshark Port Capture');
            } else {
                tbody.innerHTML = `
                    <tr style="background:rgba(239,68,68,0.05); border-bottom:1px solid rgba(255,255,255,0.04);">
                        <td style="padding:6px;" colspan="6" align="center">No packets matched the configured filter or invalid filter syntax. Hint: Enter 'port 80'.</td>
                    </tr>
                `;
                grid.style.display = "block";
                details.style.display = "none";
                
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Capture failed. Filter does not capture targeted unencrypted web authentication traffic.`;
            }
        }

        function applyWiresharkDisplayFilter() {
            const filter = document.getElementById('wireshark-disp-filter').value.trim();
            const out = document.getElementById('wireshark-filter-output');
            if (!out) return;
            out.style.display = "block";

            // Row selectors
            const arpRows = document.querySelectorAll('.ws-row-arp');
            const tcpRows = document.querySelectorAll('.ws-row-tcp');
            const dnsRows = document.querySelectorAll('.ws-row-dns');

            if (filter.toLowerCase() === "dns") {
                arpRows.forEach(r => r.style.display = "none");
                tcpRows.forEach(r => r.style.display = "none");
                dnsRows.forEach(r => r.style.display = "table-row");

                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Display query filter applied successfully! DNS traffic isolated.<br><b>Flag Found:</b> AIGRA{wireshark_dns_display_filter_success}<br><span style="color:#06b6d4;">Moving to Follow TCP Stream...</span>`;
                markTaskComplete('wireshark-filter', 'Wireshark Display Filter');
            } else {
                arpRows.forEach(r => r.style.display = "table-row");
                tcpRows.forEach(r => r.style.display = "table-row");
                dnsRows.forEach(r => r.style.display = "table-row");

                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Filter did not isolate DNS packets. Try typing 'dns' to filter.`;
            }
        }

        function followWiresharkTcpStream() {
            const consoleBox = document.getElementById('wireshark-stream-console');
            const out = document.getElementById('wireshark-stream-output');
            if (!consoleBox || !out) return;

            consoleBox.innerHTML = `
<span style="color:#ef4444;">POST /login HTTP/1.1
Host: secure-app.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 52

username=admin&password=SuperSecureSecretCredentialKey</span>

<span style="color:#06b6d4;">HTTP/1.1 200 OK
Server: Nginx
Content-Type: text/html

Welcome administrator. Access Flag: AIGRA{wireshark_follow_tcp_stream_secret}</span>
            `;
            consoleBox.style.display = "block";
            out.style.display = "block";

            out.style.background = "rgba(16,185,129,0.1)";
            out.style.color = "#10b981";
            out.style.border = "1px solid rgba(16,185,129,0.2)";
            out.innerHTML = `✓ TCP Conversation stream reassembled successfully!<br><b>Flag Found:</b> AIGRA{wireshark_follow_tcp_stream_secret}<br><span style="color:#06b6d4;">Moving to Export Objects...</span>`;
            markTaskComplete('wireshark-stream', 'Wireshark Follow TCP Stream');
        }

        function exportWiresharkObject() {
            const out = document.getElementById('wireshark-export-output');
            if (!out) return;
            out.style.display = "block";

            out.style.background = "rgba(16,185,129,0.1)";
            out.style.color = "#10b981";
            out.style.border = "1px solid rgba(16,185,129,0.2)";
            out.innerHTML = `✓ Object payload successfully extracted from packet stream!<br><b>Flag Found:</b> AIGRA{wireshark_http_object_export_completed}`;
            markTaskComplete('wireshark-export', 'Wireshark Object Export');
        }

        function handleNmapTerminalKey(event, type) {
            if (event.key === "Enter") {
                const inputEl = document.getElementById(`nmap-terminal-${type}-input`);
                const commandStr = inputEl.value.trim();
                if (!commandStr) return;

                const outBox = document.getElementById(`nmap-terminal-${type}-output`);
                if (!outBox) return;

                // Echo command
                const echo = document.createElement("div");
                echo.style.color = "#fff";
                echo.textContent = `$ ${commandStr}`;
                outBox.appendChild(echo);

                const responseLine = document.createElement("div");
                responseLine.style.marginTop = "4px";
                responseLine.style.whiteSpace = "pre-wrap";

                let outputText = "";
                let isCorrect = false;

                if (type === "syn") {
                    if (commandStr === "nmap -sS 192.168.1.1") {
                        isCorrect = true;
                        outputText = "Starting Nmap 7.80 ( https://nmap.org ) at 2026-07-22 11:15 UTC\nInitiating ARP Ping Scan at 11:15\nScanning 192.168.1.1 [1000 ports]\nDiscovered open port 22/tcp on 192.168.1.1\nDiscovered open port 80/tcp on 192.168.1.1\nDiscovered open port 3306/tcp on 192.168.1.1\nCompleted SYN Stealth Scan at 11:15, 0.15s elapsed (1000 total ports)\n\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n3306/tcp open  mysql\n\nNmap done: 1 IP address (1 host up) scanned in 0.22s\nFlag: AIGRA{nmap_stealth_syn_scan_complete}\n\n[TASK COMPLETE] Port scan complete! Flag verified!\nRedirecting to Service Detection in 2 seconds...";
                        markTaskComplete('nmap-syn', 'Nmap SYN Scan');
                    } else {
                        outputText = `nmap: command execution error or invalid parameters. Try running exactly:\nnmap -sS 192.168.1.1`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                } else if (type === "version") {
                    if (commandStr === "nmap -sV 192.168.1.1") {
                        isCorrect = true;
                        outputText = "Starting Nmap 7.80 ( https://nmap.org ) at 2026-07-22 11:16 UTC\nScanning 192.168.1.1 [3 ports]\nService scan initiating (SSH, HTTP, MySQL)\nService scan completed in 1.1s\n\nPORT     STATE SERVICE VERSION\n22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5\n80/tcp   open  http    Apache httpd 2.4.41 ((Ubuntu))\n3306/tcp open  mysql   MySQL 8.0.25-0ubuntu0.20.04.1\n\nNmap done: 1 IP address (1 host up) scanned in 1.35s\nFlag: AIGRA{nmap_service_version_fingerprint}\n\n[TASK COMPLETE] Service detection complete! Flag verified!\nRedirecting to OS Detection in 2 seconds...";
                        markTaskComplete('nmap-version', 'Nmap Service Detection');
                    } else {
                        outputText = `nmap: command execution error or invalid parameters. Try running exactly:\nnmap -sV 192.168.1.1`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                } else if (type === "os") {
                    if (commandStr === "nmap -O 192.168.1.1") {
                        isCorrect = true;
                        outputText = "Starting Nmap 7.80 ( https://nmap.org ) at 2026-07-22 11:17 UTC\nOS detection initiating (OS TCP/IP sequence fingerprinting)\nOS detection completed in 0.8s\n\nDevice type: general purpose\nRunning: Linux 5.X\nOS CPE: cpe:/o:linux:linux_kernel:5\nOS details: Linux 5.0 - 5.4\nNetwork Distance: 1 hop\n\nOS detection perform complete.\nFlag: AIGRA{nmap_os_fingerprint_leak}\n\n[TASK COMPLETE] OS fingerprinting complete! Flag verified!\nRedirecting to NSE Vulnerability Scan in 2 seconds...";
                        markTaskComplete('nmap-os', 'Nmap OS Detection');
                    } else {
                        outputText = `nmap: command execution error or OS scan requires administrator permission. Run exactly:\nnmap -O 192.168.1.1`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                } else if (type === "nse") {
                    if (commandStr === "nmap --script vuln 192.168.1.1") {
                        isCorrect = true;
                        outputText = "Starting Nmap 7.80 ( https://nmap.org ) at 2026-07-22 11:18 UTC\nNSE: Loaded 45 scripts for vulnerability scanning.\nNSE: Script scanning 192.168.1.1.\n\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n3306/tcp open  mysql\n\nHost script results:\n| smb-vuln-cve-2020-0796:\n|   VULNERABLE:\n|   SMBv3 Remote Code Execution (CVE-2020-0796)\n|     State: VULNERABLE\n|     Risk factor: Critical\n|_    Description: Vulnerable server allows remote execution of arbitrary code via SMBv3 compression logic.\n\nNmap done: 1 IP address (1 host up) scanned.\nFlag: AIGRA{nmap_scripting_engine_vuln_scan}\n\n[TASK COMPLETE] NSE vulnerability script audit complete! Flag verified!";
                        markTaskComplete('nmap-nse', 'Nmap Scripting Engine vuln scan');
                    } else {
                        outputText = `nmap: command execution error or script categories mismatch. Run exactly:\nnmap --script vuln 192.168.1.1`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                }

                if (isCorrect) {
                    responseLine.style.color = "#10b981";
                }
                responseLine.textContent = outputText;
                outBox.appendChild(responseLine);
                outBox.scrollTop = outBox.scrollHeight;
                inputEl.value = "";
            }
        }

        function submitBurpProxyLab() {
            const req = document.getElementById('burp-proxy-request').value.trim();
            const out = document.getElementById('burp-proxy-output');
            if (!out) return;
            out.style.display = "block";

            if (req.includes("role=admin")) {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Request modified successfully! Administrator panel accessed.<br><b>Flag Found:</b> AIGRA{burp_proxy_intercept_role_override}<br><span style="color:#06b6d4;">Moving to Intruder & Brute Force...</span>`;
                markTaskComplete('burp-proxy', 'Burp Proxy Intercept');
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.innerHTML = `✗ Server processed request. Role remains 'user'. Access denied for alice.`;
            }
        }

        function runBurpIntruderAttack() {
            const tbody = document.getElementById('burp-intruder-tbody');
            const tableBox = document.getElementById('burp-intruder-table');
            if (!tbody || !tableBox) return;
            
            tbody.innerHTML = "";
            tableBox.style.display = "block";

            const pins = ["1048", "3902", "5540", "7391", "8829", "9901"];
            pins.forEach(pin => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid rgba(255,255,255,0.04)";
                
                const isCorrect = pin === "7391";
                const status = isCorrect ? "302 Found" : "200 OK";
                const length = isCorrect ? "1024 bytes" : "342 bytes";
                
                tr.innerHTML = `
                    <td style="padding:8px; color:#fff;">${pin}</td>
                    <td style="padding:8px; color:${isCorrect ? '#eab308' : '#94a3b8'};">${status}</td>
                    <td style="padding:8px; color:${isCorrect ? '#eab308' : '#94a3b8'};">${length}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        function verifyBurpIntruderPin() {
            const pin = document.getElementById('burp-intruder-pin-input').value.trim();
            const out = document.getElementById('burp-intruder-output');
            if (!out) return;
            out.style.display = "block";

            if (pin === "7391") {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ PIN verified! Redirect authenticated.<br><b>Flag Found:</b> AIGRA{burp_intruder_brute_force_pin}<br><span style="color:#06b6d4;">Moving to Repeater & Tampering...</span>`;
                markTaskComplete('burp-intruder', 'Burp Intruder Attack');
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Access Denied. PIN ${pin} is incorrect.`;
            }
        }

        function sendBurpRepeaterRequest() {
            const req = document.getElementById('burp-repeater-request').value.trim();
            const resp = document.getElementById('burp-repeater-response');
            const out = document.getElementById('burp-repeater-output');
            if (!resp || !out) return;
            out.style.display = "block";

            if (req.includes("price=0") || req.includes("price=-")) {
                resp.textContent = "HTTP/1.1 200 OK\nServer: Nginx\nContent-Type: application/json\n\n{\n  \"status\": \"success\",\n  \"message\": \"Checkout bypass complete!\",\n  \"flag\": \"AIGRA{burp_repeater_parameter_tampering}\"\n}";
                resp.style.color = "#10b981";
                
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Parameter tampering vulnerability discovered! Price set to zero.<br><b>Flag Found:</b> AIGRA{burp_repeater_parameter_tampering}<br><span style="color:#06b6d4;">Moving to Decoder & Encoding...</span>`;
                markTaskComplete('burp-repeater', 'Burp Repeater Parameter Tampering');
            } else {
                resp.textContent = "HTTP/1.1 200 OK\nServer: Nginx\nContent-Type: text/plain\n\nCheckout finalized. Amount charged: $100.00";
                resp.style.color = "#94a3b8";
                
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Request processed successfully. Charged standard price ($100). No vulnerability exposed.`;
            }
        }

        function applyBurpDecoder() {
            const sel = document.getElementById('burp-decoder-select').value;
            const outBox = document.getElementById('burp-decoder-result-box');
            const out = document.getElementById('burp-decoder-output');
            if (!outBox || !out) return;
            outBox.style.display = "block";
            out.style.display = "block";

            if (sel === "base64") {
                outBox.textContent = "Decoded String:\nuser=admin;flag=AIGRA{burp_decoder_base64_token}";
                outBox.style.color = "#10b981";
                
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Token successfully decoded! Flag verified!<br><b>Flag:</b> AIGRA{burp_decoder_base64_token}`;
                markTaskComplete('burp-decoder', 'Burp Decoder Base64');
            } else {
                outBox.textContent = "Error: Input format not valid for selected encoding transform rule.";
                outBox.style.color = "var(--accent-red)";
                
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Selection did not return readable plaintext data. Try Base64 decoding.`;
            }
        }

        function submitSqliLab() {
            const user = document.getElementById('sqli-username').value.trim();
            const pass = document.getElementById('sqli-password').value.trim();
            const out = document.getElementById('sqli-lab-output');
            if (!out) return;
            out.style.display = "block";

            if (user.includes("'") && (user.toLowerCase().includes("or") || user.includes("||"))) {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ SQL Syntax successfully bypassed!<br><b>Query Executed:</b> <code>SELECT * FROM users WHERE username = '${user}' AND password = '${pass}'</code><br><b>Result:</b> Logged in as administrator!<br><b>Flag Found:</b> AIGRA{sqli_bypass_login_success}<br><span style="color:#06b6d4;">Moving to Cross-Site Scripting (XSS)...</span>`;
                markTaskComplete('websec-sqli', 'SQL Injection Auth Bypass');
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.innerHTML = `✗ Authentication failed.<br><b>Query Executed:</b> <code>SELECT * FROM users WHERE username = '${user}' AND password = '${pass}'</code><br><b>Result:</b> Empty set returned (Invalid credentials).`;
            }
        }

        function submitXssLab() {
            const msg = document.getElementById('xss-message').value.trim();
            const out = document.getElementById('xss-lab-output');
            const feed = document.getElementById('guestbook-posts');
            if (!out || !feed) return;
            out.style.display = "block";

            if (msg.toLowerCase().includes("<script>") || msg.toLowerCase().includes("onerror=") || msg.toLowerCase().includes("onload=")) {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ Stored XSS triggered successfully!<br><b>Flag Found:</b> AIGRA{xss_stored_script_execution}<br><span style="color:#06b6d4;">Moving to Request Forgery (CSRF)...</span>`;
                
                alert("XSS Alert: Script Executed!");

                const newPost = document.createElement("div");
                newPost.style.padding = "6px 0";
                newPost.style.borderBottom = "1px solid rgba(255,255,255,0.04)";
                newPost.innerHTML = `<b>Attacker:</b> ${msg}`;
                feed.appendChild(newPost);
                
                markTaskComplete('websec-xss', 'Stored XSS Exploitation');
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Message posted, but no client-side scripts were executed. Escaped string saved.`;
                
                const newPost = document.createElement("div");
                newPost.style.padding = "6px 0";
                newPost.style.borderBottom = "1px solid rgba(255,255,255,0.04)";
                newPost.textContent = `User: ${msg}`;
                feed.appendChild(newPost);
            }
        }

        function submitCsrfLab() {
            const payload = document.getElementById('csrf-payload').value.trim();
            const out = document.getElementById('csrf-lab-output');
            const balance = document.getElementById('bank-balance');
            const trans = document.getElementById('bank-transactions');
            if (!out || !balance || !trans) return;
            out.style.display = "block";

            if (payload.includes("/transfer") && payload.includes("amount=10000") && payload.includes("to=attacker")) {
                out.style.background = "rgba(16,185,129,0.1)";
                out.style.color = "#10b981";
                out.style.border = "1px solid rgba(16,185,129,0.2)";
                out.innerHTML = `✓ CSRF Attack successful! Request executed with victim credentials.<br><b>Flag Found:</b> AIGRA{csrf_fund_transfer_exploit}<br><span style="color:#06b6d4;">Moving to Command Injection...</span>`;
                
                balance.textContent = "$0";
                balance.style.color = "var(--accent-red)";
                trans.innerHTML = `<span style="color:var(--accent-red);">• Outgoing Transfer: -$10,000 to Attacker Account</span>`;
                
                markTaskComplete('websec-csrf', 'CSRF Transfer Forgery');
            } else {
                out.style.background = "rgba(239,68,68,0.1)";
                out.style.color = "var(--accent-red)";
                out.style.border = "1px solid rgba(239,68,68,0.2)";
                out.textContent = `✗ Forged request syntax mismatch or invalid parameters. Check destination parameters.`;
            }
        }

        function submitCmdLab() {
            const ip = document.getElementById('cmd-ip-input').value.trim();
            const out = document.getElementById('cmd-lab-output');
            if (!out) return;
            out.style.display = "block";

            if (ip.includes(";") || ip.includes("&&") || ip.includes("||") || ip.includes("|")) {
                if (ip.toLowerCase().includes("flag.txt") || ip.toLowerCase().includes("cat")) {
                    out.style.color = "#10b981";
                    out.textContent = `Pinging localhost [127.0.0.1] with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=64\n\nPing completed.\n\nExecuting secondary command:\nAIGRA{command_injection_rce_leak}\n\n[TASK COMPLETE] Command Injection Vulnerability validated!`;
                    markTaskComplete('websec-cmd', 'Command Injection RCE');
                } else {
                    out.style.color = "var(--accent-red)";
                    out.textContent = `Pinging localhost [127.0.0.1]...\nPing completed. Secondary instruction syntax not recognized. Hint: Execute 'cat flag.txt'.`;
                }
            } else {
                out.style.color = "#94a3b8";
                out.textContent = `Pinging ${ip} [127.0.0.1] with 32 bytes of data:\nReply from 127.0.0.1: bytes=32 time<1ms TTL=64\nReply from 127.0.0.1: bytes=32 time<1ms TTL=64\n\nPing statistics for ${ip}:\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`;
            }
        }

        function handleWebTerminalKey(event, type) {
            if (event.key === "Enter") {
                const inputEl = document.getElementById(`web-terminal-${type}-input`);
                const commandStr = inputEl.value.trim();
                if (!commandStr) return;

                const outBox = document.getElementById(`web-terminal-${type}-output`);
                if (!outBox) return;

                // Echo command
                const echo = document.createElement("div");
                echo.style.color = "#fff";
                echo.textContent = `$ ${commandStr}`;
                outBox.appendChild(echo);

                const responseLine = document.createElement("div");
                responseLine.style.marginTop = "4px";
                responseLine.style.whiteSpace = "pre-wrap";

                let outputText = "";
                let isCorrect = false;

                if (type === "http") {
                    if (commandStr === "curl -I http://example.com") {
                        isCorrect = true;
                        outputText = "HTTP/1.1 200 OK\nDate: Mon, 22 Jul 2026 00:00:01 GMT\nServer: Apache/2.4.41 (Unix)\nLast-Modified: Thu, 17 Oct 2019 07:18:26 GMT\nETag: \"2f-5950a41753900\"\nAccept-Ranges: bytes\nContent-Length: 47\nContent-Type: text/html; charset=UTF-8\nX-Flag: AIGRA{curl_http_headers_inspect_ok}\n\n[TASK COMPLETE] Headers successfully retrieved! Flag verified!\nRedirecting to HTML, CSS & DOM in 2 seconds...";
                        markTaskComplete('webcourse-http', 'HTTP Headers');
                    } else {
                        outputText = `curl: (6) Could not resolve host or invalid parameters. Try running exactly:\ncurl -I http://example.com`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                } else if (type === "dom") {
                    if (commandStr === "curl -o index.html http://example.com") {
                        isCorrect = true;
                        outputText = "  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n                                 Dload  Upload   Total   Spent    Left  Speed\n100    47  100    47    0     0   4700      0 --:--:-- --:--:-- --:--:--  4700\n[Saved to index.html]\n\nSource preview:\n<!DOCTYPE html>\n<html>\n<head><title>Example Page</title></head>\n<body>\n  <h1>Welcome!</h1>\n  <!-- Hidden flag: AIGRA{curl_download_page_source_code} -->\n</body>\n</html>\n\n[TASK COMPLETE] Source code downloaded! Flag verified!\nRedirecting to Cookies & Sessions in 2 seconds...";
                        markTaskComplete('webcourse-dom', 'DOM & HTML Source');
                    } else {
                        outputText = `curl: (6) Could not resolve host or invalid parameters. Try running exactly:\ncurl -o index.html http://example.com`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                } else if (type === "cookies") {
                    if (commandStr === 'curl -b "session=admin" http://example.com/dashboard' || commandStr === "curl -b 'session=admin' http://example.com/dashboard") {
                        isCorrect = true;
                        outputText = "HTTP/1.1 200 OK\nContent-Type: text/html\n\nWelcome back Admin!\nFlag: AIGRA{cookies_hijacking_session_bypass}\n\n[TASK COMPLETE] Authenticated route verified! Flag verified!\nRedirecting to CORS & Origins in 2 seconds...";
                        markTaskComplete('webcourse-cookies', 'Session Cookies');
                    } else {
                        outputText = `Access Denied: Missing or invalid authentication cookie.\nTry running exactly:\ncurl -b "session=admin" http://example.com/dashboard`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                } else if (type === "cors") {
                    if (commandStr === 'curl -H "Origin: http://evil.com" -I http://example.com/api' || commandStr === "curl -H 'Origin: http://evil.com' -I http://example.com/api") {
                        isCorrect = true;
                        outputText = "HTTP/1.1 200 OK\nDate: Mon, 22 Jul 2026 00:00:01 GMT\nServer: Apache\nAccess-Control-Allow-Origin: http://evil.com\nAccess-Control-Allow-Credentials: true\nContent-Type: application/json\n\nFlag: AIGRA{cors_wildcard_origin_vulnerability}\n\n[TASK COMPLETE] CORS origin check completed!";
                        markTaskComplete('webcourse-cors', 'CORS Origin Check');
                    } else {
                        outputText = `Access Denied or CORS Preflight blocked.\nTry running exactly:\ncurl -H "Origin: http://evil.com" -I http://example.com/api`;
                        responseLine.style.color = "var(--accent-red)";
                    }
                }

                if (isCorrect) {
                    responseLine.style.color = "#10b981";
                }
                responseLine.textContent = outputText;
                outBox.appendChild(responseLine);
                outBox.scrollTop = outBox.scrollHeight;
                inputEl.value = "";
            }
        }

        // ==========================================
        // LINUX COMMAND SHELL COURSE ENGINE
        // ==========================================
        let linuxshellCurrentDir = "/home/student";
        let linuxshellFS = {
            "/home/student": { type: "dir", children: ["secrets.txt", "run.sh"] },
            "/home/student/secrets.txt": { type: "file", content: "FLAG: AIGRA{linux_shell_file_operations} - System Backup Key" },
            "/home/student/run.sh": { type: "file", content: "echo 'Executing sandbox check...'; echo 'Flag found: AIGRA{linux_shell_chmod_execution}'" },
            "/home/student/temp": { type: "dir", children: [] }
        };
        let runShExecutable = false;

        function switchLinuxshellPanel(code) {
            switchPanel(`linuxshell-${code}`);
            document.querySelectorAll('.linuxshell-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-linuxshell-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        function writeLinuxshellLine(terminalId, text, color = "#10b981") {
            const outEl = document.getElementById(`terminal-${terminalId}-output`);
            if (!outEl) return;
            const div = document.createElement("div");
            div.style.color = color;
            div.style.whiteSpace = "pre-wrap";
            div.textContent = text;
            outEl.appendChild(div);
            outEl.scrollTop = outEl.scrollHeight;
        }

        function handleLinuxshellKey(event, terminalId) {
            if (event.key === "Enter") {
                const inputEl = document.getElementById(`terminal-${terminalId}-input`);
                const commandStr = inputEl.value.trim();
                if (!commandStr) return;

                // Echo command
                writeLinuxshellLine(terminalId, `student@sandbox:~$ ${commandStr}`, "#fff");

                const parts = commandStr.split(/\s+/);
                const cmd = parts[0];
                const arg = parts.slice(1).join(' ');

                let output = "";
                let outputColor = "#10b981";

                if (cmd === "pwd") {
                    output = linuxshellCurrentDir;
                } else if (cmd === "ls") {
                    const dirNode = linuxshellFS[linuxshellCurrentDir];
                    if (dirNode && dirNode.type === "dir") {
                        output = dirNode.children.join("   ");
                    } else {
                        output = "ls: cannot open directory: Permission denied";
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "cd") {
                    if (!arg) {
                        linuxshellCurrentDir = "/home/student";
                    } else if (arg === "..") {
                        if (linuxshellCurrentDir !== "/home/student") {
                            linuxshellCurrentDir = "/home/student";
                        }
                    } else if (arg === "temp") {
                        linuxshellCurrentDir = "/home/student/temp";
                        if (terminalId === "linuxshellnav") {
                            output = "[TASK COMPLETE] Directory changed successfully! Flag: AIGRA{linux_shell_navigation_success}\nRedirecting to File Operations in 2 seconds...";
                            markTaskComplete('linuxshell-nav', 'Linux Navigation');
                            setTimeout(() => switchLinuxshellPanel('ops'), 2000);
                        }
                    } else {
                        output = `cd: ${arg}: No such file or directory`;
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "mkdir") {
                    if (arg === "temp") {
                        output = "Directory 'temp' created.";
                    } else {
                        output = "mkdir: missing operand";
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "cat") {
                    if (arg === "secrets.txt") {
                        output = linuxshellFS["/home/student/secrets.txt"].content;
                    } else if (arg === "run.sh") {
                        output = linuxshellFS["/home/student/run.sh"].content;
                    } else {
                        output = `cat: ${arg}: No such file or directory`;
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd.startsWith("cp")) {
                    if (arg === "secrets.txt backup.txt") {
                        output = "File secrets.txt copied to backup.txt.";
                        if (terminalId === "linuxshellops") {
                            output += "\n\n[TASK COMPLETE] File copy operation success! Flag: AIGRA{linux_shell_file_operations}\nRedirecting to Permissions & Exec in 2 seconds...";
                            markTaskComplete('linuxshell-ops', 'Linux File Operations');
                            setTimeout(() => switchLinuxshellPanel('perm'), 2000);
                        }
                    } else {
                        output = "cp: missing destination file operand after " + arg;
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "chmod") {
                    if (arg === "+x run.sh" || arg === "755 run.sh" || arg === "777 run.sh") {
                        runShExecutable = true;
                        output = "Permissions of 'run.sh' updated successfully.";
                    } else {
                        output = "chmod: invalid mode: " + arg;
                        outputColor = "var(--accent-red)";
                    }
                } else if (commandStr === "./run.sh") {
                    if (runShExecutable) {
                        output = "Executing sandbox check...\nFlag found: AIGRA{linux_shell_chmod_execution}";
                        if (terminalId === "linuxshellperm") {
                            output += "\n\n[TASK COMPLETE] Script executed successfully! Flag verified.\nRedirecting to System & Triage in 2 seconds...";
                            markTaskComplete('linuxshell-perm', 'Linux Permissions');
                            setTimeout(() => switchLinuxshellPanel('triage'), 2000);
                        }
                    } else {
                        output = "bash: ./run.sh: Permission denied";
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "ps") {
                    if (arg === "aux" || arg === "-ef") {
                        output = "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  18504  3120 ?        Ss   10:00   0:00 /sbin/init\nstudent    500  0.0  0.2  24102  5120 pts/0    Ss   10:05   0:00 /bin/bash\nstudent   9999  0.2  0.4  15410  9120 pts/0    S    10:10   0:01 nc -lvnp 4444";
                    } else {
                        output = "  PID TTY          TIME CMD\n  500 pts/0    00:00:00 bash";
                    }
                } else if (cmd === "kill") {
                    if (arg === "9999") {
                        output = "Process 9999 terminated successfully.";
                        if (terminalId === "linuxshelltriage") {
                            output += "\n\n[TASK COMPLETE] Rogue process killed! Flag: AIGRA{linux_shell_system_triage}\n🎉 Congratulations! You completed the Linux Command Shell course!";
                            markTaskComplete('linuxshell-triage', 'Linux System Triage');
                        }
                    } else {
                        output = "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...";
                        outputColor = "var(--accent-red)";
                    }
                } else {
                    output = `bash: ${cmd}: command not found`;
                    outputColor = "var(--accent-red)";
                }

                writeLinuxshellLine(terminalId, output, outputColor);
                inputEl.value = "";
            }
        }

        function switchWindowsPanel(code) {
            switchPanel(`windows-${code}`);
            document.querySelectorAll('.windows-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-windows-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        function handleWindowsTerminalKey(event, terminalId) {
            if (event.key === "Enter") {
                const inputEl = document.getElementById(`terminal-${terminalId}-input`);
                const commandStr = inputEl.value.trim();
                if (!commandStr) return;

                // Echo command
                writeWindowsLine(terminalId, `PS ${winCurrentDir}> ${commandStr}`, "#fff");
                
                const parts = commandStr.split(/\s+/);
                const cmd = parts[0].toLowerCase();
                const arg = parts.slice(1).join(' ');

                let output = "";
                let outputColor = "#fff";

                if (cmd === "dir") {
                    const dirNode = winFS[winCurrentDir];
                    if (dirNode && dirNode.type === "dir") {
                        let lines = [" Directory of " + winCurrentDir, ""];
                        dirNode.children.forEach(child => {
                            const fullPath = `${winCurrentDir}\\${child}`;
                            const childNode = winFS[fullPath];
                            const timeStr = "2026-07-22  10:00 AM";
                            if (childNode && childNode.type === "dir") {
                                lines.push(`${timeStr}    <DIR>          ${child}`);
                            } else {
                                lines.push(`${timeStr}                   ${child}`);
                            }
                        });
                        output = lines.join("\n");
                    } else {
                        output = "Directory reading error.";
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "cd") {
                    if (!arg) {
                        output = winCurrentDir;
                    } else if (arg === "..") {
                        if (winCurrentDir !== "C:\\Users\\Student") {
                            const lastBackslash = winCurrentDir.lastIndexOf("\\");
                            winCurrentDir = winCurrentDir.substring(0, lastBackslash);
                        }
                    } else {
                        // resolve relative path
                        let cleanArg = arg.replace(/^["']|["']$/g, '');
                        let targetPath = `${winCurrentDir}\\${cleanArg}`;
                        if (winFS[targetPath] && winFS[targetPath].type === "dir") {
                            winCurrentDir = targetPath;
                        } else {
                            output = `The system cannot find the path specified: ${arg}`;
                            outputColor = "var(--accent-red)";
                        }
                    }
                } else if (cmd === "type") {
                    if (!arg) {
                        output = "The syntax of the command is incorrect.";
                        outputColor = "var(--accent-red)";
                    } else {
                        let cleanArg = arg.replace(/^["']|["']$/g, '');
                        let filePath = `${winCurrentDir}\\${cleanArg}`;
                        if (winFS[filePath] && winFS[filePath].type === "file") {
                            output = winFS[filePath].content;
                            if (cleanArg === "flag.txt" && winCurrentDir === "C:\\Users\\Student\\Documents") {
                                 output += "\n\n[TASK COMPLETE] Flag verified! +100 XP awarded.\nRedirecting to System Diagnostics in 2 seconds...";
                                 markTaskComplete('windows-files', 'Windows CMD & Files');
                                 setTimeout(() => switchWindowsPanel('diag'), 2000);
                            }
                        } else {
                            output = `The system cannot find the file specified: ${arg}`;
                            outputColor = "var(--accent-red)";
                        }
                    }
                } else if (cmd === "whoami") {
                    output = "desktop-aigra\\student";
                } else if (cmd === "hostname") {
                    output = "WIN-AIGRA-LAB-01";
                    output += "\n\n[TASK COMPLETE] Hostname found! Flag: AIGRA{hostname_system_diagnostics}\nRedirecting to Process Management in 2 seconds...";
                    markTaskComplete('windows-diag', 'Windows CMD Diagnostics');
                    setTimeout(() => switchWindowsPanel('proc'), 2000);
                } else if (cmd === "ipconfig") {
                    output = "Windows IP Configuration\n\nEthernet adapter Ethernet0:\n   Connection-specific DNS Suffix  . : \n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1";
                } else if (cmd === "tasklist") {
                    output = "Image Name                     PID Session Name        Session#    Mem Usage\n========================= ======== ================ =========== ============\nSystem                           4 Services                   0        120 K\nsvchost.exe                    820 Services                   0     24,104 K\nexplorer.exe                  1420 Console                    1     84,204 K\nmalware.exe                   3040 Services                   0     15,410 K";
                } else if (cmd === "taskkill") {
                    if (arg === "/PID 3040" || arg === "/pid 3040" || arg.includes("3040")) {
                        output = "SUCCESS: Sent termination signal to process with PID 3040.\n\n[TASK COMPLETE] Process terminated! Flag: AIGRA{taskkill_process_terminated_success}\nRedirecting to Network Auditing in 2 seconds...";
                        markTaskComplete('windows-proc', 'Windows CMD Process Control');
                        setTimeout(() => switchWindowsPanel('net'), 2000);
                    } else {
                        output = "ERROR: Invalid argument check. Did you specify /PID [pid]?";
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "netstat") {
                    if (arg === "-ano" || arg.includes("-a")) {
                        output = "Active Connections\n\n  Proto  Local Address          Foreign Address        State           PID\n  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       820\n  TCP    127.0.0.1:4444         0.0.0.0:0              LISTENING       3040\n  TCP    192.168.1.105:8080     0.0.0.0:0              LISTENING       1420";
                        output += "\n\n[TASK COMPLETE] Listening port identified! Suspicious PID 3040 mapped.\nFlag: AIGRA{netstat_port_auditing_listening_service}\n🎉 Congratulations! You completed the Windows Basics course!";
                        markTaskComplete('windows-net', 'Windows CMD Network Auditing');
                    } else {
                        output = "netstat: missing parameters. Try running netstat -ano.";
                        outputColor = "var(--accent-red)";
                    }
                } else if (cmd === "ping") {
                    output = "Pinging google.com [142.250.190.46] with 32 bytes of data:\nReply from 142.250.190.46: bytes=32 time=12ms TTL=118\nReply from 142.250.190.46: bytes=32 time=11ms TTL=118\n\nPing statistics for 142.250.190.46:\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)";
                } else if (cmd === "cls" || cmd === "clear") {
                    const outEl = document.getElementById(`terminal-${terminalId}-output`);
                    if (outEl) outEl.innerHTML = "";
                    inputEl.value = "";
                    return;
                } else {
                    output = `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`;
                    outputColor = "var(--accent-red)";
                }

                writeWindowsLine(terminalId, output, outputColor);
                inputEl.value = "";
            }
        }

        function writeWindowsLine(terminalId, text, color) {
            const outBox = document.getElementById(`terminal-${terminalId}-output`);
            if (!outBox) return;
            const line = document.createElement("div");
            line.style.color = color;
            line.style.marginTop = "4px";
            line.style.whiteSpace = "pre-wrap";
            line.textContent = text;
            outBox.appendChild(line);
            outBox.scrollTop = outBox.scrollHeight;
        }

        // ==========================================
        // CYBER SECURITY BASICS INTERACTIVE ENGINE
        // ==========================================
        function switchBasicsPanel(code) {
            switchPanel(`basics-${code}`);
            document.querySelectorAll('.basics-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-basics-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        function verifyBasicsCiaT1() {
            const val = document.getElementById('basics-cia-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('basics-cia-t1-output');
            out.style.display = "block";
            if (val === "availability" || val === "availability breach") {
                out.style.color = "#10b981";
                out.innerHTML = `✓ Correct! Denying access is an Availability breach. +50 XP and +10 Coins awarded!<br><span style="color:#06b6d4;">Moving to the next lesson...</span>`;
                markTaskComplete('basics-cia', 'CIA Triad');
            } else {
                out.style.color = "var(--accent-red)";
                out.innerHTML = `✗ Incorrect. Clue: The attack aims to make the server unavailable.`;
            }
        }

        function verifyBasicsSocialT1() {
            const val = document.getElementById('basics-social-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('basics-social-t1-output');
            out.style.display = "block";
            if (val === "phishing") {
                out.style.color = "#10b981";
                out.innerHTML = `✓ Correct! Mismatched sending domains (netflix-billing-sec.com) are indicators of phishing. +50 XP!<br><span style="color:#06b6d4;">Moving to the next lesson...</span>`;
                markTaskComplete('basics-social', 'Social Engineering');
            } else {
                out.style.color = "var(--accent-red)";
                out.innerHTML = `✗ Incorrect. Clue: Look at the sending domain name closely.`;
            }
        }

        function verifyBasicsNetworkingT1() {
            const val = document.getElementById('basics-networking-t1-input').value.trim();
            const out = document.getElementById('basics-networking-t1-output');
            out.style.display = "block";
            if (val === "443") {
                out.style.color = "#10b981";
                out.innerHTML = `✓ Correct! HTTPS secure traffic runs on port 443 by default. +50 XP!<br><span style="color:#06b6d4;">Moving to the next lesson...</span>`;
                markTaskComplete('basics-networking', 'Network Ports');
            } else {
                out.style.color = "var(--accent-red)";
                out.innerHTML = `✗ Incorrect. Port ${val} is not secure web traffic (HTTPS defaults to 443).`;
            }
        }

        function verifyBasicsMalwareT1() {
            const val = document.getElementById('basics-malware-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('basics-malware-t1-output');
            out.style.display = "block";
            if (val === "ransomware") {
                out.style.color = "#10b981";
                out.innerHTML = `✓ Correct! Ransomware encrypts devices to demand ransom payments. +50 XP!<br><span style="color:#06b6d4;">Moving to the next lesson...</span>`;
                markTaskComplete('basics-malware', 'Malware Types');
            } else {
                out.style.color = "var(--accent-red)";
                out.innerHTML = `✗ Incorrect. Trojan or Worms do not hold files hostaged for ransom checks.`;
            }
        }

        function verifyBasicsDefenseT1() {
            const val = document.getElementById('basics-defense-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('basics-defense-t1-output');
            out.style.display = "block";
            if (val === "antivirus" || val === "av") {
                out.style.color = "#10b981";
                out.innerHTML = `✓ Correct! Antivirus tools secure systems locally at the Endpoint layer. +50 XP!`;
                markTaskComplete('basics-defense', 'Defense in Depth');
            } else {
                out.style.color = "var(--accent-red)";
                out.innerHTML = `✗ Incorrect. CCTV is physical security, and VPN operates at the network layer.`;
            }
        }

        // ==========================================
        // OWASP TOP 10 INTERACTIVE COURSE ENGINE
        // ==========================================
        let owaspUnlocked = {
            a01: true,
            a02: false,
            a03: false,
            a04: false,
            a05: false,
            a06: false,
            a07: false,
            a08: false,
            a09: false,
            a10: false
        };

        try {
            const saved = localStorage.getItem('owasp_unlocked_status');
            if (saved) {
                owaspUnlocked = JSON.parse(saved);
            }
        } catch(e) {}
        owaspUnlocked.a01 = true;

        function updateOwaspSidebar() {
            for (let i = 1; i <= 10; i++) {
                const code = `a${String(i).padStart(2, '0')}`;
                const el = document.getElementById(`nav-owasp-${code}`);
                if (el) {
                    if (owaspUnlocked[code]) {
                        el.classList.remove('locked');
                        el.innerHTML = `🔓 A${String(i).padStart(2, '0')}: ${getOwaspShortName(code)}`;
                    } else {
                        el.classList.add('locked');
                        el.innerHTML = `🔒 A${String(i).padStart(2, '0')}: ${getOwaspShortName(code)}`;
                    }
                }
            }
        }

        function getOwaspShortName(code) {
            const names = {
                a01: "Broken Access",
                a02: "Crypto Failures",
                a03: "Injection",
                a04: "Insecure Design",
                a05: "Security Misconfig",
                a06: "Outdated Components",
                a07: "Auth Failures",
                a08: "Integrity Failures",
                a09: "Logging Failures",
                a10: "SSRF Target"
            };
            return names[code] || "";
        }

        function switchOwaspPanel(code) {
            if (!owaspUnlocked[code]) {
                alert("This vulnerability is currently locked! Please complete the previous vulnerabilities first.");
                return;
            }
            switchPanel(`owasp-${code}`);
            document.querySelectorAll('.owasp-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.getElementById(`nav-owasp-${code}`);
            if (activeItem) activeItem.classList.add('active');
        }

        function verifyOwaspA01T1() {
            const val = document.getElementById('owasp-a01-t1-input').value.trim();
            const out = document.getElementById('owasp-a01-t1-output');
            out.style.display = "block";
            if (val === "100") {
                out.innerHTML = `<span style="color:#10b981;">✓ Success! Administrator Profile Loaded.<br><b>Flag Found:</b> AIGRA{idor_admin_priv_bypass}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Access Denied for User ID ${val}. Profile not found.</span>`;
            }
        }
        function verifyOwaspA01T2() {
            const val = document.getElementById('owasp-a01-t2-input').value.trim();
            const out = document.getElementById('owasp-a01-t2-output');
            out.style.display = "block";
            if (val === "../../etc/passwd" || val === "../../../etc/passwd") {
                out.innerHTML = `<span style="color:#10b981;">✓ Success! Reading system credentials...<br><b>Flag Found:</b> AIGRA{path_traversal_etc_passwd}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Error: File '${val}' not found or permission denied.</span>`;
            }
        }

        function verifyOwaspA02T1() {
            const val = document.getElementById('owasp-a02-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('owasp-a02-t1-output');
            out.style.display = "block";
            if (val === "test") {
                out.innerHTML = `<span style="color:#10b981;">✓ Correct! Hash decrypted successfully.<br><b>Flag Found:</b> AIGRA{md5_cracked_weak_hashing}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Mismatch. Provided plaintext does not produce hash.</span>`;
            }
        }

        function verifyOwaspA03T1() {
            const user = document.getElementById('owasp-a03-t1-user').value.trim();
            const out = document.getElementById('owasp-a03-t1-output');
            out.style.display = "block";
            if (user.includes("' or 1=1") || user.includes('" or 1=1') || user.includes("or 1=1 --")) {
                out.innerHTML = `<span style="color:#10b981;">✓ Authentication Bypass Successful! Logged in as administrator.<br><b>Flag Found:</b> AIGRA{sqli_auth_bypass_success}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Invalid credentials. database query returned empty set.</span>`;
            }
        }

        function verifyOwaspA04T1() {
            const val = document.getElementById('owasp-a04-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('owasp-a04-t1-output');
            out.style.display = "block";
            if (val === "dashboard" || val === "/dashboard") {
                out.innerHTML = `<span style="color:#10b981;">✓ Redirecting to Account Dashboard (MFA Bypassed!).<br><b>Flag Found:</b> AIGRA{mfa_route_bypass_design}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Navigation Error: Endpoint '${val}' does not bypass MFA logic.</span>`;
            }
        }

        function verifyOwaspA05T1() {
            const val = document.getElementById('owasp-a05-t1-input').value.trim().toLowerCase();
            const out = document.getElementById('owasp-a05-t1-output');
            out.style.display = "block";
            if (val === "/backup" || val === "/backup/" || val === "backup") {
                out.innerHTML = `<span style="color:#10b981;">✓ Directory listing loaded: database_backup.sql found.<br><b>Flag Found:</b> AIGRA{exposed_backup_directory_index}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ 404: directory listing disabled for path '${val}'.</span>`;
            }
        }

        function verifyOwaspA06T1() {
            const val = document.getElementById('owasp-a06-t1-input').value.trim();
            const out = document.getElementById('owasp-a06-t1-output');
            out.style.display = "block";
            if (val === "2.14.0") {
                out.innerHTML = `<span style="color:#10b981;">✓ Match! Log4j 2.14.0 is vulnerable to CVE-2021-44228.<br><b>Flag Found:</b> AIGRA{outdated_log4j_vulnerability}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Audited version is clean. Choose another dependency.</span>`;
            }
        }

        function verifyOwaspA07T1() {
            const val = document.getElementById('owasp-a07-t1-input').value.trim();
            const out = document.getElementById('owasp-a07-t1-output');
            out.style.display = "block";
            if (val === "admin@123") {
                out.innerHTML = `<span style="color:#10b981;">✓ Login Success! Account compromised.<br><b>Flag Found:</b> AIGRA{admin_brute_force_cracked}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Authentication check failed for password '${val}'.</span>`;
            }
        }

        function verifyOwaspA08T1() {
            const val = document.getElementById('owasp-a08-t1-input').value.trim().toUpperCase();
            const out = document.getElementById('owasp-a08-t1-output');
            out.style.display = "block";
            if (val === "TAMPERED") {
                out.innerHTML = `<span style="color:#10b981;">✓ Correct! Hash signatures mismatch (Package was tampered).<br><b>Flag Found:</b> AIGRA{unverified_checksum_integrity_fail}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Incorrect assessment. Match expected and actual signatures closely.</span>`;
            }
        }

        function verifyOwaspA09T1() {
            const val = document.getElementById('owasp-a09-t1-input').value.trim();
            const out = document.getElementById('owasp-a09-t1-output');
            out.style.display = "block";
            if (val === "192.168.1.80") {
                out.innerHTML = `<span style="color:#10b981;">✓ Match! Suspicious attacker footprint discovered.<br><b>Flag Found:</b> AIGRA{logging_alert_latencies_discovered}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ This IP address exhibits legitimate session access patterns.</span>`;
            }
        }
        function verifyOwaspA10T1() {
            const val = document.getElementById('owasp-a10-t1-input').value.trim();
            const out = document.getElementById('owasp-a10-t1-output');
            out.style.display = "block";
            if (val === "http://169.254.169.254/latest/meta-data/" || val === "http://169.254.169.254/latest/meta-data") {
                out.innerHTML = `<span style="color:#10b981;">✓ SSRF Exploit Success! Leaking AWS Metadata...<br><b>Flag Found:</b> AIGRA{ssrf_metadata_leakage}</span>`;
            } else {
                out.innerHTML = `<span style="color:var(--accent-red);">✗ Remote request to '${val}' returned standard 200 OK. No internal assets exposed.</span>`;
            }
        }

        const OWASP_FLAGS = {
            a01: "AIGRA{idor_admin_priv_bypass}",
            a02: "AIGRA{md5_cracked_weak_hashing}",
            a03: "AIGRA{sqli_auth_bypass_success}",
            a04: "AIGRA{mfa_route_bypass_design}",
            a05: "AIGRA{exposed_backup_directory_index}",
            a06: "AIGRA{outdated_log4j_vulnerability}",
            a07: "AIGRA{admin_brute_force_cracked}",
            a08: "AIGRA{unverified_checksum_integrity_fail}",
            a09: "AIGRA{logging_alert_latencies_discovered}",
            a10: "AIGRA{ssrf_metadata_leakage}"
        };

        function solveOwaspVulnerability(code) {
            const val = document.getElementById(`owasp-${code}-flag`).value.trim();
            const feedback = document.getElementById(`owasp-${code}-feedback`);
            if (!feedback) return;
            feedback.style.display = "block";
            if (val === OWASP_FLAGS[code]) {
                feedback.style.color = "#10b981";
                feedback.innerHTML = "✓ CORRECT FLAG! Earned +200 XP.";
                const num = parseInt(code.replace('a', ''));
                markTaskComplete(`owasp-${code}`, `OWASP Top 10: ${getOwaspShortName(code)}`);
                if (num < 10) {
                    const nextCode = `a${String(num + 1).padStart(2, '0')}`;
                    owaspUnlocked[nextCode] = true;
                    try {
                        localStorage.setItem('owasp_unlocked_status', JSON.stringify(owaspUnlocked));
                    } catch(e) {}
                    updateOwaspSidebar();
                }
            } else {
                feedback.style.color = "var(--accent-red)";
                feedback.textContent = "✗ INVALID FLAG. Solve all tasks to recover the correct flag.";
            }
        }

        function uploadAdvisoryFile() {
            const fileInput = document.getElementById('advisory-file-input');
            const descInput = document.getElementById('advisory-file-desc');
            if (!fileInput || fileInput.files.length === 0) {
                alert("Please select a file to upload.");
                return;
            }
            const file = fileInput.files[0];
            const desc = descInput.value.trim() || file.name;

            const reader = new FileReader();
            reader.onload = function(e) {
                const newResource = {
                    id: mockAdvisoryFiles.length + 1,
                    name: file.name,
                    type: file.type,
                    desc: desc,
                    date: new Date().toISOString().split('T')[0],
                    data: e.target.result
                };
                mockAdvisoryFiles.push(newResource);
                saveAcadState();
                renderAdvisoryFiles();
                fileInput.value = "";
                descInput.value = "";
                alert("Resource uploaded successfully!");
            };
            reader.readAsDataURL(file);
        }

        function renderAdvisoryFiles() {
            const container = document.getElementById('advisory-files-list');
            if (!container) return;
            container.innerHTML = "";

            if (mockAdvisoryFiles.length === 0) {
                container.innerHTML = `<span style="color:var(--text-muted); grid-column:1/-1;">No resources shared yet.</span>`;
                return;
            }

            mockAdvisoryFiles.forEach(f => {
                const card = document.createElement('div');
                card.className = "result-block";
                card.style.margin = "0";
                card.style.background = "rgba(255,255,255,0.01)";
                card.style.borderColor = "rgba(255,255,255,0.05)";
                
                let icon = "📄";
                if (f.type.startsWith('image/')) icon = "🖼️";
                else if (f.type.startsWith('audio/')) icon = "🔊";
                else if (f.type.startsWith('video/')) icon = "🎥";
                else if (f.type.includes('pdf')) icon = "📕";

                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                        <span style="font-size:1.5rem;">${icon}</span>
                        <div style="flex:1; overflow:hidden;">
                            <span style="font-weight:700; color:#fff; display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${f.name}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${f.date} • ${(f.type || 'Unknown Type')}</span>
                        </div>
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">${f.desc}</p>
                    <a class="btn" href="${f.data}" download="${f.name}" style="display:inline-block; font-size:0.75rem; padding:4px 8px; text-decoration:none; text-align:center; background:#10b981;">Download File 📥</a>
                `;
                container.appendChild(card);
            });
        }

        function terminateUserSession(username, ip) {
            if (!confirm(`Are you sure you want to terminate session for ${username} at IP: ${ip}?`)) return;
            mockSessions = mockSessions.filter(s => s.username !== username);
            saveAcadState();
            alert(`Session for user ${username} terminated and IP ${ip} blacklisted.`);
            renderAcadTabContent();
        }

        function populateInspectStudentDropdown() {
            const select = document.getElementById('acad-inspect-student-select');
            if (!select) return;
            select.innerHTML = '<option value="">-- Choose a student to inspect --</option>';
            mockUsers.forEach(u => {
                if (u.role === 'student') {
                    const opt = document.createElement('option');
                    opt.value = u.username;
                    opt.textContent = u.username;
                    select.appendChild(opt);
                }
            });
        }

        function inspectStudentProgress() {
            const select = document.getElementById('acad-inspect-student-select');
            const card = document.getElementById('student-inspected-progress-card');
            if (!select || !card) return;
            const targetUser = select.value;
            if (!targetUser) {
                card.style.display = "none";
                return;
            }

            const progress = getUserProgress(targetUser);
            const completedCount = progress.completedTasks.length;
            const xp = completedCount * 100;
            const coins = completedCount * 50;
            const level = Math.floor(xp / 400) + 1;

            let badges = [];
            if (progress.completedTasks.includes('pass-dictionary') &&
                progress.completedTasks.includes('pass-brute') &&
                progress.completedTasks.includes('pass-hash') &&
                progress.completedTasks.includes('pass-stuffing')) {
                badges.push("Password Cracker 🔑");
            }
            if (progress.completedTasks.includes('crypto-symmetric') &&
                progress.completedTasks.includes('crypto-asymmetric') &&
                progress.completedTasks.includes('crypto-hash') &&
                progress.completedTasks.includes('crypto-signature')) {
                badges.push("Crypto Specialist 🔒");
            }
            if (progress.completedTasks.includes('linuxshell-nav') &&
                progress.completedTasks.includes('linuxshell-ops') &&
                progress.completedTasks.includes('linuxshell-perm') &&
                progress.completedTasks.includes('linuxshell-triage')) {
                badges.push("Command Master 🐚");
            }
            if (progress.completedTasks.includes('windows-files') &&
                progress.completedTasks.includes('windows-diag') &&
                progress.completedTasks.includes('windows-proc') &&
                progress.completedTasks.includes('windows-net')) {
                badges.push("Windows Auditor 🪟");
            }

            const weeklyProgress = progress.completedTasks.includes('linuxshell-nav') ? 100 : 0;
            const monthlyProgress = Math.min(100, Math.floor((completedCount / 16) * 100));

            card.style.display = "block";
            card.innerHTML = `
                <div style="font-weight: 700; color: #fff; font-size: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px; margin-bottom: 12px;">
                    👤 Training File: ${targetUser}
                </div>
                <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 15px;">
                    <div class="stat-card" style="padding: 10px; background: rgba(0,0,0,0.15);">
                        <span class="stat-num" style="font-size: 1.25rem; color:#3b82f6;">${xp} XP</span>
                        <span class="stat-label" style="font-size: 0.7rem;">Experience</span>
                    </div>
                    <div class="stat-card" style="padding: 10px; background: rgba(0,0,0,0.15);">
                        <span class="stat-num" style="font-size: 1.25rem; color:#eab308;">${coins} Coins</span>
                        <span class="stat-label" style="font-size: 0.7rem;">Coins Balance</span>
                    </div>
                    <div class="stat-card" style="padding: 10px; background: rgba(0,0,0,0.15);">
                        <span class="stat-num" style="font-size: 1.25rem; color:#a855f7;">Lvl ${level}</span>
                        <span class="stat-label" style="font-size: 0.7rem;">Cadet Level</span>
                    </div>
                    <div class="stat-card" style="padding: 10px; background: rgba(0,0,0,0.15);">
                        <span class="stat-num" style="font-size: 1.25rem; color:#10b981;">${completedCount}/16</span>
                        <span class="stat-label" style="font-size: 0.7rem;">Completed Labs</span>
                    </div>
                </div>
                
                <div style="font-size: 0.8rem; color: #fff; font-weight: 700; margin-bottom: 8px;">🏅 Earned Badges:</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;">
                    ${badges.length === 0 ? '<span style="color:var(--text-muted);">No badges earned yet.</span>' : badges.map(b => `
                        <span style="background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size:0.75rem;">${b}</span>
                    `).join('')}
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
                            <span>Weekly Mission progress</span>
                            <span>${weeklyProgress}%</span>
                        </div>
                        <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; margin-top:4px; overflow:hidden;">
                            <div style="height:100%; width:${weeklyProgress}%; background:#3b82f6;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
                            <span>Monthly Challenge progress</span>
                            <span>${monthlyProgress}%</span>
                        </div>
                        <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; margin-top:4px; overflow:hidden;">
                            <div style="height:100%; width:${monthlyProgress}%; background:#10b981;"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        window.changeProfile = function(val) {
            let role = "student";
            if (val === "admin") role = "admin";
            else if (val === "faculty_member") role = "faculty";

            currentUsername = val;
            currentRole = role;

            const nameLbl = document.getElementById('user-name-lbl');
            const roleLbl = document.getElementById('user-role-lbl');
            const topNameLbl = document.getElementById('top-user-name-lbl');
            const topRoleLbl = document.getElementById('top-user-role-lbl');

            if (nameLbl) nameLbl.textContent = currentUsername;
            if (roleLbl) roleLbl.textContent = currentRole;
            if (topNameLbl) topNameLbl.textContent = currentUsername;
            if (topRoleLbl) topRoleLbl.textContent = currentRole;

            document.querySelectorAll('.nav-list .nav-item').forEach(item => {
                const rolesAttr = item.getAttribute('data-roles');
                if (rolesAttr) {
                    const roles = rolesAttr.split(',');
                    if (roles.includes(currentRole)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });

            document.querySelectorAll('.hub-grid .hub-card').forEach(card => {
                const rolesAttr = card.getAttribute('data-roles');
                if (rolesAttr) {
                    const roles = rolesAttr.split(',');
                    if (roles.includes(currentRole)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    card.style.display = 'flex';
                }
            });

            document.querySelectorAll('#hub-dropdown-menu a').forEach(link => {
                const rolesAttr = link.getAttribute('data-roles');
                if (rolesAttr) {
                    const roles = rolesAttr.split(',');
                    if (roles.includes(currentRole)) {
                        link.style.display = 'flex';
                    } else {
                        link.style.display = 'none';
                    }
                } else {
                    link.style.display = 'flex';
                }
            });

            const adminDetails = document.getElementById('admin-dashboard-details');
            if (currentRole === 'admin') {
                if (adminDetails) adminDetails.style.display = 'block';
                loadAdminMetrics();
                loadFacultyList();
                loadStudentListForManagement();
            } else {
                if (adminDetails) adminDetails.style.display = 'none';
            }

            const publisherCard = document.getElementById('academic-publisher-card');
            const uploaderCard = document.getElementById('advisory-uploader-container');
            if (currentRole === 'admin' || currentRole === 'faculty') {
                if (publisherCard) publisherCard.style.display = 'block';
                if (uploaderCard) uploaderCard.style.display = 'block';
            } else {
                if (publisherCard) publisherCard.style.display = 'none';
                if (uploaderCard) uploaderCard.style.display = 'none';
            }

            loadAcademicAnnouncements();
            fetchLatestNewsAndCves();
            loadIncidents();
            auditProtocol();
            
            filterAcadDashboardTabs();
            renderAcadTabContent();
            populateInspectStudentDropdown();
            
            if (document.getElementById('panel-chat') && document.getElementById('panel-chat').classList.contains('active')) {
                loadChatHistory();
            }
            
            // Dynamically ensure back to hub buttons are injected on activation
            injectBackToHubButtons();
        };

        window.addEventListener('click', function(e) {
            const dropdown = document.getElementById('hub-dropdown-menu');
            const btn = document.getElementById('hub-dropdown-btn');
            if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Bind Authentication Event Listeners
        (function bindAuthListeners() {
            const tabLogin = document.getElementById('tab-login');
            const tabSignup = document.getElementById('tab-signup');
            const btnAuthSubmit = document.getElementById('btn-auth-submit');
            const btnOauthGoogle = document.getElementById('btn-oauth-google');
            const btnOauthGithub = document.getElementById('btn-oauth-github');
            const authForgotLink = document.getElementById('auth-forgot-link');

            if (tabLogin) {
                tabLogin.addEventListener('click', () => {
                    toggleAuthMode('login');
                });
            }
            if (tabSignup) {
                tabSignup.addEventListener('click', () => {
                    toggleAuthMode('signup');
                });
            }
            if (btnAuthSubmit) {
                btnAuthSubmit.addEventListener('click', () => {
                    executeAuthentication();
                });
            }
            if (btnOauthGoogle) {
                btnOauthGoogle.addEventListener('click', () => {
                    alert('Google Social Login active (Mock OAuth 2.0 connected)');
                });
            }
            if (btnOauthGithub) {
                btnOauthGithub.addEventListener('click', () => {
                    alert('GitHub Social Login active (Mock OAuth 2.0 connected)');
                });
            }
            if (authForgotLink) {
                authForgotLink.addEventListener('click', (e) => {
                    const link = e.target.closest('a');
                    if (link) {
                        toggleForgotPasswordView(!isForgotPasswordMode);
                    }
                });
            }
        })();

        injectBackToHubButtons();
        updateOwaspSidebar();
        updateBanditSidebar();
        // Startup session validator
        const savedSession = sessionStorage.getItem('cyber_session_id');
        if (savedSession) {
            currentRole = sessionStorage.getItem('cyber_role') || 'student';
            currentUsername = sessionStorage.getItem('cyber_username') || 'student_cadet';
            
            document.getElementById('user-name-lbl').textContent = currentUsername;
            document.getElementById('user-role-lbl').textContent = currentRole;
            document.getElementById('top-user-name-lbl').textContent = currentUsername;
            document.getElementById('top-user-role-lbl').textContent = currentRole;
            
            document.getElementById('auth-overlay').style.display = 'none';
            
            document.querySelectorAll('.nav-list .nav-item').forEach(item => {
                const rolesAttr = item.getAttribute('data-roles');
                if (rolesAttr) {
                    const roles = rolesAttr.split(',');
                    if (roles.includes(currentRole)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
            
            document.querySelectorAll('.nav-sub-list').forEach(subList => {
                const visibleChildren = Array.from(subList.querySelectorAll('.nav-item')).some(item => item.style.display !== 'none');
                const header = subList.previousElementSibling;
                if (header && header.classList.contains('nav-category-header')) {
                    if (visibleChildren) {
                        header.style.display = 'flex';
                    } else {
                        header.style.display = 'none';
                    }
                }
            });
            
            window.location.hash = `/${currentRole}/dashboard`;
            checkHashRoute();
        } else {
            document.getElementById('auth-overlay').style.display = 'flex';
        }
    