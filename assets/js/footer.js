document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer = document.getElementById("footerContainer");
  if (!footerContainer) return;

  try {
    const response = await fetch("/jurnal-trading/components/footer.html");
    if (!response.ok) throw new Error("Gagal memuat file footer.html");

    const html = await response.text();
    footerContainer.innerHTML = html;

    // Trigger event custom jika ada script lain perlu tahu
    document.dispatchEvent(new Event("footerLoaded"));
  } catch (err) {
    console.error("❌ Gagal memuat footer:", err.message);
  }
});
