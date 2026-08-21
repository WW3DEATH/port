let projects = [];
let currentFilter = 'all';
let uploadedImageData = null;

// Listen for auth changes to show/hide upload
window.addEventListener('authStateChanged', () => renderProjects());

// Real-time listener for projects
db.collection('projects').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
  projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProjects();
}, err => {
  console.warn('Firestore projects listener error:', err);
  // Fallback: show empty or static
  if (projects.length === 0) renderProjects();
});

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  const emptyState = document.getElementById('empty-state');
  const uploadBtn = document.getElementById('admin-upload-btn');
  const filtered = currentFilter === 'all' ? projects : projects.filter(p => p.category === currentFilter);

  // Show/hide upload button based on role
  if (uploadBtn) {
    uploadBtn.style.display = window.currentRole === 'admin' ? 'flex' : 'none';
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map((p, i) => `
    <div class="reveal-scale stagger-${(i % 6) + 1} glow-border card-hover cursor-pointer group" onclick="openDetailModal('${p.id}')">
      <div class="relative h-52 overflow-hidden rounded-t-[1.4rem]">
        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onerror="this.src='https://picsum.photos/seed/fallback-${p.id}/800/600.jpg'">
        <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="absolute top-3 right-3 w-8 h-8 rounded-lg bg-dark-900/60 backdrop-blur border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <i data-lucide="arrow-up-right" class="w-4 h-4 text-neon-cyan"></i>
        </div>
      </div>
      <div class="p-5">
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${(p.tags || []).slice(0, 3).map(t => `<span class="px-2 py-0.5 rounded-md bg-neon-cyan/5 text-neon-cyan text-[10px] font-bold uppercase tracking-wider">${t}</span>`).join('')}
        </div>
        <h3 class="font-display text-xl font-bold uppercase tracking-tight mb-1 group-hover:text-neon-cyan transition-colors duration-300">${p.name}</h3>
        <p class="text-neutral-500 text-sm line-clamp-2 leading-relaxed">${p.description || ''}</p>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
  grid.querySelectorAll('.reveal-scale').forEach(el => { el.classList.add('active'); });
}

function filterProjects(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === cat);
  });
  renderProjects();
}

// Upload modal
function openUploadModal() {
  if (window.currentRole !== 'admin') { showToast('Admin access required', 'error'); return; }
  document.getElementById('upload-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}
function closeUploadModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('upload-modal').classList.remove('open');
  document.body.style.overflow = '';
  resetUploadForm();
}
function resetUploadForm() {
  document.getElementById('upload-form').reset();
  document.getElementById('drop-content').classList.remove('hidden');
  document.getElementById('preview-content').classList.add('hidden');
  uploadedImageData = null;
}

function handleFileSelect(e) { const f = e.target.files[0]; if (f) processFile(f); }
function processFile(file) {
  if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
  if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    uploadedImageData = e.target.result;
    document.getElementById('image-preview').src = uploadedImageData;
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('drop-content').classList.add('hidden');
    document.getElementById('preview-content').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

const dropZone = document.getElementById('drop-zone');
if (dropZone) {
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'rgba(0,240,255,0.5)'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
  dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.style.borderColor = ''; const f = e.dataTransfer.files[0]; if (f) processFile(f); });
}

function handleUpload(e) {
  e.preventDefault();
  const btn = document.getElementById('upload-submit-btn');
  btn.innerHTML = '<svg class="spin w-5 h-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg> Publishing...';
  btn.disabled = true;

  const name = document.getElementById('proj-name').value.trim();
  const category = document.getElementById('proj-category').value;
  const desc = document.getElementById('proj-desc').value.trim();
  const tagsRaw = document.getElementById('proj-tags').value.trim();
  const url = document.getElementById('proj-url').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : ['Web Dev'];
  const image = uploadedImageData || `https://picsum.photos/seed/${name.replace(/\s/g,'-').toLowerCase()}-${Date.now()}/800/600.jpg`;

  db.collection('projects').add({
    name, category, description: desc, tags, image, url: url || '#',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    renderProjects();
    closeUploadModal();
    showToast(`"${name}" published!`, 'success');
  }).catch(err => {
    showToast('Failed to publish: ' + err.message, 'error');
  }).finally(() => {
    btn.innerHTML = '<i data-lucide="rocket" class="w-4 h-4"></i> Publish Project';
    btn.disabled = false;
    lucide.createIcons();
  });
}

// Detail modal
function openDetailModal(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById('detail-image').src = p.image;
  document.getElementById('detail-title').textContent = p.name;
  document.getElementById('detail-desc').textContent = p.description || '';
  document.getElementById('detail-link').href = p.url || '#';
  document.getElementById('detail-tags').innerHTML = (p.tags || []).map(t =>
    `<span class="px-3 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-xs font-bold uppercase tracking-wider">${t}</span>`
  ).join('');

  const deleteBtn = document.getElementById('detail-delete-btn');
  if (window.currentRole === 'admin') {
    deleteBtn.style.display = 'inline-flex';
    deleteBtn.onclick = () => {
      db.collection('projects').doc(id).delete().then(() => {
        projects = projects.filter(x => x.id !== id);
        renderProjects();
        closeDetailModal();
        showToast(`"${p.name}" deleted`, 'info');
      });
    };
  } else {
    deleteBtn.style.display = 'none';
  }

  document.getElementById('detail-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}
function closeDetailModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('detail-modal').classList.remove('open');
  document.body.style.overflow = '';
}

// Init
filterProjects('all');