// Global Variables
let map;
let cartMarkers = [];
let locationMarkers = [];
let currentUser = null;

// Sample Data
const users = [
    { id: '2021001', name: 'রহিম আহমেদ', type: 'student', balance: 250, password: '1234' },
    { id: '2021002', name: 'করিম হোসেন', type: 'student', balance: 180, password: '1234' },
    { id: 'S001', name: 'ফারহানা বেগম', type: 'staff', balance: 500, password: '1234' }
];

const locations = {
    maingate: { name: 'মেইন গেট', lat: 23.8103, lng: 90.4125 },
    library: { name: 'লাইব্রেরি', lat: 23.8113, lng: 90.4135 },
    cafeteria: { name: 'ক্যাফেটেরিয়া', lat: 23.8095, lng: 90.4145 },
    hostel: { name: 'হোস্টেল', lat: 23.8085, lng: 90.4155 },
    academic: { name: 'একাডেমিক বিল্ডিং', lat: 23.8105, lng: 90.4115 },
    sports: { name: 'স্পোর্টস কমপ্লেক্স', lat: 23.8120, lng: 90.4160 }
};

const carts = [
    { id: 'UC-101', driver: 'আব্দুল করিম', lat: 23.8103, lng: 90.4125, passengers: 3, capacity: 6, status: 'active', route: 'মেইন গেট → লাইব্রেরি' },
    { id: 'UC-102', driver: 'মোহাম্মদ আলী', lat: 23.8095, lng: 90.4145, passengers: 5, capacity: 8, status: 'active', route: 'ক্যাফেটেরিয়া → হোস্টেল' },
    { id: 'UC-103', driver: 'জামাল উদ্দিন', lat: 23.8105, lng: 90.4115, passengers: 2, capacity: 6, status: 'active', route: 'একাডেমিক → স্পোর্টস' },
    { id: 'UC-104', driver: 'রফিক মিয়া', lat: 23.8085, lng: 90.4155, passengers: 0, capacity: 8, status: 'inactive', route: 'বিরতি' },
    { id: 'UC-105', driver: 'হাসান আলী', lat: 23.8120, lng: 90.4160, passengers: 0, capacity: 6, status: 'inactive', route: 'বিরতি' }
];

const fareRules = {
    'maingate-library': { distance: 0.8, base: 10, student: 8, staff: 8.5, guest: 10 },
    'library-hostel': { distance: 1.2, base: 15, student: 12, staff: 12.75, guest: 15 },
    'hostel-cafeteria': { distance: 0.6, base: 8, student: 6, staff: 6.4, guest: 8 },
    'cafeteria-sports': { distance: 1.5, base: 20, student: 16, staff: 17, guest: 20 },
    'maingate-cafeteria': { distance: 1.0, base: 12, student: 10, staff: 10.2, guest: 12 },
    'library-sports': { distance: 1.8, base: 22, student: 18, staff: 18.7, guest: 22 }
};

