document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageEl = document.getElementById('authMessage');

  // ⛔ Cegah user yang sudah login balik ke login.html
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      window.location.replace(`${window.location.origin}${getBasePath()}/dashboard.html`);
    }
  });

  // Helper: tampilkan pesan alert
  const showMessage = (msg, type = 'danger') => {
    messageEl.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
    setTimeout(() => (messageEl.innerHTML = ""), 4000);
  };

  // Helper: tombol loading
  const setLoading = (form, loading) => {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.innerHTML;
    }
    btn.disabled = loading;
    btn.innerHTML = loading ? 'Memproses...' : btn.dataset.originalText;
  };

  // Helper: base path dinamis (misal: /jurnal-trading)
  const getBasePath = () => {
    const path = window.location.pathname.split('/');
    return '/' + (path[1] || '');
  };

  // 🔐 Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) return showMessage("Email dan password wajib diisi.");

    setLoading(loginForm, true);

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      window.location.href = `${window.location.origin}${getBasePath()}/dashboard.html`;
    } catch (err) {
      showMessage(err.message);
    } finally {
      setLoading(loginForm, false);
    }
  });

  // 📝 Register
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!email || !password) return showMessage("Email dan password wajib diisi.");

    setLoading(registerForm, true);

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      showMessage('Registrasi berhasil. Silakan login.', 'success');

      // Arahkan ke tab login
      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
    } catch (err) {
      showMessage(err.message);
    } finally {
      setLoading(registerForm, false);
    }
  });
});
