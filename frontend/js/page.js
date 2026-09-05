const mockCategories = [
  { id: 1, name: "Áo quần trẻ em", description: "Thời trang cho bé trai và bé gái" },
  { id: 2, name: "Váy", description: "Các mẫu váy đầm bé gái" }
];
//data test
const mockProducts = [
  {
    id: 1,
    category_id: 1,
    name: "Quần áo mùa hè cute",
    price: 90000,
    stock: 50,
    image_url: "./assets/images/shopping.webp",
    description: "Chất liệu cotton thoáng mát, thấm hút mồ hôi cho bé.",
    rating: 5.0,
    created_at: "2026-08-20",
    is_hot: false
  },
  {
    id: 2,
    category_id: 2,
    name: "Váy xòe trái tim",
    price: 70000,
    stock: 35,
    image_url: "./assets/images/shopping (1).webp",
    description: "Thiết kế xinh xắn, họa tiết trái tim đáng yêu.",
    rating: 4.8,
    created_at: "2026-08-22",
    is_hot: false
  },
  {
    id: 3,
    category_id: 1,
    name: "Khủng long nhỏ",
    price: 80000,
    stock: 20,
    image_url: "./assets/images/shopping (2).webp",
    description: "Bộ cộc tay in hình khủng long ngộ nghĩnh.",
    rating: 4.5,
    created_at: "2026-08-21",
    is_hot: false
  },
  {
    id: 4,
    category_id: 1,
    name: "Hươu cao cổ cute hehe",
    price: 90000,
    stock: 15,
    image_url: "./assets/images/shopping (3).webp",
    description: "Set đồ thoáng khí mặc nhà hoặc đi dạo phố.",
    rating: 5.0,
    created_at: "2026-08-25",
    is_hot: false
  },
  {
    id: 5,
    category_id: 1,
    name: "Đồ bộ lịch lãm",
    price: 200000,
    stock: 40,
    image_url: "./assets/images/hot1.avif",
    description: "Phong cách bảnh bao dự tiệc cho bé trai.",
    rating: 5.0,
    created_at: "2026-07-10",
    is_hot: true
  },
  {
    id: 6,
    category_id: 1,
    name: "Thư sinh",
    price: 200000,
    stock: 25,
    image_url: "./assets/images/hot2.avif",
    description: "Thiết kế cổ bẻ thanh lịch, chất vải mềm mịn.",
    rating: 4.9,
    created_at: "2026-07-15",
    is_hot: true
  },
  {
    id: 7,
    category_id: 1,
    name: "Chú chó con",
    price: 90000,
    stock: 60,
    image_url: "./assets/images/hot3.avif",
    description: "Hình in sắc nét, không bong tróc khi giặt máy.",
    rating: 4.7,
    created_at: "2026-07-18",
    is_hot: true
  },
  {
    id: 8,
    category_id: 1,
    name: "Đồ bộ mát mẻ",
    price: 100000,
    stock: 80,
    image_url: "./assets/images/hot4.avif",
    description: "Chất thun lạnh siêu co giãn, thích hợp ngày hè.",
    rating: 4.8,
    created_at: "2026-07-20",
    is_hot: true
  }
];

function getCategoryName(categoryId) {
  const category = mockCategories.find(c => c.id === categoryId);
  return category ? category.name : "Khác";
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}


function createProductCard(product, badgeText) {
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="card-img">
        <span class="badge">${badgeText}</span>
        <div class="img-placeholder">
          <img src="${product.image_url}" alt="${product.name}">
        </div>
      </div>
      <div class="card-body">
        <span class="category">${getCategoryName(product.category_id)}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="card-footer">
          <span class="price">${formatCurrency(product.price)}</span>
        </div>
      </div>
    </div>
  `;
}


function renderProductsToContainer(containerId, productsList, badgeText) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = productsList
    .map(product => createProductCard(product, badgeText))
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const newProducts = [...mockProducts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);
  const hotProducts = mockProducts.filter(p => p.is_hot);

  renderProductsToContainer("new-products-grid", newProducts, "New");
  renderProductsToContainer("hot-products-grid", hotProducts, "Hot");
});
// alert("JS chạy thành công!");