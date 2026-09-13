import { GET_ALL_PRODUCTS_URL, getImageUrl } from "./configs.js";

let products = [];
let currentPage = 1;
const itemsPerPage = 8;
let searchQuery = "";
let sortType = "default";
let selectedCategory = "all";
let isCategoriesLoaded = false;

const CART_API ="http://localhost:8080/LTW_BanHang/backend/api/cart";

const rawUser = localStorage.getItem("auth_user") || localStorage.getItem("user");
const profileActions = document.querySelector(".header-actions");
// bị lỗi do index.html và products.html dùng chung css nhưng e lại muốn ẩn danh mục khi kh ở trang sản phẩm dẫn đến lỗi khi import layout.js xử lý hiện tên tk, login.. nên hàm
// bên dưới để xử lý riêng bằng js 
if (profileActions && rawUser) {
    const user = JSON.parse(rawUser);
    const displayName = user.fullname || user.email || user.username || "Tài khoản";
    profileActions.innerHTML = `
        <a href="./profile.html"><i class="fa-regular fa-user"></i> ${displayName}</a>
        <a href="#" id="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a>
        <a href="./cart.html" class="cart-btn"><i class="fa-solid fa-bag-shopping"></i> Giỏ hàng</a>
    `;
    document.getElementById("logout-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "./login.html";
    });
}
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

// function createProductCard(product) {
//     const imageUrl = getImageUrl(product.image, "../assets/images/shopping.webp");
//     const desc = product.description || "Đang cập nhật mô tả...";

//     return `
//         <div class="product-card">
//         <div class="product-sku">MÃ SẢN PHẨM: ${product.id}</div>
//         <div class="product-title">${product.category_name}</div>
//         <img class="product-image" src="${imageUrl}" alt="${product.name}" onerror="this.src='../assets/images/shopping.webp'">
//         <div class="product-desc">${product.name}</div>
//         <div class="product-price">Giá: ${formatCurrency(product.price)}</div>
//         <button class="buy-btn">Mua ngay</button>
//         </div>
//     `;
// }
function createProductCard(product) {
    const imageUrl = getImageUrl(product.image, "../assets/images/shopping.webp");
    const desc = product.description || "Đang cập nhật mô tả...";

    return `
        <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
            <div class="product-sku">MÃ SẢN PHẨM: ${product.id}</div>
            <div class="product-title">${product.category_name}</div>
            <img class="product-image" src="${imageUrl}" alt="${product.name}" onerror="this.src='../assets/images/shopping.webp'">
            <div class="product-desc">${product.name}</div>
            <div class="product-price">Giá: ${formatCurrency(product.price)}</div>
            <button class="buy-btn">Chi tiết</button>
        </div>
    `;
}


function getToken() {
    return localStorage.getItem("auth_token");
}

async function addToCart(productId, quantity = 1) {
    const authUser = localStorage.getItem("auth_user");
    if (!authUser) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        window.location.href = "./login.html";
        return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) {
        alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        window.location.href = "./login.html";
        return;
    }
    try {
        const response = await fetch(
            "http://localhost:8080/LTW_BanHang/backend/api/cart/add.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({
                    product_id: Number(productId),
                    quantity: Number(quantity)
                })
            }
        );
        const result = await response.json();
        console.log("Kết quả API thêm giỏ:", result);
        if (!response.ok || !result.success) {
            alert(
                result.message ||
                "Không thể thêm sản phẩm vào giỏ hàng."
            );
            return;
        }
        alert("Đã thêm sản phẩm vào giỏ hàng thành công.");
    } catch (error) {
        console.error("Lỗi thêm vào giỏ:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
}

function bindAddToCartButtons() {
    const addCartButtons = document.querySelectorAll(".buy-btn");
    addCartButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.getAttribute("data-id");
            console.log("Đã bấm nút thêm giỏ");
            console.log("Product ID:", productId);
            if (!productId) {
                alert("Không xác định được sản phẩm.");
                return;
            }
            button.disabled = true;
            button.textContent = "Đang thêm...";
            await addToCart(productId, 1);
            button.disabled = false;
            button.textContent = "Thêm vào giỏ hàng";
        });
    });
}


