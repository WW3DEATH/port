const DEFAULTS = {
  siteName:'NEXUS',
  hero:{badge:'AI-Powered Portfolio',line1:'I Build',line2:'Digital',line3:'Experiences',subtitle:'Web developer crafting intelligent, immersive websites that push the boundaries of what\'s possible on the web.'},
  about:{bio1:'I\'m a passionate web developer who merges cutting-edge AI technology with beautiful, functional design. Every project I create is an exploration of what happens when creativity meets intelligent code.',bio2:'From responsive interfaces to complex interactive experiences, I build websites that don\'t just look stunning — they think, adapt, and evolve.',statClients:0,statYears:0},
  skills:[{title:'Frontend',desc:'React, Next.js, Vue, Tailwind CSS, TypeScript',percentage:95},{title:'Backend',desc:'Node.js, Python, PostgreSQL, MongoDB, REST APIs',percentage:85},{title:'AI / ML',desc:'OpenAI, TensorFlow, LangChain, RAG, Embeddings',percentage:80},{title:'Design',desc:'Figma, Adobe Suite, Framer, Motion Design',percentage:90}],
  social:{github:'#',twitter:'#',linkedin:'#',dribbble:'#'},
  contact:{email:'hello@nexusdev.com',location:'San Francisco, CA',availability:'Open for freelance projects'},
  timeline:[
    {period:'2024 — Present',title:'Senior Web Developer',desc:'Leading AI-integrated web projects for enterprise clients. Building next-gen digital experiences.',color:'cyan'},
    {period:'2022 — 2024',title:'Freelance Developer',desc:'Built 30+ websites for startups and businesses worldwide. Specialized in React ecosystems.',color:'purple'},
    {period:'2021 — 2022',title:'Frontend Developer',desc:'Crafted responsive UIs and interactive dashboards. Deep-dived into animation libraries.',color:'pink'},
    {period:'2020 — 2021',title:'Started Coding',desc:'Began my journey with HTML, CSS, and JavaScript. Fell in love with turning ideas into experiences.',color:'blue'}
  ]
};

let S = JSON.parse(JSON.stringify(DEFAULTS));

// Auth gate
function checkAdmin() {
  if (window.currentRole === 'admin') {
    document.getElementById('admin-access-denied').classList.add('hidden');
    document.getElementById('admin-content').classList.remove('hidden');
    loadSettings(); loadUsers(); loadProjectCount();
  } else {
    document.getElementById('admin-access-denied').classList.remove('hidden');
    document.getElementById('admin-content').classList.add('hidden');
  }
}
window.addEventListener('authStateChanged', checkAdmin);
setTimeout(checkAdmin, 500);
setTimeout(checkAdmin, 3000);

// Sidebar
document.querySelectorAll('.admin-sidebar-link').forEach(l => {
  l.addEventListener('click', e => {
    e.preventDefault();
    const s = l.dataset.section; if(!s) return;
    document.querySelectorAll('.admin-sidebar-link').forEach(x => x.classList.remove('active-section'));
    l.classList.add('active-section');
    document.querySelectorAll('.admin-section').forEach(x => x.classList.remove('active'));
    document.getElementById(`section-${s}`)?.classList.add('active');
    document.querySelector('.admin-sidebar')?.classList.remove('mob');
  });
});
document.getElementById('sidebar-toggle')?.addEventListener('click', () => document.querySelector('.admin-sidebar')?.classList.toggle('mob'));

// Project count
function loadProjectCount() {
  db.collection('projects').get().then(s => { const e = document.getElementById('admin-project-count'); if(e) e.textContent = s.size; })
    .catch(() => {});
  db.collection('projects').onSnapshot(s => { const e = document.getElementById('admin-project-count'); if(e) e.textContent = s.size; }, () => {});
}

// Load
function loadSettings() {
  db.collection('settings').doc('site').get().then(doc => {
    if (doc.exists) {
      const d = doc.data();
      S = {...DEFAULTS,...d,hero:{...DEFAULTS.hero,...(d.hero||{})},about:{...DEFAULTS.about,...(d.about||{})},social:{...DEFAULTS.social,...(d.social||{})},contact:{...DEFAULTS.contact,...(d.contact||{})},skills:d.skills||DEFAULTS.skills,timeline:d.timeline||DEFAULTS.timeline};
    }
    populate();
  }).catch(() => populate());
}

function populate() {
  sv('set-siteName',S.siteName);
  sv('set-hero-badge',S.hero.badge); sv('set-hero-line1',S.hero.line1); sv('set-hero-line2',S.hero.line2); sv('set-hero-line3',S.hero.line3); sv('set-hero-subtitle',S.hero.subtitle);
  sv('set-about-bio1',S.about.bio1); sv('set-about-bio2',S.about.bio2); nv('set-about-clients',S.about.statClients); nv('set-about-years',S.about.statYears);
  sv('set-social-github',S.social.github); sv('set-social-twitter',S.social.twitter); sv('set-social-linkedin',S.social.linkedin); sv('set-social-dribbble',S.social.dribbble);
  sv('set-contact-email',S.contact.email); sv('set-contact-location',S.contact.location); sv('set-contact-availability',S.contact.availability);
  renderSkills(); renderTimeline();
}
function sv(id,v){const e=document.getElementById(id);if(e&&v!=null)e.value=v;}
function gv(id){const e=document.getElementById(id);return e?e.value.trim():'';}
function gn(id){const e=document.getElementById(id);return e?parseInt(e.value)||0:0;}

