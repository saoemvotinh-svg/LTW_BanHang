// admin-products.js — Quản lý sản phẩm, kết nối API thật

const BASE_URL = "http://localhost:8080/";
const PRODUCTS_LIST_URL   = BASE_URL + "api/admin/products/list.php";
const PRODUCTS_CREATE_URL = BASE_URL + "api/admin/products/create.php";
const PRODUCTS_UPDATE_URL = BASE_URL + "api/admin/products/update.php";
const PRODUCTS_DELETE_URL = BASE_URL + "api/admin/products/delete.php";
const CATEGORIES_LIST_URL = BASE_URL + "api/admin/categories/list.php";

function getAuthToken() {
    return localStorage.getItem('auth_token') || '';
}

function authHeaders() {
    return { 'Authorization': 'Bearer ' + getAuthToken() };
}

function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN');
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// ============================================================
// STATE
// ============================================================
let currentPage  = 1;
let totalPages   = 1;
let currentLimit = 15;
let categories   = [];
let editingProductId = null; // null = thêm mới, số = đang sửa

let searchTimeout = null;

// ============================================================
// LOAD PRODUCTS
// ============================================================
async function loadProducts() {
    const tbody     = document.getElementById('products-tbody');
    const searchVal = document.getElementById('search-input')?.value.trim() || '';
    const catVal    = document.getElementById('category-filter')?.value || '';
    const stockVal  = document.getElementById('stock-filter')?.value   || '';

    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#6b7280">Đang tải...</td></tr>';
    }

    const params = new URLSearchParams({
        page:   currentPage,
        limit:  currentLimit,
        search: searchVal,
        category_id: catVal,
        stock:  stockVal,
    });

    try {
        const response = await fetch(PRODUCTS_LIST_URL + '?' + params, {
            credentials: 'include',
            headers: authHeaders()
        });

        const result = await response.json();

        if (!result.success) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:20px;color:#dc2626">${result.message}</td></tr>`;
            }
            return;
        }

        // Cập nhật categories cho filter
        if (result.categories && result.categories.length > 0) {
            categories = result.categories;
            fillCategoryFilter(categories);
            fillCategorySelect(categories);
        }

        totalPages = result.pagination.total_pages;
        renderTable(result.data);
        renderPagination(result.pagination);

    } catch (err) {
        console.error('Lỗi load sản phẩm:', err);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#dc2626">Không thể kết nối server</td></tr>';
        }
    }
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable(products) {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:#6b7280">Không có sản phẩm nào</td></tr>';
        return;
    }

    let html = '';
    products.forEach(product => {
        const stockClass = product.stock > 0 ? 'badge-success' : 'badge-danger';
        const stockText  = product.stock > 0 ? `${product.stock}` : '0';
        const imgSrc     = product.image || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=SP';

        html += `
            <tr>
                <td>${product.id}</td>
                <td><img src="${imgSrc}" class="product-img" alt="${product.name}" onerror="this.src='https://placehold.co/60x60/e2e8f0/94a3b8?text=SP'"></td>
                <td>
                    <div class="product-name-col">
                        <strong>${product.name}</strong>
                    </div>
                </td>
                <td>${product.category_name || '—'}</td>
                <td>${formatCurrency(product.price)}</td>
                <td><span class="${stockClass}">${stockText}</span></td>
                <td>${product.total_sold || 0}</td>
                <td>${formatDate(product.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon edit" onclick="openOffcanvas(${product.id})" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}')" title="Xóa">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ============================================================
// FILL DROPDOWNS
// ============================================================
function fillCategoryFilter(cats) {
    const select = document.getElementById('category-filter');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">Tất cả danh mục</option>';
    cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        select.appendChild(opt);
    });
    select.value = currentVal;
}

function fillCategorySelect(cats) {
    const select = document.getElementById('p-category');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
    cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        select.appendChild(opt);
    });
    if (currentVal) select.value = currentVal;
}

// ============================================================
// PAGINATION
// ============================================================
function renderPagination(pagination) {
    const controls = document.querySelector('.pagination-controls');
    if (!controls) return;

    const { current_page, total_pages, total_records } = pagination;

    let html = `<button class="btn-page" ${current_page <= 1 ? 'disabled' : ''} onclick="changePage(${current_page - 1})">
        <i class="fa-solid fa-chevron-left"></i>
    </button>`;

    // Hiển thị tối đa 5 trang
    let startPage = Math.max(1, current_page - 2);
    let endPage   = Math.min(total_pages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="btn-page ${i === current_page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button class="btn-page" ${current_page >= total_pages ? 'disabled' : ''} onclick="changePage(${current_page + 1})">
        <i class="fa-solid fa-chevron-right"></i>
    </button>`;

    controls.innerHTML = html;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadProducts();
}

// ============================================================
// OFFCANVAS — Thêm / Sửa sản phẩm
// ============================================================
const overlay   = document.getElementById('offcanvas-overlay');
const offcanvas = document.getElementById('product-offcanvas');

window.openOffcanvas = async function(productId = null) {
    editingProductId = productId;

    // Đảm bảo categories đã load
    if (categories.length === 0) {
        await loadCategories();
    }

    // Reset form
    document.getElementById('p-name').value        = '';
    document.getElementById('p-price').value       = '';
    document.getElementById('p-stock').value       = '';
    document.getElementById('p-desc').value        = '';
    document.getElementById('p-category').value    = '';
    document.getElementById('p-image').value       = '';
    document.getElementById('preview-image').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'flex';

    if (productId) {
        // Sửa: tìm trong table data hoặc gọi API
        document.querySelector('.offcanvas-header h2').textContent = 'Chỉnh sửa sản phẩm';

        // Lấy thông tin từ row trong bảng (nhanh hơn gọi API)
        const rows = document.querySelectorAll('#products-tbody tr');
        let found  = false;
        rows.forEach(row => {
            const editBtn = row.querySelector('.btn-icon.edit');
            if (editBtn && editBtn.getAttribute('onclick').includes(`(${productId})`)) {
                const cells = row.querySelectorAll('td');
                document.getElementById('p-name').value  = cells[2].querySelector('strong').textContent;
                document.getElementById('p-price').value = cells[4].textContent.replace(/\./g, '');
                document.getElementById('p-stock').value = cells[5].textContent.replace(/[^0-9]/g, '');

                // Tìm category_id theo tên
                const catName = cells[3].textContent;
                const cat = categories.find(c => c.name === catName);
                if (cat) document.getElementById('p-category').value = cat.id;

                // Ảnh
                const img = cells[1].querySelector('img');
                if (img && !img.src.includes('placehold.co')) {
                    document.getElementById('preview-image').src = img.src;
                    document.getElementById('preview-image').style.display = 'block';
                    document.getElementById('upload-placeholder').style.display = 'none';
                }

                found = true;
            }
        });

    } else {
        document.querySelector('.offcanvas-header h2').textContent = 'Thêm sản phẩm mới';
    }

    overlay.classList.add('active');
    offcanvas.classList.add('active');
};

function closeOffcanvas() {
    overlay.classList.remove('active');
    offcanvas.classList.remove('active');
    editingProductId = null;
}

async function loadCategories() {
    try {
        const res = await fetch(CATEGORIES_LIST_URL, {
            credentials: 'include',
            headers: authHeaders()
        });
        const result = await res.json();
        if (result.success) {
            categories = result.data;
            fillCategoryFilter(categories);
            fillCategorySelect(categories);
        }
    } catch (err) {
        console.error('Lỗi load categories:', err);
    }
}

// ============================================================
// SUBMIT FORM — Thêm hoặc Sửa
// ============================================================
async function saveProduct() {
    const name        = document.getElementById('p-name').value.trim();
    const category_id = document.getElementById('p-category').value;
    const price       = document.getElementById('p-price').value.trim();
    const stock       = document.getElementById('p-stock').value.trim();
    const desc        = document.getElementById('p-desc').value.trim();
    const imageFile   = document.getElementById('p-image').files[0];

    if (!name || !category_id || !price || !stock) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('name',        name);
    formData.append('category_id', category_id);
    formData.append('price',       price);
    formData.append('stock',       stock);
    formData.append('description', desc);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const url     = editingProductId ? PRODUCTS_UPDATE_URL : PRODUCTS_CREATE_URL;
    const saveBtn = document.getElementById('btn-save-product');

    if (editingProductId) {
        formData.append('id', editingProductId);
    }

    if (saveBtn) {
        saveBtn.disabled     = true;
        saveBtn.textContent  = 'Đang lưu...';
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: authHeaders(),
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            closeOffcanvas();
            loadProducts();
        } else {
            showToast(result.message, 'error');
        }

    } catch (err) {
        console.error('Lỗi lưu sản phẩm:', err);
        showToast('Không thể kết nối server', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled    = false;
            saveBtn.textContent = 'Lưu';
        }
    }
}

