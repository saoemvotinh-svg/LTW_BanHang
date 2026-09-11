// admin.js — Header, Footer và Aside loader cho Admin pages

// ============================================================
// INCLUDE LOADER
// ============================================================

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

// ============================================================
// ASIDE LOADER
// ============================================================

function loadAside() {

    const aside = document.querySelector("aside");

    if (!aside) return;

    fetch("../includes/admin-aside.html")
        .then(response => response.text())
        .then(html => {

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Lấy các elements từ file aside
            const asideReal    = doc.querySelector("aside");
            const toggleReal   = doc.querySelector(".menu-toggle");
            const overlayReal  = doc.querySelector(".sidebar-overlay");

            if (asideReal) {
                aside.outerHTML = asideReal.outerHTML;
                setActiveMenu();
            }

            // Chèn menu-toggle button vào body nếu chưa có
            if (toggleReal && !document.getElementById("menuToggle")) {
                const toggleClone = toggleReal.cloneNode(true);
                document.body.insertBefore(toggleClone, document.body.firstChild);
            }

            // Chèn sidebar overlay vào body nếu chưa có
            if (overlayReal && !document.getElementById("sidebarOverlay")) {
                const overlayClone = overlayReal.cloneNode(true);
                document.body.insertBefore(overlayClone, document.body.firstChild);
            }

            // Khởi tạo sidebar toggle sau khi DOM đã sẵn sàng
            initSidebarToggle();
        });
}

// ============================================================
// SIDEBAR TOGGLE (Drawer behavior trên tablet/mobile)
// ============================================================

function initSidebarToggle() {

    const toggle  = document.getElementById("menuToggle");
    const sidebar = document.getElementById("adminSidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!toggle || !sidebar) return;

    // Mở/Đóng sidebar
    toggle.addEventListener("click", () => {
        const isOpen = sidebar.classList.contains("open");
        if (isOpen) {
            closeSidebar(sidebar, overlay, toggle);
        } else {
            openSidebar(sidebar, overlay, toggle);
        }
    });

    // Click vào overlay để đóng sidebar
    if (overlay) {
        overlay.addEventListener("click", () => {
            closeSidebar(sidebar, overlay, toggle);
        });
    }

    // Đóng sidebar khi click vào link menu (trên mobile)
    sidebar.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth < 992) {
                closeSidebar(sidebar, overlay, toggle);
            }
        });
    });

    // Đóng sidebar khi resize lên desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            sidebar.classList.remove("open");
            if (overlay) overlay.classList.remove("active");
            document.body.style.overflow = "";
            toggle.setAttribute("aria-label", "Mở menu");
        }
    });
}

function openSidebar(sidebar, overlay, toggle) {
    sidebar.classList.add("open");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Ngăn scroll body
    toggle.setAttribute("aria-label", "Đóng menu");
    toggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
}

function closeSidebar(sidebar, overlay, toggle) {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
    toggle.setAttribute("aria-label", "Mở menu");
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
}

// ============================================================
// ACTIVE MENU
// ============================================================

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