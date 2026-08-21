const ADMIN_EMAIL = "mnmjaasim@gmail.com";
const ADMIN_PASSWORD = "jaasim2010";

const firebaseConfig = {
  apiKey: "AIzaSyCQfez99YicEihjHJc1SSatxHtRQSeKAUY",
  authDomain: "marketspot-e44b4.firebaseapp.com",
  databaseURL: "https://marketspot-e44b4-default-rtdb.firebaseio.com",
  projectId: "marketspot-e44b4",
  storageBucket: "marketspot-e44b4.firebasestorage.app",
  messagingSenderId: "775423662696",
  appId: "1:775423662696:web:a6050d49843b0563bdf9dd",
  measurementId: "G-H0P21TSB1X"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
try { db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch(e) {}
window.__firebaseNotConfigured = false;
window.currentUser = null;
window.currentRole = null;

// Auto-create admin account on first visit
(async function ensureAdmin() {
  try {
    const cred = await auth.signInWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    await db.collection('users').doc(cred.user.uid).set({
      email: ADMIN_EMAIL, displayName: 'Admin', role: 'admin',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    await auth.signOut();
  } catch(e) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      try {
        const cred = await auth.createUserWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        await db.collection('users').doc(cred.user.uid).set({
          email: ADMIN_EMAIL, displayName: 'Admin', role: 'admin',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await auth.signOut();
      } catch(e2) {}
    }
  }
})();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    window.currentUser = user;
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) { window.currentRole = doc.data().role || 'viewer'; }
      else {
        const role = user.email === ADMIN_EMAIL ? 'admin' : 'viewer';
        await db.collection('users').doc(user.uid).set({
          email: user.email, displayName: user.displayName || user.email.split('@')[0],
          role, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        window.currentRole = role;
      }
      if (user.email === ADMIN_EMAIL && window.currentRole !== 'admin') {
        await db.collection('users').doc(user.uid).update({ role: 'admin' });
        window.currentRole = 'admin';
      }
    } catch(e) { window.currentRole = 'viewer'; }
  } else { window.currentUser = null; window.currentRole = null; }
  window.dispatchEvent(new CustomEvent('authStateChanged'));
  if (typeof updateNavbarAuth === 'function') updateNavbarAuth();
});