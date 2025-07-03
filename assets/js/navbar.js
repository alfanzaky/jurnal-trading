document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbarContainer");
  if (!navbarContainer) return;

  try {
    // Load HTML navbar
    const res = await fetch("components/navbar.html");
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
      const currentPage = window.location.pathname;

      // Menyembunyikan tombol login dan profil hanya di landing page (index.html)
      const isLandingPage = currentPage === "/jurnal-trading/index.html";

      const navbarLogin = document.getElementById("navbarLogin");
      const navbarLogout = document.getElementById("navbarLogout");
      const navbarUserEmail = document.getElementById("navbarUserEmail");
      const navbarProfile = document.getElementById("navbarProfile");

      if (user) {
        // Tampilkan email user di navbar jika login
        if (navbarUserEmail) navbarUserEmail.textContent = user.email;

        // Tampilkan tombol logout dan profil jika user sudah login
        if (navbarLogout) navbarLogout.style.display = "inline-block";
        if (navbarProfile) navbarProfile.style.display = "inline-block";

        // Sembunyikan tombol login jika sudah login
        if (navbarLogin) navbarLogin.style.display = "none";

        // Logout button handler
        if (navbarLogout) {
          navbarLogout.addEventListener("click", async () => {
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
        // Sembunyikan tombol logout dan profil jika belum login
        if (navbarLogout) navbarLogout.style.display = "none";
        if (navbarProfile) navbarProfile.style.display = "none";

        // Tampilkan tombol login jika belum login
        if (navbarLogin) navbarLogin.style.display = "inline-block";
      }

      // Hanya sembunyikan tombol login dan profil di halaman landing (index.html)
      if (isLandingPage) {
        if (navbarLogin) navbarLogin.style.display = "none";
        if (navbarProfile) navbarProfile.style.display = "none";
      }
    });
  } catch (error) {
    console.error("❌ Gagal memuat navbar:", error);
  }
});
