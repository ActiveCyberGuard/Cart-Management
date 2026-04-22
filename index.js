// ══════════════════════════════════════════════════
//  DATA — localStorage helpers
// ══════════════════════════════════════════════════
function loadUsers() {
  try { return JSON.parse(localStorage.getItem("uc_users") || "[]"); }
  catch (e) { return []; }
}
function saveUsers(u) { localStorage.setItem("uc_users", JSON.stringify(u)); }
function loadMe() {
  try { return JSON.parse(localStorage.getItem("uc_me") || "null"); }
  catch (e) { return null; }
}
function saveMe(u) { localStorage.setItem("uc_me", u ? JSON.stringify(u) : "null"); }

function loadDrivers() {
  try { return JSON.parse(localStorage.getItem("uc_drivers") || "[]"); }
  catch (e) { return []; }
}
function saveDrivers(d) { localStorage.setItem("uc_drivers", JSON.stringify(d)); }
function loadDriverMe() {
  try { return JSON.parse(localStorage.getItem("uc_driver_me") || "null"); }
  catch (e) { return null; }
}
function saveDriverMe(d) { localStorage.setItem("uc_driver_me", d ? JSON.stringify(d) : "null"); }

// Seed default passengers
if (loadUsers().length === 0) {
  saveUsers([
    { id: "2021001", name: "রহিম আহমেদ",   type: "student", dept: "CSE",   password: "1234", balance: 250 },
    { id: "2021002", name: "করিম হোসেন",   type: "student", dept: "Math",  password: "1234", balance: 180 },
    { id: "S001",    name: "ফারহানা বেগম", type: "staff",   dept: "Admin", password: "1234", balance: 500 },
  ]);
}
// Seed default drivers
if (loadDrivers().length === 0) {
  saveDrivers([
    { id: "DRV001", name: "আব্দুল করিম",   phone: "01711000001", cartId: "UC-101", password: "1234", todayRides: 5,  todayEarning: 50,  online: false },
    { id: "DRV002", name: "মোহাম্মদ আলী", phone: "01711000002", cartId: "UC-102", password: "1234", todayRides: 3,  todayEarning: 30,  online: false },
    { id: "DRV003", name: "জামাল উদ্দিন",  phone: "01711000003", cartId: "UC-103", password: "1234", todayRides: 7,  todayEarning: 65,  online: false },
  ]);
}

let currentUser   = loadMe();
let currentDriver = loadDriverMe();

// ══════════════════════════════════════════════════
//  JU CAMPUS DATA
// ══════════════════════════════════════════════════
const LOCS = {
  maingate:      { name: "মেইন গেট",                lat: 23.8776, lng: 90.2687 },
  "shahid-minar":{ name: "শহিদ মিনার",              lat: 23.8792, lng: 90.2712 },
  bottola:       { name: "বটতলা",                   lat: 23.8804, lng: 90.2735 },
  srj:           { name: "শহিদ রফিক-জব্বার হল",     lat: 23.8829, lng: 90.2776 },
  "notun-kola":  { name: "নতুন কলা ভবন",             lat: 23.8816, lng: 90.2754 },
  "puraton-kola":{ name: "পুরাতন কলা ভবন",           lat: 23.8841, lng: 90.2791 },
};

// Live location from: https://maps.app.goo.gl/ZjN1SCz5HVaifm15A
// Jahangirnagar University area — using real JU coordinate as live location anchor
const LIVE_LOCATION_ANCHOR = { lat: 23.8805, lng: 90.2745 };

const CARTS = [
  { id: "UC-101", driver: "আব্দুল করিম",   lat: 23.8776, lng: 90.2687, passengers: 3, capacity: 6, status: "active",   route: "মেইন গেট → শহিদ রফিক-জব্বার হল", driverId: "DRV001" },
  { id: "UC-102", driver: "মোহাম্মদ আলী", lat: 23.8792, lng: 90.2712, passengers: 5, capacity: 8, status: "active",   route: "মেইন গেট → বিশমাইল",              driverId: "DRV002" },
  { id: "UC-103", driver: "জামাল উদ্দিন",  lat: 23.8804, lng: 90.2735, passengers: 2, capacity: 6, status: "active",   route: "প্রান্তিক গেট → শহিদ মিনার",     driverId: "DRV003" },
  { id: "UC-104", driver: "রফিক মিয়া",    lat: 23.8829, lng: 90.2776, passengers: 0, capacity: 8, status: "inactive", route: "বিরতি",                           driverId: null },
  { id: "UC-105", driver: "হাসান আলী",     lat: 23.8841, lng: 90.2791, passengers: 0, capacity: 6, status: "inactive", route: "বিরতি",                           driverId: null },
];

