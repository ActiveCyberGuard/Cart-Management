// ══════════════════════════════════════════════════
//  DATA — localStorage helpers
// ══════════════════════════════════════════════════
function loadUsers()        { try { return JSON.parse(localStorage.getItem("uc_users") || "[]"); }        catch(e){ return []; } }
function saveUsers(u)       { localStorage.setItem("uc_users", JSON.stringify(u)); }
function loadMe()           { try { return JSON.parse(localStorage.getItem("uc_me") || "null"); }          catch(e){ return null; } }
function saveMe(u)          { localStorage.setItem("uc_me", u ? JSON.stringify(u) : "null"); }
function loadDrivers()      { try { return JSON.parse(localStorage.getItem("uc_drivers") || "[]"); }       catch(e){ return []; } }
function saveDrivers(d)     { localStorage.setItem("uc_drivers", JSON.stringify(d)); }
function loadDriverMe()     { try { return JSON.parse(localStorage.getItem("uc_driver_me") || "null"); }   catch(e){ return null; } }
function saveDriverMe(d)    { localStorage.setItem("uc_driver_me", d ? JSON.stringify(d) : "null"); }
function loadRides()        { try { return JSON.parse(localStorage.getItem("uc_rides") || "[]"); }         catch(e){ return []; } }
function saveRides(r)       { localStorage.setItem("uc_rides", JSON.stringify(r)); }
function loadReservations() { try { return JSON.parse(localStorage.getItem("uc_reservations") || "[]"); } catch(e){ return []; } }
function saveReservations(r){ localStorage.setItem("uc_reservations", JSON.stringify(r)); }

// ── Seed demo user ──
(function seedUsers() {
  const existing = loadUsers();
  const demoExists = existing.find(u => u.id === "2021001");
  if (!demoExists) {
    saveUsers([
      { id:"2021001", name:"রহিম আহমেদ",   type:"student", dept:"IIT",   batch:"51", password:"123456", balance:250, suspended:false, pendingFine:0 },
      { id:"2021002", name:"করিম হোসেন",   type:"student", dept:"Math",  batch:"48", password:"1234",   balance:180, suspended:false, pendingFine:0 },
      { id:"S001",    name:"ফারহানা বেগম", type:"staff",   dept:"Admin", batch:"-",  password:"1234",   balance:500, suspended:false, pendingFine:0 },
    ]);
  } else {
    let users = loadUsers();
    const idx = users.findIndex(u => u.id === "2021001");
    if (idx > -1) {
      users[idx].batch    = "51";
      users[idx].dept     = "IIT";
      users[idx].password = "123456";
      if (users[idx].suspended  === undefined) users[idx].suspended  = false;
      if (users[idx].pendingFine === undefined) users[idx].pendingFine = 0;
      saveUsers(users);
    }
  }
})();

if (loadDrivers().length === 0) {
  saveDrivers([
    { id:"DRV001", name:"আব্দুল করিম",   phone:"01711000001", cartId:"UC-101", password:"1234", todayRides:5, todayEarning:50,  online:false },
    { id:"DRV002", name:"মোহাম্মদ আলী", phone:"01711000002", cartId:"UC-102", password:"1234", todayRides:3, todayEarning:30,  online:false },
    { id:"DRV003", name:"জামাল উদ্দিন",  phone:"01711000003", cartId:"UC-103", password:"1234", todayRides:7, todayEarning:65,  online:false },
  ]);
}
if (loadRides().length === 0) {
  saveRides([
    { userId:"2021001", date:"২৭ জানুয়ারি, ২০২৬", time:"9:30 AM",  fromName:"মেইন গেট",  toName:"শহিদ রফিক-জব্বার হল", cartId:"UC-101", fare:10, status:"completed" },
    { userId:"2021001", date:"২৬ জানুয়ারি, ২০২৬", time:"1:15 PM",  fromName:"বটতলা",      toName:"শহিদ রফিক-জব্বার হল", cartId:"UC-102", fare:5,  status:"completed" },
    { userId:"2021001", date:"২৫ জানুয়ারি, ২০২৬", time:"4:45 PM",  fromName:"শহিদ মিনার", toName:"মেইন গেট",            cartId:"UC-103", fare:5,  status:"completed" },
  ]);
}

let currentUser   = loadMe();
let currentDriver = loadDriverMe();

// ══════════════════════════════════════════════════
//  JU CAMPUS — REAL COORDINATES (user-supplied, Google Maps)
//  সূত্র: জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ক্যাম্পাস — ব্যবহারকারীর প্রদত্ত সঠিক কোঅর্ডিনেট
// ══════════════════════════════════════════════════
const LOCS = {
  maingate:         { name:"মেইন গেট",                lat:23.879875486452168, lng:90.27257452874356 },
  "shahid-minar":   { name:"শহিদ মিনার",               lat:23.879833278483435, lng:90.26874051699366 },
  srj:              { name:"শহিদ রফিক-জব্বার হল",      lat:23.879885976699665, lng:90.26192540719713 },
  bottola:          { name:"বটতলা",                    lat:23.87981611041161,  lng:90.2653683101425  },
  "notun-kola":     { name:"নতুন কলা ভবন",              lat:23.880684305297805, lng:90.26794044830966 },
  "puraton-kola":   { name:"পুরাতন কলা ভবন",            lat:23.88743949705551,  lng:90.26593113531383 },
  bishmile:         { name:"বিশমাইল গেট",               lat:23.89545831247055,  lng:90.27073546531614 },
  chorongi:         { name:"চৌরঙ্গী",                   lat:23.88649634729436,  lng:90.26780975432968 },
  "mir-mosharraf":  { name:"মীর মোশাররফ হোসেন হল",     lat:23.875781297396976, lng:90.27140265755143 },
  "prantic-gate":   { name:"প্রান্তিক গেট",              lat:23.889707686821627, lng:90.27184777477123 },
};

const LIVE_LOCATION_ANCHOR = { lat:23.8810, lng:90.2690 };

// ── রুট ১: srj → বটতলা → শহিদ মিনার → নতুন কলা → মেইন গেট ──
const ROUTE_A = [
  [LOCS.srj.lat,             LOCS.srj.lng],
  [LOCS.bottola.lat,         LOCS.bottola.lng],
  [LOCS["shahid-minar"].lat, LOCS["shahid-minar"].lng],
  [LOCS["notun-kola"].lat,   LOCS["notun-kola"].lng],
  [LOCS.maingate.lat,        LOCS.maingate.lng],
];

// ── রুট ২: বিশমাইল → চৌরঙ্গী → শহিদ মিনার → মীর মোশাররফ হোসেন হল ──
const ROUTE_B = [
  [LOCS.bishmile.lat,         LOCS.bishmile.lng],
  [LOCS.chorongi.lat,         LOCS.chorongi.lng],
  [LOCS["shahid-minar"].lat,  LOCS["shahid-minar"].lng],
  [LOCS["mir-mosharraf"].lat, LOCS["mir-mosharraf"].lng],
];

// ── রুট ৩: মেইন গেট → শহিদ মিনার → বটতলা → srj ──
const ROUTE_C = [
  [LOCS.maingate.lat,        LOCS.maingate.lng],
  [LOCS["shahid-minar"].lat, LOCS["shahid-minar"].lng],
  [LOCS.bottola.lat,         LOCS.bottola.lng],
  [LOCS.srj.lat,             LOCS.srj.lng],
];

const CARTS = [
  { id:"UC-101", driver:"আব্দুল করিম",   lat:LOCS.srj.lat,           lng:LOCS.srj.lng,           passengers:3, capacity:6,  status:"active",   route:"রফিক-জব্বার → বটতলা → শহিদ মিনার → নতুন কলা → মেইন গেট", driverId:"DRV001", boarded:[], routePath:ROUTE_A },
  { id:"UC-102", driver:"মোহাম্মদ আলী", lat:LOCS.bishmile.lat,      lng:LOCS.bishmile.lng,      passengers:5, capacity:12, status:"active",   route:"বিশমাইল → চৌরঙ্গী → শহিদ মিনার → মীর মোশাররফ",         driverId:"DRV002", boarded:[], routePath:ROUTE_B },
  { id:"UC-103", driver:"জামাল উদ্দিন",  lat:LOCS.maingate.lat,      lng:LOCS.maingate.lng,      passengers:2, capacity:6,  status:"active",   route:"মেইন গেট → শহিদ মিনার → বটতলা → রফিক-জব্বার",           driverId:"DRV003", boarded:[], routePath:ROUTE_C },
  { id:"UC-104", driver:"রফিক মিয়া",    lat:LOCS["shahid-minar"].lat,lng:LOCS["shahid-minar"].lng,passengers:0, capacity:8,  status:"inactive", route:"বিরতি",                                          driverId:null,     boarded:[], routePath:ROUTE_A },
  { id:"UC-105", driver:"হাসান আলী",     lat:LOCS.bottola.lat,       lng:LOCS.bottola.lng,       passengers:0, capacity:6,  status:"inactive", route:"বিরতি",                                          driverId:null,     boarded:[], routePath:ROUTE_C },
];

