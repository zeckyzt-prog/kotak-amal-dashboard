import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    update,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


// =========================
// FIREBASE CONFIG
// =========================

const firebaseConfig = {
    apiKey: "AIzaSyBOs6fbyuYd-9rYT-R87I0Xaysdwct7YIs",
    authDomain: "kotak-amal-iot-4e4bf.firebaseapp.com",
    databaseURL: "https://kotak-amal-iot-4e4bf-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kotak-amal-iot-4e4bf",
    storageBucket: "kotak-amal-iot-4e4bf.firebasestorage.app",
    messagingSenderId: "314821134224",
    appId: "1:314821134224:web:aa4075951edca60d38d515"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================
// HEARTBEAT
// =========================

let heartbeatTerakhir = 0;
let waktuHeartbeat = Date.now();

// =========================
// TOTAL DONASI
// =========================

onValue(ref(db, "kotakAmal/total"), (snapshot) => {

    const total = snapshot.val() || 0;

    document.getElementById("total").innerHTML =
        "Rp " + Number(total).toLocaleString("id-ID");

});

// =========================
// MASJID
// =========================

onValue(ref(db, "kotakAmal/masjid"), (snapshot) => {

    const total = snapshot.val() || 0;

    document.getElementById("masjid").innerHTML =
        "Rp " + Number(total).toLocaleString("id-ID");

});

// =========================
// ANAK YATIM
// =========================

onValue(ref(db, "kotakAmal/yatim"), (snapshot) => {

    const total = snapshot.val() || 0;

    document.getElementById("yatim").innerHTML =
        "Rp " + Number(total).toLocaleString("id-ID");

});

// =========================
// FAKIR MISKIN
// =========================

onValue(ref(db, "kotakAmal/fakir"), (snapshot) => {

    const total = snapshot.val() || 0;

    document.getElementById("fakir").innerHTML =
        "Rp " + Number(total).toLocaleString("id-ID");

});

// =========================
// GRAFIK DONASI
// =========================

const ctx = document.getElementById("chartDonasi");

const chart = new Chart(ctx, {

    type: "bar",

    data: {

        labels: [
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
            "Minggu"
        ],

        datasets: [{

            label: "Donasi (Rp)",

            data: [0, 0, 0, 0, 0, 0, 0],

            backgroundColor: [
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
                "#06b6d4",
                "#84cc16"
            ],

            borderRadius: 10

        }]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                display: false

            }

        },

        scales: {

            y: {

                beginAtZero: true

            }

        }

    }

});

// =========================
// UPDATE GRAFIK
// =========================

onValue(ref(db, "kotakAmal/statistik"), (snapshot) => {

    const data = snapshot.val();

    if (!data) return;

    chart.data.datasets[0].data = [

        data.senin || 0,
        data.selasa || 0,
        data.rabu || 0,
        data.kamis || 0,
        data.jumat || 0,
        data.sabtu || 0,
        data.minggu || 0

    ];

    chart.update();

});
// =========================
// RIWAYAT DONASI
// =========================

onValue(ref(db, "kotakAmal/riwayat"), (snapshot) => {

    const table = document.getElementById("historyTable");

    table.innerHTML = "";

    snapshot.forEach((child) => {

        const data = child.val();

        table.innerHTML += `
            <tr>
                <td>${data.waktu}</td>
                <td>${data.kategori}</td>
                <td>${data.nominal}</td>
            </tr>
        `;

    });

});
// =========================
// MONITORING SISTEM
// =========================
function updateBadge(id, status)
{
    const el = document.getElementById(id);

    el.innerHTML = status;

    if (
        status === "Connected" ||
        status === "Ready" ||
        status === "Safe" ||
        status === "Locked"
    )
    {
        el.className = "badge bg-success";
    }
    else if (
        status === "Offline" ||
        status === "Danger"
    )
    {
        el.className = "badge bg-danger";
    }
    else if (
        status === "Unknown" ||
        status === "Open"
    )
    {
        el.className = "badge bg-secondary";
    }
}
onValue(ref(db, "kotakAmal/monitoring"), (snapshot) => {

    const data = snapshot.val();

    if (!data) return;

    updateBadge("wifiStatus", data.wifi);
    updateBadge("firebaseStatus", data.firebase);
    updateBadge("telegramStatus", data.telegram);
    updateBadge("fingerStatus", data.fingerprint);
    updateBadge("lockStatus", data.lock);
    updateBadge("vibrationStatus", data.getar);

    // =========================
    // Heartbeat
    // =========================
    if (data.heartbeat != heartbeatTerakhir)
    {
        heartbeatTerakhir = data.heartbeat;
        waktuHeartbeat = Date.now();
    }

});
// =========================
// STATUS ESP32
// =========================

