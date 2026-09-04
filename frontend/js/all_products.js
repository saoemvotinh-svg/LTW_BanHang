const mockProducts = [
    { id: 1, category_id: 1, name: "Quần áo mùa hè cute", price: 90000, stock: 50, image_url: "../assets/images/shopping.webp", description: "Quần short cotton thoáng mát cho bé.", rating: 5.0 },
    { id: 2, category_id: 2, name: "Váy xòe trái tim", price: 70000, stock: 35, image_url: "../assets/images/shopping (1).webp", description: "Thiết kế xinh xắn, họa tiết trái tim đáng yêu.", rating: 4.8 },
    { id: 3, category_id: 1, name: "Khủng long nhỏ", price: 80000, stock: 20, image_url: "../assets/images/shopping (2).webp", description: "Bộ cộc tay in hình khủng long ngộ nghĩnh.", rating: 4.5 },
    { id: 4, category_id: 1, name: "Hươu cao cổ cute", price: 90000, stock: 15, image_url: "../assets/images/shopping (3).webp", description: "Set đồ thoáng khí mặc nhà hoặc đi dạo phố.", rating: 5.0 },
    { id: 5, category_id: 1, name: "Đồ bộ lịch lãm", price: 200000, stock: 40, image_url: "../assets/images/hot1.avif", description: "Phong cách bảnh bao dự tiệc cho bé trai.", rating: 5.0 },
    { id: 6, category_id: 1, name: "Thư sinh", price: 210000, stock: 25, image_url: "../assets/images/hot2.avif", description: "Thiết kế cổ bẻ thanh lịch, chất vải mềm mịn.", rating: 4.9 },
    { id: 7, category_id: 1, name: "Chú chó con", price: 95000, stock: 60, image_url: "../assets/images/hot3.avif", description: "Hình in sắc nét, không bong tróc khi giặt máy.", rating: 4.7 },
    { id: 8, category_id: 1, name: "Đồ bộ mát mẻ", price: 100000, stock: 80, image_url: "../assets/images/hot4.avif", description: "Chất thun lạnh siêu co giãn, thích hợp ngày hè.", rating: 4.8 },
    { id: 9, category_id: 2, name: "Váy công chúa nhí", price: 250000, stock: 15, image_url: "../assets/images/shopping.webp", description: "Váy bồng bềnh cho bé gái đi tiệc.", rating: 4.9 },
    { id: 10, category_id: 1, name: "Áo polo bé trai", price: 120000, stock: 30, image_url: "../assets/images/hot1.avif", description: "Áo có cổ vải cá sấu cao cấp.", rating: 4.6 }
];

let currentPage = 1;
const itemsPerPage = 8;
let searchQuery = "";
let sortType = "default";
let selectedCategory = "all";

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

function createProductCard(product) {
    return `
        <div class="product-card" >
        <div class="product-sku">MÃ SẢN PHẨM: ${product.id}</div>
        <div class="product-title">${product.name}</div>
        <img class="product-image" src="${product.image_url}" alt="${product.name}">
        <div class="product-desc">Mô tả: ${product.description}</div>
        <div class="product-price">Giá: ${formatCurrency(product.price)}</div>
        <button class="buy-btn">Mua ngay</button>
        </div>
    `;
}
function removeVietnameseTones(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();
}

function getProcessedProducts() {
    let result = mockProducts.filter(p => {
        const productNameNoTone = removeVietnameseTones(p.name);
        const searchNoTone = removeVietnameseTones(searchQuery);
        const matchSearch = productNameNoTone.includes(searchNoTone);
        const matchCategory = selectedCategory === "all" || p.category_id === Number(selectedCategory);
        return matchSearch && matchCategory;
    });
    if (sortType === "price-asc") {
        result.sort((a, b) => a.price - b.price);
    } else if (sortType === "price-desc") {
        result.sort((a, b) => b.price - a.price);
    }

    return result;
}

function render() {
    const filteredProducts = getProcessedProducts();
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const productGrid = document.getElementById("product-grid");
    if (currentProducts.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">Không tìm thấy sản phẩm nào phù hợp.</p>`;
    } else {
        productGrid.innerHTML = currentProducts.map(p => createProductCard(p)).join("");
    }
    renderPagination(totalPages);
}


function renderPagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;
    if (totalPages <= 1) {
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
            render();
            }
        } else if (btn.classList.contains("next-btn")) {
            if (currentPage < totalPages) {
            currentPage++;
            render();
            }
        } else {
            const selectedPage = Number(btn.getAttribute("data-page"));
            if (selectedPage && selectedPage !== currentPage) {
            currentPage = selectedPage;
            render();
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
        searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        currentPage = 1;
        render();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
        sortType = e.target.value;
        render();
        });
    }
    render();
});