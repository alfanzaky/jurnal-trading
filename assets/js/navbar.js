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

    // Cek halaman aktif
    const currentPage = window.location.pathname;
    const isLandingPage = currentPage === "/jurnal-trading/index.html";

    // Jika di landing page, tidak perlu memuat tombol login dan profil
    if (isLandingPage) {
      const navbarLogin = document.getElementById("navbarLogin");
      const navbarProfile = document.getElementById("navbarProfile");
      if (navbarLogin) navbarLogin.style.display = "none";
      if (navbarProfile) navbarProfile.style.display = "none";
    }

    // Auth listener
    firebase.auth().onAuthStateChanged((user) => {
      const navbarLogin = document.getElementById("navbarLogin");
      const navbarLogout = document.getElementById("navbarLogout");
      const navbarUserEmail = document.getElementById("navbarUserEmail");
      const navbarProfile = document.getElementById("navbarProfile");

      if (user) {
        // Tampilkan email user di navbar
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
    });
  } catch (error) {
    console.error("❌ Gagal memuat navbar:", error);
  }
});
