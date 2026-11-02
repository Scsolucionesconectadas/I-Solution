document.querySelectorAll('[data-product-gallery]').forEach(gallery=>{
  const slides=[...gallery.querySelectorAll('[data-gallery-slide]')];
  const controls=gallery.querySelector('[data-gallery-controls]');
  if(!controls)return;
  const buttons=[...controls.querySelectorAll('button')];
  gallery.classList.add('is-ready');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let activeAnimation;
  function select(index,animate=false){
    activeAnimation?.cancel();
    slides.forEach((slide,i)=>{slide.hidden=i!==index;});
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    if(animate&&!reduced.matches&&slides[index].animate){
      activeAnimation=slides[index].animate([{opacity:.45},{opacity:1}],{duration:160,easing:'cubic-bezier(.23,1,.32,1)'});
    }
  }
  reduced.addEventListener('change',()=>activeAnimation?.cancel());
  controls.hidden=false;
  controls.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(button&&buttons.includes(button))select(buttons.indexOf(button),true);
  });
  controls.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const index=buttons.indexOf(document.activeElement);
    if(index<0)return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    select(next,true);buttons[next].focus();
  });
  select(0);
});

const detailNavigation=document.querySelector('.product-detail-navigation');
if(detailNavigation){
  const root=document.documentElement;
  const updateHeight=()=>root.style.setProperty('--product-nav-height',`${detailNavigation.offsetHeight}px`);
  updateHeight();
  if('ResizeObserver' in window)new ResizeObserver(updateHeight).observe(detailNavigation);
  const links=[...detailNavigation.querySelectorAll('a[href^="#"]')];
  const sections=links.map(link=>document.querySelector(link.getAttribute('href')));
  let framePending=false;
  function updateSection(){
    const offset=parseFloat(getComputedStyle(root).getPropertyValue('--header-height'))+detailNavigation.offsetHeight+32;
    let active=-1;
    sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<=offset)active=i;});
    links.forEach((link,i)=>{if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    framePending=false;
  }
  addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(updateSection);}},{passive:true});
  addEventListener('resize',()=>{updateHeight();updateSection();});
  updateSection();
}
