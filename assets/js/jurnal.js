document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("jurnal-form");
  const tableBody = document.getElementById("jurnal-table");
  let currentUser = null;

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      listenJurnal(user.uid); // Tampilkan jurnal realtime
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tanggal = document.getElementById("tanggal").value;
    const pair = document.getElementById("pair").value;
    const hasil = parseFloat(document.getElementById("hasil").value);
    const catatan = document.getElementById("catatan").value;

    if (!tanggal || !pair || isNaN(hasil)) return alert("Isi semua field!");

    try {
      await addJurnal(currentUser.uid, { tanggal, pair, hasil, catatan });
      form.reset();
    } catch (err) {
      console.error("Gagal simpan jurnal:", err);
      alert("Gagal menyimpan jurnal.");
    }
  });

  // Render tabel jurnal realtime
  function listenJurnal(userId) {
    const q = firebase.firestore()
      .collection("jurnal")
      .where("userId", "==", userId)
      .orderBy("tanggal", "desc");

    q.onSnapshot((snapshot) => {
      tableBody.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.tanggal}</td>
          <td>${data.pair}</td>
          <td>${data.hasil}</td>
          <td>${data.catatan || "-"}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="editJurnal('${doc.id}', this)">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteJurnal('${doc.id}')">Hapus</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    });
  }
});

// Fungsi edit jurnal
async function editJurnal(docId, btn) {
  const row = btn.closest("tr");
  const [tanggal, pair, hasil, catatan] = [...row.children].map(td => td.textContent);

  const newTanggal = prompt("Tanggal (YYYY-MM-DD):", tanggal);
  const newPair = prompt("Pair:", pair);
  const newHasil = prompt("Hasil (angka):", hasil);
  const newCatatan = prompt("Catatan:", catatan);

  if (newTanggal && newPair && !isNaN(parseFloat(newHasil))) {
    try {
      await updateJurnal(docId, {
        tanggal: newTanggal,
        pair: newPair,
        hasil: parseFloat(newHasil),
        catatan: newCatatan
      });
    } catch (err) {
      console.error("Gagal update jurnal:", err);
      alert("Gagal mengupdate jurnal.");
    }
  }
}

// Fungsi hapus jurnal
async function deleteJurnal(docId) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    try {
      await firebase.firestore().collection("jurnal").doc(docId).delete();
    } catch (err) {
      console.error("Gagal hapus jurnal:", err);
      alert("Gagal menghapus jurnal.");
    }
  }
}

