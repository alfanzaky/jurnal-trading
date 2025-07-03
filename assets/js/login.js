// ===========================
// 🔧 Helper Functions
// ===========================

// Validasi email format
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Konversi pesan error Firebase agar ramah
const cleanFirebaseError = (msg) => {
  if (msg.includes("email-already-in-use")) return "Email sudah digunakan.";
  if (msg.includes("weak-password")) return "Password terlalu lemah (minimal 6 karakter).";
  if (msg.includes("invalid-email")) return "Format email tidak valid.";
  if (msg.includes("missing-email")) return "Email wajib diisi.";
  if (msg.includes("wrong-password")) return "Password salah.";
  if (msg.includes("user-not-found")) return "Akun tidak ditemukan.";
  return msg;
};

// Tampilkan pesan alert
const showMessage = (msg, type = 'danger') => {
  const messageEl = document.getElementById('authMessage');
  if (!messageEl) return;
  messageEl.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
  setTimeout(() => (messageEl.innerHTML = ""), 4000);
};

// Loading state pada tombol
const setLoading = (form, loading) => {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn.dataset.originalText) {
    btn.dataset.originalText = btn.innerHTML;
  }
  btn.disabled = loading;
  btn.innerHTML = loading ? 'Memproses...' : btn.dataset.originalText;
};

// Ambil base path (misal: /jurnal-trading)
const getBasePath = () => {
  const path = window.location.pathname.split('/');
  return '/' + (path[1] || '');
};

// ===========================
// 🚀 Main Logic
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // 🚫 Jika user sudah login, jangan izinkan buka login.html
  firebase.auth().onAuthStateChanged((user) => {
    const isLoginPage = location.pathname.includes("login.html");
    if (user && isLoginPage) {
      window.location.replace(`${window.location.origin}${getBasePath()}/pages/dashboard.html`);
    }
  });

  // ====================
  // 🔐 LOGIN
  // ====================
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) return showMessage("Email dan password wajib diisi.");

    setLoading(loginForm, true);

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      window.location.href = `${window.location.origin}${getBasePath()}/pages/dashboard.html`;
    } catch (err) {
      showMessage("❌ " + cleanFirebaseError(err.message));
    } finally {
      setLoading(loginForm, false);
    }
  });

  // ====================
  // 📝 REGISTER
  // ====================
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('namaLengkap').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const konfirmasi = document.getElementById('konfirmasiPassword').value;
    const tipe = document.getElementById('tipeTrader').value;
    const tujuan = document.getElementById('tujuanTrading').value.trim();
    const setuju = document.getElementById('setujuSK').checked;

    // Validasi input
    if (!nama || !email || !password || !konfirmasi || !tipe || !tujuan)
      return showMessage("⚠️ Semua field wajib diisi.");

    if (!validateEmail(email))
      return showMessage("📧 Format email tidak valid.");

    if (password !== konfirmasi)
      return showMessage("❌ Password dan konfirmasi tidak cocok.");

    if (!setuju)
      return showMessage("❗ Anda harus menyetujui Syarat & Ketentuan.");

    setLoading(registerForm, true);

    try {
      // 🔐 Buat akun di Firebase Auth
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // ✅ Simpan data tambahan ke Firestore
      await firebase.firestore().collection("users").doc(user.uid).set({
        nama,
        email,
        tipeTrader: tipe,
        tujuanTrading: tujuan,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 🚪 Logout supaya user harus login manual
      await firebase.auth().signOut();

      // Tampilkan sukses
      showMessage("✅ Registrasi berhasil! Silakan login.", "success");

      // Pindah ke tab login
      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
      registerForm.reset();

    } catch (err) {
      console.error("❌ Gagal registrasi:", err);
      showMessage("❌ " + cleanFirebaseError(err.message));
    } finally {
      setLoading(registerForm, false);
    }
  });
});
