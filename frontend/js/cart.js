// API
import { CART_GET_URL, CART_ADD_URL, CART_UPDATE_URL, CART_REMOVE_URL, ORDER_CREATE_URL } from './configs.js';
import { showToast, showModal, showInlineError, clearInlineError, generateEmptyState } from './ui-helpers.js';

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
            showToast(data.message || "Không thể lấy giỏ hàng", "error");
            return;
        }
        if (data.success) {
            cart = data.items || [];
            renderCart();
        }
    } catch (error) {
        console.error("Lỗi lấy giỏ hàng:", error);
        showToast("Không thể kết nối đến máy chủ", "error");
    }
}

// RENDER
function renderCart() {
    const cartList = document.getElementById("cart-list");

    cartList.innerHTML = "";
    if (cart.length === 0) {
        cartList.innerHTML = generateEmptyState("Giỏ hàng của bạn đang trống. Hãy chọn thêm sản phẩm nhé!", "fa-bag-shopping");
        updateCartTotal();
        return;
    }
    cart.forEach(cartItem => {
        const itemTotal = Number(cartItem.price) * Number(cartItem.quantity);
        cartList.innerHTML += `
            <div class="cart-item">
                <div class="col-checkbox">
                    <input type="checkbox" class="item-checkbox" data-id="${cartItem.id}" style="transform: scale(1.2); cursor: pointer;">
                </div>
                <div class="col-product cart-product">
                    <img src="${cartItem.image_url || ""}" alt="${cartItem.name}">
                    <div class="cart-product-info">
                        <h3>${cartItem.name}</h3>
                        <p> ${cartItem.category_name || ""} </p>
                    </div>
                </div>

                <div class="col-price">
                    <span> ${formatPrice(cartItem.price)} </span>
                </div>

                <div class="col-quantity">
                    <div class="cart-quantity" style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; max-width: 90px; margin: 0 auto;">
                        <button type="button" class="qty-btn minus-btn" data-id="${cartItem.id}" style="width: 25px; height: 32px; background: #f8f9fa; border: none; cursor: pointer; font-size: 14px; color: #555;">-</button>
                        <input type="number" value="${cartItem.quantity}" min="1" max="${cartItem.stock}" data-id="${cartItem.id}" style="width: 40px; height: 32px; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; text-align: center; font-size: 14px; padding: 0;">
                        <button type="button" class="qty-btn plus-btn" data-id="${cartItem.id}" style="width: 25px; height: 32px; background: #f8f9fa; border: none; cursor: pointer; font-size: 14px; color: #555;">+</button>
                    </div>
                </div>

                <div class="col-total">
                    <span>${formatPrice(itemTotal)}</span>
                </div>            

                <div class="col-action">
                    <button type="button" class="remove-btn" data-id="${cartItem.id}">
                        Xóa
                    </button>
                </div>
            </div>
        `;
    });
    updateCartTotal();
    handleQuantityChange();
    handleRemoveCartItem();
    handleCheckboxes();

    // Update cart count
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
}

function updateCartTotal() {
    let subtotal = 0;
    
    // Chỉ tính tổng các sản phẩm được chọn
    const checkedBoxes = document.querySelectorAll(".item-checkbox:checked");
    const checkedIds = Array.from(checkedBoxes).map(cb => Number(cb.dataset.id));
    
    cart.forEach(cartItem => {
        if (checkedIds.includes(Number(cartItem.id))) {
            subtotal += Number(cartItem.price) * Number(cartItem.quantity);
        }
    });
    
    const totalElement = document.getElementById("cart-total");
    if (totalElement) {
        totalElement.textContent = formatPrice(subtotal);
    }
}

