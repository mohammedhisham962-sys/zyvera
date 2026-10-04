with open('src/js/app_react.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update App renders for ToolkitPage, AssessmentPage, MentorAiPage to pass onRecordActivity
t1 = """                {activeTab === 'toolkit' && (
                    <ToolkitPage user={user} />
                )}"""
r1 = """                {activeTab === 'toolkit' && (
                    <ToolkitPage user={user} onRecordActivity={recordUserActivity} />
                )}"""
if t1 in code:
    code = code.replace(t1, r1, 1)
    print("1. App ToolkitPage prop updated.")

t2 = """                {activeTab === 'assessment' && (
                    <AssessmentPage user={user} onAwardXp={awardXp} />
                )}"""
r2 = """                {activeTab === 'assessment' && (
                    <AssessmentPage user={user} onAwardXp={awardXp} onRecordActivity={recordUserActivity} />
                )}"""
if t2 in code:
    code = code.replace(t2, r2, 1)
    print("2. App AssessmentPage prop updated.")

t3 = """                {activeTab === 'mentor' && (
                    <MentorAiPage user={user} />
                )}"""
r3 = """                {activeTab === 'mentor' && (
                    <MentorAiPage user={user} onRecordActivity={recordUserActivity} />
                )}"""
if t3 in code:
    code = code.replace(t3, r3, 1)
    print("3. App MentorAiPage prop updated.")

# 2. Update MentorAiPage definition and handleSendPrompt
t_mentor = "function MentorAiPage({ user }) {"
r_mentor = "function MentorAiPage({ user, onRecordActivity }) {"
if t_mentor in code:
    code = code.replace(t_mentor, r_mentor, 1)
    print("4. MentorAiPage signature updated.")

t_prompt = """        setPromptInput('');
        const updatedMessages = [...messages, { sender: 'cadet', text: cleanPrompt }];
        setMessages(updatedMessages);
        setIsConsulting(true);"""

r_prompt = """        setPromptInput('');
        const updatedMessages = [...messages, { sender: 'cadet', text: cleanPrompt }];
        setMessages(updatedMessages);
        setIsConsulting(true);
        if (onRecordActivity) {
            onRecordActivity(`Asked Natasha AI: ${cleanPrompt.slice(0, 65)}...`, 'ai_query', `Query length: ${cleanPrompt.length} chars`);
        }"""
if t_prompt in code:
    code = code.replace(t_prompt, r_prompt, 1)
    print("5. MentorAiPage activity logging added.")

# 3. Update AssessmentPage definition and handleSubmitAnswer
t_assess = "function AssessmentPage({ user, onAwardXp }) {"
r_assess = "function AssessmentPage({ user, onAwardXp, onRecordActivity }) {"
if t_assess in code:
    code = code.replace(t_assess, r_assess, 1)
    print("6. AssessmentPage signature updated.")

t_answer = """        if (selectedOption === questionData.a) {
            setQuizScore(s => s + 1);
            setStreak(st => st + 1);
            onAwardXp('quiz-correct', 'Cybersecurity Examination Answer', 50);
        } else {
            setStreak(0);
        }"""

r_answer = """        if (selectedOption === questionData.a) {
            setQuizScore(s => s + 1);
            setStreak(st => st + 1);
            onAwardXp('quiz-correct', 'Cybersecurity Examination Answer', 50);
            if (onRecordActivity) {
                onRecordActivity('Passed Examination Question', 'quiz', `Question: ${questionData.q ? questionData.q.slice(0, 60) : 'Assessment item'} (+50 XP)`);
            }
        } else {
            setStreak(0);
            if (onRecordActivity) {
                onRecordActivity('Attempted Examination Question', 'quiz', `Question: ${questionData.q ? questionData.q.slice(0, 60) : 'Assessment item'}`);
            }
        }"""
if t_answer in code:
    code = code.replace(t_answer, r_answer, 1)
    print("7. AssessmentPage activity logging added.")

# Check token balance
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
    print("Successfully saved changes to src/js/app_react.js!")
else:
    print("Error: token imbalance.")
