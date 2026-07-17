// ==========================================
// Serene Application Logic
// SPA Controller & LocalStorage State Management
// ==========================================

// Global state container
let state = {
    assets: [],
    inventory: [],
    cashflow: [],
    sales: [],
    purchases: []
};

// Current POS Cart State
let cart = [];

// Chart instances
let cashflowChartInstance = null;
let distributionChartInstance = null;

// Constant Current Date for calculations (aligned with July 16, 2026)
const CURRENT_DATE = new Date("2026-07-16");

// Initialize application on load
document.addEventListener("DOMContentLoaded", () => {
    initData();
    setupNavigation();
    setupEventListeners();
    setupLaporanListeners();
    renderAll();
    updateDateDisplay();
});

// Format today's date in Indonesian
function updateDateDisplay() {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = CURRENT_DATE.toLocaleDateString('id-ID', options);
    document.getElementById("current-date").textContent = dateStr;
}

// -------------------------------------------------------------
// STATE & LOCAL STORAGE INITIALIZATION
// -------------------------------------------------------------
function initData() {
    const storedData = localStorage.getItem("serene_state");
    if (storedData) {
        try {
            state = JSON.parse(storedData);
            // Re-validate structure just in case
            if (!state.assets) state.assets = [];
            if (!state.inventory) state.inventory = [];
            if (!state.cashflow) state.cashflow = [];
            if (!state.sales) state.sales = [];
            if (!state.purchases) state.purchases = [];
        } catch (e) {
            console.error("Error loading data from localStorage, initializing demo data", e);
            loadDemoData();
        }
    } else {
        loadDemoData();
    }
}

function saveState() {
    localStorage.setItem("serene_state", JSON.stringify(state));
}

// Prepopulate data for a coffee shop so the app is immediately visual
function loadDemoData() {
    state.assets = [
        {
            id: "ast-1",
            name: "Mesin Espresso La Marzocco Linea",
            category: "Mesin",
            buyDate: "2025-01-10",
            cost: 45000000,
            usefulLife: 8
        },
        {
            id: "ast-2",
            name: "Laptop Kasir ASUS VivoBook & Printer",
            category: "Elektronik",
            buyDate: "2026-02-15",
            cost: 8000000,
            usefulLife: 4
        },
        {
            id: "ast-3",
            name: "Meja & Kursi Kayu Jati Set (10 unit)",
            category: "Furnitur",
            buyDate: "2025-05-20",
            cost: 16000000,
            usefulLife: 5
        }
    ];

    state.inventory = [
        {
            id: "inv-1",
            sku: "BRG-001",
            name: "Kopi Arabika Toraja 250g",
            stock: 35,
            unit: "Pcs",
            buyPrice: 45000,
            sellPrice: 75000,
            minStock: 10
        },
        {
            id: "inv-2",
            sku: "BRG-002",
            name: "Kopi Robusta Temanggung 250g",
            stock: 50,
            unit: "Pcs",
            buyPrice: 30000,
            sellPrice: 50000,
            minStock: 10
        },
        {
            id: "inv-3",
            sku: "BRG-003",
            name: "Susu UHT Full Cream Greenfields 1L",
            stock: 6, // Triggers Low Stock Alert!
            unit: "Kotak",
            buyPrice: 15000,
            sellPrice: 22000,
            minStock: 10
        },
        {
            id: "inv-4",
            sku: "BRG-004",
            name: "Sirup Caramel Monin 700ml",
            stock: 4, // Triggers Low Stock Alert!
            unit: "Botol",
            buyPrice: 85000,
            sellPrice: 125000,
            minStock: 5
        },
        {
            id: "inv-5",
            sku: "BRG-005",
            name: "Cup Kopi Kertas Hot + Lid 8oz",
            stock: 240,
            unit: "Pcs",
            buyPrice: 1200,
            sellPrice: 2000,
            minStock: 50
        }
    ];

    // Seed cashflow: start with owner capital, pay rent, buy initial stock, salaries, POS sales
    state.cashflow = [
        {
            id: "cf-1",
            timestamp: "2026-06-01T09:00:00.000Z",
            type: "masuk",
            source: "Manual",
            category: "Modal",
            description: "Suntikan Modal Awal Usaha (Pemilik)",
            amount: 90000000
        },
        {
            id: "cf-2",
            timestamp: "2026-06-02T10:30:00.000Z",
            type: "keluar",
            source: "Manual",
            category: "Sewa",
            description: "Sewa Ruko & Tempat Usaha (1 Tahun)",
            amount: 24000000
        },
        {
            id: "cf-3",
            timestamp: "2026-06-15T14:20:00.000Z",
            type: "keluar",
            source: "Manual",
            category: "Operasional",
            description: "Pembelian Blender & Peralatan Kecil",
            amount: 2500000
        },
        {
            id: "cf-4",
            timestamp: "2026-06-30T17:00:00.000Z",
            type: "keluar",
            source: "Manual",
            category: "Gaji",
            description: "Pembayaran Gaji Karyawan Bulan Juni",
            amount: 4000000
        },
        {
            id: "cf-5",
            timestamp: "2026-07-05T19:30:00.000Z",
            type: "masuk",
            source: "Penjualan",
            category: "POS",
            description: "Penjualan Kasir POS Mingguan (Pekan 1 Juli)",
            amount: 5850000
        },
        {
            id: "cf-6",
            timestamp: "2026-07-10T11:45:00.000Z",
            type: "keluar",
            source: "Pembelian",
            category: "Restock",
            description: "Pembelian Stok Biji Kopi Toraja ke Supplier",
            amount: 1350000
        },
        {
            id: "cf-7",
            timestamp: "2026-07-12T20:00:00.000Z",
            type: "masuk",
            source: "Penjualan",
            category: "POS",
            description: "Penjualan Kasir POS Mingguan (Pekan 2 Juli)",
            amount: 7200000
        },
        {
            id: "cf-8",
            timestamp: "2026-07-15T15:00:00.000Z",
            type: "keluar",
            source: "Manual",
            category: "Operasional",
            description: "Bayar Tagihan Listrik & WiFi Ruko",
            amount: 850000
        }
    ];

    state.sales = [
        {
            id: "sl-1",
            timestamp: "2026-07-12T20:00:00.000Z",
            items: [
                { productId: "inv-1", name: "Kopi Arabika Toraja 250g", qty: 2, price: 75000, total: 150000 },
                { productId: "inv-4", name: "Sirup Caramel Monin 700ml", qty: 1, price: 125000, total: 125000 }
            ],
            subtotal: 275000,
            discount: 10, // 10% discount
            total: 247500,
            payAmount: 250000,
            change: 2500
        }
    ];

    state.purchases = [
        {
            id: "pc-1",
            timestamp: "2026-07-10T11:45:00.000Z",
            productId: "inv-1",
            name: "Kopi Arabika Toraja 250g",
            qty: 30,
            price: 45000,
            total: 1350000
        }
    ];

    saveState();
}

