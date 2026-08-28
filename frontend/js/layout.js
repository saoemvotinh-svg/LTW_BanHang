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


loadIncludes();