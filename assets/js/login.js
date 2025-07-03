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
    // 🔐 Buat akun Auth
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // ✅ Simpan ke Firestore
    await firebase.firestore().collection("users").doc(user.uid).set({
      nama,
      email,
      tipeTrader: tipe,
      tujuanTrading: tujuan,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // ✅ Logout agar tidak langsung login otomatis
    await firebase.auth().signOut();

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
