import { ORDER_MY_ORDERS_URL } from "./configs.js";
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
        window.location.href = "login.html";
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
            if(status === "pending"){
                status = "Chờ xác nhận";
            }
            else if(status === "confirmed"){
                status = "Đã xác nhận";
            }
            else if(status === "processing"){
                status = "Đang xử lý";
            }
            else if(status === "shipping"){
                status = "Đang giao";
            }
            else if(status === "delivered"){
                status = "Đã giao";
            }
            else if(status === "cancelled"){
                status = "Đã hủy";
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
                            <p class="order_status">
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
                </div>
            `;
        });
        OrdersContainer.innerHTML = html;
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
});