document.addEventListener('DOMContentLoaded', async () => {
  const userEmailEl = document.getElementById('userEmail');
  const welcomeMsgEl = document.getElementById('welcomeMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  const totalJurnalEl = document.getElementById('totalJurnal');
  const winRateEl = document.getElementById('winRate');
  const totalProfitEl = document.getElementById('totalProfit');
  const chartCanvas = document.getElementById('performanceChart');

  // 🔐 Cek user login
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      // Redirect ke login jika belum login
      const base = window.location.pathname.split('/')[1];
      return (window.location.href = `/${base || ''}/index.html`);
    }

    const email = user.email;
    userEmailEl.textContent = email;
    welcomeMsgEl.textContent = `Selamat datang, ${email.split('@')[0]}!`;

    try {
      const snapshot = await firebase.firestore()
        .collection('jurnal')
        .where('uid', '==', user.uid)
        .orderBy('tanggal', 'asc')
        .get();

      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Hitung statistik
      const total = entries.length;
      const totalProfit = entries.reduce((acc, e) => acc + (parseFloat(e.profit) || 0), 0);
      const wins = entries.filter(e => parseFloat(e.profit) > 0).length;
      const winRate = total ? ((wins / total) * 100).toFixed(1) : 0;

      // Tampilkan ke UI
      totalJurnalEl.textContent = total;
      totalProfitEl.textContent = formatRupiah(totalProfit);
      winRateEl.textContent = `${winRate}%`;

      // Chart performa
      renderChart(entries);
    } catch (err) {
      console.error('Gagal ambil data jurnal:', err.message);
    }
  });

  // 🔓 Logout
  logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      const base = window.location.pathname.split('/')[1];
      window.location.href = `/${base || ''}/index.html`;
    });
  });

  // Format Rupiah
  const formatRupiah = (angka) =>
    angka.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

  // Render Chart
  function renderChart(entries) {
    const labels = entries.map(e => e.tanggal || 'Tanpa Tanggal');
    const data = entries.map(e => parseFloat(e.profit) || 0);

    new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Profit',
          data,
          borderColor: 'rgba(78,84,200,1)',
          backgroundColor: 'rgba(78,84,200,0.1)',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
});