const FARES = {
  "maingate-srj":          { distance: 1.8,  student: 10, staff: 10, guest: 10 },
  "shahid-minar-srj":      { distance: 1.2,  student: 8,  staff: 8,  guest: 8  },
  "bottola-srj":           { distance: 0.95, student: 5,  staff: 5,  guest: 5  },
  "maingate-shahid-minar": { distance: 0.6,  student: 5,  staff: 5,  guest: 5  },
  "notun-kola-srj":        { distance: 1.4,  student: 9,  staff: 9,  guest: 9  },
  "puraton-kola-srj":      { distance: 1.6,  student: 10, staff: 10, guest: 10 },
};

// ══════════════════════════════════════════════════
//  MAP
// ══════════════════════════════════════════════════
let leafMap, cartMarkers = [];

function initMap() {
  leafMap = L.map("map").setView([LIVE_LOCATION_ANCHOR.lat, LIVE_LOCATION_ANCHOR.lng], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(leafMap);

  // Location markers
  Object.values(LOCS).forEach((loc) => {
    L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="background:rgba(40,167,69,.9);color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">${loc.name}</div>`,
        iconAnchor: [40, 10],
      }),
    }).addTo(leafMap);
  });

  // Live location pin (from provided Google Maps link)
  L.marker([LIVE_LOCATION_ANCHOR.lat, LIVE_LOCATION_ANCHOR.lng], {
    icon: L.divIcon({
      className: "",
      html: `<div style="background:#e53935;color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(229,57,53,.5);animation:none">
        📍 লাইভ লোকেশন
      </div>`,
      iconAnchor: [50, 10],
    }),
  }).addTo(leafMap).bindPopup(`<b>Jahangirnagar University</b><br>Live location anchor`);

  renderMarkers();
  setInterval(moveSim, 3000);
}

function renderMarkers() {
  cartMarkers.forEach((m) => leafMap.removeLayer(m));
  cartMarkers = [];
  CARTS.filter((c) => c.status === "active").forEach((cart) => {
    const p   = cart.passengers / cart.capacity;
    const col = p >= 1 ? "#dc3545" : p >= 0.7 ? "#ffc107" : "#28a745";
    const m = L.marker([cart.lat, cart.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="background:white;border:3px solid ${col};border-radius:50%;width:44px;height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer"><span style="font-size:19px">🚗</span><span style="font-size:9px;color:${col};font-weight:700">${cart.passengers}/${cart.capacity}</span></div>`,
        iconAnchor: [22, 22],
      }),
    }).addTo(leafMap);
    m.bindPopup(
      `<div style="text-align:center;font-family:'Segoe UI',sans-serif">
        <b style="color:#667eea">${cart.id}</b><br>
        ড্রাইভার: ${cart.driver}<br>
        যাত্রী: <span style="color:${col};font-weight:700">${cart.passengers}/${cart.capacity}</span><br>
        <small style="color:#888">রুট: ${cart.route}</small>
       </div>`
    );
    cartMarkers.push(m);
  });
}

function moveSim() {
  CARTS.forEach((c) => {
    if (c.status === "active") {
      c.lat += (Math.random() - 0.5) * 0.0003;
      c.lng += (Math.random() - 0.5) * 0.0003;
      c.lat = Math.min(Math.max(c.lat, 23.875), 23.886);
      c.lng = Math.min(Math.max(c.lng, 90.265), 90.281);
    }
  });
  renderMarkers();
  renderCartList();
  updateStats();
}

