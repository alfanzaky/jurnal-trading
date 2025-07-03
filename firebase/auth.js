firebase.auth().onAuthStateChanged((user) => {
  const currentPath = window.location.pathname;
  const basePath = '/jurnal-trading';
  const isLoginPage =
    currentPath === `${basePath}/` ||
    currentPath === `${basePath}/index.html`;

  if (user) {
    // ✅ Jika user login dan masih di halaman index → arahkan ke dashboard
    if (isLoginPage) {
      window.location.href = `${basePath}/pages/dashboard.html`;
    }
  } else {
    // ❌ Jika user belum login dan bukan di halaman index → arahkan ke index
    if (!isLoginPage) {
      window.location.href = `${basePath}/index.html`;
    }
  }
});
