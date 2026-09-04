// Data
const testCategories = [
    {
        id: 1,
        name: "Áo quần trẻ em",
        description: "Các loại áo quần dành cho trẻ em"
    },
    {
        id: 2,
        name: "Váy trẻ em",
        description: "Các loại váy dành cho trẻ em"
    }
];

const testProducts = [
    {
        id: 1,
        category_id: 1,
        name: "Quần áo mùa hè cute",
        price: 90000,
        stock: 20,
        description: "Bộ quần áo mùa hè dễ thương dành cho bé",
        created_at: "2026-08-20"
    },
    {
        id: 2,
        category_id: 2,
        name: "Váy xòe trái tim",
        price: 70000,
        stock: 15,
        description: "Váy xòe họa tiết trái tim dành cho bé",
        created_at: "2026-08-20"
    }
];

const testProductImages = [
    {
        id: 1,
        product_id: 1,
        image_url: "../assets/images/shopping.webp",
        is_primary: true
    },
    {
        id: 2,
        product_id: 2,
        image_url: "../assets/images/shopping (1).webp",
        is_primary: true
    }
];

const testCart = {
    id: 1,
    user_id: 1,
    created_at: "2026-08-20",
    updated_at: "2026-08-20"
};

const testCartItems = [
    {
        id: 1,
        cart_id: 1,
        product_id: 1,
        quantity: 1
    },
    {
        id: 2,
        cart_id: 1,
        product_id: 2,
        quantity: 1
    }
];

const CART_KEY = "cart";

if (!localStorage.getItem(CART_KEY)) {
    localStorage.setItem(CART_KEY, JSON.stringify(testCartItems));
}

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

function formatPrice(price){
    return price.toLocaleString("vi-VN") + " VNĐ";
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


// RENDER
function renderCart(){
    const cartList = document.getElementById("cart-list");

    cartList.innerHTML = "";
    if(cart.length === 0){
        cartList.innerHTML =  `
            <p class="empty-cart">
                Giỏ hàng đang trống.
            </p>
        `;
        updateCartTotal();
        return;
    }
    cart.forEach(cartItem => {
        const product = testProducts.find(item => item.id === cartItem.product_id);
        if (!product) { return;}
        const category = testCategories.find(item => item.id === product.category_id);
        const productImage = testProductImages.find(image =>
            image.product_id === product.id && image.is_primary === true);
        const itemTotal = product.price * cartItem.quantity;
        cartList.innerHTML += `
            <div class="cart-item">

                <div class="cart-product">
                    <img src="${productImage?.image_url || ""}" alt="${product.name}">
                    <div class="cart-product-info">
                        <h3>${product.name}</h3>
                        <p> ${category ? category.name : ""} </p>
                    </div>
                </div>

                <div class="cart-price">
                    <span> ${formatPrice(product.price)} </span>
                </div>

                <div class="cart-quantity">
                    <input type="number" value="${cartItem.quantity}" min="1" data-id="${cartItem.id}">
                </div>

                <div class="cart-total">
                    <span>${formatPrice(itemTotal)}</span>
                </div>            

                <button type="button" class="remove-btn" data-id="${cartItem.id}">
                    <i class="fa-solid fa-trash"></i>
                    Xóa
                </button>
            </div>
        `;
    });
    updateCartTotal();
    handleQuantityChange();
    handleRemoveCartItem();
    handleClearCart();
}

function updateCartTotal(){
    let subtotal = 0;
    cart.forEach(cartItem => {
        const product = testProducts.find(
            item => item.id === cartItem.product_id
        );
        if (product) {
            subtotal += product.price * cartItem.quantity;
        }
    });
    const subtotalElement = document.getElementById("cart-subtotal");
    const totalElement = document.getElementById("cart-total");
    subtotalElement.textContent = formatPrice(subtotal);
    totalElement.textContent = formatPrice(subtotal);
}

function handleQuantityChange() {
    const quantityInputs = document.querySelectorAll(".cart-quantity input");
    quantityInputs.forEach(input => { input.addEventListener("change", function () {
            const cartItemId = Number(this.dataset.id);
            let quantity = Number(this.value);

            if (quantity < 1 || isNaN(quantity)) {
                quantity = 1;
            }
            // Tìm sản phẩm trong giỏ
            const cartItem = cart.find(
                item => item.id === cartItemId
            );

            if (cartItem) {
                cartItem.quantity = quantity;
                // Lưu lại localStorage
                saveCart();
                // Render lại giỏ hàng
                renderCart();
            }
        });
    });
}

function handleRemoveCartItem() {
    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const cartItemId = Number(this.dataset.id);
            cart = cart.filter(
                item => item.id !== cartItemId
            );
            saveCart();
            renderCart();
        });
    });
}

function handleClearCart() {
    const clearCartButton = document.getElementById("clear-cart-btn");
    if (!clearCartButton) {
        return;
    }
    clearCartButton.addEventListener("click", function () {
        if (cart.length === 0) {
            return;
        }
        const confirmClear = confirm("Bạn có chắc muốn xóa tất cả sản phẩm?");
        if (confirmClear) {
            cart = [];
            saveCart();
            renderCart();
        }
    });
}

// FORM ĐẶT HÀNG
function handleOrder() {
    const orderForm = document.querySelector(".order-form");
    orderForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const fullname = document.getElementById("fullname").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        
        if (fullname === "") {
            alert("Vui lòng nhập họ và tên.");
            return;
        }

        if (phone === "") {
            alert("Vui lòng nhập số điện thoại.");
            return;
        }

        // Kiểm tra số điện thoại Việt Nam
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        if (!phoneRegex.test(phone)) {
            alert("Số điện thoại không hợp lệ.");
            return;
        }

        if (address === "") {
            alert("Vui lòng nhập địa chỉ nhận hàng.");
            return;
        }

        if (cart.length === 0) {
            alert("Giỏ hàng đang trống.");
            return;
        }
        alert("Đặt hàng thành công!");

        // Xóa giỏ hàng
        cart = [];
        saveCart();
        // Render lại giỏ hàng
        renderCart();
        // Xóa thông tin form
        orderForm.reset();
    });
}

renderCart();
handleOrder();

