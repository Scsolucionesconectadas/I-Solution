import {counterValue} from './counter-model.js';

const counters=[...document.querySelectorAll('[data-counter]')];
const preference=matchMedia('(prefers-reduced-motion:reduce)');
const frames=new Map();
function finish(node){
  const frame=frames.get(node);
  if(frame) cancelAnimationFrame(frame);
  frames.delete(node);
  node.textContent=node.dataset.counter;
}
function animate(node){
  if(preference.matches||document.hidden) return finish(node);
  const target=Number(node.dataset.counter),start=performance.now();
  const update=now=>{
    const progress=Math.min(1,(now-start)/1400);
    node.textContent=String(counterValue(target,progress));
    if(progress<1)frames.set(node,requestAnimationFrame(update));
    else finish(node);
  };
  node.textContent='0';
  frames.set(node,requestAnimationFrame(update));
}
if('IntersectionObserver' in window&&!preference.matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    observer.unobserve(entry.target);animate(entry.target);
  }),{threshold:.5});
  counters.forEach(node=>observer.observe(node));
  preference.addEventListener('change',event=>{if(event.matches){observer.disconnect();counters.forEach(finish);}});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)counters.forEach(finish);});
