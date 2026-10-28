/* =========================================================
   BLACKSTAR HOME
   Progressive enhancement only: every section is complete and
   usable without this file.
   1. Reveal: [data-reveal] elements get .is-in as they enter view.
   2. Services, desktop (992px+): the list drives a photographic stage.
   3. Services, below 992px: previous/next controls for the card track.
========================================================= */

(function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var desktop = window.matchMedia("(min-width: 992px)");

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

    var showcase = document.querySelector(".hv-showcase");
    if (!showcase) return;

    var list = showcase.querySelector(".hv-svc-list");
    var items = Array.prototype.slice.call(showcase.querySelectorAll(".hv-svc"));
    var frames = showcase.querySelectorAll(".hv-stage__frame");
    var stageCount = showcase.querySelector(".hv-stage__count b");
    var current = 0;

    /* 2. Desktop stage ----------------------------------------- */
    // Each title becomes a disclosure button that also selects the stage image.
    items.forEach(function (item, i) {
        var title = item.querySelector(".hv-svc__title");
        var detail = item.querySelector(".hv-svc__detail");
        detail.id = "hv-svc-detail-" + i;

        var button = document.createElement("button");
        button.type = "button";
        button.className = "hv-svc__toggle";
        button.setAttribute("aria-controls", detail.id);
        var num = document.createElement("span");
        num.className = "hv-svc__num";
        num.setAttribute("aria-hidden", "true");
        num.textContent = "0" + (i + 1);
        button.appendChild(num);
        while (title.firstChild) button.appendChild(title.firstChild);
        title.appendChild(button);

        button.addEventListener("click", function () { select(i); });
        button.addEventListener("keydown", function (e) {
            var next = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : null;
            if (next === null || !desktop.matches) return;
            e.preventDefault();
            next = (next + items.length) % items.length;
            items[next].querySelector(".hv-svc__toggle").focus();
            select(next);
        });
        item.addEventListener("mouseenter", function () { if (desktop.matches) select(i); });
    });

    function select(index) {
        if (index === current && items[index].classList.contains("is-active")) return;
        var direction = index > current ? "down" : "up";
        showcase.setAttribute("data-dir", direction);
        void showcase.offsetWidth; // apply the new entry edge before the frame becomes active

        items.forEach(function (item, i) {
            var on = i === index;
            item.classList.toggle("is-active", on);
            item.querySelector(".hv-svc__toggle").setAttribute("aria-expanded", on ? "true" : "false");
        });

        frames.forEach(function (frame, i) {
            frame.classList.remove("is-leaving");
            if (i === current && i !== index) frame.classList.add("is-leaving");
            frame.classList.toggle("is-active", i === index);
        });

        window.clearTimeout(select.timer);
        select.timer = window.setTimeout(function () {
            frames.forEach(function (frame) { frame.classList.remove("is-leaving"); });
        }, 950);

        if (stageCount) stageCount.textContent = "0" + (index + 1);
        current = index;
    }

    function syncAria() {
        items.forEach(function (item, i) {
            var expanded = desktop.matches ? i === current : true;
            item.querySelector(".hv-svc__toggle").setAttribute("aria-expanded", expanded ? "true" : "false");
        });
    }

    function syncLayout() {
        showcase.classList.toggle("is-enhanced", desktop.matches);
        if (track) track.hidden = desktop.matches;
        syncAria();
        if (!desktop.matches) updateCount();
    }

    /* 3. Track controls (below 992px) -------------------------- */
    var track = showcase.querySelector(".hv-track");
    var prev = showcase.querySelector(".hv-track__prev");
    var next = showcase.querySelector(".hv-track__next");
    var count = showcase.querySelector(".hv-track__count b");

    function cardStep() {
        return items[1] ? items[1].offsetLeft - items[0].offsetLeft : list.clientWidth;
    }

    function visibleIndex() {
        return Math.round(list.scrollLeft / cardStep());
    }

    function updateCount() {
        var i = Math.min(visibleIndex(), items.length - 1);
        if (count) count.textContent = String(i + 1);
        if (prev) prev.disabled = list.scrollLeft <= 2;
        if (next) next.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
    }

    function go(delta) {
        list.scrollTo({ left: (visibleIndex() + delta) * cardStep(), behavior: reduceMotion ? "auto" : "smooth" });
    }

    if (prev && next) {
        prev.addEventListener("click", function () { go(-1); });
        next.addEventListener("click", function () { go(1); });
        list.addEventListener("scroll", function () { window.requestAnimationFrame(updateCount); }, { passive: true });
    }

    syncLayout();
    desktop.addEventListener("change", syncLayout);
})();
