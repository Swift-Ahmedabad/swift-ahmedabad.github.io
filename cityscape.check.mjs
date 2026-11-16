import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync} from 'node:fs';
import {landmarkState, popupPosition, initCityscape} from './cityscape.mjs';

let state = {activeLandmark: null, owner: null};
const send = event => state = landmarkState(state, event);
const activate = (id, owner) => send({type: 'activate', id, owner});
activate('jaali', 'pointer');
activate('gate', 'pointer');
send({type: 'leave', id: 'jaali', owner: 'pointer'});
assert.equal(state.activeLandmark, 'gate', 'Old leave cannot clear new hover');
activate('pol', 'focus');
send({type: 'leave', id: 'gate', owner: 'pointer'});
assert.equal(state.activeLandmark, 'pol', 'Keyboard focus wins over old hover');
activate('ashram', 'pointer');
assert.equal(state.activeLandmark, 'ashram', 'New pointer input can replace focus');
send({type: 'clear'});
send({type: 'leave', id: 'ashram', owner: 'pointer'});
assert.equal(state.activeLandmark, null, 'Leave never reopens dismissed selection');
for (const id of ['jaali', 'gate', 'chabutra']) activate(id, 'pointer');
assert.equal(state.activeLandmark, 'chabutra');
send({type: 'tap', id: 'bridge', owner: 'press'});
send({type: 'leave', id: 'bridge', owner: 'pointer'});
assert.equal(state.activeLandmark, 'bridge', 'Touch selection persists beyond pointer exit');
send({type: 'tap', id: 'bridge', owner: 'press'});
assert.equal(state.activeLandmark, null, 'Second tap dismisses');

const rect = (left, top, width, height) => ({left, top, width, height, right: left + width, bottom: top + height});
const anchor = rect(400, 400, 100, 100), bounds = rect(16, 16, 1000, 800), size = {width: 280, height: 100};
assert.equal(popupPosition(anchor, bounds, size).placement, 'above');
assert.equal(popupPosition(anchor, bounds, size, [rect(200, 200, 500, 190)]).placement, 'right');
assert.equal(popupPosition(anchor, bounds, size, [rect(200, 200, 500, 190), rect(510, 300, 400, 300)]).placement, 'left');
assert.equal(popupPosition(anchor, rect(380, 380, 140, 140), size), null, 'Crowded viewport uses reserved slot');
assert.equal(popupPosition(rect(900, 20, 100, 100), bounds, size).placement, 'left', 'Try remaining positions near viewport edge');

// Small event/DOM harness exercises real handlers without a browser or dependency.
class Element extends EventTarget {
  dataset = {}; attributes = {}; children = []; selectors = {}; textContent = ''; hidden = false; style = {};
  rect = rect(0, 0, 0, 0);
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  setAttribute(key, value) { this.attributes[key] = value; }
  querySelector(key) { return this.selectors[key] || null; }
  querySelectorAll(key) { return this.selectors[key] || []; }
  getBoundingClientRect() { return this.rect; }
  focus() { document.activeElement = this; emit(this, 'focus'); }
}
const emit = (node, type, props = {}) => {
  const event = new Event(type);
  for (const [key, value] of Object.entries(props)) Object.defineProperty(event, key, {value});
  node.dispatchEvent(event);
};
const scene = new Element(), panel = new Element(), close = new Element(), title = new Element(), story = new Element();
const world = new Element(), base = new Element(), fallback = new Element(), announcement = new Element();
scene.rect = rect(0, 0, 1200, 1100); panel.rect = rect(0, 0, 280, 100);
base.complete = true; base.naturalWidth = 1600;
title.textContent = 'Explore'; story.textContent = 'Choose a landmark';
panel.selectors = {'[data-landmark-close]': close}; panel.children = [close];
let resolveSlow;
const requested = [];
const ids = ['jaali', 'pol', 'gate', 'chabutra', 'stadium', 'stepwell', 'ashram', 'bridge'];
const buttons = ids.map(id => {
  const button = new Element(); button.dataset = {landmark: id, title: id, description: `Story: ${id}`};
  button.rect = rect(400, 400, 100, 100); return button;
});
const pieces = buttons.map((button, index) => {
  const piece = new Element(), color = new Element(), mobile = new Element();
  piece.dataset.artwork = button.dataset.landmark; color.hidden = true;
  color.dataset.colorSrc = `${piece.dataset.artwork}-desktop.webp`;
  mobile.dataset.colorSrc = `${piece.dataset.artwork}-portrait.webp`; mobile.media = '(max-width: 767px)';
  color.decode = () => {
    requested.push(color.src);
    return index === 0 ? Promise.reject(Error('missing')) : index === 1 && color.src.includes('desktop')
      ? new Promise(resolve => { resolveSlow = resolve; }) : Promise.resolve();
  };
  piece.selectors = {'.landmark-color': color, 'source[data-color-src]': [mobile]}; return piece;
});
scene.children = [...buttons, panel]; scene.closest = () => world;
scene.selectors = {'[data-landmark]': buttons, '[data-artwork]': pieces, '.landmark-information': panel,
  '[data-landmark-title]': title, '[data-landmark-story]': story, '[data-landmark-announcement]': announcement, '.cityscape-base': base, '.cityscape-fallback': fallback};