// -------------------------------------------------------------
// NAVIGATION SWITCHER (SPA EFFECT)
// -------------------------------------------------------------
function setupNavigation() {
    const menuItems = document.querySelectorAll(".menu-item");
    const tabViews = document.querySelectorAll(".tab-view");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");

    const tabSubtitles = {
        dashboard: "Ringkasan performa usaha Anda hari ini",
        aset: "Daftar aset tetap dan akumulasi penyusutan nilai",
        persediaan: "Manajemen stok barang dagangan dan batas minimum",
        kas: "Jurnal pencatatan transaksi kas masuk dan keluar",
        penjualan: "Aplikasi Kasir POS (Point of Sale) untuk UMKM",
        pembelian: "Belanja stok barang dagangan ke supplier",
        laporan: "Laporan laba rugi usaha berdasarkan periode"
    };

    const tabTitles = {
        dashboard: "Dashboard",
        aset: "Manajemen Aset",
        persediaan: "Persediaan Barang",
        kas: "Jurnal Arus Kas",
        penjualan: "Penjualan (Kasir POS)",
        pembelian: "Pembelian Stok",
        laporan: "Laporan Laba Rugi"
    };

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const tabName = item.getAttribute("data-tab");

            // Deactivate all
            menuItems.forEach(i => i.classList.remove("active"));
            tabViews.forEach(v => v.classList.remove("active"));

            // Activate current
            item.classList.add("active");
            document.getElementById(`view-${tabName}`).classList.add("active");

            // Update titles
            pageTitle.textContent = tabTitles[tabName];
            pageSubtitle.textContent = tabSubtitles[tabName];

            // Re-render specifics if needed (like charts or catalogs)
            if (tabName === "dashboard") {
                renderCharts();
            } else if (tabName === "penjualan") {
                renderPOSCatalog();
                renderCart();
            } else if (tabName === "pembelian") {
                populatePurchaseProductSelect();
            } else if (tabName === "laporan") {
                renderLabaRugi();
            }

            // Close modals when switching pages
            closeAllModals();
        });
    });

    // Dashboard quick redirect links
    document.getElementById("view-inventory-from-dash").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("nav-persediaan").click();
    });
    document.getElementById("view-cash-from-dash").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("nav-kas").click();
    });
}

// Helper to format currency to IDR Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(number);
}

