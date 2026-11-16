// Run with: node designs.check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';

function element(dataset = {}) {
  const values = {};
  return { dataset, isConnected:true, disabled:false, attributes: {}, events: {}, rect: {top: 0, bottom: 100, height: 100}, style: { values, setProperty(k, v) { values[k] = v; } },
    classList: { values: {}, toggle(k, v) { this.values[k] = v; }, add(k) { this.values[k] = true; }, remove(k) { delete this.values[k]; }, contains(k) { return !!this.values[k]; } },
    setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k]; }, removeAttribute(k) { delete this.attributes[k]; },
    contains(node) { return node != null && (this === node || this.link === node); },
    focus() { context.document.activeElement = this; },
    getBoundingClientRect() { return this.rect; }, addEventListener(k, v) { this.events[k] = v; }, removeEventListener(k, v) { if (this.events[k] === v) delete this.events[k]; },
    replaceChildren(...children) { this.children = children; },
    scrollIntoView(options) { this.scrolled = options; }, scrollBy(options) { this.scrollOptions = options; }
  };
}
// Deliberately omit retired worlds, chooser, comparison header, dock, tabs and slab.
const ids = Object.fromEntries(['retry-content', 'main', 'liquid-top', 'liquid-city', 'liquid-story', 'liquid-join', ...['events', 'programs', 'app', 'team', 'speakers', 'sponsors', 'connect', 'contact'].map(name => `glass-${name}`)].map(id => [id, element()]));
const profileParts = Object.fromEntries(['name', 'avatar', 'bio', 'link'].map(name => [`[data-profile-${name}]`, element()]));
const dialog = ids['profile-dialog'] = {...element(), open: false, closest: () => null, querySelector: selector => profileParts[selector],
  showModal() { this.open = true; }, close() { this.open = false; this.events.close(); }};
const extraQueryNodes = {};
const story = element();
const storyPin = {...element(), clientHeight: 600, scrollHeight: 560};
const cityScene = element();
const storyCards = Array.from({length: 3}, () => element());
const storySteps = Array.from({length: 3}, (_, index) => element({storyStep: String(index)}));
storyCards.forEach((card, index) => { ids[['story-learn', 'story-build', 'story-belong'][index]] = card; });
const menuSummary = element();
const menu = {...element(), open: false, querySelector: () => menuSummary};
const navigation = {offsetHeight: 72, querySelector: () => menu};
const status = element();
const statusText = element();
status.querySelector = () => statusText;
const contentTypes = ['events', 'programs', 'team', 'speakers', 'sponsors', 'connect', 'contact', 'app'];
const containers = Object.fromEntries(contentTypes.map(type => [type, [{
  dataset: {}, closest: () => ({id: 'world-glass'}), innerHTML: ''
}]]));
const description = element();
const communityLinks = ['whatsapp', 'luma', 'email', 'speak'].map(link => element({link}));
const sponsor = element();
const root = element();
const body = {dataset: {}};
const windowEvents = {};
const documentEvents = {};
const motionPreference = {matches: false, events: {}, addEventListener(type, callback) { this.events[type] = callback; }};
let failedRequest = '', eventOverride, speakerOverride;
const requested = [];
let crewRandomCalls = 0;
const pageMath = Object.create(Math);
pageMath.random = () => (crewRandomCalls++ * 7 % 23) / 23;
const source = type => JSON.parse(readFileSync(new URL(`./${type}.json`, import.meta.url), 'utf8'));
const location = {};
function visit(path) {
  const url = new URL(path, 'https://example.github.io/community/');
  Object.assign(location, {href: url.href, search: url.search, hash: url.hash});
}
visit('?design=unknown#old');
let lastURL;
const context = {
  URL, URLSearchParams, location, Math: pageMath,
  fetch: async path => { requested.push(path); return {ok: path !== failedRequest, json: async () => path === 'speakers.json' && speakerOverride ? speakerOverride : path === 'events.json' && eventOverride ? eventOverride : source(path.replace('.json', ''))}; },
  document: {
    body, documentElement: root,
    addEventListener(type, callback) { documentEvents[type] = callback; },
    removeEventListener(type, callback) { if (documentEvents[type] === callback) delete documentEvents[type]; },
    createElement: () => element(),
    querySelectorAll: selector => extraQueryNodes[selector] || ({'.story-card': storyCards, '[data-story-step]': storySteps, '[data-community-description]': [description], '[data-link]': communityLinks, '.sponsor-mail-link': [sponsor]})[selector] || containers[selector.match(/^\[data-content="(.+)"\]$/)?.[1]] || [],
    querySelector: selector => ({'.content-status': status, '.liquid-story': story, '.story-pin': storyPin, '.liquid-nav': navigation, '[data-cityscape]': cityScene})[selector] || null,
    getElementById: id => ids[id] || null
  },
  history: {replaceState(_state, _title, url) { lastURL = url; visit(url); }},
  matchMedia: () => motionPreference,
  innerWidth: 1280, innerHeight: 900, scrollY: 0,
  requestAnimationFrame() {},
  cancelAnimationFrame() {},
  window: {scrollY: 0, scrollTo(options) { this.scrolled = options; }, addEventListener(type, callback) { windowEvents[type] = callback; }, removeEventListener(type, callback) { if (windowEvents[type] === callback) delete windowEvents[type]; }}
};
runInNewContext(readFileSync(new URL('./designs.js', import.meta.url), 'utf8'), context);
assert.equal(body.dataset.design, 'glass');
assert.equal(lastURL.searchParams.get('design'), 'glass');
assert.equal(lastURL.hash, '#liquid-top');
assert.equal(context.selectDesign, undefined, 'Comparison controller must stay retired');
assert.equal(context.selectRoom, undefined, 'Retired tabs must not initialize');
assert.equal(context.observeCityReveals, undefined, 'Retired reveal observer must not initialize');
for (const [hash, expected] of [
  ['editorial-events', 'glass-events'], ['aurora-team', 'glass-team'], ['editorial-app', 'glass-app'],
  ['aurora-programs', 'glass-programs'], ['aurora-sponsors', 'glass-sponsors'], ['editorial-contact', 'glass-contact'],
  ['aurora-connect', 'glass-connect'], ['mag-gatherings', 'glass-programs'], ['aurora-city', 'liquid-city'],
  ['lounge-top', 'liquid-top'], ['lounge-room', 'liquid-top'], ['mag-top', 'liquid-top'],
  ['glass-team', 'glass-team'], ['glass-speakers', 'glass-speakers'], ['liquid-story', 'liquid-story'], ['main', 'main'], ['glass-features', 'glass-features'],
  ['team', 'glass-team'], ['speakers', 'glass-speakers'], ['app', 'glass-app'],
  ['app/feature-1', 'glass-features'], ['contact', 'glass-contact'], ['support', 'glass-contact'],
  ['%E0%A4%A', 'liquid-top']
]) {
  visit(`?design=aurora&preview=6#${hash}`);
  context.syncLiquidLocation();
  assert.equal(lastURL.searchParams.get('design'), 'glass');
  assert.equal(lastURL.searchParams.get('preview'), '6');
  assert.equal(lastURL.hash, `#${expected}`);
  assert.equal(lastURL.pathname, '/community/', 'Keep hosting project subpaths');
}
visit('?design=editorial#editorial-events');
windowEvents.hashchange();
assert.equal(location.hash, '#glass-events');
assert.equal(ids['glass-events'].scrolled.block, 'start');
visit('?design=aurora#aurora-city');
windowEvents.popstate();
assert.equal(location.hash, '#liquid-city');
assert.equal(ids['liquid-city'].scrolled.behavior, 'instant');
visit('?design=glass');
context.syncLiquidLocation();
assert.equal(location.hash, '');

story.rect = {top: -414, height: 1800, bottom: 1386};
cityScene.rect = {top: -1000, height: 600, bottom: -400};
context.innerWidth = 390;
context.updateMotion();
assert.equal(cityScene.style.values['--city-drift'], '12.00px', 'Atmosphere drift stays within 12px');
assert.equal(root.style.values['--nav-height'], '72px');
assert.ok(storyCards.every(card => !card.inert), 'Every story link remains keyboard-accessible on phones without scrolling');
navigation.offsetHeight = 88;
motionPreference.matches = true;
motionPreference.events.change();
context.updateMotion();
assert.equal(cityScene.style.values['--city-drift'], '0.00px', 'Reduced motion clears atmosphere drift');
assert.equal(root.style.values['--nav-height'], '88px', 'Nav height updates even when motion is reduced');
assert.ok(storyCards.every(card => !card.inert), 'All story cards remain readable with reduced motion');
context.innerWidth = 1280;
motionPreference.matches = false;
context.updateMotion();
assert.equal(story.dataset.pinned, 'true');
const setStoryProgress = progress => {
  story.rect = {height: 1800, top: navigation.offsetHeight - progress * (1800 - storyPin.clientHeight)};
  context.updateMotion();
};
for (const [progress, expected] of [[-.2, 0], [0, 0], [.32, 0], [.34, 1], [.5, 1], [.67, 2], [1, 2], [1.2, 2], [.5, 1], [0, 0]]) {
  setStoryProgress(progress);
  assert.deepEqual(storyCards.map(card => !card.inert), storyCards.map((_, index) => index === expected), `One accessible chapter at progress ${progress}, in either direction`);
  assert.equal(storySteps[expected].attributes['aria-pressed'], 'true');
  assert.ok(storyCards.every(card => card.inert === (card.attributes['aria-hidden'] === 'true')));
}
const chapterVisuals = () => storyCards.map(card => ({
  opacity: Number(card.style.values['--chapter-opacity']),
  copyOpacity: Number(card.style.values['--chapter-copy-opacity']),
  y: parseFloat(card.style.values['--chapter-y']),
  scale: Number(card.style.values['--chapter-scale'])
}));
for (const [progress, outgoing, incoming] of [[1 / 3, 0, 1], [2 / 3, 1, 2]]) {
  setStoryProgress(progress);
  const visuals = chapterVisuals();
  assert.ok(Math.abs(visuals[outgoing].opacity - .5) < .0001, 'Outgoing chapter is half faded at the handoff');
  assert.ok(Math.abs(visuals[incoming].opacity - .5) < .0001, 'Incoming chapter fades in before the outgoing one disappears');
  assert.ok(visuals[outgoing].y < 0 && visuals[incoming].y > 0, 'Chapters travel in opposite directions through the blend');
  assert.equal(storyCards.filter(card => card.dataset.visible === 'true').length, 2);
  assert.ok(visuals.every(visual => visual.copyOpacity === 0), 'Lettering clears at the handoff instead of doubling');
}
let previous;
const forwardVisuals = [];
for (let step = 0; step <= 100; step++) {
  setStoryProgress(step / 100);
  const visuals = chapterVisuals();
  assert.ok(Math.abs(visuals.reduce((sum, visual) => sum + visual.opacity, 0) - 1) < .0002, 'No empty frame or third overlapping chapter');
  assert.ok(visuals.filter(visual => visual.copyOpacity > 0).length <= 1, 'Only one chapter exposes lettering during a crossfade');
  visuals.forEach((visual, index) => {
    assert.ok(visual.opacity >= 0 && visual.opacity <= 1 && visual.copyOpacity >= 0 && visual.copyOpacity <= 1 && Math.abs(visual.y) <= 40 && visual.scale >= .96 && visual.scale <= 1);
    if (previous) assert.ok(Math.abs(visual.opacity - previous[index].opacity) < .08, 'Opacity changes gradually across chapter boundaries');
  });
  forwardVisuals.push(visuals);
  previous = visuals;
}
for (let step = 100; step >= 0; step--) {
  setStoryProgress(step / 100);
  assert.deepEqual(chapterVisuals(), forwardVisuals[step], 'Reverse scrolling retraces the exact same visual state');
}
context.updateMotion();
assert.deepEqual(chapterVisuals(), forwardVisuals[0], 'Stopping scroll preserves the current frame');
storyCards[0].link = {};
context.document.activeElement = storyCards[0].link;
setStoryProgress(.8);
assert.equal(storyCards[0].inert, false, 'Scrolling never hides a focused chapter link');
assert.deepEqual(chapterVisuals().map(visual => visual.opacity), [1, 0, 0], 'A focused chapter remains fully legible');
assert.equal(chapterVisuals()[0].copyOpacity, 1);
context.document.activeElement = null;
context.updateMotion();
assert.equal(storyCards[2].inert, false, 'Chapter selection resumes after focus leaves');
const chapterTarget = {closest: selector => selector === '[data-story-step]' ? storySteps[1] : null};
documentEvents.click({target: chapterTarget});
assert.equal(context.document.activeElement, storySteps[1], 'Chapter control owns focus before changing scenes');
assert.equal(context.window.scrolled.behavior, 'smooth', 'Chapter buttons scrub through intermediate states using native smooth scrolling');
assert.equal(context.window.scrolled.top, context.window.scrollY + story.rect.top - navigation.offsetHeight + (1800 - storyPin.clientHeight) * .5);
visit('#story-belong');
context.scrollToCurrentAnchor();
assert.equal(context.window.scrolled.behavior, 'instant', 'Direct chapter hashes land without an animated detour');
assert.ok(context.window.scrolled.top > context.window.scrollY + story.rect.top - navigation.offsetHeight);
visit('');
for (const fallback of ['mobile', 'short', 'overflow', 'stage-overflow', 'reduced']) {
  context.innerWidth = fallback === 'mobile' ? 390 : 1280;
  context.innerHeight = fallback === 'short' ? 600 : 900;
  storyPin.scrollHeight = fallback === 'overflow' ? 1200 : fallback === 'stage-overflow' ? 700 : 560;
  motionPreference.matches = fallback === 'reduced';
  context.updateMotion();
  assert.equal(story.dataset.pinned, 'false', `${fallback} uses ordinary flow`);
  assert.ok(storyCards.every(card => !card.inert && !card.attributes['aria-hidden']), `${fallback} exposes every chapter`);
  assert.ok(chapterVisuals().every(visual => visual.opacity === 1 && visual.copyOpacity === 1 && visual.y === 0 && visual.scale === 1), `${fallback} clears partial blends`);
}
context.innerWidth = 1280; context.innerHeight = 900; storyPin.scrollHeight = 560; motionPreference.matches = false;
context.updateMotion();
assert.equal(story.dataset.pinned, 'true', 'Pinning returns when viewport and motion preference allow it');

