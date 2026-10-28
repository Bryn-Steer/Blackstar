/* =========================================================
   BLACKSTAR ABOUT
   Progressive enhancement only: every section is complete and
   readable without this file.
   1. Reveal: [data-reveal] elements get .is-in as they enter view.
   2. Philosophy: pins the statement column and tracks the chapter.
   3. Showcase: hover/focus selects the featured environment (desktop).
========================================================= */

(function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var desktop = window.matchMedia("(min-width: 992px)");

    /* 1. Reveal ------------------------------------------------ */
    var revealItems = document.querySelectorAll("[data-reveal]");

    function revealAll() {
        revealItems.forEach(function (el) { el.classList.add("is-in"); });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealAll();
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

    /* 2. Philosophy -------------------------------------------- */
    var indexItems = document.querySelectorAll(".ba-story__index li");
    var chapters = document.querySelectorAll(".ba-chapter");

    if (indexItems.length && chapters.length && "IntersectionObserver" in window) {
        var chapterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var active = Number(entry.target.getAttribute("data-chapter"));
                indexItems.forEach(function (li, i) { li.classList.toggle("is-active", i === active); });
            });
        }, { rootMargin: "-40% 0px -50% 0px" });

        chapters.forEach(function (c) { chapterObserver.observe(c); });
    }

    // ScrollSmoother moves the page with transforms, so CSS sticky cannot work;
    // pin with ScrollTrigger instead (desktop only, where the rail sits beside the text).
    var pin = document.querySelector(".ba-story__pin");
    if (pin && window.gsap && window.ScrollTrigger && gsap.matchMedia) {
        gsap.matchMedia().add("(min-width: 992px)", function () {
            var trigger = ScrollTrigger.create({
                trigger: ".ba-story__grid",
                start: "top 120px",
                end: function () { return "bottom " + (pin.offsetHeight + 120) + "px"; },
                pin: pin,
                pinSpacing: false
            });
            return function () { trigger.kill(); };
        });
        window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    }

    /* 3. Showcase ---------------------------------------------- */
    var showcase = document.querySelector(".ba-showcase");
    if (showcase) {
        var cases = showcase.querySelectorAll(".ba-case");
        var frames = showcase.querySelectorAll(".ba-showcase__stage img");

        function select(index) {
            cases.forEach(function (c, i) { c.classList.toggle("is-active", i === index); });
            frames.forEach(function (f, i) { f.classList.toggle("is-active", i === index); });
        }

        cases.forEach(function (c, i) {
            c.addEventListener("mouseenter", function () { if (desktop.matches) select(i); });
            c.addEventListener("focusin", function () { if (desktop.matches) select(i); });
            c.addEventListener("click", function (e) {
                if (desktop.matches && !e.target.closest("a")) select(i);
            });
        });

        function syncLayout() { showcase.classList.toggle("is-enhanced", desktop.matches); }
        syncLayout();
        desktop.addEventListener("change", syncLayout);
    }
})();
