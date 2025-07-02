document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbarContainer");
  if (!navbarContainer) return;

  try {
    // Load isi navbar.html
    const response = await fetch("/jurnal-trading/components/navbar.html");
    const html = await response.text();
    navbarContainer.innerHTML = html;

    // 🔐 Cek Firebase sudah ready
    if (typeof firebase === "undefined") {
      console.error("Firebase belum dimuat");
      return;
    }

    // 🔄 Tunggu Auth Ready
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const emailSpan = document.getElementById("navbarUserEmail");
        if (emailSpan) emailSpan.textContent = user.email;

        // 🔓 Logout button
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
