let messages = [];
let unsubMessages = null;

window.addEventListener('authStateChanged', () => {
  if (window.currentRole === 'admin') {
    document.getElementById('messages-content').classList.remove('hidden');
    document.getElementById('access-denied').classList.add('hidden');
    startListening();
  } else {
    document.getElementById('messages-content').classList.add('hidden');
    document.getElementById('access-denied').classList.remove('hidden');
    if (unsubMessages) { unsubMessages(); unsubMessages = null; }
  }
});

function startListening() {
  if (unsubMessages) unsubMessages();
  unsubMessages = db.collection('messages').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderMessages();
    updateUnreadCount();
  });
}

function renderMessages() {
  const container = document.getElementById('messages-list');
  if (messages.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20">
        <i data-lucide="inbox" class="w-16 h-16 text-neutral-700 mx-auto mb-4"></i>
        <p class="text-neutral-500 text-lg">No messages yet</p>
        <p class="text-neutral-600 text-sm mt-1">Messages from the contact form will appear here</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  container.innerHTML = messages.map(m => {
    const time = m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';
    return `
    <div class="msg-card ${m.read ? '' : 'msg-unread'} glow-border p-6 mb-4" data-id="${m.id}">
      <div class="flex items-start justify-between gap-4 mb-3">
        <div class="flex items-center gap-3">
          ${!m.read ? '<div class="unread-dot"></div>' : '<div class="w-2"></div>'}
          <div>
            <h4 class="font-bold text-white">${m.name || 'Anonymous'}</h4>
            <p class="text-neutral-500 text-xs">${m.email || ''} · ${m.projectType || 'General'}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-neutral-600 text-xs">${time}</span>
          <button onclick="toggleRead('${m.id}', ${!m.read})" class="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-neutral-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all" title="${m.read ? 'Mark unread' : 'Mark read'}">
            <i data-lucide="${m.read ? 'mail-open' : 'mail'}" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteMessage('${m.id}')" class="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:border-red-500/30 transition-all" title="Delete">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
      <p class="text-neutral-400 text-sm leading-relaxed pl-5">${m.message || ''}</p>
    </div>`;
  }).join('');
  lucide.createIcons();
}

function updateUnreadCount() {
  const count = messages.filter(m => !m.read).length;
  const badge = document.getElementById('unread-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function toggleRead(id, readState) {
  db.collection('messages').doc(id).update({ read: readState }).catch(e => showToast('Error: ' + e.message, 'error'));
}

function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  db.collection('messages').doc(id).delete().catch(e => showToast('Error: ' + e.message, 'error'));
}

function markAllRead() {
  const unread = messages.filter(m => !m.read);
  if (unread.length === 0) return;
  const batch = db.batch();
  unread.forEach(m => batch.update(db.collection('messages').doc(m.id), { read: true }));
  batch.commit().then(() => showToast('All marked as read', 'success')).catch(e => showToast('Error: ' + e.message, 'error'));
}