// Initialize Map
function initMap() {
    map = L.map('map').setView([23.8103, 90.4135], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add location markers
    Object.entries(locations).forEach(([key, loc]) => {
        const marker = L.marker([loc.lat, loc.lng], {
            icon: L.divIcon({
                className: 'location-marker',
                html: `<div style="background: #28a745; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`
            })
        }).addTo(map);
        
        marker.bindPopup(`<b>${loc.name}</b>`);
        locationMarkers.push(marker);
    });

    // Add cart markers
    updateCartMarkers();
    
    // Update cart list
    updateCartList();

    // Simulate cart movement
    setInterval(updateCartPositions, 3000);
}

// Update Cart Markers
function updateCartMarkers() {
    // Clear existing markers
    cartMarkers.forEach(marker => map.removeLayer(marker));
    cartMarkers = [];

    carts.forEach(cart => {
        if (cart.status === 'active') {
            const marker = L.marker([cart.lat, cart.lng], {
                icon: L.divIcon({
                    className: 'cart-marker',
                    html: `<div style="background: white; border: 3px solid #667eea; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">🚗</div>`
                })
            }).addTo(map);
            
            marker.bindPopup(`
                <div style="text-align: center;">
                    <b>${cart.id}</b><br>
                    ড্রাইভার: ${cart.driver}<br>
                    যাত্রী: ${cart.passengers}/${cart.capacity}<br>
                    রুট: ${cart.route}
                </div>
            `);
            
            cartMarkers.push(marker);
        }
    });
}

// Update Cart Positions (Simulate Movement)
function updateCartPositions() {
    carts.forEach(cart => {
        if (cart.status === 'active') {
            // Random small movement
            cart.lat += (Math.random() - 0.5) * 0.0005;
            cart.lng += (Math.random() - 0.5) * 0.0005;
        }
    });
    updateCartMarkers();
    updateStats();
}

// Update Statistics
function updateStats() {
    const activeCarts = carts.filter(c => c.status === 'active').length;
    const totalPassengers = carts.reduce((sum, c) => sum + c.passengers, 0);
    
    document.getElementById('totalCarts').textContent = carts.length;
    document.getElementById('activeCarts').textContent = activeCarts;
    document.getElementById('totalPassengers').textContent = totalPassengers;
}

// Update Cart List
function updateCartList() {
    const container = document.getElementById('cartListContainer');
    container.innerHTML = '';
    
    carts.filter(c => c.status === 'active').forEach(cart => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-info">
                <div class="cart-number">${cart.id}</div>
                <div class="cart-status active">চলমান</div>
                <div class="cart-passengers">যাত্রী: ${cart.passengers}/${cart.capacity}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">রুট: ${cart.route}</div>
            </div>
            <button class="btn-secondary" onclick="trackCart('${cart.id}')">ট্র্যাক করুন</button>
        `;
        container.appendChild(cartItem);
    });
}

// Track Specific Cart
function trackCart(cartId) {
    const cart = carts.find(c => c.id === cartId);
    if (cart) {
        map.setView([cart.lat, cart.lng], 17);
        // Find and open popup
        cartMarkers.forEach(marker => {
            if (marker.getPopup().getContent().includes(cartId)) {
                marker.openPopup();
            }
        });
    }
}

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Login Functions
function toggleLogin() {
    const modal = document.getElementById('loginModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function login(event) {
    event.preventDefault();
    const id = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.id === id && u.password === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('walletBalance').textContent = user.balance;
        toggleLogin();
        alert('লগইন সফল হয়েছে!');
    } else {
        alert('ভুল আইডি বা পাসওয়ার্ড!');
    }
}

// Scanner Functions
function simulateScan() {
    // Simulate scanning delay
    setTimeout(() => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        displayScanResult(randomUser);
    }, 1500);
}

function displayScanResult(user) {
    document.getElementById('scannedName').textContent = user.name;
    document.getElementById('scannedId').textContent = user.id;
    document.getElementById('scannedType').textContent = user.type === 'student' ? 'স্টুডেন্ট' : 'স্টাফ';
    document.getElementById('scannedBalance').textContent = user.balance;
    document.getElementById('scanResult').style.display = 'block';
}

function verifyManualId() {
    const id = document.getElementById('manualId').value;
    const user = users.find(u => u.id === id);
    
    if (user) {
        displayScanResult(user);
    } else {
        alert('আইডি পাওয়া যায়নি!');
    }
}

function confirmBoarding() {
    alert('যাত্রী সফলভাবে বোর্ড হয়েছে!');
    document.getElementById('scanResult').style.display = 'none';
    document.getElementById('manualId').value = '';
    
    // Update passenger count
    const activeCart = carts.find(c => c.status === 'active');
    if (activeCart && activeCart.passengers < activeCart.capacity) {
        activeCart.passengers++;
        updateCartList();
        updateStats();
    }
}

// Fare Calculator
function calculateFare() {
    const from = document.getElementById('fromLocation').value;
    const to = document.getElementById('toLocation').value;
    const userType = document.getElementById('userType').value;
    
    if (!from || !to) {
        alert('শুরু ও গন্তব্য স্থান নির্বাচন করুন!');
        return;
    }
    
    if (from === to) {
        alert('শুরু ও গন্তব্য একই হতে পারবে না!');
        return;
    }
    
    // Find fare rule
    const ruleKey1 = `${from}-${to}`;
    const ruleKey2 = `${to}-${from}`;
    const rule = fareRules[ruleKey1] || fareRules[ruleKey2];
    
    if (!rule) {
        // Calculate default fare based on distance estimate
        const baseFare = 15;
        const fare = calculateDefaultFare(baseFare, userType);
        displayFareResult(1.0, baseFare, fare, userType);
    } else {
        const baseFare = rule.base;
        const finalFare = rule[userType];
        displayFareResult(rule.distance, baseFare, finalFare, userType);
    }
}

function calculateDefaultFare(baseFare, userType) {
    if (userType === 'student') {
        return Math.round(baseFare * 0.8);
    } else if (userType === 'staff') {
        return Math.round(baseFare * 0.85 * 10) / 10;
    }
    return baseFare;
}

function displayFareResult(distance, baseFare, finalFare, userType) {
    let discount = 0;
    let discountPercent = 0;
    
    if (userType === 'student') {
        discountPercent = 20;
        discount = baseFare - finalFare;
    } else if (userType === 'staff') {
        discountPercent = 15;
        discount = baseFare - finalFare;
    }
    
    document.getElementById('fareDistance').textContent = `${distance} কিমি`;
    document.getElementById('baseFare').textContent = `৳${baseFare}`;
    document.getElementById('fareDiscount').textContent = discount > 0 ? `-৳${discount.toFixed(2)} (${discountPercent}%)` : '৳0';
    document.getElementById('totalFare').textContent = `৳${finalFare}`;
    document.getElementById('fareResult').style.display = 'block';
}

// Wallet Functions
function topupWallet() {
    const amount = prompt('কত টাকা টপ-আপ করতে চান?');
    if (amount && !isNaN(amount) && amount > 0) {
        if (currentUser) {
            currentUser.balance += parseFloat(amount);
            document.getElementById('walletBalance').textContent = currentUser.balance;
            alert(`৳${amount} টাকা সফলভাবে যোগ হয়েছে!`);
        } else {
            alert('প্রথমে লগইন করুন!');
        }
    }
}

// Initialize on page load
window.onload = function() {
    initMap();
    updateStats();
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('loginModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
};

// Add some animation to stats
setInterval(() => {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        stat.style.transform = 'scale(1.1)';
        setTimeout(() => {
            stat.style.transform = 'scale(1)';
        }, 200);
    });
}, 5000);