const FARES = {
  "maingate-srj":          { distance:1.8,  student:10, staff:10, guest:10 },
  "shahid-minar-srj":      { distance:1.2,  student:8,  staff:8,  guest:8  },
  "bottola-srj":           { distance:0.95, student:5,  staff:5,  guest:5  },
  "maingate-shahid-minar": { distance:0.6,  student:5,  staff:5,  guest:5  },
  "notun-kola-srj":        { distance:1.4,  student:9,  staff:9,  guest:9  },
  "puraton-kola-srj":      { distance:1.6,  student:10, staff:10, guest:10 },
};
function fareFor(fromKey, toKey, type) {
  const rule = FARES[`${fromKey}-${toKey}`] || FARES[`${toKey}-${fromKey}`];
  if (rule) return { distance:rule.distance, fare:rule[type] };
  const fb = type==="student"?8:type==="staff"?9:10;
  return { distance:1.0, fare:fb };
}

// ══════════════════════════════════════════════════
//  SUSPENSION CHECK
// ══════════════════════════════════════════════════
function checkSuspension(user) {
  if (!user) return false;
  // ৭২ ঘন্টার বেশি পুরনো pendingFine আছে কিনা দেখো
  const reservations = loadReservations();
  const now = Date.now();
  const overdue = reservations.find(r =>
    r.userId === user.id &&
    r.status === "cancelled" &&
    r.finePaid === false &&
    r.cancelledAt &&
    (now - new Date(r.cancelledAt).getTime()) > 72 * 60 * 60 * 1000
  );
  if (overdue) {
    // সাসপেন্ড করো
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1 && !users[idx].suspended) {
      users[idx].suspended = true;
      saveUsers(users);
      if (currentUser && currentUser.id === user.id) {
        currentUser.suspended = true;
        saveMe(currentUser);
      }
    }
    return true;
  }
  return user.suspended || false;
}

// ══════════════════════════════════════════════════
//  AUTH GUARD
// ══════════════════════════════════════════════════
function guardedTab(name, btn) {
  if (!currentUser && !currentDriver) {
    document.getElementById("authGuardModal").classList.add("open");
    return;
  }
  // সাসপেন্ড চেক
  if (currentUser && checkSuspension(currentUser)) {
    toast("🚫","আপনার অ্যাকাউন্ট সাসপেন্ড। জরিমানা পরিশোধ করুন।","err");
    openSuspendedInfo();
    return;
  }
  goTab(name, btn);
}
function closeGuard() { document.getElementById("authGuardModal").classList.remove("open"); }

function openSuspendedInfo() {
  const reservations = loadReservations();
  const unpaid = reservations.filter(r =>
    r.userId === currentUser.id && r.status === "cancelled" && r.finePaid === false
  );
  const totalOwed = unpaid.reduce((s,r) => s + (r.fineAmount||0), 0);

  // ক্যান্সেল মডাল দিয়ে দেখাও
  document.getElementById("cancelModalBody").innerHTML = `
    <div class="suspended-banner">🚫 আপনার অ্যাকাউন্ট সাসপেন্ড করা হয়েছে</div>
    <div class="pending-fine-banner">
      <strong>মোট বকেয়া জরিমানা: ৳${totalOwed}</strong>
      জরিমানা পরিশোধ না করা পর্যন্ত সাইটের অ্যাক্সেস বন্ধ থাকবে।
    </div>
    <div class="bkash-info">
      বিকাশে সেন্ডমানি করুন:<br>
      <strong>01627457836</strong>
      <br><small style="opacity:.8">Send Money করার পর নিচে ট্রানজেকশন ID দিন</small>
    </div>
    <div class="form-group">
      <label>বিকাশ ট্রানজেকশন ID</label>
      <input type="text" id="suspendTxId" class="input-field" placeholder="যেমন: 8AB1234XYZ" />
    </div>
    <button class="btn-primary btn-full" onclick="payAllFines()">জরিমানা পরিশোধ করুন ও একসেস ফিরুন</button>
  `;
  document.getElementById("cancelModal").classList.add("open");
}

function payAllFines() {
  const txId = document.getElementById("suspendTxId") ? document.getElementById("suspendTxId").value.trim() : "";
  if (!txId) { toast("⚠️","ট্রানজেকশন ID দিন","warn"); return; }

  const reservations = loadReservations();
  reservations.forEach(r => {
    if (r.userId === currentUser.id && r.status === "cancelled" && r.finePaid === false) {
      r.finePaid = true;
      r.fineTxId = txId;
    }
  });
  saveReservations(reservations);

  const users = loadUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx > -1) { users[idx].suspended = false; users[idx].pendingFine = 0; saveUsers(users); }
  currentUser.suspended = false;
  currentUser.pendingFine = 0;
  saveMe(currentUser);

  closeCancelModal();
  toast("✅","জরিমানা পরিশোধ হয়েছে! একসেস পুনরায় চালু হয়েছে।","ok");
}

// ══════════════════════════════════════════════════
//  MAP
// ══════════════════════════════════════════════════
let leafMap, cartMarkers = [];
let simAnimHandle = null, lastSimTs = null;
const DEG_PER_METER = 1/111100;

function buildCartPath(cart) {
  // cart.routePath ব্যবহার করো (real JU routes)
  let pts = [];
  if (cart.routePath && cart.routePath.length >= 2) {
    pts = cart.routePath.map(c => ({ lat:c[0], lng:c[1] }));
  } else {
    pts = [{ lat:cart.lat, lng:cart.lng }, { lat:cart.lat+0.001, lng:cart.lng+0.001 }];
  }
  return pts;
}

function segDistanceMeters(a, b) {
  const dLat = (b.lat-a.lat)/DEG_PER_METER;
  const dLng = (b.lng-a.lng)/DEG_PER_METER * Math.cos(a.lat*Math.PI/180);
  return Math.sqrt(dLat*dLat+dLng*dLng);
}

CARTS.forEach(c => {
  c.path        = buildCartPath(c);
  c.segIndex    = 0;
  c.segProgress = Math.random();
  c.direction   = 1;
  c.baseSpeed   = 1.6+Math.random()*0.8;
  c.curSpeed    = c.baseSpeed;
});

function initMap() {
  leafMap = L.map("map").setView([LIVE_LOCATION_ANCHOR.lat, LIVE_LOCATION_ANCHOR.lng], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution:"© OpenStreetMap" }).addTo(leafMap);

  // রুট পলিলাইন দেখাও
  L.polyline(ROUTE_A, { color:"#667eea", weight:3, opacity:0.5, dashArray:"6 4" }).addTo(leafMap);
  L.polyline(ROUTE_B, { color:"#28a745", weight:3, opacity:0.5, dashArray:"6 4" }).addTo(leafMap);
  L.polyline(ROUTE_C, { color:"#f57c00", weight:3, opacity:0.5, dashArray:"6 4" }).addTo(leafMap);

  // লোকেশন মার্কার
  Object.values(LOCS).forEach(loc => {
    L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({
        className:"",
        html:`<div style="background:rgba(40,167,69,.9);color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">${loc.name}</div>`,
        iconAnchor:[40,10],
      }),
    }).addTo(leafMap);
  });

  renderMarkers();
  lastSimTs = null;
  simAnimHandle = requestAnimationFrame(simStep);
  setInterval(() => { renderCartList(); updateStats(); }, 1000);
}

function renderMarkers() {
  cartMarkers.forEach(m => leafMap.removeLayer(m));
  cartMarkers = [];
  CARTS.filter(c => c.status==="active").forEach(cart => {
    const p   = cart.passengers/cart.capacity;
    const col = p>=1?"#dc3545":p>=0.7?"#ffc107":"#28a745";
    const m = L.marker([cart.lat, cart.lng], {
      icon: L.divIcon({ className:"", html:cartIconHtml(cart,col), iconAnchor:[22,22] }),
    }).addTo(leafMap);
    m.bindPopup(`<div style="text-align:center;font-family:'Segoe UI',sans-serif">
      <b style="color:#667eea">${cart.id}</b><br>
      ড্রাইভার: ${cart.driver}<br>
      যাত্রী: <span style="color:${col};font-weight:700">${cart.passengers}/${cart.capacity}</span><br>
      <small style="color:#888">রুট: ${cart.route}</small>
    </div>`);
    cartMarkers.push(m);
  });
}

