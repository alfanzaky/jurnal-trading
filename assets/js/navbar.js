document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbarContainer");

  if (navbarContainer) {
    try {
      const response = await fetch("/jurnal-trading/components/navbar.html");
      const html = await response.text();
      navbarContainer.innerHTML = html;

      // Tunggu sampai Firebase Auth ready
      const checkAuth = setInterval(() => {
        if (typeof firebase !== "undefined" && firebase.auth().currentUser) {
          const user = firebase.auth().currentUser;
          const emailSpan = document.getElementById("navbarUserEmail");
          if (emailSpan && user.email) {
            emailSpan.textContent = user.email;
          }
          clearInterval(checkAuth);
        }
      }, 200);

      // Logout button handler
      document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "navbarLogout") {
          firebase.auth().signOut().then(() => {
            window.location.href = "/jurnal-trading/index.html";
          });
        }
      });
    } catch (err) {
      console.error("Gagal load navbar:", err);
    }
  }
});

