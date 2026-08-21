// Particles
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [], mouse = { x: null, y: null };
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  class P {
    constructor() { this.r(); }
    r() { this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height; this.s = Math.random()*1.5+0.5; this.sx = (Math.random()-0.5)*0.4; this.sy = (Math.random()-0.5)*0.4; this.o = Math.random()*0.5+0.1; this.c = ['0,240,255','168,85,247','236,72,153'][Math.floor(Math.random()*3)]; }
    u() { this.x+=this.sx; this.y+=this.sy; if(mouse.x!==null){const dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy);if(d<150){this.x-=dx*0.005;this.y-=dy*0.005;}} if(this.x<0||this.x>canvas.width||this.y<0||this.y>canvas.height)this.r(); }
    d() { ctx.beginPath(); ctx.arc(this.x,this.y,this.s,0,Math.PI*2); ctx.fillStyle=`rgba(${this.c},${this.o})`; ctx.fill(); }
  }
  for(let i=0;i<80;i++) particles.push(new P());
  !function a(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{p.u();p.d();});for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(0,240,255,${0.05*(1-d/120)})`;ctx.lineWidth=0.5;ctx.stroke();}}requestAnimationFrame(a);}();
}

// Scroll reveal
const obs = new IntersectionObserver(e => { e.forEach(en => { if(en.isIntersecting){en.target.classList.add('active');en.target.querySelectorAll('.skill-bar').forEach(b=>{b.style.width=b.dataset.width;b.style.transition='width 1.5s cubic-bezier(.16,1,.3,1)';});en.target.querySelectorAll('.counter').forEach(c=>{const t=parseInt(c.dataset.target),s=performance.now();!function u(n){const p=Math.min((n-s)/2000,1),e=1-Math.pow(1-p,4);c.textContent=Math.floor(t*e)+'+';if(p<1)requestAnimationFrame(u);}(s);});} }); }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => obs.observe(el));

// Navbar scroll
addEventListener('scroll', () => {
  const n = document.getElementById('navbar'); if(!n) return;
  if(scrollY>50){n.style.background='rgba(3,7,18,0.85)';n.style.backdropFilter='blur(20px)';n.style.borderBottom='1px solid rgba(255,255,255,0.05)';}
  else{n.style.background='transparent';n.style.backdropFilter='none';n.style.borderBottom='none';}
});

// Active nav
const pg = location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.nav-link').forEach(l => { if(l.getAttribute('href')===pg||(pg===''&&l.getAttribute('href')==='index.html')) l.classList.add('active-link'); });

// Mobile menu
document.addEventListener('click', e => {
  const b = e.target.closest('#mobile-menu-btn'), m = document.getElementById('mobile-menu');
  if(b&&m){m.classList.toggle('hidden');return;}
  if(m&&!m.contains(e.target)&&!b) m.classList.add('hidden');
});

// ============ NAV AUTH — THIS IS THE CRITICAL PART ============
function updateNavbarAuth() {
  const c = document.getElementById('nav-actions');
  if (!c) return;

  if (!window.currentUser) {
    // NOT LOGGED IN — show Login button
    c.innerHTML = `
      <button onclick="openAuthModal('login')" class="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/20 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Login
      </button>
      <button onclick="openAuthModal('login')" class="sm:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-neutral-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
      </button>`;
  } else if (window.currentRole === 'admin') {
    // ADMIN — show all buttons
    c.innerHTML = `
      <a href="admin.html" class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/20 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Admin Panel
      </a>
      <a href="creations.html" class="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-neutral-400 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Upload
      </a>
      <a href="admin-messages.html" class="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-neutral-400 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Messages
      </a>
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
        <span class="text-xs text-neutral-400 max-w-[120px] truncate">${window.currentUser.email}</span>
        <span class="admin-badge">Admin</span>
      </div>
      <button onclick="handleLogout()" class="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all" title="Logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
      <button id="mobile-menu-btn" class="sm:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-neutral-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>`;
  } else {
    // VIEWER — show email + logout
    c.innerHTML = `
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
        <span class="text-xs text-neutral-400 max-w-[150px] truncate">${window.currentUser.email}</span>
      </div>
      <button onclick="handleLogout()" class="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 text-neutral-400 text-sm font-semibold hover:text-white hover:border-white/20 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Logout
      </button>
      <button id="mobile-menu-btn" class="sm:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-neutral-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>`;
  }
}

// RUN IMMEDIATELY — shows Login button before Firebase resolves
updateNavbarAuth();

// Also re-check after 2 seconds in case auth resolved late
setTimeout(() => updateNavbarAuth(), 2000);

function handleLogout() {
  auth.signOut().then(() => {
    showToast('Logged out', 'info');
    if (['admin-messages.html','admin.html'].includes(pg)) location.href = 'index.html';
    else updateNavbarAuth();
  });
}

// Toast
function showToast(text, type='success') {
  const t = document.getElementById('toast'); if(!t) return;
  const i = document.getElementById('toast-icon'), x = document.getElementById('toast-text');
  x.textContent = text;
  const m = {success:['check-circle','text-green-400','bg-green-400/10','rgba(74,222,128,.3)'],error:['alert-circle','text-red-400','bg-red-400/10','rgba(248,113,113,.3)'],info:['info','text-blue-400','bg-blue-400/10','rgba(96,165,250,.3)']};
  const c = m[type]||m.info;
  i.innerHTML=`<i data-lucide="${c[0]}" class="w-5 h-5 ${c[1]}"></i>`; i.className=`w-8 h-8 rounded-lg flex items-center justify-center ${c[2]}`; t.style.borderColor=c[3];
  try{lucide.createIcons();}catch(e){}
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3500);
}

// Keyboard
document.addEventListener('keydown', e => {
  if(e.key==='Escape') ['upload-modal','detail-modal','auth-modal'].forEach(id=>{
    const m=document.getElementById(id); if(m&&m.classList.contains('open')){m.classList.remove('open');document.body.style.overflow='';}
  });
});

// Setup banner
if(window.__firebaseNotConfigured && pg!=='setup.html'){
  const b=document.createElement('div');b.id='setup-banner';
  b.innerHTML=`<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,rgba(234,179,8,0.15),rgba(239,68,68,0.1));backdrop-filter:blur(20px);border-bottom:1px solid rgba(234,179,8,0.3);padding:0.75rem 1.5rem;display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;"><span style="font-size:0.8rem;font-weight:600;color:#EAB308;">⚠ Firebase not configured</span><a href="setup.html" style="padding:0.4rem 1rem;border-radius:0.75rem;background:rgba(234,179,8,0.15);border:1px solid rgba(234,179,8,0.3);color:#EAB308;font-size:0.75rem;font-weight:700;text-transform:uppercase;text-decoration:none;">Configure Now →</a><button onclick="this.closest('#setup-banner').remove()" style="background:none;border:none;color:#737373;cursor:pointer;">✕</button></div>`;
  document.body.prepend(b);
}

try{lucide.createIcons();}catch(e){}