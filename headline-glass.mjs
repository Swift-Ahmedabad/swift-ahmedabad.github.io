/* Optical surface/ray tracing adapted from React Bits FluidGlass, David Haz (2026).
 * Reference: https://reactbits.dev/components/fluid-glass?size=320&shape=blob
 * Source: https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/FluidGlass
 * Native HTML stays sharp outside the lens. Its interior uses a masked WebGL render.
 *
 * MIT + Commons Clause License Condition v1.0
 * Copyright (c) 2026 David Haz
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software as part of an
 * application, website, or product, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * Commons Clause Restriction
 * You may use this Software, including for any commercial purpose, so long as you
 * do not sell, sublicense, or redistribute the components themselves—whether
 * alone, in a bundle, or as a ported version.
 * The same restriction covers the React Bits tools (Background Studio, Texture
 * Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the
 * sounds in the sound library. You may not sell, sublicense, or redistribute the
 * tools or the sounds themselves, or offer the tools or a substantially similar
 * copy of them as a hosted service—whether alone, in a bundle, or as a ported version.
 * What you make with the tools is yours to use. You can use exported code, images,
 * videos, and audio files in any personal or commercial application, website, or
 * product, including paid ones. You may not sell or redistribute the exports on
 * their own, either individually or as the product itself, such as a sound,
 * texture, background, or template pack.
 * No Warranty
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const blobVertex = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));
void main(){gl_Position=vec4(corners[gl_VertexID],0.,1.);}`;
const blobFragment = `#version 300 es
precision highp float;
uniform vec2 uView;
uniform vec2 uHeading;
uniform vec2 uOffset;
uniform float uRatio;
uniform float uFocal;
uniform vec3 uCenter;
uniform mat3 uInverse;
uniform float uScale;
uniform float uBound;
uniform float uTime;
uniform float uIor;
uniform float uDispersion;
uniform float uReflection;
uniform float uPresence;
uniform sampler2D uText;
uniform float uPass;
out vec4 fragColor;

float shapeA(vec3 p) {
    vec3 q = p * 1.6;
    float t = uTime;
    float n = sin(q.x + t * 1.1) * sin(q.y * 1.15 - t * 0.9) * sin(q.z * 0.95 + t * 0.8);
    n += 0.45 * sin(q.x * 1.6 - t * 0.6 + q.z) * sin(q.y * 1.9 + t * 1.2 + q.x * 0.5);
    return (length(p) - 0.92 - 0.085 * n) * 0.78;
  }
float field(vec3 p) {
  float d = shapeA(p);

  return d;
}

float map(vec3 w) {
  return field(uInverse * (w - uCenter)) * uScale;
}

vec3 normalAt(vec3 w) {
  float e = 0.35;
  vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(w + k.xyy * e) +
    k.yyx * map(w + k.yyx * e) +
    k.yxy * map(w + k.yxy * e) +
    k.xxx * map(w + k.xxx * e)
  );
}

vec4 content(vec2 w,vec2 gx,vec2 gy){
  vec2 uv=(vec2(w.x,uView.y-w.y)+uOffset)/uHeading;
  if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))return vec4(0.);
  return textureGrad(uText,uv,vec2(gx.x,-gx.y)/uHeading,vec2(gy.x,-gy.y)/uHeading);
}

vec3 studio(vec3 d) {
  vec2 a = vec2(atan(d.x, d.z), d.y);
  float key = smoothstep(0.42, 0.22, abs(a.x + 0.62)) * smoothstep(0.3, 0.12, abs(a.y - 0.5));
  float strip = smoothstep(0.12, 0.05, abs(a.x - 0.95)) * smoothstep(0.8, 0.35, abs(a.y - 0.05));
  float dome = smoothstep(0.0, 1.0, d.z) * 0.04;
  return vec3(18.0) * key + vec3(8.0) * strip + vec3(dome);
}

vec4 light(vec3 d, float weight) {
  vec3 c = studio(d) * weight;
  float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
  return vec4(min(c, vec3(a)), a);
}

vec2 landing(vec3 o, vec3 d, vec2 fallback) {
  if (d.z > -0.0005) return fallback;
  return o.xy + d.xy * (-o.z / d.z);
}

struct Trace {
  float mode;
  float cover;
  vec3 p;
  vec3 n;
  vec3 q;
  vec3 inside;
  vec3 exitNormal;
  vec3 exitDir;
  float escaped;
  float travel;
  float bounces;
};

Trace traceSurface(vec3 ro, vec3 rd, float eps, float pixel) {
  Trace tr;
  tr.mode = 0.0;
  tr.cover = 0.0;
  tr.p = vec3(0.0);
  tr.n = vec3(0.0, 0.0, 1.0);
  tr.q = vec3(0.0);
  tr.inside = vec3(0.0, 0.0, -1.0);
  tr.exitNormal = vec3(0.0, 0.0, 1.0);
  tr.exitDir = vec3(0.0, 0.0, -1.0);
  tr.escaped = 0.0;
  tr.travel = 0.0;
  tr.bounces = 0.0;
  vec3 oc = ro - uCenter;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - uBound * uBound;
  float disc = b * b - c;
  if (disc <= 0.0 || uPresence <= 0.0) return tr;
  float sq = sqrt(disc);
  float t = max(-b - sq, 0.0);
  float tEnd = -b + sq;
  float closest = 1e5;
  float closestT = t;
  bool hit = false;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    if (d < closest) {
      closest = d;
      closestT = t;
    }
    if (d < eps) {
      hit = true;
      break;
    }
    t += d * 0.9;
    if (t > tEnd) break;
  }
  if (!hit && closest < pixel * 0.35) {
    hit = true;
    t = closestT;
  }
  if (!hit) {
    tr.cover = clamp(1.0 - closest / (pixel * 1.2), 0.0, 1.0) * uPresence;
    if (tr.cover > 0.0) {
      tr.mode = 1.0;
      tr.p = ro + rd * closestT;
      tr.n = normalAt(tr.p);
    }
    return tr;
  }
  tr.mode = 2.0;
  tr.p = ro + rd * t;
  tr.n = normalAt(tr.p);
  return tr;
}

void traceInterior(inout Trace tr, vec3 rd, float eps) {
  vec3 inside = refract(rd, tr.n, 1.0 / uIor);
  vec3 q = tr.p + inside * eps * 4.0;
  vec3 exitDir = inside;
  bool escaped = false;
  for (int bounce = 0; bounce < 3; bounce++) {
    for (int i = 0; i < 64; i++) {
      float d = map(q);
      if (d > -eps) break;
      float stepLength = max(-d * 0.9, eps);
      q += inside * stepLength;
      tr.travel += stepLength;
    }
    vec3 n2 = normalAt(q);
    tr.exitNormal = n2;
    vec3 out1 = refract(inside, -n2, uIor);
    if (dot(out1, out1) > 0.0) {
      exitDir = out1;
      escaped = true;
      break;
    }
    inside = reflect(inside, -n2);
    q += inside * eps * 4.0;
    tr.bounces += 1.0;
  }
  if (!escaped) exitDir = inside;
  if (exitDir.z > -0.2) exitDir = normalize(vec3(exitDir.xy, -0.2 - abs(exitDir.z)));
  tr.q = q;
  tr.inside = inside;
  tr.exitDir = exitDir;
  tr.escaped = escaped ? 1.0 : 0.0;
}

float bandOf(float cosi, float scatter) {
  return max(smoothstep(0.42, 0.12, cosi), smoothstep(0.06, 0.24, scatter));
}

vec4 shadeTrace(Trace tr, vec3 rd, vec4 background, vec4 tone, vec2 w, vec2 tx, vec2 ty, vec2 rx, vec2 ry) {
  if (tr.mode < 0.5) return background;
  vec3 mirrorDir = reflect(rd, tr.n);
  if (tr.mode < 1.5) {
    vec4 edgeTone = tone * uReflection * 0.8 + light(mirrorDir, uReflection) * 0.5;
    return mix(background, edgeTone + background * (1.0 - edgeTone.a), tr.cover * 0.7);
  }
  float cosi = clamp(-dot(rd, tr.n), 0.0, 1.0);
  float f0 = pow((uIor - 1.0) / (uIor + 1.0), 2.0);
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - cosi, 5.0);
  float band = bandOf(cosi, (length(tx) + length(ty)) / max(uBound, 1.0));

  vec4 mirror = tone * uReflection;
  vec4 transmitted = tone;
  if (band < 1.0) {
    mirror = mirrorDir.z < -0.0005 ? content(landing(tr.p, mirrorDir, w), rx, ry) * uReflection : light(mirrorDir, uReflection);
    vec2 hitT = landing(tr.q, tr.exitDir, w);
    vec4 green = content(hitT, tx, ty);
    vec4 red = green;
    vec4 blue = green;
    if (tr.escaped > 0.5 && uDispersion > 0.0) {
      vec3 spread = vec3(-1.0, 0.0, 1.0) * uDispersion * 0.06;
      vec3 dirR = refract(tr.inside, -tr.exitNormal, uIor + spread.x);
      vec3 dirB = refract(tr.inside, -tr.exitNormal, uIor + spread.z);
      if (dot(dirR, dirR) > 0.0 && dirR.z < -0.2) red = content(landing(tr.q, dirR, hitT), tx, ty);
      if (dot(dirB, dirB) > 0.0 && dirB.z < -0.2) blue = content(landing(tr.q, dirB, hitT), tx, ty);
    }
    transmitted = mix(vec4(red.r, green.g, blue.b, green.a), tone, band);
    mirror = mix(mirror, tone * uReflection, band);
  }

  vec4 reflected = mirrorDir.z < -0.0005 ? mirror * fresnel : light(mirrorDir, uReflection * fresnel);
  vec4 glass = reflected + transmitted * (1.0 - reflected.a);
  float edge = 1.0 - smoothstep(0.04, 0.3, cosi);
  glass = mix(glass, mirror + background * (1.0 - mirror.a), edge);
  vec2 facing = normalize(vec2(-0.42, 0.55));
  float rimLight = pow(1.0 - cosi, 3.0) * (0.25 + 0.75 * abs(dot(normalize(tr.n.xy + 1e-5), facing))) * 0.55 * uReflection;
  rimLight *= smoothstep(0.0, 0.08, cosi);
  glass = vec4(rimLight) + glass * (1.0 - rimLight);
  return mix(background, glass, uPresence);
}

void main() {
  vec2 w = gl_FragCoord.xy / uRatio;
  vec3 camera = vec3(uView * 0.5, uFocal);
  vec3 ro = camera;
  vec3 rd = normalize(vec3(w, 0.0) - camera);
  float pixel = 1.0 / uRatio;
  float eps = 0.25 * pixel;

  Trace tr = traceSurface(ro, rd, eps, pixel);
  if(uPass>1.5){float cover=tr.mode>1.5?1.:tr.cover;fragColor=vec4(vec3(cover),1.);return;}
  if (tr.mode > 1.5) traceInterior(tr, rd, eps);
  vec2 hitT = tr.mode > 1.5 ? landing(tr.q, tr.exitDir, w) : w;
  vec2 hitR = tr.mode > 0.5 ? landing(tr.p, reflect(rd, tr.n), w) : w;
  vec2 tx = dFdx(hitT);
  vec2 ty = dFdy(hitT);
  vec2 rx = dFdx(hitR);
  vec2 ry = dFdy(hitR);
  vec2 wx = dFdx(w);
  vec2 wy = dFdy(w);

  vec4 background = content(w, wx, wy);
  vec4 tone = tr.mode > 0.5 ? content(uCenter.xy, vec2(uBound * 1.4, 0.0), vec2(0.0, uBound * 1.4)) : vec4(0.0);
  vec4 color = shadeTrace(tr, rd, background, tone, w, tx, ty, rx, ry);

  float rim = tr.mode > 1.5 ? 1.0 - smoothstep(0.3, 0.55, clamp(-dot(rd, tr.n), 0.0, 1.0)) : tr.mode;
  if (rim > 0.0) {
    vec2 offsets[3] = vec2[3](vec2(0.33, 0.33), vec2(-0.33, 0.25), vec2(0.25, -0.33));
    float scatter = (length(tx) + length(ty)) / max(uBound, 1.0);
    for (int k = 0; k < 3; k++) {
      vec2 sub = w + offsets[k] * pixel;
      vec3 subDir = normalize(vec3(sub, 0.0) - camera);
      Trace st = traceSurface(ro, subDir, eps, pixel);
      if (st.mode > 1.5 && bandOf(clamp(-dot(subDir, st.n), 0.0, 1.0), scatter) < 1.0) {
        traceInterior(st, subDir, eps);
      }
      color += shadeTrace(st, subDir, background, tone, sub, tx, ty, rx, ry);
    }
    color *= 0.25;
  }
  fragColor = tr.mode < .5 ? vec4(0.) : color * (tr.mode < 1.5 ? tr.cover : 1.);
}`;

// The DOM remains the source of copy, line wrapping, and accessible text.
function measureHeadline(heading, stage, ratio = 1) {
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
        if(style.backgroundImage.startsWith('linear-gradient')){
          const colors=style.backgroundImage.match(/rgba?\([^)]*\)/g);
          if(!colors||colors.length!==3)throw new Error('Unsupported headline gradient');
          const angle=parseFloat(style.backgroundImage.slice(16))*Math.PI/180;
          const length=Math.abs(rect.width*Math.sin(angle))+Math.abs(rect.height*Math.cos(angle));
          const cx=rect.left-bounds.left+rect.width/2,cy=rect.top-bounds.top+rect.height/2;
          const dx=Math.sin(angle)*length/2,dy=-Math.cos(angle)*length/2;
          const gradient=context.createLinearGradient(cx-dx,cy-dy,cx+dx,cy+dy);
          colors.forEach((color,index)=>gradient.addColorStop(index/2,color));context.fillStyle=gradient;
        }
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

function createBlobOptics(canvas) {
  const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl)throw new Error('3D glass unavailable');
  const shaders=[],program=gl.createProgram(),vao=gl.createVertexArray(),texture=gl.createTexture();
  let view;
  function dispose(){shaders.forEach(shader=>gl.deleteShader(shader));gl.deleteProgram(program);gl.deleteVertexArray(vao);gl.deleteTexture(texture);gl.getExtension('WEBGL_lose_context')?.loseContext();}
  try{
    for(const [type,source] of [[gl.VERTEX_SHADER,blobVertex],[gl.FRAGMENT_SHADER,blobFragment]]){
      const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'Glass shader failed');
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Glass program failed');
    const names=['View','Heading','Offset','Ratio','Focal','Center','Inverse','Scale','Bound','Time','Ior','Presence','Pass','Text','Dispersion','Reflection'];
    const u=Object.fromEntries(names.map(key=>[key,gl.getUniformLocation(program,'u'+key)]));
    return {dispose,build(width,height,diameter,heading){
      view=Math.ceil(diameter*1.6);
      const ratio=Math.min(2,devicePixelRatio||1),unit=diameter/2/1.08;
      canvas.width=canvas.height=Math.ceil(view*ratio);
      gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);gl.bindVertexArray(vao);
      gl.uniform2f(u.View,view,view);gl.uniform2f(u.Heading,width,height);gl.uniform1f(u.Ratio,canvas.width/view);
      gl.uniform1f(u.Focal,view*1.6);gl.uniform3f(u.Center,view/2,view/2,unit*.75);
      const c=Math.cos(.2),s=Math.sin(.2);
      gl.uniformMatrix3fv(u.Inverse,false,new Float32Array([1/unit,0,0,0,c/unit,-s/unit,0,s/unit,c/unit]));
      gl.uniform1f(u.Scale,unit);gl.uniform1f(u.Bound,diameter*.54+2);gl.uniform1f(u.Time,2.4);
      gl.uniform1f(u.Ior,1.45);gl.uniform1f(u.Presence,1);gl.uniform1f(u.Dispersion,.35);
      gl.uniform1f(u.Reflection,1);
      const measured=measureHeadline(heading,heading,ratio);
      if(measured.error>2)throw new Error('Headline typography mismatch');
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,measured.canvas);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.generateMipmap(gl.TEXTURE_2D);gl.uniform1i(u.Text,0);
      gl.uniform1f(u.Pass,2);gl.drawArrays(gl.TRIANGLES,0,3);
      const samples=new Uint8Array(canvas.width*canvas.height*4);
      gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,samples);
      if(gl.getError()!==gl.NO_ERROR)throw new Error('Glass readback failed');
      return {map:lensMap(width,height,view,{width:canvas.width,height:canvas.height,pixels:samples}),extent:view};
    },draw(point){
      gl.uniform2f(u.Offset,point.x-view/2,point.y-view/2);gl.uniform1f(u.Pass,0);gl.drawArrays(gl.TRIANGLES,0,3);
      if(gl.isContextLost())throw new Error('Glass context lost');
    }};
  }catch(error){dispose();throw error;}
}

export function lensMap(width,height,extent,samples) {
  const mapWidth=Math.ceil(width*2.4),mapHeight=Math.ceil(height*2.4);
  const pixels=new Uint8ClampedArray(mapWidth*mapHeight*4);
  for(let i=0;i<pixels.length;i+=4){pixels[i+3]=255;}
  const left=Math.floor((mapWidth-extent)/2),top=Math.floor((mapHeight-extent)/2);
  for(let y=0;y<extent;y++)for(let x=0;x<extent;x++){
    const dx=left+x,dy=top+y;if(dx<0||dy<0||dx>=mapWidth||dy>=mapHeight)continue;
    const from=(Math.min(samples.height-1,Math.floor((extent-1-y)*samples.height/extent))*samples.width+Math.min(samples.width-1,Math.floor(x*samples.width/extent)))*4;
    const to=(dy*mapWidth+dx)*4;pixels[to]=pixels[to+1]=pixels[to+2]=samples.pixels[from];
  }
  return {width:mapWidth,height:mapHeight,pixels};
}
export function lensPoint(x, y, width, height, diameter) {
  const edge = diameter / 2 + 2;
  return {x: Math.max(edge, Math.min(width - edge, x)), y: Math.max(edge, Math.min(height - edge, y))};
}
const instances = new WeakMap();
export function initHeadlineGlass(stage) {
  if (instances.has(stage)) return instances.get(stage);
  const heading = stage.querySelector('h2');
  if (!heading || typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined') return () => {};
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('headline-optics');
  svg.setAttribute('aria-hidden', 'true');
  // A full opaque coverage image works in Safari's CSS-filter path.
  // Original HTML is removed only beneath the refracting 3D surface.
  svg.innerHTML = '<filter id="headline-refraction" primitiveUnits="objectBoundingBox" x="-5%" y="-8%" width="110%" height="116%" color-interpolation-filters="sRGB"><feImage result="map" preserveAspectRatio="none"/><feColorMatrix in="map" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" result="coverage"/><feComposite in="SourceGraphic" in2="coverage" operator="out"/></filter>';
  const image = svg.querySelector('feImage');
  const lens = document.createElement('canvas');
  lens.className = 'headline-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.hidden = true;
  stage.append(svg, lens);
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const plain = ['(forced-colors:active)', '(prefers-contrast:more)', '(prefers-reduced-transparency:reduce)'].map(query => matchMedia(query));
  let frame = null, disposed = false, suspended = false, visible = false, ready = false, dirty = true, failed = false;
  let width = 0, height = 0, diameter = 0, extent = 0, point, target, last = 0, deadline = 0, ticket = 0, down = false, printing = false, optics;
  let movedAt = 0, movement = 0;
  const listeners = [];
  function listen(node, type, callback, options) { node.addEventListener(type, callback, options); listeners.push(() => node.removeEventListener(type, callback, options)); }
  function selected() { const selection = document.getSelection(); return down || Boolean(selection && !selection.isCollapsed && selection.containsNode(heading, true)); }
  function allowed() { return !disposed && !suspended && !failed && visible && !document.hidden && !printing && !plain.some(query => query.matches) && !selected(); }
  function stop() { if (frame !== null) cancelAnimationFrame(frame); frame = null; last = 0; }
  function hide() { stop(); heading.style.removeProperty('filter'); lens.hidden = true; }
  function wake() { if (frame === null && ready && allowed()) frame = requestAnimationFrame(draw); }
  function build() {
    dirty = false;
    const rect = heading.getBoundingClientRect();
    width = rect.width; height = rect.height;
    diameter = Math.floor(Math.min(fine.matches && !reduced.matches ? 200 : 128, width * .82, height * .85));
    if (diameter < 64 || !width || !height) { ready = false; hide(); return; }
    const canvas = document.createElement('canvas'), context = canvas.getContext('2d');
    if (!context) throw new Error('Coverage map unavailable');
    optics ||= createBlobOptics(lens);
    const baked = optics.build(width, height, diameter, heading), map = baked.map;
    extent = baked.extent;
    canvas.width = map.width; canvas.height = map.height;
    const pixels = context.createImageData(map.width, map.height);
    pixels.data.set(map.pixels); context.putImageData(pixels, 0, 0);
    const url = canvas.toDataURL();
    const preload = new Image(), generation = ++ticket;
    ready = false;
    preload.onload = () => {
      if (disposed || generation !== ticket) return;
      image.setAttribute('href', url);
      image.setAttribute('width', map.width / width); image.setAttribute('height', map.height / height);
      lens.style.width = lens.style.height = `${extent}px`;
      point = target = lensPoint(width * .58, height * .55, width, height, diameter);
      ready = true; sync();
    };
    preload.onerror = () => { if (generation === ticket) { failed = true; hide(); stage.dataset.glassState = 'fallback'; } };
    preload.src = url;
  }
  function draw(time) {
    frame = null;
    if (!allowed() || !ready) { hide(); return; }
    const moving = fine.matches && !reduced.matches && time < deadline;
    const alpha = moving ? 1 - Math.exp(-Math.min(50, last ? time - last : 16.67) / 85) : 1;
    point.x += (target.x - point.x) * alpha; point.y += (target.y - point.y) * alpha;
    const wobble = moving ? Math.sin((time - movedAt) / 70) * Math.exp(-(time - movedAt) / 180) * movement : 0;
    const stretch = 1 + wobble;
    const unsettled = moving && (Math.hypot(target.x - point.x, target.y - point.y) > .15 || Math.abs(wobble) > .001);
    if (!unsettled) point = {...target};
    // ponytail: one fixed blob surface; spring motion deforms its mask and canvas together.
    // Shape morphing needs a new coverage bake. Native text outside the mask is never repainted.
    const mapWidth = Math.ceil(width * 2.4) * stretch, mapHeight = Math.ceil(height * 2.4) / stretch;
    image.setAttribute('width', mapWidth / width); image.setAttribute('height', mapHeight / height);
    image.setAttribute('x', (point.x - mapWidth / 2) / width);
    image.setAttribute('y', (point.y - mapHeight / 2) / height);
    lens.style.left = `${point.x - extent / 2}px`; lens.style.top = `${point.y - extent / 2}px`;
    lens.style.transform = `scale(${stretch},${1 / stretch})`;
    try { optics.draw(point); } catch (error) { failed = true; hide(); stage.dataset.glassState = 'fallback'; stage.dataset.glassError = error.message; return; }
    heading.style.filter = 'url(#headline-refraction)'; lens.hidden = false;
    stage.dataset.glassState = fine.matches && !reduced.matches ? 'ready' : 'static';
    last = unsettled ? time : 0;
    if (unsettled) wake();
  }
  function sync() {
    if (!allowed()) { hide(); return; }
    try { if (dirty) build(); wake(); }
    catch (error) { failed = true; hide(); stage.dataset.glassState = 'fallback'; stage.dataset.glassError = error.message; }
  }
  function invalidate() { if (disposed) return; ticket++; dirty = true; ready = false; hide(); sync(); }
  listen(lens, 'webglcontextlost', event => { event.preventDefault(); failed = true; hide(); stage.dataset.glassState = 'fallback'; });
  listen(stage, 'pointermove', event => {
    if (event.pointerType !== 'mouse' || !fine.matches || reduced.matches || !ready || !allowed()) return;
    const rect = heading.getBoundingClientRect();
    target = lensPoint(event.clientX - rect.left, event.clientY - rect.top, width, height, diameter);
    movedAt = performance.now(); movement = Math.min(.065, Math.hypot(target.x - point.x, target.y - point.y) / diameter * .15);
    deadline = movedAt + 1200; wake();
  }, {passive: true});
  listen(stage, 'pointerleave', () => { if (ready && fine.matches && !reduced.matches) { target = lensPoint(width * .58, height * .55, width, height, diameter); deadline = performance.now() + 1200; wake(); } });
  listen(stage, 'pointerdown', () => { down = true; sync(); }, {passive: true});
  listen(window, 'pointerup', () => { down = false; sync(); }, {passive: true});
  listen(window, 'pointercancel', () => { down = false; sync(); }, {passive: true});
  listen(document, 'selectionchange', sync);
  listen(document, 'visibilitychange', sync);
  listen(window, 'blur', () => { down = false; hide(); });
  listen(window, 'focus', sync);
  listen(window, 'beforeprint', () => { printing = true; sync(); });
  listen(window, 'afterprint', () => { printing = false; sync(); });
  listen(window, 'pagehide', event => { suspended = true; if (event.persisted) hide(); else dispose(); });
  listen(window, 'pageshow', () => { suspended = false; sync(); });
  [fine, reduced, ...plain].forEach(query => listen(query, 'change', invalidate));
  if (document.fonts) { listen(document.fonts, 'loadingdone', invalidate); document.fonts.ready.then(() => { if (!disposed) invalidate(); }); }
  const resize = new ResizeObserver(invalidate); resize.observe(heading);
  const intersection = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); });
  intersection.observe(stage);
  function dispose() {
    if (disposed) return;
    disposed = true; ticket++; hide(); resize.disconnect(); intersection.disconnect(); listeners.forEach(remove => remove());
    optics?.dispose(); svg.remove(); lens.remove(); instances.delete(stage);
  }
  instances.set(stage, dispose);
  return dispose;
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-headline-glass]').forEach(initHeadlineGlass);
