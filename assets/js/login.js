document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const messageEl = document.getElementById('authMessage');

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
      window.location.href = 'dashboard.html'; // fix path!
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
      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();
    } catch (err) {
      showMessage(err.message);
    }
  });
});
