// Icon SVGs
const icons = {
    twitter: `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>`,
    github: `<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>`,
    linkedin: `<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>`,
    luma: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/>`,
    whatsapp: `<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>`,
    instagram: `<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>`,
    aratt: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    discord: `<path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>`,
    maps: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>`
};

async function loadContent() {
    try {
        // Load links.json
        const linksResponse = await fetch('links.json');
        const linksData = await linksResponse.json();
        
        // Render community info
        document.getElementById('community-name').textContent = linksData.community.name;
        document.getElementById('community-tagline').textContent = linksData.community.tagline;
        document.getElementById('community-logo').src = linksData.community.logo;
        document.getElementById('community-logo').alt = linksData.community.name + ' Logo';
        document.getElementById('navbar-logo-img').src = linksData.community.logo;
        document.getElementById('navbar-logo-img').alt = linksData.community.name + ' Logo';
        document.title = linksData.community.name;
        
        // Load stats.json
        const statsResponse = await fetch('stats.json');
        const statsData = await statsResponse.json();
        
        // Render stats
        const statsContainer = document.getElementById('stats-container');
        statsContainer.innerHTML = createStatsHTML(statsData);
        
        // Render links
        const container = document.getElementById('links-container');
        container.innerHTML = linksData.links.map(link => createCard(link)).join('');
        
        // Load team.json
        // (Now loaded in team.js)
        
        // Load app.json
        const appResponse = await fetch('app.json');
        const appData = await appResponse.json();
        
        // Render app info
        document.getElementById('app-name').textContent = appData.app.name;
        document.getElementById('app-tagline').textContent = appData.app.tagline;
        document.getElementById('app-description').textContent = appData.app.description;
        document.getElementById('testflight-btn').href = appData.app.testFlightUrl;
        document.getElementById('app-icon').src = appData.app.icon;
        
        // Render app features
        // (Now loaded in swift-talks.js)
        
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('links-container').innerHTML = '<p style="text-align: center; color: #888;">Error loading links. Please try again later.</p>';
    }
}

function createCard(link) {
    const iconSvg = icons[link.icon] || icons.twitter;
    
    if (link.isMap) {
        return `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="bento-item card ${link.id}">
                <div class="map-background">
                    <iframe 
                        src="${link.mapUrl}" 
                        width="100%" 
                        height="100%" 
                        style="border:0;" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                    <div class="map-overlay"></div>
                </div>
                <div class="map-content">
                    <div class="icon-wrapper">
                        <svg viewBox="0 0 24 24" class="social-icon" aria-hidden="true">
                            ${iconSvg}
                        </svg>
                    </div>
                    <div class="card-content">
                        <h2>${link.name}</h2>
                        ${link.description ? `<p>${link.description}</p>` : ''}
                    </div>
                </div>
            </a>
        `;
    }
    
    return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="bento-item card ${link.id}">
            <div class="icon-wrapper">
                <svg viewBox="0 0 24 24" class="social-icon" aria-hidden="true">
                    ${iconSvg}
                </svg>
            </div>
            <div class="card-content">
                <h2>${link.name}</h2>
                <p>${link.description}</p>
            </div>
        </a>
    `;
}

function createStatsHTML(statsData) {
    const { year, stats } = statsData;
    
    const statsArray = [
        { key: 'totalEvents', value: stats.totalEvents, label: 'Events' },
        { key: 'totalParticipants', value: stats.totalParticipants, label: 'Participants' },
        { key: 'averageParticipants', value: stats.averageParticipants, label: 'Avg/Event' },
        { key: 'totalSpeakers', value: stats.totalSpeakers, label: 'Speakers' },
        { key: 'topicsCovered', value: stats.topicsCovered, label: 'Topics' },
        { key: 'totalVenues', value: stats.totalVenues, label: 'Venues' },
        { key: 'totalSponsors', value: stats.totalSponsors, label: 'Sponsors' }
    ];
    
    const groupedStats = {};
    statsArray.forEach(stat => {
        if (!groupedStats[stat.value]) {
            groupedStats[stat.value] = [];
        }
        groupedStats[stat.value].push(stat.key);
    });
    
    const groupsWithMultiple = Object.entries(groupedStats)
        .filter(([value, keys]) => keys.length > 1)
        .map(([value, keys]) => ({ value: parseInt(value), keys }));
    
    return `
        <div class="stats-card">
            <div class="stats-header">
                <h2>Year 2025</h2>
            </div>
            <div class="stats-grid-inner">
                ${statsArray.map(stat => `
                    <div class="stat-item" data-stat-key="${stat.key}" data-stat-value="${stat.value}">
                        <span class="stat-number">${stat.value}</span>
                        <span class="stat-label">${stat.label}</span>
                    </div>
                `).join('')}
            </div>
            ${groupsWithMultiple.length > 0 ? `
                <p class="stats-hint">Psst! Try tapping all stats with the same number...</p>
            ` : ''}
        </div>
    `;
}

// Load content when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    initTabs();
    initStatsGame();
});

function initStatsGame() {
    const statsContainer = document.getElementById('stats-container');
    
    statsContainer.addEventListener('click', (e) => {
        const statItem = e.target.closest('.stat-item');
        if (!statItem) return;
        
        const statValue = statItem.dataset.statValue;
        
        statItem.classList.toggle('stat-clicked');
        
        const allWithValue = document.querySelectorAll(`[data-stat-value="${statValue}"]`);
        const clickedWithValue = document.querySelectorAll(`[data-stat-value="${statValue}"].stat-clicked`);
        
        if (allWithValue.length > 1 && clickedWithValue.length === allWithValue.length) {
            triggerConfetti();
            
            setTimeout(() => {
                allWithValue.forEach(item => item.classList.remove('stat-clicked'));
            }, 2000);
        }
    });
}

function triggerConfetti() {
    const colors = ['#F79918', '#000000', '#ffffff', '#FF6B6B', '#4ECDC4'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            0% { top: -20px; opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        const size = 6 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.5 + Math.random() * 1.5;
        const rotation = Math.random() * 720;
        const xOffset = (Math.random() - 0.5) * 150;
        
        confetti.style.cssText = `
            position:absolute;
            width:${size}px;
            height:${size}px;
            background:${color};
            left:${left}%;
            top:-20px;
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
            animation:confetti-fall ${duration}s linear ${delay}s forwards;
            transform:translateX(${xOffset}px) rotate(${rotation}deg);
            will-change:transform,opacity;
        `;
        container.appendChild(confetti);
    }
    
    setTimeout(() => {
        container.remove();
        style.remove();
    }, 3000);
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const navbarLogoBtn = document.getElementById('navbar-logo-btn');
    const contactBtn = document.getElementById('contact-btn');
    
    function switchTab(tabName) {
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        const targetContent = document.getElementById(`${tabName}-tab`);
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetContent) targetContent.classList.add('active');
        if (targetButton) targetButton.classList.add('active');
    }
    
    function handleHashChange() {
        const hash = window.location.hash.slice(1);
        
        if (hash.startsWith('app/')) {
            const featureId = hash.slice(4);
            switchTab('app');
        } else if (hash === 'team' || hash === 'app' || hash === 'contact') {
            switchTab(hash);
        } else {
            switchTab('community');
            window.location.hash = '';
        }
    }
    
    window.addEventListener('hashchange', handleHashChange);
    
    navbarLogoBtn.addEventListener('click', () => {
        window.location.hash = '';
    });
    
    contactBtn.addEventListener('click', () => {
        window.location.hash = 'contact';
    });
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            window.location.hash = tabId;
        });
    });
    
    handleHashChange();
}