await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'ready');
assert.ok(!requested.includes('stats.json'), 'Community content does not request disputed annual totals');
assert.equal(status.hidden, true);
assert.equal((containers.team[0].innerHTML.match(/class="community-member"/g) || []).length, source('team').members.length);
assert.equal((containers.speakers[0].innerHTML.match(/class="community-member"/g) || []).length, source('speakers').speakers.length);
assert.equal((containers.speakers[0].innerHTML.match(/class="profile-photo"/g) || []).length, source('speakers').speakers.filter(speaker => speaker.image).length);
assert.ok(!containers.team[0].innerHTML.includes('profile-photo'), 'Team cards keep their initials');
const crewMarkup = containers.team[0].innerHTML;
assert.equal((crewMarkup.match(/class="crew-badge-paper"/g) || []).length, source('team').members.length, 'Every crew member gets a badge');
assert.ok(!containers.speakers[0].innerHTML.includes('crew-badge'), 'Badges belong only to crew');
const crewPreview = crewMarkup.split('<details class="team-directory">');
assert.equal(crewPreview.length, 2, 'Crew keeps its native expanded directory');
assert.equal((crewPreview[0].match(/class="community-member"/g) || []).length, 4, 'Four badges remain visible before disclosure');
const crewNames = markup => [...markup.matchAll(/<h3>(.*?)<\/h3>/g)].map(match => match[1]);
const teamMembers = source('team').members;
assert.deepEqual(crewNames(crewPreview[0]), teamMembers.slice(0, 4).map(member => context.escapeHTML(member.name)), 'Four preview badges keep their fixed order');
assert.deepEqual(crewNames(crewPreview[1]).sort(), teamMembers.slice(4).map(member => context.escapeHTML(member.name)).sort(), 'Expanded directory contains everyone else exactly once');
assert.notDeepEqual(crewNames(crewPreview[1]), teamMembers.slice(4).map(member => context.escapeHTML(member.name)), 'Expanded crew order follows page randomness');
const randomCallsAfterCrew = crewRandomCalls;
const freshTeam = source('team');
const freshTeamBytes = JSON.stringify(freshTeam);
assert.equal(context.contentHTML('team', freshTeam, 'glass'), crewMarkup, 'Re-rendering fresh JSON retains this page’s crew order');
assert.equal(crewRandomCalls, randomCallsAfterCrew, 'Each member receives one random position per page');
assert.equal(JSON.stringify(freshTeam), freshTeamBytes, 'Presentation does not rewrite source order');
for (const member of source('team').members) {
  assert.ok(crewMarkup.includes(context.escapeHTML(member.about)), 'Badge retains the authored biography');
  assert.ok(crewMarkup.includes(`href="${context.escapeHTML(member.profileUrl ?? member.linkedIn)}" target="_blank" rel="noopener noreferrer"`), 'Badge retains its one safe profile destination');
}
const abhishek = teamMembers.find(member => member.name === 'Abhishek Patel');
assert.equal(abhishek.role, 'Senior iOS developer');
assert.equal(abhishek.about, 'Senior iOS developer with experience building macOS and Flutter apps. Enjoys R&D, product design, experimenting with AI and creating skills for AI agents. Works on the Swift Ahmedabad website and open source projects.');
assert.equal(abhishek.profileUrl, 'https://abhishek-patel-in.github.io/');
assert.ok(!abhishek.image && crewMarkup.includes('AP</span>'), 'Deferred photo uses existing initials');
assert.ok(crewPreview[1].includes('Abhishek Patel') && crewMarkup.includes('Senior iOS developer'));
assert.ok(!crewMarkup.includes('Connect on LinkedIn'), 'Crew link wording supports any profile platform');
for (const profileUrl of ['https://github.com/example', 'https://twitter.com/example', 'https://example.com/']) {
  const html = context.contentHTML('team', {members: [{...abhishek, profileUrl}]}, 'glass');
  assert.ok(html.includes(`href="${profileUrl}"`) && html.includes('Visit profile'));
  assert.equal((html.match(/<a /g) || []).length, 1, 'Each crew badge has exactly one profile link');
}
for (const profileUrl of ['javascript:alert(1)', 'data:text/html,test', 'http://example.com', 'mailto:test@example.com', '', null]) {
  assert.throws(() => context.contentHTML('team', {members: [{...abhishek, profileUrl}]}, 'glass'));
}
const gokulHTML = context.contentHTML('speakers', {speakers: [source('speakers').speakers.find(speaker => speaker.name === 'Gokul Nair')]}, 'glass');
assert.ok(gokulHTML.includes('GN</span>') && !gokulHTML.includes('profile-photo'), 'Gokul remains initials-only');
assert.ok(containers.speakers[0].innerHTML.includes('Meet all 30 speakers'));
assert.ok(containers.team[0].innerHTML.includes('Meet all 21 team members'));
assert.ok(containers.speakers[0].innerHTML.includes('Dharmesh Avaiya') && !containers.team[0].innerHTML.includes('Dharmesh Avaiya'));
assert.equal((containers.app[0].innerHTML.match(/class="app-feature"/g) || []).length, source('app').features.length);
const appData = source('app');
assert.equal(appData.app.name, 'Community Talks');
assert.equal(appData.app.appStoreUrl, 'https://apps.apple.com/us/app/swifttalks/id6755958142');
assert.equal(appData.app.testFlightUrl, 'https://testflight.apple.com/join/Mt4fZYTp');
assert.equal(appData.features.length, 19, 'Replace the old gallery with all nineteen supplied screenshots');
assert.equal(new Set(appData.features.map(feature => feature.id)).size, 19, 'Feature deep links stay unique');
assert.deepEqual(appData.features.map(feature => feature.image), [...Array.from({length: 13}, (_, i) => i + 4104), ...Array.from({length: 6}, (_, i) => i + 4118)].map(number => `assets/CommunityTalksAssets/IMG_${number}.jpg`), 'Every supplied screenshot appears once in the approved order');
for (const image of [appData.app.icon, ...appData.features.map(feature => feature.image)]) {
  assert.match(image, /^assets\/CommunityTalksAssets\/[\w-]+\.(?:png|jpg)$/);
  assert.ok(readFileSync(new URL(`./${image}`, import.meta.url)).length > 0, 'App artwork resolves locally');
}
assert.ok(containers.app[0].innerHTML.includes('Community Talks app icon'));
assert.ok(containers.app[0].innerHTML.includes('Home &amp; Spotlights in Community Talks'));
assert.ok(!containers.app[0].innerHTML.includes('SwiftTalksAssets/'), 'Old screenshots leave the active gallery');
assert.equal((containers.events[0].innerHTML.match(/class="event-entry"/g) || []).length, source('events').events.length);
assert.ok(containers.contact[0].innerHTML.includes('helloswiftahmedabad@gmail.com'));
assert.ok(containers.connect[0].innerHTML.includes('discord.gg'));
assert.ok(containers.sponsors[0].innerHTML.includes('Space-O Technologies'));
assert.ok(!containers.sponsors[0].innerHTML.includes('host-number'), 'Sponsors need names, not serial numbers');
const sponsorData = source('sponsors').sponsors;
assert.equal(sponsorData.filter(item => item.logo).length, 10, 'All ten hosts have official local artwork');
assert.equal((containers.sponsors[0].innerHTML.match(/class="sponsor-logo"/g) || []).length, 10);
assert.ok(!sponsorData.at(-1).logo && sponsorData.at(-1).url.startsWith('mailto:'), 'The invitation remains a text email link');
for (const item of sponsorData.filter(item => item.logo)) {
  assert.ok(item.logoSource.startsWith('https://'), 'Retain exact official asset provenance');
  assert.equal(createHash('sha256').update(readFileSync(new URL(`./${item.logo}`, import.meta.url))).digest('hex'), item.logoSha256, `${item.name} retains the collected original artwork`);
}
const sponsorWithLogo = {name: '<Simform>', url: 'https://www.simform.com/', logo: 'assets/sponsors/simform.svg'};
const logoHTML = context.contentHTML('sponsors', {subtitle: '', sponsors: [sponsorWithLogo]}, 'glass');
assert.ok(logoHTML.includes('src="assets/sponsors/simform.svg"') && logoHTML.includes('alt=""') && logoHTML.includes('loading="lazy"'), 'Sponsor logos load locally without duplicating the visible link name');
assert.ok(logoHTML.includes('&lt;Simform&gt;') && logoHTML.includes('href="https://www.simform.com/"'), 'Logos retain escaped names and company links');
const textSponsorHTML = context.contentHTML('sponsors', {subtitle: '', sponsors: [{...sponsorWithLogo, logo: undefined}]}, 'glass');
assert.ok(!textSponsorHTML.includes('<img') && textSponsorHTML.includes('&lt;Simform&gt;'), 'Missing logos retain working text links');
for (const logo of ['https://example.com/logo.svg', 'data:image/png,test', 'assets/sponsors/../logo.svg', 'assets/sponsors/logo.svg" onerror="alert(1)']) assert.throws(() => context.contentHTML('sponsors', {subtitle: '', sponsors: [{...sponsorWithLogo, logo}]}, 'glass'));
assert.equal((containers.programs[0].innerHTML.match(/class="community-program"/g) || []).length, source('programs').programs.length);
assert.equal(description.textContent, source('links').community.description);
assert.ok(communityLinks.every(link => link.href));
assert.ok(sponsor.href.includes('?subject=') && sponsor.href.includes('&body='));
assert.ok(requested.every(path => /^[a-z-]+\.json$/.test(path)), 'Content requests stay relative under a project subpath');
for (const unsafe of ['javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', '', null]) assert.throws(() => context.safeURL(unsafe));
assert.equal(context.safeURL('./privacy-policy.html'), 'https://example.github.io/community/privacy-policy.html');
const maliciousTeam = {members:[{name:'<script>alert(1)</script>', about:'<img onerror=alert(1)>', linkedIn:'https://example.com/?x="test"'}]};
const rendered = context.contentHTML('team', maliciousTeam, 'glass');
assert.ok(!rendered.includes('<script>') && !rendered.includes('<img onerror'));
assert.ok(rendered.includes('&lt;script&gt;'));
const renderedSpeaker = context.contentHTML('speakers', {speakers: maliciousTeam.members}, 'glass');
assert.ok(renderedSpeaker.includes('&lt;script&gt;') && !renderedSpeaker.includes('<img onerror'));
assert.throws(() => context.contentHTML('speakers', {speakers: [{...maliciousTeam.members[0], linkedIn: 'javascript:alert(1)'}]}, 'glass'));
for (const image of ['https://example.com/photo.png', 'data:image/png,test', 'assets/speakers/../photo.png', 'assets/speakers/photo.svg', 'assets/speakers/photo.png" onerror="alert(1)']) assert.throws(() => context.contentHTML('speakers', {speakers: [{...maliciousTeam.members[0], image}]}, 'glass'));
const photoHTML = context.contentHTML('speakers', {speakers: [{...maliciousTeam.members[0], image: 'assets/speakers/RatneshJain.png'}]}, 'glass');
assert.ok(photoHTML.includes('loading="lazy"') && photoHTML.includes('alt=""') && photoHTML.includes('&lt;script&gt;'));
for (const kind of ['.profile-photo', '.speaker-reflection-photo', '.sponsor-logo']) {
  let failedPhotoRemoved = false;
  documentEvents.error({target: {matches: selector => selector.split(',').includes(kind), remove() { failedPhotoRemoved = true; }}});
  assert.equal(failedPhotoRemoved, true, 'Failed images are removed while names and links remain');
}
documentEvents.error({target: {}});
failedRequest = 'team.json';
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'partial');
assert.equal(status.hidden, false);
assert.equal(ids['retry-content'].hidden, false);
assert.ok(containers.events[0].innerHTML.includes('July'));
failedRequest = '';
await ids['retry-content'].events.click();
assert.equal(root.dataset.contentReady, 'ready');
assert.equal(status.hidden, true);
assert.equal(containers.team[0].innerHTML, crewMarkup, 'Content retry retains the same crew order');

failedRequest = 'speakers.json';
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'partial');
assert.equal(ids['retry-content'].hidden, false);
assert.ok(containers.team[0].innerHTML.includes('Kajal Seth'));
failedRequest = '';
await ids['retry-content'].events.click();
assert.equal(root.dataset.contentReady, 'ready');
assert.equal((containers.speakers[0].innerHTML.match(/class="community-member"/g) || []).length, 30);

const gallery = element();
gallery.clientWidth = 390;
gallery.scrollWidth = 1170;
gallery.scrollLeft = 0;
ids['glass-features'] = gallery;
const galleryButton = element({galleryStep: '1'});
galleryButton.attributes['aria-controls'] = 'glass-features';
const galleryTarget = {closest: selector => selector === '[data-gallery-step]' ? galleryButton : null};
documentEvents.click({target: galleryTarget});
assert.equal(gallery.scrollOptions.left, 390);
assert.equal(gallery.scrollOptions.behavior, 'smooth');
motionPreference.matches = true;
documentEvents.click({target: galleryTarget});
assert.equal(gallery.scrollOptions.behavior, 'instant');
const cardGallery = {...gallery, dataset: {gallery: 'cards'}, children: [40, 362, 684, 1006].map(offsetLeft => ({offsetLeft}))};
assert.equal(context.galleryTarget(cardGallery, 1), 322, 'Event buttons advance one rendered card');
cardGallery.scrollLeft = 190;
assert.equal(context.galleryTarget(cardGallery, -1), 0, 'Previous from a partial drag finds the previous snap');
assert.equal(context.galleryTarget(cardGallery, 1), 322);
cardGallery.scrollLeft = 644;
assert.equal(context.galleryTarget(cardGallery, 1), 780, 'Last card clamps to the real end');
cardGallery.clientWidth = 900;
assert.equal(context.galleryTarget(cardGallery, 1), 270, 'Resizing uses current bounds instead of stale indices');
gallery.id = 'glass-features';
extraQueryNodes['[data-gallery-step]'] = [galleryButton];
gallery.scrollLeft = 780;
context.updateGalleryControls(gallery);
assert.equal(galleryButton.getAttribute('aria-disabled'), 'true');
gallery.scrollOptions = null;
documentEvents.click({target: galleryTarget});
assert.equal(gallery.scrollOptions, null, 'Unavailable controls do not scroll');
gallery.scrollLeft = 0;
context.updateGalleryControls(gallery);
assert.equal(galleryButton.getAttribute('aria-disabled'), 'false');
delete extraQueryNodes['[data-gallery-step]'];
menu.open = true;
menu.link = {closest: () => null};
documentEvents.click({target: menu.link});
assert.equal(menu.open, true, 'Clicking inside the menu keeps it open');
documentEvents.keydown({key: 'Tab'});
assert.equal(menu.open, true, 'Ordinary keyboard navigation keeps the menu open');
documentEvents.keydown({key: 'Escape'});
assert.equal(menu.open, false, 'Escape dismisses the mobile menu');
assert.equal(context.document.activeElement, menuSummary, 'Escape returns focus to the menu control');
menu.open = true;
documentEvents.click({target: {closest: () => null}});
assert.equal(menu.open, false, 'Clicking outside dismisses the menu');
menu.open = true;
documentEvents.click({target: {closest: selector => selector === '.section-menu a' ? menu.link : null}});
assert.equal(menu.open, false, 'Following a menu link closes the menu');

