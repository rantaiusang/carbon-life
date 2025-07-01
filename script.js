// script.js
let currentUser = null;
const sandbox = true;  // Flag sandbox untuk mengaktifkan mode sandbox

// Inisialisasi Pi SDK
window.Pi.init({ version: "2.0" });
const scopes = ['username', 'payments'];

// Fungsi untuk login Pi Network
window.Pi.authenticate(scopes, onIncompletePaymentFound)
  .then(auth => {
    currentUser = auth.user;
    document.getElementById('login-status').innerText = `👋 Halo, @${currentUser.username}`;
  })
  .catch(error => {
    document.getElementById('login-status').innerText = "❌ Gagal login Pi";
    console.error(error);
  });

// Fungsi untuk menangani pembayaran yang belum selesai
function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment", payment);
}

// Fungsi untuk menghitung emisi CO₂
function hitungEmisi() {
  const km = parseFloat(document.getElementById('kmMotor').value);
  const makan = document.getElementById('makanDaging').checked;
  const listrik = parseFloat(document.getElementById('listrik').value);

  const transport = km * 0.12;
  const food = makan ? 3.0 : 0.5;
  const energy = listrik * 0.85;
  const total = (transport + food + energy).toFixed(2);

  document.getElementById('hasil').innerText = `🔥 Emisi Hari Ini: ${total} kg CO₂`;
  document.getElementById('offsetButton').style.display = 'inline-block';
  window.emisiCO2 = total;
}

// Fungsi untuk melakukan pembayaran Pi
function bayarPi() {
  const jumlahPi = (0.01 * parseFloat(window.emisiCO2)).toFixed(2);

  // Cek apakah aplikasi berada dalam mode sandbox
  if (sandbox) {
    console.log(`Sandbox Mode: Transaksi simulasi, jumlah Pi yang akan dibayar: ${jumlahPi}`);
    alert("Sandbox Mode: Pembayaran tidak dilakukan di jaringan nyata.");
    return; // Menghentikan proses pembayaran
  }

  // Jika tidak dalam sandbox, lanjutkan proses pembayaran
  window.Pi.createPayment({
    amount: jumlahPi,
    memo: "Offset karbon pribadi",
    metadata: { carbon_kg: window.emisiCO2 }
  }, {
    onReadyForServerApproval(paymentId) {
      console.log("Siap untuk approval server", paymentId);
    },
    onReadyForServerCompletion(paymentId, txid) {
      console.log("Offset berhasil!", txid);
      alert("Terima kasih! Offset berhasil.");
    },
    onCancel(paymentId) {
      alert("Pembayaran dibatalkan.");
    },
    onError(error) {
      alert("Gagal melakukan pembayaran.");
      console.error(error);
    }
  });
}
