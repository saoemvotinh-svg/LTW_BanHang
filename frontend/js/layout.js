function loadIncludes() {

    const header = document.querySelector("header");
    const footer = document.querySelector("footer");

    fetch("../includes/header.html")
        .then(response => response.text())
        .then(html => {

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const headerReal = doc.querySelector("header");

            if (headerReal) {
                header.outerHTML = headerReal.outerHTML;

                const trangchu = document.querySelector(".main-nav li");
                if (trangchu) {
                    trangchu.outerHTML = '<li><a href="../index.html">Trang chủ</a></li>';
                }

                const profileActions = document.querySelector(".header-actions");
                if (profileActions) {
                    profileActions.outerHTML = `<div class="header-actions">
        <a href="./profile.html"><i class="fa-regular fa-user"></i> Tài khoản</a>
        <a href="./cart.html" class="cart-btn"><i class="fa-solid fa-bag-shopping"></i> Giỏ hàng</a>
      </div>`;
                }
            }
        });

    fetch("../includes/footer.html")
        .then(response => response.text())
        .then(html => {

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const footerReal = doc.querySelector("footer");

            if (footerReal) {
                footer.outerHTML = footerReal.outerHTML;
            }
        });
}


// Tự động gọi cho trang thường (không phải admin)
// Admin tự gọi loadIncludes() thông qua admin.js
if (!document.querySelector(".sidebar")) {
    loadIncludes();
}

