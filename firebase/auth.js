// Pastikan Firebase Auth sudah dimuat via CDN sebelum ini
// Firebase SDK harus sudah di-initialize di firebase-config.js

firebase.auth().onAuthStateChanged((user) => {
  const isAuthPage = location.pathname.endsWith("index.html") || location.pathname === "/jurnal-trading/";

  if (!user && !isAuthPage) {
    // Jika user tidak login dan bukan di halaman index → redirect
    window.location.href = "/jurnal-trading/index.html";
  }

  // (Opsional) kalau kamu mau redirect user yg sudah login dari index ke dashboard
  if (user && isAuthPage) {
    window.location.href = "/jurnal-trading/dashboard.html";
  }
});
