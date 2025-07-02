//login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageEl = document.getElementById('authMessage');

  // Clear error message
  const showMessage = (msg, type = 'danger') => {
    messageEl.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
    setTimeout(() => (messageEl.innerHTML = ""), 4000);
  };

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      window.location.href = '/dashboard.html';
    } catch (err) {
      showMessage(err.message);
    }
  });

  // Register
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      showMessage('Registrasi berhasil. Silakan login.', 'success');
      // Pindah ke tab login setelah berhasil daftar
      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
    } catch (err) {
      showMessage(err.message);
    }
  });
});

