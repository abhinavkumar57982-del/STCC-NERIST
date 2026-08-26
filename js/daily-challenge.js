// ===== DAILY CHALLENGE CONTROLLER =====
(function() {
    'use strict';

    const API_URL = window.API_URL || 'http://localhost:5000/api';

    class DailyChallengeController {
        constructor() {
            this.editor = null;
            this.currentChallenge = null;
            this.isSubmitting = false;
            this.isRunning = false;
            this.language = 'cpp';
            this.starterCodes = {};

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }

        async init() {
            console.log('🚀 Daily Challenge loading...');
            
            const token = localStorage.getItem('stcc_token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            if (typeof CodeMirror === 'undefined') {
                setTimeout(() => this.init(), 500);
                return;
            }

            this.setupEditor();
            this.setupEventListeners();
            await this.loadTodayChallenge();
        }

        setupEditor() {
            const textarea = document.getElementById('codeEditor');
            if (!textarea) return;

            try {
                this.editor = CodeMirror.fromTextArea(textarea, {
                    mode: 'text/x-c++src',
                    theme: 'dracula',
                    lineNumbers: true,
                    indentUnit: 4,
                    tabSize: 4,
                    lineWrapping: true,
                    autoCloseBrackets: true,
                    matchBrackets: true,
                    extraKeys: {
                        'Ctrl-Enter': () => this.submitSolution(),
                        'Cmd-Enter': () => this.submitSolution()
                    }
                });
                this.editor.setSize(null, '100%');
                
                const defaultCode = `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`;
                this.editor.setValue(defaultCode);
                
            } catch (e) {
                console.error('Editor init error:', e);
            }
        }

        setupEventListeners() {
            document.getElementById('languageSelect')?.addEventListener('change', (e) => {
                this.language = e.target.value;
                this.updateStarterCode();
            });

            document.getElementById('runCodeBtn')?.addEventListener('click', () => this.runCode());
            document.getElementById('submitBtn')?.addEventListener('click', () => this.submitSolution());
            document.getElementById('resetCodeBtn')?.addEventListener('click', () => this.updateStarterCode());
            document.getElementById('clearOutputBtn')?.addEventListener('click', () => this.clearOutput());
        }

        async loadTodayChallenge() {
            try {
                const token = localStorage.getItem('stcc_token');
                console.log('📡 Fetching challenge from:', `${API_URL}/challenges/today`);
                
                const response = await fetch(`${API_URL}/challenges/today`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 Response status:', response.status);

                if (!response.ok) {
                    if (response.status === 401) {
                        console.log('🔑 Token expired, redirecting to login');
                        localStorage.clear();
                        window.location.href = 'login.html';
                        return;
                    }
                    const text = await response.text();
                    console.log('📡 Response body:', text);
                    throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
                }

                const data = await response.json();
                console.log('📡 Challenge data:', data);
                
                if (!data.success) throw new Error(data.message);

                this.currentChallenge = data.challenge;
                this.renderChallenge(this.currentChallenge);
                if (this.currentChallenge.isSolved) this.showSolvedStatus();

            } catch (error) {
                console.error('❌ Load error:', error);
                this.showError('Failed to load challenge: ' + error.message);
            }
        }

        renderChallenge(challenge) {
            document.getElementById('challengeDay').textContent = `Day ${challenge.dayNumber || '?'}`;
            document.getElementById('problemTitle').textContent = challenge.title || 'Challenge';
            
            const badge = document.getElementById('difficultyBadge');
            badge.textContent = challenge.difficulty || 'Medium';
            badge.className = `difficulty-badge ${(challenge.difficulty || 'medium').toLowerCase()}`;
            
            document.getElementById('pointsValue').textContent = challenge.points || 10;
            document.getElementById('problemDescription').innerHTML = (challenge.description || '').replace(/\n/g, '<br>');
            document.getElementById('constraintsText').textContent = challenge.constraints || 'None';
            document.getElementById('inputFormatText').textContent = challenge.inputFormat || 'Not specified';
            document.getElementById('outputFormatText').textContent = challenge.outputFormat || 'Not specified';
            document.getElementById('examplesText').textContent = challenge.examples || 'No examples';

            const select = document.getElementById('languageSelect');
            const langs = challenge.allowedLanguages || ['cpp', 'python', 'java', 'javascript'];
            const names = { 
                'python': 'Python 3', 
                'cpp': 'C++', 
                'java': 'Java', 
                'javascript': 'JavaScript',
                'c': 'C',
                'go': 'Go',
                'rust': 'Rust'
            };
            
            select.innerHTML = '';
            langs.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l;
                opt.textContent = names[l] || l;
                select.appendChild(opt);
            });
            
            this.language = langs[0] || 'cpp';
            select.value = this.language;
            this.starterCodes = challenge.starterCode || {};
            this.updateStarterCode();
        }

        updateStarterCode() {
            if (!this.editor) return;
            const code = this.starterCodes[this.language] || this.getDefaultStarter(this.language);
            this.editor.setValue(code);
            this.editor.clearHistory();
        }

        getDefaultStarter(language) {
            const starters = {
                'cpp': `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`,
                'python': `# Write your solution here\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()`,
                'java': `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`,
                'javascript': `// Write your solution here\n\nfunction solve() {\n    // Write your solution here\n}\n\nsolve();`
            };
            return starters[language] || '// Write your solution here';
        }

        async runCode() {
            if (this.isRunning || !this.currentChallenge) return;
            this.isRunning = true;
            this.setStatus('Running...', 'loading');
            document.getElementById('runCodeBtn').disabled = true;

            try {
                const token = localStorage.getItem('stcc_token');
                const code = this.editor.getValue();
                
                console.log('🔧 Running code...');
                
                const response = await fetch(`${API_URL}/challenges/run`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        challengeId: this.currentChallenge._id,
                        language: this.language,
                        code: code
                    })
                });

                console.log('📡 Run response status:', response.status);

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
                }

                const data = await response.json();
                if (!data.success) throw new Error(data.message);
                
                this.displayRunResults(data);

            } catch (error) {
                console.error('❌ Run error:', error);
                this.displayOutput(`❌ Error: ${error.message}`, 'error');
            } finally {
                this.isRunning = false;
                document.getElementById('runCodeBtn').disabled = false;
                this.setStatus('Ready', '');
            }
        }

        displayRunResults(data) {
            let output = '';
            output += `📊 Run Results\n`;
            output += `${'='.repeat(50)}\n\n`;
            
            if (data.results && data.results.length > 0) {
                data.results.forEach((r, i) => {
                    const icon = r.passed ? '✅' : '❌';
                    output += `Test Case ${i+1}: ${icon}\n`;
                    output += `  Input:    ${r.input.trim()}\n`;
                    output += `  Expected: ${r.expectedOutput.trim()}\n`;
                    output += `  Got:      ${r.actualOutput.trim()}\n`;
                    if (r.error) {
                        output += `  Error:    ${r.error}\n`;
                    }
                    if (r.executionTime) {
                        output += `  Time:     ${r.executionTime.toFixed(2)}ms\n`;
                    }
                    output += `\n`;
                });
            } else {
                output += 'No test results available.\n';
            }
            
            output += `${'='.repeat(50)}\n`;
            output += `Passed: ${data.passedCount || 0}/${data.totalCount || 0}\n`;
            if (data.allPassed) {
                output += '✅ All test cases passed!\n';
            } else {
                output += '❌ Some test cases failed.\n';
            }
            
            this.displayOutput(output, data.allPassed ? 'success' : 'error');
        }

        async submitSolution() {
            if (this.isSubmitting || !this.currentChallenge) return;
            
            if (this.currentChallenge.isSolved) {
                this.displayOutput('✅ You already solved this challenge! Points were already awarded.', 'success');
                return;
            }

            this.isSubmitting = true;
            this.setStatus('Submitting...', 'loading');
            document.getElementById('submitBtn').disabled = true;

            try {
                const token = localStorage.getItem('stcc_token');
                const code = this.editor.getValue();
                
                console.log('📤 Submitting solution...');
                
                const response = await fetch(`${API_URL}/challenges/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        challengeId: this.currentChallenge._id,
                        language: this.language,
                        code: code
                    })
                });

                console.log('📡 Submit response status:', response.status);

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
                }

                const data = await response.json();
                if (!data.success) throw new Error(data.message);

                this.displaySubmissionResults(data);
                
                if (data.submission && data.submission.isAccepted) {
                    this.currentChallenge.isSolved = true;
                    this.showSolvedStatus();
                }

            } catch (error) {
                console.error('❌ Submit error:', error);
                this.displayOutput(`❌ ${error.message}`, 'error');
            } finally {
                this.isSubmitting = false;
                document.getElementById('submitBtn').disabled = false;
                this.setStatus('Ready', '');
            }
        }

        displaySubmissionResults(data) {
            const s = data.submission;
            let output = '';
            
            const isAccepted = s.isAccepted === true;
            const allTestsPassed = s.passedTests === s.totalTests;
            const isDuplicate = allTestsPassed && !isAccepted;
            const pointsAwarded = s.pointsAwarded || 0;
            
            // Header
            output += `📊 Submission Results\n`;
            output += `${'='.repeat(55)}\n`;
            
            if (isDuplicate) {
                output += `Status: ⚠️ ALREADY SOLVED\n`;
                output += `Passed: ${s.passedTests}/${s.totalTests}\n`;
                output += `Execution Time: ${(s.executionTime || 0).toFixed(2)}ms\n`;
                output += `Memory Used: ${(s.memoryUsed || 0).toFixed(0)}KB\n\n`;
                output += `${'─'.repeat(55)}\n`;
                output += `\n✅ All tests passed! You have already solved this challenge.\n`;
                output += `   Points were not awarded because this is a duplicate submission.\n`;
                
                if (data.userStats) {
                    output += `\n📈 Your Stats:\n`;
                    output += `  Rank:          #${data.userStats.rank || '?'}\n`;
                    output += `  Total Points:  ${data.userStats.totalPoints || 0}\n`;
                    output += `  Problems Solved: ${data.userStats.problemsSolved || 0}\n`;
                    output += `  Current Streak: ${data.userStats.currentStreak || 0} day(s)\n`;
                }
                
                this.displayOutput(output, 'warning');
                return;
            }
            
            output += `Status: ${isAccepted ? '✅ ACCEPTED' : '❌ REJECTED'}\n`;
            output += `Passed: ${s.passedTests}/${s.totalTests}\n`;
            output += `Execution Time: ${(s.executionTime || 0).toFixed(2)}ms\n`;
            output += `Memory Used: ${(s.memoryUsed || 0).toFixed(0)}KB\n`;
            
            if (pointsAwarded > 0) {
                output += `Points Awarded: +${pointsAwarded}\n`;
            }
            output += `\n`;
            
            // Show ALL test cases with details
            if (data.testResults && data.testResults.length > 0) {
                output += `${'─'.repeat(55)}\n`;
                output += `📝 All Test Results (${data.testResults.length} total):\n\n`;
                
                const passedTests = data.testResults.filter(r => r.passed === true);
                const failedTests = data.testResults.filter(r => r.passed !== true);
                
                if (failedTests.length > 0) {
                    output += `❌ Failed Tests (${failedTests.length}):\n`;
                    output += `${'─'.repeat(50)}\n`;
                    failedTests.forEach((result, index) => {
                        const hiddenTag = result.isHidden ? ' [HIDDEN]' : '';
                        output += `\nTest ${index + 1}: ❌${hiddenTag}\n`;
                        output += `  Input:    ${(result.input || '').trim()}\n`;
                        output += `  Expected: ${(result.expectedOutput || '').trim()}\n`;
                        output += `  Got:      ${(result.actualOutput || '').trim()}\n`;
                        if (result.error) {
                            output += `  Error:    ${result.error}\n`;
                        }
                        if (result.executionTime) {
                            output += `  Time:     ${result.executionTime.toFixed(2)}ms\n`;
                        }
                    });
                    output += `\n`;
                }
                
                if (passedTests.length > 0) {
                    output += `✅ Passed Tests (${passedTests.length}):\n`;
                    output += `${'─'.repeat(50)}\n`;
                    passedTests.forEach((result, index) => {
                        const hiddenTag = result.isHidden ? ' [HIDDEN]' : '';
                        const testNum = failedTests.length + index + 1;
                        output += `\nTest ${testNum}: ✅${hiddenTag}\n`;
                        output += `  Input:    ${(result.input || '').trim()}\n`;
                        output += `  Expected: ${(result.expectedOutput || '').trim()}\n`;
                        output += `  Got:      ${(result.actualOutput || '').trim()}\n`;
                        if (result.executionTime) {
                            output += `  Time:     ${result.executionTime.toFixed(2)}ms\n`;
                        }
                    });
                }
            }
            
            // Summary
            output += `\n${'─'.repeat(55)}\n`;
            
            if (isAccepted) {
                if (pointsAwarded > 0) {
                    output += `\n🎉 Congratulations! +${pointsAwarded} points awarded!\n`;
                } else {
                    output += `\n✅ All tests passed! You already earned points for this challenge.\n`;
                }
                
                if (data.userStats) {
                    output += `\n📈 Your Stats:\n`;
                    output += `  Rank:          #${data.userStats.rank || '?'}\n`;
                    output += `  Total Points:  ${data.userStats.totalPoints || 0}\n`;
                    output += `  Problems Solved: ${data.userStats.problemsSolved || 0}\n`;
                    output += `  Current Streak: ${data.userStats.currentStreak || 0} day(s)\n`;
                }
            } else {
                const failedCount = data.testResults ? data.testResults.filter(r => r.passed !== true).length : 0;
                output += `\n💡 Hint: ${failedCount} test case(s) failed. Check the failed tests above.\n`;
                output += `   Make sure your code handles all edge cases correctly.\n`;
            }
            
            this.displayOutput(output, isAccepted ? 'success' : 'error');
        }

        displayOutput(text, type) {
            const el = document.getElementById('outputBody');
            if (el) {
                el.innerHTML = text.replace(/\n/g, '<br>');
                el.className = 'output-body' + (type ? ' ' + type : '');
            }
        }

        clearOutput() {
            const el = document.getElementById('outputBody');
            if (el) {
                el.innerHTML = `
                    <div class="output-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Run your code to see output here</p>
                    </div>
                `;
                el.className = 'output-body';
            }
        }

        setStatus(text, type) {
            const el = document.getElementById('editorStatus');
            if (el) {
                el.textContent = text;
                el.className = 'editor-status' + (type ? ' ' + type : '');
            }
        }

        showSolvedStatus() {
            const el = document.getElementById('statusIndicator');
            if (el) {
                el.className = 'status-indicator solved';
                const statusText = el.querySelector('.status-text');
                if (statusText) statusText.textContent = '✅ Solved!';
            }
        }

        showError(message) {
            const el = document.getElementById('outputBody');
            if (el) {
                el.innerHTML = `<div style="color: #ef4444; padding: 12px;">❌ ${message}</div>`;
            }
        }
    }

    console.log('🚀 Initializing Daily Challenge...');
    const controller = new DailyChallengeController();
    window.dailyChallengeController = controller;

})();