// Check parsed source, so retained theme comments do not count as active DOM.
const activeHTML = readFileSync(new URL('./index.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
assert.match(activeHTML, /<span class="footer-credits">\s*<span>Design &amp; Build by <a class="footer-credit-link" href="https:\/\/abhishek-patel-in\.github\.io\/" target="_blank" rel="noopener noreferrer">Abhishek Patel<\/a><\/span>\s*<span>Development Assistance by <a class="footer-credit-link" href="https:\/\/www\.linkedin\.com\/in\/ratnesh-jain-7a2270146\/" target="_blank" rel="noopener noreferrer">Ratnesh Jain<\/a><\/span>\s*<\/span>/, 'Footer credits link both named contributors safely');
assert.equal((containers.connect[0].innerHTML.match(/<svg class="connect-symbol"/g) || []).length, source('links').links.length, 'Every Connect card uses a vector logo or location icon');
for (const link of source('links').links) {
  assert.ok(activeHTML.includes(`<symbol id="connect-${link.icon}"`), `${link.name} has an actual icon definition`);
  assert.ok(containers.connect[0].innerHTML.includes(`href="#connect-${link.icon}"`));
  assert.ok(containers.connect[0].innerHTML.includes(`href="${context.escapeHTML(link.url)}"`), 'Icon changes preserve the authored destination');
}
assert.match(activeHTML, /src="designs\.js\?[^\"]+"/, 'The homepage loads the Liquid Night renderer');
const legacyHTML = readFileSync(new URL('./designs.html', import.meta.url), 'utf8');
assert.match(legacyHTML, /http-equiv="refresh" content="0;url=\.\/"/, 'Legacy design URL has a native redirect fallback');
for (const prefix of ['/', '/community/']) {
  const oldURL = new URL(`${prefix}designs.html?preview=feedback#story-build`, 'https://example.github.io');
  let redirected;
  runInNewContext(legacyHTML.match(/<script>([\s\S]*?)<\/script>/)[1], {
    location: {search: oldURL.search, hash: oldURL.hash, replace(path) { redirected = new URL(path, oldURL); }}
  });
  assert.equal(redirected.pathname, prefix, 'Legacy redirect retains hosting project subpaths');
  assert.equal(redirected.search, oldURL.search, 'Legacy redirect retains query parameters');
  assert.equal(redirected.hash, oldURL.hash, 'Legacy redirect retains section links');
}
assert.ok(!/data-stat=|data-year|data-content="stats"|class="liquid-impact"/.test(activeHTML), 'The active page omits both annual statistics blocks');
assert.deepEqual([...activeHTML.matchAll(/id="world-([^"]+)"/g)].map(match => match[1]), ['glass']);
assert.ok(!/data-choice|class="comparison"|id="studio-fill"/.test(activeHTML));
assert.ok(!/assets\/designs\/(?:studio|city-of-swift|aurora)/.test(activeHTML));
assert.deepEqual([...activeHTML.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].slice(0, 5).map(match => match[1]), ['liquid-top', 'liquid-city', 'liquid-story', 'glass-events', 'glass-programs'], 'City hero is followed by the story, event archive and existing programs');
assert.match(activeHTML, /class="liquid-button" href="https:\/\/lu.ma\/user\/swiftahmedabad"[^>]*data-link="luma">Find your next meetup/, 'Hero CTA goes directly to the calendar');
// Verified chronology stays local, uses Ahmedabad dates, and never mutates profiles.
const speakers = source('speakers').speakers, events = source('events').events;
const profileBytes = JSON.stringify(speakers);
const ordered = context.orderSpeakers(speakers, events, '2026-10-25');
assert.deepEqual(Array.from(ordered.slice(0, 4), speaker => speaker.name), ['Kanishka Chaudhry', 'Pradip Sutariya', 'Rahul Parmar', 'Ratnesh Jain']);
assert.equal(JSON.stringify(speakers), profileBytes);
assert.equal(context.ahmedabadDate(new Date('2026-03-13T18:30:00Z')), '2026-03-14', 'Calendar boundaries use Ahmedabad rather than UTC');
const march = events.find(event => event.source?.includes('/10.'));
assert.equal(march.date, '2026-03-14', 'Approved correction survives the upstream folder year');
assert.ok(march.speakerIds.includes(speakers.find(speaker => speaker.name === 'Ratnesh Jain').id), 'Named community updates count');
assert.ok(!events[0].date && !events[0].speakerIds, 'Year-only WWDC26 does not invent speaking evidence');
const pair = [{id:'b', name:'Zed'}, {id:'a', name:'Amy'}, {id:'c', name:'Unknown'}];
const appearance = {date:'2026-03-14', status:'Past event', source:march.source, speakerIds:['b', 'a', 'a']};
assert.deepEqual(Array.from(context.orderSpeakers(pair, [appearance], '2026-10-25'), p => p.id), ['a','b','c'], 'Ties are alphabetical; missing dates trail; duplicate relations are harmless');
assert.deepEqual(Array.from(context.orderSpeakers(pair, [appearance, {...appearance,date:'2026-04-01',speakerIds:['b']}], '2026-10-25'), p => p.id), ['b','a','c'], 'A new verified appearance changes the order');
for (const invalid of [{...appearance,date:'2026-02-30'}, {...appearance,source:''}, {...appearance,speakerIds:['missing']}]) assert.throws(() => context.orderSpeakers(pair, [invalid]));
for (const excluded of [{...appearance,date:'2030-01-01'}, {...appearance,status:'Upcoming event'}, {...appearance,status:'Cancelled'}, {...appearance,status:'Unverified'}]) {
  assert.deepEqual(Array.from(context.orderSpeakers(pair, [excluded], '2026-10-25'), p => p.id), ['a','c','b']);
}
failedRequest = 'events.json';
await context.loadCommunityContent();
assert.ok(containers.speakers[0].innerHTML.includes('recency is unavailable'));
assert.ok(containers.team[0].innerHTML.includes('Kajal Seth'));
failedRequest = '';
eventOverride = {events:[{...march,date:'2025-02-30'}]};
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'partial');
assert.ok(containers.speakers[0].innerHTML.includes('recency is unavailable'));
eventOverride = null;
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'ready');
assert.ok(!containers.speakers[0].innerHTML.includes('recency is unavailable'));
for (const broken of [{speakers:null},{speakers:[{id:'bad',name:'Unsafe',about:'Example',linkedIn:'javascript:alert(1)'}]}]) {
  speakerOverride = broken;
  await context.loadCommunityContent();
  assert.equal(root.dataset.contentReady, 'partial', 'Invalid deferred speaker data preserves the retry/error path');
  assert.ok(containers.team[0].innerHTML.includes('Kajal Seth'));
}
speakerOverride = null;
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'ready');

