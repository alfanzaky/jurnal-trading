// Firestore instance
const db = firebase.firestore();

// 🔸 Tambah jurnal baru
async function addJurnal(userId, data) {
  try {
    await db.collection("jurnal").add({
      ...data,
      userId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("❌ Error addJurnal:", error);
    throw error;
  }
}

// 🔸 Update jurnal (edit)
async function updateJurnal(docId, newData) {
  try {
    await db.collection("jurnal").doc(docId).update(newData);
  } catch (error) {
    console.error("❌ Error updateJurnal:", error);
    throw error;
  }
}

// 🔸 Hapus jurnal (dipakai di jurnal.js langsung juga)
async function deleteJurnalById(docId) {
  try {
    await db.collection("jurnal").doc(docId).delete();
  } catch (error) {
    console.error("❌ Error deleteJurnal:", error);
    throw error;
  }
}

