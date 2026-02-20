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
        <div class="feature-card-plain">
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
    loadAppFeatures();
});