// cập nhật số lượng
function handleQuantityChange() {
    const quantityContainers = document.querySelectorAll(".cart-quantity");
    
    quantityContainers.forEach(container => {
        const input = container.querySelector('input');
        const minusBtn = container.querySelector('.minus-btn');
        const plusBtn = container.querySelector('.plus-btn');
        const cartItemId = Number(input.dataset.id);

        const updateQuantity = async (quantity) => {
            if (quantity < 1 || isNaN(quantity)) {
                showToast("Số lượng không hợp lệ", "warning");
                renderCart();
                return;
            }
            
            input.disabled = true;
            if(minusBtn) minusBtn.disabled = true;
            if(plusBtn) plusBtn.disabled = true;

            try{
                const response = await fetch(
                    `${CART_UPDATE_URL}`,
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
                    showToast(data.message || "Không thể cập nhật số lượng", "error");
                    await loadCart();
                    return;
                }
                await loadCart();
            } catch (error) {
                console.error("Lỗi cập nhật:", error);
                showToast("Không thể kết nối đến máy chủ", "error");
            } finally {
                input.disabled = false;
                if(minusBtn) minusBtn.disabled = false;
                if(plusBtn) plusBtn.disabled = false;
            }
        };

        if (input) {
            input.addEventListener("change", function () {
                updateQuantity(Number(this.value));
            });
        }
        
        if (minusBtn) {
            minusBtn.addEventListener("click", function () {
                let current = Number(input.value);
                if (current > 1) {
                    updateQuantity(current - 1);
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener("click", function () {
                let current = Number(input.value);
                updateQuantity(current + 1);
            });
        }
    });
}

// xóa sản phẩm
function handleRemoveCartItem() {
    const removeButtons = document.querySelectorAll(".remove-btn");

    removeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const cartItemId = Number(this.dataset.id);
            
            showModal(
                "Xóa sản phẩm",
                "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
                async () => {
                    const icon = this.querySelector('i');
                    if (icon) icon.className = "fa-solid fa-spinner fa-spin";
                    this.disabled = true;

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
                            showToast(data.message || "Không thể xóa sản phẩm", "error");
                            this.disabled = false;
                            if (icon) icon.className = "fa-solid fa-trash";
                            return;
                        }
                        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
                        await loadCart();
                    } catch (error) {
                        console.error("Lỗi xóa sản phẩm:", error);
                        showToast("Không thể kết nối đến máy chủ", "error");
                        this.disabled = false;
                        if (icon) icon.className = "fa-solid fa-trash";
                    }
                }
            );
        });
    });
}

let _staticCartListenersAdded = false;

