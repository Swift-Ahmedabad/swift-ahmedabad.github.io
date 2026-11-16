// The DOM remains the source of copy, line wrapping, and accessible text.
export function measureHeadline(heading, stage, ratio = 1) {
  const bounds = stage.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(bounds.width * ratio));
  canvas.height = Math.max(1, Math.ceil(bounds.height * ratio));
  const context = canvas.getContext('2d');
  if (!context || !('letterSpacing' in context)) throw new Error('Canvas text spacing unavailable');
  context.scale(ratio, ratio);
  const mirror = document.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');
  mirror.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;white-space:pre;width:max-content;margin:0;padding:0;border:0';
  const sample = document.createElement('span');
  const probe = document.createElement('span');
  probe.style.cssText = 'display:inline-block;width:0;height:0;padding:0;margin:0;vertical-align:baseline';
  mirror.append(sample, probe);
  document.body.append(mirror);
  const lines = [];
  let error = 0;
  try {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const style = getComputedStyle(node.parentElement);
      // ponytail: this fixed Latin headline has plain text and one styled span.
      // Rich/bidirectional text needs a new typography proof, not guessed shaping.
      if (style.direction !== 'ltr' || style.textTransform !== 'none') throw new Error('Unsupported headline typography');
      const groups = [];
      const range = document.createRange();
      for (let offset = 0; offset < node.length; offset++) {
        range.setStart(node, offset);
        range.setEnd(node, offset + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width) continue;
        let group = groups.at(-1);
        if (!group || Math.abs(group.top - rect.top) > 1) {
          group = {start: offset, end: offset + 1, top: rect.top};
          groups.push(group);
        } else group.end = offset + 1;
      }
      for (const group of groups) {
        const text = node.textContent.slice(group.start, group.end).trimEnd();
        if (!text) continue;
        range.setStart(node, group.start);
        range.setEnd(node, group.start + text.length);
        const rect = range.getBoundingClientRect();
        for (const key of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch',
          'fontVariant', 'fontKerning', 'fontFeatureSettings', 'fontVariationSettings',
          'fontSynthesis', 'lineHeight', 'letterSpacing', 'wordSpacing']) mirror.style[key] = style[key];
        sample.textContent = text;
        const sampleRect = sample.getBoundingClientRect();
        const baseline = probe.getBoundingClientRect().top - sampleRect.top;
        context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        context.fontKerning = style.fontKerning;
        context.fontStretch = style.fontStretch;
        context.letterSpacing = style.letterSpacing;
        context.wordSpacing = style.wordSpacing;
        context.textBaseline = 'alphabetic';
        context.fillStyle = style.color;
        const widthError = Math.abs(context.measureText(text).width - rect.width);
        error = Math.max(error, widthError, Math.abs(sampleRect.width - rect.width));
        const line = {text, x: rect.left - bounds.left, y: rect.top - bounds.top,
          width: rect.width, height: rect.height, baseline, fontSize: parseFloat(style.fontSize), color: style.color};
        lines.push(line);
        context.fillText(text, line.x, line.y + baseline);
      }
    }
  } finally {
    mirror.remove();
  }
  if (!lines.length) throw new Error('Empty headline');
  return {canvas, lines, error, width: bounds.width, height: bounds.height};
}

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const extent = diameter => diameter * 0.6 + 8;

export function glassPlacement(width, height, lines, mobile, decorative = false) {
  if (!(width > 0 && height > 0)) return null;
  const maximum = Math.min(mobile ? 128 : 192, width * 0.45, (height - 16) / 1.2);
  if (maximum < 96) return null;
  for (let diameter = maximum; ; diameter = Math.max(96, diameter - 8)) {
    const edge = extent(diameter), radius = diameter * 0.54;
    for (const x of [width - edge, edge]) {
      const y = edge;
      const overlap = lines.some(line => {
        // Conservative square around optical silhouette; shadow is included in stage bounds.
        const area = Math.max(0, Math.min(x + radius, line.x + line.width) - Math.max(x - radius, line.x)) *
          Math.max(0, Math.min(y + radius, line.y + line.height) - Math.max(y - radius, line.y));
        return area > line.width * line.height * (decorative ? 0 : 0.25);
      });
      if (!overlap) return {x, y, diameter, edge};
    }
    if (diameter === 96) break;
  }
  return null;
}

