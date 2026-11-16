// Run: node story-glass.check.mjs — no browser or packages required.
import assert from 'node:assert/strict';
import {glassPlacement, glassTarget, glassMode, storyLoop, initStoryGlass} from './story-glass.mjs';

const desktopLines = [{x:180,y:72,width:400,height:72},{x:121,y:136,width:518,height:72}];
const place = glassPlacement(760,280,desktopLines,false);
assert.ok(place);
assert.ok(place.diameter <= 192 && place.diameter >= 96);
assert.ok(place.x + place.edge <= 760 && place.y + place.edge <= 280);
assert.deepEqual(glassTarget({x:-100,y:1000},place,760,280),{x:place.edge,y:280-place.edge});
for (const width of [0,100,200,265,335,760]) for (const height of [0,80,210,280]) {
  const p = glassPlacement(width,height,[],width<768);
  if (p) {
    assert.ok(p.x-p.edge>=0 && p.y-p.edge>=0);
    assert.ok(p.x+p.edge<=width && p.y+p.edge<=height);
    assert.ok(p.diameter<=width*.45);
  }
}
const mobile = [{x:16,y:47,width:233,height:41},{x:70,y:84,width:125,height:41},{x:46,y:120,width:172,height:41}];
assert.equal(glassPlacement(265,210,mobile,true),null,'Crowded three-line headline stays readable');
assert.equal(glassPlacement(265,210,mobile,true,true),null);
assert.equal(glassPlacement(760,280,[{x:0,y:0,width:760,height:280}],false,true),null);
const base={width:1440,fine:true,reduced:false,contrast:false,printing:false,selection:false,slow:false};
assert.equal(glassMode(base),'interactive');
for (const key of ['reduced','slow']) assert.equal(glassMode({...base,[key]:true}),'static');
for (const key of ['contrast','printing','selection']) assert.equal(glassMode({...base,[key]:true}),'plain');
assert.equal(glassMode({...base,width:390}),'static');
assert.equal(glassMode({...base,fine:false}),'static');

let next=0, queue=new Map(), draws=0, busy=true;
const request=fn=>{const id=next++;queue.set(id,fn);return id;};
const cancel=id=>queue.delete(id);
const tick=time=>{const entries=[...queue.values()];queue.clear();entries.forEach(fn=>fn(time));};
const loop=storyLoop(()=>{draws++;return busy;},request,cancel);
loop.wake();assert.equal(queue.size,0);
loop.resume();loop.wake();loop.resume();assert.equal(queue.size,1,'One pending frame, including id zero');
tick(16);assert.equal(draws,1);assert.equal(queue.size,1);
loop.pause();assert.equal(queue.size,0,'Visibility suspension cancels pending work');
loop.resume();busy=false;tick(32);assert.equal(queue.size,0,'Static/settled draw stops');
loop.resume();const obsolete=[...queue.values()][0];loop.dispose();obsolete(48);
assert.equal(draws,2,'Disposed callback cannot render');
loop.resume();assert.equal(queue.size,0);

// Minimal lifecycle harness: real initializer with unavailable WebGL, then stale font completion.
class Target {
  events=new Map();
  addEventListener(type,fn){if(!this.events.has(type))this.events.set(type,new Set());this.events.get(type).add(fn);}
  removeEventListener(type,fn){this.events.get(type)?.delete(fn);}
  emit(type,event={}){for(const fn of this.events.get(type)||[])fn(event);}
  count(){return [...this.events.values()].reduce((n,set)=>n+set.size,0);}
}
class Observer {
  static all=[];
  constructor(fn,options){this.fn=fn;this.options=options;this.disconnected=false;Observer.all.push(this);}
  observe(){}
  disconnect(){this.disconnected=true;}
}
let resolveFonts, requests=0;
const heading={}, canvas=new Target();canvas.hidden=true;canvas.getContext=()=>{requests++;return null;};
const stage={dataset:{},querySelector:s=>s==='h2'?heading:canvas,...{}};
Object.setPrototypeOf(stage,new Target());stage.events=new Map();
const documentTarget=new Target();documentTarget.hidden=false;documentTarget.getSelection=()=>null;
const fonts=new Target();fonts.ready=Promise.resolve();documentTarget.fonts=fonts;
const windowTarget=new Target();windowTarget.visualViewport=new Target();
const queries=[];
Object.assign(globalThis,{document:documentTarget,window:windowTarget,innerWidth:1440,devicePixelRatio:1,
  matchMedia:query=>{const q=new Target();q.matches=query.includes('pointer:fine');queries.push(q);return q;},
  ResizeObserver:Observer,IntersectionObserver:Observer,requestAnimationFrame:request,cancelAnimationFrame:cancel});
const dispose=initStoryGlass(stage);
assert.equal(initStoryGlass(stage),dispose,'Repeated initialization returns same owner');
Observer.all.find(o=>o.options?.rootMargin).fn([{isIntersecting:true}]);
Observer.all.filter(o=>!o.options).at(-1).fn([{isIntersecting:true}]);
await Promise.resolve();tick(64);
assert.equal(stage.dataset.glassState,'fallback');assert.equal(canvas.hidden,true);assert.equal(requests,1);
dispose();dispose();
assert.ok(Observer.all.every(o=>o.disconnected));
assert.ok([canvas,stage,documentTarget,fonts,windowTarget,windowTarget.visualViewport,...queries].every(t=>t.count()===0),'Every listener removed');
assert.equal(queue.size,0);
fonts.ready=new Promise(resolve=>{resolveFonts=resolve;});
const second=initStoryGlass(stage);assert.notEqual(second,dispose);
Observer.all.findLast(o=>o.options?.rootMargin).fn([{isIntersecting:true}]);
second();resolveFonts();await Promise.resolve();tick(80);
assert.equal(requests,1,'Disposed font callback cannot initialize graphics');
assert.equal(stage.dataset.glassState,'disposed');
console.log('PASS: placement, mobile fallback, input/accessibility modes, bounded scheduling, cancellation, unavailable WebGL, idempotence, stale fonts and cleanup');