globalThis.document = new Element(); globalThis.window = new Element();
window.innerWidth = 1200; window.innerHeight = 900;
const portrait = new Element(); portrait.matches = false; window.matchMedia = () => portrait;
const stage = new Element(), identity = new Element(), cityWords = new Element();
stage.rect = rect(0, 0, 1200, 675);
identity.offsetHeight = 200;
cityWords.rect = rect(0, 0, 300, 100);
identity.selectors['.city-words'] = cityWords;
scene.selectors['.cityscape-stage'] = stage;
scene.selectors['.liquid-hero-copy'] = identity;
let observeGeometry;
const layoutTargets = new Set();
globalThis.ResizeObserver = class {
  constructor(callback) { observeGeometry = callback; }
  observe(target) { layoutTargets.add(target); }
};
let observeWorld;
globalThis.MutationObserver = class { constructor(fn) { observeWorld = fn; } observe() {} };
let frame;
globalThis.requestAnimationFrame = callback => { frame = callback; return 1; };
const flushFrame = () => { const callback = frame; frame = null; callback?.(); };
const observers = [];
globalThis.IntersectionObserver = window.IntersectionObserver = class {
  constructor(callback, options = {}) { this.callback = callback; this.options = options; observers.push(this); }
  observe() {} disconnect() {}
};
const city = initCityscape(scene);
assert.ok([scene, stage, identity, cityWords].every(node => layoutTargets.has(node)));
assert.equal(scene.dataset.expandedCopy, 'false', 'Desktop text layers over the sky when it fits');
portrait.matches = true; observeGeometry();
assert.equal(scene.dataset.expandedCopy, 'true', 'Phone text sits above the artwork');
portrait.matches = false; observeGeometry();
assert.equal(scene.dataset.expandedCopy, 'false');
cityWords.rect.width = 600; observeGeometry();
assert.equal(scene.dataset.expandedCopy, 'true', 'Wide native-script or enlarged text gets its own space');
cityWords.rect.width = 300;
identity.offsetHeight = 450; observeGeometry();
assert.equal(scene.dataset.expandedCopy, 'true', 'Tall text stays clear of landmarks');
identity.offsetHeight = 200; observeGeometry();
assert.equal(scene.dataset.expandedCopy, 'false');
assert.equal(panel.hidden, true);
assert.equal(requested.length, 0, 'Optional colors wait until the scene approaches');
observers[0].callback([{isIntersecting: true}]);
await Promise.resolve(); await Promise.resolve();
assert.equal(pieces[0].dataset.colorReady, 'false');
assert.equal(pieces[1].dataset.colorReady, 'false', 'Slow region does not delay other regions');
assert.equal(pieces[2].dataset.colorReady, 'true');
assert.ok(requested.every(path => path.includes('desktop')), 'Portrait overlays must not download on desktop');
buttons[0].focus();
observeGeometry();
assert.ok(frame, 'A selected popup repositions when the scene reflows');
flushFrame();
assert.equal(title.textContent, 'jaali', 'Story remains usable after image failure');
assert.equal(announcement.textContent, 'jaali. Story: jaali', 'Persistent live region announces the selected story');
assert.equal(panel.dataset.placement, 'above');
resolveSlow(); await Promise.resolve();
assert.equal(pieces[1].dataset.colorReady, 'true');

