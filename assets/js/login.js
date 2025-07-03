document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageEl = document.getElementById('authMessage');

  // Helper: validasi email
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Helper: tampilkan pesan alert
  const showMessage = (msg, type = 'danger') => {
    messageEl.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
    setTimeout(() => (messageEl.innerHTML = ""), 4000);
  };

  // Helper: loading button
  const setLoading = (form, loading) => {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerHTML;
    btn.disabled = loading;
    btn.innerHTML = loading ? 'Memproses...' : btn.dataset.originalText;
  };

  // ✅ LOGIN
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) return showMessage("Email dan password wajib diisi.");
    setLoading(loginForm, true);

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      window.location.href = "/jurnal-trading/pages/dashboard.html";
    } catch (err) {
      showMessage(err.message);
    } finally {
      setLoading(loginForm, false);
    }
  });

  // ✅ REGISTER
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('namaLengkap').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const konfirmasi = document.getElementById('konfirmasiPassword').value;
    const tipe = document.getElementById('tipeTrader').value;
    const tujuan = document.getElementById('tujuanTrading').value.trim();
    const setuju = document.getElementById('setujuSK').checked;

    if (!nama || !email || !password || !konfirmasi || !tipe || !tujuan)
      return showMessage("⚠️ Semua field wajib diisi.");

    if (!validateEmail(email)) return showMessage("📧 Format email tidak valid.");
    if (password !== konfirmasi) return showMessage("❌ Password dan konfirmasi tidak cocok.");
    if (!setuju) return showMessage("❗ Anda harus menyetujui Syarat & Ketentuan.");

    setLoading(registerForm, true);

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Simpan data tambahan ke Firestore
      await firebase.firestore().collection("users").doc(user.uid).set({
        nama,
        email,
        tipeTrader: tipe,
        tujuanTrading: tujuan,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Logout agar tidak langsung redirect
      await firebase.auth().signOut();

      showMessage("✅ Registrasi berhasil. Silakan login.", "success");
      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
      registerForm.reset();
    } catch (err) {
      console.error("❌ Register error:", err);
      showMessage(err.message);
    } finally {
      setLoading(registerForm, false);
    }
  });
});
