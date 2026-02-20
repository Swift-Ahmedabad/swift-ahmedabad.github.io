const contactIcons = {
    checkmark: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
    building: `<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>`,
    email: `<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>`
};

async function loadContactPage() {
    try {
        const contactResponse = await fetch('contact.json');
        const contactData = await contactResponse.json();
        
        document.querySelector('#contact-tab .header h1').textContent = contactData.contact.title;
        document.querySelector('#contact-tab .header p').textContent = contactData.contact.subtitle;
        
        const contactContainer = document.getElementById('contact-container');
        contactContainer.innerHTML = contactData.items.map(item => createContactCard(item)).join('');
    } catch (error) {
        console.error('Error loading contact page:', error);
    }
}

function createContactCard(item) {
    const iconSvg = contactIcons[item.icon] || contactIcons.email;
    
    if (item.id === 'sponsor') {
        return `
            <button class="bento-item contact-card" data-sponsor-button>
                <div class="contact-icon">
                    <svg viewBox="0 0 24 24" class="social-icon" aria-hidden="true">
                        ${iconSvg}
                    </svg>
                </div>
                <div class="contact-info">
                    <h2>${item.title}</h2>
                    <p>${item.description}</p>
                </div>
            </button>
        `;
    }
    
    const href = item.email ? `mailto:${item.email}` : (item.url || '#');
    const target = item.email ? '' : 'target="_blank" rel="noopener noreferrer"';
    
    return `
        <a href="${href}" ${target} class="bento-item contact-card">
            <div class="contact-icon">
                <svg viewBox="0 0 24 24" class="social-icon" aria-hidden="true">
                    ${iconSvg}
                </svg>
            </div>
            <div class="contact-info">
                <h2>${item.title}</h2>
                <p>${item.description}</p>
            </div>
        </a>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadContactPage();
    
    document.addEventListener('click', async (e) => {
        const sponsorButton = e.target.closest('[data-sponsor-button]');
        if (sponsorButton) {
            try {
                const response = await fetch('sponsorship-email.json');
                const emailData = await response.json();
                const contactResponse = await fetch('contact.json');
                const contactData = await contactResponse.json();
                const sponsorItem = contactData.items.find(item => item.id === 'sponsor');
                
                const mailtoLink = `mailto:${sponsorItem.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
                window.location.href = mailtoLink;
            } catch (error) {
                console.error('Error loading sponsorship email:', error);
            }
        }
    });
});