// Exercise the real dialog/overflow functions, without implementing a fake focus trap.
const bioButton = {...element(), hidden:true, isConnected:true};
const preview = {...element(), clientWidth:220, clientHeight:81, scrollHeight:300, textContent:'First <script> paragraph.\nSecond paragraph.'};
const avatar = {cloneNode: () => ({avatar:true})};
const dialogLink = {href:'https://example.com/profile', textContent:'Connect on LinkedIn ↗'};
const card = {...element(), querySelector: selector => ({'h3':{textContent:'Example speaker'}, '.member-initials':avatar, '.bio-preview':preview, '.profile-link':dialogLink, '[data-read-bio]':bioButton})[selector]};
bioButton.closest = preview.closest = () => card;
extraQueryNodes['.bio-preview'] = [preview];
context.initContentUI();
assert.equal(bioButton.hidden, false, 'Only overflowing previews expose Read bio');
context.openProfile(bioButton);
assert.equal(dialog.open, true);
assert.equal(profileParts['[data-profile-name]'].textContent, 'Example speaker');
assert.equal(profileParts['[data-profile-link]'].textContent, 'Connect on LinkedIn ↗', 'Speaker dialog retains its LinkedIn label');
assert.equal(context.document.activeElement, profileParts['[data-profile-name]']);
assert.deepEqual(Array.from(profileParts['[data-profile-bio]'].children, p => p.textContent), ['First <script> paragraph.', 'Second paragraph.'], 'Biographies create text paragraphs, never HTML');
dialog.close();
dialogLink.href = abhishek.profileUrl;
dialogLink.textContent = 'Visit profile ↗';
context.openProfile(bioButton);
assert.equal(profileParts['[data-profile-link]'].href, abhishek.profileUrl);
assert.equal(profileParts['[data-profile-link]'].textContent, 'Visit profile ↗', 'Crew dialog uses the card’s destination label');
dialog.close();
assert.equal(context.document.activeElement, bioButton);
assert.equal(root.classList.values['profile-open'], undefined);
preview.scrollHeight = 81;
context.initContentUI();
assert.equal(bioButton.hidden, false, 'A focused action is not removed during resizing');
context.document.activeElement = null;
context.initContentUI();
assert.equal(bioButton.hidden, true, 'Short biographies do not open redundant dialogs');
delete extraQueryNodes['.bio-preview'];
assert.match(activeHTML, /class="community-section contact-panel" id="glass-contact"/);
assert.match(activeHTML, /<dialog[^>]+aria-labelledby="profile-dialog-name"/);
assert.match(activeHTML, /class="profile-dialog-body"[^>]+tabindex="0"[^>]+role="region"/, 'Long biographies remain keyboard-scrollable in Safari');
assert.match(activeHTML, /src="headline-glass\.mjs\?/);
assert.ok(!/src="story-glass\.mjs/.test(activeHTML), 'Retired WebGL renderer stays inactive');
assert.ok(!/<a\s[^>]*class="community-member"/.test(containers.speakers[0].innerHTML), 'Profile cards do not nest buttons in external links');
// P2-014 drives the real delegates and lifecycle; native focus navigation is checked in browsers.
function speakerCard(name, lines = 5) {
  const fixture = {card:element(), heading:{...element(), textContent:name}, region:element(), photo:{...element(), disabled:true}, hint:{hidden:true},
    bio:{...element(), clientWidth:220, clientHeight:81, scrollHeight:lines * 27, textContent:`${name} full biography.`}, action:{...element(), hidden:true}, link:element()};
  const {card, heading, region, photo, hint, bio, action, link} = fixture;
  const parts = {'h3':heading, '[data-speaker-preview-content]':region, '[data-speaker-preview-toggle]':photo,
    '.bio-preview':bio, '[data-read-bio]':action, '.profile-link':link, '.member-initials':{cloneNode:()=>({avatar:name})}};
  card.querySelector = selector => parts[selector] || null;
  card.contains = node => node === card || Object.values(fixture).includes(node);
  region.contains = node => node === region || node === bio || node === action;
  photo.querySelector = selector => selector === '.speaker-bio-hint' ? hint : null;
  link.href = 'https://example.com/profile';
  Object.values(fixture).filter(node => node !== hint).forEach(node => {
    node.closest = selector => {
      if (selector === '.community-member' || selector === '[data-speaker-preview]') return card;
      if (selector === '[data-speaker-preview-toggle]') return node === photo ? photo : null;
      if (selector === '[data-read-bio]') return node === action ? action : null;
      if (selector.startsWith('a[href],')) return [photo, action, link].includes(node) ? node : null;
      return null;
    };
  });
  return fixture;
}
const p14a = speakerCard('First speaker'), p14b = speakerCard('Second speaker'), p14short = speakerCard('Short speaker', 1);
const p14fixtures = [p14a, p14b, p14short];
extraQueryNodes['[data-speaker-preview]'] = p14fixtures.map(f => f.card);
extraQueryNodes['.bio-preview'] = p14fixtures.map(f => f.bio);
let p14frameID = 0;
const p14frames = new Map();
context.requestAnimationFrame = callback => { const id = ++p14frameID; p14frames.set(id, callback); return id; };
context.cancelAnimationFrame = id => p14frames.delete(id);
const p14flush = () => { const callbacks = [...p14frames.values()]; p14frames.clear(); callbacks.forEach(callback => callback()); };
const p14click = target => documentEvents.click({target});
const p14hover = (fixture, enter = true, pointerType = 'mouse') => fixture.card.events[enter ? 'pointerenter' : 'pointerleave']({pointerType});
const p14expanded = fixture => fixture.photo.getAttribute('aria-expanded') === 'true';
context.document.activeElement = null;
context.initContentUI();
assert.equal(p14a.photo.disabled, false);
assert.equal(p14a.region.getAttribute('aria-hidden'), 'true');
assert.equal(p14a.action.hidden, false);
assert.equal(p14short.action.hidden, true, 'Short biographies have no redundant dialog action');
p14hover(p14a);
assert.equal(p14expanded(p14a), true);
p14hover(p14a, false);
assert.equal(p14expanded(p14a), false);
p14hover(p14a);
p14a.action.focus();
p14hover(p14a, false);
assert.equal(p14expanded(p14a), true, 'Pointer exit cannot hide a focused biography action');
p14hover(p14b);
assert.equal(p14expanded(p14b), false, 'Incidental hover cannot replace a focused preview');
p14b.photo.focus();
p14click(p14b.photo);
assert.equal(p14expanded(p14a), false);
assert.equal(p14expanded(p14b), true);
assert.equal(context.document.activeElement, p14b.photo, 'Switching honors the new focus destination');
p14hover(p14b, false);
p14hover(p14a);
assert.equal(p14expanded(p14b), true, 'Activated previews persist and take precedence over hover');
assert.equal(p14expanded(p14a), false);
p14click(p14b.photo);
assert.equal(p14expanded(p14b), false);
assert.equal(p14b.region.getAttribute('aria-hidden'), 'true');
p14hover(p14b, false);
p14hover(p14b);
assert.equal(p14expanded(p14b), true, 'A fresh mouse entry may reopen a dismissed preview');
p14click(p14b.photo);
assert.equal(p14expanded(p14b), false, 'Activation toggles the currently reported expanded state');
p14hover(p14a, true, 'touch');
assert.equal(p14expanded(p14a), false);
p14click(p14a.photo);
assert.equal(p14expanded(p14a), true, 'One touch click opens once, without a focusin/touchstart toggle');
p14a.action.focus();
p14click(p14b.photo); // Safari can leave focus on the previous action after a mouse click.
assert.equal(context.document.activeElement, p14b.photo, 'Switch focus before hiding the old focused action');
const p14outside = {...element(), closest:()=>null};
p14b.action.focus();
p14click(p14outside);
assert.equal(context.document.activeElement, p14b.photo, 'Nonfocusable outside content uses the old photo only as a fallback');
p14click(p14a.photo);
p14a.action.focus();
p14click(p14b.link);
assert.equal(context.document.activeElement, p14b.link, 'Outside control activation keeps its intended destination');
p14click(p14a.photo);
p14a.link.focus();
p14click(p14outside);
assert.equal(context.document.activeElement, p14a.link, 'Always-visible links never need focus restoration');
context.document.activeElement = null;
p14hover(p14a);
p14a.action.focus();
p14hover(p14a, false);
p14b.link.focus();
documentEvents.focusin({target:p14b.link});
assert.equal(p14expanded(p14a), false, 'A hover preview closes after both pointer and focus leave');

p14click(p14a.photo);
p14a.action.focus();
p14click(p14a.action);
assert.equal(dialog.open, true);
assert.equal(p14expanded(p14a), true);
p14hover(p14a, false);
p14a.bio.scrollHeight = 81;
windowEvents.resize();
p14flush();
assert.equal(p14a.action.hidden, false, 'A resized dialog invoker remains available for focus restoration');
documentEvents.keydown({key:'Escape'});
assert.equal(p14expanded(p14a), true, 'The dialog owns Escape before the preview');
dialog.close();
assert.equal(context.document.activeElement, p14a.action);
const p14dialogTarget = {...element(), closest:()=>null};
dialog.contains = node => node === dialog || node === p14dialogTarget;
p14click(p14dialogTarget);
assert.equal(p14expanded(p14a), true, 'A dialog close click cannot fall through to outside dismissal');
let p14prevented = false;
documentEvents.keydown({key:'Escape', preventDefault(){p14prevented=true;}});
assert.equal(p14prevented, true);
assert.equal(p14expanded(p14a), false);
assert.equal(context.document.activeElement, p14a.photo);
p14a.bio.scrollHeight = 135;

// Hidden directory cards wait for valid geometry; font/resize/disclosure callbacks share the same measurement.
p14b.bio.clientWidth = 0;
context.initContentUI();
assert.equal(p14b.photo.disabled, true);
p14b.bio.clientWidth = 220;
documentEvents.toggle();
p14flush();
assert.equal(p14b.photo.disabled, false);
const p14oldQueue = documentEvents.toggle;
context.initContentUI();
const p14pending = p14frames.size;
p14oldQueue();
assert.equal(p14frames.size, p14pending, 'Disposed callbacks cannot schedule stale measurements');
p14a.card.isConnected = p14a.bio.isConnected = false;
const p14oldEnter = p14a.card.events.pointerenter;
runInNewContext('disposeContentUI()', context);
p14oldEnter({pointerType:'mouse'});
assert.equal(p14expanded(p14a), false, 'Detached cards cannot be opened by stale events');
p14a.card.isConnected = p14a.bio.isConnected = true;
runInNewContext('disposeContentUI()', context); // Idempotent.
context.initContentUI();
assert.equal(p14a.photo.disabled, false);

const p14set = p14b.region.setAttribute;
let p14fail = true;
p14b.region.setAttribute = function(...args) { if(p14fail){p14fail=false;throw new Error('setup failure');} return p14set.apply(this,args); };
context.initContentUI();
assert.equal(p14b.photo.disabled, true);
assert.equal(p14b.card.classList.contains('bio-enabled'), false);
assert.equal(p14b.region.getAttribute('aria-hidden'), undefined, 'Partial setup restores accessible full text');
p14b.region.setAttribute = p14set;

const p14showModal = dialog.showModal;
dialog.showModal = () => {throw new Error('native dialog refused');};
p14click(p14a.photo);
p14a.action.focus();
p14click(p14a.action);
assert.equal(root.classList.contains('profile-open'), false, 'Failed native dialog opening cannot leave scrolling locked');
assert.equal(p14a.card.classList.contains('bio-enabled'), false);
assert.equal(p14a.photo.disabled, true);
assert.equal(p14a.action.hidden, true);
assert.equal(context.document.activeElement, p14a.heading);
assert.equal(p14a.region.getAttribute('aria-hidden'), undefined);
dialog.showModal = undefined;
context.initContentUI();
assert.ok(p14fixtures.every(f => f.photo.disabled), 'Unavailable dialog leaves readable, noninteractive profiles');
dialog.showModal = p14showModal;
runInNewContext('disposeContentUI()', context);
// Observer setup failure and uncancellable font promises use the existing disposal guard.
const p14observed = speakerCard('Observed speaker');
extraQueryNodes['[data-speaker-preview]'] = [p14observed.card];
extraQueryNodes['.bio-preview'] = [p14observed.bio];
const p14observers = [], p14fontReady = [];
let p14observeFailure = false;
context.ResizeObserver = class {
  constructor(callback) { this.callback=callback; p14observers.push(this); }
  observe(node) { if(p14observeFailure && node===p14observed.bio) throw new Error('observer setup failure'); }
  disconnect() { this.disconnected=true; }
};
const p14fontEvents = {};
context.document.fonts = {ready:{then(callback){p14fontReady.push(callback);}},
  addEventListener(type,callback){p14fontEvents[type]=callback;}, removeEventListener(type,callback){if(p14fontEvents[type]===callback) delete p14fontEvents[type];}};
context.initContentUI();
assert.equal(p14observed.photo.disabled, false);
p14fontEvents.loadingdone();
const p14lateFrames = [...p14frames.values()];
runInNewContext('disposeContentUI()', context);
const p14afterDispose = p14frames.size;
p14lateFrames.forEach(callback=>callback());
p14fontReady.forEach(callback=>callback());
p14observers.forEach(observer=>observer.callback());
assert.equal(p14frames.size, p14afterDispose, 'Late font/observer/frame callbacks stay disposed');
assert.ok(p14observers.every(observer=>observer.disconnected));
p14observeFailure = true;
context.initContentUI();
assert.equal(p14observed.photo.disabled, true);
assert.equal(p14observed.card.classList.contains('bio-enabled'), false);
assert.equal(p14observed.region.getAttribute('aria-hidden'), undefined);
assert.equal(p14observed.card.events.pointerenter, undefined, 'Partial setup removes already attached listeners');
runInNewContext('disposeContentUI()', context);
delete context.ResizeObserver;
delete context.document.fonts;
const p14crew = speakerCard('Crew fallback');
const p14crewQuery = p14crew.card.querySelector;
p14crew.card.querySelector = selector => selector.startsWith('[data-speaker-preview') ? null : p14crewQuery(selector);
p14crew.card.classList.add('bio-enabled');
p14crew.action.focus();
dialog.showModal = () => {throw new Error('crew dialog refused');};
context.openProfile(p14crew.action);
assert.equal(p14crew.card.classList.contains('bio-enabled'), false, 'The shared dialog owner restores full crew text on failure too');
assert.equal(context.document.activeElement, p14crew.heading);
dialog.showModal = p14showModal;
delete extraQueryNodes['[data-speaker-preview]'];
delete extraQueryNodes['.bio-preview'];
const p14markup = containers.speakers[0].innerHTML;
const p14ids = [...p14markup.matchAll(/id="(glass-speaker-preview-\d+)"/g)].map(match => match[1]);
assert.equal(p14ids.length, 30);
assert.equal(new Set(p14ids).size, 30, 'Initially visible and expanded-directory controls use unique IDs');
assert.equal((p14markup.match(/data-speaker-preview-toggle/g) || []).length, 30);
assert.ok(p14markup.includes('See more') && p14markup.includes('disabled'));
assert.ok(!containers.team[0].innerHTML.includes('data-speaker-preview'), 'Crew keeps its original disclosure behavior');
console.log('PASS: speaker hover/touch/click precedence, focus-safe switching, dialog ownership/fallback, intrinsic overflow and lifecycle cleanup');
// Scroll anchors stay untransformed so a visual update cannot skip snap points.
const flow = {...element({gallery:'speakers'}), id:'glass-speaker-gallery', clientWidth:1140, scrollWidth:1800, scrollLeft:0};
flow.children = [400,620,840,1060].map(offsetLeft => ({offsetLeft,offsetWidth:340,firstElementChild:element()}));
flow.firstElementChild = flow.children[0];
context.updateSpeakerFlow(flow);
assert.equal(Number.parseFloat(flow.children[0].firstElementChild.style.values['--speaker-turn']), 0, 'First speaker starts front-facing and centered');
assert.ok(Number.parseFloat(flow.children[1].firstElementChild.style.values['--speaker-turn']) < 0);
assert.equal(context.galleryTarget(flow, 1), 220);
flow.scrollLeft = 220;
context.updateSpeakerFlow(flow);
assert.ok(Number.parseFloat(flow.children[0].firstElementChild.style.values['--speaker-turn']) > 0);
assert.equal(Number.parseFloat(flow.children[1].firstElementChild.style.values['--speaker-depth']), 0);
assert.equal(context.galleryTarget(flow, 1), 440, 'One arrow means one speaker, independent of transforms');
assert.equal(context.galleryTarget(flow, -1), 0);
extraQueryNodes['[data-gallery]'] = [flow];
context.initContentUI();
let flowPrevented = false;
flow.events.keydown({target:flow,key:'End',preventDefault(){flowPrevented=true;}});
assert.equal(flowPrevented, true);
assert.equal(flow.scrollOptions.left, 440);
flow.events.keydown({target:flow,key:'Home',preventDefault(){}});
assert.equal(flow.scrollOptions.left, -220);
flow.scrollOptions = null;
flow.events.keydown({target:flow.children[0],key:'ArrowRight'});
assert.equal(flow.scrollOptions, null, 'Card controls retain their own keyboard behavior');
flow.events.focusin({target:{closest:()=>flow.children[2]}});
assert.equal(flow.scrollOptions.left, 220, 'Tabbing into a speaker centers its full card');
flow.events.scroll();
assert.ok(p14frames.size > 0);
delete extraQueryNodes['[data-gallery]'];
context.initContentUI();
assert.equal(flow.events.scroll, undefined);
assert.equal(flow.events.keydown, undefined);
assert.equal(flow.events.focusin, undefined);
assert.equal(p14frames.size, 0, 'Retries cancel pending gallery frames');
assert.equal((p14markup.match(/class="speaker-slot"/g) || []).length, 30);
assert.equal((p14markup.match(/class="speaker-reflection" aria-hidden="true"/g) || []).length, 30);
assert.ok(!p14markup.includes('team-directory'), 'All speakers share one native row');
console.log('PASS: speaker cover-flow transforms, stable snap anchors, keyboard endpoints, focus centering and cleanup');
console.log('PASS: homepage, chronology/provenance/local dates, bio dialog/overflow/focus, card/page gallery navigation/bounds, content safety, retries and preserved story/navigation');

// Run the actual title initializer against its production markup and a controlled clock.
{
  const title = activeHTML.match(/<h1 aria-label="Swift Ahmedabad">Swift<span class="city-words" aria-hidden="true">([\s\S]*?)<\/h1>/)[1];
  const labels = [...title.matchAll(/<span lang="(\w+)" ([^>]*)>([^<]*)<\/span>/g)];
  assert.deepEqual(labels.map(match => match.slice(1)), [
    ['en', 'class="current"', 'Ahmedabad'], ['gu', 'hidden', 'અમદાવાદ'], ['hi', 'hidden', 'अहमदाबाद']
  ]);
  assert.match(activeHTML, /<details class="section-menu">[\s\S]*<button type="button" class="city-rotation" hidden>Pause city name rotation<\/button>[\s\S]*<\/details>/);
  assert.ok(!activeHTML.match(/<div class="city-title">[\s\S]*?<\/div>/)[0].includes('<button'), 'Hero heading has no playback button');
  const words = labels.map(() => {
    const animations = new Set();
    return {...element(), getAnimations: () => [...animations], animate(frames, options) {
      const effect = {frames, options, cancel() { animations.delete(effect); }};
      animations.add(effect);
      return effect;
    }};
  });
  words[0].classList.add('current');
  const group = {children: words}, button = element();
  button.hidden = true;
  context.document.querySelector = selector => ({'.city-words': group, '.city-rotation': button})[selector];
  assert.equal(context.initCityTitle(), undefined);
  assert.ok(button.hidden, 'Unavailable observer keeps the static HTML fallback');
  let io, now = 0, nextID = 0, pending;
  context.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; io = this; }
    observe(target) { assert.equal(target, group); }
    ratio(value) { this.callback([{intersectionRatio: value}], this); }
    takeRecords() { return []; }
    disconnect() {}
  };
  context.performance = {now: () => now};
  context.setTimeout = (callback, delay) => {
    assert.equal(pending, undefined, 'At most one title timer');
    pending = {id: ++nextID, at: now + delay, callback};
    return nextID;
  };
  context.clearTimeout = id => { if (id === pending?.id) pending = undefined; };
  const advance = ms => {
    now += ms;
    if (pending && now >= pending.at) {
      const {callback} = pending;
      pending = undefined;
      callback();
    }
  };
  const current = () => words.findIndex(word => word.classList.values.current);
  const held = index => {
    assert.deepEqual(words.filter(word => word.classList.values.current), [words[index]]);
    assert.ok(words.every(word => word.getAnimations().length === 0), 'Held spelling has no opacity effects');
    assert.equal(pending, undefined);
  };
  motionPreference.matches = true;
  const observe = context.initCityTitle();
  assert.ok(button.hidden);
  io.ratio(1); held(0);
  motionPreference.matches = false; motionPreference.events.change();
  assert.equal(button.hidden, false);
  assert.equal(io.options.rootMargin, `-${navigation.offsetHeight}px 0px 0px`);
  assert.equal(io.options.threshold, .5);
  io.ratio(.49); held(0); io.ratio(.5);
  assert.equal(words[0].getAnimations()[0].options.delay, 4880);
  advance(4999); assert.equal(current(), 0);
  button.events.click(); held(0);
  const click = () => button.events.click();
  click(); assert.equal(words[0].getAnimations().length, 0, 'Resume during the final 120ms holds fully opaque');
  advance(1); assert.equal(current(), 1);
  assert.equal(words[1].getAnimations()[0].options.duration, 120);
  advance(50); click(); held(1);
  assert.equal(button.textContent, 'Resume city name rotation');
  menu.open = true;
  menu.link = button;
  button.closest = () => null;
  documentEvents.click({target: button});
  assert.equal(menu.open, true, 'Menu playback control remains available after activation');
  io.ratio(0); context.document.hidden = true; documentEvents.visibilitychange();
  click(); io.ratio(1); advance(10000); held(1);
  context.document.hidden = false; documentEvents.visibilitychange();
  advance(4949); assert.equal(current(), 1); advance(1); assert.equal(current(), 2);
  advance(5000); assert.equal(current(), 0);
  advance(3000); io.ratio(0); advance(9000); held(0); io.ratio(1);
  const stale = pending.callback;
  click(); click(); click(); click(); stale();
  assert.equal(pending.at - now, 2000);
  advance(1999); assert.equal(current(), 0); advance(1); assert.equal(current(), 1);
  button.focus(); motionPreference.matches = true; motionPreference.events.change();
  held(0); assert.ok(button.hidden); assert.equal(context.document.activeElement, menuSummary);
  motionPreference.matches = false; motionPreference.events.change();
  assert.equal(pending.at - now, 5000);
  advance(30000); assert.equal(current(), 1, 'Delayed wake advances once'); assert.equal(pending.at - now, 5000);
  advance(3000); windowEvents.pagehide(); held(1);
  const oldObserver = io;
  windowEvents.pageshow({persisted: true}); oldObserver.ratio(1); held(1);
  io.ratio(1); assert.equal(pending.at - now, 2000);
  observe(90); held(1); assert.equal(io.options.rootMargin, '-90px 0px 0px');
  io.ratio(1); click(); windowEvents.pagehide(); windowEvents.pageshow({persisted: true}); io.ratio(1); held(1);
  motionPreference.matches = true; motionPreference.events.change(); motionPreference.matches = false; motionPreference.events.change();
  held(0); click(); assert.equal(pending.at - now, 5000);
}
console.log('PASS: multilingual title timing, order, fades, interruptions, visibility, pause, restored pages and reduced motion');

