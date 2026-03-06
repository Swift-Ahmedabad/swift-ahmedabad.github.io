async function loadAppFeatures() {
    try {
        const appResponse = await fetch('app.json');
        const appData = await appResponse.json();
        
        document.getElementById('app-name').textContent = appData.app.name;
        document.getElementById('app-tagline').textContent = appData.app.tagline;
        document.getElementById('app-description').textContent = appData.app.description;
        document.getElementById('testflight-btn').href = appData.app.testFlightUrl;
        
        const featuresContainer = document.getElementById('app-features-container');
        featuresContainer.innerHTML = appData.features.map(feature => createFeatureCard(feature)).join('');
    } catch (error) {
        console.error('Error loading app features:', error);
    }
}

function createFeatureCard(feature) {
    return `
        <div class="feature-card-plain" data-feature-id="${feature.id}">
            <div class="feature-content-plain">
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
            <div class="feature-image-plain">
                <div class="iphone-bezel">
                    <img src="${feature.image}" alt="${feature.title}" loading="lazy">
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadAppFeatures().then(() => {
        setTimeout(checkHashForFeature, 500);
    });
    
    window.addEventListener('hashchange', () => {
        setTimeout(checkHashForFeature, 100);
    });
    
    document.addEventListener('click', (e) => {
        const featureCard = e.target.closest('.feature-card-plain');
        if (featureCard) {
            const featureId = featureCard.dataset.featureId;
            window.location.hash = `app/${featureId}`;
        }
    });
});

function checkHashForFeature() {
    const appTab = document.getElementById('app-tab');
    if (!appTab.classList.contains('active')) return;
    
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('app/')) {
        const featureId = hash.slice(4);
        tryHighlightAppFeature(featureId);
    }
}

function tryHighlightAppFeature(featureId, retries = 10) {
    const featureCard = document.querySelector(`.feature-card-plain[data-feature-id="${featureId}"]`);
    if (featureCard) {
        setTimeout(() => {
            featureCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            featureCard.style.boxShadow = '0 0 0 3px #F79918, 0 4px 12px rgba(0,0,0,0.15)';
            setTimeout(() => {
                featureCard.style.boxShadow = '';
            }, 3000);
        }, 200);
    } else if (retries > 0) {
        setTimeout(() => tryHighlightAppFeature(featureId, retries - 1), 100);
    }
}
