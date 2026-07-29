// ===== FIREBASE CONFIG =====
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore,
  collection, addDoc, getDocs, doc, updateDoc,
  deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwHvp9_-sCInstS5IwG2MB91Jnrw151rs",
  authDomain: "barberelite-508f3.firebaseapp.com",
  projectId: "barberelite-508f3",
  storageBucket: "barberelite-508f3.firebasestorage.app",
  messagingSenderId: "462591045276",
  appId: "1:462591045276:web:f2e4379cca83aa95210759"
};

// Evită inițializarea dublă dacă auth.js a inițializat deja app-ul
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

export { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp };
