document.addEventListener("DOMContentLoaded", async () => {
  const userNameEl = document.getElementById("userName");
  const totalJurnalEl = document.getElementById("totalJurnal");
  const winRateEl = document.getElementById("winRate");
  const totalPLEl = document.getElementById("totalPL");
  const riwayatEl = document.getElementById("riwayatTerbaru");
  const logoutBtn = document.getElementById("logoutBtn");

  const db = firebase.firestore();
  const auth = firebase.auth();
  const user = auth.currentUser;

  if (!user) return;

  try {
    // 🔎 Ambil data user
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();
    userNameEl.textContent = userData?.nama || "Trader";

    // 📈 Ambil jurnal
    const snapshot = await db
      .collection("jurnal")
      .where("uid", "==", user.uid)
      .orderBy("tanggal", "desc")
      .limit(100)
      .get();

    const data = [];
    let totalProfit = 0;
    let winCount = 0;

    snapshot.forEach((doc) => {
      const item = doc.data();
      data.push(item);
      totalProfit += Number(item.profit) || 0;
      if (Number(item.profit) > 0) winCount++;
    });

    const total = data.length;
    const winrate = total ? ((winCount / total) * 100).toFixed(1) : 0;

    totalJurnalEl.textContent = total;
    winRateEl.textContent = winrate + "%";
    totalPLEl.textContent = "Rp " + totalProfit.toLocaleString("id-ID");

    // Chart performa
    const ctx = document.getElementById("performanceChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map(d => d.tanggal).reverse(),
        datasets: [{
          label: "Profit/Loss",
          data: data.map(d => d.profit).reverse(),
          borderColor: "orange",
          backgroundColor: "rgba(255,193,7,0.2)",
          fill: true,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: { callback: val => "Rp " + val }
          }
        }
      }
    });

    // Tabel riwayat terbaru
    if (data.length > 0) {
      riwayatEl.innerHTML = "";
      data.slice(0, 5).forEach(item => {
        riwayatEl.innerHTML += `
          <tr>
            <td>${item.tanggal}</td>
            <td>${item.simbol || "-"}</td>
            <td class="${item.profit > 0 ? 'text-success' : 'text-danger'}">
              ${item.profit > 0 ? "+" : ""}${item.profit}
            </td>
          </tr>
        `;
      });
    } else {
      riwayatEl.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Belum ada data</td></tr>`;
    }

  } catch (err) {
    console.error("❌ Error dashboard:", err);
  }

  // Logout
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    await firebase.auth().signOut();
    window.location.href = "/jurnal-trading/pages/login.html";
  });
});