// -------------------------------------------------------------
// EVENT LISTENERS & FORM SUBMISSIONS
// -------------------------------------------------------------
function setupEventListeners() {
    // Modal Close Triggers
    document.querySelectorAll(".btn-close-modal").forEach(btn => {
        btn.addEventListener("click", closeAllModals);
    });

    // Quick Cashflow transaction from Header
    document.getElementById("btn-quick-transaction").addEventListener("click", () => {
        openModal("modal-cashflow");
    });

    // 1. ASSET HANDLERS
    document.getElementById("btn-add-asset").addEventListener("click", () => {
        document.getElementById("form-asset").reset();
        document.getElementById("asset-id").value = "";
        document.getElementById("modal-asset-title").textContent = "Tambah Aset Baru";
        openModal("modal-asset");
    });

    document.getElementById("form-asset").addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("asset-id").value;
        const name = document.getElementById("asset-name").value;
        const category = document.getElementById("asset-category").value;
        const buyDate = document.getElementById("asset-buy-date").value;
        const cost = parseFloat(document.getElementById("asset-cost").value);
        const usefulLife = parseInt(document.getElementById("asset-useful-life").value);

        if (id) {
            // Edit mode
            const index = state.assets.findIndex(a => a.id === id);
            if (index !== -1) {
                state.assets[index] = { id, name, category, buyDate, cost, usefulLife };
            }
        } else {
            // New mode
            const newAsset = {
                id: "ast-" + Date.now(),
                name,
                category,
                buyDate,
                cost,
                usefulLife
            };
            state.assets.push(newAsset);
        }
        
        saveState();
        closeAllModals();
        renderAll();
    });

    // 2. INVENTORY HANDLERS
    document.getElementById("btn-add-inventory").addEventListener("click", () => {
        document.getElementById("form-inventory").reset();
        document.getElementById("inventory-id").value = "";
        document.getElementById("modal-inventory-title").textContent = "Tambah Barang Baru";
        document.getElementById("inv-sku").removeAttribute("readonly");
        openModal("modal-inventory");
    });

    document.getElementById("form-inventory").addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("inventory-id").value;
        const sku = document.getElementById("inv-sku").value;
        const name = document.getElementById("inv-name").value;
        const stock = parseInt(document.getElementById("inv-stock").value);
        const unit = document.getElementById("inv-unit").value;
        const buyPrice = parseFloat(document.getElementById("inv-buy-price").value);
        const sellPrice = parseFloat(document.getElementById("inv-sell-price").value);
        const minStock = parseInt(document.getElementById("inv-min-stock").value);

        if (id) {
            // Edit mode
            const index = state.inventory.findIndex(item => item.id === id);
            if (index !== -1) {
                state.inventory[index] = { id, sku, name, stock, unit, buyPrice, sellPrice, minStock };
            }
        } else {
            // Check SKU uniqueness
            if (state.inventory.some(item => item.sku === sku)) {
                alert("SKU Barang sudah digunakan! Silakan gunakan SKU lain.");
                return;
            }
            const newItem = {
                id: "inv-" + Date.now(),
                sku,
                name,
                stock,
                unit,
                buyPrice,
                sellPrice,
                minStock
            };
            state.inventory.push(newItem);
        }

        saveState();
        closeAllModals();
        renderAll();
    });

    // 3. CASHFLOW HANDLERS
    document.getElementById("btn-add-cashflow").addEventListener("click", () => {
        document.getElementById("form-cashflow").reset();
        openModal("modal-cashflow");
    });

    document.getElementById("form-cashflow").addEventListener("submit", (e) => {
        e.preventDefault();
        const type = document.querySelector('input[name="cash-type"]:checked').value;
        const category = document.getElementById("cash-source").value;
        const description = document.getElementById("cash-description").value;
        const amount = parseFloat(document.getElementById("cash-amount").value);

        // For cash withdrawals (out), verify cash balance
        if (type === "keluar") {
            const currentCash = calculateCashBalance();
            if (amount > currentCash) {
                alert(`Kas Anda tidak mencukupi. Saldo saat ini: ${formatRupiah(currentCash)}. Transaksi dibatalkan.`);
                return;
            }
        }

        const newTx = {
            id: "cf-" + Date.now(),
            timestamp: new Date().toISOString(),
            type,
            source: "Manual",
            category,
            description,
            amount
        };

        state.cashflow.push(newTx);
        saveState();
        closeAllModals();
        renderAll();
    });

    // 4. POS (SALES) EVENT LISTENERS
    document.getElementById("pos-search").addEventListener("input", renderPOSCatalog);
    document.getElementById("btn-clear-cart").addEventListener("click", () => {
        cart = [];
        renderCart();
    });

    document.getElementById("cart-discount").addEventListener("input", calculateCartTotals);
    document.getElementById("cart-pay-amount").addEventListener("input", calculateCartTotals);

    // POS Quick cash keys
    document.querySelectorAll(".btn-quick-cash").forEach(btn => {
        btn.addEventListener("click", () => {
            const value = btn.getAttribute("data-value");
            const totalBill = getCartTotalBill();
            if (value === "pas") {
                document.getElementById("cart-pay-amount").value = totalBill;
            } else {
                document.getElementById("cart-pay-amount").value = parseFloat(value);
            }
            calculateCartTotals();
        });
    });

    // Complete POS Sale
    document.getElementById("btn-complete-sale").addEventListener("click", () => {
        if (cart.length === 0) return;
        
        const subtotal = getCartSubtotal();
        const discountPercent = parseFloat(document.getElementById("cart-discount").value) || 0;
        const total = getCartTotalBill();
        const payAmount = parseFloat(document.getElementById("cart-pay-amount").value) || 0;
        const change = payAmount - total;

        if (payAmount < total) {
            alert("Uang pembayaran kurang!");
            return;
        }

        // Process stock reduction
        cart.forEach(cartItem => {
            const item = state.inventory.find(i => i.id === cartItem.productId);
            if (item) {
                item.stock -= cartItem.qty;
            }
        });

        // Generate items summary
        const summary = cart.map(ci => `${ci.name} (${ci.qty}x)`).join(", ");

        // Append to cashflow
        const cashTx = {
            id: "cf-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "masuk",
            source: "Penjualan",
            category: "POS",
            description: `Penjualan POS: ${summary}`,
            amount: total
        };
        state.cashflow.push(cashTx);

        // Append to sales history
        const saleRecord = {
            id: "sl-" + Date.now(),
            timestamp: new Date().toISOString(),
            items: [...cart],
            subtotal,
            discount: discountPercent,
            total,
            payAmount,
            change
        };
        state.sales.push(saleRecord);

        // Reset Cart and Form
        cart = [];
        document.getElementById("cart-discount").value = "0";
        document.getElementById("cart-pay-amount").value = "";
        
        saveState();
        renderAll();
        alert("Transaksi berhasil diselesaikan!");
    });

    // 5. RESTOCK / PURCHASES EVENT LISTENERS
    const purchaseProductSelect = document.getElementById("purchase-product-select");
    const purchaseQtyInput = document.getElementById("purchase-qty");
    const purchasePriceInput = document.getElementById("purchase-price");

    purchaseProductSelect.addEventListener("change", () => {
        const prodId = purchaseProductSelect.value;
        if (prodId) {
            const prod = state.inventory.find(i => i.id === prodId);
            if (prod) {
                document.getElementById("purchase-unit").value = prod.unit;
                purchasePriceInput.value = prod.buyPrice;
            }
        } else {
            document.getElementById("purchase-unit").value = "";
            purchasePriceInput.value = "";
        }
        calculatePurchasePreview();
    });

    purchaseQtyInput.addEventListener("input", calculatePurchasePreview);
    purchasePriceInput.addEventListener("input", calculatePurchasePreview);

    document.getElementById("form-purchase-stock").addEventListener("submit", (e) => {
        e.preventDefault();
        const prodId = purchaseProductSelect.value;
        const qty = parseInt(purchaseQtyInput.value);
        const buyPrice = parseFloat(purchasePriceInput.value);
        const totalCost = qty * buyPrice;

        if (!prodId) {
            alert("Pilih barang persediaan terlebih dahulu.");
            return;
        }

        // Verify balance
        const currentCash = calculateCashBalance();
        if (totalCost > currentCash) {
            alert(`Saldo kas utama tidak mencukupi untuk melakukan restock stok. Saldo saat ini: ${formatRupiah(currentCash)}. Dibutuhkan: ${formatRupiah(totalCost)}.`);
            return;
        }

        const prod = state.inventory.find(i => i.id === prodId);
        if (prod) {
            // Update stock and cost values
            prod.stock += qty;
            prod.buyPrice = buyPrice; // update default purchase cost to supplier changes

            // Record purchase
            const purchaseRecord = {
                id: "pc-" + Date.now(),
                timestamp: new Date().toISOString(),
                productId: prodId,
                name: prod.name,
                qty,
                price: buyPrice,
                total: totalCost
            };
            state.purchases.push(purchaseRecord);

            // Record into Cash Ledger
            const cashTx = {
                id: "cf-" + Date.now(),
                timestamp: new Date().toISOString(),
                type: "keluar",
                source: "Pembelian",
                category: "Restock",
                description: `Pembelian Stok Supplier: ${prod.name} (${qty} ${prod.unit})`,
                amount: totalCost
            };
            state.cashflow.push(cashTx);

            saveState();
            
            // Reset purchase form
            document.getElementById("form-purchase-stock").reset();
            document.getElementById("purchase-total-preview").textContent = formatRupiah(0);
            
            renderAll();
            alert("Stok berhasil dibeli dan persediaan diperbarui!");
        }
    });

    // 6. FILTERS (CASHFLOW)
    document.getElementById("filter-kas-type").addEventListener("change", renderCashflow);
    document.getElementById("filter-kas-source").addEventListener("change", renderCashflow);

    // Search Assets & Inventory
    document.getElementById("search-asset").addEventListener("input", renderAssets);
    document.getElementById("search-inventory").addEventListener("input", renderInventory);
}

// Modal helper controls
function openModal(modalId) {
    document.getElementById(modalId).classList.add("open");
}

function closeAllModals() {
    document.querySelectorAll(".modal-backdrop").forEach(modal => {
        modal.classList.remove("open");
    });
}

// -------------------------------------------------------------
// CORE CALCULATIONS
// -------------------------------------------------------------

// Calculate current cash balance dynamically from ledger
function calculateCashBalance() {
    let balance = 0;
    state.cashflow.forEach(tx => {
        if (tx.type === "masuk") {
            balance += tx.amount;
        } else {
            balance -= tx.amount;
        }
    });
    return balance;
}

// Calculate dynamic useful life depreciation of an asset
function calculateAssetDepreciation(asset) {
    const buyDate = new Date(asset.buyDate);
    
    // Difference in milliseconds
    const timeDiff = Math.max(0, CURRENT_DATE - buyDate);
    // Convert to fraction of years passed
    const yearsPassed = timeDiff / (1000 * 60 * 60 * 24 * 365.25);
    
    const annualDepreciation = asset.cost / asset.usefulLife;
    const accumulatedDepreciation = Math.min(asset.cost, annualDepreciation * yearsPassed);
    const currentBookValue = Math.max(0, asset.cost - accumulatedDepreciation);
    
    return {
        annualDepreciation: Math.round(annualDepreciation),
        accumulatedDepreciation: Math.round(accumulatedDepreciation),
        currentBookValue: Math.round(currentBookValue)
    };
}

// Get total book value of all assets combined
function calculateTotalAssetValue() {
    let total = 0;
    state.assets.forEach(asset => {
        const depInfo = calculateAssetDepreciation(asset);
        total += depInfo.currentBookValue;
    });
    return total;
}