// ══════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════
function updateStats() {
  const act  = CARTS.filter((c) => c.status === "active");
  const pass = CARTS.reduce((s, c) => s + c.passengers, 0);
  const free = act.reduce((s, c) => s + (c.capacity - c.passengers), 0);
  document.getElementById("sTot").textContent = CARTS.length;
  document.getElementById("sAct").textContent = act.length;
  document.getElementById("sPas").textContent = pass;
  document.getElementById("sFre").textContent = free;
}

// ══════════════════════════════════════════════════
//  CART LIST
// ══════════════════════════════════════════════════
function renderCartList() {
  const con = document.getElementById("cartListContainer");
  con.innerHTML = "";
  CARTS.filter((c) => c.status === "active").forEach((cart) => {
    const p    = cart.passengers / cart.capacity;
    const fc   = p >= 1 ? "full" : p >= 0.7 ? "mid" : "";
    const free = cart.capacity - cart.passengers;
    const el   = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div class="cart-info">
        <div class="cart-number">${cart.id}</div>
        <div class="cart-status active">চলমান</div>
        <div class="cart-passengers">যাত্রী: ${cart.passengers}/${cart.capacity} &nbsp;|&nbsp; <span style="color:#28a745;font-weight:600">খালি: ${free}</span></div>
        <div class="seat-text">
          <span>${Math.round(p * 100)}% পূর্ণ</span>
          <span>রুট: ${cart.route}</span>
        </div>
        <div class="seat-bar"><div class="seat-fill ${fc}" style="width:${Math.round(p * 100)}%"></div></div>
      </div>
      <div class="cart-actions">
        <button class="btn-secondary" onclick="openTrackModal('${cart.id}')"> ট্র্যাক করুন</button>
        <button class="btn-primary"   onclick="focusCart('${cart.id}')"  style="font-size:13px;padding:8px 14px">🗺 ম্যাপে দেখুন</button>
      </div>`;
    con.appendChild(el);
  });
}

// Focus on map tab
function focusCart(id) {
  const cart = CARTS.find((c) => c.id === id);
  if (!cart) return;
  goTab("map", document.querySelectorAll(".tab-btn")[0]);
  leafMap.setView([cart.lat, cart.lng], 18);
  const idx = CARTS.filter((c) => c.status === "active").findIndex((c) => c.id === id);
  if (cartMarkers[idx]) cartMarkers[idx].openPopup();
}

// ── Track Modal with moving map ──
let trackMap = null, trackMarker = null, trackInterval = null;

function openTrackModal(cartId) {
  const cart = CARTS.find((c) => c.id === cartId);
  if (!cart) return;

  document.getElementById("trackModalTitle").textContent = `🚗 ${cart.id} — লাইভ ট্র্যাকিং`;
  document.getElementById("trackModal").classList.add("open");

  // Build info box
  const p = cart.passengers / cart.capacity;
  const col = p >= 1 ? "#dc3545" : p >= 0.7 ? "#ffc107" : "#28a745";
  document.getElementById("trackInfo").innerHTML = `
    <div style="grid-column:1/-1;margin-bottom:6px">
      <span class="track-live-badge">লাইভ</span>
    </div>
    <div><span>কার্ট নং</span><span>${cart.id}</span></div>
    <div><span>ড্রাইভার</span><span>${cart.driver}</span></div>
    <div><span>রুট</span><span>${cart.route}</span></div>
    <div><span>যাত্রী</span><span style="color:${col}">${cart.passengers} / ${cart.capacity}</span></div>
    <div style="grid-column:1/-1">
      <span>অবস্থান (লাইভ)</span>
      <span>lat: ${cart.lat.toFixed(5)}, lng: ${cart.lng.toFixed(5)}</span>
    </div>`;

  // Init track map after modal opens (needs DOM to be visible)
  setTimeout(() => {
    if (trackMap) {
      trackMap.remove();
      trackMap = null;
    }
    trackMap = L.map("trackMap").setView([cart.lat, cart.lng], 17);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(trackMap);

    // Route polyline (static demo between start/end)
    const routeCoords = buildRouteCoords(cart);
    if (routeCoords.length > 1) {
      L.polyline(routeCoords, { color: "#667eea", weight: 4, opacity: 0.7, dashArray: "6 4" }).addTo(trackMap);
    }

    // Moving cart marker
    trackMarker = L.marker([cart.lat, cart.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="background:white;border:3px solid ${col};border-radius:50%;width:50px;height:50px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3)">
          <span style="font-size:22px">🚗</span>
          <span style="font-size:9px;color:${col};font-weight:700">${cart.passengers}/${cart.capacity}</span>
        </div>`,
        iconAnchor: [25, 25],
      }),
    }).addTo(trackMap);

    trackMarker.bindPopup(
      `<b>${cart.id}</b><br>${cart.driver}<br><small>${cart.route}</small>`
    ).openPopup();

    // Location markers on track map
    routeCoords.forEach((coord, i) => {
      L.circleMarker(coord, { radius: 6, color: "#28a745", fillColor: "#28a745", fillOpacity: 0.8 }).addTo(trackMap);
    });

    // Live movement update
    if (trackInterval) clearInterval(trackInterval);
    trackInterval = setInterval(() => {
      const updated = CARTS.find((c) => c.id === cartId);
      if (!updated || !trackMarker) return;
      trackMarker.setLatLng([updated.lat, updated.lng]);
      trackMap.panTo([updated.lat, updated.lng], { animate: true, duration: 1.5 });

      // Update info panel
      document.querySelectorAll("#trackInfo div")[4].querySelector("span:last-child").textContent =
        `lat: ${updated.lat.toFixed(5)}, lng: ${updated.lng.toFixed(5)}`;
    }, 3000);

  }, 200);
}

function buildRouteCoords(cart) {
  // Simple demo: draw a route between known stops based on cart route text
  const coords = [];
  if (cart.route.includes("মেইন গেট")) coords.push([LOCS.maingate.lat, LOCS.maingate.lng]);
  if (cart.route.includes("শহিদ মিনার")) coords.push([LOCS["shahid-minar"].lat, LOCS["shahid-minar"].lng]);
  if (cart.route.includes("রফিক-জব্বার") || cart.route.includes("বিশমাইল")) coords.push([LOCS.srj.lat, LOCS.srj.lng]);
  if (cart.route.includes("প্রান্তিক")) {
    coords.unshift([23.8762, 90.2660]); // approximate prantic gate
    coords.push([LOCS["shahid-minar"].lat, LOCS["shahid-minar"].lng]);
  }
  // Add cart's current position
  coords.push([cart.lat, cart.lng]);
  return coords;
}

function closeTrackModal() {
  document.getElementById("trackModal").classList.remove("open");
  if (trackInterval) { clearInterval(trackInterval); trackInterval = null; }
  if (trackMap) { trackMap.remove(); trackMap = null; }
  trackMarker = null;
}

// ══════════════════════════════════════════════════
//  TAB
// ══════════════════════════════════════════════════
function goTab(name, btn) {
  document.querySelectorAll(".tab-content").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById(name + "Tab").classList.add("active");
  if (btn) btn.classList.add("active");
}

// ══════════════════════════════════════════════════
//  AUTH — Role switcher
// ══════════════════════════════════════════════════
let currentRole = "passenger"; // "passenger" | "driver"

function openAuth() {
  document.getElementById("authModal").classList.add("open");
}
function closeAuth() {
  document.getElementById("authModal").classList.remove("open");
  resetPassengerForms();
  resetDriverForms();
  switchRole("passenger");
}

function switchRole(role) {
  currentRole = role;
  document.getElementById("rolePassenger").classList.toggle("active", role === "passenger");
  document.getElementById("roleDriver").classList.toggle("active", role === "driver");
  document.getElementById("passengerSection").style.display = role === "passenger" ? "block" : "none";
  document.getElementById("driverSection").style.display   = role === "driver"    ? "block" : "none";

  // If driver is already logged in, show dashboard immediately
  if (role === "driver" && currentDriver) {
    showDriverDashboard(currentDriver);
  }
}

// ── PASSENGER LOGIN / REGISTER ──
function switchMTab(t) {
  document.getElementById("mtLogin").classList.toggle("active", t === "login");
  document.getElementById("mtReg").classList.toggle("active", t === "register");
  document.getElementById("loginForm").style.display  = t === "login"    ? "block" : "none";
  document.getElementById("regForm").style.display    = t === "register" ? "block" : "none";
  document.getElementById("qrResultBox").style.display = "none";
}

