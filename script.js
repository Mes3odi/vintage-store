const FIREBASE_PRODUCTS_URL = "https://vintage-archive-store-default-rtdb.firebaseio.com/products.json";
const FIREBASE_REQUESTS_URL = "https://vintage-archive-store-default-rtdb.firebaseio.com/requests.json";

const translations = {
    en: { stockMsg: "Available Artifact", soldOut: "Lost in Time", buyBtn: "Request Piece", loading: "Unearthing relics..." },
    fr: { stockMsg: "Pièce Disponible", soldOut: "Épuisé dans le Temps", buyBtn: "Demander la Pièce", loading: "Fouilles en cours..." },
    ar: { stockMsg: "قطعة متوفرة", soldOut: "ضاعت في الزمن", buyBtn: "طلب القطعة", loading: "جاري البحث عن الأثريات..." }
};

let currentLang = 'en';
let rawProductsData = {};
let selectedItemName = "";
let selectedItemPrice = "";

async function loadInventory() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-style: italic;">${translations[currentLang].loading}</p>`;

    try {
        const response = await fetch(FIREBASE_PRODUCTS_URL);
        rawProductsData = await response.json();
        renderGrid();
    } catch (error) {
        console.error("Error fetching relics:", error);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--accent);">Failed to load inventory.</p>`;
    }
}

function renderGrid() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (!rawProductsData) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No relics found in the archives.</p>`;
        return;
    }

    Object.keys(rawProductsData).forEach(key => {
        const item = rawProductsData[key];
        const isAvailable = parseInt(item.stock) > 0;

        const card = document.createElement('article');
        card.className = 'card';
        
        const safeName = item.name ? item.name.replace(/'/g, "\\'") : "Item";

        card.innerHTML = `
            <div style="position: relative; margin-bottom: 1rem;">
                <img src="${item.image || 'https://via.placeholder.com/300x200?text=No+Photo'}" 
                     alt="${safeName}" 
                     style="width: 100%; height: 200px; object-fit: cover; border: 1px solid var(--border); filter: sepia(30%);">
                <span class="badge" style="position: absolute; top: 8px; right: 8px; background: ${isAvailable ? 'var(--accent)' : '#666'};">
                    ${isAvailable ? translations[currentLang].stockMsg : translations[currentLang].soldOut}
                </span>
            </div>
            <h2 style="font-family: 'Special Elite', cursive; font-size: 1.3rem; margin: 0 0 0.5rem 0;">${item.name}</h2>
            <div class="price">$${item.price}</div>
            <button 
                onclick="openRequestModal('${safeName}', '${item.price}')" 
                ${!isAvailable ? 'disabled' : ''} 
                style="width: 100%; margin-top: 1rem; padding: 0.75rem; background: var(--ink); color: var(--bg); border: none; font-family: 'Space Mono', monospace; font-weight: bold; cursor: pointer; text-transform: uppercase;">
                ${translations[currentLang].buyBtn}
            </button>
        `;
        
        grid.appendChild(card);
    });
}

function setLang(lang) {
    currentLang = lang;
    document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    renderGrid();
}

function openRequestModal(name, price) {
    selectedItemName = name;
    selectedItemPrice = price;
    document.getElementById('modal-title').innerText = `Request: ${name} ($${price})`;
    document.getElementById('request-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('request-modal').style.display = 'none';
}

document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.innerText = "SENDING...";
    btn.disabled = true;
    
    const requestData = {
        item: selectedItemName,
        price: selectedItemPrice,
        customer_name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        timestamp: new Date().toISOString()
    };

    try {
        const res = await fetch(FIREBASE_REQUESTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (res.ok) {
            alert("Request logged! The curator will contact you shortly.");
            closeModal();
            document.getElementById('order-form').reset();
        } else {
            alert("Failed to submit. Please check your network connection.");
        }
    } catch (err) {
        alert("Network error sending request.");
    } finally {
        btn.innerText = "SEND REQUEST";
        btn.disabled = false;
    }
});

// Initial Load
loadInventory();