function cartIconHtml(cart, col) {
  return `<div style="background:white;border:3px solid ${col};border-radius:50%;width:44px;height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer">
    <span style="font-size:19px">🚗</span>
    <span style="font-size:9px;color:${col};font-weight:700">${cart.passengers}/${cart.capacity}</span>
  </div>`;
}

function simStep(ts) {
  if (lastSimTs==null) lastSimTs=ts;
  let dt = Math.min((ts-lastSimTs)/1000, 0.1);
  lastSimTs=ts;
  const active = CARTS.filter(c=>c.status==="active");
  active.forEach(c => {
    if (!c.path||c.path.length<2) c.path=buildCartPath(c);
    moveCartRealistically(c,dt);
  });
  active.forEach((cart,i) => { const m=cartMarkers[i]; if(m) m.setLatLng([cart.lat,cart.lng]); });
  simAnimHandle=requestAnimationFrame(simStep);
}

function moveCartRealistically(c, dt) {
  const a=c.path[c.segIndex], b=c.path[c.segIndex+1]||a;
  const segLenM=Math.max(1,segDistanceMeters(a,b));
  c.curSpeed += (c.baseSpeed-c.curSpeed)*(1-Math.exp(-dt*1.5));
  const dS=c.segProgress, dE=1-c.segProgress, sz=0.12;
  let sf=1;
  if(dE<sz) sf=Math.min(sf,0.35+0.65*(dE/sz));
  if(dS<sz) sf=Math.min(sf,0.45+0.55*(dS/sz));
  c.segProgress+=c.direction*(c.curSpeed*sf*dt/segLenM);
  while(c.segProgress>1||c.segProgress<0){
    if(c.segProgress>1){c.segProgress-=1;c.segIndex+=c.direction;}
    else{c.segProgress+=1;c.segIndex+=c.direction;}
    if(c.segIndex>=c.path.length-1){c.segIndex=c.path.length-2;c.direction=-1;}
    else if(c.segIndex<=0){c.segIndex=0;c.direction=1;}
  }
  const a2=c.path[c.segIndex], b2=c.path[c.segIndex+1]||a2;
  c.lat=a2.lat+(b2.lat-a2.lat)*c.segProgress;
  c.lng=a2.lng+(b2.lng-a2.lng)*c.segProgress;
}

// ── Track Modal ──
let trackMap=null,trackMarker=null,trackAnimHandle=null,trackInfoInterval=null;