function doLogin() {
  const id = document.getElementById("lId").value.trim();
  const pw = document.getElementById("lPass").value;
  if (!id || !pw) { toast("⚠️", "আইডি ও পাসওয়ার্ড লিখুন", "warn"); return; }
  const user = loadUsers().find((u) => u.id === id && u.password === pw);
  if (!user) { toast("❌", "ভুল আইডি বা পাসওয়ার্ড!", "err"); return; }
  currentUser = user;
  saveMe(user);
  updateUserUI();
  closeAuth();
  toast("✓", `স্বাগতম, ${user.name}!`, "ok");
}

function doRegister() {
  const Sname = document.getElementById("rName").value.trim();
  const id    = document.getElementById("rId").value.trim();
  const type  = document.getElementById("rType").value;
  const dept  = document.getElementById("rDept").value.trim();
  const pw    = document.getElementById("rPass").value;
  if (!Sname || !id || !dept || !pw) { toast("⚠️", "সব ঘর পূরণ করুন", "warn"); return; }
  if (pw.length < 6) { toast("⚠️", "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", "warn"); return; }
  const users = loadUsers();
  if (users.find((u) => u.id === id)) { toast("❌", "এই আইডি ইতিমধ্যে নিবন্ধিত!", "err"); return; }
  const u = { id, name: Sname, type, dept, password: pw, balance: 100 };
  users.push(u);
  saveUsers(users);
  currentUser = u;
  saveMe(u);
  updateUserUI();
  showQR(u);
  toast("✓", "রেজিস্ট্রেশন সফল! QR কোড তৈরি হয়েছে", "ok");
}

