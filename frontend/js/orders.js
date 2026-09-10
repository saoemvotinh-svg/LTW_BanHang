document.addEventListener("DOMContentLoaded", function(){
    const OrdersContainer = document.getElementById("orders_container");
    // ẩn để test giao diện orders
    // const rawUser = localStorage.getItem("auth_user");
    // if(!rawUser){
    //     window.location.href = "login.html";
    //     return;
    // }
    // let currentUser;
    // try{
    //     currentUser = JSON.parse(rawUser);
    // }
    // catch(error){
    //     localStorage.removeItem("auth_user");
    //     window.location.href = "login.html";
    //     return;
    // } 
    const userId = currentUser.user_id || currentUser.id;
    if(!userId){
        OrdersContainer.innerHTML = `
            <p class="orders_message">
                Không tìm thấy thông tin người dùng.
            </p>
        `;
        return;
    }
    console.log("User ID:", userId);
    fetch("../../api/orders/my_orders.php?user_id=" + userId)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            console.log("Dữ liệu đơn hàng:", data);
            let orders = data;
            if(data.orders){
                orders = data.orders;
            }
            if(!Array.isArray(orders)){
                OrdersContainer.innerHTML = `
                    <p class="orders_message">
                        Không thể lấy danh sách đơn hàng.
                    </p>
                `;
                return;
            }
            if(orders.length === 0){
                OrdersContainer.innerHTML = `
                    <p class="orders_message">
                        Bạn chưa có đơn hàng nào.
                    </p>
                `;
                return;
            }
            let html = "";
            orders.forEach(function(order){
                let orderCode = order.order_code || order.code || order.id;
                let orderDate = order.created_at || order.order_date || order.date;
                let total = order.total_amount || order.total || 0;
                let status = order.status || "Chưa xác định";
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
                                 ${orderDate || "Chưa có"}
                            </p>
                            </div>
                            <div class="order_item">
                                <p class="order_label">
                                    Tổng tiền
                                </p>
                                <p class="order_value">
                                    ${Number(total).toLocaleString("vi-VN")} đ
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
                    </div>
                `;
            });
            OrdersContainer.innerHTML = html;
        })
        .catch(function(error){
            console.log("Lỗi khi lấy đơn hàng:", error);
            OrdersContainer.innerHTML = `
                <p class="orders_message">
                    Không thể tải danh sách đơn hàng.
                </p>
            `;
        });
    const rightHeader = document.querySelector(".right_header");
    if(rightHeader){
        let fullname = currentUser.fullname ||
                       currentUser.email ||
                       currentUser.username ||
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
                localStorage.clear();
                window.location.href = "login.html";
            });
        }
    }
});