function openTrackModal(cartId) {
  const cart=CARTS.find(c=>c.id===cartId); if(!cart) return;
  document.getElementById("trackModalTitle").textContent=`🚗 ${cart.id} — লাইভ ট্র্যাকিং`;
  document.getElementById("trackModal").classList.add("open");
  const p=cart.passengers/cart.capacity, col=p>=1?"#dc3545":p>=0.7?"#ffc107":"#28a745";
  document.getElementById("trackInfo").innerHTML=`
    <div style="grid-column:1/-1;margin-bottom:6px"><span class="track-live-badge">লাইভ</span></div>
    <div><span>কার্ট নং</span><span>${cart.id}</span></div>
    <div><span>ড্রাইভার</span><span>${cart.driver}</span></div>
    <div><span>রুট</span><span>${cart.route}</span></div>
    <div><span>যাত্রী</span><span style="color:${col}">${cart.passengers}/${cart.capacity}</span></div>
    <div style="grid-column:1/-1"><span>অবস্থান</span><span>lat:${cart.lat.toFixed(5)},lng:${cart.lng.toFixed(5)}</span></div>`;
  setTimeout(()=>{
    if(trackMap){trackMap.remove();trackMap=null;}
    trackMap=L.map("trackMap").setView([cart.lat,cart.lng],16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(trackMap);
    if(cart.routePath&&cart.routePath.length>1)
      L.polyline(cart.routePath,{color:"#667eea",weight:4,opacity:.7,dashArray:"6 4"}).addTo(trackMap);
    trackMarker=L.marker([cart.lat,cart.lng],{
      icon:L.divIcon({className:"",html:trackCartIconHtml(cart,col),iconAnchor:[25,25]})
    }).addTo(trackMap);
    trackMarker.bindPopup(`<b>${cart.id}</b><br>${cart.driver}<br><small>${cart.route}</small>`).openPopup();
    let lastPan=0;
    function trackFrame(){
      const u=CARTS.find(c=>c.id===cartId);
      if(!u||!trackMarker||!trackMap) return;
      trackMarker.setLatLng([u.lat,u.lng]);
      const now=performance.now();
      if(now-lastPan>1200){trackMap.panTo([u.lat,u.lng],{animate:true,duration:1.1,easeLinearity:.25});lastPan=now;}
      trackAnimHandle=requestAnimationFrame(trackFrame);
    }
    if(trackAnimHandle) cancelAnimationFrame(trackAnimHandle);
    trackAnimHandle=requestAnimationFrame(trackFrame);
    if(trackInfoInterval) clearInterval(trackInfoInterval);
    trackInfoInterval=setInterval(()=>{
      const u=CARTS.find(c=>c.id===cartId); if(!u) return;
      const el=document.querySelectorAll("#trackInfo div")[4];
      if(el) el.querySelector("span:last-child").textContent=`lat:${u.lat.toFixed(5)},lng:${u.lng.toFixed(5)}`;
    },1000);
  },200);
}
function trackCartIconHtml(cart,col){
  return `<div style="background:white;border:3px solid ${col};border-radius:50%;width:50px;height:50px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3)">
    <span style="font-size:22px">🚗</span><span style="font-size:9px;color:${col};font-weight:700">${cart.passengers}/${cart.capacity}</span></div>`;
}
function closeTrackModal(){
  document.getElementById("trackModal").classList.remove("open");
  if(trackAnimHandle){cancelAnimationFrame(trackAnimHandle);trackAnimHandle=null;}
  if(trackInfoInterval){clearInterval(trackInfoInterval);trackInfoInterval=null;}
  if(trackMap){trackMap.remove();trackMap=null;}
  trackMarker=null;
}

// ══════════════════════════════════════════════════
//  STATS & CART LIST
// ══════════════════════════════════════════════════
function updateStats(){
  const act=CARTS.filter(c=>c.status==="active");
  const pass=CARTS.reduce((s,c)=>s+c.passengers,0);
  const free=act.reduce((s,c)=>s+(c.capacity-c.passengers),0);
  document.getElementById("sTot").textContent=CARTS.length;
  document.getElementById("sAct").textContent=act.length;
  document.getElementById("sPas").textContent=pass;
  document.getElementById("sFre").textContent=free;
}
function renderCartList(){
  const con=document.getElementById("cartListContainer"); con.innerHTML="";
  CARTS.filter(c=>c.status==="active").forEach(cart=>{
    const p=cart.passengers/cart.capacity, fc=p>=1?"full":p>=0.7?"mid":"", free=cart.capacity-cart.passengers;
    const el=document.createElement("div"); el.className="cart-item";
    el.innerHTML=`
      <div class="cart-info">
        <div class="cart-number">${cart.id}</div>
        <div class="cart-status active">চলমান</div>
        <div class="cart-passengers">যাত্রী: ${cart.passengers}/${cart.capacity} &nbsp;|&nbsp; <span style="color:#28a745;font-weight:600">খালি: ${free}</span></div>
        <div class="seat-text"><span>${Math.round(p*100)}% পূর্ণ</span><span>রুট: ${cart.route}</span></div>
        <div class="seat-bar"><div class="seat-fill ${fc}" style="width:${Math.round(p*100)}%"></div></div>
      </div>
      <div class="cart-actions">
        <button class="btn-secondary" onclick="openTrackModal('${cart.id}')">ট্র্যাক করুন</button>
        <button class="btn-primary" onclick="focusCart('${cart.id}')" style="font-size:13px;padding:8px 14px">🗺 ম্যাপে দেখুন</button>
      </div>`;
    con.appendChild(el);
  });
}
function focusCart(id){
  const cart=CARTS.find(c=>c.id===id); if(!cart) return;
  goTab("map",document.querySelectorAll(".tab-btn")[0]);
  leafMap.setView([cart.lat,cart.lng],17);
  const idx=CARTS.filter(c=>c.status==="active").findIndex(c=>c.id===id);
  if(cartMarkers[idx]) cartMarkers[idx].openPopup();
}

// ══════════════════════════════════════════════════
//  TAB
// ══════════════════════════════════════════════════
function goTab(name,btn){
  document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById(name+"Tab").classList.add("active");
  if(btn) btn.classList.add("active");
  if(name==="history") renderRideHistory();
  if(name==="scanner") renderDropoffList();
  if(name==="reserve"){ fillReserveFields(); renderMyReservations(); }
}

function fillReserveFields(){
  if(!currentUser) return;
  const idEl=document.getElementById("resvUserId"), bEl=document.getElementById("resvBatch");
  if(idEl) idEl.value=currentUser.id||"";
  if(bEl)  bEl.value=currentUser.batch||"";
}

// ══════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════
let currentRole="passenger";
function openAuth(){ document.getElementById("authModal").classList.add("open"); }
function closeAuth(){
  document.getElementById("authModal").classList.remove("open");
  resetPassengerForms(); resetDriverForms(); switchRole("passenger");
}
function switchRole(role){
  currentRole=role;
  document.getElementById("rolePassenger").classList.toggle("active",role==="passenger");
  document.getElementById("roleDriver").classList.toggle("active",role==="driver");
  document.getElementById("passengerSection").style.display=role==="passenger"?"block":"none";
  document.getElementById("driverSection").style.display=role==="driver"?"block":"none";
  if(role==="driver"&&currentDriver) showDriverDashboard(currentDriver);
}
function switchMTab(t){
  document.getElementById("mtLogin").classList.toggle("active",t==="login");
  document.getElementById("mtReg").classList.toggle("active",t==="register");
  document.getElementById("loginForm").style.display=t==="login"?"block":"none";
  document.getElementById("regForm").style.display=t==="register"?"block":"none";
  document.getElementById("qrResultBox").style.display="none";
}

function doLogin(){
  const id=document.getElementById("lId").value.trim();
  const batch=document.getElementById("lBatch").value.trim();
  const pw=document.getElementById("lPass").value;
  if(!id||!batch||!pw){ toast("⚠️","আইডি, ব্যাচ ও পাসওয়ার্ড তিনটাই লিখুন","warn"); return; }
  const user=loadUsers().find(u=>u.id===id&&String(u.batch)===String(batch)&&u.password===pw);
  if(!user){ toast("❌","ভুল আইডি, ব্যাচ বা পাসওয়ার্ড!","err"); return; }
  currentUser=user; saveMe(user);
  updateUserUI(); closeAuth(); renderRideHistory(); fillReserveFields();
  // সাসপেন্ড চেক
  if(checkSuspension(user)){
    toast("🚫","আপনার অ্যাকাউন্ট সাসপেন্ড। জরিমানা পরিশোধ করুন।","err");
    setTimeout(()=>openSuspendedInfo(),500);
  } else {
    toast("✓",`স্বাগতম, ${user.name}!`,"ok");
  }
}
function doRegister(){
  const Sname=document.getElementById("rName").value.trim();
  const id=document.getElementById("rId").value.trim();
  const type=document.getElementById("rType").value;
  const dept=document.getElementById("rDept").value.trim();
  const batch=document.getElementById("rBatch").value.trim();
  const pw=document.getElementById("rPass").value;
  if(!Sname||!id||!dept||!batch||!pw){ toast("⚠️","সব ঘর পূরণ করুন","warn"); return; }
  if(pw.length<6){ toast("⚠️","পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে","warn"); return; }
  const users=loadUsers();
  if(users.find(u=>u.id===id)){ toast("❌","এই আইডি ইতিমধ্যে নিবন্ধিত!","err"); return; }
  const u={id,name:Sname,type,dept,batch,password:pw,balance:100,suspended:false,pendingFine:0};
  users.push(u); saveUsers(users);
  currentUser=u; saveMe(u);
  updateUserUI(); fillReserveFields(); showQR(u);
  toast("✓","রেজিস্ট্রেশন সফল! QR কোড তৈরি হয়েছে","ok");
}
function showQR(user){
  document.getElementById("loginForm").style.display="none";
  document.getElementById("regForm").style.display="none";
  document.getElementById("qrResultBox").style.display="block";
  document.getElementById("qrUserName").textContent=user.name;
  document.getElementById("qrUserId").textContent=`আইডি: ${user.id} • ${user.type==="student"?"স্টুডেন্ট":"স্টাফ"} • ${user.dept}${user.batch?" • ব্যাচ "+user.batch:""}`;
  const div=document.getElementById("qrGenDiv"); div.innerHTML="";
  new QRCode(div,{text:JSON.stringify({id:user.id,name:user.name,type:user.type,batch:user.batch||""}),width:200,height:200,colorDark:"#333",colorLight:"#fff",correctLevel:QRCode.CorrectLevel.H});
}
function downloadQR(){
  setTimeout(()=>{
    const canvas=document.querySelector("#qrGenDiv canvas");
    if(!canvas){toast("❌","QR পাওয়া যায়নি","err");return;}
    const a=document.createElement("a"); a.download=`unicart_${currentUser.id}.png`; a.href=canvas.toDataURL(); a.click();
    toast("✓","QR ডাউনলোড হচ্ছে...","ok");
  },100);
}
function resetPassengerForms(){
  document.getElementById("qrResultBox").style.display="none";
  document.getElementById("loginForm").style.display="block";
  document.getElementById("regForm").style.display="none";
  document.getElementById("mtLogin").classList.add("active");
  document.getElementById("mtReg").classList.remove("active");
}

// ── DRIVER ──
function switchDriverTab(t){
  document.getElementById("dtLogin").classList.toggle("active",t==="login");
  document.getElementById("dtReg").classList.toggle("active",t==="register");
  document.getElementById("driverLoginForm").style.display=t==="login"?"block":"none";
  document.getElementById("driverRegForm").style.display=t==="register"?"block":"none";
  document.getElementById("driverDashboard").style.display="none";
}
function doDriverLogin(){
  const id=document.getElementById("dlId").value.trim(), pw=document.getElementById("dlPass").value;
  if(!id||!pw){toast("⚠️","আইডি ও পাসওয়ার্ড লিখুন","warn");return;}
  const driver=loadDrivers().find(d=>d.id===id&&d.password===pw);
  if(!driver){toast("❌","ভুল ড্রাইভার আইডি বা পাসওয়ার্ড!","err");return;}
  currentDriver=driver; saveDriverMe(driver);
  showDriverDashboard(driver); updateUserUI();
  toast("✓",`স্বাগতম, ${driver.name} ভাই!`,"ok");
}
function doDriverRegister(){
  const name=document.getElementById("drName").value.trim(), id=document.getElementById("drId").value.trim();
  const phone=document.getElementById("drPhone").value.trim(), cartId=document.getElementById("drCart").value;
  const pw=document.getElementById("drPass").value;
  if(!name||!id||!phone||!pw){toast("⚠️","সব ঘর পূরণ করুন","warn");return;}
  if(pw.length<6){toast("⚠️","পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে","warn");return;}
  const drivers=loadDrivers();
  if(drivers.find(d=>d.id===id)){toast("❌","এই ড্রাইভার আইডি ইতিমধ্যে নিবন্ধিত!","err");return;}
  const d={id,name,phone,cartId,password:pw,todayRides:0,todayEarning:0,online:false};
  drivers.push(d); saveDrivers(drivers);
  currentDriver=d; saveDriverMe(d);
  const cart=CARTS.find(c=>c.id===cartId); if(cart){cart.driver=name;cart.driverId=id;}
  showDriverDashboard(d); updateUserUI();
  toast("✓",`রেজিস্ট্রেশন সফল! স্বাগতম, ${name} ভাই!`,"ok");
}
function showDriverDashboard(driver){
  document.getElementById("driverLoginForm").style.display="none";
  document.getElementById("driverRegForm").style.display="none";
  document.getElementById("driverDashboard").style.display="block";
  document.getElementById("driverWelcomeName").textContent=driver.name;
  document.getElementById("driverCartId").textContent=`কার্ট: ${driver.cartId} | আইডি: ${driver.id}`;
  document.getElementById("dTodayRides").textContent=driver.todayRides;
  document.getElementById("dTodayEarning").textContent=`৳${driver.todayEarning}`;
  const toggle=document.getElementById("driverStatusToggle"); toggle.checked=driver.online||false;
  document.getElementById("driverStatusLabel").textContent=driver.online?"অনলাইন":"অফলাইন";
  document.getElementById("driverStatusLabel").style.color=driver.online?"#28a745":"#dc3545";
}
function toggleDriverStatus(){
  if(!currentDriver) return;
  currentDriver.online=document.getElementById("driverStatusToggle").checked;
  document.getElementById("driverStatusLabel").textContent=currentDriver.online?"অনলাইন":"অফলাইন";
  document.getElementById("driverStatusLabel").style.color=currentDriver.online?"#28a745":"#dc3545";
  const cart=CARTS.find(c=>c.id===currentDriver.cartId);
  if(cart){cart.status=currentDriver.online?"active":"inactive";if(cart.status==="active"&&(!cart.path||cart.path.length<2))cart.path=buildCartPath(cart);renderMarkers();renderCartList();updateStats();}
  const drivers=loadDrivers(), idx=drivers.findIndex(d=>d.id===currentDriver.id);
  if(idx>-1){drivers[idx].online=currentDriver.online;saveDrivers(drivers);}
  saveDriverMe(currentDriver);
  toast(currentDriver.online?"🟢":"🔴",currentDriver.online?"আপনি এখন অনলাইন!":"আপনি অফলাইন হয়েছেন","ok");
}
function doDriverLogout(){
  if(!currentDriver) return;
  const cart=CARTS.find(c=>c.id===currentDriver.cartId); if(cart) cart.status="inactive";
  currentDriver=null; saveDriverMe(null);
  renderMarkers(); renderCartList(); updateStats(); closeAuth(); updateUserUI();
  toast("👋","ড্রাইভার লগআউট সফল","ok");
}
function resetDriverForms(){
  document.getElementById("driverLoginForm").style.display="block";
  document.getElementById("driverRegForm").style.display="none";
  document.getElementById("driverDashboard").style.display="none";
  document.getElementById("dtLogin").classList.add("active");
  document.getElementById("dtReg").classList.remove("active");
}
function updateUserUI(){
  const btn=document.getElementById("authBtn");
  if(currentUser){
    document.getElementById("userName").textContent="👤 "+currentUser.name+(currentUser.suspended?" 🚫":"");
    document.getElementById("userName").className="loggedin";
    document.getElementById("walBal").textContent=currentUser.balance;
    btn.textContent="লগআউট"; btn.onclick=doLogout; btn.className="btn-danger";
  } else if(currentDriver){
    document.getElementById("userName").textContent="🚗 "+currentDriver.name;
    document.getElementById("userName").className="loggedin";
    btn.textContent="ড্রাইভার লগআউট";
    btn.onclick=()=>{openAuth();switchRole("driver");showDriverDashboard(currentDriver);};
    btn.className="btn-secondary";
  } else {
    document.getElementById("userName").textContent="রেজিস্ট্রার/ লগইন করুন";
    document.getElementById("userName").className="";
    btn.textContent="লগইন"; btn.onclick=openAuth; btn.className="btn-secondary";
  }
}
function doLogout(){
  currentUser=null; saveMe(null); updateUserUI(); renderRideHistory();
  const idEl=document.getElementById("resvUserId"), bEl=document.getElementById("resvBatch");
  if(idEl) idEl.value=""; if(bEl) bEl.value="";
  toast("👋","লগআউট সফল","ok");
}

// ══════════════════════════════════════════════════
//  QR SCANNER
// ══════════════════════════════════════════════════
let camStream=null, scanLoop=null, scannedUser=null;
let qrWorkCanvas=document.createElement("canvas");

function toggleCamera(){
  if(camStream){stopCamera();return;}
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:480},height:{ideal:480}}})
    .then(stream=>{
      camStream=stream;
      const v=document.getElementById("videoEl"); v.srcObject=stream; v.classList.add("on");
      document.getElementById("qrPlaceholder").style.display="none";
      document.getElementById("camBtn").textContent="ক্যামেরা বন্ধ করুন"; startLoop();
    }).catch(()=>toast("❌","ক্যামেরা অ্যাক্সেস দিন অথবা ম্যানুয়াল আইডি ব্যবহার করুন","err"));
}
function stopCamera(){
  if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null;}
  if(scanLoop){cancelAnimationFrame(scanLoop);scanLoop=null;}
  const v=document.getElementById("videoEl"); v.classList.remove("on");
  document.getElementById("qrPlaceholder").style.display="block";
  document.getElementById("camBtn").textContent="ক্যামেরা চালু করুন";
}
function startLoop(){
  const v=document.getElementById("videoEl"), MAX=360;
  const ctx=qrWorkCanvas.getContext("2d",{willReadFrequently:true});
  function tick(){
    if(v.readyState===v.HAVE_ENOUGH_DATA&&v.videoWidth){
      const sc=Math.min(1,MAX/Math.max(v.videoWidth,v.videoHeight));
      const w=Math.max(1,Math.round(v.videoWidth*sc)), h=Math.max(1,Math.round(v.videoHeight*sc));
      qrWorkCanvas.width=w; qrWorkCanvas.height=h; ctx.drawImage(v,0,0,w,h);
      const img=ctx.getImageData(0,0,w,h);
      const code=jsQR(img.data,img.width,img.height,{inversionAttempts:"attemptBoth"});
      if(code){try{const d=JSON.parse(code.data);if(d.id&&d.name){const u=loadUsers().find(x=>x.id===d.id);if(u){showScanResult(u);stopCamera();return;}else toast("❌","অজানা QR","err");}}catch(e){}}
    }
    scanLoop=requestAnimationFrame(tick);
  }
  scanLoop=requestAnimationFrame(tick);
}
function verifyManual(){
  const id=document.getElementById("manId").value.trim();
  if(!id){toast("⚠️","আইডি লিখুন","warn");return;}
  const user=loadUsers().find(u=>u.id===id);
  if(!user){toast("❌","এই আইডি নিবন্ধিত নয়","err");return;}
  showScanResult(user);
}
function showScanResult(user){
  scannedUser=user;
  document.getElementById("sName").textContent=user.name;
  document.getElementById("sId").textContent=user.id+(user.batch?` (ব্যাচ ${user.batch})`:"");
  document.getElementById("sType").textContent=user.type==="student"?"🎓 স্টুডেন্ট":"👨‍💼 স্টাফ";
  document.getElementById("sBal").textContent=user.balance;
  document.getElementById("boardFrom").value=""; document.getElementById("boardTo").value="";
  document.getElementById("boardSeatCount").value="1"; document.getElementById("boardFarePreview").style.display="none";
  document.getElementById("scanResult").style.display="block";
  toast("✓",`${user.name} যাচাই সম্পন্ন`,"ok");
}
function updateBoardFarePreview(){
  const from=document.getElementById("boardFrom").value, to=document.getElementById("boardTo").value;
  const sc=parseInt(document.getElementById("boardSeatCount").value,10)||1;
  const box=document.getElementById("boardFarePreview");
  if(!from||!to||from===to||!scannedUser){box.style.display="none";return;}
  const{fare}=fareFor(from,to,scannedUser.type==="staff"?"staff":"student");
  document.getElementById("boardFareAmt").textContent=fare*sc; box.style.display="block";
}
function confirmBoard(){
  if(!scannedUser) return;
  const fromKey=document.getElementById("boardFrom").value, toKey=document.getElementById("boardTo").value;
  const sc=parseInt(document.getElementById("boardSeatCount").value,10)||1;
  if(!fromKey||!toKey){toast("⚠️","উঠার ও নামার স্থান নির্বাচন করুন","warn");return;}
  if(fromKey===toKey){toast("⚠️","উঠা ও নামার স্থান একই হতে পারবে না","warn");return;}
  const cart=CARTS.find(c=>c.status==="active"&&(c.capacity-c.passengers)>=sc);
  if(!cart){toast("❌",`${sc} সিট খালি আছে এমন কার্ট নেই`,"err");return;}
  const tk=scannedUser.type==="staff"?"staff":"student";
  const{fare}=fareFor(fromKey,toKey,tk); const totalFare=fare*sc;
  if(scannedUser.balance<totalFare){toast("❌",`অপর্যাপ্ত ব্যালেন্স! প্রয়োজন ৳${totalFare}`,"err");return;}
  scannedUser.balance-=totalFare;
  const users=loadUsers(); const ui=users.findIndex(u=>u.id===scannedUser.id);
  if(ui>-1){users[ui].balance=scannedUser.balance;saveUsers(users);}
  if(currentUser&&currentUser.id===scannedUser.id){currentUser.balance=scannedUser.balance;saveMe(currentUser);document.getElementById("walBal").textContent=currentUser.balance;}
  cart.passengers+=sc;
  if(!cart.boarded) cart.boarded=[];
  cart.boarded.push({boardId:"B"+Date.now()+Math.floor(Math.random()*1000),userId:scannedUser.id,userName:scannedUser.name,seatCount:sc,fromName:LOCS[fromKey]?LOCS[fromKey].name:fromKey,toName:LOCS[toKey]?LOCS[toKey].name:toKey,boardedAt:new Date().toLocaleTimeString("bn-BD",{hour:"numeric",minute:"2-digit",hour12:true})});
  if(cart.driverId){const drivers=loadDrivers();const di=drivers.findIndex(d=>d.id===cart.driverId);if(di>-1){drivers[di].todayRides++;drivers[di].todayEarning+=totalFare;saveDrivers(drivers);if(currentDriver&&currentDriver.id===cart.driverId){currentDriver=drivers[di];saveDriverMe(currentDriver);document.getElementById("dTodayRides").textContent=currentDriver.todayRides;document.getElementById("dTodayEarning").textContent=`৳${currentDriver.todayEarning}`;}}}
  const now=new Date(); const rides=loadRides();
  rides.unshift({userId:scannedUser.id,date:now.toLocaleDateString("bn-BD",{year:"numeric",month:"long",day:"numeric"}),time:now.toLocaleTimeString("bn-BD",{hour:"numeric",minute:"2-digit",hour12:true}),fromName:LOCS[fromKey]?LOCS[fromKey].name:fromKey,toName:LOCS[toKey]?LOCS[toKey].name:toKey,cartId:cart.id,seatCount:sc,fare:totalFare,status:"completed"});
  saveRides(rides);
  renderCartList();updateStats();renderMarkers();renderRideHistory();renderDropoffList();
  toast("",`${scannedUser.name} বোর্ড হয়েছেন (${sc} সিট)! ভাড়া ৳${totalFare}`,"ok");
  cancelScan();
}
function cancelScan(){
  scannedUser=null;
  document.getElementById("scanResult").style.display="none";
  document.getElementById("manId").value=""; document.getElementById("boardFrom").value="";
  document.getElementById("boardTo").value=""; document.getElementById("boardSeatCount").value="1";
  document.getElementById("boardFarePreview").style.display="none";
}