setInterval(() => {

    const selisih = Date.now() - waktuHeartbeat;

    if (selisih < 15000)
    {
        document.getElementById("esp32Status").innerHTML = "🟢 Online";
        document.getElementById("esp32Status").className = "text-success";

        document.getElementById("statusText").innerHTML = "ONLINE";
        document.getElementById("statusText").className = "text-success";
    }
    else
    {
        document.getElementById("esp32Status").innerHTML = "🔴 Offline";
        document.getElementById("esp32Status").className = "text-danger";

        document.getElementById("statusText").innerHTML = "OFFLINE";
        document.getElementById("statusText").className = "text-danger";

        document.getElementById("wifiStatus").innerHTML = "Offline";
        document.getElementById("firebaseStatus").innerHTML = "Offline";
        document.getElementById("telegramStatus").innerHTML = "Offline";
        document.getElementById("fingerStatus").innerHTML = "Offline";
        document.getElementById("lockStatus").innerHTML = "Unknown";
        document.getElementById("vibrationStatus").innerHTML = "Unknown";
    }

}, 1000);
// =========================
// RESET TOTAL DONASI
// =========================

document.getElementById("resetTotal").addEventListener("click", () => {

    const konfirmasi = confirm("Yakin ingin mereset total donasi?");

    if (!konfirmasi) return;

    update(ref(db, "kotakAmal"), {

        total: 0,
        masjid: 0,
        yatim: 0,
        fakir: 0

    });

    alert("Total donasi berhasil direset.");

});
// =========================
// RESET STATISTIK
// =========================

document.getElementById("resetStatistik").addEventListener("click", () => {

    if (!confirm("Reset statistik mingguan?")) return;

    update(ref(db, "kotakAmal/statistik"), {

        senin: 0,
        selasa: 0,
        rabu: 0,
        kamis: 0,
        jumat: 0,
        sabtu: 0,
        minggu: 0

    });

    alert("Statistik berhasil direset.");

});

// =========================
// HAPUS RIWAYAT
// =========================

document.getElementById("hapusRiwayat").addEventListener("click", () => {

    if (!confirm("Hapus seluruh riwayat donasi?")) return;

    remove(ref(db, "kotakAmal/riwayat"));

    alert("Riwayat berhasil dihapus.");

});

// =========================
// RESET SEMUA DATA
// =========================

document.getElementById("resetSemua").addEventListener("click", () => {

    if (!confirm("Reset semua data?")) return;

    update(ref(db, "kotakAmal"), {

        total: 0,
        masjid: 0,
        yatim: 0,
        fakir: 0

    });

    update(ref(db, "kotakAmal/statistik"), {

        senin: 0,
        selasa: 0,
        rabu: 0,
        kamis: 0,
        jumat: 0,
        sabtu: 0,
        minggu: 0

    });


    remove(ref(db, "kotakAmal/riwayat"));

    alert("Semua data berhasil direset.");

});

// =========================
// LOGIN ADMIN
// =========================

document.getElementById("loginBtn").addEventListener("click", async () => {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const snapshot = await get(ref(db, "kotakAmal/admin"));

    const admin = snapshot.val();

    if(username === admin.username && password === admin.password){

        alert("Login Berhasil");

        document.getElementById("loginStatus").innerHTML =
        "Status : Login";

        document.getElementById("loginStatus").className =
        "text-success";

        document.getElementById("loginBtn").style.display="none";

        document.getElementById("logoutBtn").style.display="inline-block";

        document.getElementById("resetTotal").disabled=false;
        document.getElementById("resetStatistik").disabled=false;
        document.getElementById("hapusRiwayat").disabled=false;
        document.getElementById("resetSemua").disabled=false;

    }else{

        alert("Username atau Password Salah");

    }

});
// =========================
// LOGOUT
// =========================

document.getElementById("logoutBtn").addEventListener("click",()=>{

    document.getElementById("username").value="";
    document.getElementById("password").value="";

    document.getElementById("loginBtn").style.display="inline-block";
    document.getElementById("logoutBtn").style.display="none";

    document.getElementById("loginStatus").innerHTML=
    "Status : Belum Login";

    document.getElementById("loginStatus").className=
    "text-danger";

    document.getElementById("resetTotal").disabled=true;
    document.getElementById("resetStatistik").disabled=true;
    document.getElementById("hapusRiwayat").disabled=true;
    document.getElementById("resetSemua").disabled=true;

});