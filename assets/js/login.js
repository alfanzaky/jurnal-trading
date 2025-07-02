document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageEl = document.getElementById('authMessage');

  const showMessage = (msg, type = 'danger') => {
    messageEl.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
    setTimeout(() => (messageEl.innerHTML = ""), 4000);
  };

  // Helper: disable/enable button
  const setLoading = (form, loading) => {
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = loading;
    btn.innerHTML = loading ? 'Memproses...' : btn.dataset.originalText || btn.innerHTML;
  };

  // Store original button text
  document.querySelectorAll('form button[type="submit"]').forEach(btn => {
    btn.dataset.originalText = btn.innerHTML;
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
      return showMessage("Email dan password wajib diisi.");
    }

    setLoading(loginForm, true);

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      window.location.href = 'dashboard.html'; // path fix untuk GitHub Pages
    } catch (err) {
      showMessage(err.message);
    } finally {
      setLoading(loginForm, false);
    }
  });

  // Register
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!email || !password) {
      return showMessage("Email dan password wajib diisi.");
    }

    setLoading(registerForm, true);

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      showMessage('Registrasi berhasil. Silakan login.', 'success');

      // Auto switch ke tab login
      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
    } catch (err) {
      showMessage(err.message);
    } finally {
      setLoading(registerForm, false);
    }
  });
});