function renderSkills() {
  const c = document.getElementById('skills-editor'), cols = ['cyan','purple','pink','blue'];
  c.innerHTML = S.skills.map((s,i) => `
    <div class="glow-border p-5">
      <div class="flex items-center gap-2 mb-4"><div class="w-3 h-3 rounded-full bg-neon-${cols[i]}"></div><span class="text-xs font-bold text-neutral-500 uppercase tracking-wider">Skill ${i+1}</span></div>
      <div class="grid sm:grid-cols-2 gap-4 mb-4">
        <div><label class="al">Title</label><input type="text" class="ai" id="sk-t-${i}" value="${s.title||''}"></div>
        <div><label class="al">Percentage</label><input type="number" class="ai" id="sk-p-${i}" min="0" max="100" value="${s.percentage||0}"></div>
      </div>
      <div><label class="al">Description</label><input type="text" class="ai" id="sk-d-${i}" value="${s.desc||''}"></div>
    </div>`).join('');
}

function renderTimeline() {
  const c = document.getElementById('timeline-editor'), cols = ['cyan','purple','pink','blue'];
  c.innerHTML = S.timeline.map((t,i) => `
    <div class="p-5 rounded-xl border border-white/5 bg-white/[0.02] mb-4">
      <div class="flex items-center gap-2 mb-3"><div class="w-3 h-3 rounded-full bg-neon-${t.color||cols[i%4]}"></div><span class="text-xs font-bold text-neutral-500 uppercase tracking-wider">Entry ${i+1}</span></div>
      <div class="grid sm:grid-cols-3 gap-4">
        <div><label class="al">Period</label><input type="text" class="ai" id="tl-p-${i}" value="${t.period||''}" placeholder="2024 — Present"></div>
        <div><label class="al">Title</label><input type="text" class="ai" id="tl-t-${i}" value="${t.title||''}"></div>
        <div><label class="al">Color</label><select class="ai" id="tl-c-${i}"><option value="cyan" ${t.color==='cyan'?'selected':''}>Cyan</option><option value="purple" ${t.color==='purple'?'selected':''}>Purple</option><option value="pink" ${t.color==='pink'?'selected':''}>Pink</option><option value="blue" ${t.color==='blue'?'selected':''}>Blue</option></select></div>
      </div>
      <div class="mt-4"><label class="al">Description</label><textarea class="ai" id="tl-d-${i}" rows="2">${t.desc||''}</textarea></div>
    </div>`).join('');
}

// Save
function saveSection(section) {
  const btn = document.getElementById(`save-${section}`); if(!btn) return;
  const orig = btn.innerHTML; btn.disabled = true;
  btn.innerHTML = '<svg class="spin" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> Saving...';

  switch(section) {
    case 'site': S.siteName = gv('set-siteName')||'NEXUS'; break;
    case 'hero': S.hero = {badge:gv('set-hero-badge'),line1:gv('set-hero-line1'),line2:gv('set-hero-line2'),line3:gv('set-hero-line3'),subtitle:gv('set-hero-subtitle')}; break;
    case 'about': S.about = {bio1:gv('set-about-bio1'),bio2:gv('set-about-bio2'),statClients:gn('set-about-clients'),statYears:gn('set-about-years')}; break;
    case 'skills': S.skills = [0,1,2,3].map(i=>({title:gv(`sk-t-${i}`),desc:gv(`sk-d-${i}`),percentage:gn(`sk-p-${i}`)})); break;
    case 'social': S.social = {github:gv('set-social-github'),twitter:gv('set-social-twitter'),linkedin:gv('set-social-linkedin'),dribbble:gv('set-social-dribbble')}; break;
    case 'contact': S.contact = {email:gv('set-contact-email'),location:gv('set-contact-location'),availability:gv('set-contact-availability')}; break;
    case 'timeline': S.timeline = [0,1,2,3].map(i=>({period:gv(`tl-p-${i}`),title:gv(`tl-t-${i}`),color:document.getElementById(`tl-c-${i}`)?.value||'cyan',desc:gv(`tl-d-${i}`)})); break;
  }

  db.collection('settings').doc('site').set(S, {merge:true})
    .then(() => showToast('Saved!','success'))
    .catch(e => showToast('Error: '+e.message,'error'))
    .finally(() => { btn.disabled=false; btn.innerHTML=orig; });
}

// Users
function loadUsers() {
  db.collection('users').get().then(snap => {
    const c = document.getElementById('users-list');
    if(snap.empty){c.innerHTML='<p class="text-neutral-600 text-center py-10">No users yet.</p>';return;}
    c.innerHTML='';
    snap.forEach(doc => {
      const u=doc.data(), isA=u.role==='admin';
      c.innerHTML += `<div class="ur">
        <div><p class="font-semibold text-sm">${u.displayName||'No name'}</p><p class="text-neutral-500 text-xs">${u.email}</p></div>
        <span class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${isA?'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20':'bg-white/5 text-neutral-500 border border-white/10'}">${u.role||'viewer'}${u.email===ADMIN_EMAIL?' (owner)':''}</span>
        <button onclick="toggleRole('${doc.id}','${u.role||'viewer'}')" class="px-3 py-1.5 rounded-lg border ${isA?'border-red-500/20 text-red-400 hover:bg-red-500/10':'border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/10'} text-xs font-bold uppercase tracking-wider transition-all" ${u.email===ADMIN_EMAIL?'disabled title="Cannot demote owner"':''}>${isA?'Remove Admin':'Make Admin'}</button>
      </div>`;
    });
  }).catch(() => { document.getElementById('users-list').innerHTML='<p class="text-neutral-600 text-center py-10">Could not load users.</p>'; });
}

function toggleRole(uid, cur) {
  const next = cur==='admin'?'viewer':'admin';
  if(!confirm(`Change to ${next}?`)) return;
  db.collection('users').doc(uid).update({role:next})
    .then(() => { showToast('Updated','success'); loadUsers(); })
    .catch(e => showToast('Error: '+e.message,'error'));
}