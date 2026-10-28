/* =========================================================
   BLACKSTAR SERVICES
   Progressive enhancement only: without this file every service
   is a complete article in sequence.
   1. Reveal: [data-reveal] elements get .is-in as they enter view.
   2. Explorer: articles become an ARIA tab interface with pager,
      keyboard support and swipe (all widths).
   3. Hero strip: tiles select their service in the explorer.
========================================================= */

(function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* 1. Reveal ------------------------------------------------ */
    var revealItems = document.querySelectorAll("[data-reveal]");

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(function (el) { el.classList.add("is-in"); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-in");
                revealObserver.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

        revealItems.forEach(function (el) { revealObserver.observe(el); });
    }

    /* 2. Explorer ---------------------------------------------- */
    var explorer = document.querySelector(".sv-explorer");
    if (!explorer) return;

    var tablist = explorer.querySelector(".sv-tabs");
    var tabs = Array.prototype.slice.call(explorer.querySelectorAll(".sv-tab"));
    var panels = Array.prototype.slice.call(explorer.querySelectorAll(".sv-panel"));
    var pager = explorer.querySelector(".sv-pager");
    var count = explorer.querySelector(".sv-pager__count b");
    var prev = explorer.querySelector(".sv-pager__prev");
    var next = explorer.querySelector(".sv-pager__next");
    var current = 0;

    explorer.classList.add("is-enhanced");
    tablist.hidden = false;
    pager.hidden = false;

    panels.forEach(function (panel, i) {
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("tabindex", "0");
        panel.setAttribute("aria-labelledby", tabs[i].id);
    });

    function select(index, focusTab) {
        index = (index + panels.length) % panels.length;
        var direction = index > current ? "next" : "prev";
        explorer.setAttribute("data-dir", direction);

        tabs.forEach(function (tab, i) {
            var on = i === index;
            tab.setAttribute("aria-selected", on ? "true" : "false");
            tab.tabIndex = on ? 0 : -1;
        });

        panels.forEach(function (panel, i) {
            var on = i === index;
            panel.hidden = !on;
            panel.classList.toggle("is-active", on);
        });

        if (count) count.textContent = String(index + 1);
        if (focusTab) tabs[index].focus();

        // Keep the active chip visible on narrow screens
        var tab = tabs[index];
        var left = tab.offsetLeft - (tablist.clientWidth - tab.offsetWidth) / 2;
        tablist.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });

        current = index;
    }

    tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(i); });
        tab.addEventListener("keydown", function (e) {
            var keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
            if (!(e.key in keys)) return;
            e.preventDefault();
            select(keys[e.key], true);
        });
    });

    prev.addEventListener("click", function () { select(current - 1); });
    next.addEventListener("click", function () { select(current + 1); });

    // Horizontal swipe on the panel area (vertical scrolling is left alone)
    var startX = null, startY = null;
    var panelsWrap = explorer.querySelector(".sv-panels");

    panelsWrap.addEventListener("touchstart", function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    panelsWrap.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) select(current + (dx < 0 ? 1 : -1));
        startX = null;
    }, { passive: true });

    /* 3. Hero strip and deep links ----------------------------- */
    function selectFromHash(hash) {
        var index = panels.findIndex(function (p) { return "#" + p.id === hash; });
        if (index > -1) select(index);
        return index > -1;
    }

    document.querySelectorAll('.sv-strip a[href^="#sv-"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            if (!selectFromHash(link.getAttribute("href"))) return;
            e.preventDefault();
            var target = explorer.querySelector(".sv-explorer__head");
            var smoother = window.ScrollSmoother && ScrollSmoother.get();
            if (smoother) smoother.scrollTo(target, true, "top 90px");
            else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        });
    });

    if (!selectFromHash(window.location.hash)) select(0);
})();