// ══════════════════════════════════════════════════
//  DROP-OFF
// ══════════════════════════════════════════════════
function renderDropoffList(){
  const con=document.getElementById("dropoffListContainer"); if(!con) return; con.innerHTML="";
  const active=CARTS.filter(c=>c.status==="active"&&c.boarded&&c.boarded.length>0);
  if(active.length===0){con.innerHTML=`<div class="ride-empty"> </div>`;return;}
  active.forEach(cart=>cart.boarded.forEach(b=>{
    const el=document.createElement("div"); el.className="dropoff-item";
    el.innerHTML=`<div class="dropoff-info">
      <div class="dropoff-name">${b.userName} <span class="dropoff-cart-tag">${cart.id}</span></div>
      <div class="dropoff-route">${b.fromName} → ${b.toName} &nbsp;|&nbsp; সিট: ${b.seatCount} &nbsp;|&nbsp; উঠেছেন: ${b.boardedAt}</div>
    </div>
    <button class="btn-secondary" onclick="dropOffPassenger('${cart.id}','${b.boardId}')">নেমে যাবেন? ✓</button>`;
    con.appendChild(el);
  }));
}
function dropOffPassenger(cartId,boardId){
  const cart=CARTS.find(c=>c.id===cartId); if(!cart||!cart.boarded) return;
  const idx=cart.boarded.findIndex(b=>b.boardId===boardId); if(idx===-1) return;
  const entry=cart.boarded[idx];
  cart.passengers=Math.max(0,cart.passengers-entry.seatCount); cart.boarded.splice(idx,1);
  renderCartList();updateStats();renderMarkers();renderDropoffList();
  toast("",`${entry.userName} ধন্যবাদ — ${entry.seatCount} সিট খালি হয়েছে`,"ok");
}

