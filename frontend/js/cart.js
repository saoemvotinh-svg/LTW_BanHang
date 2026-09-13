// API
// const CART_API = "http://127.0.0.1:8080/LTW_BanHang/backend/api/cart";
import { CART_GET_URL, CART_ADD_URL, CART_UPDATE_URL, CART_REMOVE_URL, ORDER_CREATE_URL } from './configs.js';
// Data
let cart =[];

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
}

function getToken() {
    return localStorage.getItem("auth_token");
}
function getAuthHeaders() {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}
// lấy giỏ hàng từ database 
async function loadCart() {
    try {
        const response = await fetch(
            `${CART_GET_URL}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
                credentials: "include"
            }
        );
        const data = await response.json();
        if (!response.ok) {
            alert(data.message || "Không thể lấy giỏ hàng");
            return;
        }
        if (data.success) {
            cart = data.items || [];
            renderCart();
        }
    } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
        alert("Không thể kết nối đến máy chủ");
    }
}
// RENDER
function renderCart() {
    const cartList = document.getElementById("cart-list");

    cartList.innerHTML = "";
    if (cart.length === 0) {
        cartList.innerHTML = `
            <p class="empty-cart">
                Giỏ hàng đang trống.
            </p>
        `;
        updateCartTotal();
        return;
    }
    cart.forEach(cartItem => {
        const itemTotal = Number(cartItem.price) * Number(cartItem.quantity);
        cartList.innerHTML += `
            <div class="cart-item">

                <div class="cart-product">
                    <img src="${cartItem.image_url || ""}" alt="${cartItem.name}">
                    <div class="cart-product-info">
                        <h3>${cartItem.name}</h3>
                        <p> ${cartItem.category_name || ""} </p>
                    </div>
                </div>

                <div class="cart-price">
                    <span> ${formatPrice(cartItem.price)} </span>
                </div>

                <div class="cart-quantity">
                    <input type="number" value="${cartItem.quantity}" min="1" max="${cartItem.stock}" data-id="${cartItem.id}">
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

function updateCartTotal() {
    let subtotal = 0;
    cart.forEach(cartItem => {
        subtotal += Number(cartItem.price) * Number(cartItem.quantity);
    });
    const subtotalElement = document.getElementById("cart-subtotal");
    const totalElement = document.getElementById("cart-total");
    subtotalElement.textContent = formatPrice(subtotal);
    totalElement.textContent = formatPrice(subtotal);
}
// cập nhật số lượng
function handleQuantityChange() {
    const quantityInputs = document.querySelectorAll(".cart-quantity input");
    quantityInputs.forEach(input => {
        input.addEventListener("change", async function () {
            const cartItemId = Number(this.dataset.id);
            let quantity = Number(this.value);

            if (quantity < 1 || isNaN(quantity)) {
                alert("Số lượng không hợp lệ");
                renderCart();
                return;
            }
            try{
                const response = await fetch(
                    `${CART_ADD_URL}`,
                    {
                        method: "PUT",
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            cart_item_id: cartItemId,
                            quantity: quantity
                        })
                    }
                );
                const data = await response.json();
                if (!response.ok || !data.success) {
                    alert(data.message || "Không thể cập nhật số lượng");
                    await loadCart();
                    return;
                }
                await loadCart();
            } catch (error) {
                console.error("Lỗi cập nhật:", error);
                alert("Không thể kết nối đến máy chủ");
            }
        });
    });
}
// xóa sản phẩm
function handleRemoveCartItem() {
    const removeButtons = document.querySelectorAll(".remove-btn");

    removeButtons.forEach(button => {
        button.addEventListener("click", async function () {
            const cartItemId = Number(this.dataset.id);
            const confirmRemove = confirm(
                "Bạn có chắc muốn xóa sản phẩm này?"
            );
            if (!confirmRemove) {
                return;
            }
            try {
                const response = await fetch(
                    `${CART_REMOVE_URL}`,
                    {
                        method: "DELETE",
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            cart_item_id: cartItemId
                        })
                    }
                );
                const data = await response.json();
                console.log("Kết quả API xóa:", data);
                if (!response.ok || !data.success) {
                    alert(data.message || "Không thể xóa sản phẩm");
                    return;
                }
                alert("Đã xóa sản phẩm khỏi giỏ hàng");
                await loadCart();
            } catch (error) {
                console.error("Lỗi xóa sản phẩm:", error);
                alert("Không thể kết nối đến máy chủ");
            }
        });
    });
}
// xóa tất cả
function handleClearCart() {
    const clearCartButton = document.getElementById("clear-cart-btn");
    if (!clearCartButton) {
        return;
    }
    clearCartButton.onclick = async function () {
        if (cart.length === 0) {
            return;
        }
        const confirmClear = confirm("Bạn có chắc muốn xóa tất cả sản phẩm?");
        if (!confirmClear) {
            return;
        }
        try {
            for (const cartItem of cart) {
                await fetch(
                    `${CART_REMOVE_URL}`,
                    {
                        method: "DELETE",
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            cart_item_id: cartItem.id
                        })
                    }
                );
            }
            await loadCart();
        } catch (error) {
            console.error("Lỗi xóa tất cả:", error);
            alert("Không thể kết nối đến máy chủ");

        }
    };
}

// FORM ĐẶT HÀNG
function handleOrder() {
    const orderForm = document.querySelector(".order-form");
    if (!orderForm) {
        return;
    }
    orderForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const token = getToken();
        if (!token) {
            alert("Vui lòng đăng nhập trước khi đặt hàng");
            return;
        }
        const fullname = document
            .getElementById("fullname")
            .value
            .trim();
        const phone = document
            .getElementById("phone")
            .value
            .trim();
        const address = document
            .getElementById("address")
            .value
            .trim();

        if (fullname === "") {
            alert("Vui lòng nhập họ và tên");
            return;
        }
        if (phone === "") {
            alert("Vui lòng nhập số điện thoại");
            return;
        }
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        if (!phoneRegex.test(phone)) {
            alert("Số điện thoại không hợp lệ");
            return;
        }
        if (address === "") {
            alert("Vui lòng nhập địa chỉ nhận hàng");
            return;
        }
        if (cart.length === 0) {
            alert("Giỏ hàng đang trống");
            return;
        }
        const confirmOrder = confirm(
            "Bạn có chắc muốn đặt hàng với tổng tiền " +
            document.getElementById("cart-total").textContent +
            " không?"
        );
        if (!confirmOrder) {
            return;
        }
        // Dữ liệu gửi lên backend
        const orderData = {
            fullname: fullname,
            phone: phone,
            address: address
        };
        try {
            const response = await fetch(
                `${ORDER_CREATE_URL}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    credentials: "include",
                    body: JSON.stringify(orderData)
                }
            );

            const data = await response.json();
            console.log("Kết quả API đặt hàng:", data);
            if (!response.ok || !data.success) {
                alert(data.message || "Không thể đặt hàng");
                return;
            }
            alert("Đặt hàng thành công!");
            window.location.href = "orders.html";
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            alert("Không thể kết nối đến máy chủ");
        }
    });
}

loadCart()
handleOrder();

