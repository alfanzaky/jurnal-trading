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
  const form = document.getElementById("jurnalForm");
  const tableBody = document.getElementById("jurnalTableBody");

  if (!form || !tableBody) {
    console.error("❌ Form atau tabel tidak ditemukan!");
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
    const pair = document.getElementById("pair").value;
    const tipe = document.getElementById("tipe").value;
    const entry = parseFloat(document.getElementById("entry").value);
    const exit = parseFloat(document.getElementById("exit").value);
    const lot = parseFloat(document.getElementById("lot").value);
    const emosi = document.getElementById("emosi").value;
    const catatan = document.getElementById("catatan").value;

    if (!tanggalInput || isNaN(entry) || isNaN(exit) || isNaN(lot)) {
      alert("❌ Tanggal, Entry, Exit, dan Lot wajib diisi dengan benar.");
      return;
    }

    const tanggal = firebase.firestore.Timestamp.fromDate(new Date(tanggalInput));
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
      console.error("❌ Gagal simpan:", err);
      alert("❌ Gagal menyimpan data. Coba lagi nanti.");
    }
  });

  async function loadJurnal(uid) {
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center">⏳ Memuat data...</td></tr>`;

    try {
      const snapshot = await firebase.firestore()
        .collection("jurnal")
        .where("uid", "==", uid)
        .get();

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">📭 Belum ada data jurnal.</td></tr>`;
        return;
      }

      const entries = [];
      snapshot.forEach((doc) => entries.push(doc.data()));

      // Sort berdasarkan tanggal (newest first)
      entries.sort((a, b) => {
        const tA = a.tanggal?.toDate?.() || new Date(0);
        const tB = b.tanggal?.toDate?.() || new Date(0);
        return tB - tA;
      });

      tableBody.innerHTML = "";

      entries.forEach((data) => {
        const tanggalStr = data.tanggal?.toDate?.()
          ? data.tanggal.toDate().toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";

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
      console.error("❌ Gagal load data:", err);
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">❌ Gagal load data.</td></tr>`;
    }
  }
}
