// Application State and View Routing

let currentUser = null;
let currentRole = null;

// Initialize app on load
window.addEventListener('load', async () => {
    initGeminiSettingsUI();
    const isAuth = await checkSessionAuth();
    if (isAuth) {
        showView('view-dashboard');
    } else {
        showView('view-home');
    }
});

// View switching logic
function showView(viewId) {
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => v.classList.remove('active'));
    
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        
        // Hide/Show navigation links depending on auth state
        const navLinks = document.querySelector('.nav-links');
        if (currentUser) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }

        // Trigger entrance animations
        gsap.fromTo(target, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }
}

// Session check
async function checkSessionAuth() {
    try {
        const res = await API.checkStatus();
        if (res.status === 'authenticated') {
            currentUser = res.username;
            currentRole = res.role;
            updateDashboardUI();
            return true;
        }
    } catch (e) {
        console.warn("Session check failed, redirecting to login.");
    }
    currentUser = null;
    currentRole = null;
    return false;
}

// Update dashboard text
function updateDashboardUI() {
    const profileDetails = document.getElementById('profile-details');
    if (profileDetails) {
        profileDetails.innerHTML = `
            <div><strong>Status:</strong> <span class="text-green">ONLINE [ACTIVE]</span></div>
            <div><strong>Operative ID:</strong> <span style="color:#fff;">${currentUser}</span></div>
            <div><strong>Clearance:</strong> <span class="text-cyan" style="text-transform: uppercase;">${currentRole}</span></div>
        `;
    }
}

// Authenticate user
async function handleLogin() {
    const userField = document.getElementById('auth-username');
    const passField = document.getElementById('auth-password');
    const errorDiv = document.getElementById('auth-error');
    
    const username = userField.value.trim();
    const password = passField.value;
    
    if (!username || !password) {
        errorDiv.textContent = "[!] Credentials required.";
        errorDiv.style.color = "var(--accent-red)";
        return;
    }
    
    try {
        errorDiv.textContent = "[*] Accessing system database...";
        errorDiv.style.color = "var(--text-secondary)";
        
        const res = await API.login(username, password);
        if (res.status === 'authenticated') {
            currentUser = res.username;
            currentRole = res.role;
            updateDashboardUI();
            
            errorDiv.textContent = "[+] Access Granted. Synchronizing security credentials...";
            errorDiv.style.color = "var(--accent-green)";
            
            setTimeout(() => {
                showView('view-dashboard');
                userField.value = '';
                passField.value = '';
                errorDiv.textContent = '';
            }, 1000);
        }
    } catch (err) {
        errorDiv.textContent = `[-] Auth Failure: ${err.message}`;
        errorDiv.style.color = "var(--accent-red)";
    }
}

// Register user
async function handleSignup() {
    const userField = document.getElementById('auth-username');
    const emailField = document.getElementById('auth-email');
    const passField = document.getElementById('auth-password');
    const errorDiv = document.getElementById('auth-error');
    
    const username = userField.value.trim();
    const email = emailField.value.trim();
    const password = passField.value;
    
    if (!username || !email || !password) {
        errorDiv.textContent = "[!] All registration fields are required.";
        errorDiv.style.color = "var(--accent-red)";
        return;
    }
    
    try {
        errorDiv.textContent = "[*] Injecting database records...";
        errorDiv.style.color = "var(--text-secondary)";
        
        const res = await API.signup(username, email, password);
        errorDiv.textContent = `[+] ${res.message} Authenticating now...`;
        errorDiv.style.color = "var(--accent-green)";
        
        // Auto login
        const loginRes = await API.login(username, password);
        if (loginRes.status === 'authenticated') {
            currentUser = loginRes.username;
            currentRole = loginRes.role;
            updateDashboardUI();
            
            setTimeout(() => {
                showView('view-dashboard');
                userField.value = '';
                emailField.value = '';
                passField.value = '';
                errorDiv.textContent = '';
            }, 1000);
        }
    } catch (err) {
        errorDiv.textContent = `[-] Registry Error: ${err.message}`;
        errorDiv.style.color = "var(--accent-red)";
    }
}

// Log out user
async function handleLogout() {
    try {
        await API.logout();
    } catch (e) {
        console.warn("Logout request error:", e);
    }
    currentUser = null;
    currentRole = null;
    showView('view-home');
}

// Toggle between Login and Register views
function toggleAuthMode() {
    const emailGroup = document.getElementById('email-group');
    const authBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('auth-toggle-link');
    const title = document.getElementById('auth-title');
    
    if (emailGroup.style.display === 'none' || emailGroup.style.display === '') {
        emailGroup.style.display = 'block';
        title.textContent = "Registry Center";
        authBtn.textContent = "Register Operative";
        authBtn.setAttribute('onclick', 'handleSignup()');
        toggleLink.innerHTML = 'Already have credentials? <a href="#" onclick="toggleAuthMode()">Authenticate Here</a>';
    } else {
        emailGroup.style.display = 'none';
        title.textContent = "Neural Authentication";
        authBtn.textContent = "Authenticate";
        authBtn.setAttribute('onclick', 'handleLogin()');
        toggleLink.innerHTML = 'Need to register? <a href="#" onclick="toggleAuthMode()">Request System Account</a>';
    }
    document.getElementById('auth-error').textContent = '';
}

// Gemini Settings UI Handlers
function initGeminiSettingsUI() {
    const key = API.getGeminiKey();
    const keyField = document.getElementById('gemini-key-input');
    if (keyField) {
        keyField.value = key;
    }
    updateGeminiStatusBadge(key);
}

function toggleGeminiSettings() {
    const modal = document.getElementById('gemini-settings-modal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
        gsap.fromTo(modal.querySelector('.glass-panel'), 
            { scale: 0.8, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.5)" }
        );
    } else {
        modal.style.display = 'none';
    }
}

function saveGeminiKey() {
    const val = document.getElementById('gemini-key-input').value.trim();
    if (!val) {
        alert("Please enter a valid key.");
        return;
    }
    localStorage.setItem('gemini_api_key', val);
    updateGeminiStatusBadge(val);
    toggleGeminiSettings();
    alert("Gemini API Key successfully linked! Real AI mode is now active.");
    
    // Refresh tutor chat card displays if active
    const missingCard = document.getElementById('gemini-missing-alert-card');
    if (missingCard) missingCard.style.display = 'none';
}

function clearGeminiKey() {
    localStorage.removeItem('gemini_api_key');
    document.getElementById('gemini-key-input').value = '';
    updateGeminiStatusBadge('');
    toggleGeminiSettings();
    alert("API Key cleared. App switched back to Offline Simulation Mode.");
    
    const missingCard = document.getElementById('gemini-missing-alert-card');
    if (missingCard) missingCard.style.display = 'block';
}

function updateGeminiStatusBadge(key) {
    const badge = document.getElementById('ai-status-indicator');
    if (badge) {
        if (key) {
            badge.innerHTML = '<span class="status-dot online"></span> Real AI Mode';
            badge.style.color = 'var(--accent-green)';
        } else {
            badge.innerHTML = '<span class="status-dot offline"></span> Simulation Mode';
            badge.style.color = 'var(--accent-red)';
        }
    }
}
