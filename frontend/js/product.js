import { GET_PRODUCT_DETAIL_URL, BASE_URL } from "./configs.js"; 

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('product-detail.html')) {
        const productId = parseInt(getQueryParam('id')) || 0;
        let productData = null;

        try {
            const response = await fetch(`${GET_PRODUCT_DETAIL_URL}?id=${productId}`);
            const result = await response.json();

            if (result.success) {
                productData = result.data.product;
                const images = result.data.images;
                const reviews = result.data.reviews;

                document.querySelector('.product-info h1').textContent = `Tên Sản Phẩm: ${productData.name}`;
                document.querySelector('.product-info .price').textContent = `Giá: ${formatPrice(productData.price)}`;
                document.title = productData.name;

                if (images && images.length > 0) {
                    const mainImg = document.querySelector('.product-gallery > img');
                    mainImg.src = images[0].image_url; 
                    
                    let thumbHtml = '';
                    images.forEach(img => {
                        thumbHtml += `<img src="${img.image_url}" alt="Thumbnail" onerror="this.src='../assets/images/shopping.webp'">`;
                    });
                    const thumbContainer = document.querySelector('.thumbnails');
                    thumbContainer.innerHTML = thumbHtml;

                    thumbContainer.querySelectorAll('img').forEach(thumb => {
                        thumb.addEventListener('click', function() {
                            mainImg.src = this.src;
                        });
                    });
                }

                const reviewList = document.querySelector('.product-reviews ul');
                if (reviews && reviews.length > 0) {
                    let reviewHtml = '';
                    reviews.forEach(rev => {
                        reviewHtml += `<li><strong>${rev.full_name}:</strong> ${rev.comment} (${rev.rating} sao)</li>`;
                    });
                    reviewList.innerHTML = reviewHtml;
                } else {
                    reviewList.innerHTML = '<li style="list-style: none;">Chưa có đánh giá nào cho sản phẩm này.</li>';
                }

            } else {
                alert(result.message);
                window.location.href = 'products.html'; 
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            alert("Lỗi kết nối đến máy chủ!");
        }

        const addToCartBtn = document.querySelector('.product-info form button');
        const quantityInput = document.getElementById('quantity');

        if (addToCartBtn && productData) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                    window.location.href = 'login.html';
                    return;
                }

                const qty = parseInt(quantityInput.value);
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingProductIndex = cart.findIndex(item => item.product_id === productData.id);

                if (existingProductIndex !== -1) {
                    cart[existingProductIndex].quantity += qty;
                } else {
                    cart.push({
                        id: Date.now(), 
                        product_id: productData.id,
                        quantity: qty
                    });
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`Đã thêm ${qty} sản phẩm "${productData.name}" vào giỏ hàng.`);
            });
        }
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    alert('Bạn cần đăng nhập để thực hiện đánh giá!');
                    window.location.href = 'login.html';
                    return;
                }

                const reviewText = document.getElementById('reviewText').value;
                const submitBtn = reviewForm.querySelector('button');
                submitBtn.innerText = 'Đang gửi...';

                try {
                    const response = await fetch(`${BASE_URL}api/reviews/add.php`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({
                            product_id: productId,
                            comment: reviewText
                        })
                    });

                    const result = await response.json();
                    alert(result.message);

                    if (result.success) {
                        location.reload(); 
                    }
                } catch (error) {
                    console.error("Lỗi gửi đánh giá:", error);
                } finally {
                    submitBtn.innerText = 'Gửi đánh giá';
                }
            });
        }
    }
});