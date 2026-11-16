// One active landmark; ownership prevents stale exits from dismissing newer input.
export function landmarkState(state, event) {
  if (event.type === 'clear') return {activeLandmark: null, owner: null};
  if (event.type === 'leave') return state.owner === event.owner && state.activeLandmark === event.id
    ? {activeLandmark: null, owner: null} : state;
  if (event.type === 'tap' && state.owner === 'press' && state.activeLandmark === event.id)
    return {activeLandmark: null, owner: null};
  if (event.type === 'activate' || event.type === 'tap') return {activeLandmark: event.id, owner: event.owner};
  return state;
}

// Coordinates are viewport-relative, like getBoundingClientRect(). Null uses the reserved slot.
export function popupPosition(anchor, bounds, size, obstacles = []) {
  const gap = 14;
  const candidates = [
    ['above', anchor.left + (anchor.width - size.width) / 2, anchor.top - size.height - gap],
    ['right', anchor.right + gap, anchor.top + (anchor.height - size.height) / 2],
    ['left', anchor.left - size.width - gap, anchor.top + (anchor.height - size.height) / 2],
    ['below', anchor.left + (anchor.width - size.width) / 2, anchor.bottom + gap]
  ];
  for (const [placement, left, top] of candidates) {
    const right = left + size.width, bottom = top + size.height;
    if (left < bounds.left || right > bounds.right || top < bounds.top || bottom > bounds.bottom) continue;
    if ([anchor, ...obstacles].some(rect => left < rect.right && right > rect.left && top < rect.bottom && bottom > rect.top)) continue;
    return {placement, left, top};
  }
  return null;
}