// ══════════════════════════════════════════════════
//  COUPON VERIFY
// ══════════════════════════════════════════════════
function verifyCoupon(){
  const code=document.getElementById("couponInput").value.trim().toUpperCase();
  const box=document.getElementById("couponResultBox");
  if(!code){toast("⚠️","কুপন কোড লিখুন","warn");return;}
  const reservations=loadReservations();
  const idx=reservations.findIndex(r=>r.coupon===code);
  if(idx===-1){box.style.display="block";box.innerHTML=`<div class="coupon-invalid">❌ এই কুপন কোডটি সঠিক নয়।</div>`;toast("❌","ভুল কুপন কোড","err");return;}
  const r=reservations[idx];
  if(r.status==="used"){box.style.display="block";box.innerHTML=`<div class="coupon-invalid">⚠️ এই কুপনটি ইতিমধ্যে ব্যবহার করা হয়েছে।</div>`;toast("⚠️","কুপন আগেই ব্যবহৃত হয়েছে","warn");return;}
  if(r.status==="cancelled"){box.style.display="block";box.innerHTML=`<div class="coupon-invalid">🚫 এই রিজার্ভেশনটি ক্যান্সেল করা হয়েছে।</div>`;toast("⚠️","রিজার্ভেশন ক্যান্সেল হয়েছে","warn");return;}
  reservations[idx].status="used"; saveReservations(reservations);
  box.style.display="block";
  box.innerHTML=`<div class="coupon-valid">
    <p style="font-weight:700;color:#155724;margin-bottom:6px">✅ কুপন যাচাই সফল! ধন্যবাদ</p>
    <p><strong>যাত্রী:</strong> ${r.userName} (${r.userId})</p>
    ${r.userBatch?`<p><strong>ব্যাচ:</strong> ${r.userBatch}</p>`:""}
    <p><strong>তারিখ ও সময়:</strong> ${r.date} — ${r.time}</p>
    <p><strong>রুট:</strong> ${r.fromName} → ${r.toName}</p>
    ${r.seatLabel?`<p><strong>কার্টের ধরন:</strong> ${r.seatLabel}</p>`:""}
    ${r.hours?`<p><strong>সময়কাল:</strong> ${r.hours} ঘন্টা</p>`:""}
    ${r.totalFare?`<p><strong>মোট ভাড়া:</strong> ৳${r.totalFare}</p>`:""}
  </div>`;
  document.getElementById("couponInput").value="";
  toast("✓",`${r.userName}-এর রিজার্ভেশন যাচাই হয়েছে!`,"ok");
}

// ══════════════════════════════════════════════════
//  RESERVE
// ══════════════════════════════════════════════════
const CART_RATES={"6":250,"12":350};

function updateResvFareInfo(){
  const cartType=document.getElementById("resvCartType").value;
  const hoursGrp=document.getElementById("resvHoursGroup");
  const infoBox=document.getElementById("resvFareInfoBox");
  if(!cartType){hoursGrp.style.display="none";infoBox.style.display="none";return;}
  hoursGrp.style.display="block";
  const hours=parseInt(document.getElementById("resvHours").value,10)||1;
  const rate=CART_RATES[cartType], total=rate*hours;
  const label=cartType==="6"?"৬ সিট":"১২ সিট";
  infoBox.style.display="block";
  infoBox.innerHTML=`<div class="fare-info-title">💰 ভাড়ার বিবরণ</div>
    <div class="fare-info-row"><span>কার্টের ধরন</span><span>${label}</span></div>
    <div class="fare-info-row"><span>প্রতি ঘন্টার ভাড়া</span><span>৳${rate}</span></div>
    <div class="fare-info-row"><span>মোট সময়</span><span>${hours} ঘন্টা</span></div>
    <div class="fare-info-row"><span>মোট ভাড়া</span><span class="fare-info-total">৳${total}</span></div>`;
}

function submitReservation(){
  const userId=document.getElementById("resvUserId").value.trim();
  const batch=document.getElementById("resvBatch").value.trim();
  const date=document.getElementById("resvDate").value;
  const time=document.getElementById("resvTime").value;
  const fromKey=document.getElementById("resvFrom").value;
  const toKey=document.getElementById("resvTo").value;
  const cartType=document.getElementById("resvCartType").value;
  const hours=parseInt(document.getElementById("resvHours").value||"1",10)||1;
  if(!userId||!date||!time||!fromKey||!toKey||!cartType){toast("⚠️","সব ঘর পূরণ করুন","warn");return;}
  const user=loadUsers().find(u=>u.id===userId);
  if(!user){toast("❌","এই আইডি নিবন্ধিত নয়","err");return;}
  if(checkSuspension(user)){toast("🚫","আপনার অ্যাকাউন্ট সাসপেন্ড। জরিমানা পরিশোধ করুন।","err");openSuspendedInfo();return;}
  const today=new Date();today.setHours(0,0,0,0);
  const rd=new Date(date+"T00:00:00");
  if(rd<today){toast("⚠️","অতীতের তারিখের জন্য রিজার্ভ করা যাবে না","warn");return;}
  const rate=CART_RATES[cartType], totalFare=rate*hours, seatLabel=cartType==="6"?"৬ সিট":"১২ সিট";
  const coupon="RSV-"+Math.random().toString(36).substring(2,8).toUpperCase();
  const reservation={coupon,userId:user.id,userBatch:batch,userName:user.name,date,time,fromKey,toKey,
    fromName:LOCS[fromKey]?LOCS[fromKey].name:fromKey,toName:LOCS[toKey]?LOCS[toKey].name:toKey,
    cartType,seatLabel,hours,totalFare,status:"pending",createdAt:new Date().toISOString(),
    finePaid:null,fineAmount:null,cancelledAt:null,fineTxId:null};
  const reservations=loadReservations(); reservations.unshift(reservation); saveReservations(reservations);
  document.getElementById("resvCouponCode").textContent=coupon;
  document.getElementById("resvCouponDetails").innerHTML=`
    <p><strong>যাত্রী:</strong> ${user.name} (${user.id}) — ব্যাচ ${batch}</p>
    <p><strong>তারিখ ও সময়:</strong> ${date} — ${time}</p>
    <p><strong>রুট:</strong> ${reservation.fromName} → ${reservation.toName}</p>
    <p><strong>কার্টের ধরন:</strong> ${seatLabel}</p>
    <p><strong>সময়কাল:</strong> ${hours} ঘন্টা</p>
    <p><strong>মোট ভাড়া:</strong> ৳${totalFare}</p>`;
  document.getElementById("reserveResultBox").style.display="block";
  document.getElementById("resvCartType").value="";
  document.getElementById("resvHours").value="1";
  document.getElementById("resvFareInfoBox").style.display="none";
  document.getElementById("resvHoursGroup").style.display="none";
  renderMyReservations();
  toast("✓","রিজার্ভেশন সফল! কুপন কোড তৈরি হয়েছে","ok");
}

