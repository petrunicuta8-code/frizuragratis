// ===== AUTH.JS - Firebase Authentication cu persistență permanentă =====

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwHvp9_-sCInstS5IwG2MB91Jnrw151rs",
  authDomain: "barberelite-508f3.firebaseapp.com",
  projectId: "barberelite-508f3",
  storageBucket: "barberelite-508f3.firebasestorage.app",
  messagingSenderId: "462591045276",
  appId: "1:462591045276:web:f2e4379cca83aa95210759"
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ===== PERSISTENȚĂ PERMANENTĂ =====
// Utilizatorul rămâne logat mereu, chiar și după închiderea browserului
setPersistence(auth, browserLocalPersistence);

const ADMIN_EMAILS = [
  'petrunicuta8@gmail.com',
  'barberelitero@gmail.com'
];

// ===== ÎNREGISTRARE =====
async function register(nume, email, telefon, parola) {
  try {
    // Creează contul în Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, parola);
    const user = userCredential.user;

    // Setează numele în profilul Firebase Auth
    await updateProfile(user, { displayName: nume });

    // Salvează datele extra (nume, telefon) în Firestore
    await setDoc(doc(db, 'utilizatori', user.uid), {
      uid: user.uid,
      nume,
      email,
      telefon,
      creatLa: new Date().toISOString()
    });

    return { success: true, message: 'Cont creat cu succes!' };
  } catch (e) {
    let msg = 'Eroare la înregistrare.';
    if (e.code === 'auth/email-already-in-use') msg = 'Acest email este deja înregistrat.';
    else if (e.code === 'auth/weak-password')   msg = 'Parola trebuie să aibă minim 6 caractere.';
    else if (e.code === 'auth/invalid-email')   msg = 'Adresă de email invalidă.';
    return { success: false, message: msg };
  }
}

// ===== LOGIN =====
async function login(email, parola) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, parola);
    const user = userCredential.user;

    // Ia datele extra din Firestore
    const snap = await getDoc(doc(db, 'utilizatori', user.uid));
    const extra = snap.exists() ? snap.data() : {};

    const userData = {
      uid: user.uid,
      email: user.email,
      nume: extra.nume || user.displayName || email.split('@')[0],
      telefon: extra.telefon || '—'
    };

    return { success: true, user: userData };
  } catch (e) {
    let msg = 'Email sau parolă incorectă.';
    if (e.code === 'auth/user-not-found')   msg = 'Nu există niciun cont cu acest email.';
    else if (e.code === 'auth/wrong-password') msg = 'Parolă incorectă.';
    else if (e.code === 'auth/invalid-email')  msg = 'Adresă de email invalidă.';
    else if (e.code === 'auth/too-many-requests') msg = 'Prea multe încercări. Încearcă mai târziu.';
    return { success: false, message: msg };
  }
}

// ===== RECUPERARE PAROLĂ (trimite email de reset) =====
async function recoverPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (e) {
    let msg = 'Nu am găsit niciun cont cu acest email.';
    if (e.code === 'auth/invalid-email') msg = 'Adresă de email invalidă.';
    return { success: false, message: msg };
  }
}

// ===== LOGOUT =====
async function logout() {
  await signOut(auth);
  window.location.href = 'index.html';
}

// ===== GET SESSION (sincrona - din cache Firebase) =====
function getSession() {
  const user = auth.currentUser;
  if (!user) return null;
  return { uid: user.uid, email: user.email, nume: user.displayName || user.email.split('@')[0], telefon: '—' };
}

// ===== WAIT FOR AUTH (async - sigur) =====
function waitForAuth() {
  return new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (!user) { resolve(null); return; }
      const snap = await getDoc(doc(db, 'utilizatori', user.uid));
      const extra = snap.exists() ? snap.data() : {};
      resolve({
        uid: user.uid,
        email: user.email,
        nume: extra.nume || user.displayName || user.email.split('@')[0],
        telefon: extra.telefon || '—'
      });
    });
  });
}

// ===== NAVBAR =====
async function updateNavbar() {
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  const session = await waitForAuth();

  if (session) {
    const isAdmin = ADMIN_EMAILS.includes(session.email);
    navAuth.innerHTML = `
      ${isAdmin ? '<a href="admin.html" class="btn btn-gold" style="font-size:0.82rem;padding:8px 16px;">🛡 Admin</a>' : ''}
      <span style="color:var(--gold);font-weight:600;font-size:0.9rem;">✂ ${session.nume.split(' ')[0]}</span>
      <button class="btn btn-danger" onclick="logout()" style="padding:8px 18px;font-size:0.85rem;">Ieșire</button>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="btn btn-outline">Conectare</a>
      <a href="register.html" class="btn btn-gold">Înregistrare</a>
    `;
  }
}

