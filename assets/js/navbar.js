document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbarContainer");
  if (!navbarContainer) return;

  try {
    // Load HTML navbar
    const res = await fetch("/jurnal-trading/components/navbar.html");
    if (!res.ok) throw new Error("Gagal fetch navbar HTML.");
    
    const html = await res.text();
    navbarContainer.innerHTML = html;

    // Tandai bahwa navbar selesai dimuat
    document.dispatchEvent(new Event("navbarLoaded"));

    // Cek ketersediaan Firebase
    if (typeof firebase === "undefined" || !firebase.auth) {
      console.error("❌ Firebase belum tersedia.");
      return;
    }

    // Auth listener
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Tampilkan email user di navbar
        const emailSpan = document.getElementById("navbarUserEmail");
        if (emailSpan) emailSpan.textContent = user.email;

        // Logout button handler
        const logoutBtn = document.getElementById("navbarLogout");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async () => {
            try {
              await firebase.auth().signOut();
              window.location.href = "/jurnal-trading/index.html";
            } catch (err) {
              console.error("❌ Gagal logout:", err.message);
              alert("Gagal logout. Silakan coba lagi.");
            }
          });
        }
      } else {
        // Redirect ke login jika belum login
        window.location.href = "/jurnal-trading/index.html";
      }
    });
  } catch (error) {
    console.error("❌ Gagal memuat navbar:", error);
  }
});
