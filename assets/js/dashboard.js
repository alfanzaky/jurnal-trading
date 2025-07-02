document.addEventListener("DOMContentLoaded", () => {
  let currentUser = null;

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      tampilkanRingkasan(user.uid);
    } else {
      window.location.href = "index.html"; // redirect kalau belum login
    }
  });
});

async function tampilkanRingkasan(uid) {
  try {
    const snapshot = await firebase.firestore()
      .collection("jurnal")
      .where("userId", "==", uid)
      .get();

    let totalEntry = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const hasil = parseFloat(data.hasil);

      totalEntry++;
      if (hasil > 0) totalProfit += hasil;
      else totalLoss += hasil;
    });

    // Tampilkan ke HTML
    document.getElementById("total-entry").textContent = totalEntry;
    document.getElementById("total-profit").textContent = totalProfit.toFixed(2);
    document.getElementById("total-loss").textContent = totalLoss.toFixed(2);

  } catch (err) {
    console.error("Gagal ambil data dashboard:", err);
    alert("Gagal memuat data dashboard.");
  }
}
