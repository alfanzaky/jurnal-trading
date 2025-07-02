document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#navbarContainer", initJurnalPage);
});

function waitForElement(selector, callback) {
  const interval = setInterval(() => {
    if (document.querySelector(selector)) {
      clearInterval(interval);
      callback();
    }
  }, 100);
}

function initJurnalPage() {
  console.log("✅ jurnal.js aktif");

  const form = document.getElementById("jurnalForm");
  const tableBody = document.getElementById("jurnalTableBody");

  if (!form || !tableBody) {
    alert("❌ Form atau tabel tidak ditemukan!");
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

    const tanggalInput = document.getElementById("tanggal").value;
    const tanggal = firebase.firestore.Timestamp.fromDate(new Date(tanggalInput));
    const pair = document.getElementById("pair").value;
    const tipe = document.getElementById("tipe").value;
    const entry = parseFloat(document.getElementById("entry").value);
    const exit = parseFloat(document.getElementById("exit").value);
    const lot = parseFloat(document.getElementById("lot").value);
    const emosi = document.getElementById("emosi").value;
    const catatan = document.getElementById("catatan").value;

    if (isNaN(entry) || isNaN(exit) || isNaN(lot)) {
      alert("❌ Entry, Exit, atau Lot tidak valid.");
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
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await firebase.firestore().collection("jurnal").add(data);
      alert("✅ Data berhasil disimpan!");
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
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">📭 Belum ada data jurnal.</td></tr>`;
        return;
      }

      tableBody.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Konversi timestamp ke string tanggal
        const tanggalStr = data.tanggal.toDate().toISOString().split("T")[0];

        const row = `
          <tr>
            <td>${tanggalStr}</td>
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
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">❌ Gagal load data.</td></tr>`;
      console.error("Gagal load jurnal:", err);
    }
  }
}
