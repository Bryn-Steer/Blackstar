/* =========================================================
   BLACKSTAR CONTACT
   1. Reveal: [data-reveal] elements get .is-in as they enter view.
   2. Service hint: describes the selected service.
   3. Enquiry form: validation, then a genuine submission to
      data-endpoint. With no endpoint configured the visitor is
      told the form is not connected; no false success is shown.
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
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });

        revealItems.forEach(function (el) { revealObserver.observe(el); });
    }

    var form = document.querySelector(".ct-form");
    if (!form) return;

    /* 2. Service hint (wording from the service pages) --------- */
    var service = form.querySelector("#ct-service");
    var hint = form.querySelector("#ct-service-hint");
    var hints = {
        "door-supervision": "SIA licensed door supervisors for nightclubs, bars, hotels, live music venues and licensed events.",
        "event-security": "Security for entry points, restricted areas, crowd management and incident response at concerts, festivals, fixtures and public events.",
        "event-stewarding": "Approachable stewards for guidance and crowd flow. Genuine stewarding duties can fall outside SIA licensing; licensed personnel are used where duties require it.",
        "manned-guarding": "Security guards for access control, patrols and site protection at commercial premises, industrial sites and managed property.",
        "school-security": "Support with access control, visitor procedures and site security, complementing the school’s own safeguarding arrangements.",
        "concierge-residential": "Front-of-house presence, access support and security for apartment buildings and managed developments.",
        "not-sure": "That’s fine. Describe the venue, event or site below and we’ll help you work out the right requirement."
    };
    var defaultHint = hint.textContent;

    service.addEventListener("change", function () {
        hint.textContent = hints[service.value] || defaultHint;
        service.closest(".ct-field").classList.add("has-value");
    });

    /* 3. Validation -------------------------------------------- */
    var messages = {
        name: "Enter your full name.",
        email: "Enter an email address, like name@company.co.uk.",
        phone: "Enter a telephone number we can reach you on.",
        service: "Choose the service you need, or “Not Sure Yet”.",
        start_date: "Tell us roughly when you need cover, or write “ongoing”.",
        message: "Add a few details about what you need."
    };
    var required = Array.prototype.slice.call(form.querySelectorAll("[required]"));

    function problem(field) {
        var value = field.value.trim();
        if (!value) return messages[field.name];
        if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return messages.email;
        if (field.type === "tel" && value.replace(/\D/g, "").length < 10) return "Enter a telephone number with at least 10 digits.";
        return "";
    }

    function check(field) {
        var text = problem(field);
        var error = form.querySelector("#" + field.id + "-error");
        field.setAttribute("aria-invalid", text ? "true" : "false");
        field.closest(".ct-field").classList.toggle("is-invalid", !!text);
        if (error) {
            error.textContent = text;
            error.hidden = !text;
        }
        return !text;
    }

    required.forEach(function (field) {
        // Validate after the first visit, then live as the visitor corrects it
        field.addEventListener("blur", function () {
            if (field.value.trim() || field.dataset.touched) check(field);
            field.dataset.touched = "true";
        });
        field.addEventListener("input", function () {
            if (field.getAttribute("aria-invalid") === "true") check(field);
        });
        field.addEventListener("change", function () {
            if (field.dataset.touched) check(field);
        });
    });

    /* 4. Submission -------------------------------------------- */
    var status = form.querySelector(".ct-status");
    var button = form.querySelector(".ct-submit__btn");
    var buttonLabel = button.querySelector("span");

    function show(kind, html) {
        status.className = "ct-status ct-status--" + kind;
        status.innerHTML = html;
        status.hidden = false;
        status.focus({ preventScroll: true });
        status.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    }

    function escapeHtml(text) {
        var div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function emailFallbackLink() {
        var data = new FormData(form);
        var lines = [
            "Name: " + data.get("name"),
            "Business: " + (data.get("business") || "-"),
            "Email: " + data.get("email"),
            "Telephone: " + data.get("phone"),
            "Service: " + service.options[service.selectedIndex].text,
            "Location: " + (data.get("location") || "-"),
            "Start date: " + data.get("start_date"),
            "",
            data.get("message")
        ];
        return "mailto:info@blackstarsecurity.co.uk?subject=" + encodeURIComponent("Security enquiry from " + data.get("name")) + "&body=" + encodeURIComponent(lines.join("\n"));
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        status.hidden = true;

        var invalid = required.filter(function (field) { return !check(field); });
        if (invalid.length) {
            invalid[0].focus();
            return;
        }

        var endpoint = form.getAttribute("data-endpoint");

        if (!endpoint) {
            show("notice",
                "<p class=\"ct-status__title\">Your enquiry has not been sent yet</p>" +
                "<p>Our online form is not connected at the moment, so these details have not reached us. Please send them by email or call us, and nothing you have typed will be lost.</p>" +
                "<p class=\"ct-status__actions\"><a class=\"ct-status__btn\" href=\"" + emailFallbackLink() + "\">Send by email</a><a href=\"tel:+441618186787\">Call 0161 818 6787</a></p>");
            return;
        }

        button.disabled = true;
        buttonLabel.textContent = "Sending…";

        fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
            .then(function (response) {
                if (!response.ok) throw new Error(response.status);
                var name = form.querySelector("#ct-name").value.trim().split(" ")[0];
                form.classList.add("is-sent");
                show("success",
                    "<p class=\"ct-status__title\">Thank you, " + escapeHtml(name) + ". Your enquiry has been sent.</p>" +
                    "<p>A member of the Blackstar team will be in touch. If your requirement is urgent, please call 0161 818 6787.</p>");
                form.reset();
            })
            .catch(function () {
                show("error",
                    "<p class=\"ct-status__title\">We couldn’t send your enquiry</p>" +
                    "<p>Something went wrong on our side and your details have not been sent. Please try again, email us, or call 0161 818 6787.</p>" +
                    "<p class=\"ct-status__actions\"><a class=\"ct-status__btn\" href=\"" + emailFallbackLink() + "\">Send by email</a></p>");
            })
            .finally(function () {
                button.disabled = false;
                buttonLabel.textContent = "Send enquiry";
            });
    });
})();