/* RETIRED THEMES: comparison, City of Swift dock/reveals and keyboard room tests.
for (const choice of ['editorial', 'aurora', 'glass', '__proto__']) {
  context.selectDesign(choice, true);
  const expected = choice === '__proto__' ? 'glass' : choice;
  assert.equal(body.dataset.design, expected);
  assert.equal(worlds.filter(world => !world.hidden).length, 1);
  assert.equal(worlds.find(world => !world.hidden).id, `world-${expected}`);
  assert.equal(lastURL.searchParams.get('design'), expected);
  assert.equal(lastURL.hash, '');
  assert.equal(scrollOptions.top, 0);
  assert.equal(choices.filter(button => button.attributes['aria-pressed'] === 'true').length, 1);
}
context.selectDesign('aurora');
motionPreference.matches = false;
cityHero.rect = {top: 160, height: 1000, bottom: 1160};
citySections['aurora-events'].rect.top = 1300;
citySections['lounge-room'].rect.top = 2400;
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '0.0000');
assert.equal(cityDock.hidden, true);
assert.equal(cityDock.inert, true);
cityHero.rect = {top: -800, height: 1000, bottom: 200};
citySections['aurora-events'].rect.top = 210;
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '0.8640');
assert.equal(cityDock.hidden, false);
assert.equal(cityDock.inert, false);
assert.equal(cityDockLinks[0].attributes['aria-current'], 'location');
citySections['lounge-room'].rect.top = 200;
context.updateMotion();
assert.equal(cityDockLinks[0].attributes['aria-current'], undefined);
assert.equal(cityDockLinks[1].attributes['aria-current'], 'location');
cityHero.rect = {top: -5000, height: 1000, bottom: -4000};
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '1.0000');
context.observeCityReveals();
const revealObserver = observers.at(-1);
assert.ok(revealObserver.observed.has(revealCard));
const entry = {target: revealCard, isIntersecting: true, boundingClientRect: {bottom: 500}};
revealObserver.callback([entry]);
revealObserver.callback([entry]);
assert.equal(revealCard.animations.length, 1, 'Scrolling back must not replay a reveal');
assert.equal(revealObserver.observed.has(revealCard), false);
motionPreference.matches = true;
motionPreference.events.change();
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '0');
assert.equal(cityDock.hidden, false, 'Navigation must work with reduced motion');
assert.ok(animationCancelled);
context.selectDesign('glass');
context.updateMotion();
assert.equal(cityDock.hidden, true, 'The dock must not appear in another theme');
assert.equal(cityDock.inert, true);
for (const name of ['meet', 'build', 'share']) {
  context.selectRoom(name);
  assert.equal(tabs.filter(tab => tab.attributes['aria-selected'] === 'true').length, 1);
  assert.equal(tabs.filter(tab => tab.tabIndex === 0).length, 1);
  assert.equal(ids[`room-${name}`].hidden, false);
  assert.equal(['meet', 'build', 'share'].filter(room => !ids[`room-${room}`].hidden).length, 1);
}
let prevented = false;
tabs[2].events.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; } });
assert.ok(prevented);
assert.equal(tabs[0].focused, true);
assert.equal(ids['room-meet'].hidden, false);
tabs[0].events.keydown({ key: 'ArrowUp', preventDefault() {} });
assert.equal(ids['room-share'].hidden, false);
tabs[2].events.keydown({ key: 'ArrowDown', preventDefault() {} });
assert.equal(ids['room-meet'].hidden, false);
context.selectRoom('__proto__');
assert.equal(ids['room-meet'].hidden, false);

*/
