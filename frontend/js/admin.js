function loadIncludes() {

    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const aside = document.querySelector("aside");

    fetch("../includes/header.html")
        .then(response => response.text())
        .then(html => {

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const headerReal = doc.querySelector("header");

            if (headerReal) {
                header.outerHTML = headerReal.outerHTML;
                const trangchu = document.querySelector(".main-nav li");

                trangchu.outerHTML = '<li><a href="../index.html">Trang chủ</a></li>';
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


loadIncludes();

// Dashboard logic moved to admin-dashboard.js