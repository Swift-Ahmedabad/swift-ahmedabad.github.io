/* RETIRED THEMES: comparison controller retained for restoration.
const choices = [...document.querySelectorAll('[data-choice]')];
const worlds = [...document.querySelectorAll('.world')];
const notes = {glass: 'Liquid Night', editorial: 'Open Studio', aurora: 'City of Swift'};

function selectDesign(design, resetScroll = false) {
  if (!Object.hasOwn(notes, design)) design = 'glass';
  document.body.dataset.design = design;
  worlds.forEach(world => { world.hidden = world.id !== `world-${design}`; });
  choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === design)));
  document.getElementById('design-note').textContent = `Swift Ahmedabad · ${notes[design]}`;
  const url = new URL(location.href);
  url.searchParams.set('design', design);
  if (resetScroll) url.hash = '';
  history.replaceState(null, '', url);
  if (resetScroll) window.scrollTo({top: 0, behavior: 'instant'});
  scheduleMotion();
}

*/
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const links = {};
const crewOrder = new Map();

function currentAnchor(hash) {
  if (!hash) return '';
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return 'liquid-top'; }
  if (/^(?:team|speakers|app|contact)$/.test(id)) id = `glass-${id}`;
  else if (id.startsWith('app/')) id = 'glass-features';
  else if (id === 'support') id = 'glass-contact';
  const legacySections = /^(?:editorial|aurora)-(events|programs|app|team|sponsors|connect|contact)$/;
  if (legacySections.test(id)) id = `glass-${id.match(legacySections)[1]}`;
  else if (id === 'mag-gatherings') id = 'glass-programs';
  else if (id === 'aurora-city') id = 'liquid-city';
  // The feature gallery is inserted after its JSON request finishes.
  return document.getElementById(id) || id === 'glass-features' ? id : 'liquid-top';
}

function syncLiquidLocation() {
  document.body.dataset.design = 'glass';
  const url = new URL(location.href);
  url.searchParams.set('design', 'glass');
  url.hash = currentAnchor(url.hash);
  if (url.href !== location.href) history.replaceState(null, '', url);
}

function scrollToCurrentAnchor() {
  const target = document.getElementById(currentAnchor(location.hash));
  const chapter = storyCards.indexOf(target);
  if (chapter !== -1) {
    updateStoryMotion(navigation?.offsetHeight || 0);
    if (story.dataset.pinned === 'true') return scrollToStoryStep(chapter);
  }
  if (target) target.scrollIntoView({block: 'start', behavior: 'instant'});
}

/* RETIRED THEMES / HERO: detached glass slab and City of Swift motion.
const slab = document.querySelector('.slab-front');
const art = document.querySelector('.liquid-art');
const cityWorld = document.getElementById('world-aurora');
const cityHero = document.querySelector('.lounge-hero');
const cityDock = document.querySelector('.city-dock');
const cityDockLinks = [...document.querySelectorAll('.city-dock a[href^="#"]:not(.city-dock-home)')];
const citySections = cityDockLinks.map(link => document.getElementById(link.getAttribute('href').slice(1)));
let cityRevealObserver;
*/
const navigation = document.querySelector('.liquid-nav');
const sectionMenu = navigation?.querySelector('.section-menu');
const cityScene = document.querySelector('[data-cityscape]');
const story = document.querySelector('.liquid-story');
const storyPin = document.querySelector('.story-pin');
const storyCards = [...document.querySelectorAll('.story-card')];
const storySteps = [...document.querySelectorAll('[data-story-step]')];

function initCityTitle() {
  const group = document.querySelector('.city-words');
  const button = document.querySelector('.city-rotation');
  const menuToggle = sectionMenu?.querySelector('summary');
  const words = Array.from(group?.children || []);
  if (!button || !menuToggle || words.length < 2 || !words[0].animate || !words[0].getAnimations || typeof IntersectionObserver === 'undefined') return;

  const dwell = 5000, fade = 120;
  let index = 0, remaining = dwell, deadline = 0, timer = null;
  let visible = false, paused = false, suspended = false, observer, inset;
  const eligible = () => visible && !document.hidden && !paused && !suspended && !reducedMotion.matches;

  function stop() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, deadline - performance.now());
    }
    words[index].getAnimations().forEach(animation => animation.cancel());
  }
  function select(next) {
    words[index].classList.remove('current');
    index = next;
    words[index].classList.add('current');
  }
  function start(entering = false) {
    const word = words[index];
    deadline = performance.now() + remaining;
    if (entering) word.animate({opacity: [0, 1]}, {duration: fade, easing: 'ease-out'});
    if (remaining >= fade) word.animate({opacity: [1, 0]}, {duration: fade, delay: remaining - fade, easing: 'ease-in'});
    const id = setTimeout(() => {
      if (timer !== id) return;
      const latest = observer.takeRecords().at(-1);
      if (latest) visible = latest.intersectionRatio >= .5;
      if (!eligible()) { stop(); return; }
      stop();
      select((index + 1) % words.length);
      remaining = dwell;
      start(true);
    }, Math.ceil(remaining));
    timer = id;
  }
  function sync() {
    if (!eligible()) stop();
    else if (timer === null) start();
  }
  function observe(top) {
    if (top === inset && observer) return;
    observer?.disconnect();
    visible = false;
    stop();
    inset = top;
    observer = new IntersectionObserver((entries, source) => {
      if (source !== observer) return;
      visible = entries.at(-1).intersectionRatio >= .5;
      sync();
    }, {threshold: .5, rootMargin: `-${top}px 0px 0px`});
    observer.observe(group);
  }
  function motionChanged() {
    if (reducedMotion.matches) {
      stop();
      select(0);
      remaining = dwell;
      if (document.activeElement === button) menuToggle.focus({preventScroll: true});
    }
    button.hidden = reducedMotion.matches;
    sync();
  }
  observe(navigation?.offsetHeight || 0);
  button.addEventListener('click', () => {
    paused = !paused;
    button.textContent = paused ? 'Resume city name rotation' : 'Pause city name rotation';
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { suspended = true; sync(); });
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    suspended = false;
    inset = undefined;
    observe(navigation?.offsetHeight || 0);
  });
  reducedMotion.addEventListener('change', motionChanged);
  words.forEach(word => { word.hidden = false; });
  motionChanged();
  return observe;
}
const observeCityTitle = initCityTitle();

