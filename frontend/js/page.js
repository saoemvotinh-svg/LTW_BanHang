const API_URL = 'http://localhost:8080/api/products/get_home.php';

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

function createProductCard(product, badgeText) {
  const imageUrl = product.image || './assets/images/default.webp';
  const categoryName = product.category_name || "Sản phẩm";

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="card-img">
        <span class="badge">${badgeText}</span>
        <div class="img-placeholder">
          <img src="${imageUrl}" alt="${product.name}" onerror="this.src='./assets/images/shopping.webp'">
        </div>
      </div>
      <div class="card-body">
        <span class="category">${categoryName}</span>
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

  if (!productsList || productsList.length === 0) {
    container.innerHTML = '<p class="empty-msg">Chưa có sản phẩm nào</p>';
    return;
  }

  container.innerHTML = productsList
    .map(product => createProductCard(product, badgeText))
    .join("");
}

async function loadHomeProducts() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();

    if (result.success) {
      renderProductsToContainer("new-products-grid", result.data.latest, "New");
      renderProductsToContainer("hot-products-grid", result.data.best_sellers, "Hot");
    } else {
      console.error("Lỗi từ server:", result.message);
    }
  } catch (error) {
    console.error("Không thể kết nối đến API Backend:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadHomeProducts);