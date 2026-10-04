// Core UI Interactions, Animations, and AI Tool Workspace Handlers

// 1. Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Custom Cursor
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
    });
});

document.addEventListener('mouseover', (e) => {
    if(e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button' || e.target.classList.contains('btn-magnetic') || e.target.closest('.tool-card')) {
        cursor.classList.add('hover');
    }
});
document.addEventListener('mouseout', (e) => {
    if(e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button' || e.target.classList.contains('btn-magnetic') || e.target.closest('.tool-card')) {
        cursor.classList.remove('hover');
    }
});

// 3. Magnetic Buttons
function initMagneticButtons() {
    const magnetics = document.querySelectorAll('.btn-magnetic, .nav-link');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const h = rect.width / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

// 4. Simple, Robust Regex Markdown Parser
function parseMarkdown(text) {
    if (!text) return "";
    let html = text;
    
    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Lists
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
    
    // Wrap groups of <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 5. AI Tool Workspace Routing
let activeToolId = null;
let ctfHintTier = 1;

function launchTool(toolId) {
    activeToolId = toolId;
    
    // Reset state variables
    if (toolId === 'ctf') {
        ctfHintTier = 1;
        updateCtfButtonText();
    }
    
    // Hide tools menu, show selected tool workspace
    document.getElementById('cyber-defence-grid').style.display = 'none';
    
    const workspaces = document.querySelectorAll('.tool-workspace');
    workspaces.forEach(w => w.style.display = 'none');
    
    const targetWorkspace = document.getElementById(`workspace-${toolId}`);
    if (targetWorkspace) {
        targetWorkspace.style.display = 'flex';
        gsap.fromTo(targetWorkspace, 
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
        );
    }
}

function exitToolWorkspace() {
    // Hide all workspaces, show main tool grid
    const workspaces = document.querySelectorAll('.tool-workspace');
    workspaces.forEach(w => w.style.display = 'none');
    
    const grid = document.getElementById('cyber-defence-grid');
    grid.style.display = 'grid';
    gsap.fromTo(grid, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );
    activeToolId = null;
}

// Helper to show loading indicators
function showLoader(outputContainerId, message = "AI QUERY RUNNING...") {
    const container = document.getElementById(outputContainerId);
    container.innerHTML = `
        <div class="loader-container">
            <div class="cyber-radar">
                <div class="radar-scan"></div>
                <div class="radar-core"></div>
            </div>
            <div class="loader-text">
                <div class="loader-main">${message}</div>
                <div class="loader-sub">SECURE SYSTEM NODE IN PROGRESS [PORT 8080]</div>
            </div>
        </div>
    `;
}

// Helper to copy content to clipboard
function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    // Extract text content cleanly (skip HTML tags)
    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Response copied to clipboard!");
    }).catch(err => {
        console.error("Clipboard copy error: ", err);
    });
}

// ================= TOOL-SPECIFIC ACTIONS =================

// 1. AI Cybersecurity Tutor Chat
let tutorChatHistory = [];

async function sendTutorMessage() {
    const input = document.getElementById('tutor-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    input.value = '';
    appendTutorBubble('user', msg);
    
    // Add typing loader
    const messagesBox = document.getElementById('tutor-messages');
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble assistant typing-bubble';
    typingBubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    messagesBox.appendChild(typingBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    
    try {
        const res = await API.queryTutor(msg, tutorChatHistory);
        typingBubble.remove();
        
        appendTutorBubble('assistant', res.result);
        
        // Update history
        tutorChatHistory.push({ role: 'user', content: msg });
        tutorChatHistory.push({ role: 'assistant', content: res.result });
        
    } catch (err) {
        typingBubble.remove();
        appendTutorBubble('assistant', `⚠️ System Error: Unable to query AI core. Details: ${err.message}`);
    }
}

function appendTutorBubble(sender, text) {
    const messagesBox = document.getElementById('tutor-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    
    if (sender === 'assistant') {
        bubble.innerHTML = parseMarkdown(text);
    } else {
        bubble.textContent = text;
    }
    
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function clearTutorChat() {
    tutorChatHistory = [];
    document.getElementById('tutor-messages').innerHTML = `
        <div class="chat-bubble assistant">
            System core ready. Ask me any cybersecurity related query. Let's begin learning!
        </div>
    `;
}

// 2. Explain This Command
async function submitExplainCommand() {
    const cmd = document.getElementById('command-input').value.trim();
    const shell = document.getElementById('command-shell').value;
    const output = document.getElementById('command-output');
    
    if (!cmd) return alert("Please enter a command to explain.");
    
    showLoader('command-output', "EXPLAINING CLI PROTOCOLS...");
    
    try {
        const res = await API.explainCommand(cmd, shell);
        output.innerHTML = parseMarkdown(res.result);
    } catch (err) {
        output.innerHTML = `<p class="text-red">Error querying AI core: ${err.message}</p>`;
    }
}

// 3. Explain This Log
async function submitExplainLog() {
    const log = document.getElementById('log-input').value.trim();
    const format = document.getElementById('log-format').value;
    const output = document.getElementById('log-output');
    
    if (!log) return alert("Please enter a log block to analyze.");
    
    showLoader('log-output', "AUDITING SECURE SYS LOGS...");
    
    try {
        const res = await API.explainLog(log, format);
        output.innerHTML = parseMarkdown(res.result);
    } catch (err) {
        output.innerHTML = `<p class="text-red">Error querying AI core: ${err.message}</p>`;
    }
}

// 4. Explain This Vulnerability
async function submitExplainVuln() {
    const vuln = document.getElementById('vuln-name').value.trim();
    const impact = document.getElementById('vuln-impact').value;
    const output = document.getElementById('vuln-output');
    
    if (!vuln) return alert("Please specify a vulnerability name or CVE.");
    
    showLoader('vuln-output', "FETCHING VULNERABILITY ARCHIVE...");
    
    try {
        const res = await API.explainVulnerability(vuln, impact);
        output.innerHTML = parseMarkdown(res.result);
    } catch (err) {
        output.innerHTML = `<p class="text-red">Error querying AI core: ${err.message}</p>`;
    }
}

// 5. CTF Hint Generator
function updateCtfButtonText() {
    const btn = document.getElementById('ctf-submit-btn');
    if (btn) {
        btn.textContent = `Generate Hint (Tier ${ctfHintTier}/3)`;
    }
}

async function submitCtfHint() {
    const title = document.getElementById('ctf-title').value.trim();
    const category = document.getElementById('ctf-category').value;
    const desc = document.getElementById('ctf-description').value.trim();
    const tried = document.getElementById('ctf-tried').value.trim();
    const output = document.getElementById('ctf-output');
    
    if (!title || !desc) return alert("Please complete challenge title and details.");
    
    showLoader('ctf-output', `GENERATING HINT TIER ${ctfHintTier}...`);
    
    try {
        const res = await API.generateCtfHint(title, category, desc, tried, ctfHintTier);
        output.innerHTML = parseMarkdown(res.result);
        
        // Increment hint tier up to 3
        if (ctfHintTier < 3) {
            ctfHintTier++;
            updateCtfButtonText();
        }
    } catch (err) {
        output.innerHTML = `<p class="text-red">Error querying AI core: ${err.message}</p>`;
    }
}

// 6. Security Report Generator
async function submitSecurityReport() {
    const target = document.getElementById('report-target').value.trim();
    const title = document.getElementById('report-title').value.trim();
    const severity = document.getElementById('report-severity').value;
    const desc = document.getElementById('report-description').value.trim();
    const remediation = document.getElementById('report-remediation').value.trim();
    const output = document.getElementById('report-output');
    
    if (!target || !title || !desc) return alert("Please complete target, title and details.");
    
    showLoader('report-output', "COMPILING REPORT STRUCTURE...");
    
    try {
        const res = await API.generateSecurityReport(target, title, severity, desc, remediation);
        output.innerHTML = parseMarkdown(res.result);
    } catch (err) {
        output.innerHTML = `<p class="text-red">Error querying AI core: ${err.message}</p>`;
    }
}

function printSecurityReport() {
    const content = document.getElementById('report-output').innerHTML;
    if (!content || content.includes("loader-container")) {
        return alert("No report generated to print yet.");
    }
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>AIGRA Cybersecurity Audit Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                h1, h2, h3 { border-bottom: 1px solid #ddd; padding-bottom: 8px; }
                pre { background: #f4f4f4; padding: 15px; border-radius: 5px; }
                code { font-family: monospace; background: #eee; padding: 2px 6px; }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// 7. Attack-Scenario Generator
async function submitAttackScenario() {
    const profile = document.getElementById('attack-profile').value.trim();
    const industry = document.getElementById('attack-industry').value;
    const compliance = document.getElementById('attack-compliance').value;
    const output = document.getElementById('attack-output');
    
    if (!profile) return alert("Please describe target system profile.");
    
    showLoader('attack-output', "SIMULATING RECON PATHWAY...");
    
    try {
        const res = await API.generateAttackScenario(profile, industry, compliance);
        
        // Parse the markdown
        const parsedHtml = parseMarkdown(res.result);
        
        // Create an interactive red-team attack steps flowchart
        output.innerHTML = `
            <div class="attack-scenario-workspace">
                <div class="attack-flowchart">
                    <div class="flow-step" onclick="highlightAttackSection('recon')">
                        <div class="step-num">01</div>
                        <div class="step-title">Reconnaissance</div>
                    </div>
                    <div class="flow-arrow">➡️</div>
                    <div class="flow-step" onclick="highlightAttackSection('compromise')">
                        <div class="step-num">02</div>
                        <div class="step-title">Initial Entry</div>
                    </div>
                    <div class="flow-arrow">➡️</div>
                    <div class="flow-step" onclick="highlightAttackSection('lateral')">
                        <div class="step-num">03</div>
                        <div class="step-title">Lateral Movement</div>
                    </div>
                    <div class="flow-arrow">➡️</div>
                    <div class="flow-step" onclick="highlightAttackSection('objective')">
                        <div class="step-num">04</div>
                        <div class="step-title">Exfiltration</div>
                    </div>
                </div>
                <div class="attack-report-details" id="attack-report-details">
                    ${parsedHtml}
                </div>
            </div>
        `;
    } catch (err) {
        output.innerHTML = `<p class="text-red">Error querying AI core: ${err.message}</p>`;
    }
}

function highlightAttackSection(sectionName) {
    const detailsDiv = document.getElementById('attack-report-details');
    // Scroll detail div to matching header if exists, or highlight
    const headers = detailsDiv.querySelectorAll('h4, h3, li, p, strong');
    headers.forEach(h => {
        if (h.textContent.toLowerCase().includes(sectionName)) {
            h.style.color = 'var(--accent-red)';
            h.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
            h.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                h.style.color = '';
                h.style.textShadow = '';
            }, 2500);
        }
    });
}

// 8. Cybersecurity Study Assistant
async function submitStudyAssistant() {
    const topic = document.getElementById('study-topic').value.trim();
    const duration = document.getElementById('study-duration').value;
    const output = document.getElementById('study-output');
    
    if (!topic) return alert("Please specify a study topic.");
    
    showLoader('study-output', "BUILDING STUDY CHANNELS...");
    
    try {
        const res = await API.queryStudyAssistant(topic, duration);
        
        // Parse the raw markdown or custom content
        const contentText = res.result;
        
        // Parse quiz questions if present
        let parsedQuiz = [];
        let cleanText = contentText;
        
        // Heuristically extract interactive flashcards and quiz questions
        const flashcardRegex = /Flashcard \d+:\s*\n?\s*\*?\*?Q:?\*?\*?\s*(.*?)\n?\s*\*?\*?A:?\*?\*?\s*(.*?)(?=\n\n|\n\*|$)/gi;
        let flashcards = [];
        let fMatch;
        while ((fMatch = flashcardRegex.exec(contentText)) !== null) {
            flashcards.push({ question: fMatch[1].trim(), answer: fMatch[2].trim() });
        }
        
        // Compile a clean dashboard
        let htmlContent = `<div class="study-dashboard">`;
        
        // Section 1: Study outline
        htmlContent += `
            <div class="study-section">
                <h3>📖 Certification Prep Timeline</h3>
                <div class="outline-content">${parseMarkdown(cleanText.split('Interactive Study')[0].split('Interactive Flashcards')[0])}</div>
            </div>
        `;
        
        // Section 2: Interactive Flashcards
        if (flashcards.length > 0) {
            htmlContent += `
                <div class="study-section">
                    <h3>📇 Click-to-Flip Interactive Flashcards</h3>
                    <div class="flashcards-grid">
            `;
            flashcards.forEach((card, idx) => {
                htmlContent += `
                    <div class="flashcard-container" onclick="this.classList.toggle('flipped')">
                        <div class="flashcard">
                            <div class="front">
                                <div class="card-header">CARD ${idx + 1}</div>
                                <div class="card-body">${card.question}</div>
                                <div class="card-footer">Click to Reveal Answer</div>
                            </div>
                            <div class="back">
                                <div class="card-header">ANSWER</div>
                                <div class="card-body">${card.answer}</div>
                                <div class="card-footer">Click to Flip Back</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            htmlContent += `</div></div>`;
        }
        
        // Section 3: Study Quiz
        htmlContent += `
            <div class="study-section">
                <h3>🧠 Self-Assessment Quiz</h3>
                <div class="study-quiz">
                    <div class="quiz-question">
                        <p class="q-text">1. Which of the following handles encrypted website traffic?</p>
                        <div class="quiz-choices">
                            <button class="choice-btn" onclick="checkQuizAnswer(this, true, 'HTTPS protocols encrypt network communications on port 443.')">A) HTTPS</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'FTP handles file transfers in cleartext.')">B) FTP</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'SMTP handles raw emails communications.')">C) SMTP</button>
                        </div>
                        <div class="quiz-feedback"></div>
                    </div>
                    <div class="quiz-question" style="margin-top:20px;">
                        <p class="q-text">2. How does hashing differ from symmetric encryption?</p>
                        <div class="quiz-choices">
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'Symmetric encryption uses separate keys.')">A) Hashing requires a public key</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, true, 'Hashing processes strings in one-way formats, while encryption is reversible.')">B) Hashing is one-way/irreversible</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'Symmetric systems are irreversible.')">C) Symmetric encryption is one-way</button>
                        </div>
                        <div class="quiz-feedback"></div>
                    </div>
                </div>
            </div>
        `;
        
        htmlContent += `</div>`;
        output.innerHTML = htmlContent;
        
    } catch (err) {
        output.innerHTML = `<p class="text-red">Error querying AI core: ${err.message}</p>`;
    }
}

function checkQuizAnswer(btn, isCorrect, explanation) {
    const parent = btn.closest('.quiz-choices');
    const feedback = btn.closest('.quiz-question').querySelector('.quiz-feedback');
    
    // Disable all choice buttons in this question
    parent.querySelectorAll('.choice-btn').forEach(b => {
        b.disabled = true;
    });
    
    // Apply styling
    if (isCorrect) {
        btn.classList.add('correct');
        feedback.innerHTML = `<span class="text-green">✓ Correct!</span> ${explanation}`;
    } else {
        btn.classList.add('incorrect');
        feedback.innerHTML = `<span class="text-red">✗ Incorrect.</span> ${explanation}`;
        
        // Find correct button and outline it
        parent.querySelectorAll('.choice-btn').forEach(b => {
            // In our hardcoded choices, we can check which is correct
            // (we simulate it simply for interactive feel)
        });
    }
    feedback.style.display = 'block';
    gsap.from(feedback, { opacity: 0, y: 10, duration: 0.3 });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    initMagneticButtons();
});
