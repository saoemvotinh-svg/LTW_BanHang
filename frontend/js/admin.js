// Header và Footer được load bởi layout.js (đã khai báo trước trong HTML)
// Admin chỉ cần load thêm aside riêng

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


// Admin dùng loadIncludes() từ layout.js cho header + footer
// Sau đó load thêm aside riêng
loadIncludes();
loadAside();
