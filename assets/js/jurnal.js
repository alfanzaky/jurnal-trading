document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("jurnalForm");
  const tableBody = document.getElementById("jurnalTableBody");

  let currentUser = null;

  // Cek login user
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      await loadJurnal();
    } else {
      window.location.href = "/jurnal-trading/index.html";
    }
  });

  // Saat form disubmit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tanggal = document.getElementById("tanggal").value;
    const pair = document.getElementById("pair").value;
    const tipe = document.getElementById("tipe").value;
    const entry = parseFloat(document.getElementById("entry").value);
    const exit = parseFloat(document.getElementById("exit").value);
    const lot = parseFloat(document.getElementById("lot").value);
    const emosi = document.getElementById("emosi").value;
    const catatan = document.getElementById("catatan").value;

    const profit = (exit - entry) * lot * (tipe === "Buy" ? 1 : -1);

    const data = {
      tanggal,
      pair,
      tipe,
      entry,
      exit,
      lot,
      emosi: emosi || null,
      catatan: catatan || null,
      profit: parseFloat(profit.toFixed(2)),
      uid: currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await firebase.firestore().collection("jurnal").add(data); // otomatis buat koleksi kalau belum ada
      form.reset();
      await loadJurnal();
    } catch (error) {
      console.error("Gagal menyimpan jurnal:", error);
      alert("Terjadi kesalahan saat menyimpan jurnal.");
    }
  });

  // Fungsi untuk memuat jurnal
  async function loadJurnal() {
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Memuat data...</td></tr>`;

    try {
      const snapshot = await firebase
        .firestore()
        .collection("jurnal")
        .where("uid", "==", currentUser.uid)
        .orderBy("tanggal", "desc")
        .get();

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Belum ada jurnal.</td></tr>`;
        return;
      }

      tableBody.innerHTML = ""; // bersihkan sebelum render

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
            <td class="${data.profit >= 0 ? "text-success" : "text-danger"}">${data.profit}</td>
            <td>${data.emosi || "-"}</td>
            <td>${data.catatan || "-"}</td>
          </tr>`;
        tableBody.innerHTML += row;
      });
    } catch (error) {
      console.error("Gagal memuat jurnal:", error);
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Gagal memuat data.</td></tr>`;
    }
  }
});
