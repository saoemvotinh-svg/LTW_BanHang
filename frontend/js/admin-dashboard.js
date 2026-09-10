// admin-dashboard.js — Kết nối API thật từ backend

import { ADMIN_DASHBOARD_URL } from "./configs.js";

// Lấy token từ localStorage
function getAuthToken() {
    return localStorage.getItem('auth_token') || '';
}

// Format số tiền sang VND
function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN') + ' ₫';
}

// Format ngày giờ
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Map trạng thái đơn hàng
function getStatusBadge(status) {
    const map = {
        'pending':   { text: 'Chờ xử lý',   color: '#fef08a', textColor: '#a16207' },
        'confirmed': { text: 'Đã xác nhận', color: '#bfdbfe', textColor: '#1d4ed8' },
        'shipping':  { text: 'Đang giao',   color: '#e9d5ff', textColor: '#7e22ce' },
        'completed': { text: 'Đã giao',     color: '#bbf7d0', textColor: '#15803d' },
        'cancelled': { text: 'Đã hủy',      color: '#fecaca', textColor: '#b91c1c' },
    };
    const s = map[status] || { text: status, color: '#e5e7eb', textColor: '#374151' };
    return `<span class="order-status" style="background:${s.color};color:${s.textColor};padding:3px 8px;border-radius:4px;font-size:12px;font-weight:500">${s.text}</span>`;
}

// ============================================================
// FETCH DATA TỪ BACKEND
// ============================================================
async function loadDashboard() {
    showLoading();

    try {
        const response = await fetch(ADMIN_DASHBOARD_URL, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        });

        const result = await response.json();

        if (!result.success) {
            showError(result.message || 'Không thể tải dữ liệu');
            return;
        }

        const data = result.data;

        renderStats(data.stats);
        renderTopProducts(data.top_products);
        renderRecentOrders(data.recent_orders);
        renderCategoryStats(data.category_stats);
        renderActivities(data.recent_orders);
        renderCharts(data.revenue_chart, data.category_stats);

    } catch (err) {
        console.error('Lỗi tải dashboard:', err);
        showError('Không thể kết nối server. Vui lòng kiểm tra XAMPP.');
    }
}

function showLoading() {
    const statsContainer = document.getElementById('dashboard-stats');
    if (statsContainer) {
        statsContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#6b7280">Đang tải dữ liệu...</div>';
    }
}

function showError(msg) {
    const statsContainer = document.getElementById('dashboard-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `<div style="padding:20px;text-align:center;color:#dc2626">${msg}</div>`;
    }
}

