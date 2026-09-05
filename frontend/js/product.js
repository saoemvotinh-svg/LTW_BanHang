const mockProducts = [
    { id: 1, name: "Quần áo mùa hè cute", price: 90000, category: "Quần áo", img: "../assets/images/demo1.jpg", isNew: true },
    { id: 2, name: "Váy xòe trái tim", price: 70000, category: "Váy", img: "../assets/images/demo2.jpg", isNew: false },
    { id: 3, name: "Khủng long nhỏ", price: 80000, category: "Quần áo", img: "../assets/images/khung-long.jpg", isNew: true },
    { id: 4, name: "Đồ bộ cho bé", price: 200000, category: "Quần áo", img: "../assets/images/do-bo.jpg", isNew: false },
    { id: 5, name: "Váy công chúa", price: 150000, category: "Váy", img: "../assets/images/vay-cong-chua.jpg", isNew: true }
];

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('product-detail.html')) {

        const id = parseInt(getQueryParam('id')) || 1; 
        const product = mockProducts.find(p => p.id === id);
        
        if (product) {
            document.querySelector('.product-info h1').textContent = `Tên Sản Phẩm: ${product.name}`;
            document.querySelector('.product-info .price').textContent = `Giá: ${formatPrice(product.price)}`;
            document.querySelector('.product-gallery > img').src = product.img;
            document.title = product.name; 
        }

        const mainImage = document.querySelector('.product-gallery > img');
        const thumbnails = document.querySelectorAll('.thumbnails img');
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainImage.src = this.src; 
            });
        });
        const addToCartBtn = document.querySelector('.product-info form button');
        const quantityInput = document.getElementById('quantity');
        
        if (addToCartBtn && product) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                const qty = parseInt(quantityInput.value);
                
                let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
                
                const existingProductIndex = cart.findIndex(item => item.id === product.id);
                
                if (existingProductIndex !== -1) {
                    cart[existingProductIndex].quantity += qty;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        img: product.img,
                        category: product.category,
                        quantity: qty
                    });
                }
                localStorage.setItem('cartItems', JSON.stringify(cart));
                alert(`Tuyệt vời! Đã thêm ${qty} sản phẩm "${product.name}" vào giỏ hàng.`);
            });
        }
        const reviewForm = document.getElementById('reviewForm');
        const reviewList = document.querySelector('.product-reviews ul');

        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();  
                const reviewText = document.getElementById('reviewText').value;
                const newReview = document.createElement('li');
                newReview.innerHTML = `<strong>Khách hàng:</strong> ${reviewText} (5 sao)`;
                
                reviewList.appendChild(newReview);
                reviewForm.reset();
            });
        }
    }
});