// Get total purchasing value of current stocks combined
function calculateTotalInventoryValue() {
    let total = 0;
    state.inventory.forEach(item => {
        total += (item.stock * item.buyPrice);
    });
    return total;
}

// Get sales figures for the active month (July 2026 for demo purposes)
function calculateMonthlySales() {
    let total = 0;
    let count = 0;
    state.sales.forEach(sale => {
        const saleDate = new Date(sale.timestamp);
        if (saleDate.getMonth() === CURRENT_DATE.getMonth() && saleDate.getFullYear() === CURRENT_DATE.getFullYear()) {
            total += sale.total;
            count++;
        }
    });
    return { total, count };
}

// Get purchases figures for the active month (July 2026)
function calculateMonthlyPurchases() {
    let total = 0;
    state.purchases.forEach(purchase => {
        const pDate = new Date(purchase.timestamp);
        if (pDate.getMonth() === CURRENT_DATE.getMonth() && pDate.getFullYear() === CURRENT_DATE.getFullYear()) {
            total += purchase.total;
        }
    });
    return total;
}

// Preview total calculation on purchase restock screen
function calculatePurchasePreview() {
    const qty = parseInt(document.getElementById("purchase-qty").value) || 0;
    const price = parseFloat(document.getElementById("purchase-price").value) || 0;
    document.getElementById("purchase-total-preview").textContent = formatRupiah(qty * price);
}

// -------------------------------------------------------------
// RENDERING VIEWS & COMPONENT ELEMENTS
// -------------------------------------------------------------
function renderAll() {
    renderDashboardMetrics();
    renderAssets();
    renderInventory();
    renderCashflow();
    renderPOSCatalog();
    renderCart();
    renderSalesHistory();
    renderPurchasesHistory();
    renderCharts();
}

