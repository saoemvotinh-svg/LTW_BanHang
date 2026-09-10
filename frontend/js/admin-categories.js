// admin-categories.js — Quản lý danh mục, kết nối API thật

import { ADMIN_CATEGORIES_LIST_URL as CATEGORIES_LIST_URL, ADMIN_CATEGORIES_CREATE_URL as CATEGORIES_CREATE_URL, ADMIN_CATEGORIES_UPDATE_URL as CATEGORIES_UPDATE_URL, ADMIN_CATEGORIES_DELETE_URL as CATEGORIES_DELETE_URL } from "./configs.js";

function getAuthToken() {
    return localStorage.getItem('auth_token') || '';
}

function authHeaders() {
    return {
        'Authorization': 'Bearer ' + getAuthToken(),
        'Content-Type': 'application/json'
    };
}

let editingCategoryId = null;

// ============================================================
// LOAD CATEGORIES
// ============================================================
async function loadCategories() {
    const tbody = document.getElementById('categories-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#6b7280">Đang tải...</td></tr>';
    }

    try {
        const response = await fetch(CATEGORIES_LIST_URL, {
            credentials: 'include',
            headers: { 'Authorization': 'Bearer ' + getAuthToken() }
        });

        const result = await response.json();

        if (!result.success) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#dc2626">${result.message}</td></tr>`;
            }
            return;
        }

        renderTable(result.data);

    } catch (err) {
        console.error('Lỗi load danh mục:', err);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#dc2626">Không thể kết nối server</td></tr>';
        }
    }
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable(categories) {
    const tbody = document.getElementById('categories-tbody');
    if (!tbody) return;

    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280">Chưa có danh mục nào</td></tr>';
        return;
    }

    let html = '';
    categories.forEach(cat => {
        html += `
            <tr>
                <td>${cat.id}</td>
                <td><strong>${cat.name}</strong></td>
                <td style="color:#6b7280;font-size:14px">${cat.description || '—'}</td>
                <td>
                    <span class="cat-count-badge">${cat.product_count} sản phẩm</span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon edit" onclick="openModal(${cat.id}, '${cat.name.replace(/'/g,"\\'")}', '${(cat.description || '').replace(/'/g,"\\'")}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteCategory(${cat.id}, '${cat.name.replace(/'/g,"\\'")}')">
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
// MODAL THÊM / SỬA
// ============================================================
window.openModal = function(id = null, name = '', desc = '') {
    editingCategoryId = id;

    const overlay    = document.getElementById('category-modal-overlay');
    const title      = document.getElementById('modal-title');
    const nameInput  = document.getElementById('cat-name');
    const descInput  = document.getElementById('cat-desc');

    if (id) {
        title.textContent = 'Chỉnh sửa danh mục';
        nameInput.value   = name;
        descInput.value   = desc;
    } else {
        title.textContent = 'Thêm danh mục mới';
        nameInput.value   = '';
        descInput.value   = '';
    }

    overlay.classList.add('active');
    nameInput.focus();
};

function closeModal() {
    const overlay = document.getElementById('category-modal-overlay');
    overlay.classList.remove('active');
    editingCategoryId = null;
}

// ============================================================
// SAVE (Thêm hoặc Sửa)
// ============================================================
async function saveCategory() {
    const name = document.getElementById('cat-name').value.trim();
    const desc = document.getElementById('cat-desc').value.trim();

    if (!name) {
        showToast('Vui lòng nhập tên danh mục', 'error');
        return;
    }

    const url  = editingCategoryId ? CATEGORIES_UPDATE_URL : CATEGORIES_CREATE_URL;
    const body = editingCategoryId
        ? { id: editingCategoryId, name, description: desc }
        : { name, description: desc };

    const saveBtn = document.getElementById('btn-save-category');
    if (saveBtn) {
        saveBtn.disabled    = true;
        saveBtn.textContent = 'Đang lưu...';
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            closeModal();
            loadCategories();
        } else {
            showToast(result.message, 'error');
        }

    } catch (err) {
        console.error('Lỗi lưu danh mục:', err);
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
window.deleteCategory = async function(id, name) {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;

    try {
        const response = await fetch(CATEGORIES_DELETE_URL, {
            method: 'POST',
            credentials: 'include',
            headers: authHeaders(),
            body: JSON.stringify({ id })
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            loadCategories();
        } else {
            showToast(result.message, 'error');
        }

    } catch (err) {
        console.error('Lỗi xóa danh mục:', err);
        showToast('Không thể kết nối server', 'error');
    }
};

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'success') {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.style.cssText = `
            position:fixed;top:24px;right:24px;z-index:9999;
            padding:12px 20px;border-radius:8px;color:#fff;
            font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);
            transition:opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'success' ? '#16a34a' : '#dc2626';
    toast.textContent      = message;
    toast.style.opacity    = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ============================================================
// KHỞI TẠO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    loadCategories();

    const btnAdd    = document.getElementById('btnAddCategory');
    const btnClose  = document.getElementById('btnCloseModal');
    const btnCancel = document.getElementById('btnCancelModal');
    const btnSave   = document.getElementById('btn-save-category');
    const overlay   = document.getElementById('category-modal-overlay');

    if (btnAdd)    btnAdd.addEventListener('click', () => openModal());
    if (btnClose)  btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
    if (btnSave)   btnSave.addEventListener('click', saveCategory);

    // Click overlay để đóng modal
    if (overlay) {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeModal();
        });
    }

    // Enter để lưu
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && overlay && overlay.classList.contains('active')) {
            saveCategory();
        }
    });
});
