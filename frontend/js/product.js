
import { GET_PRODUCT_DETAIL_URL, CART_ADD_URL, BASE_URL } from "./configs.js";
import { showToast } from "./ui-helpers.js";

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
                document.querySelector('.product-description p').innerHTML = productData.description ? productData.description.replace(/\n/g, '<br>') : 'Chưa có mô tả cho sản phẩm này.';
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
                showToast(result.message, 'error');
                setTimeout(() => window.location.href = 'products.html', 1500); 
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            showToast("Lỗi kết nối đến máy chủ!", 'error');
        }

        // Xử lý sự kiện Thêm vào giỏ hàng
        const addToCartBtn = document.querySelector('.order-btn');
        const quantityInput = document.getElementById('quantity');
        
        const minusBtn = document.querySelector('.minus-btn');
        const plusBtn = document.querySelector('.plus-btn');

        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                let current = parseInt(quantityInput.value);
                if (!isNaN(current) && current > 1) {
                    quantityInput.value = current - 1;
                }
            });
            plusBtn.addEventListener('click', () => {
                let current = parseInt(quantityInput.value);
                if (!isNaN(current)) {
                    quantityInput.value = current + 1;
                }
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                if (!productData) {
                    showToast("Dữ liệu sản phẩm chưa tải xong, vui lòng thử lại!", 'warning');
                    return;
                }

                // Kiểm tra đăng nhập
                const authUser = localStorage.getItem("auth_user");
                if (!authUser) {
                    showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", 'warning');
                    return;
                }
                
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    showToast("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.", 'warning');
                    setTimeout(() => window.location.href = "login.html", 1500);
                    return;
                }

                const qty = parseInt(quantityInput.value);
                if (isNaN(qty) || qty < 1) {
                    showToast("Số lượng không hợp lệ.", 'warning');
                    return;
                }

                addToCartBtn.disabled = true;
                const originalText = addToCartBtn.innerText;
                addToCartBtn.innerText = 'Đang thêm...';

                try {
                    const response = await fetch(
                        CART_ADD_URL,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                product_id: productData.id,
                                quantity: qty
                            })
                        }
                    );
                    const result = await response.json();
                    if (result.success) {
                        showToast(`Đã thêm ${qty} sản phẩm "${productData.name}" vào giỏ hàng.`, 'success');
                    } else {
                        showToast(result.message || "Không thể thêm sản phẩm vào giỏ hàng.", 'error');
                    }
                } catch (error) {
                    console.error("Lỗi thêm vào giỏ:", error);
                    showToast("Không thể kết nối đến máy chủ.", 'error');
                } finally {
                    addToCartBtn.disabled = false;
                    addToCartBtn.innerText = originalText;
                }
            });
        }

        // Xử lý sự kiện Gửi đánh giá
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    showToast('Bạn cần đăng nhập để thực hiện đánh giá!', 'warning');
                    setTimeout(() => window.location.href = 'login.html', 1500);
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

                    if (result.success) {
                        showToast(result.message, 'success');
                        setTimeout(() => location.reload(), 1000); 
                    } else {
                        showToast(result.message, 'error');
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