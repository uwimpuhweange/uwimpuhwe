// ===== STORAGE KEYS =====
const STORAGE = {
    USERS: 'sims_users',
    CURRENT_USER: 'sims_current_user',
    PRODUCTS_PREFIX: 'sims_products_'
};

// ===== GLOBAL STATE =====
let currentView = 'login'; // 'login', 'register', 'dashboard'
let currentDashboardSection = 'products'; // 'products', 'reports', 'settings'

// ===== HELPER FUNCTIONS =====
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE.USERS)) || [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE.CURRENT_USER));
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE.CURRENT_USER, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(STORAGE.CURRENT_USER);
}

function getUserProducts(userId) {
    if (!userId) return [];
    const key = STORAGE.PRODUCTS_PREFIX + userId;
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveUserProducts(userId, products) {
    const key = STORAGE.PRODUCTS_PREFIX + userId;
    localStorage.setItem(key, JSON.stringify(products));
}

// ===== LOGOUT FUNCTION =====
window.logout = function() {
    clearCurrentUser();
    renderView('login');
    history.pushState({}, '', '/');
};

// ===== RENDER VIEW =====
function renderView(view) {
    const app = document.getElementById('app');
    if (!app) return;

    if (view === 'login') {
        app.innerHTML = renderLogin();
        attachLoginEvents();
        document.body.className = '';
    } else if (view === 'register') {
        app.innerHTML = renderRegister();
        attachRegisterEvents();
        document.body.className = '';
    } else if (view === 'dashboard') {
        const user = getCurrentUser();
        if (!user) {
            renderView('login');
            return;
        }
        app.innerHTML = renderDashboard(user);
        attachDashboardEvents(user);
        document.body.className = 'dashboard-active';
    }
}

// ===== LOGIN PAGE =====
function renderLogin() {
    return `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo">
                    <i class="fas fa-cubes"></i>
                    <h2>SIMS</h2>
                </div>
                <p>Stock Inventory Management System</p>
            </div>
            <form id="loginForm">
                <div class="input-field">
                    <label>Email Address</label>
                    <div class="input-wrapper">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="loginEmail" placeholder="john@example.com" required>
                    </div>
                </div>
                <div class="input-field">
                    <label>Password</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="loginPassword" placeholder="••••••••" required>
                    </div>
                </div>
                <div id="loginError" class="validation-area"></div>
                <button type="submit" class="btn">Sign In</button>
            </form>
            <div class="auth-footer">
                Don't have an account? <a href="#" id="gotoRegister">Create account</a>
            </div>
        </div>
    </div>`;
}

function attachLoginEvents() {
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            errorDiv.innerText = 'Invalid email or password.';
            return;
        }

        setCurrentUser(user);
        renderView('dashboard');
        history.pushState({}, '', '/dashboard');
    });

    document.getElementById('gotoRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        renderView('register');
        history.pushState({}, '', '/register');
    });
}

// ===== REGISTER PAGE =====
function renderRegister() {
    return `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo">
                    <i class="fas fa-cubes"></i>
                    <h2>SIMS</h2>
                </div>
                <p>Create new account</p>
            </div>
            <form id="registerForm">
                <div class="input-field">
                    <label>Full Name</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user"></i>
                        <input type="text" id="fullname" placeholder="John Doe" required>
                    </div>
                </div>
                <div class="input-field">
                    <label>Email Address</label>
                    <div class="input-wrapper">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="email" placeholder="john@example.com" required>
                    </div>
                </div>
                <div class="input-field">
                    <label>Password (min 8 chars, upper, lower, number)</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="password" placeholder="••••••••" required>
                    </div>
                </div>
                <div class="input-field">
                    <label>Confirm Password</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="confirmPassword" placeholder="••••••••" required>
                    </div>
                </div>
                <div id="registerError" class="validation-area"></div>
                <button type="submit" class="btn">Register Account</button>
            </form>
            <div class="auth-footer">
                Already have an account? <a href="#" id="gotoLogin">Sign in</a>
            </div>
        </div>
    </div>`;
}

function attachRegisterEvents() {
    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('registerError');

    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirmPassword').value;

        // Validation
        if (!fullname || !email || !password || !confirm) {
            errorDiv.innerText = 'All fields are required.';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorDiv.innerText = 'Please enter a valid email address.';
            return;
        }

        if (password.length < 8) {
            errorDiv.innerText = 'Password must be at least 8 characters long.';
            return;
        }

        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            errorDiv.innerText = 'Password must include uppercase, lowercase, and a number.';
            return;
        }

        if (password !== confirm) {
            errorDiv.innerText = 'Passwords do not match.';
            return;
        }

        const users = getUsers();
        if (users.find(u => u.email === email)) {
            errorDiv.innerText = 'Email address is already registered.';
            return;
        }

        const newUser = {
            id: Date.now(),
            fullname,
            email,
            password
        };

        users.push(newUser);
        saveUsers(users);
        
        alert('Registration successful! Please log in.');
        renderView('login');
        history.pushState({}, '', '/');
    });

    document.getElementById('gotoLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        renderView('login');
        history.pushState({}, '', '/');
    });
}

