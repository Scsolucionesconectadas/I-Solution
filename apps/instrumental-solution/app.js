const root = document.documentElement;
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const smallScreen = matchMedia('(max-width: 700px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const progress = document.querySelector('.reading-progress');

function setMenu(open, returnFocus = false) {
  menuButton?.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('is-open', open);
  if (returnFocus) menuButton?.focus();
}

if (menuButton && nav) {
  nav.querySelectorAll('.nav-group').forEach(group=>group.addEventListener('toggle',()=>{
    if(group.open)nav.querySelectorAll('.nav-group[open]').forEach(other=>{if(other!==group)other.open=false;});
  }));
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    const summary=event.target.closest('.nav-group>summary');
    if(summary)nav.querySelectorAll('.nav-group[open]').forEach(group=>{if(group!==summary.parentElement)group.open=false;});
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const group=nav.querySelector('.nav-group[open]');
      if(group){group.open=false;group.querySelector('summary').focus();return;}
    }
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if(!event.target.closest('.nav-group')) nav.querySelectorAll('.nav-group[open]').forEach(group=>{group.open=false;});
    if (smallScreen.matches && !event.target.closest('.site-header')) setMenu(false);
  });
  smallScreen.addEventListener('change', () => {
    const focusInNav = nav.contains(document.activeElement);
    setMenu(false, smallScreen.matches && focusInNav);
  });
}

let framePending = false;
function updateProgress() {
  const distance = root.scrollHeight - root.clientHeight;
  const fraction = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
  if (progress) progress.style.transform = `scaleX(${fraction})`;
  framePending = false;
}
addEventListener('scroll', () => {
  if (!framePending) { framePending = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

// Content is visible by default; entrance motion is optional enhancement only.
const animations = new Set();
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    if (reducedMotion.matches || !entry.target.animate || entry.target.contains(document.activeElement)) return;
    const animation = entry.target.animate([
      { opacity: .55, transform: 'translateY(13px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 380, easing: 'cubic-bezier(.23,1,.32,1)' });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
  });
}, { threshold: .12 }) : null;
document.querySelectorAll('[data-reveal]').forEach(element => observer?.observe(element));
reducedMotion.addEventListener('change', event => {
  if (event.matches) { animations.forEach(animation => animation.cancel()); animations.clear(); }
});
root.classList.add('js-ready');

// Native download stays usable without JS. Browsers do not expose its completion.
document.querySelector('[data-catalogue-download]')?.addEventListener('click',()=>{
  const feedback=document.querySelector('#catalogue-download-feedback');
  if(!feedback)return;
  feedback.textContent='La descarga se solicitó. Revisá las descargas de tu navegador.';
  feedback.hidden=false;
});
