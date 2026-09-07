// Header và Footer được load bởi admin.js để độc lập với layout.js
function loadIncludes() {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const basePath = "../";

  const profileHref = "../pages/profile.html";
  const cartHref = "../pages/cart.html";
  const loginHref = "../pages/login.html";

  if (header) {
    fetch(basePath + "includes/header.html")
      .then(response => {
        if (!response.ok) throw new Error("Header not found: " + response.status);
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const headerReal = doc.querySelector("header");

        if (headerReal) {
          header.outerHTML = headerReal.outerHTML;

          // 1. Tự động chuẩn hóa đường dẫn cho tất cả link có data-route
          document.querySelectorAll(".nav-link[data-route]").forEach(link => {
            const route = link.getAttribute("data-route");
            if (route) {
              link.href = basePath + route;
            }
          });

          // 2. Xử lý trạng thái tài khoản / giỏ hàng
          const rawUser = localStorage.getItem("auth_user") || localStorage.getItem("user");
          let currentUser = null;
          try {
            currentUser = rawUser ? JSON.parse(rawUser) : null;
          } catch (e) {
            currentUser = null;
          }

          const profileActions = document.querySelector(".header-actions");
          if (profileActions) {
            if (currentUser) {
              const displayName = currentUser.fullname || currentUser.email || currentUser.username || "Tài khoản";
              profileActions.outerHTML = `
                <div class="header-actions">
                  <a href="${profileHref}"><i class="fa-regular fa-user"></i> ${displayName}</a>
                  <a href="#" class="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a>
                  <a href="${cartHref}" class="cart-btn"><i class="fa-solid fa-bag-shopping"></i> Giỏ hàng</a>
                </div>
              `;
              const logoutBtn = document.querySelector(".logout-btn");
              if (logoutBtn) {
                logoutBtn.addEventListener("click", (e) => {
                  e.preventDefault();
                  localStorage.clear();
                  window.location.href = loginHref;
                });
              }
            } else {
              profileActions.outerHTML = `
                <div class="header-actions">
                  <a href="${loginHref}"><i class="fa-regular fa-user"></i> Đăng nhập</a>
                  <a href="${cartHref}" class="cart-btn"><i class="fa-solid fa-bag-shopping"></i> Giỏ hàng</a>
                </div>
              `;
            }
          }
        }
      })
      .catch(err => console.error("Lỗi nạp header:", err));
  }

  if (footer) {
    fetch(basePath + "includes/footer.html")
      .then(response => {
        if (!response.ok) throw new Error("Footer not found: " + response.status);
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const footerReal = doc.querySelector("footer");
        if (footerReal) {
          footer.outerHTML = footerReal.outerHTML;
        }
      })
      .catch(err => console.error("Lỗi nạp footer:", err));
  }
}

function loadAside() {

    const aside = document.querySelector("aside");

    if (!aside) return;

    fetch("../includes/admin-aside.html")
        .then(response => response.text())
        .then(html => {

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const asideReal = doc.querySelector("aside");

            if (asideReal) {

                aside.outerHTML = asideReal.outerHTML;

                setActiveMenu();

            }
        });
}

function setActiveMenu() {

    const currentPage =
        window.location.pathname.split("/").pop();

    const menuLinks =
        document.querySelectorAll(".sidebar nav a");

    menuLinks.forEach(link => {

        const linkPage =
            link.getAttribute("href").split("/").pop();

        if (linkPage === currentPage) {
            link.classList.add("active");
        }

    });
}


// Admin tự sử dụng loadIncludes riêng, không phụ thuộc layout.js
loadIncludes();
loadAside();