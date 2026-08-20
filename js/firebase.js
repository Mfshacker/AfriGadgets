// AfriGadgets Firebase Configuration

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getStorage
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// YOUR FIREBASE CONFIGURATION

const firebaseConfig = {
  apiKey: "AIzaSyBw9bkRahFznCQtcVqHdhqyrYHQz5U-4uE",
  authDomain: "afrigadgets-9dbfa.firebaseapp.com",
  databaseURL: "https://afrigadgets-9dbfa-default-rtdb.firebaseio.com",
  projectId: "afrigadgets-9dbfa",
  storageBucket: "afrigadgets-9dbfa.firebasestorage.app",
  messagingSenderId: "479729916750",
  appId: "1:479729916750:web:215938a5de58024f869c1f",
  measurementId: "G-RKCHV1SHXP"
};


// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);


// SERVICES

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);


// EXPORT SERVICES

export {
    app,
    db,
    auth,
    storage
};