function scrollToStoryStep(index, behavior = 'instant') {
  const top = navigation?.offsetHeight || 0;
  const rect = story.getBoundingClientRect();
  const travel = rect.height - storyPin.clientHeight;
  window.scrollTo({top: window.scrollY + rect.top - top + travel * (index + .5) / storyCards.length, behavior});
  scheduleMotion();
}

function updateStoryMotion(top) {
  if (!story || !storyPin) return;
  let pinned = !reducedMotion.matches && innerWidth >= 900 && innerHeight - top >= 600;
  story.dataset.pinned = String(pinned);
  // Text zoom or taller translated copy must never be clipped into a pinned stage.
  if (pinned && storyPin.scrollHeight > storyPin.clientHeight + 1) {
    pinned = false;
    story.dataset.pinned = 'false';
  }
  const rect = story.getBoundingClientRect();
  const travel = rect.height - storyPin.clientHeight;
  const progress = pinned && travel > 0 ? Math.max(0, Math.min(1, (top - rect.top) / travel)) : 0;
  let active = Math.min(storyCards.length - 1, Math.floor(progress * storyCards.length));
  // Keep a focused chapter link available until focus leaves it.
  const focused = storyCards.findIndex(card => card.contains(document.activeElement));
  if (focused !== -1) active = focused;
  const phase = focused !== -1 ? focused : Math.max(0, Math.min(storyCards.length - 1, progress * storyCards.length - .5));
  story.style.setProperty('--story-progress', progress.toFixed(4));
  storyCards.forEach((card, index) => {
    // Hold each chapter for reading; scrub a smooth crossfade between holds.
    const blend = Math.max(0, Math.min(1, (Math.abs(index - phase) - .2) / .6));
    const opacity = pinned ? 1 - blend * blend * (3 - 2 * blend) : 1;
    card.style.setProperty('--chapter-opacity', opacity.toFixed(4));
    const copyBlend = Math.max(0, opacity * 2 - 1);
    card.style.setProperty('--chapter-copy-opacity', (copyBlend * copyBlend * (3 - 2 * copyBlend)).toFixed(4));
    card.style.setProperty('--chapter-y', `${(Math.sign(index - phase) * (1 - opacity) * 40).toFixed(2)}px`);
    card.style.setProperty('--chapter-scale', (1 - (1 - opacity) * .04).toFixed(4));
    card.dataset.visible = String(opacity > 0);
    card.dataset.active = String(index === active);
    card.inert = pinned && index !== active;
    if (card.inert) card.setAttribute('aria-hidden', 'true');
    else card.removeAttribute('aria-hidden');
  });
  storySteps.forEach((button, index) => button.setAttribute('aria-pressed', String(index === active)));
}

let framePending = false;
function updateMotion() {
  framePending = false;
  /* RETIRED THEME: City of Swift dock animation.
  if (document.body.dataset.design === 'aurora') {
    const top = document.querySelector('.comparison').offsetHeight;
    const rect = cityHero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (top - rect.top) / rect.height));
    cityHero.style.setProperty('--city-progress', reducedMotion.matches ? '0' : progress.toFixed(4));
    const showDock = rect.bottom <= top + 160;
    cityDock.hidden = !showDock;
    cityDock.inert = !showDock;
    let current = -1;
    citySections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= top + 160) current = index;
    });
    cityDockLinks.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  } else {
    cityDock.hidden = true;
    cityDock.inert = true;
  }
  */
  const top = navigation?.offsetHeight || 0;
  document.documentElement.style.setProperty('--nav-height', `${top}px`);
  observeCityTitle?.(top);
  updateStoryMotion(top);
  if (cityScene) {
    const rect = cityScene.getBoundingClientRect();
    const drift = reducedMotion.matches ? 0 : Math.max(-12, Math.min(12, (innerHeight / 2 - rect.top - rect.height / 2) / (innerHeight + rect.height) * 24));
    cityScene.style.setProperty('--city-drift', `${drift.toFixed(2)}px`);
  }

}
function scheduleMotion() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateMotion);
  }
}
/* RETIRED THEME: City of Swift reveal observer and comparison bindings.
function observeCityReveals() {
  cityRevealObserver?.disconnect();
  if (reducedMotion.matches || typeof IntersectionObserver === 'undefined') return;
  cityRevealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      cityRevealObserver.unobserve(entry.target);
      if (entry.target.dataset.citySeen) return;
      entry.target.dataset.citySeen = 'true';
      if (reducedMotion.matches || entry.boundingClientRect.bottom <= 0) return;
      const siblings = [...entry.target.parentElement.children];
      const stagger = entry.target.matches('.community-member, .community-program') ? siblings.indexOf(entry.target) % 4 * 65 : 0;
      entry.target.animate([{opacity: .45, transform: 'translateY(22px)'}, {opacity: 1, transform: 'none'}], {
        duration: 700, delay: stagger, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'
      });
    });
  }, {threshold: .08, rootMargin: '0px 0px -24px 0px'});
  cityWorld.querySelectorAll('.city-welcome, .lounge-intro>div, .community-heading, .event-entry, .community-program, .community-member, .lounge-room-heading, .lounge-explorer, .app-overview, .lounge-ethos>div, .community-year-stats, .lounge-closing').forEach(target => {
    if (!target.dataset.citySeen) cityRevealObserver.observe(target);
  });
}
choices.forEach(button => button.addEventListener('click', () => selectDesign(button.dataset.choice, true)));
*/
window.addEventListener('scroll', scheduleMotion, {passive: true});
window.addEventListener('resize', scheduleMotion);
if (typeof ResizeObserver !== 'undefined' && navigation) new ResizeObserver(scheduleMotion).observe(navigation);
reducedMotion.addEventListener('change', () => {
  // RETIRED: cityWorld.getAnimations({subtree: true}).forEach(animation => animation.cancel());
  // RETIRED: observeCityReveals();
  scheduleMotion();
});
// RETIRED: selectDesign(new URLSearchParams(location.search).get('design'));
window.addEventListener('hashchange', () => { syncLiquidLocation(); scrollToCurrentAnchor(); });
window.addEventListener('popstate', () => { syncLiquidLocation(); scrollToCurrentAnchor(); });
syncLiquidLocation();
scheduleMotion();

/* RETIRED THEME: City of Swift room tabs.
const roomTabs = [...document.querySelectorAll('[data-room]')];
function selectRoom(name) {
  if (!roomTabs.some(tab => tab.dataset.room === name)) return;
  roomTabs.forEach(tab => {
    const selected = tab.dataset.room === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(`room-${tab.dataset.room}`).hidden = !selected;
  });
}
roomTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectRoom(tab.dataset.room));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % roomTabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + roomTabs.length) % roomTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = roomTabs.length - 1;
    else return;
    event.preventDefault();
    selectRoom(roomTabs[next].dataset.room);
    roomTabs[next].focus();
  });
});

*/
// Liquid Night reads the same files as the existing community site.
// Text is escaped and links are restricted before JSON enters the page.
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}
function safeURL(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing content URL');
  const url = new URL(value, location.href);
  if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) throw new Error('Unsupported content URL');
  return url.href;
}
function contentLink(url, body, className = '') {
  const href = safeURL(url);
  return `<a class="${escapeHTML(className)}" href="${escapeHTML(href)}"${href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener noreferrer"'}>${body}</a>`;
}
function ahmedabadDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}
function orderSpeakers(speakers, events = [], today = ahmedabadDate()) {
  const ids = new Set(speakers.map(speaker => speaker.id));
  const latest = new Map();
  for (const event of events) {
    if (event.date == null && event.speakerIds == null && event.source == null) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date) || Number.isNaN(Date.parse(event.date)) || new Date(event.date).toISOString().slice(0, 10) !== event.date ||
        !Array.isArray(event.speakerIds) || event.speakerIds.some(id => !ids.has(id)) ||
        !/^https:\/\/github\.com\/Swift-Ahmedabad\/Talks\/blob\/[a-f0-9]{40}\/Swift-Ahmedabad\/.+\/Info\.yml$/.test(event.source)) throw new Error('Unverified speaker chronology');
    if (event.status !== 'Past event' || event.date > today) continue;
    for (const id of event.speakerIds) if (event.date > (latest.get(id) || '')) latest.set(id, event.date);
  }
  return [...speakers].sort((a, b) => (latest.get(b.id) || '').localeCompare(latest.get(a.id) || '') || a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}) || a.id.localeCompare(b.id));
}
function contentHTML(type, data, theme) {
  const text = escapeHTML;
  if (type === 'events') return `<div class="feature-gallery-heading event-gallery-heading"><p>Explore our event archive</p><div><button type="button" data-gallery-step="-1" aria-label="Previous event" aria-controls="${theme}-event-gallery">←</button><button type="button" data-gallery-step="1" aria-label="Next event" aria-controls="${theme}-event-gallery">→</button></div></div><div class="event-list" data-gallery="cards" id="${theme}-event-gallery" tabindex="0" role="region" aria-label="Swift Ahmedabad event archive">${data.events.map((event, index) => contentLink(event.url, `
    <div class="event-art">${event.image ? `<img src="${text(safeURL(event.image))}" alt="${text(event.title)} event poster" loading="lazy" width="800" height="800">` : `<span class="event-date-art">${text(event.period)}<svg aria-hidden="true"><use href="#bird"/></svg></span>`}</div>
    <div class="event-copy"><div class="event-meta"><span>${text(event.period)}</span><span>${text(event.status)}</span></div><h3>${text(event.title)}</h3><p>${text(event.description)}</p><div class="event-place">${text(event.venue)}</div><span class="event-action">View event details <b aria-hidden="true">↗</b></span></div>`, 'event-entry')).join('')}</div><p class="content-footnote">${text(data.subtitle)}</p>`;
  if (type === 'programs') {
    return `<div class="program-list">${data.programs.map((program, index) => contentLink(program.url, `<span class="program-index">0${index + 1} <span aria-hidden="true">${text(program.emoji)}</span></span><h3>${text(program.name)}</h3><p>${text(program.description)}</p><div><span>${text(program.stat)}</span><b aria-hidden="true">↗</b></div>`, 'community-program')).join('')}</div>`;
  }
  if (type === 'team' || type === 'speakers') {
    const members = type === 'speakers' ? data.speakers : data.members;
    const label = type === 'speakers' ? 'speakers' : 'team members';
    const memberHTML = (member, index) => {
      if (member.image && !/^assets\/speakers\/[\w.-]+\.(?:jpe?g|png)$/.test(member.image)) throw new Error('Unsupported profile image');
      const speaker = type === 'speakers';
      const destination = speaker ? member.linkedIn : member.profileUrl ?? member.linkedIn;
      if (typeof destination !== 'string') throw new Error('Missing profile URL');
      const profileURL = new URL(destination);
      if (profileURL.protocol !== 'https:') throw new Error('Unsupported profile URL');
      const initials = text(member.name.split(/\s+/).map(word => word[0]).filter(Boolean).slice(0, 2).join(''));
      const avatar = `<span class="member-initials" aria-hidden="true">${initials}${member.image ? `<img class="profile-photo" src="${text(member.image)}" alt="" width="80" height="80" loading="lazy" decoding="async">` : ''}</span>`;
      const bio = `<p class="bio-preview">${text(member.about)}</p>`;
      const action = `<button type="button" data-read-bio aria-haspopup="dialog" aria-controls="profile-dialog" hidden>${speaker ? 'See more' : 'Read bio'}<span class="visually-hidden">: ${text(member.name)}</span></button>`;
      const previewID = `${theme}-speaker-preview-${index}`;
      if (!speaker) return `<article class="community-member"><div class="crew-badge-paper"><span class="crew-badge-brand" aria-hidden="true"><svg viewBox="0 0 100 100"><use href="#bird"/></svg><span>SWIFT<br>AHMEDABAD</span></span><div class="crew-badge-identity">${avatar}<h3>${text(member.name)}</h3></div><span class="crew-badge-label" aria-hidden="true">Community crew</span>${member.role ? `<p>${text(member.role)}</p>` : ''}${bio}<div class="profile-actions">${action}${contentLink(profileURL.href, 'Visit profile ↗', 'profile-link')}</div></div></article>`;
      return `<article class="community-member"${speaker ? ' data-speaker-preview' : ''}>${speaker ? `<button type="button" class="speaker-photo-button" data-speaker-preview-toggle aria-label="Toggle bio preview for ${text(member.name)}" aria-controls="${previewID}" aria-expanded="false" aria-hidden="true" disabled>${avatar}<span class="speaker-bio-hint" hidden>Bio</span></button><span class="speaker-reflection" aria-hidden="true">${initials}${member.image ? `<img class="speaker-reflection-photo" src="${text(member.image)}" alt="" width="80" height="80" loading="lazy" decoding="async">` : ''}</span>` : avatar}<div><h3>${text(member.name)}</h3>${speaker ? `<div id="${previewID}" data-speaker-preview-content>${bio}<div class="profile-actions">${action}</div></div><div class="profile-actions">` : `${bio}<div class="profile-actions">${action}`}${contentLink(member.linkedIn, 'Connect on LinkedIn ↗', 'profile-link')}</div></div></article>`;
    };
    const recency = data.recencyUnavailable ? '<p class="content-footnote" role="status">Speaker recency is unavailable. Profiles are shown alphabetically; try loading content again.</p>' : '';
    if (type === 'speakers') return `${recency}<div class="feature-gallery-heading speaker-gallery-heading"><p>Meet all ${members.length} speakers · Scroll to explore</p><div><button type="button" data-gallery-step="-1" aria-label="Previous speaker" aria-controls="${theme}-speaker-gallery">←</button><button type="button" data-gallery-step="1" aria-label="Next speaker" aria-controls="${theme}-speaker-gallery">→</button></div></div><div class="speaker-flow" data-gallery="speakers" id="${theme}-speaker-gallery" tabindex="0" role="region" aria-label="Speaker portraits; use arrow keys to browse">${members.map((member, index) => `<div class="speaker-slot">${memberHTML(member, index)}</div>`).join('')}</div>`;
    const expanded = members.slice(4);
    expanded.forEach(member => {
      const key = member.profileUrl ?? member.linkedIn;
      if (!crewOrder.has(key)) crewOrder.set(key, Math.random());
    });
    expanded.sort((a, b) => crewOrder.get(a.profileUrl ?? a.linkedIn) - crewOrder.get(b.profileUrl ?? b.linkedIn));
    return `<div class="member-grid">${members.slice(0, 4).map(memberHTML).join('')}</div><details class="team-directory"><summary>Meet all ${members.length} ${label} <span aria-hidden="true">+</span></summary><div class="member-grid">${expanded.map((member, index) => memberHTML(member, index + 4)).join('')}</div></details>`;
  }

  if (type === 'sponsors') return `<p class="sponsor-intro">${text(data.subtitle)}</p><div class="host-list">${data.sponsors.map(sponsor => {
    if (sponsor.logo && !/^assets\/sponsors\/[\w-]+\.(?:svg|png|webp)$/.test(sponsor.logo)) throw new Error('Unsupported sponsor logo');
    return contentLink(sponsor.url, `${sponsor.logo ? `<img class="sponsor-logo" src="${text(sponsor.logo)}" alt="" width="240" height="88" loading="lazy" decoding="async">` : ''}<strong>${text(sponsor.name)}</strong><span aria-hidden="true">↗</span>`, `community-host${sponsor.logo ? ' sponsor-host' : ''}`);
  }).join('')}</div>`;
  if (type === 'links') return `<div class="community-links">${data.links.map(link => contentLink(link.url, `<svg class="connect-symbol" aria-hidden="true" focusable="false"><use href="#connect-${text(link.icon)}"/></svg><div><h3>${text(link.name)}</h3><p>${text(link.description || 'Find us in Ahmedabad')}</p></div><b aria-hidden="true">↗</b>`, 'community-connect-link')).join('')}</div>`;
  if (type === 'contact') return `<div class="contact-list">${data.items.map(item => contentLink(item.email ? `mailto:${item.email}${item.id === 'sponsor' ? '?subject=Sponsorship%20offer%20for%20Swift%20Ahmedabad' : ''}` : item.url, `<h3>${text(item.title)}</h3><p>${text(item.description)}</p><span>${item.email ? text(item.email) : 'Submit your talk proposal'} <b aria-hidden="true">↗</b></span>`, `community-contact${item.id === 'sponsor' ? ' sponsor-mail-link' : ''}`)).join('')}</div>`;
  if (type === 'app') return `<div class="app-overview"><div class="app-description"><p class="community-eyebrow">YOUR COMMUNITY, IN YOUR POCKET</p><div class="app-product-name"><img src="${text(safeURL(data.app.icon))}" width="64" height="64" alt="${text(data.app.name)} app icon" loading="lazy"><h2>${text(data.app.name)}</h2></div><h3>${text(data.app.tagline)}</h3><p>${text(data.app.description)}</p><div class="app-downloads">${contentLink(data.app.appStoreUrl, 'Download on the App Store ↗', 'app-store-link')}${contentLink(data.app.testFlightUrl, 'Try the TestFlight beta ↗', 'app-beta-link')}<a href="privacy-policy.html">Privacy policy</a></div></div><div class="app-feature-intro"><svg aria-hidden="true"><use href="#bird"/></svg><p>Discover a talk.<br>Prepare your own.<br><span>Keep learning.</span></p><span>${data.features.length} ways to explore the Swift ecosystem.</span></div></div><div class="feature-gallery-heading"><p>Inside the app</p><div><button type="button" data-gallery-step="-1" aria-label="Previous app features" aria-controls="${theme}-features">←</button><button type="button" data-gallery-step="1" aria-label="Next app features" aria-controls="${theme}-features">→</button></div></div><div class="feature-gallery" data-gallery="pages" id="${theme}-features" tabindex="0" role="region" aria-label="${text(data.app.name)} app feature gallery">${data.features.map(feature => `<article class="app-feature"><div class="feature-phone"><img src="${text(safeURL(feature.image))}" alt="${text(feature.title)} in ${text(data.app.name)}" loading="lazy" width="750" height="1624"></div><h3>${text(feature.title)}</h3><p>${text(feature.description)}</p></article>`).join('')}</div>`;
  return '';
}

