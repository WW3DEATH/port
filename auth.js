function openAuthModal(tab) {
  const m = document.getElementById('auth-modal');
  if (!m) { alert('Auth modal not found. Make sure you are on a page with the login system.'); return; }
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchAuthTab(tab || 'login');
  try { lucide.createIcons(); } catch(e) {}
}
function closeAuthModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const m = document.getElementById('auth-modal');
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  const f = document.getElementById('auth-form'); if (f) f.reset();
  const err = document.getElementById('auth-error'); if (err) err.textContent = '';
}
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active-tab'));
  document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active-tab');
  const loginFields = document.getElementById('auth-login-fields');
  const signupFields = document.getElementById('auth-signup-fields');
  if (loginFields) loginFields.classList.toggle('hidden', tab !== 'login');
  if (signupFields) signupFields.classList.toggle('hidden', tab !== 'signup');
  const err = document.getElementById('auth-error'); if (err) err.textContent = '';
  const btn = document.getElementById('auth-submit-btn');
  if (btn) btn.textContent = tab === 'login' ? 'Sign In' : 'Create Account';
}
function handleAuthSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById('auth-error');
  const btn = document.getElementById('auth-submit-btn');
  const isSignup = document.getElementById('auth-signup-fields') && !document.getElementById('auth-signup-fields').classList.contains('hidden');
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  btn.disabled = true;
  btn.innerHTML = '<svg class="spin" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/></svg>';

  if (!isSignup) {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => { closeAuthModal(); showToast('Welcome back!', 'success'); })
      .catch(err => { errEl.textContent = mapErr(err.code); })
      .finally(() => { btn.disabled = false; btn.textContent = 'Sign In'; });
  } else {
    const name = document.getElementById('auth-name').value.trim();
    if (!name) { errEl.textContent = 'Name is required'; btn.disabled = false; btn.innerHTML = 'Create Account'; return; }
    auth.createUserWithEmailAndPassword(email, password)
      .then(cred => {
        return db.collection('users').doc(cred.user.uid).set({
          email, displayName: name,
          role: email === ADMIN_EMAIL ? 'admin' : 'viewer',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => { closeAuthModal(); showToast('Account created!', 'success'); });
      })
      .catch(err => { errEl.textContent = mapErr(err.code); })
      .finally(() => { btn.disabled = false; btn.innerHTML = 'Create Account'; });
  }
}
function mapErr(code) {
  const m = {'auth/email-already-in-use':'Email already registered','auth/invalid-email':'Invalid email','auth/weak-password':'Password must be at least 6 characters','auth/user-not-found':'No account with this email','auth/wrong-password':'Incorrect password','auth/invalid-credential':'Invalid email or password','auth/too-many-requests':'Too many attempts. Try again later.'};
  return m[code] || 'Something went wrong';
}