function showQR(user) {
  document.getElementById("loginForm").style.display  = "none";
  document.getElementById("regForm").style.display    = "none";
  document.getElementById("qrResultBox").style.display = "block";
  document.getElementById("qrUserName").textContent = user.name;
  document.getElementById("qrUserId").textContent   = `আইডি: ${user.id} • ${user.type === "student" ? "স্টুডেন্ট" : "স্টাফ"} • ${user.dept}`;
  const div = document.getElementById("qrGenDiv");
  div.innerHTML = "";
  new QRCode(div, {
    text: JSON.stringify({ id: user.id, name: user.name, type: user.type }),
    width: 200, height: 200,
    colorDark: "#333", colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function downloadQR() {
  setTimeout(() => {
    const canvas = document.querySelector("#qrGenDiv canvas");
    if (!canvas) { toast("❌", "QR পাওয়া যায়নি", "err"); return; }
    const a = document.createElement("a");
    a.download = `unicart_${currentUser.id}.png`;
    a.href = canvas.toDataURL();
    a.click();
    toast("✓", "QR ডাউনলোড হচ্ছে...", "ok");
  }, 100);
}

function resetPassengerForms() {
  document.getElementById("qrResultBox").style.display = "none";
  document.getElementById("loginForm").style.display   = "block";
  document.getElementById("regForm").style.display     = "none";
  document.getElementById("mtLogin").classList.add("active");
  document.getElementById("mtReg").classList.remove("active");
}

// ── DRIVER LOGIN / REGISTER ──
function switchDriverTab(t) {
  document.getElementById("dtLogin").classList.toggle("active", t === "login");
  document.getElementById("dtReg").classList.toggle("active", t === "register");
  document.getElementById("driverLoginForm").style.display = t === "login"    ? "block" : "none";
  document.getElementById("driverRegForm").style.display   = t === "register" ? "block" : "none";
  document.getElementById("driverDashboard").style.display = "none";
}

function doDriverLogin() {
  const id = document.getElementById("dlId").value.trim();
  const pw = document.getElementById("dlPass").value;
  if (!id || !pw) { toast("⚠️", "আইডি ও পাসওয়ার্ড লিখুন", "warn"); return; }
  const driver = loadDrivers().find((d) => d.id === id && d.password === pw);
  if (!driver) { toast("❌", "ভুল ড্রাইভার আইডি বা পাসওয়ার্ড!", "err"); return; }
  currentDriver = driver;
  saveDriverMe(driver);
  showDriverDashboard(driver);
  updateUserUI();
  toast("✓", `স্বাগতম, ${driver.name} ভাই!`, "ok");
}

function doDriverRegister() {
  const name  = document.getElementById("drName").value.trim();
  const id    = document.getElementById("drId").value.trim();
  const phone = document.getElementById("drPhone").value.trim();
  const cartId= document.getElementById("drCart").value;
  const pw    = document.getElementById("drPass").value;
  if (!name || !id || !phone || !pw) { toast("⚠️", "সব ঘর পূরণ করুন", "warn"); return; }
  if (pw.length < 6) { toast("⚠️", "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", "warn"); return; }
  const drivers = loadDrivers();
  if (drivers.find((d) => d.id === id)) { toast("❌", "এই ড্রাইভার আইডি ইতিমধ্যে নিবন্ধিত!", "err"); return; }
  const d = { id, name, phone, cartId, password: pw, todayRides: 0, todayEarning: 0, online: false };
  drivers.push(d);
  saveDrivers(drivers);
  currentDriver = d;
  saveDriverMe(d);
  // Assign driver to cart
  const cart = CARTS.find((c) => c.id === cartId);
  if (cart) { cart.driver = name; cart.driverId = id; }
  showDriverDashboard(d);
  updateUserUI();
  toast("✓", `রেজিস্ট্রেশন সফল! স্বাগতম, ${name} ভাই!`, "ok");
}

function showDriverDashboard(driver) {
  document.getElementById("driverLoginForm").style.display = "none";
  document.getElementById("driverRegForm").style.display   = "none";
  document.getElementById("driverDashboard").style.display = "block";
  document.getElementById("driverWelcomeName").textContent = driver.name;
  document.getElementById("driverCartId").textContent      = `কার্ট: ${driver.cartId} | আইডি: ${driver.id}`;
  document.getElementById("dTodayRides").textContent       = driver.todayRides;
  document.getElementById("dTodayEarning").textContent     = `৳${driver.todayEarning}`;

  const toggle = document.getElementById("driverStatusToggle");
  toggle.checked = driver.online || false;
  document.getElementById("driverStatusLabel").textContent  = driver.online ? "অনলাইন" : "অফলাইন";
  document.getElementById("driverStatusLabel").style.color  = driver.online ? "#28a745" : "#dc3545";
}

function toggleDriverStatus() {
  if (!currentDriver) return;
  currentDriver.online = document.getElementById("driverStatusToggle").checked;
  document.getElementById("driverStatusLabel").textContent = currentDriver.online ? "অনলাইন" : "অফলাইন";
  document.getElementById("driverStatusLabel").style.color = currentDriver.online ? "#28a745" : "#dc3545";

  // Update cart status
  const cart = CARTS.find((c) => c.id === currentDriver.cartId);
  if (cart) {
    cart.status = currentDriver.online ? "active" : "inactive";
    renderMarkers();
    renderCartList();
    updateStats();
  }

  // Persist
  const drivers = loadDrivers();
  const idx = drivers.findIndex((d) => d.id === currentDriver.id);
  if (idx > -1) { drivers[idx].online = currentDriver.online; saveDrivers(drivers); }
  saveDriverMe(currentDriver);

  toast(currentDriver.online ? "🟢" : "🔴",
    currentDriver.online ? "আপনি এখন অনলাইন!" : "আপনি অফলাইন হয়েছেন", "ok");
}

function doDriverLogout() {
  if (!currentDriver) return;
  // Set cart inactive on logout
  const cart = CARTS.find((c) => c.id === currentDriver.cartId);
  if (cart) { cart.status = "inactive"; }
  currentDriver = null;
  saveDriverMe(null);
  renderMarkers(); renderCartList(); updateStats();
  closeAuth();
  updateUserUI();
  toast("👋", "ড্রাইভার লগআউট সফল", "ok");
}

function resetDriverForms() {
  document.getElementById("driverLoginForm").style.display = "block";
  document.getElementById("driverRegForm").style.display   = "none";
  document.getElementById("driverDashboard").style.display = "none";
  document.getElementById("dtLogin").classList.add("active");
  document.getElementById("dtReg").classList.remove("active");
}

// ── UPDATE HEADER UI ──
function updateUserUI() {
  const btn = document.getElementById("authBtn");

  if (currentUser) {
    // Passenger logged in
    document.getElementById("userName").textContent = "👤 " + currentUser.name;
    document.getElementById("userName").className   = "loggedin";
    document.getElementById("walBal").textContent   = currentUser.balance;
    btn.textContent = "লগআউট";
    btn.onclick     = doLogout;
    btn.className   = "btn-danger";
  } else if (currentDriver) {
    // Driver logged in
    document.getElementById("userName").textContent = "🚗 " + currentDriver.name;
    document.getElementById("userName").className   = "loggedin";
    btn.textContent = "ড্রাইভার লগআউট";
    btn.onclick     = () => {
      openAuth();
      switchRole("driver");
      showDriverDashboard(currentDriver);
    };
    btn.className = "btn-secondary";
  } else {
    // Not logged in
    document.getElementById("userName").textContent = "রেজিস্ট্রার/ লগইন করুন";
    document.getElementById("userName").className   = "";
    btn.textContent = "লগইন";
    btn.onclick     = openAuth;
    btn.className   = "btn-secondary";
  }
}

function doLogout() {
  currentUser = null;
  saveMe(null);
  updateUserUI();
  toast("👋", "লগআউট সফল", "ok");
}

// ══════════════════════════════════════════════════
//  LIVE QR SCANNER
// ══════════════════════════════════════════════════
let camStream = null, scanLoop = null, scannedUser = null;

function toggleCamera() {
  if (camStream) { stopCamera(); return; }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      camStream = stream;
      const v = document.getElementById("videoEl");
      v.srcObject = stream;
      v.classList.add("on");
      document.getElementById("qrPlaceholder").style.display = "none";
      document.getElementById("camBtn").textContent = "ক্যামেরা বন্ধ করুন";
      startLoop();
    })
    .catch(() => toast("❌", "ক্যামেরা অ্যাক্সেস দিন অথবা ম্যানুয়াল আইডি ব্যবহার করুন", "err"));
}

function stopCamera() {
  if (camStream) { camStream.getTracks().forEach((t) => t.stop()); camStream = null; }
  if (scanLoop) { cancelAnimationFrame(scanLoop); scanLoop = null; }
  const v = document.getElementById("videoEl");
  v.classList.remove("on");
  document.getElementById("qrPlaceholder").style.display = "block";
  document.getElementById("camBtn").textContent = "ক্যামেরা চালু করুন";
}

function startLoop() {
  const v = document.getElementById("videoEl"),
        c = document.getElementById("qrCanvas"),
        ctx = c.getContext("2d");
  function tick() {
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      c.height = v.videoHeight; c.width = v.videoWidth;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (code) {
        try {
          const data = JSON.parse(code.data);
          if (data.id && data.name) {
            const user = loadUsers().find((u) => u.id === data.id);
            if (user) { showScanResult(user); stopCamera(); return; }
            else toast("❌", "অজানা QR — নিবন্ধিত নয়", "err");
          }
        } catch (e) { toast("⚠️", "QR পড়া যাচ্ছে না", "warn"); }
      }
    }
    scanLoop = requestAnimationFrame(tick);
  }
  scanLoop = requestAnimationFrame(tick);
}

