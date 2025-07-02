// assets/js/jurnal.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('jurnalForm');
  const tableBody = document.getElementById('jurnalTableBody');

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      return (window.location.href = '/jurnal-trading/index.html');
    }

    loadJurnalData(user.uid);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        uid: user.uid,
        tanggal: form.tanggal.value,
        pair: form.pair.value,
        tipe: form.tipe.value,
        entry: parseFloat(form.entry.value),
        exit: parseFloat(form.exit.value),
        lot: parseFloat(form.lot.value),
        hasil: form.hasil.value,
        emosi: form.emosi.value,
        catatan: form.catatan.value,
        profit: parseFloat(form.exit.value - form.entry.value) * parseFloat(form.lot.value)
      };

      try {
        await firebase.firestore().collection('jurnal').add(data);
        form.reset();
        loadJurnalData(user.uid);
      } catch (err) {
        console.error('Gagal simpan jurnal:', err.message);
      }
    });
  });

  async function loadJurnalData(uid) {
    tableBody.innerHTML = '';
    try {
      const snapshot = await firebase.firestore()
        .collection('jurnal')
        .where('uid', '==', uid)
        .orderBy('tanggal', 'desc')
        .get();

      snapshot.forEach(doc => {
        const d = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${d.tanggal}</td>
          <td>${d.pair}</td>
          <td>${d.tipe}</td>
          <td>${d.entry}</td>
          <td>${d.exit}</td>
          <td>${d.lot}</td>
          <td>${d.hasil}</td>
          <td>${d.emosi}</td>
          <td>${d.profit.toFixed(2)}</td>
          <td>${d.catatan}</td>
        `;
        tableBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Gagal ambil data jurnal:', err.message);
    }
  }
});
