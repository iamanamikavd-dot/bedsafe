// js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxWr0n1fWltP4vJN0O7bT66pEbq2nle9c",
  authDomain: "bedsafe-a2e0b.firebaseapp.com",
  databaseURL: "https://bedsafe-a2e0b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bedsafe-a2e0b",
  storageBucket: "bedsafe-a2e0b.firebasestorage.app",
  messagingSenderId: "630412443548",
  appId: "1:630412443548:web:fda60588ba5e2d91359259",
  measurementId: "G-TSYHVSLR1E"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };