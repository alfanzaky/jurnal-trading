<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Jurnal Trading</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet"/>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <div id="navbarContainer"></div>

  <main class="container py-4">
    <h2 class="mb-4">Tambah Jurnal Trading</h2>
    <div class="card shadow-sm">
      <div class="card-body">
        <form id="jurnalForm" class="row g-3">
          <div class="col-md-4">
            <label for="tanggal" class="form-label">Tanggal</label>
            <input type="date" class="form-control" id="tanggal" required />
          </div>
          <div class="col-md-4">
            <label for="pair" class="form-label">Pair / Instrumen</label>
            <input type="text" class="form-control" id="pair" placeholder="Contoh: EUR/USD" required />
          </div>
          <div class="col-md-4">
            <label for="tipe" class="form-label">Tipe Order</label>
            <select class="form-select" id="tipe" required>
              <option value="">Pilih</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="entry" class="form-label">Entry Price</label>
            <input type="number" step="0.0001" class="form-control" id="entry" required />
          </div>
          <div class="col-md-4">
            <label for="exit" class="form-label">Exit Price</label>
            <input type="number" step="0.0001" class="form-control" id="exit" required />
          </div>
          <div class="col-md-4">
            <label for="profit" class="form-label">Profit / Loss</label>
            <input type="number" class="form-control" id="profit" required />
          </div>
          <div class="col-md-6">
            <label for="emosi" class="form-label">Emosi Saat Trading</label>
            <select class="form-select" id="emosi">
              <option value="">Pilih</option>
              <option value="Tenang">Tenang</option>
              <option value="Takut">Takut</option>
              <option value="Serakah">Serakah</option>
              <option value="Tergesa-gesa">Tergesa-gesa</option>
              <option value="Yakin">Yakin</option>
            </select>
          </div>
          <div class="col-md-6">
            <label for="catatan" class="form-label">Catatan Tambahan</label>
            <textarea class="form-control" id="catatan" rows="2" placeholder="Opsional..."></textarea>
          </div>
          <div class="col-12 text-end">
            <button type="submit" class="btn btn-primary">Simpan Jurnal</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabel Jurnal (placeholder, akan diisi dari Firestore) -->
    <div class="mt-5">
      <h4>Riwayat Jurnal</h4>
      <div class="table-responsive">
        <table class="table table-bordered table-hover mt-2">
          <thead class="table-dark">
            <tr>
              <th>Tanggal</th>
              <th>Pair</th>
              <th>Tipe</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Profit</th>
              <th>Emosi</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody id="jurnalTableBody">
            <!-- Diisi via JS -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <div id="footerContainer" class="mt-5"></div>

  <!-- Firebase & Script -->
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="/firebase/firebase-config.js"></script>
  <script src="/firebase/auth.js"></script>
  <script src="/firebase/db.js"></script>

  <!-- Komponen -->
  <script src="/assets/js/navbar.js"></script>
  <script src="/assets/js/footer.js"></script>

  <!-- Logic Jurnal -->
  <script src="/assets/js/jurnal.js"></script>
</body>
</html>