function galleryTarget(gallery, direction) {
  const maximum = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
  const current = Math.max(0, Math.min(maximum, gallery.scrollLeft));
  if (!['cards', 'speakers'].includes(gallery.dataset.gallery)) return Math.max(0, Math.min(maximum, current + direction * gallery.clientWidth));
  const first = gallery.children[0]?.offsetLeft || 0;
  const positions = [...new Set([0, ...Array.from(gallery.children, card => Math.min(maximum, card.offsetLeft - first)), maximum])].sort((a, b) => a - b);
  return direction > 0 ? positions.find(position => position > current + 1) ?? maximum : positions.reverse().find(position => position < current - 1) ?? 0;
}
function updateSpeakerFlow(gallery) {
  const center = gallery.scrollLeft + gallery.clientWidth / 2;
  Array.from(gallery.children).forEach(card => {
    const offset = (card.offsetLeft + card.offsetWidth / 2 - center) / Math.max(1, card.offsetWidth);
    const portrait = card.firstElementChild;
    portrait.style.setProperty('--speaker-turn', `${Math.max(-1, Math.min(1, offset)) * -52}deg`);
    portrait.style.setProperty('--speaker-depth', `${-Math.min(3, Math.abs(offset)) * 100}px`);
    portrait.style.setProperty('z-index', String(100 - Math.min(99, Math.round(Math.abs(offset) * 10))));
  });
}
function updateGalleryControls(gallery) {
  const maximum = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
  document.querySelectorAll('[data-gallery-step]').forEach(button => {
    if (button.getAttribute('aria-controls') !== gallery.id) return;
    const disabled = String(Number(button.dataset.galleryStep) < 0 ? gallery.scrollLeft <= 1 : gallery.scrollLeft >= maximum - 1);
    if (button.getAttribute('aria-disabled') !== disabled) button.setAttribute('aria-disabled', disabled);
  });
}
let speakerPreview = null, mouseSpeaker = null;
let refreshBiographies = () => {};
function closeSpeakerPreview(destination) {
  const previous = speakerPreview;
  speakerPreview = null;
  if (!previous?.card.isConnected) return;
  const region = previous.card.querySelector('[data-speaker-preview-content]');
  const toggle = previous.card.querySelector('[data-speaker-preview-toggle]');
  if (region.contains(document.activeElement)) (destination || toggle).focus({preventScroll: true});
  region.setAttribute('aria-hidden', 'true');
  toggle.setAttribute('aria-expanded', 'false');
}
function openSpeakerPreview(card, mode) {
  if (!card.isConnected || !card.classList.contains('speaker-preview-ready') || profileDialog?.open) return;
  if (speakerPreview?.card === card) return;
  closeSpeakerPreview(card.querySelector('[data-speaker-preview-toggle]'));
  speakerPreview = {card, mode};
  card.querySelector('[data-speaker-preview-content]').setAttribute('aria-hidden', 'false');
  card.querySelector('[data-speaker-preview-toggle]').setAttribute('aria-expanded', 'true');
}
function restoreProfile(card, failed = false) {
  const region = card.querySelector('[data-speaker-preview-content]');
  const toggle = card.querySelector('[data-speaker-preview-toggle]');
  const action = card.querySelector('[data-read-bio]');
  const heading = card.querySelector('h3');
  if (document.activeElement === toggle || document.activeElement === action || region?.contains(document.activeElement)) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({preventScroll: true});
  }
  if (speakerPreview?.card === card) closeSpeakerPreview(heading);
  card.classList.remove('speaker-preview-ready');
  card.classList.remove('bio-enabled');
  region?.removeAttribute('aria-hidden');
  if (action) action.hidden = true;
  if (toggle) {
    toggle.disabled = true;
    toggle.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    const hint = toggle.querySelector('.speaker-bio-hint');
    if (hint) hint.hidden = true;
  }
  if (failed) card.dataset.profileFallback = 'true';
}
function speakerClick(event) {
  if (profileDialog?.open || profileDialog?.contains(event.target)) return;
  const toggle = event.target.closest('[data-speaker-preview-toggle]');
  if (toggle) {
    if (toggle.disabled) return;
    refreshBiographies();
    if (toggle.disabled) return;
    const card = toggle.closest('[data-speaker-preview]');
    if (speakerPreview?.card === card) closeSpeakerPreview(toggle);
    else openSpeakerPreview(card, 'activation');
    return;
  }
  if (!speakerPreview || speakerPreview.card.contains(event.target)) return;
  if (event.clientX >= document.documentElement.clientWidth || event.clientY >= document.documentElement.clientHeight) return;
  const destination = event.target.closest('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]');
  closeSpeakerPreview(destination);
}
function speakerFocus(target) {
  if (speakerPreview?.mode === 'hover' && !profileDialog?.open && mouseSpeaker !== speakerPreview.card && !speakerPreview.card.contains(target)) closeSpeakerPreview();
}
let disposeContentUI = () => {};
function initContentUI() {
  disposeContentUI();
  const cleanup = [];
  disposeContentUI = () => {
    disposeContentUI = () => {};
    cleanup.splice(0).forEach(dispose => dispose());
  };
  const galleries = [...document.querySelectorAll('[data-gallery]')];
  const refreshGallery = gallery => { updateGalleryControls(gallery); if (gallery.dataset.gallery === 'speakers') updateSpeakerFlow(gallery); };
  const galleryResize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => galleries.forEach(refreshGallery));
  galleries.forEach(gallery => {
    let frame = null;
    const update = () => { if (frame === null) frame = requestAnimationFrame(() => { frame = null; refreshGallery(gallery); }); };
    gallery.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    const keyboard = event => {
      if (event.target !== gallery || gallery.dataset.gallery !== 'speakers' || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const left = event.key === 'Home' ? 0 : event.key === 'End' ? gallery.scrollWidth - gallery.clientWidth : galleryTarget(gallery, event.key === 'ArrowRight' ? 1 : -1);
      gallery.scrollBy({left: left - gallery.scrollLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    };
    gallery.addEventListener('keydown', keyboard);
    const focus = event => {
      if (gallery.dataset.gallery !== 'speakers') return;
      const slot = event.target.closest('.speaker-slot');
      if (slot) gallery.scrollBy({left: slot.offsetLeft - gallery.firstElementChild.offsetLeft - gallery.scrollLeft, behavior: 'instant'});
    };
    gallery.addEventListener('focusin', focus);
    cleanup.push(() => { gallery.removeEventListener('scroll', update); gallery.removeEventListener('keydown', keyboard); gallery.removeEventListener('focusin', focus); window.removeEventListener('resize', update); if (frame !== null) cancelAnimationFrame(frame); });
    galleryResize?.observe(gallery);
    if (gallery.firstElementChild) galleryResize?.observe(gallery.firstElementChild);
    refreshGallery(gallery);
  });
  cleanup.push(() => galleryResize?.disconnect());
  const dialog = document.getElementById('profile-dialog');
  if (dialog?.showModal) {
    const previews = [...document.querySelectorAll('.bio-preview')];
    const speakers = [...document.querySelectorAll('[data-speaker-preview]')];
    const listeners = [];
    let frame = null, disposed = false, resize;
    function syncPreviews() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      if (disposed) return;
      previews.forEach(preview => {
        if (!preview.isConnected || !preview.clientWidth) return;
        const card = preview.closest('.community-member');
        if (card.dataset.profileFallback) return;
        try {
          const button = card.querySelector('[data-read-bio]');
          card.classList.add('bio-enabled');
          if (button !== document.activeElement && !(dialog.open && button === profileInvoker)) button.hidden = preview.scrollHeight <= preview.clientHeight + 1;
          const toggle = card.querySelector('[data-speaker-preview-toggle]');
          if (toggle && !card.classList.contains('speaker-preview-ready')) {
            const region = card.querySelector('[data-speaker-preview-content]');
            region.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.querySelector('.speaker-bio-hint').hidden = false;
            card.classList.add('speaker-preview-ready');
            toggle.disabled = false;
            toggle.removeAttribute('aria-hidden');
          }
        } catch (error) { restoreProfile(card, true); }
      });
    }
    const queue = () => { if (!disposed && frame === null) frame = requestAnimationFrame(syncPreviews); };
    function disposeProfiles() {
      if (disposed) return;
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      resize?.disconnect();
      listeners.splice(0).forEach(remove => remove());
      document.removeEventListener('toggle', queue, true);
      document.removeEventListener('focusout', queue);
      window.removeEventListener('resize', queue);
      document.fonts?.removeEventListener('loadingdone', queue);
      if (refreshBiographies === syncPreviews) refreshBiographies = () => {};
      mouseSpeaker = null;
      speakers.filter(card => card.isConnected).forEach(card => restoreProfile(card));
      speakerPreview = null;
    }
    cleanup.push(disposeProfiles);
    try {
      speakers.forEach(card => {
        const enter = event => {
          if (event.pointerType !== 'mouse' || !card.classList.contains('speaker-preview-ready')) return;
          mouseSpeaker = card;
          if (!speakerPreview || (speakerPreview.mode === 'hover' && !speakerPreview.card.contains(document.activeElement))) openSpeakerPreview(card, 'hover');
        };
        const leave = event => {
          if (event.pointerType !== 'mouse') return;
          if (mouseSpeaker === card) mouseSpeaker = null;
          if (speakerPreview?.card === card && speakerPreview.mode === 'hover' && !profileDialog?.open && !card.contains(document.activeElement)) closeSpeakerPreview();
        };
        listeners.push(() => card.removeEventListener('pointerenter', enter), () => card.removeEventListener('pointerleave', leave));
        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointerleave', leave);
      });
      resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(queue);
      previews.forEach(preview => resize?.observe(preview));
      document.addEventListener('toggle', queue, true);
      document.addEventListener('focusout', queue);
      window.addEventListener('resize', queue);
      document.fonts?.addEventListener('loadingdone', queue);
      document.fonts?.ready.then(queue);
      refreshBiographies = syncPreviews;
      syncPreviews();
    } catch (error) {
      disposeProfiles();
    }
  }
}

const profileDialog = document.getElementById('profile-dialog');
let profileInvoker, profileScroll = 0, backdropDown = false;
function openProfile(button) {
  if (!profileDialog?.showModal || profileDialog.open) return;
  const card = button.closest('.community-member');
  profileDialog.querySelector('[data-profile-name]').textContent = card.querySelector('h3').textContent;
  profileDialog.querySelector('[data-profile-avatar]').replaceChildren(card.querySelector('.member-initials').cloneNode(true));
  const paragraphs = card.querySelector('.bio-preview').textContent.split(/\n+/).map(text => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  });
  profileDialog.querySelector('[data-profile-bio]').replaceChildren(...paragraphs);
  profileDialog.querySelector('[data-profile-link]').href = card.querySelector('.profile-link').href;
  profileDialog.querySelector('[data-profile-link]').textContent = card.querySelector('.profile-link').textContent;
  profileInvoker = button;
  profileScroll = window.scrollY;
  document.documentElement.classList.add('profile-open');
  try { profileDialog.showModal(); }
  catch (error) {
    document.documentElement.classList.remove('profile-open');
    profileInvoker = undefined;
    if (profileDialog.open) profileDialog.close();
    restoreProfile(card, true);
    window.scrollTo({top: profileScroll, behavior: 'instant'});
    return;
  }
  profileDialog.querySelector('[data-profile-name]').focus({preventScroll: true});
}
if (profileDialog?.showModal) {
  const outside = event => {
    const rect = profileDialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  profileDialog.addEventListener('pointerdown', event => { backdropDown = event.target === profileDialog && outside(event); });
  profileDialog.addEventListener('pointercancel', () => { backdropDown = false; });
  profileDialog.addEventListener('click', event => {
    if (event.target.closest('[data-profile-close]') || (backdropDown && event.target === profileDialog && outside(event))) profileDialog.close();
    backdropDown = false;
  });
  profileDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('profile-open');
    window.scrollTo({top: profileScroll, behavior: 'instant'});
    if (profileInvoker?.isConnected) profileInvoker.focus({preventScroll: true});
  });
}

