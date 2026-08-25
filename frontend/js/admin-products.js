document.addEventListener('DOMContentLoaded', () => {
    // === MOCK DATA ===
    const mockProducts = [
        { id: 1, name: 'Set bộ đồ chơi bé trai phong cách Hàn Quốc', slug: 'set-do-choi-be-trai', category: 'Thời trang bé trai', price: 239000, stock: 120, sold: 45, status: 'active', createdAt: '25/05/2024 10:30', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP1' },
        { id: 2, name: 'Váy công chúa bé gái thiết kế dễ thương', slug: 'vay-cong-chua-be-gai', category: 'Thời trang bé gái', price: 199000, stock: 80, sold: 32, status: 'active', createdAt: '25/05/2024 09:15', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP2' },
        { id: 3, name: 'Giày thể thao trẻ em năng động', slug: 'giay-the-thao-tre-em', category: 'Giày dép', price: 349000, stock: 60, sold: 28, status: 'active', createdAt: '24/05/2024 16:45', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP3' },
        { id: 4, name: 'Balo học sinh chống thấm siêu nhẹ', slug: 'balo-hoc-sinh-sieu-nhe', category: 'Phụ kiện', price: 159000, stock: 45, sold: 20, status: 'active', createdAt: '24/05/2024 14:20', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP4' },
        { id: 5, name: 'Hộp đồ chơi xếp hình thông minh 100 chi tiết', slug: 'hop-do-choi-xep-hinh', category: 'Đồ chơi', price: 299000, stock: 0, sold: 56, status: 'inactive', createdAt: '23/05/2024 11:05', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP5' },
        { id: 6, name: 'Mũ vành cho bé đi nắng thời trang', slug: 'mu-vanh-cho-be', category: 'Phụ kiện', price: 89000, stock: 15, sold: 10, status: 'active', createdAt: '23/05/2024 08:30', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP6' },
        { id: 7, name: 'Áo thun bé trai in hình ngộ nghĩnh', slug: 'ao-thun-be-trai', category: 'Thời trang bé trai', price: 129000, stock: 90, sold: 18, status: 'active', createdAt: '22/05/2024 15:10', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP7' },
        { id: 8, name: 'Giày búp bê nơ xinh cho bé gái', slug: 'giay-bup-be-no', category: 'Giày dép', price: 179000, stock: 30, sold: 12, status: 'active', createdAt: '22/05/2024 10:40', img: 'https://placehold.co/100x100/e2e8f0/475569?text=SP8' }
    ];

    // === RENDER TABLE ===
    const tbody = document.getElementById('products-tbody');
    
    function formatCurrency(amount) {
        return amount.toLocaleString('vi-VN');
    }

    function renderTable() {
        if (!tbody) return;
        let html = '';
        mockProducts.forEach(product => {
            const statusClass = product.status === 'active' ? 'badge-success' : 'badge-danger';
            const statusText = product.status === 'active' ? 'Còn hàng' : 'Hết hàng';
            
            html += `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${product.img}" class="product-img" alt="${product.name}"></td>
                    <td>
                        <div class="product-name-col">
                            <strong>${product.name}</strong>
                        </div>
                    </td>
                    <td>${product.category}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>${product.stock}</td>
                    <td>${product.sold}</td>
                    <td>${product.createdAt}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon edit" onclick="openOffcanvas(${product.id})" title="Chỉnh sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn-icon delete" title="Xóa"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    renderTable();

    // === OFFCANVAS INTERACTION ===
    const overlay = document.getElementById('offcanvas-overlay');
    const offcanvas = document.getElementById('product-offcanvas');
    const btnAdd = document.getElementById('btnAddProduct');
    const btnClose = document.getElementById('btnCloseOffcanvas');
    const btnCancel = document.getElementById('btnCancelOffcanvas');
    
    // Make openOffcanvas global so inline onclick can use it
    window.openOffcanvas = function(productId = null) {
        if(productId) {
            document.querySelector('.offcanvas-header h2').innerText = 'Chỉnh sửa sản phẩm';
            // Here you would normally populate data for edit
            const product = mockProducts.find(p => p.id === productId);
            if(product) {
                document.getElementById('p-name').value = product.name;
                document.getElementById('p-price').value = product.price;
                document.getElementById('p-stock').value = product.stock;
                document.getElementById('p-category').value = product.category;
                document.getElementById('p-status').value = product.status;
            }
        } else {
            document.querySelector('.offcanvas-header h2').innerText = 'Thêm sản phẩm mới';
            // Clear form
            document.getElementById('p-name').value = '';
            document.getElementById('p-price').value = '';
            document.getElementById('p-stock').value = '';
        }
        
        overlay.classList.add('active');
        offcanvas.classList.add('active');
    };

    function closeOffcanvas() {
        overlay.classList.remove('active');
        offcanvas.classList.remove('active');
    }

    if(btnAdd) btnAdd.addEventListener('click', () => openOffcanvas());
    if(btnClose) btnClose.addEventListener('click', closeOffcanvas);
    if(btnCancel) btnCancel.addEventListener('click', closeOffcanvas);
    if(overlay) overlay.addEventListener('click', closeOffcanvas);
    
    // TABS
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            // Mock content switching since we only have one tab content defined in HTML for simplicity
            if(tabContents[index]) {
                tabContents[index].classList.add('active');
            } else {
                tabContents[0].classList.add('active');
            }
        });
    });
});
