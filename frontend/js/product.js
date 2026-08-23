
const mockProducts = [
    { id: 1, name: "Quần áo mùa hè cute", price: 90000, category: "Quần áo", img: "../assets/images/demo1.jpg", isNew: true },
    { id: 2, name: "Váy xòe trái tim", price: 70000, category: "Váy", img: "../assets/images/demo2.jpg", isNew: false },
    { id: 3, name: "Khủng long nhỏ", price: 80000, category: "Quần áo", img: "../assets/images/demo1.jpg", isNew: true },
    { id: 4, name: "Đồ bộ lịch lãm", price: 200000, category: "Quần áo", img: "../assets/images/demo2.jpg", isNew: false },
    { id: 5, name: "Váy công chúa", price: 150000, category: "Váy", img: "../assets/images/demo1.jpg", isNew: true }
];

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
function renderProducts(productsToRender) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return; 
    if (productsToRender.length === 0) {
        productGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 50px 0;">Không tìm thấy sản phẩm nào phù hợp.</p>';
        return;
    }
    let html = '';
    productsToRender.forEach(product => {
        let badgeHtml = product.isNew ? '<span class="badge">New</span>' : '';
        html += `
            <div class="product-card">
                <div class="card-img">
                    ${badgeHtml}
                    <div class="img-placeholder">
                        <a href="product-detail.html?id=${product.id}">
                            <img src="${product.img}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <span class="category">${product.category}</span>
                    <h3 class="product-title">
                        <a href="product-detail.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="card-footer">
                        <span class="price">${formatPrice(product.price)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    productGrid.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    let currentProducts = [...mockProducts];
    if (currentPath.includes('search.html')) {
        const keyword = getQueryParam('keyword');
        if (keyword) {
            document.querySelector('h1.section-title').textContent = `Kết quả tìm kiếm cho: "${keyword}"`;
            currentProducts = currentProducts.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
        }
        renderProducts(currentProducts);
    }
    else if (currentPath.includes('category.html')) {

        document.querySelector('h1.section-title').textContent = `Danh mục: Váy`;
        currentProducts = currentProducts.filter(p => p.category === 'Váy');
        renderProducts(currentProducts);
    }

    else if (currentPath.includes('products.html')) {
        renderProducts(currentProducts);
    }
    else if (currentPath.includes('product-detail.html')) {
        const id = parseInt(getQueryParam('id')) || 1; 
        const product = mockProducts.find(p => p.id === id);
        if (product) {
            document.querySelector('.product-info h1').textContent = `Tên Sản Phẩm: ${product.name}`;
            document.querySelector('.product-info .price').textContent = `Giá: ${formatPrice(product.price)}`;
            document.querySelector('.product-gallery > img').src = product.img;
            document.title = product.name; 
        }
    }
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            let sortedProducts = [...currentProducts]; /
            if (sortValue === 'price_asc') {
                sortedProducts.sort((a, b) => a.price - b.price); 
            } else if (sortValue === 'price_desc') {
                sortedProducts.sort((a, b) => b.price - a.price);
            }
            renderProducts(sortedProducts);
        });
    }
});