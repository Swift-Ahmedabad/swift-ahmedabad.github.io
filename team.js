async function loadTeamMembers() {
    try {
        const teamResponse = await fetch('team.json');
        const teamData = await teamResponse.json();
        
        const teamContainer = document.getElementById('team-container');
        teamContainer.innerHTML = teamData.members.map(member => createMemberCard(member)).join('');
    } catch (error) {
        console.error('Error loading team members:', error);
    }
}

function createMemberCard(member) {
    const destination = member.profileUrl ?? member.linkedIn;
    if (![member.name, member.about, destination].every(value => typeof value === 'string' && value.trim())) throw new Error('Incomplete profile');
    const url = new URL(destination);
    if (url.protocol !== 'https:') throw new Error('Unsupported profile URL');
    if (member.image && !/^assets\/speakers\/[\w.-]+\.(?:jpe?g|png)$/.test(member.image)) throw new Error('Unsupported profile image');
    const text = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
    // ponytail: source portraits can reach 1.3 MB; add verified thumbnails if the gallery grows.
    return `
        <a href="${text(url.href)}" target="_blank" rel="noopener noreferrer" class="bento-item team-card">
            <div class="team-avatar">
                <span class="team-initial" aria-hidden="true">${text(member.name.charAt(0))}</span>
                ${member.image ? `<img class="profile-photo" src="${text(member.image)}" alt="" width="80" height="80" loading="lazy" decoding="async">` : ''}
            </div>
            <div class="team-info">
                <h2>${text(member.name)}</h2>
                ${member.role ? `<p>${text(member.role)}</p>` : ''}
                <p>${text(member.about)}</p>
            </div>
        </a>
    `;
}

async function loadSpeakers() {
    const container = document.getElementById('speakers-container');
    try {
        const response = await fetch('speakers.json');
        if (!response.ok) throw new Error('Could not load speakers');
        const data = await response.json();
        container.innerHTML = data.speakers.map(createMemberCard).join('');
    } catch (error) {
        container.innerHTML = '<p role="status">Speaker profiles could not load. Reload this page to try again.</p>';
        console.error('Error loading speaker profiles:', error);
    }
}

document.addEventListener('error', event => { if (event.target?.matches?.('.profile-photo')) event.target.remove(); }, true);

document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
    loadSpeakers();
});