function renderMyReservations(){
  const con=document.getElementById("myReservationsContainer"); if(!con) return;
  const userId=currentUser?currentUser.id:"";
  const all=loadReservations();
  const mine=userId?all.filter(r=>r.userId===userId):all;
  if(mine.length===0){con.innerHTML=`<div class="ride-empty">কোনো রিজার্ভেশন পাওয়া যায়নি।</div>`;return;}
  con.innerHTML=mine.map(r=>{
    let statusLabel="", statusClass="", actionBtn="";
    if(r.status==="used")       {statusLabel="ব্যবহৃত";   statusClass="completed";}
    else if(r.status==="cancelled"){
      statusLabel="ক্যান্সেল"; statusClass="suspended";
      if(r.finePaid===false){
        actionBtn=`<div style="margin-top:8px;font-size:13px;color:#dc3545;font-weight:600">⚠️ জরিমানা বকেয়া: ৳${r.fineAmount||0}</div>
        <button class="btn-warn" style="margin-top:6px;font-size:13px;padding:7px 14px;width:100%" onclick="openPayFineModal('${r.coupon}')">জরিমানা পরিশোধ করুন</button>`;
      } else {
        actionBtn=`<div style="margin-top:8px;font-size:12px;color:#28a745">✅ জরিমানা পরিশোধিত</div>`;
      }
    }
    else{statusLabel="অপেক্ষমান";statusClass="pending";
      actionBtn=`<button class="btn-danger" style="margin-top:8px;font-size:13px;padding:7px 14px;width:100%" onclick="openCancelModal('${r.coupon}')">ক্যান্সেল করুন</button>`;
    }
    return `<div class="reserve-card">
      <div class="reserve-card-header">
        <span class="coupon-tag">${r.coupon}</span>
        <span class="ride-status ${statusClass}">${statusLabel}</span>
      </div>
      <p><strong>তারিখ ও সময়:</strong> ${r.date} — ${r.time}</p>
      <p><strong>রুট:</strong> ${r.fromName} → ${r.toName}</p>
      ${r.seatLabel?`<p><strong>কার্টের ধরন:</strong> ${r.seatLabel}</p>`:""}
      ${r.hours?`<p><strong>সময়কাল:</strong> ${r.hours} ঘন্টা</p>`:""}
      ${r.totalFare?`<p><strong>মোট ভাড়া:</strong> ৳${r.totalFare}</p>`:""}
      ${r.userBatch?`<p><strong>ব্যাচ:</strong> ${r.userBatch}</p>`:""}
      ${actionBtn}
    </div>`;
  }).join("");
}

// ══════════════════════════════════════════════════
//  CANCEL RESERVATION — শর্ত ও জরিমানা
// ══════════════════════════════════════════════════
function openCancelModal(coupon){
  const reservations=loadReservations();
  const r=reservations.find(x=>x.coupon===coupon);
  if(!r){toast("❌","রিজার্ভেশন পাওয়া যায়নি","err");return;}

  // যাত্রার সময় নির্ণয়
  const tripDateTime=new Date(r.date+"T"+r.time);
  const now=new Date();
  const hoursLeft=(tripDateTime-now)/(1000*60*60);

  const isEarly=hoursLeft>=4;
  const penaltyPct=isEarly?10:45;
  const fineAmount=Math.round((r.totalFare||0)*penaltyPct/100);

  const penaltyClass=isEarly?"early":"late";
  const penaltyTitle=isEarly?" ৪ ঘন্টা বা তার বেশি সময়  আগে ক্যান্সেল করলে (১০% জরিমানা)":"⚠️ ৪ ঘন্টার কম সময় পূর্বে ক্যান্সেল করলে (৪৫% জরিমানা)";

  document.getElementById("cancelModalBody").innerHTML=`
    <div class="cancel-info-box">
      <p><strong>কুপন:</strong> ${r.coupon}</p>
      <p><strong>তারিখ ও সময়:</strong> ${r.date} — ${r.time}</p>
      <p><strong>রুট:</strong> ${r.fromName} → ${r.toName}</p>
      <p><strong>মোট ভাড়া:</strong> ৳${r.totalFare}</p>
      <p><strong>যাত্রার আগে বাকি:</strong> ${hoursLeft>0?hoursLeft.toFixed(1)+" ঘন্টা":"সময় পার হয়ে গেছে"}</p>
    </div>
    <div class="cancel-penalty-box ${penaltyClass}">
      <div class="penalty-title">${penaltyTitle}</div>
      <div class="penalty-amount">জরিমানা: ৳${fineAmount}</div>
      <small>মোট ভাড়া ৳${r.totalFare} এর ${penaltyPct}%</small>
    </div>
    <p style="font-size:13px;color:#555;margin-bottom:12px">জরিমানা <strong>ওয়ালেট থেকে স্বয়ংক্রিয়ভাবে কাটা হবে</strong>, অথবা নিচে বিকাশে পাঠান:</p>
    <div class="bkash-info">
      বিকাশে সেন্ডমানি করুন:<br><strong>01627457836</strong>
      <br><small style="opacity:.8">৳${fineAmount} পাঠিয়ে ট্রানজেকশন ID নিচে দিন</small>
    </div>
    <div class="cancel-payment-section">
      <label>বিকাশ ট্রানজেকশন ID (ঐচ্ছিক — ওয়ালেটে টাকা থাকলে দরকার নেই)</label>
      <input type="text" id="cancelTxId" class="input-field" placeholder="যেমন: 8AB1234XYZ (না থাকলে খালি রাখুন)" />
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn-danger btn-full" onclick="confirmCancel('${coupon}',${fineAmount},${isEarly})">ক্যান্সেল নিশ্চিত করুন</button>
      <button class="btn-secondary btn-full" onclick="closeCancelModal()">ফিরে যান</button>
    </div>
    <p style="font-size:12px;color:#999;margin-top:10px;text-align:center">⚠️ জরিমানা ৭২ ঘন্টার মধ্যে না দিলে অ্যাকাউন্ট সাসপেন্ড হবে।</p>
  `;
  document.getElementById("cancelModal").classList.add("open");
}

function confirmCancel(coupon, fineAmount, isEarly){
  const txId=document.getElementById("cancelTxId")?document.getElementById("cancelTxId").value.trim():"";
  const reservations=loadReservations();
  const idx=reservations.findIndex(r=>r.coupon===coupon);
  if(idx===-1){toast("❌","রিজার্ভেশন পাওয়া যায়নি","err");return;}

  reservations[idx].status="cancelled";
  reservations[idx].cancelledAt=new Date().toISOString();
  reservations[idx].fineAmount=fineAmount;

  // ওয়ালেট থেকে কাটার চেষ্টা করো
  const users=loadUsers();
  const ui=users.findIndex(u=>u.id===reservations[idx].userId);
  let paidFromWallet=false;

  if(ui>-1&&users[ui].balance>=fineAmount){
    users[ui].balance-=fineAmount;
    saveUsers(users);
    if(currentUser&&currentUser.id===users[ui].id){
      currentUser.balance=users[ui].balance;
      saveMe(currentUser);
      document.getElementById("walBal").textContent=currentUser.balance;
    }
    reservations[idx].finePaid=true;
    reservations[idx].fineTxId="wallet";
    paidFromWallet=true;
  } else if(txId){
    // বিকাশ দিয়ে দিলে
    reservations[idx].finePaid=true;
    reservations[idx].fineTxId=txId;
  } else {
    // বাকি জরিমানা
    reservations[idx].finePaid=false;
  }

  saveReservations(reservations);
  closeCancelModal();
  renderMyReservations();

  if(paidFromWallet){
    toast("✅",`রিজার্ভেশন ক্যান্সেল হয়েছে। জরিমানা ৳${fineAmount} ওয়ালেট থেকে কাটা হয়েছে।`,"ok");
  } else if(txId){
    toast("✅",`রিজার্ভেশন ক্যান্সেল হয়েছে। বিকাশ পেমেন্ট রেকর্ড হয়েছে।`,"ok");
  } else {
    toast("⚠️",`রিজার্ভেশন ক্যান্সেল হয়েছে। জরিমানা ৳${fineAmount} বকেয়া আছে। ৭২ ঘন্টার মধ্যে পরিশোধ করুন!`,"warn");
    // সাসপেন্ড টাইমার শুরু — পরের লগইনে checkSuspension চেক করবে
  }
}

