document.addEventListener("DOMContentLoaded", () => {
  alert("✅ jurnal.js dimuat");

  const form = document.getElementById("jurnalForm");
  const tableBody = document.getElementById("jurnalTableBody");

  if (!form || !tableBody) {
    alert("🚨 Elemen form atau tabel tidak ditemukan!");
    return;
  }

  let currentUser = null;

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      alert("👤 Pengguna login: " + user.email);
      await loadJurnal();
    } else {
      alert("⛔ Belum login, redirect...");
      window.location.href = "/jurnal-trading/index.html";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alert("📨 Form disubmit");

    const tanggal = document.getElementById("tanggal").value;
    const pair = document.getElementById("pair").value;
    const tipe = document.getElementById("tipe").value;
    const entry = parseFloat(document.getElementById("entry").value);
    const exit = parseFloat(document.getElementById("exit").value);
    const lot = parseFloat(document.getElementById("lot").value);
    const emosi = document.getElementById("emosi").value;
    const catatan = document.getElementById("catatan").value;

    if (isNaN(entry) || isNaN(exit) || isNaN(lot)) {
      alert("⚠️ Entry, Exit, dan Lot harus berupa angka!");
      return;
    }

    const profit = (exit - entry) * lot * (tipe === "Buy" ? 1 : -1);
    const data = {
      tanggal,
      pair,
      tipe,
      entry,
      exit,
      lot,
      profit: parseFloat(profit.toFixed(2)),
      emosi: emosi || null,
      catatan: catatan || null,
      uid: currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      alert("📝 Menyimpan data...");
      await firebase.firestore().collection("jurnal").add(data);
      alert("✅ Data jurnal berhasil disimpan!");
      form.reset();
      await loadJurnal();
    } catch (error) {
      console.error("❌ Gagal menyimpan:", error);
      alert("❌ Error saat simpan: " + error.message);
    }
  });

  async function loadJurnal() {
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center">⏳ Memuat data...</td></tr>`;

    try {
      const snapshot = await firebase
        .firestore()
        .collection("jurnal")
        .where("uid", "==", currentUser.uid)
        .orderBy("tanggal", "desc")
        .get();

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">📭 Belum ada data jurnal.</td></tr>`;
        return;
      }

      tableBody.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const row = `
          <tr>
            <td>${data.tanggal}</td>
            <td>${data.pair}</td>
            <td>${data.tipe}</td>
            <td>${data.entry}</td>
            <td>${data.exit}</td>
            <td>${data.lot}</td>
            <td class="${data.profit >= 0 ? 'text-success' : 'text-danger'}">${data.profit}</td>
            <td>${data.emosi || "-"}</td>
            <td>${data.catatan || "-"}</td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    } catch (error) {
      console.error("❌ Gagal memuat jurnal:", error);
      alert("❌ Gagal load data: " + error.message);
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Gagal memuat data.</td></tr>`;
    }
  }
});