// Logic cho checkbox và xóa các sản phẩm đã chọn
function handleCheckboxes() {
    const checkAllHeader = document.getElementById("check-all-header");
    const itemCheckboxes = document.querySelectorAll(".item-checkbox");
    const deleteSelectedBtn = document.getElementById("delete-selected-btn");

    if (!itemCheckboxes.length) {
        if (checkAllHeader) checkAllHeader.checked = false;
        if (deleteSelectedBtn) {
            deleteSelectedBtn.style.color = "#999";
            deleteSelectedBtn.style.pointerEvents = "none";
            deleteSelectedBtn.textContent = "Xóa các sản phẩm đã chọn";
        }
        return;
    }

    // Luôn gọi updateCheckState khi danh sách load xong
    updateCheckState();

    function updateCheckState() {
        const checkedBoxes = document.querySelectorAll(".item-checkbox:checked");
        const count = checkedBoxes.length;
        const total = document.querySelectorAll(".item-checkbox").length;
        const isAllChecked = count === total && count > 0;
        
        if (checkAllHeader) checkAllHeader.checked = isAllChecked;

        if (deleteSelectedBtn) {
            if (count > 0) {
                deleteSelectedBtn.style.color = "#ee4d2d";
                deleteSelectedBtn.style.pointerEvents = "auto";
                deleteSelectedBtn.textContent = `Xóa các sản phẩm đã chọn (${count})`;
            } else {
                deleteSelectedBtn.style.color = "#999";
                deleteSelectedBtn.style.pointerEvents = "none";
                deleteSelectedBtn.textContent = `Xóa các sản phẩm đã chọn`;
            }
        }
        
        // Cập nhật lại tổng tiền mỗi khi tick chọn/bỏ chọn
        updateCartTotal();
    }

    // Attach listeners to newly rendered checkboxes
    itemCheckboxes.forEach(cb => {
        cb.addEventListener("change", updateCheckState);
    });

    if (!_staticCartListenersAdded) {
        if (checkAllHeader) {
            checkAllHeader.addEventListener("change", function () {
                const currentItemCheckboxes = document.querySelectorAll(".item-checkbox");
                currentItemCheckboxes.forEach(cb => cb.checked = this.checked);
                updateCheckState();
            });
        }

        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener("click", function () {
                const checkedBoxes = document.querySelectorAll(".item-checkbox:checked");
                if (checkedBoxes.length === 0) return;
                
                showModal(
                    "Xóa sản phẩm đã chọn",
                    `Bạn có chắc muốn xóa ${checkedBoxes.length} sản phẩm đã chọn khỏi giỏ hàng?`,
                    async () => {
                        try {
                            const deletePromises = Array.from(checkedBoxes).map(cb => {
                                const id = Number(cb.dataset.id);
                                return fetch(`${CART_REMOVE_URL}`, {
                                    method: "DELETE",
                                    headers: {
                                        ...getAuthHeaders(),
                                        "Content-Type": "application/json"
                                    },
                                    credentials: "include",
                                    body: JSON.stringify({
                                        cart_item_id: id
                                    })
                                }).then(res => res.json());
                            });
                            
                            const results = await Promise.all(deletePromises);
                            const hasError = results.some(res => !res.success);
                            
                            if (hasError) {
                                showToast("Có lỗi xảy ra khi xóa một số sản phẩm", "warning");
                            } else {
                                showToast(`Đã xóa ${checkedBoxes.length} sản phẩm`, "success");
                            }
                            await loadCart();
                            
                            if (checkAllHeader) checkAllHeader.checked = false;
                            updateCheckState();
                            
                        } catch (error) {
                            console.error("Lỗi xóa các sản phẩm:", error);
                            showToast("Lỗi kết nối", "error");
                        }
                    }
                );
            });
        }
        _staticCartListenersAdded = true;
    }
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
            showToast("Vui lòng đăng nhập trước khi đặt hàng", "warning");
            setTimeout(() => window.location.href = "login.html", 1500);
            return;
        }
        
        const fullnameInput = document.getElementById("fullname");
        const phoneInput = document.getElementById("phone");
        const addressInput = document.getElementById("address");

        const fullname = fullnameInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();

        let hasError = false;

        if (fullname === "") {
            showInlineError(fullnameInput, "Vui lòng nhập họ và tên");
            hasError = true;
        } else {
            clearInlineError(fullnameInput);
        }

        if (phone === "") {
            showInlineError(phoneInput, "Vui lòng nhập số điện thoại");
            hasError = true;
        } else {
            const phoneRegex = /^(0|\+84)[0-9]{9}$/;
            if (!phoneRegex.test(phone)) {
                showInlineError(phoneInput, "Số điện thoại không hợp lệ");
                hasError = true;
            } else {
                clearInlineError(phoneInput);
            }
        }

        if (address === "") {
            showInlineError(addressInput, "Vui lòng nhập địa chỉ nhận hàng");
            hasError = true;
        } else {
            clearInlineError(addressInput);
        }

        const checkedBoxes = document.querySelectorAll(".item-checkbox:checked");
        const selectedItemIds = Array.from(checkedBoxes).map(cb => Number(cb.dataset.id));
        
        if (selectedItemIds.length === 0) {
            showToast("Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng", "warning");
            return;
        }

        if (hasError) return;

        showModal(
            "Xác nhận đặt hàng",
            "Bạn có chắc muốn đặt hàng với tổng tiền " + document.getElementById("cart-total").textContent + " không?",
            async () => {
                const submitBtns = document.querySelectorAll('.order-btn');
                
                // Lưu lại nội dung gốc của từng nút
                const originalContents = [];
                submitBtns.forEach((btn, index) => {
                    originalContents[index] = btn.innerHTML;
                    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...`;
                    btn.disabled = true;
                });

                // Dữ liệu gửi lên backend
                const orderData = {
                    fullname: fullname,
                    phone: phone,
                    address: address,
                    selected_cart_item_ids: selectedItemIds
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
                        showToast(data.message || "Không thể đặt hàng", "error");
                        submitBtns.forEach((btn, index) => {
                            btn.innerHTML = originalContents[index];
                            btn.disabled = false;
                        });
                        return;
                    }
                    showToast("Đặt hàng thành công!", "success");
                    setTimeout(() => window.location.href = "orders.html", 1500);
                } catch (error) {
                    console.error("Lỗi đặt hàng:", error);
                    showToast("Không thể kết nối đến máy chủ", "error");
                    submitBtns.forEach((btn, index) => {
                        btn.innerHTML = originalContents[index];
                        btn.disabled = false;
                    });
                }
            },
            "Đặt hàng",
            "Hủy",
            false
        );
    });
}

loadCart();
handleOrder();