function openPayFineModal(coupon){
  const r=loadReservations().find(x=>x.coupon===coupon);
  if(!r) return;
  document.getElementById("cancelModalBody").innerHTML=`
    <div class="cancel-info-box">
      <p><strong>কুপন:</strong> ${r.coupon}</p>
      <p><strong>বকেয়া জরিমানা:</strong> <span style="color:#dc3545;font-weight:700;font-size:18px">৳${r.fineAmount||0}</span></p>
    </div>
    <div class="bkash-info">বিকাশে সেন্ডমানি করুন:<br><strong>01627457836</strong></div>
    <div class="cancel-payment-section">
      <label>বিকাশ ট্রানজেকশন ID</label>
      <input type="text" id="payFineTxId" class="input-field" placeholder="যেমন: 8AB1234XYZ" />
    </div>
    <div class="cancel-or-divider">— অথবা —</div>
    <p style="font-size:13px;color:#555;margin-bottom:10px;text-align:center">ওয়ালেটে পর্যাপ্ত ব্যালেন্স থাকলে সরাসরি কাটা হবে</p>
    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn-primary btn-full" onclick="payOneFine('${coupon}')">জরিমানা পরিশোধ করুন</button>
      <button class="btn-secondary btn-full" onclick="closeCancelModal()">বাতিল</button>
    </div>
  `;
  document.getElementById("cancelModal").classList.add("open");
}

function payOneFine(coupon){
  const txId=document.getElementById("payFineTxId")?document.getElementById("payFineTxId").value.trim():"";
  const reservations=loadReservations();
  const idx=reservations.findIndex(r=>r.coupon===coupon);
  if(idx===-1) return;
  const fine=reservations[idx].fineAmount||0;
  const users=loadUsers();
  const ui=users.findIndex(u=>u.id===reservations[idx].userId);
  if(ui>-1&&users[ui].balance>=fine){
    users[ui].balance-=fine; saveUsers(users);
    if(currentUser&&currentUser.id===users[ui].id){currentUser.balance=users[ui].balance;saveMe(currentUser);document.getElementById("walBal").textContent=currentUser.balance;}
    reservations[idx].finePaid=true; reservations[idx].fineTxId="wallet";
    saveReservations(reservations);
    // সাসপেন্ড তুলে দাও
    if(ui>-1){users[ui].suspended=false;saveUsers(users);}
    if(currentUser){currentUser.suspended=false;saveMe(currentUser);}
    closeCancelModal(); renderMyReservations(); updateUserUI();
    toast("✅",`জরিমানা ৳${fine} ওয়ালেট থেকে কাটা হয়েছে।`,"ok");
  } else if(txId){
    reservations[idx].finePaid=true; reservations[idx].fineTxId=txId;
    saveReservations(reservations);
    if(ui>-1){users[ui].suspended=false;saveUsers(users);}
    if(currentUser){currentUser.suspended=false;saveMe(currentUser);}
    closeCancelModal(); renderMyReservations(); updateUserUI();
    toast("✅","বিকাশ পেমেন্ট রেকর্ড হয়েছে। একসেস পুনরায় চালু!","ok");
  } else {
    toast("⚠️","ট্রানজেকশন ID দিন অথবা ওয়ালেটে পর্যাপ্ত ব্যালেন্স রাখুন","warn");
  }
}

function closeCancelModal(){ document.getElementById("cancelModal").classList.remove("open"); }

// ══════════════════════════════════════════════════
//  FARE CALCULATOR
// ══════════════════════════════════════════════════
function calculateFare(){
  const from=document.getElementById("fromLocation").value, to=document.getElementById("toLocation").value;
  const type=document.getElementById("userType").value;
  if(!from||!to){toast("⚠️","শুরু ও গন্তব্য নির্বাচন করুন","warn");return;}
  if(from===to){toast("⚠️","একই স্থান নির্বাচন করা যাবে না","warn");return;}
  const{distance,fare}=fareFor(from,to,type);
  const names={student:"স্টুডেন্ট",staff:"স্টাফ",guest:"অতিথি"};
  document.getElementById("fareDistance").textContent=distance+" km";
  document.getElementById("fareType").textContent=names[type];
  document.getElementById("totalFare").textContent="৳"+fare;
  document.getElementById("fareResult").style.display="block";
}

// ══════════════════════════════════════════════════
//  RIDE HISTORY
// ══════════════════════════════════════════════════
function renderRideHistory(){
  const con=document.getElementById("rideHistory"); if(!con) return;
  if(!currentUser){con.innerHTML=`<div class="ride-empty">হিস্ট্রি দেখতে আগে লগইন করুন</div>`;return;}
  const rides=loadRides().filter(r=>r.userId===currentUser.id);
  if(rides.length===0){con.innerHTML=`<div class="ride-empty">এখনো কোনো রাইড নেই।</div>`;return;}
  con.innerHTML=rides.map(r=>`<div class="ride-card">
    <div class="ride-header"><span class="ride-date">${r.date}</span><span class="ride-status completed">সম্পন্ন</span></div>
    <div class="ride-details">
      <p><strong>রুট:</strong> ${r.fromName} → ${r.toName}</p>
      <p><strong>কার্ট নং:</strong> ${r.cartId}</p>
      <p><strong>সময়:</strong> ${r.time}</p>
      ${r.seatCount?`<p><strong>সিট সংখ্যা:</strong> ${r.seatCount}</p>`:""}
      <p><strong>ভাড়া:</strong> ৳${r.fare}</p>
    </div>
  </div>`).join("");
}

// ══════════════════════════════════════════════════
//  TOPUP
// ══════════════════════════════════════════════════
function openTopup(){if(!currentUser){toast("⚠️","প্রথমে লগইন করুন","warn");openAuth();return;}document.getElementById("topupModal").classList.add("open");}
function closeTopup(){document.getElementById("topupModal").classList.remove("open");}
function setTP(v){document.getElementById("tpAmt").value=v;}
function doTopup(){
  const amt=parseFloat(document.getElementById("tpAmt").value);
  if(!amt||amt<=0){toast("⚠️","সঠিক পরিমাণ লিখুন","warn");return;}
  currentUser.balance+=amt;
  const users=loadUsers(), i=users.findIndex(u=>u.id===currentUser.id);
  if(i>-1){users[i].balance=currentUser.balance;saveUsers(users);}
  saveMe(currentUser); document.getElementById("walBal").textContent=currentUser.balance;
  closeTopup(); toast("💰",`৳${amt} সফলভাবে যোগ হয়েছে!`,"ok");
}

// ══════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════
function toast(icon,msg,type="ok"){
  const t=document.getElementById("toast");
  document.getElementById("t-ico").textContent=icon;
  document.getElementById("t-msg").textContent=msg;
  t.className=`toast ${type} show`;
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),3500);
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
window.onload=()=>{
  initMap(); renderCartList(); updateStats(); updateUserUI(); renderRideHistory(); renderDropoffList();
  if(currentUser) fillReserveFields();
  // সাসপেন্ড চেক লগইন অবস্থায়
  if(currentUser) checkSuspension(currentUser);

  document.getElementById("boardFrom").addEventListener("change",updateBoardFarePreview);
  document.getElementById("boardTo").addEventListener("change",updateBoardFarePreview);
  document.getElementById("boardSeatCount").addEventListener("change",updateBoardFarePreview);

  if(currentDriver){
    const cart=CARTS.find(c=>c.id===currentDriver.cartId);
    if(cart&&currentDriver.online){cart.status="active";if(!cart.path||cart.path.length<2)cart.path=buildCartPath(cart);}
    renderMarkers();renderCartList();updateStats();
  }

  document.querySelectorAll(".modal").forEach(m=>{
    m.addEventListener("click",e=>{
      if(e.target===m){
        m.classList.remove("open");
        if(m.id==="trackModal") closeTrackModal();
        if(m.id==="authGuardModal") closeGuard();
        if(m.id==="cancelModal") closeCancelModal();
      }
    });
  });

  setInterval(()=>{
    document.querySelectorAll(".stat-value").forEach(s=>{s.style.transform="scale(1.1)";setTimeout(()=>s.style.transform="scale(1)",200);});
  },5000);
};