async function loadCommunityContent() {
  if (profileDialog?.open) profileDialog.close();
  disposeContentUI();
  const status = document.querySelector('.content-status');
  const retry = document.getElementById('retry-content');
  status.hidden = false;
  status.querySelector('span').textContent = 'Loading community content…';
  retry.hidden = true;
  let sponsorshipEmail;
  const files = ['links', 'programs', 'team', 'speakers', 'sponsors', 'app', 'contact', 'events', 'sponsorship-email'];
  const loaded = {};
  const results = await Promise.allSettled(files.map(async type => {
    const response = await fetch(`${type}.json`, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`Could not load ${type}`);
    const data = await response.json();
    if (type === 'speakers' && !Array.isArray(data?.speakers)) throw new Error('Invalid speaker profiles');
    loaded[type] = data;
    if (type === 'sponsorship-email') sponsorshipEmail = data;
    if (type === 'links') {
      data.links.forEach(link => { links[link.id] = safeURL(link.url); });
      links.email = safeURL(`mailto:${data.community.email}`);
      document.querySelectorAll('[data-community-description]').forEach(node => { node.textContent = data.community.description; });
    }
    if (type === 'contact') {
      links.speak = safeURL(data.items.find(item => item.id === 'speakers').url);
    }
    if (type === 'speakers') return;
    document.querySelectorAll(`[data-content="${type === 'links' ? 'connect' : type}"]`).forEach(container => {
      const theme = container.closest('.world').id.replace('world-', '');
      container.innerHTML = contentHTML(type, data, theme);
    });
  }));
  if (loaded.speakers) {
    try {
      let speakers, recencyUnavailable = !loaded.events;
      try { speakers = orderSpeakers(loaded.speakers.speakers, loaded.events?.events); }
      catch (error) {
        speakers = orderSpeakers(loaded.speakers.speakers);
        recencyUnavailable = true;
        results.push({status: 'rejected', reason: error});
      }
      const markup = contentHTML('speakers', {speakers, recencyUnavailable}, 'glass');
      document.querySelectorAll('[data-content="speakers"]').forEach(container => { container.innerHTML = markup; });
    } catch (error) {
      results.push({status: 'rejected', reason: error});
    }
  }
  initContentUI();
  document.querySelectorAll('[data-link]').forEach(anchor => {
    const href = links[anchor.dataset.link];
    if (href) anchor.href = href;
  });
  if (sponsorshipEmail && links.email) {
    document.querySelectorAll('.sponsor-mail-link').forEach(anchor => {
      anchor.href = `${links.email}?subject=${encodeURIComponent(sponsorshipEmail.subject)}&body=${encodeURIComponent(sponsorshipEmail.body)}`;
    });
  }
  const failures = results.filter(result => result.status === 'rejected');
  document.documentElement.dataset.contentReady = failures.length ? 'partial' : 'ready';
  if (failures.length) {
    status.querySelector('span').textContent = 'Some community content could not load. Please try again.';
    retry.hidden = false;
  } else status.hidden = true;
  // A direct team/app/event link can arrive before those sections finish loading.
  scrollToCurrentAnchor();
  // RETIRED: observeCityReveals();
  scheduleMotion();
}
document.getElementById('retry-content').addEventListener('click', loadCommunityContent);
document.addEventListener('error', event => { if (event.target?.matches?.('.profile-photo,.speaker-reflection-photo,.sponsor-logo')) event.target.remove(); }, true);
document.addEventListener('click', event => {
  const step = event.target.closest('[data-story-step]');
  if (step && story?.dataset.pinned === 'true') {
    step.focus({preventScroll: true});
    scrollToStoryStep(Number(step.dataset.storyStep), 'smooth');
  }
  const menuLink = event.target.closest('.section-menu a');
  if (sectionMenu?.open && (menuLink || !sectionMenu.contains(event.target))) sectionMenu.open = false;
  speakerClick(event);
  const bio = event.target.closest('[data-read-bio]');
  if (bio) openProfile(bio);
  const button = event.target.closest('[data-gallery-step]');
  if (!button || button.getAttribute('aria-disabled') === 'true') return;
  const gallery = document.getElementById(button.getAttribute('aria-controls'));
  gallery.scrollBy({left: galleryTarget(gallery, Number(button.dataset.galleryStep)) - gallery.scrollLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || profileDialog?.open) return;
  if (sectionMenu?.open) {
    sectionMenu.open = false;
    sectionMenu.querySelector('summary').focus();
  } else if (speakerPreview) {
    event.preventDefault();
    closeSpeakerPreview();
  }
});
document.addEventListener('focusin', event => { scheduleMotion(); speakerFocus(event.target); });
if (typeof ResizeObserver !== 'undefined' && storyPin) {
  const storyResize = new ResizeObserver(scheduleMotion);
  [storyPin, ...storyCards].forEach(node => storyResize.observe(node));
}
if (document.fonts) document.fonts.ready.then(scheduleMotion);
loadCommunityContent();
