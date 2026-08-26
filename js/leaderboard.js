// ===== LEADERBOARD CONTROLLER =====
(function() {
    'use strict';

    const API_URL = window.API_URL || 'http://localhost:5000/api';

    class LeaderboardController {
        constructor() {
            this.leaderboard = [];
            this.myStats = null;
            this.currentFilter = {
                department: 'ALL',
                year: 'ALL',
                search: ''
            };
            this.debounceTimeout = null;

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }

        async init() {
            console.log('🚀 Leaderboard Controller initializing...');
            console.log(`📡 API URL: ${API_URL}`);
            
            this.setupEventListeners();
            await this.loadLeaderboard();
            await this.loadMyStats();

            setInterval(() => {
                this.loadLeaderboard();
            }, 60000);
        }

        setupEventListeners() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(this.debounceTimeout);
                    this.debounceTimeout = setTimeout(() => {
                        this.currentFilter.search = e.target.value.trim();
                        this.loadLeaderboard();
                    }, 300);
                });
            }

            const deptFilter = document.getElementById('departmentFilter');
            if (deptFilter) {
                deptFilter.addEventListener('change', (e) => {
                    this.currentFilter.department = e.target.value;
                    this.loadLeaderboard();
                });
            }

            const yearFilter = document.getElementById('yearFilter');
            if (yearFilter) {
                yearFilter.addEventListener('change', (e) => {
                    this.currentFilter.year = e.target.value;
                    this.loadLeaderboard();
                });
            }

            const refreshBtn = document.getElementById('refreshLeaderboardBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.loadLeaderboard();
                    this.loadMyStats();
                });
            }
        }

        async loadLeaderboard() {
            const loading = document.getElementById('leaderboardLoading');
            const empty = document.getElementById('leaderboardEmpty');
            const table = document.getElementById('leaderboardTable');
            const tbody = document.getElementById('leaderboardBody');

            if (loading) loading.style.display = 'block';
            if (empty) empty.style.display = 'none';
            if (table) table.style.display = 'none';

            try {
                const params = new URLSearchParams();
                if (this.currentFilter.department !== 'ALL') {
                    params.append('department', this.currentFilter.department);
                }
                if (this.currentFilter.year !== 'ALL') {
                    params.append('year', this.currentFilter.year);
                }
                if (this.currentFilter.search) {
                    params.append('search', this.currentFilter.search);
                }

                const url = `${API_URL}/leaderboard?${params.toString()}`;
                console.log(`📡 Fetching leaderboard from: ${url}`);

                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('📡 Leaderboard data received:', data);

                if (!data.success) {
                    throw new Error(data.message || 'Failed to load leaderboard');
                }

                this.leaderboard = data.leaderboard || [];

                const totalEl = document.getElementById('totalStudents');
                if (totalEl) {
                    totalEl.textContent = `${data.totalStudents || this.leaderboard.length} students`;
                }

                if (this.leaderboard.length === 0) {
                    if (loading) loading.style.display = 'none';
                    if (empty) empty.style.display = 'block';
                    return;
                }

                this.renderPodium(this.leaderboard);
                this.renderTable(this.leaderboard);

                if (loading) loading.style.display = 'none';
                if (table) table.style.display = 'table';

            } catch (error) {
                console.error('❌ Load leaderboard error:', error);
                if (loading) {
                    loading.innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                        <p>Failed to load leaderboard: ${error.message}</p>
                        <button class="btn btn-secondary btn-sm" onclick="location.reload()" style="margin-top: 12px;">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    `;
                }
            }
        }

        renderPodium(leaderboard) {
            const wrapper = document.getElementById('podiumWrapper');
            if (!wrapper) return;

            const top3 = leaderboard.slice(0, 3);

            if (top3.length === 0) {
                wrapper.innerHTML = '';
                return;
            }

            const ordered = [
                top3[1] || null,
                top3[0] || null,
                top3[2] || null
            ];

            const positions = ['second', 'first', 'third'];
            const stepClasses = ['silver', 'gold', 'bronze'];

            let html = '';
            ordered.forEach((user, index) => {
                if (!user) {
                    html += `<div class="podium-item" style="opacity: 0.3;"></div>`;
                    return;
                }

                const initials = user.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                html += `
                    <div class="podium-item ${positions[index]}">
                        ${index === 1 ? '<div class="podium-crown">👑</div>' : ''}
                        <div class="podium-rank">#${user.rank}</div>
                        <div class="podium-avatar">${initials}</div>
                        <div class="podium-name">${user.name}</div>
                        <div class="podium-points">${user.totalPoints || 0} pts</div>
                        <div class="podium-step ${stepClasses[index]}"></div>
                    </div>
                `;
            });

            wrapper.innerHTML = html;
        }

        renderTable(leaderboard) {
            const tbody = document.getElementById('leaderboardBody');
            if (!tbody) return;

            const currentUserId = this.myStats?._id;

            let html = '';
            leaderboard.forEach((user) => {
                const isCurrentUser = currentUserId && user._id === currentUserId;
                const rankClass = user.rank <= 3 ? `rank-${user.rank}` : '';
                const initials = user.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                html += `
                    <tr class="${isCurrentUser ? 'current-user' : ''}">
                        <td class="rank-cell ${rankClass}">#${user.rank}</td>
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar">${initials}</div>
                                <div>
                                    <div class="user-name">${user.name}</div>
                                    <div class="user-regno">${user.registrationNo || ''}</div>
                                </div>
                            </div>
                        </td>
                        <td class="points-cell">${user.totalPoints || 0}</td>
                        <td class="solved-cell">${user.problemsSolved || 0}</td>
                        <td class="bonus-cell">${user.eventBonusPoints || 0}</td>
                        <td class="streak-cell">${user.currentStreak || 0}🔥</td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        }

        async loadMyStats() {
            try {
                const token = localStorage.getItem('stcc_token');
                if (!token) {
                    const card = document.getElementById('myStatsCard');
                    if (card) card.style.display = 'none';
                    return;
                }

                const url = `${API_URL}/leaderboard/me`;
                console.log(`📡 Fetching my stats from: ${url}`);

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        const card = document.getElementById('myStatsCard');
                        if (card) card.style.display = 'none';
                        return;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.message || 'Failed to load your stats');
                }

                this.myStats = data.stats;

                // Update stats card
                const nameEl = document.getElementById('myName');
                if (nameEl) nameEl.textContent = data.stats.name || 'Student';
                
                const regEl = document.getElementById('myRegNo');
                if (regEl) regEl.textContent = data.stats.registrationNo || '';
                
                const rankEl = document.getElementById('myRank');
                if (rankEl) rankEl.textContent = data.stats.rank ? `#${data.stats.rank}` : '-';
                
                const pointsEl = document.getElementById('myPoints');
                if (pointsEl) pointsEl.textContent = data.stats.totalPoints || 0;
                
                const solvedEl = document.getElementById('mySolved');
                if (solvedEl) solvedEl.textContent = data.stats.problemsSolved || 0;
                
                const streakEl = document.getElementById('myStreak');
                if (streakEl) streakEl.textContent = data.stats.currentStreak || 0;

                const card = document.getElementById('myStatsCard');
                if (card) card.style.display = 'block';

            } catch (error) {
                console.error('❌ Load my stats error:', error);
                const card = document.getElementById('myStatsCard');
                if (card) card.style.display = 'none';
            }
        }
    }

    console.log('🚀 Leaderboard page loading...');
    const controller = new LeaderboardController();

})();