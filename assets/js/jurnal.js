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
  const submitBtn = form.querySelector("button[type=submit]");
  const originalFormClass = form.className;

  let currentUser = null;
  let editMode = false;
  let editDocId = null;

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
      if (editMode && editDocId) {
        await firebase.firestore().collection("jurnal").doc(editDocId).update(data);
        alert("✅ Data berhasil diperbarui!");
      } else {
        await firebase.firestore().collection("jurnal").add(data);
        alert("✅ Data berhasil disimpan!");
      }

      form.reset();
      editMode = false;
      editDocId = null;
      form.className = originalFormClass;
      submitBtn.textContent = "Simpan Jurnal";

      await loadJurnal(currentUser.uid);
    } catch (err) {
      console.error("❌ Gagal simpan:", err);
      alert("❌ Gagal menyimpan data.");
    }
  });

  async function loadJurnal(uid) {
    tableBody.innerHTML = `<tr><td colspan="10" class="text-center">⏳ Memuat data...</td></tr>`;

    try {
      const snapshot = await firebase.firestore()
        .collection("jurnal")
        .where("uid", "==", uid)
        .orderBy("tanggal", "desc")
        .get();

      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">📭 Belum ada data jurnal.</td></tr>`;
        return;
      }

      tableBody.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

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
            <td class="text-center">
              <button class="btn btn-sm btn-warning me-1" onclick="editJurnal('${id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="confirmDelete('${id}')">Hapus</button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    } catch (err) {
      console.error("❌ Gagal load data:", err);
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">❌ Gagal load data.</td></tr>`;
    }
  }

  window.editJurnal = async function (docId) {
    try {
      const doc = await firebase.firestore().collection("jurnal").doc(docId).get();
      if (!doc.exists) return;

      const data = doc.data();

      document.getElementById("tanggal").value = data.tanggal.toDate().toISOString().split("T")[0];
      document.getElementById("pair").value = data.pair;
      document.getElementById("tipe").value = data.tipe;
      document.getElementById("entry").value = data.entry;
      document.getElementById("exit").value = data.exit;
      document.getElementById("lot").value = data.lot;
      document.getElementById("emosi").value = data.emosi || "";
      document.getElementById("catatan").value = data.catatan || "";

      editMode = true;
      editDocId = docId;
      submitBtn.textContent = "Update Jurnal";
      form.classList.add("border", "border-warning", "bg-warning-subtle");
      form.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("❌ Gagal ambil data:", err);
    }
  };

  window.confirmDelete = function (docId) {
    const confirmed = confirm("⚠️ Yakin ingin menghapus data ini?");
    if (!confirmed) return;

    firebase.firestore().collection("jurnal").doc(docId).delete()
      .then(() => {
        alert("🗑️ Data berhasil dihapus.");
        loadJurnal(currentUser.uid);
      })
      .catch((err) => {
        console.error("❌ Gagal hapus data:", err);
        alert("❌ Gagal menghapus data.");
      });
  };
}
