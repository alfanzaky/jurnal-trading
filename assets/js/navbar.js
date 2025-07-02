document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbarContainer");
  if (!navbarContainer) return;

  try {
    // Load isi navbar.html
    const response = await fetch("/jurnal-trading/components/navbar.html");
    const html = await response.text();
    navbarContainer.innerHTML = html;

    // 🔐 Pastikan Firebase sudah siap
    if (typeof firebase === "undefined") {
      console.error("Firebase belum dimuat");
      return;
    }

    // 🔄 Tunggu auth state
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Tampilkan email di span
        const emailSpan = document.getElementById("navbarUserEmail");
        if (emailSpan) emailSpan.textContent = user.email;

        // Tombol logout
        const logoutBtn = document.getElementById("navbarLogout");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            firebase.auth().signOut().then(() => {
              window.location.href = "/jurnal-trading/index.html";
            });
          });
        }
      }
    });
  } catch (err) {
    console.error("Gagal load navbar:", err);
  }
});