// ============================================================
// RENDER STATS CARDS
// ============================================================
function renderStats(stats) {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon revenue-icon"><i class="fa-solid fa-dollar-sign"></i></div>
          <div class="stat-info">
            <span class="stat-label">Doanh thu</span>
            <strong class="stat-value">${formatCurrency(stats.total_revenue)}</strong>
            <span class="stat-change">Tổng doanh thu</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orders-icon"><i class="fa-solid fa-cart-shopping"></i></div>
          <div class="stat-info">
            <span class="stat-label">Đơn hàng</span>
            <strong class="stat-value">${Number(stats.total_orders).toLocaleString('vi-VN')}</strong>
            <span class="stat-change">Tổng đơn hàng</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon products-icon"><i class="fa-solid fa-box"></i></div>
          <div class="stat-info">
            <span class="stat-label">Sản phẩm</span>
            <strong class="stat-value">${stats.total_products}</strong>
            <span class="stat-change">Tổng sản phẩm</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon customers-icon"><i class="fa-solid fa-users"></i></div>
          <div class="stat-info">
            <span class="stat-label">Khách hàng</span>
            <strong class="stat-value">${Number(stats.total_users).toLocaleString('vi-VN')}</strong>
            <span class="stat-change">Tổng người dùng</span>
          </div>
        </div>
    `;
}

// ============================================================
// RENDER TOP PRODUCTS
// ============================================================
function renderTopProducts(topProducts) {
    const container = document.getElementById('top-products-list');
    if (!container) return;

    if (!topProducts || topProducts.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;padding:10px">Chưa có dữ liệu</p>';
        return;
    }

    const maxSold = Math.max(...topProducts.map(p => parseInt(p.total_sold) || 0), 1);

    let html = '';
    topProducts.forEach((product, index) => {
        const sold = parseInt(product.total_sold) || 0;
        const percent = Math.round((sold / maxSold) * 100);

        html += `
            <div class="top-product">
              <span class="product-rank">${index + 1}</span>
              <div class="product-info">
                <span class="product-name">${product.name}</span>
                <div class="product-progress"><span style="width:${percent}%"></span></div>
              </div>
              <strong class="product-sold">${sold}</strong>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================
// RENDER RECENT ORDERS
// ============================================================
function renderRecentOrders(recentOrders) {
    const tbody = document.getElementById('recent-orders-tbody');
    if (!tbody) return;

    if (!recentOrders || recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:20px">Chưa có đơn hàng</td></tr>';
        return;
    }

    let html = '';
    recentOrders.forEach(order => {
        html += `
            <tr>
              <td>#${order.id}</td>
              <td>${order.customer_name}</td>
              <td style="color:#2563eb;font-weight:600">${formatCurrency(order.total_amount)}</td>
              <td>${getStatusBadge(order.status)}</td>
              <td>${formatDate(order.created_at)}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ============================================================
// RENDER CATEGORY STATS
// ============================================================
function renderCategoryStats(categoryStats) {
    const container = document.getElementById('category-list');
    if (!container) return;

    if (!categoryStats || categoryStats.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;padding:10px">Chưa có danh mục</p>';
        return;
    }

    const total = categoryStats.reduce((sum, c) => sum + parseInt(c.product_count), 0) || 1;

    let html = '';
    categoryStats.forEach(cat => {
        const percent = total > 0 ? Math.round((parseInt(cat.product_count) / total) * 100) : 0;
        html += `
            <div class="category-item">
              <span class="category-name">${cat.name}</span>
              <strong>${percent}% (${cat.product_count} sp)</strong>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================
// RENDER ACTIVITIES (dùng đơn hàng mới nhất)
// ============================================================
function renderActivities(recentOrders) {
    const container = document.getElementById('activity-list');
    if (!container) return;

    if (!recentOrders || recentOrders.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;padding:10px">Chưa có hoạt động</p>';
        return;
    }

    let html = '';
    recentOrders.slice(0, 5).forEach(order => {
        html += `
            <div class="activity-item">
              <div class="activity-icon"><i class="fa-solid fa-cart-shopping"></i></div>
              <div class="activity-content">
                <p>Đơn hàng #${order.id} — ${order.customer_name} — ${formatCurrency(order.total_amount)}</p>
                <span>${formatDate(order.created_at)}</span>
              </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================
// CHARTS (Chart.js)
// ============================================================
function renderCharts(revenueChart, categoryStats) {
    if (typeof Chart === 'undefined') return;

    // Biểu đồ doanh thu
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && revenueChart && revenueChart.length > 0) {
        const labels  = revenueChart.map(r => r.date);
        const revenue = revenueChart.map(r => parseFloat(r.revenue));
        const orders  = revenueChart.map(r => parseInt(r.order_count));

        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Doanh thu (đ)',
                        data: revenue,
                        borderColor: '#2962ff',
                        backgroundColor: 'rgba(41,98,255,0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Đơn hàng',
                        data: orders,
                        borderColor: '#00c853',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: true } },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        type: 'linear', display: true, position: 'left',
                        grid: { borderDash: [5, 5] },
                        ticks: { callback: v => (v / 1000000) + 'M' }
                    },
                    y1: { type: 'linear', display: true, position: 'right', grid: { display: false } }
                }
            }
        });
    } else if (revenueCtx) {
        // Không có dữ liệu — vẽ biểu đồ rỗng có message
        revenueCtx.parentElement.innerHTML = '<p style="text-align:center;padding:40px;color:#6b7280">Chưa có đơn hàng hoàn thành trong 7 ngày qua</p>';
    }

    // Biểu đồ danh mục (Doughnut)
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx && categoryStats && categoryStats.length > 0) {
        const colors = ['#2962ff','#00c853','#ffd600','#aa00ff','#ff6d00','#b0bec5'];

        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryStats.map(c => c.name),
                datasets: [{
                    data: categoryStats.map(c => parseInt(c.product_count)),
                    backgroundColor: colors.slice(0, categoryStats.length),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.raw} sản phẩm`
                        }
                    }
                }
            }
        });
    }
}

// ============================================================
// KHỞI TẠO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
