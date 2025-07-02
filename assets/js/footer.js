document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer = document.getElementById("footerContainer");

  if (!footerContainer) return;

  try {
    const response = await fetch("/jurnal-trading/components/footer.html");
    if (!response.ok) throw new Error("Gagal memuat footer");
    const html = await response.text();
    footerContainer.innerHTML = html;
  } catch (err) {
    console.error("Gagal load footer:", err);
  }
});