// 1. DASHBOARD METRICS RENDER
function renderDashboardMetrics() {
    const cashBal = calculateCashBalance();
    const invVal = calculateTotalInventoryValue();
    const assetVal = calculateTotalAssetValue();
    const monthlySales = calculateMonthlySales();

    document.getElementById("dash-cash-balance").textContent = formatRupiah(cashBal);
    document.getElementById("dash-inventory-value").textContent = formatRupiah(invVal);
    document.getElementById("dash-inventory-items").textContent = `${state.inventory.length} Item Terdaftar`;
    document.getElementById("dash-asset-value").textContent = formatRupiah(assetVal);
    document.getElementById("dash-asset-count").textContent = `${state.assets.length} Aset Terdaftar`;
    document.getElementById("dash-sales-value").textContent = formatRupiah(monthlySales.total);
    document.getElementById("dash-sales-count").textContent = `${monthlySales.count} Transaksi`;

    // Render Low Stock Lists on Dashboard
    const lowStockContainer = document.getElementById("dash-low-stock-list");
    const lowStockItems = state.inventory.filter(item => item.stock <= item.minStock);

    if (lowStockItems.length > 0) {
        lowStockContainer.innerHTML = lowStockItems.map(item => `
            <div class="list-item">
                <div class="list-item-meta">
                    <span class="list-item-title">${item.name}</span>
                    <span class="list-item-subtitle">SKU: ${item.sku}</span>
                </div>
                <div class="list-item-badge">
                    <span class="status-indicator status-critical">${item.stock} ${item.unit} tersisa</span>
                    <span class="list-item-subtitle">Batas Min: ${item.minStock}</span>
                </div>
            </div>
        `).join("");
    } else {
        lowStockContainer.innerHTML = `
            <div class="empty-list-placeholder">
                <i class="fa-solid fa-circle-check text-success" style="font-size: 2.2rem; margin-bottom: 12px; opacity: 0.7;"></i>
                <p>Semua persediaan stok mencukupi!</p>
            </div>
        `;
    }

    // Render Recent Cash Flow on Dashboard
    const recentCashContainer = document.getElementById("dash-recent-cash-list");
    // Sort descending by timestamp, take last 4
    const sortedCf = [...state.cashflow].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4);

    if (sortedCf.length > 0) {
        recentCashContainer.innerHTML = sortedCf.map(tx => {
            const txDate = new Date(tx.timestamp).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="list-item">
                    <div class="list-item-meta">
                        <span class="list-item-title">${tx.description}</span>
                        <span class="list-item-subtitle">${tx.category} • ${txDate}</span>
                    </div>
                    <div class="list-item-badge">
                        <span class="list-item-amount ${tx.type}">${tx.type === "masuk" ? "+" : "-"} ${formatRupiah(tx.amount)}</span>
                        <span class="list-item-subtitle">${tx.source}</span>
                    </div>
                </div>
            `;
        }).join("");
    } else {
        recentCashContainer.innerHTML = `
            <div class="empty-list-placeholder">
                <i class="fa-solid fa-receipt" style="font-size: 2.2rem; margin-bottom: 12px; opacity: 0.3;"></i>
                <p>Belum ada catatan aktivitas kas.</p>
            </div>
        `;
    }
}

// 2. ASSETS VIEW RENDER
function renderAssets() {
    const searchVal = document.getElementById("search-asset").value.toLowerCase();
    const tbody = document.getElementById("assets-list");
    tbody.innerHTML = "";

    const filtered = state.assets.filter(a => a.name.toLowerCase().includes(searchVal));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--color-text-muted);">Tidak ada aset ditemukan.</td></tr>`;
        return;
    }

    filtered.forEach(asset => {
        const dep = calculateAssetDepreciation(asset);
        const row = document.createElement("tr");

        const buyDateFormatted = new Date(asset.buyDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        row.innerHTML = `
            <td><strong>${asset.name}</strong></td>
            <td><span class="badge badge-primary">${asset.category}</span></td>
            <td>${buyDateFormatted}</td>
            <td>${formatRupiah(asset.cost)}</td>
            <td>${asset.usefulLife} Tahun</td>
            <td>${formatRupiah(dep.annualDepreciation)}</td>
            <td>${formatRupiah(dep.accumulatedDepreciation)}</td>
            <td class="text-indigo font-bold">${formatRupiah(dep.currentBookValue)}</td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn-action btn-action-edit" onclick="editAsset('${asset.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-action btn-action-delete" onclick="deleteAsset('${asset.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.editAsset = function(id) {
    const asset = state.assets.find(a => a.id === id);
    if (!asset) return;

    document.getElementById("asset-id").value = asset.id;
    document.getElementById("asset-name").value = asset.name;
    document.getElementById("asset-category").value = asset.category;
    document.getElementById("asset-buy-date").value = asset.buyDate;
    document.getElementById("asset-cost").value = asset.cost;
    document.getElementById("asset-useful-life").value = asset.usefulLife;

    document.getElementById("modal-asset-title").textContent = "Edit Aset";
    openModal("modal-asset");
};

window.deleteAsset = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus aset ini dari pencatatan?")) {
        state.assets = state.assets.filter(a => a.id !== id);
        saveState();
        renderAll();
    }
};

// 3. INVENTORY VIEW RENDER
function renderInventory() {
    const searchVal = document.getElementById("search-inventory").value.toLowerCase();
    const tbody = document.getElementById("inventory-list");
    tbody.innerHTML = "";

    const filtered = state.inventory.filter(item => 
        item.name.toLowerCase().includes(searchVal) || 
        item.sku.toLowerCase().includes(searchVal)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--color-text-muted);">Tidak ada barang dalam persediaan.</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const margin = item.sellPrice - item.buyPrice;
        const marginPct = item.buyPrice > 0 ? Math.round((margin / item.buyPrice) * 100) : 0;
        const totalValue = item.stock * item.buyPrice;

        let statusClass = "status-normal";
        let statusText = "Aman";

        if (item.stock === 0) {
            statusClass = "status-critical";
            statusText = "Habis";
        } else if (item.stock <= item.minStock) {
            statusClass = "status-warning";
            statusText = "Menipis";
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><code style="font-family: monospace; font-size: 0.9rem;">${item.sku}</code></td>
            <td><strong>${item.name}</strong></td>
            <td class="font-bold">${item.stock}</td>
            <td>${item.unit}</td>
            <td>${formatRupiah(item.buyPrice)}</td>
            <td>${formatRupiah(item.sellPrice)}</td>
            <td class="text-success">${formatRupiah(margin)} (${marginPct}%)</td>
            <td>${formatRupiah(totalValue)}</td>
            <td><span class="status-indicator ${statusClass}">${statusText}</span></td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn-action btn-action-restock" title="Restock Stok" onclick="redirectToRestock('${item.id}')">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                    <button class="btn-action btn-action-edit" onclick="editInventory('${item.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-action btn-action-delete" onclick="deleteInventory('${item.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.redirectToRestock = function(id) {
    document.getElementById("nav-pembelian").click();
    document.getElementById("purchase-product-select").value = id;
    // trigger selection change event
    const event = new Event('change');
    document.getElementById("purchase-product-select").dispatchEvent(event);
};

window.editInventory = function(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    document.getElementById("inventory-id").value = item.id;
    document.getElementById("inv-sku").value = item.sku;
    document.getElementById("inv-sku").setAttribute("readonly", "true");
    document.getElementById("inv-name").value = item.name;
    document.getElementById("inv-stock").value = item.stock;
    document.getElementById("inv-unit").value = item.unit;
    document.getElementById("inv-buy-price").value = item.buyPrice;
    document.getElementById("inv-sell-price").value = item.sellPrice;
    document.getElementById("inv-min-stock").value = item.minStock;

    document.getElementById("modal-inventory-title").textContent = "Edit Barang";
    openModal("modal-inventory");
};

window.deleteInventory = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus barang ini dari daftar persediaan?")) {
        state.inventory = state.inventory.filter(i => i.id !== id);
        saveState();
        renderAll();
    }
};

// 4. CASHFLOW VIEW RENDER
function renderCashflow() {
    const typeFilter = document.getElementById("filter-kas-type").value;
    const sourceFilter = document.getElementById("filter-kas-source").value;
    const tbody = document.getElementById("cashflow-list");
    tbody.innerHTML = "";

    // Calculate totals for summary bar
    let totalIn = 0;
    let totalOut = 0;
    
    // Sort transactions chronologically (newest first)
    const sorted = [...state.cashflow].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    const filtered = sorted.filter(tx => {
        const matchType = typeFilter === "all" || tx.type === typeFilter;
        const matchSource = sourceFilter === "all" || tx.source === sourceFilter;
        
        // Sum values regardless of active filters to compute dynamic monthly cash summaries
        const txDate = new Date(tx.timestamp);
        if (txDate.getMonth() === CURRENT_DATE.getMonth() && txDate.getFullYear() === CURRENT_DATE.getFullYear()) {
            if (tx.type === "masuk") totalIn += tx.amount;
            else totalOut += tx.amount;
        }
        
        return matchType && matchSource;
    });

    // Update Kas summaries elements
    document.getElementById("kas-total-in").textContent = formatRupiah(totalIn);
    document.getElementById("kas-total-out").textContent = formatRupiah(totalOut);
    document.getElementById("kas-net-flow").textContent = formatRupiah(totalIn - totalOut);
    
    if (totalIn - totalOut >= 0) {
        document.getElementById("kas-net-flow").className = "text-success";
    } else {
        document.getElementById("kas-net-flow").className = "text-danger";
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">Tidak ada transaksi kas terdaftar.</td></tr>`;
        return;
    }

    filtered.forEach(tx => {
        const dateObj = new Date(tx.timestamp);
        const formattedTime = dateObj.toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formattedTime}</td>
            <td><span class="badge ${tx.type === 'masuk' ? 'badge-success' : 'badge-warning'}">${tx.type.toUpperCase()}</span></td>
            <td><strong>${tx.category}</strong> <span class="text-muted">(${tx.source})</span></td>
            <td>${tx.description}</td>
            <td class="font-bold ${tx.type === 'masuk' ? 'text-success' : 'text-danger'}">
                ${tx.type === 'masuk' ? "+" : "-"} ${formatRupiah(tx.amount)}
            </td>
            <td>
                <!-- Protect automatic system transactions from delete -->
                ${tx.source === "Manual" ? `
                    <button class="btn-action btn-action-delete" title="Hapus Catatan" onclick="deleteCashflow('${tx.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                ` : `<span class="text-muted" style="font-size:0.75rem;"><i class="fa-solid fa-lock"></i> Auto</span>`}
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.deleteCashflow = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus catatan kas ini? Tindakan ini akan mempengaruhi saldo kas utama.")) {
        state.cashflow = state.cashflow.filter(tx => tx.id !== id);
        saveState();
        renderAll();
    }
};

// 5. POS (POINT OF SALE) INTERFACES
function renderPOSCatalog() {
    const searchVal = document.getElementById("pos-search").value.toLowerCase();
    const grid = document.getElementById("pos-products-list");
    grid.innerHTML = "";

    state.inventory.forEach(prod => {
        if (prod.name.toLowerCase().includes(searchVal) || prod.sku.toLowerCase().includes(searchVal)) {
            const card = document.createElement("div");
            card.className = "pos-product-card glass-card";
            
            // Check if stock is low or empty
            const isLow = prod.stock <= prod.minStock;
            const stockClass = prod.stock === 0 ? "low-stock" : (isLow ? "text-amber" : "");
            const stockLabel = prod.stock === 0 ? "Habis" : `${prod.stock} ${prod.unit}`;

            card.innerHTML = `
                <div>
                    <span class="pos-prod-sku">${prod.sku}</span>
                    <h4 class="pos-prod-name">${prod.name}</h4>
                </div>
                <div class="pos-product-card-footer">
                    <span class="pos-prod-price">${formatRupiah(prod.sellPrice)}</span>
                    <span class="pos-prod-stock ${stockClass}">${stockLabel}</span>
                </div>
            `;

            // Click listener
            card.addEventListener("click", () => {
                if (prod.stock === 0) {
                    alert("Stok produk ini habis!");
                    return;
                }
                addToCart(prod);
            });

            grid.appendChild(card);
        }
    });
}

function addToCart(product) {
    const cartItem = cart.find(ci => ci.productId === product.id);
    if (cartItem) {
        if (cartItem.qty + 1 > product.stock) {
            alert("Jumlah pesanan melebihi stok yang tersedia!");
            return;
        }
        cartItem.qty++;
        cartItem.total = cartItem.qty * cartItem.price;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            qty: 1,
            price: product.sellPrice,
            total: product.sellPrice
        });
    }
    renderCart();
}

window.adjustCartQty = function(prodId, amount) {
    const cartItem = cart.find(ci => ci.productId === prodId);
    if (!cartItem) return;

    const prod = state.inventory.find(i => i.id === prodId);
    if (!prod) return;

    if (amount > 0 && cartItem.qty + amount > prod.stock) {
        alert("Jumlah pesanan melebihi stok yang tersedia!");
        return;
    }

    cartItem.qty += amount;
    
    if (cartItem.qty <= 0) {
        cart = cart.filter(ci => ci.productId !== prodId);
    } else {
        cartItem.total = cartItem.qty * cartItem.price;
    }

    renderCart();
};

window.removeFromCart = function(prodId) {
    cart = cart.filter(ci => ci.productId !== prodId);
    renderCart();
};

function renderCart() {
    const container = document.getElementById("cart-items-list");
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-cart-shopping" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.3;"></i>
                <p>Keranjang masih kosong.<br>Klik barang di katalog untuk menambahkan.</p>
            </div>
        `;
        document.getElementById("cart-subtotal").textContent = "Rp 0";
        document.getElementById("cart-total").textContent = "Rp 0";
        document.getElementById("cart-change").textContent = "Rp 0";
        document.getElementById("btn-complete-sale").disabled = true;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name" title="${item.name}">${item.name}</div>
                <div class="cart-item-price">${formatRupiah(item.price)}</div>
            </div>
            <div class="cart-item-qty-control">
                <button class="btn-qty" onclick="adjustCartQty('${item.productId}', -1)">-</button>
                <span class="cart-item-qty">${item.qty}</span>
                <button class="btn-qty" onclick="adjustCartQty('${item.productId}', 1)">+</button>
            </div>
            <div class="cart-item-total">${formatRupiah(item.total)}</div>
            <button class="btn-remove-item" onclick="removeFromCart('${item.productId}')">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        </div>
    `).join("");

    calculateCartTotals();
    document.getElementById("btn-complete-sale").disabled = false;
}

