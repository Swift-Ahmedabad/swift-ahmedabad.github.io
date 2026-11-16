// Run with: node navigation.check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';

function element(dataset = {}) {
    const classes = new Set();
    return {
        dataset, attributes: {}, events: {},
        classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
        setAttribute(name, value) { this.attributes[name] = value; },
        removeAttribute(name) { delete this.attributes[name]; },
        addEventListener(name, callback) { this.events[name] = callback; },
        focus() { document.activeElement = this; }
    };
}

const tabs = ['community', 'team', 'speakers', 'app', 'support', 'contact'];
const contents = Object.fromEntries(tabs.map(name => [`${name}-tab`, element()]));
const buttons = ['community', 'team', 'speakers', 'app', 'contact'].flatMap(tab => [element({ tab }), element({ tab })]);
const peopleContainers = { 'team-container': { innerHTML: '' }, 'speakers-container': { innerHTML: '' } };
const logo = element();
const contact = element();
const summary = element();
const menu = { open: false, contains: node => node === summary, querySelector: () => summary };
summary.closest = () => null;
const documentEvents = {};
const windowEvents = {};
const document = {
    activeElement: null,
    addEventListener(name, callback) { documentEvents[name] = callback; },
    getElementById: id => contents[id] || peopleContainers[id] || { 'navbar-logo-btn': logo, 'contact-btn': contact }[id],
    querySelector: () => menu,
    querySelectorAll: selector => selector === '.tab-content' ? Object.values(contents) : selector === '.tab-button' ? buttons : buttons.filter(button => selector === `[data-tab="${button.dataset.tab}"]`)
};
const window = { location: { hash: '#team' }, addEventListener(name, callback) { windowEvents[name] = callback; } };
const context = { document, window, URL };
runInNewContext(readFileSync(new URL('./app.js', import.meta.url), 'utf8'), context);
context.initTabs();

for (const [hash, expected] of [['#team', 'team'], ['#speakers', 'speakers'], ['#app', 'app'], ['#app/feature-1', 'app'], ['#contact', 'contact'], ['#support', 'support'], ['', 'community'], ['#unknown', 'community']]) {
    window.location.hash = hash;
    windowEvents.hashchange();
    assert.deepEqual(Object.entries(contents).filter(([, node]) => node.classList.contains('active')).map(([id]) => id), [`${expected}-tab`]);
    for (const button of buttons) {
        assert.equal(button.classList.contains('active'), button.dataset.tab === expected, 'Desktop and mobile selection agree');
        assert.equal(button.attributes['aria-current'], button.dataset.tab === expected ? 'page' : undefined);
    }
}
logo.events.click();
assert.equal(window.location.hash, '');
contact.events.click();
assert.equal(window.location.hash, 'contact');

menu.open = true;
documentEvents.click({ target: summary });
assert.equal(menu.open, true, 'Menu stays open for inside interactions');
documentEvents.keydown({ key: 'Tab' });
assert.equal(menu.open, true);
documentEvents.keydown({ key: 'Escape' });
assert.equal(menu.open, false);
assert.equal(document.activeElement, summary, 'Escape restores control focus');
menu.open = true;
documentEvents.click({ target: { closest: () => null } });
assert.equal(menu.open, false, 'Outside clicks dismiss the menu');
menu.open = true;
documentEvents.click({ target: { closest: selector => selector === '.navbar-menu a' ? {} : null } });
assert.equal(menu.open, false, 'Following a menu link dismisses the menu');