// ===== HAMBURGER MOBIL =====
function openMobileMenu() {
  const old = document.getElementById('mobile-menu');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'mobile-menu';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: '#0f0f0f',
    zIndex: '999999',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    boxSizing: 'border-box'
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  Object.assign(closeBtn.style, {
    position: 'absolute', top: '20px', right: '24px',
    background: 'none', border: 'none', color: '#ffffff',
    fontSize: '2rem', cursor: 'pointer', lineHeight: '1', zIndex: '1'
  });
  closeBtn.onclick = closeMobileMenu;
  overlay.appendChild(closeBtn);

  const links = [
    { text: 'Acasă', href: 'index.html' },
    { text: 'Contact', href: 'contact.html' },
    { text: 'Galerie', href: 'galerie.html' },
  ];

  links.forEach(l => {
    const a = document.createElement('a');
    a.href = l.href;
    a.textContent = l.text;
    Object.assign(a.style, {
      display: 'block', color: '#ffffff', fontSize: '1.4rem',
      fontWeight: '700', padding: '12px 0', textDecoration: 'none',
      width: '260px', textAlign: 'center'
    });
    overlay.appendChild(a);
  });

  const line = document.createElement('div');
  Object.assign(line.style, {
    width: '80px', height: '2px', background: '#d32f2f',
    borderRadius: '2px', margin: '6px 0'
  });
  overlay.appendChild(line);

  const user = auth.currentUser;
  if (user) {
    if (ADMIN_EMAILS.includes(user.email)) {
      const adminA = document.createElement('a');
      adminA.href = 'admin.html';
      adminA.textContent = '🛡 Panou Admin';
      Object.assign(adminA.style, {
        display: 'block', background: '#d32f2f', color: '#ffffff',
        fontSize: '1rem', fontWeight: '700', padding: '13px 0',
        textDecoration: 'none', width: '260px', textAlign: 'center',
        borderRadius: '10px'
      });
      overlay.appendChild(adminA);
    }
    const contA = document.createElement('a');
    contA.href = 'cont.html';
    contA.textContent = 'Contul meu';
    Object.assign(contA.style, {
      display: 'block', border: '2px solid #d32f2f', color: '#d32f2f',
      fontSize: '1rem', fontWeight: '600', padding: '12px 0',
      textDecoration: 'none', width: '260px', textAlign: 'center',
      borderRadius: '10px', boxSizing: 'border-box'
    });
    overlay.appendChild(contA);

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Deconectare';
    Object.assign(logoutBtn.style, {
      display: 'block', background: '#e05c5c', color: 'white',
      fontSize: '1rem', fontWeight: '600', padding: '13px 0',
      width: '260px', textAlign: 'center', borderRadius: '10px',
      border: 'none', cursor: 'pointer'
    });
    logoutBtn.onclick = logout;
    overlay.appendChild(logoutBtn);
  } else {
    const loginA = document.createElement('a');
    loginA.href = 'login.html';
    loginA.textContent = 'Conectare';
    Object.assign(loginA.style, {
      display: 'block', border: '2px solid #d32f2f', color: '#d32f2f',
      fontSize: '1.1rem', fontWeight: '600', padding: '13px 0',
      textDecoration: 'none', width: '260px', textAlign: 'center',
      borderRadius: '10px', boxSizing: 'border-box'
    });
    overlay.appendChild(loginA);

    const regA = document.createElement('a');
    regA.href = 'register.html';
    regA.textContent = 'Înregistrare';
    Object.assign(regA.style, {
      display: 'block', background: '#d32f2f', color: '#ffffff',
      fontSize: '1.1rem', fontWeight: '700', padding: '13px 0',
      textDecoration: 'none', width: '260px', textAlign: 'center',
      borderRadius: '10px'
    });
    overlay.appendChild(regA);
  }

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.remove();
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', updateNavbar);

// ===== EXPORT GLOBAL =====
window.logout         = logout;
window.openMobileMenu = openMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.getSession     = getSession;
window.waitForAuth    = waitForAuth;
window.register       = register;
window.login          = login;
window.recoverPassword = recoverPassword;

export { register, login, logout, recoverPassword, getSession, waitForAuth };
