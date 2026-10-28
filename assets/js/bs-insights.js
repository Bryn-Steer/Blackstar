/* =========================================================
   BLACKSTAR INSIGHTS
   Progressive enhancement only: without this file every guide
   is listed and the filter/search tools stay hidden.
   1. Reveal: [data-reveal] elements get .is-in as they enter view.
   2. Library: topic filter + text search, combined, with a live
      result count and an empty state.
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
        }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });

        revealItems.forEach(function (el) { revealObserver.observe(el); });
    }

    /* 2. Library ----------------------------------------------- */
    var library = document.querySelector(".in-library");
    if (!library) return;

    var tools = library.querySelector(".in-tools");
    var filters = Array.prototype.slice.call(library.querySelectorAll(".in-filter"));
    var input = library.querySelector("#in-search-input");
    var items = Array.prototype.slice.call(library.querySelectorAll(".in-item"));
    var status = library.querySelector(".in-status");
    var empty = library.querySelector(".in-empty");
    var reset = library.querySelector(".in-reset");
    var topic = "all";

    tools.hidden = false;

    function apply() {
        var query = input.value.trim().toLowerCase();
        var shown = 0;

        items.forEach(function (item) {
            var inTopic = topic === "all" || item.getAttribute("data-topics").split(" ").indexOf(topic) > -1;
            var inSearch = !query || item.textContent.toLowerCase().indexOf(query) > -1;
            var visible = inTopic && inSearch;
            item.hidden = !visible;
            if (visible) {
                shown++;
                item.classList.add("is-in"); // never leave a filtered-in item waiting for its reveal
            }
        });

        var active = filters.filter(function (f) { return f.getAttribute("aria-pressed") === "true"; })[0];
        var label = topic === "all" ? "" : " in " + active.textContent.trim();
        var search = query ? " matching “" + input.value.trim() + "”" : "";
        status.textContent = shown === items.length ? "" : "Showing " + shown + " of " + items.length + " guides" + label + search;
        empty.hidden = shown > 0;
    }

    filters.forEach(function (button) {
        button.addEventListener("click", function () {
            topic = button.getAttribute("data-topic");
            filters.forEach(function (f) { f.setAttribute("aria-pressed", f === button ? "true" : "false"); });
            apply();
        });
    });

    input.addEventListener("input", apply);

    reset.addEventListener("click", function () {
        input.value = "";
        filters[0].click();
        input.focus();
    });
})();
