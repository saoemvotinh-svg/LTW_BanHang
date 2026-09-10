// admin-orders.js — Quản lý đơn hàng, kết nối API thật

import { ADMIN_ORDERS_LIST_URL as ORDERS_LIST_URL, ADMIN_ORDERS_DETAIL_URL as ORDERS_DETAIL_URL, ADMIN_ORDERS_UPDATE_STATUS_URL as ORDERS_UPDATE_STATUS_URL } from "./configs.js";

function getAuthToken() {
    return localStorage.getItem('auth_token') || '';
}

function authHeaders() {
    return { 'Authorization': 'Bearer ' + getAuthToken() };
}

function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN') + ' ₫';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getStatusBadge(status) {
    const map = {
        'pending':   { text: 'Chờ xử lý',   bg: '#fef08a', color: '#a16207' },
        'confirmed': { text: 'Đã xác nhận', bg: '#bfdbfe', color: '#1d4ed8' },
        'shipping':  { text: 'Đang giao',   bg: '#e9d5ff', color: '#7e22ce' },
        'completed': { text: 'Đã giao',     bg: '#bbf7d0', color: '#15803d' },
        'cancelled': { text: 'Đã hủy',      bg: '#fecaca', color: '#b91c1c' },
    };
    const s = map[status] || { text: status, bg: '#e5e7eb', color: '#374151' };
    return `<span class="status-badge" style="background:${s.bg};color:${s.color};padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500">${s.text}</span>`;
}

function getStatusText(status) {
    const map = {
        'pending': 'Chờ xử lý', 'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao', 'completed': 'Đã giao', 'cancelled': 'Đã hủy'
    };
    return map[status] || status;
}

// ============================================================
// STATE
// ============================================================
let currentPage  = 1;
let totalPages   = 1;
let currentLimit = 15;
let openOrderId  = null;

let searchTimeout = null;

// ============================================================
// LOAD ORDERS
// ============================================================
async function loadOrders() {
    const tbody     = document.getElementById('orders-tbody');
    const searchVal = document.getElementById('orders-search')?.value.trim() || '';
    const statusVal = document.getElementById('status-filter')?.value || '';

    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#6b7280">Đang tải...</td></tr>';
    }

    const params = new URLSearchParams({
        page:   currentPage,
        limit:  currentLimit,
        search: searchVal,
        status: statusVal,
    });

    try {
        const response = await fetch(ORDERS_LIST_URL + '?' + params, {
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

        // Cập nhật summary cards
        renderSummaryCards(result.summary || {});

        totalPages = result.pagination.total_pages;
        renderTable(result.data);
        renderPagination(result.pagination);

    } catch (err) {
        console.error('Lỗi load đơn hàng:', err);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#dc2626">Không thể kết nối server</td></tr>';
        }
    }
}

