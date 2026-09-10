// admin-users.js — Quản lý người dùng, kết nối API thật

import { ADMIN_USERS_LIST_URL as USERS_LIST_URL, ADMIN_USERS_DETAIL_URL as USERS_DETAIL_URL } from "./configs.js";

function getAuthToken() {
    return localStorage.getItem('auth_token') || '';
}

function authHeaders() {
    return { 'Authorization': 'Bearer ' + getAuthToken() };
}

function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN') + ' đ';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

function getRoleBadge(role) {
    if (role === 'admin') {
        return '<span style="color:#2563eb;background:#eff6ff;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500">Admin</span>';
    }
    return '<span style="color:#4b5563;background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500">Khách hàng</span>';
}

function getRoleText(role) {
    return role === 'admin' ? 'Admin' : 'Khách hàng';
}

// Tạo avatar chữ cái đầu
function getInitialsAvatar(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
}

// ============================================================
// STATE
// ============================================================
let currentPage  = 1;
let totalPages   = 1;
let currentLimit = 15;
let searchTimeout = null;

// ============================================================
// LOAD USERS
// ============================================================
async function loadUsers() {
    const tbody     = document.getElementById('users-tbody');
    const searchVal = document.getElementById('users-search')?.value.trim() || '';
    const roleVal   = document.getElementById('role-filter')?.value || '';

    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#6b7280">Đang tải...</td></tr>';
    }

    const params = new URLSearchParams({
        page:  currentPage,
        limit: currentLimit,
        search: searchVal,
        role:  roleVal,
    });

    try {
        const response = await fetch(USERS_LIST_URL + '?' + params, {
            credentials: 'include',
            headers: authHeaders()
        });

        const result = await response.json();

        if (!result.success) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#dc2626">${result.message}</td></tr>`;
            }
            return;
        }

        totalPages = result.pagination.total_pages;
        renderTable(result.data);
        renderPagination(result.pagination);

    } catch (err) {
        console.error('Lỗi load users:', err);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#dc2626">Không thể kết nối server</td></tr>';
        }
    }
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable(users) {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#6b7280">Không tìm thấy người dùng nào</td></tr>';
        return;
    }

    let html = '';
    users.forEach(user => {
        const initials = getInitialsAvatar(user.full_name);
        const colors   = ['#2563eb','#7c3aed','#dc2626','#059669','#d97706'];
        const color    = colors[user.id % colors.length];

        html += `
            <tr>
                <td><input type="checkbox"></td>
                <td>${user.id}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="width:40px;height:40px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0">${initials}</div>
                        <strong style="color:#111827;font-weight:500">${user.full_name || '—'}</strong>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone || '—'}</td>
                <td>${getRoleBadge(user.role)}</td>
                <td>
                    <div class="product-name-col">
                        <span>${formatDate(user.created_at)}</span>
                    </div>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon view" onclick="openUserPanel(${user.id})" title="Xem chi tiết">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ============================================================
// PAGINATION
// ============================================================
function renderPagination(pagination) {
    const controls = document.querySelector('.pagination-controls');
    if (!controls) return;

    const { current_page, total_pages } = pagination;

    let html = `
        <button class="btn-page" ${current_page <= 1 ? 'disabled' : ''} onclick="changePage(1)">
            <i class="fa-solid fa-angles-left"></i>
        </button>
        <button class="btn-page" ${current_page <= 1 ? 'disabled' : ''} onclick="changePage(${current_page - 1})">
            <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    let startPage = Math.max(1, current_page - 2);
    let endPage   = Math.min(total_pages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="btn-page ${i === current_page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `
        <button class="btn-page" ${current_page >= total_pages ? 'disabled' : ''} onclick="changePage(${current_page + 1})">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
        <button class="btn-page" ${current_page >= total_pages ? 'disabled' : ''} onclick="changePage(${total_pages})">
            <i class="fa-solid fa-angles-right"></i>
        </button>
    `;

    controls.innerHTML = html;
}

window.changePage = function(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadUsers();
}

// ============================================================
// CHI TIẾT NGƯỜI DÙNG
// ============================================================
window.openUserPanel = async function(userId) {
    const panel = document.getElementById('user-details-panel');
    if (panel) panel.classList.add('active');

    // Reset
    document.getElementById('u-name').textContent    = 'Đang tải...';
    document.getElementById('u-name-val').textContent = '—';

    try {
        const response = await fetch(USERS_DETAIL_URL + '?id=' + userId, {
            credentials: 'include',
            headers: authHeaders()
        });

        const result = await response.json();

        if (!result.success) {
            showToast(result.message || 'Không thể tải thông tin', 'error');
            return;
        }

        const { user, order_count, total_spent, review_count, avg_rating } = result.data;

        // Avatar
        const initials = getInitialsAvatar(user.full_name);
        const colors   = ['#2563eb','#7c3aed','#dc2626','#059669','#d97706'];
        const color    = colors[user.id % colors.length];

        const avatarEl = document.getElementById('u-avatar');
        if (avatarEl) {
            // Thay ảnh bằng div chữ cái nếu không có ảnh thật
            avatarEl.style.cssText = `width:80px;height:80px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:32px;border:none`;
            avatarEl.textContent   = initials;
        }

        document.getElementById('u-name').textContent     = user.full_name || '—';
        document.getElementById('u-id').textContent       = user.id;
        document.getElementById('u-name-val').textContent = user.full_name || '—';
        document.getElementById('u-email').textContent    = user.email;
        document.getElementById('u-phone').textContent    = user.phone || '—';
        document.getElementById('u-role-val').textContent = getRoleText(user.role);
        document.getElementById('u-address').textContent  = user.address || '—';
        document.getElementById('u-date').textContent     = formatDate(user.created_at);

        // Role badge
        const uRole = document.getElementById('u-role');
        if (uRole) {
            uRole.innerHTML = getRoleBadge(user.role);
        }

        // Stats
        document.getElementById('u-orders-count').textContent = order_count;
        document.getElementById('u-orders-total').textContent = formatCurrency(total_spent);
        document.getElementById('u-reviews-count').textContent = review_count;
        document.getElementById('u-rating').textContent       = avg_rating > 0 ? avg_rating.toFixed(1) : '—';

    } catch (err) {
        console.error('Lỗi load user detail:', err);
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

    loadUsers();

    // Đóng panel
    const btnClose  = document.getElementById('closeUserPanel');
    const closePanel = () => {
        const panel = document.getElementById('user-details-panel');
        if (panel) panel.classList.remove('active');
    };

    if (btnClose) btnClose.addEventListener('click', closePanel);

    // Search debounce
    const searchInput = document.getElementById('users-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadUsers();
            }, 400);
        });
    }

    // Filter role
    const roleFilter = document.getElementById('role-filter');
    if (roleFilter) {
        roleFilter.addEventListener('change', () => {
            currentPage = 1;
            loadUsers();
        });
    }
});