export function initCityscape(scene) {
  const controls = [...scene.querySelectorAll('[data-landmark]')];
  const artwork = new Map([...scene.querySelectorAll('[data-artwork]')].map(node => [node.dataset.artwork, node]));
  const landmarks = new Map(controls.map(button => [button.dataset.landmark, button]));
  const panel = scene.querySelector('.landmark-information');
  const close = panel.querySelector('[data-landmark-close]');
  const title = scene.querySelector('[data-landmark-title]');
  const story = scene.querySelector('[data-landmark-story]');
  const announcement = scene.querySelector('[data-landmark-announcement]');
  const base = scene.querySelector('.cityscape-base');
  const fallback = scene.querySelector('.cityscape-fallback');
  const portrait = window.matchMedia('(max-width: 767px)');
  const initial = {title: title.textContent, story: story.textContent};
  let state = {activeLandmark: null, owner: null};
  let leaveTimer, frame;
  let pointerDown = false, restoringFocus = false;
  let lastTouch = -Infinity;
  let pointerType = 'mouse';
  let nearScene = false;

  function positionPanel() {
    const button = landmarks.get(state.activeLandmark);
    if (!button) return;
    panel.dataset.placement = 'slot';
    panel.style.position = panel.style.left = panel.style.top = panel.style.width = '';
    if (portrait.matches) return;
    // Measure at the floating width before collision checks (the slot can be wider).
    panel.style.width = '280px';
    const rect = scene.getBoundingClientRect();
    const size = panel.getBoundingClientRect();
    const obstacles = ['.liquid-hero-copy', '.liquid-nav'].map(selector => document.querySelector(selector))
      .filter(Boolean).map(node => node.getBoundingClientRect());
    const position = popupPosition(button.getBoundingClientRect(), {
      left: Math.max(16, rect.left), right: Math.min(window.innerWidth - 16, rect.right),
      top: Math.max(16, rect.top), bottom: Math.min(window.innerHeight - 16, rect.bottom)
    }, size, obstacles);
    if (!position) { panel.style.width = ''; return; }
    panel.dataset.placement = position.placement;
    panel.style.position = 'absolute';
    panel.style.left = `${position.left - rect.left}px`;
    panel.style.top = `${position.top - rect.top}px`;
  }
  function schedulePosition() {
    if (frame || !state.activeLandmark) return;
    frame = requestAnimationFrame(() => { frame = null; positionPanel(); });
  }
  const stage = scene.querySelector('.cityscape-stage');
  const identity = scene.querySelector('.liquid-hero-copy');
  const cityWords = identity?.querySelector('.city-words');
  function fitIdentity() {
    if (!stage || !cityWords) return;
    const bounds = stage.getBoundingClientRect();
    const space = identity.offsetHeight;
    const expanded = portrait.matches || cityWords.getBoundingClientRect().width > bounds.width * .36 + 2 || space > bounds.height * .42;
    scene.dataset.expandedCopy = String(expanded);
    schedulePosition();
  }
  if (typeof ResizeObserver !== 'undefined' && stage && cityWords) {
    const layout = new ResizeObserver(fitIdentity);
    [scene, stage, identity, cityWords].forEach(target => layout.observe(target));
  }
  fitIdentity();
  function send(event) {
    clearTimeout(leaveTimer);
    state = landmarkState(state, event);
    scene.dataset.activeLandmark = state.activeLandmark || '';
    controls.forEach(button => {
      const active = button.dataset.landmark === state.activeLandmark;
      button.setAttribute('aria-expanded', String(active));
      artwork.get(button.dataset.landmark).dataset.active = String(active);
    });
    const button = landmarks.get(state.activeLandmark);
    panel.hidden = !button;
    // Image readiness and ownership changes must not repeat live-region announcements.
    const nextTitle = button?.dataset.title || initial.title;
    if (title.textContent !== nextTitle) {
      title.textContent = nextTitle;
      story.textContent = button?.dataset.description || initial.story;
      // This live region stays mounted when the visual popup is hidden.
      announcement.textContent = button ? `${nextTitle}. ${button.dataset.description}` : ''; 
    }
    positionPanel();
  }
  function dismiss(returnFocus = false) {
    const source = landmarks.get(state.activeLandmark);
    send({type: 'clear'});
    if (returnFocus && source) {
      restoringFocus = true;
      source.focus({preventScroll: true});
      restoringFocus = false;
    }
  }
  function leave(id) {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => send({type: 'leave', id, owner: 'pointer'}), 350);
  }
  const realHover = event => event.pointerType === 'mouse' && event.buttons === 0 && Date.now() - lastTouch > 800;
  controls.forEach(button => {
    const id = button.dataset.landmark;
    button.addEventListener('pointerenter', event => {
      if (realHover(event)) send({type: 'activate', id, owner: 'pointer'});
    });
    button.addEventListener('pointerleave', event => {
      if (realHover(event) && state.owner === 'pointer' && state.activeLandmark === id) leave(id);
    });
    button.addEventListener('focus', () => {
      if (!pointerDown && !restoringFocus) send({type: 'activate', id, owner: 'focus'});
    });
    button.addEventListener('click', event => {
      const owner = event.detail === 0 ? 'focus' : pointerType === 'mouse' ? 'pointer' : 'press';
      send({type: owner === 'press' ? 'tap' : 'activate', id, owner});
    });
  });
  close.addEventListener('click', () => dismiss(true));
  panel.addEventListener('pointerenter', event => { if (realHover(event)) clearTimeout(leaveTimer); });
  panel.addEventListener('pointerleave', event => { if (realHover(event) && state.owner === 'pointer') leave(state.activeLandmark); });
  scene.addEventListener('focusout', event => {
    if (!controls.some(button => button.contains(event.relatedTarget)) && !panel.contains(event.relatedTarget)) dismiss();
  });
  document.addEventListener('pointerdown', event => {
    pointerDown = true;
    pointerType = event.pointerType;
    if (event.pointerType !== 'mouse') lastTouch = Date.now();
    if (!controls.some(button => button.contains(event.target)) && !panel.contains(event.target)) dismiss();
  });
  document.addEventListener('pointerup', () => { pointerDown = false; });
  document.addEventListener('pointercancel', () => { pointerDown = false; });
  document.addEventListener('keydown', event => {
    pointerDown = false;
    if (event.key === 'Escape' && state.activeLandmark !== null) {
      dismiss(panel.contains(document.activeElement)); // Stationary hover cannot reopen it.
    }
  });
  window.addEventListener('resize', () => {
    if (state.owner === 'pointer') dismiss();
    else schedulePosition();
  });
  window.addEventListener('scroll', schedulePosition, {passive: true});
  window.visualViewport?.addEventListener('resize', schedulePosition);
  document.fonts?.ready.then(schedulePosition);
  const world = scene.closest('.world');
  if (world) new MutationObserver(() => { if (world.hidden) dismiss(); }).observe(world, {attributes: true, attributeFilter: ['hidden']});

  // Optional sources remain inert: only the current composition downloads, independently per region.
  function colorPath(piece) {
    const source = [...piece.querySelectorAll('source[data-color-src]')].find(node => window.matchMedia(node.media).matches);
    return source?.dataset.colorSrc || piece.querySelector('.landmark-color').dataset.colorSrc;
  }
  function loadColors() {
    if (!nearScene || !base.complete || !base.naturalWidth) return;
    artwork.forEach(piece => {
      const color = piece.querySelector('.landmark-color');
      const path = colorPath(piece);
      if (color.dataset.requestedSrc === path) {
        const ready = color.dataset.loadedSrc === path;
        piece.dataset.colorReady = String(ready);
        color.hidden = !ready;
        return;
      }
      color.dataset.requestedSrc = path;
      color.hidden = true;
      piece.dataset.colorReady = 'false';
      color.src = path;
      color.decode().then(() => {
        if (color.dataset.requestedSrc !== path || colorPath(piece) !== path) return;
        color.dataset.loadedSrc = path;
        piece.dataset.colorReady = String(Boolean(base.naturalWidth));
        color.hidden = !base.naturalWidth;
      }).catch(() => {
        if (color.dataset.requestedSrc !== path || colorPath(piece) !== path) return;
        piece.dataset.colorReady = 'false';
        color.hidden = true; // A failed optional layer never removes the story or glass city.
      });
    });
  }
  function baseStatus() {
    const failed = base.complete && !base.naturalWidth;
    scene.dataset.baseFailed = String(failed);
    fallback.hidden = !failed;
    base.hidden = failed;
    if (failed) artwork.forEach(piece => { piece.dataset.colorReady = 'false'; piece.querySelector('.landmark-color').hidden = true; });
    else loadColors();
  }
  base.addEventListener('load', baseStatus);
  base.addEventListener('error', baseStatus);
  portrait.addEventListener('change', () => {
    // Invalidate the old reveal before the browser resolves the new responsive base.
    artwork.forEach(piece => { piece.dataset.colorReady = 'false'; piece.querySelector('.landmark-color').hidden = true; });
    loadColors();
    schedulePosition();
  });
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { nearScene = true; loader.disconnect(); loadColors(); }
    }, {rootMargin: '250px'});
    loader.observe(scene);
    const visibility = new IntersectionObserver(entries => {
      if (entries.every(entry => !entry.isIntersecting)) dismiss();
    });
    visibility.observe(scene);
  } else { nearScene = true; }
  baseStatus();
  send({type: 'clear'});
  return {send, getState: () => state};
}
if (typeof document !== 'undefined') {
  const scene = document.querySelector('[data-cityscape]');
  if (scene) initCityscape(scene);
}
