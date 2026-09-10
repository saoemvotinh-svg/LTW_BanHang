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
// FETCH DATA Từ BACKEND
// ============================================================
async function loadDashboard() {
    showLoading();

    // Đọc period từ select (đặt mặc định 'week')
    const chartFilter = document.getElementById('chart-filter');
    const period = chartFilter ? chartFilter.value : 'week';

    try {
        const response = await fetch(`${ADMIN_DASHBOARD_URL}?period=${period}`, {
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
// CHARTS (ApexCharts)
// ============================================================
let revenueApexChart   = null;
let categoryApexChart  = null;

function renderCharts(revenueChartData, categoryStats) {
    renderRevenueChart(revenueChartData);
    renderCategoryChart(categoryStats);
}

// ── Biểu đồ doanh thu (Area + Line dual-axis) ────────────────
function renderRevenueChart(revenueChartData) {
    const el = document.getElementById('revenueChart');
    if (!el) return;

    // Xóa chart cũ
    if (revenueApexChart) {
        revenueApexChart.destroy();
        revenueApexChart = null;
    }

    // Empty state
    if (!revenueChartData || revenueChartData.length === 0) {
        el.innerHTML = '<p style="text-align:center;padding:60px 20px;color:#9ca3af;font-size:13px">Chưa có đơn hàng hoàn thành trong khoảng thời gian này</p>';
        return;
    }

    // Đảm bảo el là div sạch
    el.innerHTML = '';

    const labels  = revenueChartData.map(r => String(r.date));
    const revenue = revenueChartData.map(r => parseFloat(r.revenue));
    const orders  = revenueChartData.map(r => parseInt(r.order_count));

    const options = {
        series: [
            {
                name: 'Doanh thu (₫)',
                type: 'area',
                data: revenue
            },
            {
                name: 'Đơn hàng',
                type: 'line',
                data: orders
            }
        ],
        chart: {
            height: 280,
            type: 'line',
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "'Inter', sans-serif",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 500
            }
        },
        stroke: {
            curve: 'straight',
            width: [2, 2],
            dashArray: [0, 4]
        },
        fill: {
            type: ['gradient', 'solid'],
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.02,
                stops: [0, 90, 100]
            }
        },
        colors: ['#2563eb', '#16a34a'],
        markers: {
            size: [3, 4],
            strokeWidth: 0,
            hover: { size: 5 }
        },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { fontSize: '11px', colors: '#9ca3af' }
            }
        },
        yaxis: [
            {
                seriesName: 'Doanh thu (₫)',
                title: { text: undefined },
                labels: {
                    style: { fontSize: '11px', colors: '#9ca3af' },
                    formatter: v => {
                        if (v >= 1000000) return (v / 1000000).toFixed(0) + 'M';
                        if (v >= 1000)    return (v / 1000).toFixed(0) + 'K';
                        return v;
                    }
                }
            },
            {
                seriesName: 'Đơn hàng',
                opposite: true,
                title: { text: undefined },
                labels: {
                    style: { fontSize: '11px', colors: '#9ca3af' },
                    formatter: v => Math.round(v)
                }
            }
        ],
        grid: {
            borderColor: '#f3f4f6',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } }
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: [
                { formatter: v => Number(v).toLocaleString('vi-VN') + ' ₫' },
                { formatter: v => Math.round(v) + ' đơn' }
            ]
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '12px',
            markers: { size: 6, shape: 'circle' },
            itemMargin: { horizontal: 12 }
        },
        dataLabels: { enabled: false }
    };

    revenueApexChart = new ApexCharts(el, options);
    revenueApexChart.render();
}

// ── Biểu đồ danh mục (Donut) ─────────────────────────────────
function renderCategoryChart(categoryStats) {
    const el = document.getElementById('categoryChart');
    if (!el || !categoryStats || categoryStats.length === 0) return;

    if (categoryApexChart) {
        categoryApexChart.destroy();
        categoryApexChart = null;
    }

    el.innerHTML = '';

    const colors = ['#2563eb','#16a34a','#d97706','#7c3aed','#db2777','#6b7280','#0891b2'];

    const options = {
        series: categoryStats.map(c => parseInt(c.product_count)),
        chart: {
            type: 'donut',
            height: 180,
            toolbar: { show: false },
            fontFamily: "'Inter', sans-serif",
            animations: { enabled: true, speed: 400 }
        },
        labels: categoryStats.map(c => c.name),
        colors: colors.slice(0, categoryStats.length),
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Tổng SP',
                            fontSize: '12px',
                            color: '#6b7280',
                            formatter: w => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: {
            y: { formatter: v => v + ' sản phẩm' }
        },
        stroke: { width: 0 }
    };

    categoryApexChart = new ApexCharts(el, options);
    categoryApexChart.render();
}

// ── Fetch lại chart theo period ───────────────────────────────
async function reloadChart(period) {
    const el = document.getElementById('revenueChart');
    if (!el) return;

    el.style.opacity = '0.4';
    el.style.pointerEvents = 'none';

    try {
        const res = await fetch(`${ADMIN_DASHBOARD_URL}?period=${period}`, {
            credentials: 'include',
            headers: { 'Authorization': 'Bearer ' + getAuthToken() }
        });
        const result = await res.json();

        if (result.success) {
            renderRevenueChart(result.data.revenue_chart || []);
        }
    } catch (e) {
        console.error('Lỗi tải chart:', e);
    } finally {
        el.style.opacity = '1';
        el.style.pointerEvents = '';
    }
}

// ============================================================
// KHỞI TẠO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();

    // Lắng nghe sự kiện đổi period của biểu đồ
    const chartFilter = document.getElementById('chart-filter');
    if (chartFilter) {
        chartFilter.addEventListener('change', () => {
            reloadChart(chartFilter.value);
        });
    }
});