// ===== DASHBOARD PAGE =====
function renderDashboard(user) {
    const products = getUserProducts(user.id);
    const stats = {
        total: products.length,
        inStock: products.filter(p => p.quantity > 0).length,
        outStock: products.filter(p => p.quantity === 0).length,
        totalQty: products.reduce((acc, p) => acc + p.quantity, 0)
    };

    return `
    <div class="dashboard-grid">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="sidebar-logo">
                <i class="fas fa-cubes"></i>
                <h2>SIMS <span>inventory</span></h2>
            </div>
            
            <nav class="nav-list" id="sidebarNav">
                <div class="nav-item ${currentDashboardSection === 'products' ? 'active' : ''}" data-section="products">
                    <i class="fas fa-chart-pie"></i>
                    <span>Dashboard</span>
                </div>
                <div class="nav-item ${currentDashboardSection === 'reports' ? 'active' : ''}" data-section="reports">
                    <i class="fas fa-chart-bar"></i>
                    <span>Reports</span>
                </div>
                <div class="nav-item ${currentDashboardSection === 'settings' ? 'active' : ''}" data-section="settings">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </div>
                <div class="nav-item inactive">
                    <i class="fas fa-cloud"></i>
                    <span>Integrations (soon)</span>
                </div>
            </nav>

            <div class="sidebar-user">
                <div class="user-badge">${user.fullname.charAt(0).toUpperCase()}</div>
                <div class="user-info-side">
                    <div class="name">${user.fullname}</div>
                    <div class="email">${user.email}</div>
                </div>
                <button class="logout-icon" id="logoutBtnSidebar">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </aside>

        <!-- Main Content Panel -->
        <main class="main-panel" id="mainPanel">
            ${renderMainContent(user, products, stats)}
        </main>
    </div>

    <!-- Product Modal (hidden by default) -->
    <div id="productModal" class="modal-overlay hidden">
        <div class="modal-card">
            <h2 id="modalTitle">Add Product</h2>
            <form id="productForm">
                <input type="hidden" id="productId">
                
                <div class="input-field">
                    <label>Product Name</label>
                    <div class="input-wrapper">
                        <i class="fas fa-tag"></i>
                        <input type="text" id="prodName" placeholder="e.g., Laptop" required>
                    </div>
                </div>

                <div class="input-field">
                    <label>Category</label>
                    <div class="input-wrapper">
                        <i class="fas fa-folder"></i>
                        <input type="text" id="prodCategory" placeholder="e.g., Electronics" required>
                    </div>
                </div>

                <div class="input-field">
                    <label>Quantity</label>
                    <div class="input-wrapper">
                        <i class="fas fa-sort-numeric-up"></i>
                        <input type="number" id="prodQuantity" min="0" value="1" required>
                    </div>
                </div>

                <div class="input-field">
                    <label>Price (RWF)</label>
                    <div class="input-wrapper">
                        <i class="fas fa-dollar-sign"></i>
                        <input type="number" id="prodPrice" min="0" step="0.1" required>
                    </div>
                </div>

                <div id="modalError" class="validation-area"></div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" id="closeModalBtn">Cancel</button>
                    <button type="submit" class="btn">Save Product</button>
                </div>
            </form>
        </div>
    </div>`;
}

