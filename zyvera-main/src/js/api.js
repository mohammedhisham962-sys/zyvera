// Unified Backend API Layer

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return "";
}

const API = {
    // Resolve Gemini API key from local storage
    getGeminiKey() {
        return localStorage.getItem('gemini_api_key') || '';
    },

    async request(endpoint, method = 'GET', body = null) {
        const headers = { 'Content-Type': 'application/json' };
        
        // Pass Gemini key as custom header in case backend needs it
        const geminiKey = this.getGeminiKey();
        if (geminiKey) {
            headers['X-Gemini-API-Key'] = geminiKey;
        }

        // Pass CSRF token for write operations
        if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
            const csrfToken = getCookie('csrf_token');
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }
        }

        const options = {
            method,
            headers
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        try {
            const res = await fetch(endpoint, options);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'API Request Failed');
            }
            return await res.json();
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    },

    // Authentication Endpoints
    async login(username, password) {
        return this.request('/api/login', 'POST', { username, password });
    },
    
    async signup(username, email, password) {
        return this.request('/api/signup', 'POST', { username, email, password });
    },
    
    async logout() {
        return this.request('/api/logout', 'POST');
    },
    
    async checkStatus() {
        return this.request('/api/check_status');
    },

    // AI Learning Tools Integration
    async queryTutor(message, history) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/tutor', 'POST', { message, history, api_key });
    },

    async explainCommand(command, shell) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/explain_command', 'POST', { command, shell, api_key });
    },

    async explainLog(log, format) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/explain_log', 'POST', { log, format, api_key });
    },

    async explainVulnerability(vulnerability, impact) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/explain_vuln', 'POST', { vulnerability, impact, api_key });
    },

    async generateCtfHint(title, category, description, attempted, hint_tier) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/ctf_hint', 'POST', { title, category, description, attempted, hint_tier, api_key });
    },

    async generateSecurityReport(target, title, severity, description, remediation) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/report_generator', 'POST', { target, title, severity, description, remediation, api_key });
    },

    async generateAttackScenario(target_profile, industry, compliance) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/attack_scenario', 'POST', { target_profile, industry, compliance, api_key });
    },

    async queryStudyAssistant(topic, duration) {
        const api_key = this.getGeminiKey();
        return this.request('/api/ai/study_assistant', 'POST', { topic, duration, api_key });
    }
};
