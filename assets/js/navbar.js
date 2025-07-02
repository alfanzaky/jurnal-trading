document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbarContainer");
  if (!navbarContainer) return;

  try {
    // Load konten HTML dari navbar
    const response = await fetch("/jurnal-trading/components/navbar.html");
    const html = await response.text();
    navbarContainer.innerHTML = html;

    // Pastikan Firebase Auth sudah siap
    if (typeof firebase === "undefined") {
      console.error("Firebase belum dimuat.");
      return;
    }

    // Tunggu status auth
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const emailSpan = document.getElementById("navbarUserEmail");
        if (emailSpan) emailSpan.textContent = user.email;

        const logoutBtn = document.getElementById("navbarLogout");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            firebase.auth().signOut().then(() => {
              window.location.href = "/jurnal-trading/index.html";
            });
          });
        }
      } else {
        // Redirect ke login kalau belum login
        window.location.href = "/jurnal-trading/index.html";
      }
    });
  } catch (err) {
    console.error("Gagal memuat navbar:", err);
  }
});
