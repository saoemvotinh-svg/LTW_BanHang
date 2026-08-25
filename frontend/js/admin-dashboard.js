// --- MOCK DATA ---
const mockStats = {
    revenue: { value: 125420000, change: 12.5, type: 'up' },
    orders: { value: 1248, change: 8.2, type: 'up' },
    products: { value: 356, change: 5.1, type: 'up' },
    customers: { value: 1086, change: 7.3, type: 'up' }
};

const mockTopProducts = [
    { id: 1, name: "Set sơ mi tổng hợp nhiều họa tiết bé trai", sold: 245 },
    { id: 2, name: "Set bộ sơ mi denim cho bé trai phối túi", sold: 189 },
    { id: 3, name: "Áo sơ mi tay ngắn thêu khủng long", sold: 156 },
    { id: 4, name: "Quần short jean denim ngắn cho bé trai", sold: 132 },
    { id: 5, name: "Set bộ áo thun tay dài Dragon Street", sold: 98 }
];

const mockOrders = [
    { id: "34401", customer_name: "Bùi Hoàng Lan", total_amount: 204400, status: "processing", status_text: "Đang xử lý", created_at: "19/01/2026 06:00" },
    { id: "34201", customer_name: "Đinh Bích Linh", total_amount: 79000, status: "delivered", status_text: "Đã giao", created_at: "03/04/2024 19:00" },
    { id: "33801", customer_name: "Đinh Thành Phúc", total_amount: 501800, status: "delivered", status_text: "Đã giao", created_at: "16/08/2025 02:06" },
    { id: "34001", customer_name: "Trần Thúy Hằng", total_amount: 119000, status: "pending", status_text: "Chờ xác nhận", created_at: "07/10/2024 22:31" },
    { id: "32401", customer_name: "Ngô Thu Hiền", total_amount: 711200, status: "cancelled", status_text: "Đã hủy", created_at: "05/11/2025 12:47" }
];

const mockCategories = [
    { name: "Set đồ / Đồ bộ", percentage: 35 },
    { name: "Váy / Đầm", percentage: 25 },
    { name: "Áo sơ mi", percentage: 20 },
    { name: "Áo thun / Polo", percentage: 10 },
    { name: "Quần", percentage: 10 }
];

const mockActivities = [
    { icon: "fa-cart-shopping", text: "Đơn hàng #34401 đã được cập nhật trạng thái", time: "5 phút trước" },
    { icon: "fa-user", text: "Bùi Hoàng Lan đã đăng ký tài khoản mới", time: "15 phút trước" },
    { icon: "fa-box", text: 'Sản phẩm "Set sơ mi tổng hợp" đã được cập nhật', time: "30 phút trước" },
    { icon: "fa-tag", text: "Chương trình khuyến mãi mùa hè đã được tạo", time: "1 giờ trước" }
];

// --- RENDER FUNCTIONS ---
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + ' ₫';
}