export function glassMode({width, fine, reduced, contrast, printing, selection, slow}) {
  if (contrast || printing || selection) return 'plain';
  return width >= 768 && fine && !reduced && !slow ? 'interactive' : 'static';
}

export function glassTarget(point, placement, width, height) {
  return {x: clamp(point.x, placement.edge, width - placement.edge),
    y: clamp(point.y, placement.edge, height - placement.edge)};
}

// One cancellable queue, shared by input, redraws, and finite settling.
export function storyLoop(draw, request = requestAnimationFrame, cancel = cancelAnimationFrame) {
  let frame = null, allowed = false, disposed = false;
  function wake() {
    if (!allowed || disposed || frame !== null) return;
    frame = request(time => {
      frame = null;
      if (allowed && !disposed && draw(time)) wake();
    });
  }
  function pause() {
    allowed = false;
    if (frame !== null) cancel(frame);
    frame = null;
  }
  return {wake, resume() { allowed = true; wake(); }, pause,
    dispose() { pause(); disposed = true; }};
}

/*
Optical field, tetrahedral normals, ray marching, and studio reflection adapted from
React Bits FluidGlass by David Haz, revision 382dc89411ce8446ef2b2ed99e352c44a53a1b54.
https://github.com/DavidHDev/react-bits/blob/382dc89411ce8446ef2b2ed99e352c44a53a1b54/src/content/Components/FluidGlass/FluidGlass.jsx
This site-specific adaptation uses a local opaque optical footprint, bounded text
sampling, and a finite scheduler; no React, media, shape cycling, or idle loop.

MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

## No Warranty
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));
void main(){gl_Position=vec4(corners[gl_VertexID],0.,1.);}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uText;
uniform vec2 uView, uCenter;
uniform vec3 uBackground;
uniform float uRatio, uRadius, uPhase, uRipple, uRefraction, uDispersion, uDisplacement, uTextOn;
out vec4 color;
float field(vec3 p){
  p.z *= 3.2;
  vec3 q=p*1.6;
  float n=sin(q.x+uPhase*1.1)*sin(q.y*1.15-uPhase*.9)*sin(q.z*.95+uPhase*.8);
  n+=.45*sin(q.x*1.6-uPhase*.6+q.z)*sin(q.y*1.9+uPhase*1.2+q.x*.5);
  return (length(p)-.92-(.035+uRipple*.015)*n)*.24;
}
vec3 normalAt(vec3 p){
  vec2 k=vec2(1.,-1.);float e=.002;
  return normalize(k.xyy*field(p+k.xyy*e)+k.yyx*field(p+k.yyx*e)+k.yxy*field(p+k.yxy*e)+k.xxx*field(p+k.xxx*e));
}
vec3 content(vec2 w){
  vec4 text=texture(uText,clamp(w/uView,vec2(0.),vec2(1.)))*uTextOn;
  return text.rgb+uBackground*(1.-text.a);
}
vec3 studio(vec3 d){
  float key=pow(max(dot(d,normalize(vec3(-.5,-.7,1.))),0.),8.);
  float fill=pow(max(dot(d,normalize(vec3(.7,.5,.3))),0.),12.);
  return vec3(.94,.97,1.)*key+vec3(1.,.97,.94)*fill*.35;
}
void main(){
  vec2 w=vec2(gl_FragCoord.x/uRatio,uView.y-gl_FragCoord.y/uRatio);
  vec2 local=(w-uCenter)/uRadius;
  float shadow=(1.-smoothstep(.75,1.12,length(local-vec2(.015,.035))))*.06;
  if(dot(local,local)>1.25){color=vec4(0.,0.,0.,shadow);return;}
  vec3 ro=vec3(local,2.),rd=vec3(0.,0.,-1.);
  float t=0.,d=1.,eps=.35/(uRadius*uRatio);
  vec3 p=ro;
  for(int i=0;i<64;i++){p=ro+rd*t;d=field(p);if(d<eps||t>3.2)break;t+=d*.9;}
  if(d>=eps||t>3.2){color=vec4(0.,0.,0.,shadow);return;}
  vec3 n=normalAt(p);
  float facing=clamp(n.z,0.,1.);
  float cover=smoothstep(0.,.10,facing);
  float ior=1.+uRefraction*.32;
  vec3 inside=refract(rd,n,1./ior),q=p+inside*.02;
  for(int i=0;i<40;i++){float distance=field(q);if(distance>-.002)break;q+=inside*max(-distance*.9,.002);}
  vec3 exitNormal=normalAt(q),direction=refract(inside,-exitNormal,ior);
  if(direction.z>-.1)direction=vec3(0.,0.,-1.);
  vec2 landing=q.xy+direction.xy*((-1.3-q.z)/direction.z);
  vec2 delta=(landing-local)*uRadius;
  float amount=length(delta);
  delta*=min(1.,uDisplacement/max(amount,.001))*smoothstep(.12,.45,facing);
  vec3 transmitted=content(w+delta);
  transmitted.r=content(w+delta*(1.+uDispersion*.08)).r;
  transmitted.b=content(w+delta*(1.-uDispersion*.08)).b;
  // Thin clear material: neutral transmission, opposing edge lights, no studio-box reflection.
  float edge=pow(1.-facing,2.);
  float light=.22+.78*abs(dot(normalize(n.xy+vec2(.0001)),normalize(vec2(-.42,-.55))));
  float rim=(edge*.16+pow(1.-facing,5.)*.55)*light;
  vec3 glass=transmitted*(1.-edge*.025)+vec3(.94,.97,1.)*(.012+rim);
  glass+=studio(reflect(rd,n))*.045*edge;
  // The interior is opaque: original DOM letters cannot show through displaced text.
  color=vec4(clamp(glass,0.,1.)*cover,cover);
}`;

function makeRenderer(canvas) {
  const gl = canvas.getContext('webgl2', {alpha: true, premultipliedAlpha: true, antialias: false,
    depth: false, stencil: false, powerPreference: 'default'});
  if (!gl) throw new Error('WebGL2 unavailable');
  const shaders = [], program = gl.createProgram(), texture = gl.createTexture(), vao = gl.createVertexArray();
  function dispose() {
    if (!gl.isContextLost()) {
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteProgram(program); gl.deleteTexture(texture); gl.deleteVertexArray(vao);
    }
  }
  try {
    if (!program || !texture || !vao) throw new Error('Graphics allocation failed');
    for (const [kind, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]]) {
      const shader = gl.createShader(kind);
      if (!shader) throw new Error('Shader allocation failed');
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const names = ['Text', 'View', 'Center', 'Background', 'Ratio', 'Radius', 'Phase', 'Ripple', 'Refraction', 'Dispersion', 'Displacement', 'TextOn'];
    const uniforms = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, `u${name}`)]));
    gl.useProgram(program); gl.bindVertexArray(vao); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uniforms.Text, 0);
    return {dispose, maximum: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      upload(measured, background, ratio) {
        canvas.width = measured.canvas.width; canvas.height = measured.canvas.height;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, measured.canvas);
        gl.uniform2f(uniforms.View, measured.width, measured.height);
        gl.uniform3fv(uniforms.Background, background);
        gl.uniform1f(uniforms.Ratio, ratio);
        if (gl.getError() !== gl.NO_ERROR) throw new Error('Text texture upload failed');
      },
      draw(point, placement, measured, phase, ripple, mobile, decorative, ratio, validate) {
        gl.disable(gl.SCISSOR_TEST); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.SCISSOR_TEST);
        const edge = placement.edge;
        gl.scissor(Math.max(0, Math.floor((point.x - edge) * ratio)), Math.max(0, Math.floor((measured.height - point.y - edge) * ratio)),
          Math.ceil(edge * 2 * ratio), Math.ceil(edge * 2 * ratio));
        gl.uniform2f(uniforms.Center, point.x, point.y);
        gl.uniform1f(uniforms.Radius, placement.diameter / 2);
        gl.uniform1f(uniforms.Phase, phase); gl.uniform1f(uniforms.Ripple, ripple);
        gl.uniform1f(uniforms.Refraction, mobile ? .25 : .4);
        gl.uniform1f(uniforms.Dispersion, mobile ? .025 : .05);
        gl.uniform1f(uniforms.Displacement, Math.min(...measured.lines.map(line => line.fontSize)) * (mobile ? .045 : .075));
        gl.uniform1f(uniforms.TextOn, decorative ? 0 : 1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (validate && (gl.isContextLost() || gl.getError() !== gl.NO_ERROR)) throw new Error('First glass frame failed');
      }};
  } catch (error) { dispose(); throw error; }
}

function backdrop(stage) {
  // ponytail: only an unfiltered solid ancestor backdrop can be reconstructed.
  // A future gradient/image backdrop needs its own texture and visual proof.
  let color = null;
  for (let node = stage; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.backgroundImage !== 'none' || style.filter !== 'none' || Number(style.opacity) !== 1) return null;
    const rgba = style.backgroundColor.match(/[\d.]+/g)?.map(Number);
    if (!color && rgba && rgba.length >= 3 && (rgba.length === 3 || rgba[3] === 1)) color = rgba.slice(0, 3).map(value => value / 255);
    else if (!color && rgba?.[3] > 0) return null;
  }
  return color;
}

function plainMeasurement(heading, stage, ratio) {
  const bounds = stage.getBoundingClientRect(), canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(bounds.width * ratio));
  canvas.height = Math.max(1, Math.ceil(bounds.height * ratio));
  const range = document.createRange();
  range.selectNodeContents(heading);
  const lines = [...range.getClientRects()].filter(rect => rect.width && rect.height).map(rect => ({
    x: rect.left - bounds.left, y: rect.top - bounds.top, width: rect.width, height: rect.height,
    fontSize: parseFloat(getComputedStyle(heading).fontSize)
  }));
  return {canvas, lines, width: bounds.width, height: bounds.height, error: Infinity};
}

const instances = new WeakMap();
export function initStoryGlass(stage) {
  if (instances.has(stage)) return instances.get(stage);
  const heading = stage.querySelector('h2'), canvas = stage.querySelector('canvas');
  if (!heading || !canvas) return () => {};
  let renderer, measured, placement, background, point, target, ratio = 1, quality = 1.5;
  let disposed = false, prepared = false, near = false, visible = false, dirty = true, failed = false;
  let pageHidden = document.hidden, pageSuspended = false, lost = false, restores = 0, generation = 0;
  let down = false, printing = false, slow = false, decorative = false, inside = false;
  let phase = 1.7, ripple = 0, last = 0, moved = 0, intervals = [], currentMode = 'static';
  const queries = {
    fine: matchMedia('(hover:hover) and (pointer:fine)'),
    reduced: matchMedia('(prefers-reduced-motion:reduce)'),
    forced: matchMedia('(forced-colors:active)'),
    contrast: matchMedia('(prefers-contrast:more)'),
    transparency: matchMedia('(prefers-reduced-transparency:reduce)')
  };
  const listeners = [];
  function listen(node, type, callback, options) {
    node.addEventListener(type, callback, options);
    listeners.push(() => node.removeEventListener(type, callback, options));
  }
  function state(value) { stage.dataset.glassState = value; }
  function selected() {
    const selection = document.getSelection();
    return down || Boolean(selection && !selection.isCollapsed && selection.containsNode(heading, true));
  }
  function mode() {
    return glassMode({width: innerWidth, fine: queries.fine.matches, reduced: queries.reduced.matches,
      contrast: queries.forced.matches || queries.contrast.matches || queries.transparency.matches,
      printing, selection: selected(), slow});
  }
  function fail() {
    failed = true; canvas.hidden = true; loop.pause(); renderer?.dispose(); renderer = null;
    state('fallback'); stage.dataset.glassMode = 'plain';
  }
  function eligible() { return !disposed && !failed && !lost && !pageHidden && !pageSuspended && mode() !== 'plain'; }
  function sync() {
    if (disposed) return;
    const nextMode = mode();
    if (currentMode !== nextMode) { currentMode = nextMode; inside = false; ripple = 0; last = 0; if (placement) point = target = {...placement}; }
    if (!eligible() || !visible || !prepared) {
      loop.pause(); last = 0; canvas.hidden = true;
      if (!failed) state(lost ? 'fallback' : prepared ? 'suspended' : 'dormant');
      if (near && eligible() && !prepared) prepare();
      return;
    }
    loop.resume();
  }
  function invalidate() {
    if (disposed) return;
    dirty = true; canvas.hidden = true; last = 0; inside = false; sync();
  }
  function prepare() {
    if (prepared || disposed || stage.dataset.glassState === 'initializing') return;
    state('initializing');
    const ticket = ++generation;
    Promise.resolve(document.fonts?.ready).then(() => {
      if (disposed || ticket !== generation || lost) return;
      prepared = true; dirty = true; sync();
    }).catch(() => { if (!disposed && ticket === generation) fail(); });
  }
  function draw(time) {
    if (!eligible() || !visible) return false;
    try {
      let validate = false;
      if (dirty) {
        renderer ||= makeRenderer(canvas);
        const rect = stage.getBoundingClientRect();
        ratio = Math.min(devicePixelRatio || 1, quality, Math.sqrt(1e6 / Math.max(1, rect.width * rect.height)),
          (renderer.maximum - 1) / Math.max(1, rect.width, rect.height));
        try { measured = measureHeadline(heading, stage, ratio); }
        catch { measured = plainMeasurement(heading, stage, ratio); }
        background = backdrop(stage);
        // ponytail: WebKit's measured widths match, but the visual proof has a raster seam.
        // Keep its glass clear of text until a new WebKit typography proof passes.
        const webkit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome\//.test(navigator.userAgent);
        decorative = webkit || measured.error > 1 || !background;
        // With an unknown backdrop there is no faithful opaque optical patch.
        if (!background) { fail(); return false; }
        placement = glassPlacement(measured.width, measured.height, measured.lines, innerWidth < 768, decorative);
        if (!placement && !decorative) {
          decorative = true;
          placement = glassPlacement(measured.width, measured.height, measured.lines, innerWidth < 768, true);
        }
        dirty = false;
        if (!placement) { canvas.hidden = true; stage.dataset.glassMode = 'plain'; state('fallback'); return false; }
        point = target = {...placement}; last = 0; ripple = 0;
        renderer.upload(measured, background, ratio); validate = true;
        stage.dataset.glassMode = decorative ? 'decorative' : 'refractive';
      }
      if (!placement) return false;
      const elapsed = last ? Math.min(time - last, 50) : 16.67;
      if (last && currentMode === 'interactive' && inside) {
        intervals.push(time - last);
        if (intervals.length === 30) {
          const p90 = [...intervals].sort((a, b) => a - b)[26]; intervals = [];
          if (p90 > 24) {
            if (quality > 1) quality = 1;
            else slow = true;
            invalidate(); return false;
          }
        }
      }
      last = time;
      const moving = currentMode === 'interactive' && !decorative && time - moved < 1200;
      const alpha = moving ? 1 - Math.exp(-elapsed / 120) : 1;
      point.x += (target.x - point.x) * alpha; point.y += (target.y - point.y) * alpha;
      ripple = moving ? Math.max(0, 1 - (time - moved) / 400) * .15 : 0;
      if (ripple) phase += elapsed / 1000;
      const unsettled = moving && (Math.hypot(target.x - point.x, target.y - point.y) > .25 || ripple > 0);
      if (!unsettled) { point = {...target}; ripple = 0; last = 0; }
      renderer.draw(point, placement, measured, phase, ripple, innerWidth < 768, decorative, ratio, validate);
      canvas.hidden = false; state(currentMode === 'interactive' ? 'ready' : 'static');
      return unsettled;
    } catch { fail(); return false; }
  }
  const loop = storyLoop(draw);
  function move(event) {
    if (event.pointerType !== 'mouse' || currentMode !== 'interactive' || !eligible() || !placement || decorative || !visible || dirty) return;
    const rect = stage.getBoundingClientRect();
    inside = true; target = glassTarget({x: event.clientX - rect.left, y: event.clientY - rect.top}, placement, measured.width, measured.height);
    moved = performance.now(); loop.resume();
  }
  function leave() {
    inside = false;
    if (!placement || currentMode !== 'interactive') return;
    target = {...placement}; moved = performance.now(); sync();
  }
  listen(stage, 'pointermove', move, {passive: true});
  listen(stage, 'pointerleave', leave, {passive: true});
  listen(stage, 'pointerdown', () => { down = true; sync(); }, {passive: true});
  listen(window, 'pointerup', () => { if (down) { down = false; sync(); } }, {passive: true});
  listen(window, 'pointercancel', () => { down = false; leave(); sync(); }, {passive: true});
  listen(document, 'selectionchange', sync);
  listen(document, 'visibilitychange', () => { pageHidden = document.hidden; sync(); });
  listen(window, 'blur', () => { down = false; leave(); });
  listen(window, 'resize', invalidate, {passive: true});
  if (window.visualViewport) listen(window.visualViewport, 'resize', invalidate, {passive: true});
  if (document.fonts) listen(document.fonts, 'loadingdone', invalidate);
  Object.values(queries).forEach(query => listen(query, 'change', invalidate));
  listen(window, 'beforeprint', () => { printing = true; sync(); });
  listen(window, 'afterprint', () => { printing = false; invalidate(); });
  listen(window, 'pagehide', event => { if (event.persisted) { pageSuspended = true; sync(); } else dispose(); });
  listen(window, 'pageshow', () => { pageSuspended = false; invalidate(); });
  listen(canvas, 'webglcontextlost', event => {
    event.preventDefault(); lost = true; generation++; prepared = false; canvas.hidden = true; loop.pause();
    renderer?.dispose(); renderer = null; state('fallback');
  });
  listen(canvas, 'webglcontextrestored', () => {
    if (disposed || failed) return;
    if (restores++ >= 1) { fail(); return; }
    lost = false; dirty = true; prepare();
  });
  const resize = new ResizeObserver(invalidate);
  resize.observe(stage); resize.observe(heading);
  const proximity = new IntersectionObserver(entries => {
    near = entries.some(entry => entry.isIntersecting);
    if (near && eligible() && !prepared) prepare();
  }, {rootMargin: '200px'});
  const intersection = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting); sync();
  });
  proximity.observe(stage); intersection.observe(stage);
  function dispose() {
    if (disposed) return;
    disposed = true; generation++; loop.dispose(); canvas.hidden = true;
    listeners.forEach(remove => remove()); resize.disconnect(); proximity.disconnect(); intersection.disconnect();
    renderer?.dispose(); renderer = null; instances.delete(stage); state('disposed');
  }
  instances.set(stage, dispose); state('dormant');
  return dispose;
}

if (typeof document !== 'undefined' && typeof ResizeObserver !== 'undefined' && typeof IntersectionObserver !== 'undefined') {
  document.querySelectorAll('[data-story-glass]').forEach(initStoryGlass);
}