function verifyManual() {
  const id = document.getElementById("manId").value.trim();
  if (!id) { toast("⚠️", "আইডি লিখুন", "warn"); return; }
  const user = loadUsers().find((u) => u.id === id);
  if (!user) { toast("❌", "এই আইডি নিবন্ধিত নয়", "err"); return; }
  showScanResult(user);
}

function showScanResult(user) {
  scannedUser = user;
  document.getElementById("sName").textContent = user.name;
  document.getElementById("sId").textContent   = user.id;
  document.getElementById("sType").textContent = user.type === "student" ? "🎓 স্টুডেন্ট" : "👨‍💼 স্টাফ";
  document.getElementById("sBal").textContent  = user.balance;
  document.getElementById("scanResult").style.display = "block";
  toast("✓", `${user.name} যাচাই সম্পন্ন`, "ok");
}

function confirmBoard() {
  if (!scannedUser) return;
  const cart = CARTS.find((c) => c.status === "active" && c.passengers < c.capacity);
  if (cart) {
    cart.passengers++;
    // Update driver stats if applicable
    if (cart.driverId) {
      const drivers = loadDrivers();
      const di = drivers.findIndex((d) => d.id === cart.driverId);
      if (di > -1) {
        drivers[di].todayRides++;
        drivers[di].todayEarning += 10;
        saveDrivers(drivers);
        if (currentDriver && currentDriver.id === cart.driverId) {
          currentDriver = drivers[di];
          saveDriverMe(currentDriver);
          document.getElementById("dTodayRides").textContent   = currentDriver.todayRides;
          document.getElementById("dTodayEarning").textContent = `৳${currentDriver.todayEarning}`;
        }
      }
    }
    renderCartList(); updateStats(); renderMarkers();
  }
  toast("🚗", `${scannedUser.name} সফলভাবে বোর্ড হয়েছেন!`, "ok");
  cancelScan();
}