function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + item.total, 0);
}

function getCartTotalBill() {
    const subtotal = getCartSubtotal();
    const discountPercent = parseFloat(document.getElementById("cart-discount").value) || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    return Math.round(subtotal - discountAmount);
}

function calculateCartTotals() {
    const subtotal = getCartSubtotal();
    const total = getCartTotalBill();
    const payAmount = parseFloat(document.getElementById("cart-pay-amount").value) || 0;
    const change = Math.max(0, payAmount - total);

    document.getElementById("cart-subtotal").textContent = formatRupiah(subtotal);
    document.getElementById("cart-total").textContent = formatRupiah(total);
    document.getElementById("cart-change").textContent = formatRupiah(change);
}

// 6. POS SALES HISTORY
function renderSalesHistory() {
    const tbody = document.getElementById("sales-history-list");
    tbody.innerHTML = "";

    // Order descending
    const sorted = [...state.sales].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--color-text-muted);">Belum ada riwayat penjualan.</td></tr>`;
        return;
    }

    sorted.forEach(sale => {
        const timeStr = new Date(sale.timestamp).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const itemsStr = sale.items.map(ci => `${ci.name} (${ci.qty}x)`).join("<br>");

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${timeStr}</td>
            <td style="font-size: 0.8rem; line-height: 1.4;">${itemsStr}</td>
            <td>${formatRupiah(sale.subtotal)}</td>
            <td><span class="badge badge-warning">${sale.discount}%</span></td>
            <td class="font-bold text-success">${formatRupiah(sale.total)}</td>
            <td>${formatRupiah(sale.payAmount)}</td>
            <td>${formatRupiah(sale.change)}</td>
            <td>
                <button class="btn-action btn-action-delete" title="Batalkan Transaksi" onclick="voidSale('${sale.id}')">
                    <i class="fa-solid fa-ban"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.voidSale = function(id) {
    if (confirm("Apakah Anda yakin ingin membatalkan transaksi penjualan ini? Stok barang akan dikembalikan, dan kas masuk akan dihapus.")) {
        const sale = state.sales.find(s => s.id === id);
        if (!sale) return;

        // Restore stocks
        sale.items.forEach(ci => {
            const item = state.inventory.find(i => i.id === ci.productId);
            if (item) {
                item.stock += ci.qty;
            }
        });

        // Delete cash transaction linked to it
        // We look for Penjualan POS describing this transaction or match amount/timestamp closely
        // Best matches details: using sales total and delete linked CF. Since POS transaction creates sales and CF at exact same moment, we can trace by transaction matching.
        // We will filter out cash transactions of type POS containing items
        state.cashflow = state.cashflow.filter(cf => {
            const isMatch = cf.source === "Penjualan" && cf.amount === sale.total && (Math.abs(new Date(cf.timestamp) - new Date(sale.timestamp)) < 2000);
            return !isMatch;
        });

        // Filter out of sales lists
        state.sales = state.sales.filter(s => s.id !== id);

        saveState();
        renderAll();
        alert("Transaksi penjualan berhasil dibatalkan.");
    }
};

// 7. STOCK PURCHASES HISTORY & RECOMMENDATIONS
function populatePurchaseProductSelect() {
    const select = document.getElementById("purchase-product-select");
    const currentSelection = select.value;
    select.innerHTML = '<option value="">-- Pilih Barang --</option>';

    state.inventory.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.sku} - ${item.name} (Stok: ${item.stock} ${item.unit})`;
        select.appendChild(option);
    });

    if (currentSelection) {
        select.value = currentSelection;
    }

    // Load recommendations
    const recomList = document.getElementById("restock-recommendation-list");
    const urgentItems = state.inventory.filter(item => item.stock <= item.minStock);

    if (urgentItems.length > 0) {
        recomList.innerHTML = urgentItems.map(item => `
            <div class="needs-purchase-item">
                <div class="needs-purchase-info">
                    <h5>${item.name}</h5>
                    <p>Sisa: <strong>${item.stock} ${item.unit}</strong> (Batas Minimum: ${item.minStock})</p>
                </div>
                <button class="btn btn-primary btn-xs btn-restock-now" onclick="redirectToRestock('${item.id}')">
                    <i class="fa-solid fa-cart-plus"></i> Restok
                </button>
            </div>
        `).join("");
    } else {
        recomList.innerHTML = `
            <div class="empty-list-placeholder" style="padding: 16px 0;">
                <i class="fa-solid fa-circle-check text-success" style="font-size: 1.5rem; margin-bottom: 6px;"></i>
                <p style="font-size:0.8rem;">Stok persediaan aman, tidak ada barang kritis.</p>
            </div>
        `;
    }
}

function renderPurchasesHistory() {
    const tbody = document.getElementById("purchases-history-list");
    tbody.innerHTML = "";

    const sorted = [...state.purchases].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">Belum ada riwayat pembelian stok.</td></tr>`;
        return;
    }

    sorted.forEach(pc => {
        const timeStr = new Date(pc.timestamp).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${timeStr}</td>
            <td><strong>${pc.name}</strong></td>
            <td>${pc.qty}</td>
            <td>${formatRupiah(pc.price)}</td>
            <td class="font-bold text-danger">${formatRupiah(pc.total)}</td>
            <td>
                <button class="btn-action btn-action-delete" title="Batalkan Pembelian" onclick="voidPurchase('${pc.id}')">
                    <i class="fa-solid fa-ban"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.voidPurchase = function(id) {
    if (confirm("Apakah Anda yakin ingin membatalkan transaksi pembelian stok ini? Stok barang akan dikurangi kembali, dan kas keluar akan dihapus.")) {
        const purchase = state.purchases.find(p => p.id === id);
        if (!purchase) return;

        const item = state.inventory.find(i => i.id === purchase.productId);
        if (item) {
            if (item.stock < purchase.qty) {
                alert("Gagal membatalkan. Stok barang saat ini sudah terpakai dan kurang dari jumlah pembelian!");
                return;
            }
            item.stock -= purchase.qty;
        }

        // Delete cash transaction linked to it
        state.cashflow = state.cashflow.filter(cf => {
            const isMatch = cf.source === "Pembelian" && cf.amount === purchase.total && (Math.abs(new Date(cf.timestamp) - new Date(purchase.timestamp)) < 2000);
            return !isMatch;
        });

        // Filter out of purchases lists
        state.purchases = state.purchases.filter(p => p.id !== id);

        saveState();
        renderAll();
        alert("Transaksi pembelian berhasil dibatalkan.");
    }
};

// -------------------------------------------------------------
// ANALYTICS & GRAPH CHARTS (CHART.JS)
// -------------------------------------------------------------
function renderCharts() {
    // Check if view-dashboard is visible
    if (!document.getElementById("view-dashboard").classList.contains("active")) {
        return;
    }

    // 1. CASHFLOW CHART
    // Generate data for past 6 calendar months leading to July 2026
    const months = ["Feb", "Mar", "Apr", "Mei", "Jun", "Jul"];
    const salesData = [0, 0, 0, 0, 5850000, 7200000]; // Seeded from cashflow items
    const purchasesData = [0, 0, 0, 0, 34350000, 2200000]; // Seeded (Jun has Sewa ruko 24jt + blender 2.5jt + modal/salaries etc, July has restock 1.35jt + listrik 850k)

    // Calculate actual totals for June and July dynamically from real state data
    let julSales = 0, julPurchases = 0;
    let junSales = 0, junPurchases = 0;

    state.cashflow.forEach(tx => {
        const date = new Date(tx.timestamp);
        const m = date.getMonth();
        const y = date.getFullYear();

        if (y === 2026) {
            if (m === 6) { // July (0-indexed 6)
                if (tx.type === "masuk") {
                    if (tx.source === "Penjualan") julSales += tx.amount;
                } else {
                    julPurchases += tx.amount; // all outflows
                }
            } else if (m === 5) { // June (0-indexed 5)
                if (tx.type === "masuk") {
                    if (tx.source === "Penjualan") junSales += tx.amount;
                } else {
                    junPurchases += tx.amount;
                }
            }
        }
    });

    salesData[4] = junSales || 5850000; // fallback to default demo seed if empty
    salesData[5] = julSales;
    
    purchasesData[4] = junPurchases || 30500000;
    purchasesData[5] = julPurchases;

    const ctxCashflow = document.getElementById("cashflowChart").getContext("2d");
    if (cashflowChartInstance) {
        cashflowChartInstance.destroy();
    }

    cashflowChartInstance = new Chart(ctxCashflow, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Kas Masuk (Pendapatan)',
                    data: salesData,
                    backgroundColor: 'rgba(16, 185, 129, 0.75)',
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    borderRadius: 4
                },
                {
                    label: 'Kas Keluar (Pengeluaran)',
                    data: purchasesData,
                    backgroundColor: 'rgba(239, 68, 68, 0.75)',
                    borderColor: '#ef4444',
                    borderWidth: 1.5,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#9ca3af', font: { family: 'Inter' } }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) { return formatRupiah(value).replace("Rp", ""); }
                    }
                }
            }
        }
    });

    // 2. DISTRIBUTION PIE CHART
    // Dynamic values of Liquidity (Cash), Stocks (Inventory), and Asset book values
    const currentCashVal = Math.max(0, calculateCashBalance());
    const currentInvVal = calculateTotalInventoryValue();
    const currentAssetVal = calculateTotalAssetValue();

    const ctxDistribution = document.getElementById("distributionChart").getContext("2d");
    if (distributionChartInstance) {
        distributionChartInstance.destroy();
    }

    distributionChartInstance = new Chart(ctxDistribution, {
        type: 'doughnut',
        data: {
            labels: ['Saldo Kas', 'Stok Persediaan', 'Aset Tetap'],
            datasets: [{
                data: [currentCashVal, currentInvVal, currentAssetVal],
                backgroundColor: [
                    '#10b981', // green success
                    '#6366f1', // indigo primary
                    '#818cf8'  // soft indigo/blue
                ],
                borderColor: '#111827',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', padding: 15, font: { family: 'Inter' } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${formatRupiah(context.raw)}`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// -------------------------------------------------------------
// LAPORAN LABA RUGI
// -------------------------------------------------------------

/**
 * Calculate income statement (laba rugi) for a given month and year.
 * month: 1-indexed (1=Jan, 7=Jul, etc.)
 */
function calculateLabaRugi(month, year) {
    const targetMonth = month - 1; // JS 0-indexed
    const targetYear = parseInt(year);

    // ---- PENDAPATAN ----
    // 1a. Pendapatan POS penjualan
    let pendapatanPOS = 0;
    const salesInPeriod = state.sales.filter(s => {
        const d = new Date(s.timestamp);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });
    salesInPeriod.forEach(s => { pendapatanPOS += s.total; });

    // 1b. Pendapatan lainnya: kas masuk manual non-Modal
    let pendapatanLain = 0;
    state.cashflow.forEach(cf => {
        const d = new Date(cf.timestamp);
        if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
            if (cf.type === "masuk" && cf.source === "Manual" && cf.category !== "Modal") {
                pendapatanLain += cf.amount;
            }
        }
    });

    const totalPendapatan = pendapatanPOS + pendapatanLain;

    // ---- HPP (Harga Pokok Penjualan) ----
    // Kalkulasi dari harga beli × qty terjual per item
    let hpp = 0;
    salesInPeriod.forEach(sale => {
        sale.items.forEach(item => {
            const invItem = state.inventory.find(i => i.id === item.productId);
            const buyPrice = invItem ? invItem.buyPrice : 0;
            hpp += buyPrice * item.qty;
        });
    });

    // ---- LABA KOTOR ----
    const labaKotor = totalPendapatan - hpp;

    // ---- BEBAN OPERASIONAL ----
    // Dari kas keluar manual, kategori operasional (bukan restock)
    const operationalCategories = ["Operasional", "Gaji", "Sewa", "Pajak", "Lainnya"];
    let bebanGaji = 0, bebanSewa = 0, bebanOperasional = 0, bebanPajak = 0, bebanLainnya = 0;
    const expenseItems = [];

    state.cashflow.forEach(cf => {
        const d = new Date(cf.timestamp);
        if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
            if (cf.type === "keluar" && cf.source === "Manual") {
                if (operationalCategories.includes(cf.category)) {
                    switch (cf.category) {
                        case "Gaji":        bebanGaji += cf.amount; break;
                        case "Sewa":        bebanSewa += cf.amount; break;
                        case "Operasional": bebanOperasional += cf.amount; break;
                        case "Pajak":       bebanPajak += cf.amount; break;
                        default:            bebanLainnya += cf.amount;
                    }
                    expenseItems.push(cf);
                }
            }
        }
    });

    // ---- DEPRESIASI ASET (per bulan) ----
    let depresiasiPerBulan = 0;
    state.assets.forEach(asset => {
        const annualDep = asset.cost / asset.usefulLife;
        const monthlyDep = annualDep / 12;
        const buyDate = new Date(asset.buyDate);
        const targetDate = new Date(targetYear, targetMonth, 1);
        if (buyDate <= targetDate) {
            depresiasiPerBulan += monthlyDep;
        }
    });
    depresiasiPerBulan = Math.round(depresiasiPerBulan);

    const totalBeban = bebanGaji + bebanSewa + bebanOperasional + bebanPajak + bebanLainnya + depresiasiPerBulan;

    // ---- LABA BERSIH ----
    const labaBersih = labaKotor - totalBeban;

    return {
        pendapatanPOS,
        pendapatanLain,
        totalPendapatan,
        hpp,
        labaKotor,
        bebanGaji,
        bebanSewa,
        bebanOperasional,
        bebanPajak,
        bebanLainnya,
        depresiasiPerBulan,
        totalBeban,
        labaBersih,
        salesInPeriod,
        expenseItems
    };
}

// Month names in Indonesian
const MONTH_NAMES_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function renderLabaRugi() {
    const month = parseInt(document.getElementById("filter-laporan-month").value);
    const year = parseInt(document.getElementById("filter-laporan-year").value);
    const data = calculateLabaRugi(month, year);

    const monthName = MONTH_NAMES_ID[month - 1];
    const periodLabel = `${monthName} ${year}`;

    // -- Ringkasan Kiri --
    document.getElementById("lr-pendapatan-total").textContent = formatRupiah(data.totalPendapatan);
    document.getElementById("lr-penjualan-pos").textContent = formatRupiah(data.pendapatanPOS);
    document.getElementById("lr-pendapatan-lain").textContent = formatRupiah(data.pendapatanLain);

    document.getElementById("lr-hpp-total").textContent = formatRupiah(data.hpp);
    document.getElementById("lr-hpp-barang").textContent = formatRupiah(data.hpp);

    const labaKotorEl = document.getElementById("lr-laba-kotor");
    labaKotorEl.textContent = formatRupiah(data.labaKotor);
    labaKotorEl.className = "lr-amount " + (data.labaKotor >= 0 ? "text-success" : "text-danger");

    document.getElementById("lr-beban-total").textContent = formatRupiah(data.totalBeban);
    document.getElementById("lr-beban-gaji").textContent = formatRupiah(data.bebanGaji);
    document.getElementById("lr-beban-sewa").textContent = formatRupiah(data.bebanSewa);
    document.getElementById("lr-beban-operasional").textContent = formatRupiah(data.bebanOperasional);
    document.getElementById("lr-beban-pajak").textContent = formatRupiah(data.bebanPajak);
    document.getElementById("lr-beban-lainnya").textContent = formatRupiah(data.bebanLainnya);
    document.getElementById("lr-depresiasi").textContent = formatRupiah(data.depresiasiPerBulan);

    // Result card: profit or loss
    const isProfit = data.labaBersih >= 0;
    const resultCard = document.getElementById("lr-result-card");
    resultCard.className = "lr-result-card " + (isProfit ? "profit" : "loss");
    document.getElementById("lr-laba-bersih").textContent = formatRupiah(Math.abs(data.labaBersih));
    const labelEl = resultCard.querySelector(".lr-result-label");
    labelEl.innerHTML = `${isProfit ? "Laba Bersih" : "<span style='color:var(--danger)'>Rugi Bersih</span>"}<small>Periode: ${periodLabel}</small>`;

    // -- Tabel Detail Penjualan --
    const salesTbody = document.getElementById("lr-sales-detail-list");
    if (data.salesInPeriod.length === 0) {
        salesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--color-text-muted);">Tidak ada penjualan di periode ini.</td></tr>`;
    } else {
        salesTbody.innerHTML = data.salesInPeriod.map(sale => {
            const timeStr = new Date(sale.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            const itemsStr = sale.items.map(ci => `${ci.name} (${ci.qty}×)`).join("<br>");
            let saleHPP = 0;
            sale.items.forEach(item => {
                const invItem = state.inventory.find(i => i.id === item.productId);
                saleHPP += (invItem ? invItem.buyPrice : 0) * item.qty;
            });
            const saleLaba = sale.total - saleHPP;
            return `<tr>
                <td style="white-space:nowrap;">${timeStr}</td>
                <td style="font-size:0.78rem; line-height:1.4;">${itemsStr}</td>
                <td class="text-amber">${formatRupiah(saleHPP)}</td>
                <td class="text-success font-bold">${formatRupiah(sale.total)}</td>
                <td class="${saleLaba >= 0 ? 'text-success' : 'text-danger'} font-bold">${formatRupiah(saleLaba)}</td>
            </tr>`;
        }).join("");
    }

    // -- Tabel Detail Beban --
    const expenseTbody = document.getElementById("lr-expense-detail-list");
    if (data.expenseItems.length === 0) {
        expenseTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--color-text-muted);">Tidak ada beban operasional di periode ini.</td></tr>`;
    } else {
        expenseTbody.innerHTML = data.expenseItems.map(cf => {
            const dateStr = new Date(cf.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            return `<tr>
                <td>${dateStr}</td>
                <td><span class="badge badge-warning">${cf.category}</span></td>
                <td>${cf.description}</td>
                <td class="text-danger font-bold">- ${formatRupiah(cf.amount)}</td>
            </tr>`;
        }).join("");
    }
}

// Setup laporan event listener
function setupLaporanListeners() {
    document.getElementById("btn-generate-laporan").addEventListener("click", renderLabaRugi);
}
