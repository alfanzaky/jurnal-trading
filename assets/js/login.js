document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageEl = document.getElementById('authMessage');

  // Cegah user login ulang
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      window.location.replace(`${window.location.origin}${getBasePath()}/pages/dashboard.html`);
    }
  });

  // Helper: Tampilkan pesan alert
  const showMessage = (msg, type = 'danger') => {
    messageEl.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
    messageEl.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => (messageEl.innerHTML = ""), 5000);
  };

  // Helper: loading indikator
  const setLoading = (form, loading) => {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerHTML;
    btn.disabled = loading;
    btn.innerHTML = loading ? 'Memproses...' : btn.dataset.originalText;
  };

  // Helper: base path dinamis (khusus GitHub Pages)
  const getBasePath = () => {
    const path = window.location.pathname.split('/');
    return '/' + (path[1] || '');
  };

  // 🔐 Login Handler
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
      console.error("Login gagal:", err);
      showMessage("❌ " + cleanFirebaseError(err.message));
    } finally {
      setLoading(loginForm, false);
    }
  });

  // 📝 Register Handler
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('namaLengkap').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const konfirmasi = document.getElementById('konfirmasiPassword').value;
    const tipe = document.getElementById('tipeTrader').value;
    const tujuan = document.getElementById('tujuanTrading').value.trim();
    const setuju = document.getElementById('setujuSK').checked;

    // Validasi
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
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await firebase.firestore().collection("users").doc(user.uid).set({
        nama,
        email,
        tipeTrader: tipe,
        tujuanTrading: tujuan,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showMessage("✅ Registrasi berhasil! Silakan login.", "success");

      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
      registerForm.reset();
    } catch (err) {
      console.error("Registrasi gagal:", err);
      showMessage("❌ " + cleanFirebaseError(err.message));
    } finally {
      setLoading(registerForm, false);
    }
  });

  // Helper: Validasi email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Helper: Bersihkan pesan error Firebase
  const cleanFirebaseError = (msg) => {
    if (msg.includes("auth/email-already-in-use")) return "Email sudah digunakan.";
    if (msg.includes("auth/invalid-email")) return "Email tidak valid.";
    if (msg.includes("auth/weak-password")) return "Password minimal 6 karakter.";
    if (msg.includes("auth/user-not-found")) return "Akun tidak ditemukan.";
    if (msg.includes("auth/wrong-password")) return "Password salah.";
    return msg;
  };
});
