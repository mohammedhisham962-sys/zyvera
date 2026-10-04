// AI Learning Tools UI Handlers and Controller

// Simple Markdown Parser for styling LLM responses
function parseMarkdown(text) {
    if (!text) return "";
    let html = text;
    
    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre style="background: #111; border: 1px solid #333; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 0.85rem; color: #fff; margin: 12px 0;"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3 style="color: #ef4444; margin-top: 15px; margin-bottom: 8px;">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 style="color: #ef4444; margin-top: 20px; margin-bottom: 10px;">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 style="color: #ef4444; margin-top: 25px; margin-bottom: 12px;">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;">$1</strong>');
    
    // Lists
    html = html.replace(/^\- (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>');
    html = html.replace(/^\* (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9rem;">$1</code>');
    
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

// Show Loading State
function showLoader(outputContainerId, message = "AI QUERY RUNNING...") {
    const container = document.getElementById(outputContainerId);
    container.innerHTML = `
        <div class="loader-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;">
            <div class="cyber-radar" style="width: 60px; height: 60px; border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 50%; position: relative; margin-bottom: 15px;">
                <div class="radar-scan" style="width: 100%; height: 100%; border-radius: 50%; border-left: 2px solid #ef4444; position: absolute; top: 0; left: 0; animation: rotate 1.5s linear infinite;"></div>
                <div class="radar-core" style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 10px #ef4444;"></div>
            </div>
            <div class="loader-text" style="text-align: center;">
                <div class="loader-main" style="font-family: monospace; font-weight: bold; color: #ef4444; letter-spacing: 2px; font-size: 0.9rem; margin-bottom: 4px;">${message}</div>
                <div class="loader-sub" style="font-size: 0.75rem; color: var(--text-muted);">ESTABLISHING SECURE SYSTEM CORE [PORT 8080]</div>
            </div>
        </div>
    `;
}

// Copy responses helper
function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(() => {
        alert("Response copied to clipboard!");
    }).catch(err => {
        console.error("Copy error: ", err);
    });
}

// ================= AI TOOLS CONTROLLERS =================

// 1. AI Cybersecurity Tutor
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
    
    // Apply styling on the fly to match original chat style
    bubble.style.padding = '10px 15px';
    bubble.style.borderRadius = '8px';
    bubble.style.marginBottom = '12px';
    bubble.style.maxWidth = '85%';
    bubble.style.fontSize = '0.9rem';
    bubble.style.lineHeight = '1.5';
    
    if (sender === 'user') {
        bubble.style.alignSelf = 'flex-end';
        bubble.style.background = 'rgba(239, 68, 68, 0.1)';
        bubble.style.borderRight = '2px solid #ef4444';
        bubble.style.color = '#fff';
        bubble.textContent = text;
    } else {
        bubble.style.alignSelf = 'flex-start';
        bubble.style.background = '#1a1a1a';
        bubble.style.borderLeft = '2px solid #ef4444';
        bubble.style.color = '#d1d5db';
        bubble.innerHTML = parseMarkdown(text);
    }
    
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function clearTutorChat() {
    tutorChatHistory = [];
    document.getElementById('tutor-messages').innerHTML = `
        <div class="chat-bubble assistant" style="padding: 10px 15px; border-radius: 8px; margin-bottom: 12px; max-width: 85%; font-size: 0.9rem; align-self: flex-start; background: #1a1a1a; border-left: 2px solid #ef4444; color: #d1d5db;">
            System core ready. Ask me any cybersecurity related query. Let's begin learning!
        </div>
    `;
}

// 2. Explain Command
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
        output.innerHTML = `<p style="color:#ef4444;">Error: ${err.message}</p>`;
    }
}

// 3. Explain Log
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
        output.innerHTML = `<p style="color:#ef4444;">Error: ${err.message}</p>`;
    }
}

// 4. Explain Vulnerability
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
        output.innerHTML = `<p style="color:#ef4444;">Error: ${err.message}</p>`;
    }
}

// 5. CTF Hint Generator
let ctfHintTier = 1;

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
    const attempted = document.getElementById('ctf-tried').value.trim();
    const output = document.getElementById('ctf-output');
    
    if (!title || !desc) return alert("Please complete challenge title and details.");
    showLoader('ctf-output', `GENERATING HINT TIER ${ctfHintTier}...`);
    
    try {
        const res = await API.generateCtfHint(title, category, desc, attempted, ctfHintTier);
        output.innerHTML = parseMarkdown(res.result);
        
        if (ctfHintTier < 3) {
            ctfHintTier++;
            updateCtfButtonText();
        }
    } catch (err) {
        output.innerHTML = `<p style="color:#ef4444;">Error: ${err.message}</p>`;
    }
}

// Reset hint generator tier when switching challenge title or reloading
function resetCtfHint() {
    ctfHintTier = 1;
    updateCtfButtonText();
    document.getElementById('ctf-title').value = '';
    document.getElementById('ctf-description').value = '';
    document.getElementById('ctf-tried').value = '';
    document.getElementById('ctf-output').innerHTML = '<p class="text-secondary">[Ready] Input challenge details to receive progressive hint steps.</p>';
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
        output.innerHTML = `<p style="color:#ef4444;">Error: ${err.message}</p>`;
    }
}