// ============================================================
// SUMMARY CARDS
// ============================================================
function renderSummaryCards(summary) {
    const cards = document.querySelectorAll('.summary-card .info strong');
    if (cards.length < 5) return;

    const total     = Object.values(summary).reduce((a, b) => a + b, 0);
    const pending   = summary['pending']   || 0;
    const shipping  = summary['shipping']  || 0;
    const completed = summary['completed'] || 0;
    const cancelled = summary['cancelled'] || 0;

    cards[0].textContent = total;
    cards[1].textContent = pending;
    cards[2].textContent = shipping;
    cards[3].textContent = completed;
    cards[4].textContent = cancelled;
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderTable(orders) {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#6b7280">Không có đơn hàng nào</td></tr>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        html += `
            <tr>
                <td><input type="checkbox"></td>
                <td>#${order.id}</td>
                <td>
                    <div class="product-name-col">
                        <strong>${order.customer_name}</strong>
                        <span>${order.user_email || ''}</span>
                    </div>
                </td>
                <td>${order.phone}</td>
                <td style="color:#2563eb;font-weight:600">${formatCurrency(order.total_amount)}</td>
                <td>${getStatusBadge(order.status)}</td>
                <td>
                    <div class="product-name-col">
                        <span>${formatDate(order.created_at).split(' ')[0]}</span>
                        <span>${formatDate(order.created_at).split(' ')[1] || ''}</span>
                    </div>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon view" onclick="openOrderPanel(${order.id})" title="Xem chi tiết">
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
    loadOrders();
}

// ============================================================
// CHI TIẾT ĐƠN HÀNG
// ============================================================
window.openOrderPanel = async function(orderId) {
    openOrderId = orderId;
    const panel = document.getElementById('order-details-panel');

    // Reset nội dung
    document.getElementById('o-id').textContent    = `Đơn hàng #${orderId}`;
    document.getElementById('o-products-list').innerHTML = '<div style="padding:10px;color:#6b7280">Đang tải...</div>';

    if (panel) panel.classList.add('active');

    try {
        const response = await fetch(ORDERS_DETAIL_URL + '?id=' + orderId, {
            credentials: 'include',
            headers: authHeaders()
        });

        const result = await response.json();

        if (!result.success) {
            showToast(result.message, 'error');
            return;
        }

        const { order, items } = result.data;

        // Điền thông tin đơn
        document.getElementById('o-id').textContent      = `Đơn hàng #${order.id}`;
        document.getElementById('o-date').textContent    = formatDate(order.created_at);
        document.getElementById('c-name').textContent    = order.customer_name;
        document.getElementById('c-phone').textContent   = order.phone;
        document.getElementById('c-email').textContent   = order.user_email || '—';
        document.getElementById('c-address').textContent = order.address || '—';
        document.getElementById('o-total-price').textContent = formatCurrency(order.total_amount);
        document.getElementById('o-subtotal').textContent    = formatCurrency(order.total_amount);
        document.getElementById('o-shipping').textContent    = formatCurrency(0);
        document.getElementById('o-discount').textContent    = formatCurrency(0);

        // Status badge
        const oStatus = document.getElementById('o-status');
        if (oStatus) {
            oStatus.textContent    = getStatusText(order.status);
            oStatus.style.cssText += `;background:${getStatusBg(order.status)};color:${getStatusColor(order.status)}`;
        }

        // Select status
        const statusSelect = document.querySelector('.status-select');
        if (statusSelect) {
            statusSelect.value = order.status;
        }

        // Sản phẩm trong đơn
        const productsList = document.getElementById('o-products-list');
        if (items && items.length > 0) {
            let itemsHtml = '';
            items.forEach(item => {
                const imgSrc = item.image || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=SP';
                itemsHtml += `
                    <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center">
                        <img src="${imgSrc}" style="width:60px;height:60px;border-radius:6px;object-fit:cover"
                             onerror="this.src='https://placehold.co/60x60/e2e8f0/94a3b8?text=SP'">
                        <div style="flex:1">
                            <div style="font-weight:500;font-size:14px;margin-bottom:4px">${item.product_name}</div>
                            <div style="font-size:12px;color:#6b7280">x${item.quantity} — ${formatCurrency(item.unit_price)}/cái</div>
                        </div>
                        <div style="text-align:right;font-weight:500;font-size:14px">${formatCurrency(item.subtotal)}</div>
                    </div>
                `;
            });
            productsList.innerHTML = itemsHtml;
        } else {
            productsList.innerHTML = '<p style="color:#6b7280;font-size:14px">Không có sản phẩm</p>';
        }

    } catch (err) {
        console.error('Lỗi load chi tiết đơn:', err);
        showToast('Không thể kết nối server', 'error');
    }
};

function getStatusBg(status) {
    const map = { pending:'#fef08a', confirmed:'#bfdbfe', shipping:'#e9d5ff', completed:'#bbf7d0', cancelled:'#fecaca' };
    return map[status] || '#e5e7eb';
}
function getStatusColor(status) {
    const map = { pending:'#a16207', confirmed:'#1d4ed8', shipping:'#7e22ce', completed:'#15803d', cancelled:'#b91c1c' };
    return map[status] || '#374151';
}

// ============================================================
// CẬP NHẬT TRẠNG THÁI ĐƠN
// ============================================================
async function updateOrderStatus() {
    if (!openOrderId) return;

    const statusSelect = document.querySelector('.status-select');
    if (!statusSelect) return;

    const newStatus = statusSelect.value;

    const updateBtn = document.getElementById('btn-update-order');
    if (updateBtn) {
        updateBtn.disabled    = true;
        updateBtn.textContent = 'Đang lưu...';
    }

    try {
        const response = await fetch(ORDERS_UPDATE_STATUS_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: openOrderId, status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            loadOrders();

            // Cập nhật badge trong panel
            const oStatus = document.getElementById('o-status');
            if (oStatus) {
                oStatus.textContent    = getStatusText(newStatus);
                oStatus.style.background = getStatusBg(newStatus);
                oStatus.style.color      = getStatusColor(newStatus);
            }
        } else {
            showToast(result.message, 'error');
        }

    } catch (err) {
        console.error('Lỗi cập nhật trạng thái:', err);
        showToast('Không thể kết nối server', 'error');
    } finally {
        if (updateBtn) {
            updateBtn.disabled    = false;
            updateBtn.textContent = 'Cập nhật';
        }
    }
}

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

    loadOrders();

    // Đóng panel
    const btnClose  = document.getElementById('closeOrderPanel');
    const btnCancel = document.getElementById('btnCancelPanel');
    const closePanel = () => {
        const panel = document.getElementById('order-details-panel');
        if (panel) panel.classList.remove('active');
        openOrderId = null;
    };

    if (btnClose)  btnClose.addEventListener('click', closePanel);
    if (btnCancel) btnCancel.addEventListener('click', closePanel);

    // Nút cập nhật trạng thái
    const updateBtn = document.getElementById('btn-update-order');
    if (updateBtn) updateBtn.addEventListener('click', updateOrderStatus);

    // Search debounce
    const searchInput = document.getElementById('orders-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadOrders();
            }, 400);
        });
    }

    // Filter status
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentPage = 1;
            loadOrders();
        });
    }
});