function renderDashboardStats() {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon revenue-icon"><i class="fa-solid fa-dollar-sign"></i></div>
          <div class="stat-info">
            <span class="stat-label">Doanh thu</span>
            <strong class="stat-value">${formatCurrency(mockStats.revenue.value)}</strong>
            <span class="stat-change">↑ ${mockStats.revenue.change}% so với tháng trước</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orders-icon"><i class="fa-solid fa-cart-shopping"></i></div>
          <div class="stat-info">
            <span class="stat-label">Đơn hàng</span>
            <strong class="stat-value">${mockStats.orders.value.toLocaleString('vi-VN')}</strong>
            <span class="stat-change">↑ ${mockStats.orders.change}% so với tháng trước</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon products-icon"><i class="fa-solid fa-box"></i></div>
          <div class="stat-info">
            <span class="stat-label">Sản phẩm</span>
            <strong class="stat-value">${mockStats.products.value}</strong>
            <span class="stat-change">↑ ${mockStats.products.change}% so với tháng trước</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon customers-icon"><i class="fa-solid fa-users"></i></div>
          <div class="stat-info">
            <span class="stat-label">Khách hàng</span>
            <strong class="stat-value">${mockStats.customers.value.toLocaleString('vi-VN')}</strong>
            <span class="stat-change">↑ ${mockStats.customers.change}% so với tháng trước</span>
          </div>
        </div>
    `;
}

function renderTopProducts() {
    const topProductsContainer = document.getElementById('top-products-list');
    if (!topProductsContainer) return;

    let html = '';
    mockTopProducts.forEach((product, index) => {
        html += `
            <div class="top-product">
              <span class="product-rank">${index + 1}</span>
              <div class="product-info">
                <span class="product-name">${product.name}</span>
                <div class="product-progress"><span></span></div>
              </div>
              <strong class="product-sold">${product.sold}</strong>
            </div>
        `;
    });
    topProductsContainer.innerHTML = html;
}

function renderRecentOrders() {
    const recentOrdersContainer = document.getElementById('recent-orders-tbody');
    if (!recentOrdersContainer) return;

    let html = '';
    mockOrders.forEach(order => {
        html += `
            <tr>
              <td>#${order.id}</td>
              <td>${order.customer_name}</td>
              <td>${formatCurrency(order.total_amount)}</td>
              <td><span class="order-status ${order.status}">${order.status_text}</span></td>
              <td>${order.created_at}</td>
            </tr>
        `;
    });
    recentOrdersContainer.innerHTML = html;
}

function renderCategories() {
    const categoryContainer = document.getElementById('category-list');
    if (!categoryContainer) return;

    let html = '';
    mockCategories.forEach(cat => {
        html += `
            <div class="category-item">
              <span class="category-name">${cat.name}</span>
              <strong>${cat.percentage}%</strong>
            </div>
        `;
    });
    categoryContainer.innerHTML = html;
}

function renderActivities() {
    const activityContainer = document.getElementById('activity-list');
    if (!activityContainer) return;

    let html = '';
    mockActivities.forEach(activity => {
        html += `
            <div class="activity-item">
              <div class="activity-icon"><i class="fa-solid ${activity.icon}"></i></div>
              <div class="activity-content">
                <p>${activity.text}</p>
                <span>${activity.time}</span>
              </div>
            </div>
        `;
    });
    activityContainer.innerHTML = html;
}

// --- CHARTS MOCK DATA ---
const mockChartData = {
    labels: ['01/05', '06/05', '11/05', '16/05', '21/05', '26/05', '31/05'],
    revenue: [50000000, 80000000, 30000000, 70000000, 50000000, 85000000, 60000000],
    orders: [50, 100, 40, 120, 80, 140, 100]
};

function renderCharts() {
    // Kiểm tra nếu Chart.js đã tải
    if (typeof Chart === 'undefined') return;

    // Biểu đồ Doanh thu & Đơn hàng
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: mockChartData.labels,
                datasets: [
                    {
                        label: 'Doanh thu (đ)',
                        data: mockChartData.revenue,
                        borderColor: '#2962ff', // Xanh dương
                        backgroundColor: 'rgba(41, 98, 255, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Đơn hàng',
                        data: mockChartData.orders,
                        borderColor: '#00c853', // Xanh lá
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
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false // HTML template đã có custom legend (nếu cần thì bật lên, hiện tại template có custom legend ở trên biểu đồ không? Template chỉ có chữ "Doanh thu (đ)" và "Đơn hàng" giả lập bằng span. Thôi cứ bật legend ở trong Chart cho giống ảnh)
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { borderDash: [5, 5] },
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000) + 'M';
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Biểu đồ Danh mục (Doughnut)
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        const categoryLabels = mockCategories.map(c => c.name);
        const categoryData = mockCategories.map(c => c.percentage);
        
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: [
                        '#2962ff', // Thời trang nam
                        '#00c853', // Thời trang nữ
                        '#ffd600', // Giày dép
                        '#aa00ff', // Phụ kiện
                        '#b0bec5'  // Khác
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false // Ẩn legend vì đã có list custom HTML bên cạnh
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' ' + context.label + ': ' + context.raw + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Khởi tạo render
document.addEventListener('DOMContentLoaded', () => {
    renderDashboardStats();
    renderTopProducts();
    renderRecentOrders();
    renderCategories();
    renderActivities();
    
    // Đợi 1 chút để đảm bảo script Chart.js load xong nếu nó được load sau
    setTimeout(renderCharts, 100);
});
