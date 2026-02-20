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
    return `
        <a href="${member.linkedIn}" target="_blank" rel="noopener noreferrer" class="bento-item team-card">
            <div class="team-avatar">
                <span class="team-initial">${member.name.charAt(0)}</span>
            </div>
            <div class="team-info">
                <h3>${member.name}</h3>
                <p>${member.about}</p>
            </div>
        </a>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
});