const mouse = {pointerType: 'mouse', buttons: 0};
emit(buttons[1], 'pointerenter', mouse); buttons[2].focus();
assert.equal(city.getState().activeLandmark, 'gate', 'Focus replaces hovered region');
emit(buttons[3], 'pointerenter', mouse);
assert.equal(city.getState().activeLandmark, 'chabutra', 'Deliberate pointer entry replaces focused region');
for (const button of buttons.slice(0, 3)) emit(button, 'pointerenter', mouse);
assert.equal(city.getState().activeLandmark, 'gate', 'Rapid switching leaves one active landmark');
emit(buttons[2], 'pointerleave', mouse); emit(panel, 'pointerenter', mouse);
await new Promise(resolve => setTimeout(resolve, 370));
assert.equal(city.getState().activeLandmark, 'gate', 'Crossing to the shared popup cancels exit grace');
emit(panel, 'pointerleave', mouse);
await new Promise(resolve => setTimeout(resolve, 370));
assert.equal(city.getState().activeLandmark, null, 'Leaving popup ends pointer reveal');

emit(buttons[4], 'pointerenter', mouse); emit(document, 'keydown', {key: 'Escape'});
emit(buttons[4], 'pointermove', mouse);
assert.equal(city.getState().activeLandmark, null, 'Stationary hover stays dismissed after Escape');
assert.equal(announcement.textContent, '', 'Dismissal clears the live region');
buttons[2].focus(); close.focus(); emit(close, 'click', {detail: 0});
assert.equal(document.activeElement, buttons[2], 'Close returns focus to its landmark');
assert.equal(city.getState().activeLandmark, null, 'Restored focus must not reopen the dismissed popup');
buttons[2].focus(); close.focus(); emit(document, 'keydown', {key: 'Escape'});
assert.equal(document.activeElement, buttons[2]);
assert.equal(city.getState().activeLandmark, null);

emit(document, 'pointerdown', {pointerType: 'touch', target: buttons[7]}); emit(document, 'pointerup');
emit(buttons[7], 'click', {detail: 1}); emit(buttons[2], 'pointerenter', mouse);
assert.equal(city.getState().activeLandmark, 'bridge', 'Synthetic hover after touch cannot steal selection');
emit(window, 'resize'); flushFrame();
assert.equal(city.getState().activeLandmark, 'bridge', 'Resize preserves tapped selection');
portrait.matches = true; emit(portrait, 'change'); flushFrame();
await Promise.resolve(); await Promise.resolve();
assert.equal(panel.dataset.placement, 'slot', 'Phones use the reserved details area');
assert.equal(panel.style.position, '', 'Portrait popup returns to normal flow');
assert.equal(city.getState().activeLandmark, 'bridge', 'Orientation change preserves selection');
assert.equal(requested.filter(path => path.includes('portrait')).length, 8, 'Each portrait region loads independently');
assert.equal(pieces[2].dataset.colorReady, 'true');
emit(buttons[7], 'click', {detail: 1});
assert.equal(city.getState().activeLandmark, null, 'Second touch dismisses');
emit(buttons[6], 'click', {detail: 1});
emit(document, 'pointerdown', {pointerType: 'touch', target: document});
assert.equal(city.getState().activeLandmark, null, 'Outside tap dismisses');

