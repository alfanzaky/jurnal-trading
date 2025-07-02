// firebase-config.js
// Inisialisasi Firebase (versi CDN compat)

const firebaseConfig = {
  apiKey: "AIzaSyCcQje0oKoEqbztU0g-idfZDyl-FUswfPw",
  authDomain: "jurnal-trading-9b7e0.firebaseapp.com",
  projectId: "jurnal-trading-9b7e0",
  storageBucket: "jurnal-trading-9b7e0.appspot.com", // <- fix ".app" jadi ".appspot.com"
  messagingSenderId: "193534080001",
  appId: "1:193534080001:web:65e3fcc1379840253bfc00"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Ekspor instance auth & firestore
const auth = firebase.auth();
const db = firebase.firestore();
