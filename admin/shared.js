// ========================================
// HELPERS
// ========================================

function getFieldValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value = value ?? "";
    }

}


function formatAdminPrice(price) {

    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR"
        }
    ).format(
        Number(price) || 0
    );

}


function formatOrderDate(date) {

    if (!date) return "-";


    try {

        return new Date(date)
            .toLocaleString(
                "en-ZA",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

    } catch {

        return "-";

    }

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ========================================
// SIDEBAR / HEADER CHROME
// ========================================

function highlightActiveNavLink() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";

    document
        .querySelectorAll(".sidebar nav a")
        .forEach(link => {

            if (link.getAttribute("href") === currentPage) {
                link.classList.add("active");
            }

        });

}


function setupSidebarToggle() {

    const layout =
        document.querySelector(".admin-layout");

    const button =
        document.getElementById("sidebarToggle");

    if (!layout || !button) return;


    const stored =
        localStorage.getItem(
            "afrigadgets-admin-sidebar-collapsed"
        ) === "true";

    layout.classList.toggle(
        "sidebar-collapsed",
        stored
    );


    button.addEventListener("click", () => {

        const collapsed =
            layout.classList.toggle(
                "sidebar-collapsed"
            );

        localStorage.setItem(
            "afrigadgets-admin-sidebar-collapsed",
            collapsed
        );

    });

}


function setupHeaderScrollShadow() {

    const header =
        document.querySelector(".admin-header");

    if (!header) return;


    const onScroll = () => {

        header.classList.toggle(
            "is-scrolled",
            window.scrollY > 4
        );

    };


    window.addEventListener("scroll", onScroll);

    onScroll();

}


function setupUserMenu() {

    const wrapper =
        document.querySelector(".admin-user");

    const trigger =
        document.getElementById("adminUserTrigger");

    if (!wrapper || !trigger) return;


    trigger.addEventListener("click", event => {

        event.stopPropagation();

        wrapper.classList.toggle("open");

    });


    document.addEventListener("click", () => {

        wrapper.classList.remove("open");

    });

}


// Reads the already-highlighted sidebar link so the breadcrumb never
// needs its own per-page hardcoded label.
function renderBreadcrumb() {

    const container =
        document.getElementById("adminBreadcrumb");

    if (!container) return;


    const activeLink =
        document.querySelector(
            ".sidebar nav a.active"
        );

    const pageName =
        activeLink
        ? activeLink
            .querySelector("span")
            .textContent
            .trim()
        : document.title;


    if (pageName === "Dashboard") {

        container.innerHTML =
            `<span class="current">Dashboard</span>`;

        return;

    }


    container.innerHTML = `
        <a href="index.html">Dashboard</a>
        <i class="fa-solid fa-chevron-right"></i>
        <span class="current">${escapeHTML(pageName)}</span>
    `;

}


function renderAdminIdentity(profile) {

    if (!profile) return;


    const displayName =
        profile.full_name ||
        profile.email ||
        "Administrator";


    const nameElement =
        document.getElementById(
            "adminUserName"
        );

    if (nameElement) {
        nameElement.textContent = displayName;
    }


    const avatarElement =
        document.getElementById(
            "adminAvatarLetter"
        );

    if (avatarElement) {

        avatarElement.textContent =
            displayName
                .trim()
                .charAt(0)
                .toUpperCase();

    }

}


// Every admin page calls this once on load: waits for guard.js's session
// check, bails out if it failed (guard.js already redirects in that case),
// sets up the sidebar/header chrome, then runs the page's own render logic.
async function initAdminPage(onReady) {

    await window.adminSessionReady;

    if (!window.adminAuthClient) {
        return;
    }


    highlightActiveNavLink();

    renderAdminIdentity(window.adminProfile);

    renderBreadcrumb();

    setupSidebarToggle();

    setupHeaderScrollShadow();

    setupUserMenu();


    if (onReady) {
        await onReady();
    }

}