function renderCategories(categories) {
    const dropdownMenu = document.querySelector(".dropdown-menu");
    if (!dropdownMenu || !categories || isCategoriesLoaded) return;
    let html = `
        <a href="javascript:void(0)" 
        class="dropdown-item category-item ${selectedCategory === 'all' ? 'active' : ''}" 
        data-cat-id="all">
        Tất cả sản phẩm
        </a>
    `;

    html += categories.map(cat => `
        <a href="javascript:void(0)" 
        class="dropdown-item category-item ${selectedCategory == cat.id ? 'active' : ''}" 
        data-cat-id="${cat.id}">
        ${cat.name}
        </a>
    `).join("");
    dropdownMenu.innerHTML = html;

    dropdownMenu.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", (e) => {
        e.preventDefault();

        dropdownMenu.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");

        selectedCategory = item.getAttribute("data-cat-id");
        currentPage = 1; 
        fetchAndRenderProducts();
        });
    });

    isCategoriesLoaded = true;
}

async function fetchAndRenderProducts() {
    const productGrid = document.getElementById("product-grid");
    if (!productGrid) return;
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("limit", itemsPerPage);

    if (selectedCategory && selectedCategory !== "all") {
        params.append("category_id", selectedCategory);
    }

    if (searchQuery) {
        params.append("search", searchQuery);
    }

    if (sortType === "price-asc") {
        params.append("sort", "price_asc");
    } else if (sortType === "price-desc") {
        params.append("sort", "price_desc");
    }

    try {
        const response = await fetch(`${GET_ALL_PRODUCTS_URL}?${params.toString()}`);
        const result = await response.json();

        if (!result.success) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Lỗi: ${result.message}</p>`;
        return;
        }

        if (result.categories) {
        renderCategories(result.categories);
        }

        products = result.data;
        const pagination = result.pagination;

        if (!products || products.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">Không tìm thấy sản phẩm nào phù hợp.</p>`;
        } else {
        productGrid.innerHTML = products.map(p => createProductCard(p)).join("");
        bindAddToCartButtons();
        }

        renderPagination(pagination.total_pages);

    } catch (error) {
        console.error("Lỗi khi kết nối API:", error);
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Không thể tải danh sách sản phẩm.</p>`;
    }
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    if (!totalPages || totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let html = `<a href="javascript:void(0)" class="page-btn prev-btn ${currentPage === 1 ? "disabled" : ""}">&lt;</a>`;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageNumbers.push(i);
        }
    }

    let prevPage = 0;
    for (let page of pageNumbers) {
        if (prevPage !== 0 && page - prevPage > 1) {
        html += `<span class="page-dots" style="padding: 0 5px; color: #888;">...</span>`;
        }
        html += `
        <a href="javascript:void(0)" class="page-btn ${page === currentPage ? "active" : ""}" data-page="${page}">
            ${page}
        </a>
        `;
        prevPage = page;
    }

    html += `<a href="javascript:void(0)" class="page-btn next-btn ${currentPage === totalPages ? "disabled" : ""}">&gt;</a>`;
    paginationContainer.innerHTML = html;

    paginationContainer.querySelectorAll(".page-btn:not(.disabled)").forEach(btn => {
        btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (btn.classList.contains("prev-btn")) {
            if (currentPage > 1) {
            currentPage--;
            fetchAndRenderProducts();
            }
        } else if (btn.classList.contains("next-btn")) {
            if (currentPage < totalPages) {
            currentPage++;
            fetchAndRenderProducts();
            }
        } else {
            const selectedPage = Number(btn.getAttribute("data-page"));
            if (selectedPage && selectedPage !== currentPage) {
            currentPage = selectedPage;
            fetchAndRenderProducts();
            }
        }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const sortSelect = document.getElementById("sort-select");

    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("category");
    if (cat) {
        selectedCategory = cat;
    }

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            fetchAndRenderProducts();
        }, 300);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
        sortType = e.target.value;
        currentPage = 1;
        fetchAndRenderProducts();
        });
    }
    fetchAndRenderProducts();
});


function filterByCategory(categoryId) {
    selectedCategory = categoryId;
    currentPage = 1;
    fetchAndRenderProducts();
}