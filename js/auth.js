// ===== AUTH.JS - Gestionare conturi cu localStorage =====

const USERS_KEY = 'frizerie_users';
const SESSION_KEY = 'frizerie_session';

// --- Utilitar: citire/scriere utilizatori ---
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// --- Înregistrare ---
function register(nume, email, telefon, parola) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Acest email este deja înregistrat.' };
  }
  const user = { id: Date.now(), nume, email, telefon, parola };
  users.push(user);
  saveUsers(users);
  return { success: true, message: 'Cont creat cu succes!' };
}

// --- Login ---
function login(email, parola) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.parola === parola);
  if (!user) {
    return { success: false, message: 'Email sau parolă incorectă.' };
  }
  setSession(user);
  return { success: true, user };
}

// --- Recuperare parolă ---
function recoverPassword(email, telefon) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.telefon === telefon);
  if (!user) {
    return { success: false, message: 'Nu am găsit niciun cont cu aceste date.' };
  }
  return { success: true, parola: user.parola, nume: user.nume };
}

// --- Logout ---
function logout() {
  clearSession();
  window.location.href = 'index.html';
}

// --- Actualizare navbar în funcție de sesiune ---
const ADMIN_EMAILS = [
  'petrunicuta8@gmail.com',  // Lucii
  'barberelitero@gmail.com'  // Denis
];

function updateNavbar() {
  const session = getSession();
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  if (session) {
    const isAdmin = ADMIN_EMAILS.includes(session.email);
    navAuth.innerHTML = `
      ${isAdmin ? '<a href="admin.html" class="btn btn-gold" style="font-size:0.82rem;padding:8px 16px;">🛡 Conectare Admin</a>' : ''}
      <span id="nav-user-info">✂ Bun venit, ${session.nume.split(' ')[0]}!</span>
      <button class="btn btn-danger" onclick="logout()" style="padding:8px 18px;font-size:0.85rem;">Deconectare</button>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="btn btn-outline">Conectare</a>
      <a href="register.html" class="btn btn-gold">Înregistrare</a>
    `;
  }
}

// Apelat automat la încărcarea oricărei pagini
document.addEventListener('DOMContentLoaded', function() {
  updateNavbar();
});

// ===== MENIU HAMBURGER MOBIL =====
function openMobileMenu() {
  // Șterge meniul vechi dacă există
  const old = document.getElementById('mobile-menu');
  if (old) old.remove();

  const session = getSession();
  const ADMIN_EMAILS = [
    'petrunicuta8@gmail.com',
    'barberelitero@gmail.com'
  ];

  const menu = document.createElement('div');
  menu.id = 'mobile-menu';
  menu.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.97);
    z-index: 9999; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
  `;

  let html = `<span onclick="closeMobileMenu()" style="position:absolute;top:20px;right:24px;font-size:2rem;color:#999;cursor:pointer;line-height:1;">✕</span>`;

  html += `<a href="index.html" onclick="closeMobileMenu()" style="color:white;font-size:1.3rem;font-weight:600;padding:12px 40px;border-radius:10px;text-decoration:none;width:260px;text-align:center;">Acasă</a>`;
  html += `<a href="contact.html" onclick="closeMobileMenu()" style="color:white;font-size:1.3rem;font-weight:600;padding:12px 40px;border-radius:10px;text-decoration:none;width:260px;text-align:center;">Contact</a>`;
  html += `<div style="width:60px;height:1px;background:#2a2a2a;margin:8px 0;"></div>`;

  if (session) {
    html += `<div style="color:#c9a84c;font-size:1rem;margin-bottom:5px;">✂ Bun venit, ${session.nume.split(' ')[0]}!</div>`;
    if (ADMIN_EMAILS.includes(session.email)) {
      html += `<a href="admin.html" onclick="closeMobileMenu()" style="background:linear-gradient(135deg,#c9a84c,#e8c96a);color:#0f0f0f;font-size:1rem;font-weight:700;padding:13px 40px;border-radius:10px;text-decoration:none;width:260px;text-align:center;">🛡 Panou Admin</a>`;
    }
    html += `<a href="cont.html" onclick="closeMobileMenu()" style="border:2px solid #c9a84c;color:#c9a84c;font-size:1rem;font-weight:600;padding:12px 40px;border-radius:10px;text-decoration:none;width:260px;text-align:center;">Contul meu</a>`;
    html += `<button onclick="closeMobileMenu();logout()" style="background:#e05c5c;color:white;font-size:1rem;font-weight:600;padding:13px 40px;border-radius:10px;border:none;cursor:pointer;width:260px;">Deconectare</button>`;
  } else {
    html += `<a href="login.html" onclick="closeMobileMenu()" style="border:2px solid #c9a84c;color:#c9a84c;font-size:1rem;font-weight:600;padding:12px 40px;border-radius:10px;text-decoration:none;width:260px;text-align:center;">Conectare</a>`;
    html += `<a href="register.html" onclick="closeMobileMenu()" style="background:linear-gradient(135deg,#c9a84c,#e8c96a);color:#0f0f0f;font-size:1rem;font-weight:700;padding:13px 40px;border-radius:10px;text-decoration:none;width:260px;text-align:center;">Înregistrare</a>`;
  }

  menu.innerHTML = html;
  document.body.appendChild(menu);
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.remove();
  document.body.style.overflow = '';
}
