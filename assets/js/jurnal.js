document.addEventListener("DOMContentLoaded", () => {
  // Tunggu hingga navbar dan footer selesai dimuat
  waitForElement("#navbarContainer", initJurnalLogic);
});

function waitForElement(selector, callback) {
  const interval = setInterval(() => {
    if (document.querySelector(selector)) {
      clearInterval(interval);
      callback();
    }
  }, 100); // periksa tiap 100ms
}

function initJurnalLogic() {
  console.log("✅ jurnal.js dimuat dan siap");

  const form = document.getElementById("jurnalForm");
  const tableBody = document.getElementById("jurnalTableBody");
  if (!form) {
    alert("❌ Form jurnal tidak ditemukan.");
    return;
  }

  let currentUser = null;

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      await loadJurnal(user.uid);
    } else {
      window.location.href = "/jurnal-trading/index.html";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alert("📨 Form disubmit!");

    const tanggal = document.getElementById("tanggal").value;
    const pair = document.getElementById("pair").value;
    const tipe = document.getElementById("tipe").value;
    const entry = parseFloat(document.getElementById("entry").value);
    const exit = parseFloat(document.getElementById("exit").value);
    const lot = parseFloat(document.getElementById("lot").value);
    const emosi = document.getElementById("emosi").value;
    const catatan = document.getElementById("catatan").value;

    if (isNaN(entry) || isNaN(exit) || isNaN(lot)) {
      alert("❌ Entry/Exit/Lot harus angka!");
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
      emosi: emosi || null,
      catatan: catatan || null,
      profit: parseFloat(profit.toFixed(2)),
      uid: currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      alert("🕒 Menyimpan ke Firestore...");
      await firebase.firestore().collection("jurnal").add(data);
      alert("✅ Data jurnal berhasil disimpan!");
      form.reset();
      await loadJurnal(currentUser.uid);
    } catch (err) {
      alert("❌ Gagal simpan data: " + err.message);
    }
  });

  async function loadJurnal(uid) {
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center">⏳ Memuat data...</td></tr>`;
    try {
      const snapshot = await firebase.firestore()
        .collection("jurnal")
        .where("uid", "==", uid)
        .orderBy("tanggal", "desc")
        .get();

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">📭 Belum ada jurnal.</td></tr>`;
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
            <td class="${data.profit >= 0 ? "text-success" : "text-danger"}">${data.profit}</td>
            <td>${data.emosi || "-"}</td>
            <td>${data.catatan || "-"}</td>
          </tr>`;
        tableBody.innerHTML += row;
      });
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">❌ Gagal load data.</td></tr>`;
    }
  }
}
