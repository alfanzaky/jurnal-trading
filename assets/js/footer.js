document.addEventListener("DOMContentLoaded", async () => {
  const footerContainer = document.getElementById("footerContainer");

  if (footerContainer) {
    try {
      const response = await fetch("/jurnal-trading/components/footer.html");
      const html = await response.text();
      footerContainer.innerHTML = html;
    } catch (err) {
      console.error("Gagal load footer:", err);
    }
  }
});

