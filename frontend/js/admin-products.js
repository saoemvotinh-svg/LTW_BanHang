// admin-products.js — Quản lý sản phẩm, kết nối API thật

import {
    ADMIN_PRODUCTS_LIST_URL as PRODUCTS_LIST_URL,
    ADMIN_PRODUCTS_CREATE_URL as PRODUCTS_CREATE_URL,
    ADMIN_PRODUCTS_UPDATE_URL as PRODUCTS_UPDATE_URL,
    ADMIN_PRODUCTS_DELETE_URL as PRODUCTS_DELETE_URL,
    ADMIN_CATEGORIES_LIST_URL as CATEGORIES_LIST_URL,
    ADMIN_PRODUCTS_DETAIL_URL,
    ADMIN_PRODUCTS_DELETE_IMAGE_URL,
    ADMIN_PRODUCTS_SET_PRIMARY_URL,
    getImageUrl
} from "./configs.js";

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

let newImageFiles = []; // Lưu trữ các file ảnh mới chuẩn bị upload
let currentProductImages = []; // Danh sách ảnh lấy từ DB

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
        // Dùng getImageUrl() — không hard-code localhost trong component
        const imgSrc     = getImageUrl(product.image);

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

window.changePage = function(page) {
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
    newImageFiles = [];
    currentProductImages = [];

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

    // Switch to info tab
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length > 0) tabs[0].click();

    if (productId) {
        document.querySelector('.offcanvas-header h2').textContent = 'Chỉnh sửa sản phẩm';

        try {
            const res = await fetch(`${ADMIN_PRODUCTS_DETAIL_URL}?id=${productId}`, {
                credentials: 'include',
                headers: authHeaders()
            });
            const result = await res.json();
            if (result.success) {
                const product = result.data;
                document.getElementById('p-name').value  = product.name;
                document.getElementById('p-price').value = parseInt(product.price);
                document.getElementById('p-stock').value = product.stock;
                document.getElementById('p-desc').value  = product.description || '';
                document.getElementById('p-category').value = product.category_id;
                
                currentProductImages = product.images || [];
            }
        } catch (e) {
            console.error('Lỗi lấy chi tiết SP', e);
        }
    } else {
        document.querySelector('.offcanvas-header h2').textContent = 'Thêm sản phẩm mới';
    }

    renderImages();

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
// QUẢN LÝ HÌNH ẢNH (Render & APIs)
// ============================================================
function renderImages() {
    const primaryContainer = document.getElementById('primary-image-container');
    const galleryContainer = document.getElementById('gallery-images-container');
    const countSpan = document.getElementById('images-count');
    const galleryCount = document.getElementById('gallery-count');
    
    if (!primaryContainer || !galleryContainer) return;

    let totalImages = currentProductImages.length + newImageFiles.length;
    if (countSpan) countSpan.textContent = totalImages;
    if (galleryCount) galleryCount.textContent = `(${totalImages})`;

    let primaryHtml = '<div class="empty-state">Chưa có ảnh chính</div>';
    let galleryHtml = '';

    const newPrimaryImage = newImageFiles.find(f => f.is_primary);

    currentProductImages.forEach(img => {
        if (img.is_primary && !newPrimaryImage) {
            // Dùng getImageUrl() — không hard-code localhost
            primaryHtml = `<img src="${getImageUrl(img.image_url)}" alt="Primary Image">`;
        } else {
            galleryHtml += `
                <div class="gallery-item">
                    <img src="${getImageUrl(img.image_url)}" alt="Gallery Image">
                    <div class="item-actions">
                        <button type="button" class="btn-action" onclick="setPrimaryImage(${img.id})">Đặt làm chính</button>
                        <button type="button" class="btn-action delete" onclick="deleteImage(${img.id})">Xóa</button>
                    </div>
                </div>
            `;
        }
    });

    newImageFiles.forEach((fileObj, index) => {
        if (fileObj.is_primary) {
            primaryHtml = `
                <img src="${fileObj.preview}" alt="Primary Image (Mới)">
                <div style="margin-top: 10px; text-align: center;">
                    <button type="button" class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; border-color: #dc2626; color: #dc2626;" onclick="removeNewImage(${index})">Hủy ảnh này</button>
                </div>
            `;
        } else {
            galleryHtml += `
                <div class="gallery-item">
                    <img src="${fileObj.preview}" alt="New Image">
                    <div class="item-actions">
                        <button type="button" class="btn-action" onclick="setNewImagePrimary(${index})">Đặt làm chính</button>
                        <button type="button" class="btn-action delete" onclick="removeNewImage(${index})">Hủy</button>
                    </div>
                </div>
            `;
        }
    });

    primaryContainer.innerHTML = primaryHtml;
    galleryContainer.innerHTML = galleryHtml;
}

