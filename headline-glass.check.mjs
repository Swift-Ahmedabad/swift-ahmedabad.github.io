// Run: node headline-glass.check.mjs — native browser paint is checked separately.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lensMap, lensPoint, initHeadlineGlass} from './headline-glass.mjs';

const shader=readFileSync(new URL('./headline-glass.mjs',import.meta.url),'utf8').match(/const blobFragment = `([\s\S]*?)`;/)[1];
const uniforms=new Set([...shader.matchAll(/uniform \w+ (u\w+);/g)].map(match=>match[1]));
for(const name of shader.match(/\bu[A-Z]\w*/g)||[])assert.ok(uniforms.has(name),`Shader uniform declared: ${name}`);

for (const [width, height, diameter] of [[500,230,192],[280,140,118],[200,100,80]]) {
  const sample = {width:2,height:2,pixels:new Uint8Array([128,128,128,255,150,138,128,255,110,118,128,255,128,128,128,255])};
  const map = lensMap(width, height, diameter, sample);
  for (const [x,y] of [[0,0],[map.width-1,0],[0,map.height-1],[map.width-1,map.height-1]]) {
    assert.deepEqual(Array.from(map.pixels.slice((y*map.width+x)*4,(y*map.width+x)*4+4)),[0,0,0,255], 'Outside mask preserves native text');
  }
  const center = Math.floor(map.height/2)*map.width+Math.floor(map.width/2);
  assert.ok(map.pixels.some((value,index)=>index%4<3 && value>128), 'Coverage contains the glass surface');
  assert.ok(map.pixels[center*4]>=110 && map.pixels[center*4]<=150);
  for (const [x,y] of [[-100,-100],[1e4,1e4],[width/2,height/2]]) {
    const point=lensPoint(x,y,width,height,diameter), edge=diameter/2+2;
    assert.ok(point.x>=edge && point.x<=width-edge && point.y>=edge && point.y<=height-edge, 'Lens stays inside headline bounds');
  }
}