const html = readFileSync(new URL('./community.html', import.meta.url), 'utf8');
assert.ok(!html.includes('id="stats-container"'), 'The homepage omits disputed annual totals');
const nav = html.match(/<nav[\s\S]*?<\/nav>/)[0];
for (const [tab, hash] of [['community', ''], ['speakers', 'speakers'], ['team', 'team'], ['app', 'app'], ['contact', 'contact']]) {
    assert.ok(nav.includes(`href="#${hash}"`), `${tab} keeps native hash navigation`);
}
runInNewContext(readFileSync(new URL('./team.js', import.meta.url), 'utf8'), context);
let failSpeakers = false;
context.console = { error() {} };
context.fetch = async path => ({ ok: !failSpeakers || path !== 'speakers.json', json: async () => JSON.parse(readFileSync(new URL(`./${path}`, import.meta.url), 'utf8')) });
await context.loadTeamMembers();
const teamHTML = peopleContainers['team-container'].innerHTML;
assert.ok(teamHTML.includes('Abhishek Patel') && teamHTML.includes('Senior iOS developer'));
assert.ok(teamHTML.includes('href="https://abhishek-patel-in.github.io/"'), 'Retained crew supports the supplied personal website');
await context.loadSpeakers();
const speakers = JSON.parse(readFileSync(new URL('./speakers.json', import.meta.url), 'utf8')).speakers;
const portraits = speakers.filter(speaker => speaker.image);
assert.equal((peopleContainers['speakers-container'].innerHTML.match(/class="profile-photo"/g) || []).length, portraits.length);
assert.ok(!teamHTML.includes('profile-photo'), 'Speaker photos do not change the team directory');
for (const speaker of portraits) {
    const bytes = readFileSync(new URL(`./${speaker.image}`, import.meta.url));
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), speaker.imageSha, `${speaker.name} retains the verified source photo`);
    assert.equal(speaker.imageSource, `https://github.com/Swift-Ahmedabad/Talks/blob/617e9de2b07eacf132da829cbbb272cc8a44bc74/.speakerAssets/${speaker.image.split('/').at(-1)}`);
}
assert.ok(!speakers.find(speaker => speaker.name === 'Gokul Nair').image, 'Gokul keeps initials');
assert.equal((peopleContainers['speakers-container'].innerHTML.match(/class="bento-item team-card"/g) || []).length, speakers.length);
assert.equal(peopleContainers['team-container'].innerHTML, teamHTML, 'Loading speakers leaves the team directory untouched');
assert.ok(html.includes('id="speakers-tab"') && html.includes('id="speakers-container"'));
assert.equal(new Set(speakers.map(speaker => speaker.id)).size, speakers.length, 'One profile per upstream speaker ID');
assert.ok(speakers.every(speaker => speaker.source.startsWith('https://github.com/Swift-Ahmedabad/Talks/blob/617e9de2b07eacf132da829cbbb272cc8a44bc74/Swift-Ahmedabad/')));
assert.ok(speakers.some(speaker => speaker.name === 'Dharmesh Avaiya'));
assert.ok(speakers.some(speaker => speaker.name === 'Rimesh Jotaniya'));
assert.equal(speakers.find(speaker => speaker.name === 'Rahul Parmar').linkedIn, 'https://www.linkedin.com/in/rahul--parmar/');
assert.equal(speakers.find(speaker => speaker.name === 'Prof. Tushar Thakar').linkedIn, 'https://www.linkedin.com/in/tushar-thakar-03b936101/');
const maliciousProfile = { name: '<script>alert(1)</script>', about: '<img src=x onerror=alert(1)>', linkedIn: 'https://example.com/?x="test"&y=1' };
const profileHTML = context.createMemberCard(maliciousProfile);
assert.ok(profileHTML.includes('&lt;script&gt;') && profileHTML.includes('&lt;img'));
assert.ok(!profileHTML.includes('<script>') && !profileHTML.includes('<img'));
for (const linkedIn of ['javascript:alert(1)', 'data:text/html,test', 'http://example.com', '']) assert.throws(() => context.createMemberCard({ ...maliciousProfile, linkedIn }));
assert.throws(() => context.createMemberCard({ ...maliciousProfile, about: '' }));
for (const profileUrl of ['https://github.com/example', 'https://twitter.com/example', 'https://example.com/']) {
    assert.ok(context.createMemberCard({ ...maliciousProfile, linkedIn: undefined, profileUrl }).includes(`href="${profileUrl}"`));
}
for (const profileUrl of ['javascript:alert(1)', 'http://example.com', 'mailto:test@example.com', '', null]) {
    assert.throws(() => context.createMemberCard({ ...maliciousProfile, linkedIn: undefined, profileUrl }));
}
const photoHTML = context.createMemberCard({ ...maliciousProfile, image: 'assets/speakers/RatneshJain.png' });
assert.ok(photoHTML.includes('class="profile-photo"') && photoHTML.includes('loading="lazy"') && photoHTML.includes('alt=""'));
assert.ok(photoHTML.includes('class="team-initial"'), 'Initials remain beneath the photo as fallback');
for (const image of ['https://example.com/photo.png', 'data:image/png,test', 'assets/speakers/../photo.png', 'assets/speakers/photo.svg', 'assets/speakers/photo.png" onerror="alert(1)']) assert.throws(() => context.createMemberCard({ ...maliciousProfile, image }));
let failedPhotoRemoved = false;
documentEvents.error({ target: { matches: selector => selector === '.profile-photo', remove() { failedPhotoRemoved = true; } } });
assert.equal(failedPhotoRemoved, true, 'Failed photos reveal the preserved initials');
documentEvents.error({ target: {} });
failSpeakers = true;
await context.loadSpeakers();
assert.ok(peopleContainers['speakers-container'].innerHTML.includes('Reload this page'));
assert.equal(peopleContainers['team-container'].innerHTML, teamHTML);
failSpeakers = false;
await context.loadSpeakers();
assert.ok(peopleContainers['speakers-container'].innerHTML.includes('Dharmesh Avaiya'));
const contentNodes = Object.fromEntries(['community-name', 'community-description', 'community-logo', 'navbar-logo-img', 'hero-cta-primary', 'hero-cta-secondary', 'links-container', 'app-name', 'app-tagline', 'app-description', 'testflight-btn', 'app-icon', 'support-app-icon', 'app-features-container'].map(id => [id, {}]));
document.getElementById = id => contentNodes[id];
const contentRequests = [];
context.fetch = async path => {
    contentRequests.push(path);
    if (path === 'stats.json') throw new Error('Annual totals are unverified');
    return { json: async () => JSON.parse(readFileSync(new URL(`./${path}`, import.meta.url), 'utf8')) };
};
await context.loadContent();
assert.ok(!contentRequests.includes('stats.json'), 'Homepage content is independent of annual totals');
assert.equal(contentNodes['community-name'].textContent, 'Swift Ahmedabad');
assert.equal(contentNodes['app-name'].textContent, 'Community Talks');
const appData = JSON.parse(readFileSync(new URL('./app.json', import.meta.url), 'utf8'));
for (const id of ['app-icon', 'support-app-icon']) {
    assert.equal(contentNodes[id].src, appData.app.icon, 'App and support use the same current logo');
    assert.equal(contentNodes[id].alt, 'Community Talks app icon');
}
assert.equal(contentNodes['testflight-btn'].href, 'https://testflight.apple.com/join/Mt4fZYTp');
runInNewContext(readFileSync(new URL('./swift-talks.js', import.meta.url), 'utf8'), context);
await context.loadAppFeatures();
assert.equal((contentNodes['app-features-container'].innerHTML.match(/class="feature-card-plain"/g) || []).length, 19);
for (const feature of appData.features) {
    assert.ok(contentNodes['app-features-container'].innerHTML.includes(`data-feature-id="${feature.id}"`));
    assert.ok(contentNodes['app-features-container'].innerHTML.includes(`src="${feature.image}"`));
}
assert.ok(contentNodes['links-container'].innerHTML.includes('https://github.com/'));
console.log('PASS: homepage routing, speakers/team separation, source decisions, safe profile text/URLs, failed loads, menus and keyboard focus');
