// Loads site settings from Firestore + live project count
(function applySiteData() {
  if (window.__firebaseNotConfigured) return;

  // ---- SETTINGS ----
  db.collection('settings').doc('site').get().then(doc => {
    if (!doc.exists) {
      // Create default settings on first visit
      db.collection('settings').doc('site').set({
        siteName: 'NEXUS',
        hero: {
          badge: 'AI-Powered Portfolio',
          line1: 'I Build',
          line2: 'Digital',
          line3: 'Experiences',
          subtitle: 'Web developer crafting intelligent, immersive websites that push the boundaries of what\'s possible on the web.'
        },
        about: {
          bio1: 'I\'m a passionate web developer who merges cutting-edge AI technology with beautiful, functional design. Every project I create is an exploration of what happens when creativity meets intelligent code.',
          bio2: 'From responsive interfaces to complex interactive experiences, I build websites that don\'t just look stunning — they think, adapt, and evolve.',
          statClients: 0,
          statYears: 0
        },
        skills: [
          { title: 'Frontend', desc: 'React, Next.js, Vue, Tailwind CSS, TypeScript', percentage: 95 },
          { title: 'Backend', desc: 'Node.js, Python, PostgreSQL, MongoDB, REST APIs', percentage: 85 },
          { title: 'AI / ML', desc: 'OpenAI, TensorFlow, LangChain, RAG, Embeddings', percentage: 80 },
          { title: 'Design', desc: 'Figma, Adobe Suite, Framer, Motion Design', percentage: 90 }
        ],
        social: { github: '#', twitter: '#', linkedin: '#', dribbble: '#' },
        contact: { email: 'hello@nexusdev.com', location: 'San Francisco, CA', availability: 'Open for freelance projects' }
      }).catch(() => {});
      return;
    }
    const s = doc.data();

    if (s.siteName) document.querySelectorAll('.site-name').forEach(el => el.textContent = s.siteName);

    if (s.hero) {
      if (s.hero.badge) document.querySelectorAll('.hero-badge').forEach(el => el.textContent = s.hero.badge);
      if (s.hero.line1) { const el = document.getElementById('hero-line-1'); if(el) el.textContent = s.hero.line1; }
      if (s.hero.line2) { const el = document.getElementById('hero-line-2'); if(el) el.textContent = s.hero.line2; }
      if (s.hero.line3) { const el = document.getElementById('hero-line-3'); if(el) { const cursor = el.querySelector('.cursor'); el.textContent = s.hero.line3; if(cursor) el.appendChild(cursor); } }
      if (s.hero.subtitle) { const el = document.getElementById('hero-subtitle'); if(el) el.textContent = s.hero.subtitle; }
    }

    if (s.about) {
      if (s.about.bio1) { const el = document.getElementById('about-bio-1'); if(el) el.textContent = s.about.bio1; }
      if (s.about.bio2) { const el = document.getElementById('about-bio-2'); if(el) el.textContent = s.about.bio2; }
      // Clients and years from settings
      if (s.about.statClients !== undefined) { const el = document.getElementById('stat-clients'); if(el){el.dataset.target=s.about.statClients;el.textContent=s.about.statClients+'+';} }
      if (s.about.statYears !== undefined) { const el = document.getElementById('stat-years'); if(el){el.dataset.target=s.about.statYears;el.textContent=s.about.statYears+'+';} }
    }

    if (s.skills && s.skills.length >= 4) {
      for (let i = 0; i < 4; i++) {
        const sk = s.skills[i]; const card = document.getElementById(`skill-card-${i}`); if(!card||!sk) continue;
        const t = card.querySelector('.skill-title'); if(t) t.textContent = sk.title;
        const d = card.querySelector('.skill-desc'); if(d) d.textContent = sk.desc;
        const b = card.querySelector('.skill-bar'); if(b) { b.dataset.width = sk.percentage+'%'; b.style.width = sk.percentage+'%'; }
      }
    }

    if (s.social) {
      document.querySelectorAll('.social-github').forEach(el => el.href = s.social.github || '#');
      document.querySelectorAll('.social-twitter').forEach(el => el.href = s.social.twitter || '#');
      document.querySelectorAll('.social-linkedin').forEach(el => el.href = s.social.linkedin || '#');
      document.querySelectorAll('.social-dribbble').forEach(el => el.href = s.social.dribbble || '#');
    }

    if (s.contact) {
      if (s.contact.email) { const el = document.getElementById('contact-email-display'); if(el) el.textContent = s.contact.email; }
      if (s.contact.location) { const el = document.getElementById('contact-location'); if(el) el.textContent = s.contact.location; }
      if (s.contact.availability) { const el = document.getElementById('contact-availability'); if(el) el.textContent = s.contact.availability; }
    }
  }).catch(err => console.log('Settings:', err.message));

  // ---- LIVE PROJECT COUNT ----
  // This updates the Projects counter on the About page in real-time
  function updateProjectCount() {
    db.collection('projects').get().then(snap => {
      const count = snap.size;
      const el = document.getElementById('stat-projects');
      if (el) {
        el.dataset.target = count;
        el.textContent = count + '+';
      }
      // Also update the hero badge or any other live count elements
      document.querySelectorAll('.live-project-count').forEach(el => {
        el.textContent = count;
      });
    }).catch(() => {});
  }

  // Run once immediately
  updateProjectCount();

  // Listen for real-time changes (project added/deleted)
  db.collection('projects').onSnapshot(() => {
    updateProjectCount();
  }, () => {});
})();