for (const button of buttons) {
  emit(document, 'keydown', {key: 'Tab'}); button.focus();
  assert.equal(title.textContent, button.dataset.title);
  assert.equal(button.attributes['aria-expanded'], 'true');
  assert.equal(buttons.filter(node => node.attributes['aria-expanded'] === 'true').length, 1);
}
emit(scene, 'focusout', {relatedTarget: new Element()});
assert.equal(city.getState().activeLandmark, null, 'Focus leaving the controls/panel clears selection');
buttons[0].focus(); observers[1].callback([{isIntersecting: false}]);
assert.equal(city.getState().activeLandmark, null, 'Scrolling the entire scene away clears selection');
buttons[0].focus(); world.hidden = true; observeWorld();
assert.equal(city.getState().activeLandmark, null);
base.naturalWidth = 0; emit(base, 'error');
assert.equal(fallback.hidden, false, 'Failed glass base exposes the text landmark list');
assert.equal(scene.dataset.baseFailed, 'true');
buttons[4].focus(); assert.equal(title.textContent, 'stadium');
base.naturalWidth = 1600; emit(base, 'load'); assert.equal(fallback.hidden, true);
console.log('PASS: state, collision placement, popup travel, keyboard/close, Escape, mixed input, responsive loading, failures and scene exit');

// Production markup is the fixture: commented themes and their assets are inactive.
const html = readFileSync('index.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const sceneMarkup = html.match(/<section\b[^>]*\bdata-cityscape\b[^>]*>([\s\S]*?)<\/section>/)?.[1];
assert.ok(sceneMarkup, 'Interactive city scene is present');
assert.equal((sceneMarkup.match(/data-landmark="/g) || []).length, 8);
assert.equal((sceneMarkup.match(/aria-controls="landmark-information"/g) || []).length, 8);
assert.match(sceneMarkup, /class="cityscape-base"/, 'One connected glass composition');
assert.match(sceneMarkup, /data-landmark-close/, 'Popup can be dismissed without an outside tap');
assert.match(sceneMarkup, /class="cityscape-fallback"/, 'Base-image failure has a readable fallback');
assert.ok(!/<button class="city-hotspot"[^>]*>\s*<span/.test(sceneMarkup), 'No numbered landmark badges');
assert.ok(!sceneMarkup.includes('data-artwork="riverfront"'), 'Riverfront remains connected scenery');
assert.equal(new Set([...sceneMarkup.matchAll(/data-landmark="([^"]+)"/g)].map(match => match[1])).size, 8);
const regions = [...sceneMarkup.matchAll(/<div\b[^>]*data-artwork="([^"]+)"[^>]*>([\s\S]*?)<\/div>/g)];
assert.equal(regions.length, 8, 'Eight reveal regions');
for (const [, id, markup] of regions) {
  assert.match(markup, /class="landmark-color"[^>]*\sdata-color-src="[^"]+"/, `${id} has desktop color artwork`);
  assert.match(markup, /<source[^>]*data-color-src="[^"]+"/, `${id} has portrait color artwork`);
}
for (const [, path] of sceneMarkup.matchAll(/\s(?:src|srcset|data-color-src)="([^"]+)"/g)) {
  assert.ok(existsSync(path), `Scene asset exists: ${path}`);
}
assert.match(readFileSync('designs.css', 'utf8'), /prefers-reduced-motion/, 'Reduced-motion styling remains present');
console.log('PASS: eight accessible controls, connected responsive artwork, dismiss control, fallback and local assets');

assert.match(sceneMarkup, /data-landmark-announcement[^>]*aria-live="polite"/, 'Announcement region is always mounted');
assert.ok(sceneMarkup.indexOf('class="liquid-hero-copy"') < sceneMarkup.indexOf('class="cityscape-hotspots"'), 'Headline link precedes landmarks in tab order');
assert.ok(sceneMarkup.indexOf('class="liquid-hero-copy"') < sceneMarkup.indexOf('class="cityscape-viewport"'), 'Static DOM puts copy before artwork, with desktop overlap handled by CSS');
assert.match(html, /data-cityscape data-expanded-copy="true"/, 'Static HTML gives the heading its own space before enhancement');
const masterSources = [...new Set([...sceneMarkup.matchAll(/assets\/designs\/liquid-city-[^"\s]+\.webp/g)].map(match => match[0]))];
assert.equal(masterSources.length, 2, 'Two registered masters serve both material states without extra overlay downloads');
for (const path of masterSources) assert.ok(statSync(path).size < (path.includes('portrait') ? 800000 : 1500000), 'Hero image meets layout budget');