function printSecurityReport() {
    const content = document.getElementById('report-output').innerHTML;
    if (!content || content.includes("loader-container")) {
        return alert("No report generated to print yet.");
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>AIGRA Cybersecurity Audit Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                h1, h2, h3 { border-bottom: 1px solid #ddd; padding-bottom: 8px; color: #b91c1c; }
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

// 7. Attack-Scenario Simulator
async function submitAttackScenario() {
    const profile = document.getElementById('attack-profile').value.trim();
    const industry = document.getElementById('attack-industry').value;
    const compliance = document.getElementById('attack-compliance').value;
    const output = document.getElementById('attack-output');
    
    if (!profile) return alert("Please describe target system profile.");
    showLoader('attack-output', "SIMULATING RECON PATHWAY...");
    
    try {
        const res = await API.generateAttackScenario(profile, industry, compliance);
        const parsedHtml = parseMarkdown(res.result);
        
        output.innerHTML = `
            <div class="attack-scenario-workspace" style="display:flex; flex-direction:column; gap:20px;">
                <div class="attack-flowchart" style="display:flex; align-items:center; justify-content:space-between; background:#111; border:1px solid #333; padding:15px; border-radius:8px;">
                    <div class="flow-step" onclick="highlightAttackSection('recon')" style="flex:1; background:#222; border:1px solid #444; border-radius:6px; padding:10px; text-align:center; cursor:pointer;">
                        <div style="font-family:monospace; font-size:0.75rem; color:#ef4444; margin-bottom:4px;">01</div>
                        <div style="font-size:0.8rem; font-weight:600; color:#fff;">Reconnaissance</div>
                    </div>
                    <div style="margin:0 10px; color:#666;">➡️</div>
                    <div class="flow-step" onclick="highlightAttackSection('compromise')" style="flex:1; background:#222; border:1px solid #444; border-radius:6px; padding:10px; text-align:center; cursor:pointer;">
                        <div style="font-family:monospace; font-size:0.75rem; color:#ef4444; margin-bottom:4px;">02</div>
                        <div style="font-size:0.8rem; font-weight:600; color:#fff;">Initial Entry</div>
                    </div>
                    <div style="margin:0 10px; color:#666;">➡️</div>
                    <div class="flow-step" onclick="highlightAttackSection('lateral')" style="flex:1; background:#222; border:1px solid #444; border-radius:6px; padding:10px; text-align:center; cursor:pointer;">
                        <div style="font-family:monospace; font-size:0.75rem; color:#ef4444; margin-bottom:4px;">03</div>
                        <div style="font-size:0.8rem; font-weight:600; color:#fff;">Lateral Move</div>
                    </div>
                    <div style="margin:0 10px; color:#666;">➡️</div>
                    <div class="flow-step" onclick="highlightAttackSection('objective')" style="flex:1; background:#222; border:1px solid #444; border-radius:6px; padding:10px; text-align:center; cursor:pointer;">
                        <div style="font-family:monospace; font-size:0.75rem; color:#ef4444; margin-bottom:4px;">04</div>
                        <div style="font-size:0.8rem; font-weight:600; color:#fff;">Exfiltration</div>
                    </div>
                </div>
                <div class="attack-report-details" id="attack-report-details">
                    ${parsedHtml}
                </div>
            </div>
        `;
    } catch (err) {
        output.innerHTML = `<p style="color:#ef4444;">Error: ${err.message}</p>`;
    }
}

function highlightAttackSection(sectionName) {
    const detailsDiv = document.getElementById('attack-report-details');
    const elements = detailsDiv.querySelectorAll('h4, h3, li, p, strong');
    elements.forEach(h => {
        if (h.textContent.toLowerCase().includes(sectionName)) {
            h.style.color = '#ef4444';
            h.style.textShadow = '0 0 8px rgba(239, 68, 68, 0.4)';
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
        const contentText = res.result;
        
        // Parse quiz questions if present
        const flashcardRegex = /Flashcard \d+:\s*\n?\s*\*?\*?Q:?\*?\*?\s*(.*?)\n?\s*\*?\*?A:?\*?\*?\s*(.*?)(?=\n\n|\n\*|$)/gi;
        let flashcards = [];
        let fMatch;
        while ((fMatch = flashcardRegex.exec(contentText)) !== null) {
            flashcards.push({ question: fMatch[1].trim(), answer: fMatch[2].trim() });
        }
        
        let htmlContent = `<div class="study-dashboard" style="display:flex; flex-direction:column; gap:25px;">`;
        
        // Outline Section
        htmlContent += `
            <div class="study-section">
                <h3 style="color:#ef4444; border-bottom:1px solid #333; padding-bottom:5px; margin-bottom:10px;">📖 Timeline & Outline</h3>
                <div class="outline-content" style="color:#ccc; font-size:0.9rem;">
                    ${parseMarkdown(contentText.split('Interactive Study')[0].split('Interactive Flashcards')[0])}
                </div>
            </div>
        `;
        
        // Flashcards Section
        if (flashcards.length > 0) {
            htmlContent += `
                <div class="study-section">
                    <h3 style="color:#ef4444; border-bottom:1px solid #333; padding-bottom:5px; margin-bottom:15px;">📇 Interactive Flashcards (Click to Flip)</h3>
                    <div class="flashcards-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
            `;
            flashcards.forEach((card, idx) => {
                htmlContent += `
                    <div class="flashcard-container" onclick="this.classList.toggle('flipped')" style="perspective:1000px; height:150px; cursor:pointer;">
                        <div class="flashcard" style="width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.6s;">
                            <div class="front" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; border:1px solid #333; background:#111; padding:15px; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                                <div style="font-size:0.75rem; color:#ef4444; font-weight:700;">CARD ${idx + 1}</div>
                                <div style="font-size:0.85rem; font-weight:600; color:#fff; text-align:center;">${card.question}</div>
                                <div style="font-size:0.7rem; color:#666; text-align:center;">Click to reveal</div>
                            </div>
                            <div class="back" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; border:1px solid #ef4444; background:rgba(239,68,68,0.08); padding:15px; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between; transform:rotateY(180deg); box-shadow: 0 0 10px rgba(239,68,68,0.2);">
                                <div style="font-size:0.75rem; color:#ef4444; font-weight:700;">ANSWER</div>
                                <div style="font-size:0.85rem; font-weight:600; color:#fff; text-align:center;">${card.answer}</div>
                                <div style="font-size:0.7rem; color:#888; text-align:center;">Click to flip back</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            htmlContent += `</div></div>`;
        }
        
        // Quiz Section
        htmlContent += `
            <div class="study-section">
                <h3 style="color:#ef4444; border-bottom:1px solid #333; padding-bottom:5px; margin-bottom:15px;">🧠 Practice Self-Assessment</h3>
                <div class="study-quiz" style="display:flex; flex-direction:column; gap:15px;">
                    <div class="quiz-question" style="background:#111; border:1px solid #333; padding:15px; border-radius:8px;">
                        <p class="q-text" style="font-weight:700; margin-bottom:10px; color:#fff;">1. Which of the following handles encrypted website traffic?</p>
                        <div class="quiz-choices" style="display:flex; flex-direction:column; gap:8px;">
                            <button class="choice-btn" onclick="checkQuizAnswer(this, true, 'HTTPS protocols encrypt network communications on port 443.')" style="text-align:left; padding:8px 12px; background:#222; border:1px solid #444; color:#fff; border-radius:4px; cursor:pointer; font-family:inherit; outline:none; transition:background 0.2s;">A) HTTPS</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'FTP handles file transfers in cleartext.')" style="text-align:left; padding:8px 12px; background:#222; border:1px solid #444; color:#fff; border-radius:4px; cursor:pointer; font-family:inherit; outline:none; transition:background 0.2s;">B) FTP</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'SMTP handles raw email transmission.')" style="text-align:left; padding:8px 12px; background:#222; border:1px solid #444; color:#fff; border-radius:4px; cursor:pointer; font-family:inherit; outline:none; transition:background 0.2s;">C) SMTP</button>
                        </div>
                        <div class="quiz-feedback" style="display:none; margin-top:10px; padding-top:8px; border-top:1px solid #333; font-size:0.8rem; color:#aaa;"></div>
                    </div>
                    <div class="quiz-question" style="background:#111; border:1px solid #333; padding:15px; border-radius:8px;">
                        <p class="q-text" style="font-weight:700; margin-bottom:10px; color:#fff;">2. How does hashing differ from symmetric encryption?</p>
                        <div class="quiz-choices" style="display:flex; flex-direction:column; gap:8px;">
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'Symmetric encryption uses keys.')" style="text-align:left; padding:8px 12px; background:#222; border:1px solid #444; color:#fff; border-radius:4px; cursor:pointer; font-family:inherit; outline:none; transition:background 0.2s;">A) Hashing requires public/private keypairs</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, true, 'Hashing maps arbitrary strings to fixed-size hashes irreversibly.')" style="text-align:left; padding:8px 12px; background:#222; border:1px solid #444; color:#fff; border-radius:4px; cursor:pointer; font-family:inherit; outline:none; transition:background 0.2s;">B) Hashing is one-way/irreversible</button>
                            <button class="choice-btn" onclick="checkQuizAnswer(this, false, 'Symmetric encryption is not irreversible.')" style="text-align:left; padding:8px 12px; background:#222; border:1px solid #444; color:#fff; border-radius:4px; cursor:pointer; font-family:inherit; outline:none; transition:background 0.2s;">C) Symmetric encryption is one-way</button>
                        </div>
                        <div class="quiz-feedback" style="display:none; margin-top:10px; padding-top:8px; border-top:1px solid #333; font-size:0.8rem; color:#aaa;"></div>
                    </div>
                </div>
            </div>
        `;
        
        htmlContent += `</div>`;
        output.innerHTML = htmlContent;
    } catch (err) {
        output.innerHTML = `<p style="color:#ef4444;">Error: ${err.message}</p>`;
    }
}

function checkQuizAnswer(btn, isCorrect, explanation) {
    const parent = btn.closest('.quiz-choices');
    const feedback = btn.closest('.quiz-question').querySelector('.quiz-feedback');
    
    parent.querySelectorAll('.choice-btn').forEach(b => {
        b.disabled = true;
    });
    
    if (isCorrect) {
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = '#10b981';
        feedback.innerHTML = `<span style="color:#10b981; font-weight:700;">✓ Correct!</span> ${explanation}`;
    } else {
        btn.style.background = 'rgba(239, 68, 68, 0.2)';
        btn.style.borderColor = '#ef4444';
        feedback.innerHTML = `<span style="color:#ef4444; font-weight:700;">✗ Incorrect.</span> ${explanation}`;
    }
    feedback.style.display = 'block';
}
