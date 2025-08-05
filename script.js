// Firebase config ต้องตั้งค่าตามโปรเจกต์ของคุณ
const firebaseConfig = {
    apiKey: "IzaSyA3bHhvTuHTHV067wd3Ld_W2QZsZP1BUK4",
    authDomain: "cargo-tracking-1a5a3.firebaseapp.com",
    databaseURL: "https://cargo-tracking-1a5a3-default-rtdb.firebaseio.com",
    projectId: "cargo-tracking-1a5a3",
    storageBucket: "cargo-tracking-1a5a3.appspot.com",
    messagingSenderId: "860365394720",
    appId: "1:860365394720:web:21e9e28b3e1f83fd013d45"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


function searchData() {
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    if (!keyword) {
        alert("Please enter a keyword to search (e.g., JOB, HBL, MBL, INVOICE)");
        return;
    }
    // ดึงข้อมูล cargo ทั้งหมดจาก Firebase
    db.ref('cargo').once('value', snapshot => {
        const data = snapshot.val();
        if (!data) {
            alert("Data not found");
            return;
        }
        // ค้นหา row ที่ตรงกับ keyword
        const match = Object.values(data).find(row =>
            String(row.JOB || '').toLowerCase().includes(keyword) ||
            String(row.HBL || '').toLowerCase().includes(keyword) ||
            String(row.MBL || '').toLowerCase().includes(keyword) ||
            String(row.INVOICE || '').toLowerCase().includes(keyword)
        );
        if (match) {
            document.querySelector(".resultContent").innerHTML = `
                <div class="popup-part">
                    <div class="part-title">Cargo Detail : </div>
                    <div class="part-row">
                        <span><strong>JOB NO : </strong> ${match.JOB || "-"}</span>
                        <span><strong>Cnee Code : </strong> ${match.Cnee || "-"}</span>
                        <span><strong>House BL : </strong> ${match.HBL || "-"}</span>
                        <span><strong>Master BL : </strong> ${match.MBL || "-"}</span>
                        <span><strong>Invoice No.: </strong> ${match.INVOICE || "-"}</span>
                        <span><strong>Quantity : </strong> ${match.TYPE || "-"}</span>
                        <span style="grid-column: 1 / span 2;">
                            <strong>Container NO.: </strong> ${match.CntrNo || "-"}
                        </span>
                    </div>
                </div>
                <div class="popup-part">
                    <div class="part-title">Vessel Schedule : </div>
                    <div class="part-row">
                        <span style="grid-column: 1 / span 2;">
                            <strong>Vessel Name / Voyage NO.:</strong> ${match.Vessel || "same as BL"}
                        </span> 
                        <span><strong>E.T.D. :</strong> ${formatDisplayDate(match.ETD)}</span>
                        <span><strong>E.T.A. :</strong> ${formatDisplayDate(match.ETA)}</span>
                        <span><strong>A.T.A. :</strong> ${formatDisplayDate(match.ATA)}</span>
                        <span><strong>Terminal :</strong> ${match.Terminal || "Waiting Carrier Confirm"}</span>
                    </div>
                </div>
                <div class="popup-part">
                    <div class="part-title">Delivery Detail : </div>
                    <div class="part-row">
                        <span style="grid-column: 1 / span 2;">
                            <strong>Place of Delivery :</strong> ${match.POD || "Same as consignee address in BL"}
                        </span> 
                        <span><strong>Delivery Plan Date :</strong> ${formatDisplayDate(match.PLAN)}</span>
                        <span><strong>Delivery Time :</strong> ${formatTime(match.TIMEPLAN) || "-"}</span>
                        <span><strong>Delivery Actual Date :</strong> ${formatDisplayDate(match.ACTUAL)}</span>
                        <span><strong>Delivery Time :</strong> ${formatTime(match.TIMEACTUAL) || "TBA"}</span>
                    </div>
                </div>
                <div class="popup-part">
                    <div class="part-title">Status:</div>
                    <div class="part-row part-row-full">
                        <span style="grid-column: 1 / span 2;">
                            <strong> Process:</strong>
                            <span style="display:inline-block;vertical-align:middle;width:80%;height:4px;background:none;border-radius:20px;overflow:hidden;margin:0 12px 0 8px;">
                                <span style="display:inline-block;height:100%;background:#196;width:${getPercent(match.Status)}%;transition:width 0.4s;border-radius:10px;"></span>
                            </span>
                            <span style="font-weight:200;color:#222;">${getPercent(match.Status)}%</span>
                        </span>
                    </div>
                </div>
                <div class="popup-part">
                    <div class="part-title"> Remark :</div>
                    <div class="part-row">
                            <span style="grid-column: 1 / span 2;">
                            <strong> >> </strong> ${formatDateTimeHrs(match.Timeupdate) || "-"}
                            <strong> : </strong> ${match.Remark || "-"}
                        </span>
                    </div>
                </div>
            `;
            document.querySelector(".resultContent").classList.remove("resultContent-2col");
            document.getElementById("resultModel").style.display = "flex";
        } else {
            alert("Data not found");
        }
    });
}

function closeModal() {
    document.getElementById("resultModel").style.display = "none";
}

function printPopup() {
    document.querySelector('.close-btn').style.display = 'none';
    document.querySelector('.print-btn').style.display = 'none';

    const dt = new Date();
    const datetimeStr = dt.toLocaleString('th-TH', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const dtElem = document.querySelector('.print-datetime');
    dtElem.textContent = 'Print date: ' + datetimeStr;
    dtElem.style.display = 'block';

    window.print();

    document.querySelector('.close-btn').style.display = '';
    document.querySelector('.print-btn').style.display = '';
    dtElem.style.display = 'none';
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr; // ถ้าไม่ใช่วันที่ ให้คืนค่าเดิม
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

function formatTime(val) {
  // ถ้าเป็นตัวเลข เช่น 800 ให้แปลงเป็น 08:00 Hrs
  if (typeof val === 'number' || /^\d+$/.test(val)) {
    let str = val.toString().padStart(4, '0');
    return `${str.slice(0,2)}:${str.slice(2,4)} Hrs`;
  }
  // ถ้าเป็น string เช่น "08:00" ให้เติม Hrs
  if (typeof val === 'string' && /^\d{2}:\d{2}$/.test(val)) {
    return `${val} Hrs`;
  }
  return val || "";
}

function formatDateTimeHrs(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hour}:${min} Hrs`;
}

function getPercent(val) {
  if (typeof val === 'number') {
    if (val <= 1) return Math.round(val * 100); // 1 => 100, 0.8 => 80
    return Math.round(val); // 80 => 80
  }
  if (typeof val === 'string') {
    if (val.includes('%')) return parseInt(val); // "80%" => 80
    let num = Number(val);
    if (!isNaN(num)) {
      if (num <= 1) return Math.round(num * 100);
      return Math.round(num);
    }
  }
  return 0;
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            searchData();
        }
    });
});

// Header popup functions
    function openLogin() {
        document.getElementById('loginPopup').style.display = 'flex';
    }
    function closeLogin() {
        document.getElementById('loginPopup').style.display = 'none';
    }
    function openContact() {
        document.getElementById('contactPopup').style.display = 'flex';
    }
    function closeContact() {
        document.getElementById('contactPopup').style.display = 'none';
    }
    

    // เพิ่มข้อมูลผู้ใช้และสิทธิ์
    const users = [
        { id: "admin", pass: "1234", role: "admin" },
        { id: "user1", pass: "userpass", role: "user" },
        { id: "user2", pass: "userpass2", role: "user" }
    ];

    function handleLogin(e) {
        e.preventDefault();
        const id = document.getElementById('loginId').value;
        const pass = document.getElementById('loginPass').value;
        // ค้นหาผู้ใช้
        const found = users.find(u => u.id === id && u.pass === pass);
        if (found) {
            // ไปหน้าตามสิทธิ์
            if (found.role === "admin") {
                window.location.href = "dashboard.html";
            } else if (found.role === "user") {
                window.location.href = "user.html";
            }
        } else {
            alert("รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง");
        }
        return false;

    }