function renderMainContent(user, products, stats) {
    if (currentDashboardSection === 'products') {
        return `
        <div class="top-bar">
            <div class="welcome-block">
                <h1>Products</h1>
                <div class="sub">Manage your inventory</div>
            </div>
            <div class="action-buttons">
                <button class="btn-primary" id="addProductBtn">
                    <i class="fas fa-plus"></i> Add Product
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="cards-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-boxes"></i></div>
                <div class="stat-content">
                    <h3>${stats.total}</h3>
                    <p>Total Products</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-content">
                    <h3>${stats.inStock}</h3>
                    <p>In Stock</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="stat-content">
                    <h3>${stats.outStock}</h3>
                    <p>Out of Stock</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-cubes"></i></div>
                <div class="stat-content">
                    <h3>${stats.totalQty}</h3>
                    <p>Total Units</p>
                </div>
            </div>
        </div>

        <!-- Products Table -->
        <div class="section-card">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="productTableBody">
                        ${renderProductRows(products)}
                    </tbody>
                </table>
                ${products.length === 0 ? `
                <div class="empty-state">
                    <i class="fas fa-box-open fa-3x"></i>
                    <p>No products yet. Click "Add Product" to get started.</p>
                </div>` : ''}
            </div>
        </div>`;
    } 
    else if (currentDashboardSection === 'reports') {
        return `
        <div class="top-bar">
            <div class="welcome-block">
                <h1>Reports</h1>
                <div class="sub">Analytics & insights</div>
            </div>
        </div>
        <div class="placeholder-panel">
            <i class="fas fa-chart-line fa-4x" style="opacity:0.5;"></i>
            <p>Stock reports and analytics coming soon.</p>
        </div>`;
    } 
    else if (currentDashboardSection === 'settings') {
        return `
        <div class="top-bar">
            <div class="welcome-block">
                <h1>Settings</h1>
                <div class="sub">Preferences & configuration</div>
            </div>
        </div>
        <div class="placeholder-panel">
            <i class="fas fa-sliders-h fa-4x" style="opacity:0.5;"></i>
            <p>User settings and profile management (UI preview).</p>
        </div>`;
    }
}

function renderProductRows(products) {
    if (!products.length) return '';
    
    return products.map(p => `
        <tr>
            <td>#${p.id.toString().slice(-8)}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.quantity}</td>
            <td>${Number(p.price).toLocaleString()} RWF</td>
            <td>
                <span class="status-badge ${p.quantity > 0 ? 'in-stock' : 'out-stock'}">
                    ${p.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td class="action-icons">
                <button class="edit-btn" data-id="${p.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${p.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function attachDashboardEvents(user) {
    // Logout button
    document.getElementById('logoutBtnSidebar')?.addEventListener('click', logout);

    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) {
                currentDashboardSection = section;
                renderView('dashboard');
            }
        });
    });

    // Product management (only in products section)
    if (currentDashboardSection === 'products') {
        const addBtn = document.getElementById('addProductBtn');
        const modal = document.getElementById('productModal');
        const closeBtn = document.getElementById('closeModalBtn');
        const form = document.getElementById('productForm');
        const modalTitle = document.getElementById('modalTitle');
        const prodId = document.getElementById('productId');
        const prodName = document.getElementById('prodName');
        const prodCat = document.getElementById('prodCategory');
        const prodQty = document.getElementById('prodQuantity');
        const prodPrice = document.getElementById('prodPrice');
        const modalError = document.getElementById('modalError');

        let products = getUserProducts(user.id);

        function refreshDashboard() {
            renderView('dashboard');
        }

        function saveAndRefresh(updatedProducts) {
            saveUserProducts(user.id, updatedProducts);
            refreshDashboard();
        }

        // Open modal for adding
        addBtn?.addEventListener('click', () => {
            modalTitle.innerText = 'Add Product';
            prodId.value = '';
            prodName.value = '';
            prodCat.value = '';
            prodQty.value = '1';
            prodPrice.value = '';
            modalError.innerText = '';
            modal.classList.remove('hidden');
        });

        // Close modal
        function closeModal() {
            modal.classList.add('hidden');
        }

        closeBtn?.addEventListener('click', closeModal);
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Edit/Delete delegation
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const product = products.find(p => p.id == id);
                
                if (product) {
                    modalTitle.innerText = 'Edit Product';
                    prodId.value = product.id;
                    prodName.value = product.name;
                    prodCat.value = product.category;
                    prodQty.value = product.quantity;
                    prodPrice.value = product.price;
                    modal.classList.remove('hidden');
                }
            }

            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    products = products.filter(p => p.id != id);
                    saveAndRefresh(products);
                }
            }
        });

        // Form submit
        form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = prodName.value.trim();
            const category = prodCat.value.trim();
            const quantity = parseInt(prodQty.value);
            const price = parseFloat(prodPrice.value);

            // Validation
            if (!name || !category) {
                modalError.innerText = 'All fields are required.';
                return;
            }

            if (isNaN(quantity) || quantity < 0) {
                modalError.innerText = 'Quantity must be a positive number.';
                return;
            }

            if (isNaN(price) || price < 0) {
                modalError.innerText = 'Price must be a positive number.';
                return;
            }

            const id = prodId.value ? Number(prodId.value) : Date.now();
            const newProduct = { id, name, category, quantity, price };

            if (!prodId.value) {
                products.push(newProduct);
            } else {
                products = products.map(p => p.id == id ? newProduct : p);
            }

            saveAndRefresh(products);
            closeModal();
        });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
        currentView = 'dashboard';
    }
    
    renderView(currentView);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const user = getCurrentUser();
    if (user) {
       