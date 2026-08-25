document.addEventListener('DOMContentLoaded', () => {
    // === MOCK DATA ===
    const mockOrders = [
        { id: 10025, customer: 'Nguyễn Văn An', email: 'an.nguyen@email.com', phone: '0901 234 567', total: 1250000, status: 'pending', date: '25/05/2024 10:30', address: '123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh' },
        { id: 10024, customer: 'Trần Thị Bình', email: 'binh.tran@email.com', phone: '0912 345 678', total: 850000, status: 'confirmed', date: '25/05/2024 09:15', address: '456 Đường DEF, Phường 2, Quận 3, TP. Hồ Chí Minh' },
        { id: 10023, customer: 'Lê Minh Cường', email: 'cuong.le@email.com', phone: '0932 456 789', total: 2450000, status: 'shipping', date: '24/05/2024 16:45', address: '789 Đường GHI, Phường 3, Quận 10, TP. Hồ Chí Minh' },
        { id: 10022, customer: 'Phạm Thị Dung', email: 'dung.pham@email.com', phone: '0945 678 901', total: 560000, status: 'completed', date: '24/05/2024 14:20', address: '101 Đường JKL, Phường 4, Quận 5, TP. Hồ Chí Minh' },
        { id: 10021, customer: 'Hoàng Văn E', email: 'e.hoang@email.com', phone: '0967 890 123', total: 1090000, status: 'cancelled', date: '23/05/2024 11:05', address: '202 Đường MNO, Phường 5, Quận 7, TP. Hồ Chí Minh' },
    ];

    const tbody = document.getElementById('orders-tbody');
    
    function formatCurrency(amount) {
        return amount.toLocaleString('vi-VN') + ' ₫';
    }

    function getStatusBadge(status) {
        switch(status) {
            case 'pending': return '<span class="status-badge" style="background-color: #fef08a; color: #a16207; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Chờ xử lý</span>';
            case 'confirmed': return '<span class="status-badge" style="background-color: #bfdbfe; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Đã xác nhận</span>';
            case 'shipping': return '<span class="status-badge" style="background-color: #e9d5ff; color: #7e22ce; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Đang giao</span>';
            case 'completed': return '<span class="status-badge" style="background-color: #bbf7d0; color: #15803d; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Đã giao</span>';
            case 'cancelled': return '<span class="status-badge" style="background-color: #fecaca; color: #b91c1c; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Đã hủy</span>';
            default: return '';
        }
    }

    function getStatusText(status) {
        switch(status) {
            case 'pending': return 'Chờ xử lý';
            case 'confirmed': return 'Đã xác nhận';
            case 'shipping': return 'Đang giao';
            case 'completed': return 'Đã giao';
            case 'cancelled': return 'Đã hủy';
            default: return '';
        }
    }

    function renderTable() {
        if (!tbody) return;
        let html = '';
        mockOrders.forEach(order => {
            html += `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>#${order.id}</td>
                    <td>
                        <div class="product-name-col">
                            <strong>${order.customer}</strong>
                            <span>${order.email}</span>
                        </div>
                    </td>
                    <td>${order.phone}</td>
                    <td style="color: #2563eb; font-weight: 600;">${formatCurrency(order.total)}</td>
                    <td>${getStatusBadge(order.status)}</td>
                    <td>
                        <div class="product-name-col">
                            <span>${order.date.split(' ')[0]}</span>
                            <span>${order.date.split(' ')[1]}</span>
                        </div>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon view" onclick="openOrderOffcanvas(${order.id})" title="Xem chi tiết"><i class="fa-regular fa-eye"></i></button>
                            <button class="btn-icon delete" title="Xóa"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    renderTable();

    // === DETAILS PANEL INTERACTION ===
    const detailsPanel = document.getElementById('order-details-panel');
    const btnClose = document.getElementById('closeOrderPanel');
    const btnCancel = document.getElementById('btnCancelPanel');
    
    window.openOrderOffcanvas = function(orderId) {
        const order = mockOrders.find(o => o.id === orderId);
        if(order) {
            document.getElementById('o-id').innerText = 'Đơn hàng #' + order.id;
            document.getElementById('o-status').outerHTML = getStatusBadge(order.status).replace('>', ' id="o-status">');
            document.getElementById('o-date').innerText = order.date;
            document.getElementById('c-name').innerText = order.customer;
            document.getElementById('c-phone').innerText = order.phone;
            document.getElementById('c-email').innerText = order.email;
            document.getElementById('c-address').innerText = order.address;
            document.getElementById('o-subtotal').innerText = formatCurrency(order.total - 30000);
            document.getElementById('o-shipping').innerText = formatCurrency(30000);
            document.getElementById('o-discount').innerText = formatCurrency(0);
            document.getElementById('o-total-price').innerText = formatCurrency(order.total);
            
            const select = document.querySelector('.status-select');
            if (select) {
                select.value = getStatusText(order.status);
            }
            
            // Mock products for the order
            const productsList = document.getElementById('o-products-list');
            productsList.innerHTML = `
                <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                    <img src="https://placehold.co/60x60/e2e8f0/475569?text=SP" style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">Sản phẩm mẫu 1</div>
                        <div style="font-size: 12px; color: #6b7280;">Phân loại: Đỏ / M</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #6b7280;">x1</div>
                        <div style="font-weight: 500; font-size: 14px;">${formatCurrency(order.total - 30000)}</div>
                    </div>
                </div>
            `;
        }
        
        if (detailsPanel) detailsPanel.classList.add('active');
    };

    function closePanel() {
        if (detailsPanel) detailsPanel.classList.remove('active');
    }

    if(btnClose) btnClose.addEventListener('click', closePanel);
    if(btnCancel) btnCancel.addEventListener('click', closePanel);
});
