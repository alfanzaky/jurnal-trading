document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageEl = document.getElementById('authMessage');

  // Cegah user yang sudah login balik ke login.html
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      window.location.replace(`${window.location.origin}${getBasePath()}/pages/dashboard.html`);
    }
  });

  // Helper: tampilkan pesan alert
  const showMessage = (msg, type = 'danger') => {
    messageEl.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
    setTimeout(() => (messageEl.innerHTML = ""), 4000);
  };

  // Helper: loading indicator pada tombol
  const setLoading = (form, loading) => {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.innerHTML;
    }
    btn.disabled = loading;
    btn.innerHTML = loading ? 'Memproses...' : btn.dataset.originalText;
  };

  // Helper: base path dinamis
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
      showMessage(err.message);
    } finally {
      setLoading(loginForm, false);
    }
  });

  // 📝 Register Handler
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ambil semua input
    const nama = document.getElementById('namaLengkap').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const konfirmasi = document.getElementById('konfirmasiPassword').value;
    const tipe = document.getElementById('tipeTrader').value;
    const tujuan = document.getElementById('tujuanTrading').value.trim();
    const setuju = document.getElementById('setujuSK').checked;

    // Validasi form
    if (!nama || !email || !password || !konfirmasi || !tipe || !tujuan)
      return showMessage("⚠️ Semua field wajib diisi.");

    if (password !== konfirmasi)
      return showMessage("❌ Password dan konfirmasi tidak cocok.");

    if (!setuju)
      return showMessage("❗ Anda harus menyetujui Syarat & Ketentuan.");

    setLoading(registerForm, true);

    try {
      // Buat akun di Firebase Auth
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Simpan info tambahan ke Firestore
      await firebase.firestore().collection("users").doc(user.uid).set({
        nama,
        email,
        tipeTrader: tipe,
        tujuanTrading: tujuan,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showMessage("✅ Registrasi berhasil! Silakan login.", "success");

      // Pindah ke tab login
      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
      registerForm.reset();
    } catch (err) {
      showMessage(err.message);
    } finally {
      setLoading(registerForm, false);
    }
  });
});
