/* =========================================================
   BLACKSTAR HOME
   Keeps the services accordion's aria-expanded in sync with the
   open/close state that main.js manages (.active-block).
========================================================= */

(function () {
    document.querySelectorAll(".bs-service").forEach(function (row) {
        var toggle = row.querySelector(".bs-service__toggle");
        if (!toggle) return;

        function sync() {
            toggle.setAttribute("aria-expanded", row.classList.contains("active-block") ? "true" : "false");
        }

        sync();
        new MutationObserver(sync).observe(row, { attributes: true, attributeFilter: ["class"] });
    });
})();