// ============================================================
// DELETE
// ============================================================
window.deleteProduct = async function(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;

    try {
        const response = await fetch(PRODUCTS_DELETE_URL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            loadProducts();
        } else {
            showToast(result.message, 'error');
        }

    } catch (err) {
        console.error('Lỗi xóa sản phẩm:', err);
        showToast('Không thể kết nối server', 'error');
    }
};

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, type = 'success') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.style.cssText = `
            position:fixed; bottom:24px; right:24px; z-index:9999;
            padding:12px 20px; border-radius:8px; color:#fff;
            font-size:14px; font-weight:500; box-shadow:0 4px 12px rgba(0,0,0,0.15);
            transition:opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }

    toast.style.background = type === 'success' ? '#16a34a' : '#dc2626';
    toast.textContent      = message;
    toast.style.opacity    = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ============================================================
// IMAGE PREVIEW
// ============================================================
function setupImagePreview() {
    const input   = document.getElementById('p-image');
    const preview = document.getElementById('preview-image');
    const placeholder = document.getElementById('upload-placeholder');
    const btnUpload   = document.querySelector('.btn-upload');

    if (btnUpload) {
        btnUpload.addEventListener('click', () => input && input.click());
    }

    if (input) {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                if (preview) {
                    preview.src           = e.target.result;
                    preview.style.display = 'block';
                }
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

// ============================================================
// KHỞI TẠO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // Load dữ liệu
    loadProducts();

    // Offcanvas buttons
    const btnAdd    = document.getElementById('btnAddProduct');
    const btnClose  = document.getElementById('btnCloseOffcanvas');
    const btnCancel = document.getElementById('btnCancelOffcanvas');
    const btnSave   = document.getElementById('btn-save-product');

    if (btnAdd)    btnAdd.addEventListener('click', () => openOffcanvas());
    if (btnClose)  btnClose.addEventListener('click', closeOffcanvas);
    if (btnCancel) btnCancel.addEventListener('click', closeOffcanvas);
    if (overlay)   overlay.addEventListener('click', closeOffcanvas);
    if (btnSave)   btnSave.addEventListener('click', saveProduct);

    // Search với debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadProducts();
            }, 400);
        });
    }

    // Filters
    const categoryFilter = document.getElementById('category-filter');
    const stockFilter    = document.getElementById('stock-filter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => { currentPage = 1; loadProducts(); });
    }

    if (stockFilter) {
        stockFilter.addEventListener('change', () => { currentPage = 1; loadProducts(); });
    }

    // Tabs
    const tabs       = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            if (tabContents[index]) {
                tabContents[index].classList.add('active');
            } else {
                tabContents[0].classList.add('active');
            }
        });
    });

    // Image preview
    setupImagePreview();
});