class Target {
  events=new Map();style={removeProperty(name){delete this[name];}};attributes={};dataset={};hidden=false;
  classList={add(){}};
  addEventListener(name,fn){if(!this.events.has(name))this.events.set(name,new Set());this.events.get(name).add(fn);}
  removeEventListener(name,fn){this.events.get(name)?.delete(fn);}
  emit(name,event={}){for(const fn of this.events.get(name)||[])fn(event);}
  setAttribute(name,value){this.attributes[name]=value;}
  append(...nodes){this.children=nodes;}
  getBoundingClientRect(){return {left:0,top:80,width:(this.textContent||'').length*10,height:120};}
  remove(){this.removed=true;}
}
class Observer {
  static all=[];
  constructor(callback){this.callback=callback;Observer.all.push(this);}
  observe(){}
  disconnect(){this.disconnected=true;}
}
let now=0,next=0,draws=0,selection=false,contextAvailable=true,gpuDraws=0,readbacks=0,releases=0,uploads=0;
const gpu={
  createProgram:()=>({}),createVertexArray:()=>({}),createShader:()=>({}),createTexture:()=>({}),
  getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_program,key)=>key,
  shaderSource(){},compileShader(){},attachShader(){},linkProgram(){},viewport(){},useProgram(){},bindVertexArray(){},
  uniform1f(){},uniform2f(){},uniform3f(){},uniform4f(){},uniform1i(){},uniformMatrix3fv(){},
  activeTexture(){},bindTexture(){},texParameteri(){},pixelStorei(){},texImage2D(){uploads++;},generateMipmap(){},isContextLost:()=>false,
  drawArrays(){gpuDraws++;},readPixels(_x,_y,_w,_h,_format,_type,pixels){pixels.fill(128);readbacks++;},
  getError:()=>0,NO_ERROR:0,deleteShader(){},deleteProgram(){},deleteVertexArray(){},deleteTexture(){},getExtension:()=>({loseContext(){releases++;}})
};
const queue=new Map(), queries=[];
const heading=new Target();heading.textContent='Hello, possibility.';
heading.getBoundingClientRect=()=>({left:0,top:0,width:500,height:230});
const stage=new Target();stage.querySelector=()=>heading;stage.append=(...nodes)=>{stage.children=nodes;};
const documentTarget=new Target();documentTarget.hidden=false;documentTarget.getSelection=()=>({isCollapsed:!selection,containsNode:()=>selection});
documentTarget.querySelectorAll=()=>[];
documentTarget.body=new Target();
documentTarget.createTreeWalker=()=>{let read=false;return {nextNode(){if(read)return null;read=true;return {length:heading.textContent.length,textContent:heading.textContent,parentElement:heading};}};};
documentTarget.createRange=()=>{let start=0,end=0;return {setStart(_node,value){start=value;},setEnd(_node,value){end=value;},getBoundingClientRect(){return {left:start*10,top:80,width:(end-start)*10,height:120};}};};
documentTarget.createElementNS=()=>{const node=new Target();node.image=new Target();node.displacement=new Target();node.querySelector=tag=>tag==='feImage'?node.image:node.displacement;return node;};
const fakeContext={letterSpacing:'',scale(){},measureText:text=>({width:text.length*10}),fillText(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}};
documentTarget.createElement=tag=>tag==='canvas'?Object.assign(new Target(),{getContext:type=>!contextAvailable?null:type==='webgl2'?gpu:fakeContext,toDataURL:()=> 'data:image/png;base64,proof'}):new Target();
const windowTarget=new Target();
Object.assign(globalThis,{
  document:documentTarget,window:windowTarget,ResizeObserver:Observer,IntersectionObserver:Observer,
  getComputedStyle:()=>({fontSize:'120px',direction:'ltr',textTransform:'none',backgroundImage:'none'}),performance:{now:()=>now},devicePixelRatio:1,NodeFilter:{SHOW_TEXT:4},
  Image:class {set src(value){this.onload();}},
  matchMedia:query=>{const target=new Target();target.matches=query.includes('pointer:fine');queries.push(target);return target;},
  requestAnimationFrame:fn=>{const id=next++;queue.set(id,fn);return id;},cancelAnimationFrame:id=>queue.delete(id)
});
function tick(time){now=time;const pending=[...queue.values()];queue.clear();for(const callback of pending){draws++;callback(time);}}
const dispose=initHeadlineGlass(stage);
assert.equal(initHeadlineGlass(stage),dispose,'Initialization has one owner');
Observer.all.at(-1).callback([{isIntersecting:true}]);
assert.equal(queue.size,1,'Only one render can be pending');
tick(16);
assert.equal(heading.style.filter,'url(#headline-refraction)');
assert.equal(queue.size,0,'Stationary effect does not animate');
assert.equal(gpuDraws,2,'Coverage bakes once before the first visible render');
assert.equal(readbacks,1);
assert.equal(uploads,1);
stage.emit('pointermove',{pointerType:'mouse',clientX:100,clientY:110});
stage.emit('pointermove',{pointerType:'mouse',clientX:390,clientY:110});
assert.equal(queue.size,1,'Pointer events coalesce');
for(let t=32;t<=1600;t+=16)tick(t);
assert.equal(queue.size,0,'Rendering stops within the settling deadline');
assert.ok(gpuDraws>2 && gpuDraws<100,'Pointer rendering is finite');
assert.equal(readbacks,1,'Pointer movement does not read back pixels');
assert.equal(uploads,1,'Pointer movement never repaints or uploads text');
const settled=draws;tick(11600);assert.equal(draws,settled,'Ten idle seconds add zero renders');
selection=true;documentTarget.emit('selectionchange');
assert.equal(heading.style.filter,undefined,'Selection restores native unfiltered text');
selection=false;documentTarget.emit('selectionchange');tick(11616);
stage.emit('pointermove',{pointerType:'mouse',clientX:100,clientY:110});
Observer.all.at(-1).callback([{isIntersecting:false}]);
assert.equal(queue.size,0,'Offscreen rendering cancels immediately');
Observer.all.at(-1).callback([{isIntersecting:true}]);tick(11632);
queries[1].matches=true;queries[1].emit('change');tick(11648);
assert.equal(stage.dataset.glassState,'static','Reduced motion is stationary');
assert.equal(stage.children[1].style.width,'205px','Static lens retains a 128px body in its transparent material canvas');
stage.emit('pointermove',{pointerType:'mouse',clientX:100,clientY:110});assert.equal(queue.size,0);
stage.emit('pointerleave');assert.equal(queue.size,0,'Static treatment does not redraw on pointer exit');
queries[0].matches=false;queries[0].emit('change');tick(11656);
assert.equal(stage.dataset.glassState,'static','Coarse pointers retain a still treatment');
for (let index=2;index<5;index++) {
  queries[index].matches=true;queries[index].emit('change');
  assert.equal(heading.style.filter,undefined,'Contrast/transparency preferences keep plain native text');
  queries[index].matches=false;queries[index].emit('change');tick(11660+index);
}
documentTarget.hidden=true;documentTarget.emit('visibilitychange');assert.equal(queue.size,0);
documentTarget.hidden=false;documentTarget.emit('visibilitychange');tick(11664);
windowTarget.emit('beforeprint');assert.equal(heading.style.filter,undefined);
windowTarget.emit('afterprint');tick(11680);
windowTarget.emit('pagehide',{persisted:true});assert.equal(queue.size,0);
windowTarget.emit('pageshow');tick(11696);
let prevented=false;
stage.children[1].emit('webglcontextlost',{preventDefault(){prevented=true;}});
assert.ok(prevented);
assert.equal(heading.style.filter,undefined,'Lost GPU restores complete native text');
assert.equal(stage.children[1].hidden,true);
dispose();dispose();
assert.equal(queue.size,0);
assert.equal(heading.textContent,'Hello, possibility.');
assert.ok(Observer.all.every(observer=>observer.disconnected));
assert.ok([stage,stage.children[1],documentTarget,windowTarget,...queries].every(target=>[...target.events.values()].every(set=>!set.size)),'Every owned listener is removed');
assert.ok(stage.children.every(node=>node.removed));
assert.equal(releases,1,'Owned GPU context is released');
contextAvailable=false;
const disposeFallback=initHeadlineGlass(stage);
Observer.all.at(-1).callback([{isIntersecting:true}]);
assert.equal(stage.dataset.glassState,'fallback');
assert.equal(heading.style.filter,undefined,'Failed initialization retains readable HTML');
disposeFallback();
console.log('PASS: coverage/native-text boundaries, shader declarations, cached text/readback, bounded motion, idle/offscreen/selection/reduced-motion/print/bfcache, GPU failure and cleanup');
