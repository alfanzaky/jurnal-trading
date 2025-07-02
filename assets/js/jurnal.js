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

  if (!form || !tableBody) return;

  let currentUser = null;
  let editId = null; // Menyimpan ID dokumen yang sedang diedit

  // Cek login user
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      await loadJurnal(user.uid);
    } else {
      window.location.href = "/jurnal-trading/index.html";
    }
  });

  // Handle submit form (tambah atau edit)
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
      if (editId) {
        // Mode edit
        await firebase.firestore().collection("jurnal").doc(editId).update(data);
        alert("✅ Jurnal berhasil diperbarui!");
      } else {
        // Mode tambah
        await firebase.firestore().collection("jurnal").add(data);
        alert("✅ Jurnal berhasil disimpan!");
      }

      form.reset();
      editId = null;
      await loadJurnal(currentUser.uid);
    } catch (err) {
      alert("❌ Gagal simpan data: " + err.message);
    }
  });

  // Load jurnal ke tabel
  async function loadJurnal(uid) {
    tableBody.innerHTML = `<tr><td colspan="10" class="text-center">⏳ Memuat data...</td></tr>`;

    try {
      const snapshot = await firebase.firestore()
        .collection("jurnal")
        .where("uid", "==", uid)
        .orderBy("tanggal", "desc")
        .get();

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">📭 Belum ada jurnal.</td></tr>`;
        return;
      }

      tableBody.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const tanggalStr = data.tanggal?.toDate().toLocaleDateString("id-ID", {
          year: "numeric", month: "short", day: "numeric",
        }) || "-";

        const row = `
          <tr>
            <td>${tanggalStr}</td>
            <td>${data.pair}</td>
            <td>${data.tipe}</td>
            <td>${data.entry}</td>
            <td>${data.exit}</td>
            <td>${data.lot}</td>
            <td class="${data.profit >= 0 ? "text-success" : "text-danger"}">${data.profit}</td>
            <td>${data.emosi || "-"}</td>
            <td>${data.catatan || "-"}</td>
            <td>
              <button class="btn btn-sm btn-warning editBtn" data-id="${doc.id}">Edit</button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });

      // Aktifkan tombol edit
      const editButtons = document.querySelectorAll(".editBtn");
      editButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
          const docId = btn.getAttribute("data-id");
          const docRef = await firebase.firestore().collection("jurnal").doc(docId).get();
          const data = docRef.data();
          if (!data) return;

          // Isi form
          document.getElementById("tanggal").value = data.tanggal.toDate().toISOString().split("T")[0];
          document.getElementById("pair").value = data.pair;
          document.getElementById("tipe").value = data.tipe;
          document.getElementById("entry").value = data.entry;
          document.getElementById("exit").value = data.exit;
          document.getElementById("lot").value = data.lot;
          document.getElementById("emosi").value = data.emosi || "";
          document.getElementById("catatan").value = data.catatan || "";

          editId = docId;
          alert("✏️ Mode edit diaktifkan!");
        });
      });
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">❌ Gagal load data.</td></tr>`;
      console.error("Gagal load jurnal:", err.message);
    }
  }
}
