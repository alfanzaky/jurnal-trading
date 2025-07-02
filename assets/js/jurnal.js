// /assets/js/jurnal.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("jurnalForm");
  const tableBody = document.getElementById("jurnalTableBody");

  let currentUser = null;

  // Cek login user
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      loadJurnal();
    } else {
      window.location.href = "/jurnal-trading/index.html";
    }
  });

  // Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      tanggal: document.getElementById("tanggal").value,
      pair: document.getElementById("pair").value,
      tipe: document.getElementById("tipe").value,
      entry: parseFloat(document.getElementById("entry").value),
      exit: parseFloat(document.getElementById("exit").value),
      lot: parseFloat(document.getElementById("lot").value),
      emosi: document.getElementById("emosi").value,
      catatan: document.getElementById("catatan").value,
      uid: currentUser.uid,
      timestamp: new Date()
    };

    // Hitung profit otomatis (jika ingin)
    const profit = (data.exit - data.entry) * data.lot * (data.tipe === "Buy" ? 1 : -1);
    data.profit = parseFloat(profit.toFixed(2));

    try {
      await firebase.firestore().collection("jurnal").add(data);
      form.reset();
      loadJurnal();
    } catch (err) {
      console.error("Gagal menyimpan jurnal:", err);
      alert("Gagal menyimpan data.");
    }
  });

  // Load data jurnal dari Firestore
  async function loadJurnal() {
    tableBody.innerHTML = "";
    try {
      const snapshot = await firebase
        .firestore()
        .collection("jurnal")
        .where("uid", "==", currentUser.uid)
        .orderBy("tanggal", "desc")
        .get();

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
          </tr>`;
        tableBody.innerHTML += row;
      });
    } catch (err) {
      console.error("Gagal memuat jurnal:", err);
    }
  }
});
