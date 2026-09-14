import { ORDER_MY_ORDERS_URL, ORDER_CANCEL_URL } from "./configs.js";
import { showToast, showModal } from "./ui-helpers.js";
document.addEventListener("DOMContentLoaded", function(){
    const OrdersContainer = document.getElementById("orders_container");
    function getAuthHeaders(){
        const token = localStorage.getItem("auth_token");
        const headers = {
            "Content-Type": "application/json"
        };
        if(token){
            headers["Authorization"] = "Bearer " + token;
        }
        return headers;
    }
    // Kiểm tra token
    const token = localStorage.getItem("auth_token");
    const rawUser = localStorage.getItem("auth_user");
    if(!token || !rawUser){
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        OrdersContainer.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <i class="fa-solid fa-lock" style="font-size: 48px; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 15px; font-size: 20px; color: #333;">Yêu cầu đăng nhập</h3>
                <p style="margin-bottom: 20px; color: #777;">Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
                <a href="login.html" style="display: inline-block; padding: 12px 24px; background-color: var(--primary-color); color: white; border-radius: 8px; font-weight: 600;">Đăng nhập ngay</a>
            </div>
        `;
        return;
    }
    // Lấy đơn hàng
    fetch(ORDER_MY_ORDERS_URL, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders()
    })
    .then(function(response){
        if(response.status === 401){
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            window.location.href = "login.html";
            return null;
        }
        return response.json();
    })
    .then(function(data){
        if(!data){
            return;
        }
        console.log("Dữ liệu đơn hàng:", data);
        // Kiểm tra kq API
        if(!data.success){
            OrdersContainer.innerHTML = `
                <p class="orders_message">
                    ${data.message || "Không thể lấy danh sách đơn hàng."}
                </p>
            `;
            return;

        }
        const orders = data.orders || [];
        if(orders.length === 0){
            OrdersContainer.innerHTML = `
                <p class="orders_message">
                    ${data.message || "Bạn chưa có đơn hàng nào."}
                </p>
            `;
            return;
        }
        // Hiển thi danh sách khách hàng
        let html = "";
        orders.forEach(function(order){
            const orderCode = order.order_id;
            const orderDate = order.created_at || "Chưa có";
            const total = Number(order.total_amount || 0);
            let status = order.status || "Chưa xác định";
            let statusClass = "status-pending";
            if(status === "pending"){
                status = "Chờ xác nhận";
                statusClass = "status-pending";
            }
            else if(status === "confirmed"){
                status = "Đã xác nhận";
                statusClass = "status-confirmed";
            }
            else if(status === "processing"){
                status = "Đang xử lý";
                statusClass = "status-confirmed";
            }
            else if(status === "shipping"){
                status = "Đang giao";
                statusClass = "status-shipping";
            }
            else if(status === "delivered" || status === "completed"){
                status = "Đã giao";
                statusClass = "status-completed";
            }
            else if(status === "cancelled"){
                status = "Đã hủy";
                statusClass = "status-cancelled";
            }
            const items = order.items || []
            html += `
                <div class="order_card">
                    <h2>
                        Đơn hàng #${orderCode}
                    </h2>
                    <div class="order_info">
                        <div class="order_item">
                            <p class="order_label">
                                Ngày đặt
                            </p>
                            <p class="order_value">
                                ${orderDate}
                            </p>
                        </div>
                        <div class="order_item">
                            <p class="order_label">
                                Tổng tiền
                            </p>
                            <p class="order_value">
                                ${total.toLocaleString("vi-VN")} đ
                            </p>
                        </div>
                        <div class="order_item">
                            <p class="order_label">
                                Trạng thái
                            </p>
                            <p class="order_status ${statusClass}">
                                ${status}
                            </p>
                        </div>
                    </div>
                    <div class="order_products">
                        <h3>
                            Sản phẩm đã đặt
                        </h3>
            `;
            if(items.length === 0){
                html += `
                    <p class="orders_message">
                        Đơn hàng này không có sản phẩm.
                    </p>
                `;
            }
            items.forEach(function(item){
                const productName =
                    item.product_name || "Sản phẩm";
                const quantity =
                    Number(item.quantity || 0);
                const price =
                    Number(item.unit_price || 0);
                const subtotal =
                    Number(item.subtotal || 0);
                const image =
                    item.image_url || "";
                html += `
                    <div class="order_product">
                        <div class="order_product_image">
                            ${
                                image
                                ?
                                `<img src="${image}" alt="${productName}">`
                                :
                                `<span>Không có ảnh</span>`
                            }
                        </div>
                        <div class="order_product_info">
                            <p class="order_product_name">
                                ${productName}
                            </p>
                            <p>
                                Số lượng: ${quantity}
                            </p>
                            <p>
                                Đơn giá:
                                ${price.toLocaleString("vi-VN")} đ
                            </p>
                        </div>
                        <div class="order_product_total">
                            ${subtotal.toLocaleString("vi-VN")} đ
                        </div>
                    </div>
                `;
            });
            html += `
                    </div>
                    ${(order.status === 'pending' || order.status === 'processing') 
                        ? `<div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 1px dashed var(--border-color);">
                                <button class="cancel-order-btn" data-id="${orderCode}" style="background-color: #fff; color: #dc3545; border: 1px solid #dc3545; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">
                                    <i class="fa-solid fa-xmark"></i> Hủy đơn hàng này
                                </button>
                           </div>` 
                        : ''}
                </div>
            `;
        });
        OrdersContainer.innerHTML = html;

        // Attach event listeners cho các nút Hủy Đơn
        const cancelBtns = OrdersContainer.querySelectorAll(".cancel-order-btn");
        cancelBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                const orderId = this.getAttribute("data-id");
                
                showModal(
                    "Xác nhận hủy đơn",
                    `Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không? Hành động này không thể hoàn tác.`,
                    () => {
                        this.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang hủy...`;
                        this.disabled = true;
                        cancelOrder(orderId);
                    },
                    "Hủy đơn hàng",
                    "Đóng",
                    true
                );
            });
        });
    })
    .catch(function(error){
        console.error("Lỗi khi lấy đơn hàng:", error);
        OrdersContainer.innerHTML = `
            <p class="orders_message">
                Không thể tải danh sách đơn hàng.
            </p>
        `;
    });
    const rightHeader = document.querySelector(".right_header");
    if(rightHeader){
        const rawUser = localStorage.getItem("auth_user");
        let currentUser = null;
        try{
            if(rawUser){
                currentUser = JSON.parse(rawUser);
            }
        }
        catch(error){
            console.log("Không đọc được thông tin người dùng");
        }
        const fullname =
            currentUser?.full_name ||
            currentUser?.fullname ||
            currentUser?.email ||
            "Tài khoản";
        rightHeader.innerHTML = `
            <a href="profile.html">
                ${fullname}
            </a>
            <a href="#" id="logout">
                Đăng xuất
            </a>
        `;
        const logout = document.getElementById("logout");
        if(logout){
            logout.addEventListener("click", function(event){
                event.preventDefault();
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                window.location.href = "login.html";
            });
        }
    }

    // Hàm gọi API hủy đơn
    function cancelOrder(orderId) {
        fetch(ORDER_CANCEL_URL, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ order_id: orderId })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                showToast("Hủy đơn hàng thành công!", "success");
                setTimeout(() => location.reload(), 1500); 
            } else {
                showToast("Lỗi: " + (data.message || "Không thể hủy đơn hàng"), "error");
                const btn = document.querySelector(`.cancel-order-btn[data-id="${orderId}"]`);
                if(btn) {
                    btn.innerHTML = `<i class="fa-solid fa-xmark"></i> Hủy đơn hàng này`;
                    btn.disabled = false;
                }
            }
        })
        .catch(error => {
            console.error("Lỗi khi hủy đơn hàng:", error);
            showToast("Lỗi kết nối khi hủy đơn hàng", "error");
            const btn = document.querySelector(`.cancel-order-btn[data-id="${orderId}"]`);
            if(btn) {
                btn.innerHTML = `<i class="fa-solid fa-xmark"></i> Hủy đơn hàng này`;
                btn.disabled = false;
            }
        });
    }
});