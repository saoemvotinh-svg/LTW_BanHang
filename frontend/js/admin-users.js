document.addEventListener('DOMContentLoaded', () => {
    // === MOCK DATA ===
    const mockUsers = [
        { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0901 234 567', role: 'Admin', status: 'active', date: '25/05/2024 10:30', address: '123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh', orders: 18, totalSpent: 24560000, reviews: 12, rating: 4.8, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=NA' },
        { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@example.com', phone: '0912 345 678', role: 'Khách hàng', status: 'active', date: '25/05/2024 09:15', address: '456 Đường DEF, Phường 2, Quận 3, TP. Hồ Chí Minh', orders: 5, totalSpent: 3500000, reviews: 3, rating: 5.0, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=TB' },
        { id: 3, name: 'Lê Minh Cường', email: 'cuong.le@example.com', phone: '0932 456 789', role: 'Khách hàng', status: 'active', date: '24/05/2024 16:45', address: '789 Đường GHI, Phường 3, Quận 10, TP. Hồ Chí Minh', orders: 2, totalSpent: 1200000, reviews: 1, rating: 4.0, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=LC' },
        { id: 4, name: 'Phạm Thị Dung', email: 'dung.pham@example.com', phone: '0945 678 901', role: 'Khách hàng', status: 'active', date: '24/05/2024 14:20', address: '101 Đường JKL, Phường 4, Quận 5, TP. Hồ Chí Minh', orders: 10, totalSpent: 8900000, reviews: 8, rating: 4.5, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=PD' },
        { id: 5, name: 'Hoàng Văn E', email: 'e.hoang@example.com', phone: '0967 890 123', role: 'Nhân viên', status: 'active', date: '23/05/2024 11:05', address: '202 Đường MNO, Phường 5, Quận 7, TP. Hồ Chí Minh', orders: 0, totalSpent: 0, reviews: 0, rating: 0, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=HE' },
        { id: 6, name: 'Vũ Thị Hạnh', email: 'hanh.vu@example.com', phone: '0978 901 234', role: 'Khách hàng', status: 'active', date: '23/05/2024 08:30', address: '303 Đường PQR, Phường 6, Quận 8, TP. Hồ Chí Minh', orders: 1, totalSpent: 450000, reviews: 0, rating: 0, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=VH' },
        { id: 7, name: 'Đặng Văn Khoa', email: 'khoa.dang@example.com', phone: '0988 012 345', role: 'Nhân viên', status: 'active', date: '22/05/2024 15:10', address: '404 Đường STU, Phường 7, Quận 9, TP. Hồ Chí Minh', orders: 0, totalSpent: 0, reviews: 0, rating: 0, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=DK' },
        { id: 8, name: 'Bùi Thị Lan', email: 'lan.bui@example.com', phone: '0999 123 456', role: 'Khách hàng', status: 'locked', date: '22/05/2024 10:40', address: '505 Đường VWX, Phường 8, Quận Gò Vấp, TP. Hồ Chí Minh', orders: 0, totalSpent: 0, reviews: 0, rating: 0, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=BL' },
        { id: 9, name: 'Phan Văn Minh', email: 'minh.phan@example.com', phone: '0911 222 333', role: 'Nhân viên', status: 'active', date: '21/05/2024 13:25', address: '606 Đường YZ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh', orders: 0, totalSpent: 0, reviews: 0, rating: 0, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=PM' },
        { id: 10, name: 'Ngô Thị Mai', email: 'mai.ngo@example.com', phone: '0922 333 444', role: 'Khách hàng', status: 'active', date: '21/05/2024 09:12', address: '707 Đường ABCD, Phường 10, Quận Tân Bình, TP. Hồ Chí Minh', orders: 4, totalSpent: 2100000, reviews: 2, rating: 4.5, avatar: 'https://placehold.co/100x100/e2e8f0/475569?text=NM' }
    ];

    const tbody = document.getElementById('users-tbody');
    
    function formatCurrency(amount) {
        return amount.toLocaleString('vi-VN') + ' đ';
    }

    function getStatusBadge(status) {
        if(status === 'active') {
            return '<span class="badge" style="background-color: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Đang hoạt động</span>';
        } else {
            return '<span class="badge" style="background-color: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Bị khóa</span>';
        }
    }

    function getRoleBadge(role) {
        if(role === 'Admin') {
            return '<span style="color: #2563eb; background-color: #eff6ff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Admin</span>';
        } else if (role === 'Nhân viên') {
            return '<span style="color: #d97706; background-color: #fef3c7; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Nhân viên</span>';
        } else {
            return '<span style="color: #4b5563; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Khách hàng</span>';
        }
    }

    function renderTable() {
        if (!tbody) return;
        let html = '';
        mockUsers.forEach(user => {
            html += `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>${user.id}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${user.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                            <strong style="color: #111827; font-weight: 500;">${user.name}</strong>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${getRoleBadge(user.role)}</td>
                    <td>
                        <div class="product-name-col">
                            <span>${user.date.split(' ')[0]}</span>
                            <span>${user.date.split(' ')[1]}</span>
                        </div>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon view" onclick="openUserOffcanvas(${user.id})" title="Xem chi tiết"><i class="fa-regular fa-eye"></i></button>
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
    const detailsPanel = document.getElementById('user-details-panel');
    const btnClose = document.getElementById('closeUserPanel');
    
    window.openUserOffcanvas = function(userId) {
        const user = mockUsers.find(u => u.id === userId);
        if(user) {
            document.getElementById('u-avatar').src = user.avatar;
            document.getElementById('u-name').innerText = user.name;
            document.getElementById('u-id').innerText = user.id;
            document.getElementById('u-role').outerHTML = getRoleBadge(user.role).replace('>', ' id="u-role">');
            
            document.getElementById('u-name-val').innerText = user.name;
            document.getElementById('u-email').innerText = user.email;
            document.getElementById('u-phone').innerText = user.phone;
            document.getElementById('u-role-val').innerText = user.role;
            document.getElementById('u-address').innerText = user.address;
            document.getElementById('u-date').innerText = user.date;
            
            document.getElementById('u-orders-count').innerText = user.orders;
            document.getElementById('u-orders-total').innerText = formatCurrency(user.totalSpent);
            document.getElementById('u-reviews-count').innerText = user.reviews;
            document.getElementById('u-rating').innerText = user.rating;
        }
        
        if (detailsPanel) detailsPanel.classList.add('active');
    };

    function closePanel() {
        if (detailsPanel) detailsPanel.classList.remove('active');
    }

    if(btnClose) btnClose.addEventListener('click', closePanel);
});
