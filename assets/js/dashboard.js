document.addEventListener("DOMContentLoaded", async () => {
  const user = firebase.auth().currentUser;
  if (!user) return window.location.href = "/jurnal-trading/pages/login.html";

  const uid = user.uid;
  const db = firebase.firestore();

  const greetingEl = document.getElementById("greeting");
  const totalJurnalEl = document.getElementById("totalJurnal");
  const winrateEl = document.getElementById("winrate");
  const profitEl = document.getElementById("totalProfit");
  const lossEl = document.getElementById("totalLoss");
  const recentTable = document.getElementById("recentJournals");

  // Load nama dari koleksi users
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const nama = userDoc.exists ? userDoc.data().nama : user.email;
    greetingEl.innerHTML = `Hi, ${nama.split(" ")[0]} 👋`;
  } catch (err) {
    console.error("❌ Gagal ambil data user:", err.message);
  }

  // Load data jurnal
  try {
    const snapshot = await db.collection("jurnal")
      .where("uid", "==", uid)
      .orderBy("tanggal", "desc")
      .limit(10)
      .get();

    const data = [];
    let win = 0, total = 0, profit = 0, loss = 0;

    snapshot.forEach(doc => {
      const d = doc.data();
      data.push(d);
      total++;
      if (d.profit >= 0) {
        win++;
        profit += d.profit;
      } else {
        loss += Math.abs(d.profit);
      }
    });

    // Update summary
    totalJurnalEl.textContent = total;
    winrateEl.textContent = total > 0 ? Math.round((win / total) * 100) + "%" : "0%";
    profitEl.textContent = profit;
    lossEl.textContent = loss;

    // Update table
    if (data.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Belum ada data.</td></tr>`;
    } else {
      recentTable.innerHTML = data.map(d => `
        <tr>
          <td>${d.tanggal}</td>
          <td>${d.pair}</td>
          <td>${d.tipe}</td>
          <td class="${d.profit >= 0 ? 'text-success' : 'text-danger'} fw-bold">${d.profit}</td>
          <td>${d.emosi || '-'}</td>
        </tr>
      `).join("");
    }

    // Chart
    const ctx = document.getElementById("performanceChart").getContext("2d");
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.tanggal).reverse(),
        datasets: [{
          label: 'Profit/Loss',
          data: data.map(d => d.profit).reverse(),
          borderColor: '#ffc107',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  } catch (err) {
    console.error("❌ Gagal ambil jurnal:", err.message);
  }

  // Logout handler
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await firebase.auth().signOut();
    window.location.href = "/jurnal-trading/index.html";
  });
});