function cancelScan() {
  scannedUser = null;
  document.getElementById("scanResult").style.display = "none";
  document.getElementById("manId").value = "";
}

// ══════════════════════════════════════════════════
//  FARE
// ══════════════════════════════════════════════════
function calculateFare() {
  const from = document.getElementById("fromLocation").value;
  const to   = document.getElementById("toLocation").value;
  const type = document.getElementById("userType").value;
  if (!from || !to) { toast("⚠️", "শুরু ও গন্তব্য নির্বাচন করুন", "warn"); return; }
  if (from === to)  { toast("⚠️", "একই স্থান নির্বাচন করা যাবে না", "warn"); return; }
  const rule = FARES[`${from}-${to}`] || FARES[`${to}-${from}`];
  let dist = 1.0, fare = type === "student" ? 8 : type === "staff" ? 9 : 10;
  if (rule) { dist = rule.distance; fare = rule[type]; }
  const names = { student: "স্টুডেন্ট", staff: "স্টাফ", guest: "অতিথি" };
  document.getElementById("fareDistance").textContent = dist + " km";
  document.getElementById("fareType").textContent     = names[type];
  document.getElementById("totalFare").textContent    = "৳" + fare;
  document.getElementById("fareResult").style.display = "block";
}

// ══════════════════════════════════════════════════
//  TOPUP
// ══════════════════════════════════════════════════
function openTopup() {
  if (!currentUser) { toast("⚠️", "প্রথমে লগইন করুন", "warn"); openAuth(); return; }
  document.getElementById("topupModal").classList.add("open");
}
function closeTopup() { document.getElementById("topupModal").classList.remove("open"); }
function setTP(v) { document.getElementById("tpAmt").value = v; }
function doTopup() {
  const amt = parseFloat(document.getElementById("tpAmt").value);
  if (!amt || amt <= 0) { toast("⚠️", "সঠিক পরিমাণ লিখুন", "warn"); return; }
  currentUser.balance += amt;
  const users = loadUsers(), i = users.findIndex((u) => u.id === currentUser.id);
  if (i > -1) { users[i].balance = currentUser.balance; saveUsers(users); }
  saveMe(currentUser);
  document.getElementById("walBal").textContent = currentUser.balance;
  closeTopup();
  toast("💰", `৳${amt} সফলভাবে যোগ হয়েছে!`, "ok");
}

// ══════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════
function toast(icon, msg, type = "ok") {
  const t = document.getElementById("toast");
  document.getElementById("t-ico").textContent = icon;
  document.getElementById("t-msg").textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3200);
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
window.onload = () => {
  initMap();
  renderCartList();
  updateStats();
  updateUserUI();

  // If driver was logged in previously, restore online status
  if (currentDriver) {
    const cart = CARTS.find((c) => c.id === currentDriver.cartId);
    if (cart && currentDriver.online) cart.status = "active";
    renderMarkers(); renderCartList(); updateStats();
  }

  // Close modals on outside click
  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) {
        m.classList.remove("open");
        if (m.id === "trackModal") closeTrackModal();
      }
    });
  });

  // Stat pulse animation
  setInterval(() => {
    document.querySelectorAll(".stat-value").forEach((s) => {
      s.style.transform = "scale(1.1)";
      setTimeout(() => (s.style.transform = "scale(1)"), 200);
    });
  }, 5000);
};