window.setNewImagePrimary = function(index) {
    newImageFiles.forEach((img, i) => img.is_primary = (i === index));
    renderImages();
};

window.removeNewImage = function(index) {
    const removed = newImageFiles.splice(index, 1)[0];
    if (removed && removed.is_primary) {
        if (newImageFiles.length > 0) {
            newImageFiles[0].is_primary = true;
        }
    }
    renderImages();
};

window.deleteImage = async function(imageId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
    try {
        const res = await fetch(ADMIN_PRODUCTS_DELETE_IMAGE_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: imageId })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Xóa ảnh thành công', 'success');
            if (editingProductId) {
                const detailRes = await fetch(`${ADMIN_PRODUCTS_DETAIL_URL}?id=${editingProductId}`, { headers: authHeaders() });
                const detailData = await detailRes.json();
                if (detailData.success) {
                    currentProductImages = detailData.data.images || [];
                    renderImages();
                }
            }
        } else {
            showToast(result.message, 'error');
        }
    } catch (e) {
        showToast('Lỗi server', 'error');
    }
};

window.setPrimaryImage = async function(imageId) {
    if (!editingProductId) return;
    try {
        const res = await fetch(ADMIN_PRODUCTS_SET_PRIMARY_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: editingProductId, image_id: imageId })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Đã đổi ảnh chính', 'success');
            // Hủy set ảnh chính ở các ảnh mới thêm vì DB đã lấy ảnh khác
            newImageFiles.forEach(img => img.is_primary = false);
            
            const detailRes = await fetch(`${ADMIN_PRODUCTS_DETAIL_URL}?id=${editingProductId}`, { headers: authHeaders() });
            const detailData = await detailRes.json();
            if (detailData.success) {
                currentProductImages = detailData.data.images || [];
                renderImages();
            }
        } else {
            showToast(result.message, 'error');
        }
    } catch (e) {
        showToast('Lỗi server', 'error');
    }
};

// ============================================================
// SUBMIT FORM — Thêm hoặc Sửa
// ============================================================
async function saveProduct() {
    const name        = document.getElementById('p-name').value.trim();
    const category_id = document.getElementById('p-category').value;
    const price       = document.getElementById('p-price').value.trim();
    const stock       = document.getElementById('p-stock').value.trim();
    const desc        = document.getElementById('p-desc').value.trim();

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

    if (editingProductId) {
        formData.append('id', editingProductId);
    }
    
    let primaryNewImageIndex = -1;
    newImageFiles.forEach((f, i) => {
        formData.append(editingProductId ? 'new_images[]' : 'images[]', f.file);
        if (f.is_primary) {
            primaryNewImageIndex = i;
        }
    });
    formData.append('primary_image_index', primaryNewImageIndex);

    const url     = editingProductId ? PRODUCTS_UPDATE_URL : PRODUCTS_CREATE_URL;
    const saveBtn = document.getElementById('btn-save-product');

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
            position:fixed; top:24px; right:24px; z-index:9999;
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
    const uploadInput = document.getElementById('p-images-upload');
    const btnAddImages = document.getElementById('btn-add-images');

    if (btnAddImages && uploadInput) {
        btnAddImages.addEventListener('click', () => uploadInput.click());
        
        uploadInput.addEventListener('change', async function() {
            const files = Array.from(this.files);
            
            for (const file of files) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast(`File ${file.name} quá lớn (tối đa 2MB)`, 'error');
                    continue;
                }
                
                await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        const hasPrimary = currentProductImages.some(i => i.is_primary) || newImageFiles.some(i => i.is_primary);
                        newImageFiles.push({
                            file: file,
                            preview: e.target.result,
                            is_primary: !hasPrimary
                        });
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
            
            renderImages();
            this.value = '';
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
