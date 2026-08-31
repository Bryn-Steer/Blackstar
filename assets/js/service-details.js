/**
 * ============================================================
 * BLACKSTAR SECURITY
 * DOOR SUPERVISION PAGE
 * assets/js/service-details.js
 * ============================================================
 */

"use strict";


document.addEventListener("DOMContentLoaded", function () {

    initServiceFinder();
    initMobileActionBar();

});


/**
 * ============================================================
 * DOOR SUPERVISION NEXT-STEP FINDER
 * ============================================================
 */

function initServiceFinder() {

    const buttons = document.querySelectorAll(".bs-finder-button");

    const resultContainer = document.querySelector(".bs-finder-result");

    const resultTitle = document.getElementById("bsFinderTitle");

    const resultDescription = document.getElementById(
        "bsFinderDescription"
    );

    const resultLink = document.getElementById("bsFinderLink");

    const resultNote = document.getElementById("bsFinderNote");


    if (
        !buttons.length ||
        !resultContainer ||
        !resultTitle ||
        !resultDescription ||
        !resultLink
    ) {
        return;
    }


    const options = {

        urgent: {

            title:
                "Check Door Cover Availability",

            description:
                "If your venue needs door supervisors at short notice, the quickest first step is to give Blackstar the location, date, operating hours and approximate number of personnel required. We can then establish whether suitable licensed personnel are available.",

            linkText:
                "Call About Door Cover",

            href:
                "tel:+441618186787",

            note:
                "Short-notice cover is subject to personnel availability and sufficient information being available to assess the assignment."

        },


        regular: {

            title:
                "Build A Regular Door Team",

            description:
                "For ongoing venue cover, the first step is understanding how your venue operates. Trading hours, capacity, entrances, busy periods, premises-licence conditions and the responsibilities expected from the door team can all help shape the right deployment.",

            linkText:
                "Discuss Ongoing Door Cover",

            href:
                "contact.html",

            note:
                "Regular cover can be structured around the venue rather than treating every trading night as the same requirement."

        },


        staffing: {

            title:
                "Assess Your Staffing Requirement",

            description:
                "There is no single number of door supervisors that suits every licensed venue. Capacity, entrance points, customer numbers, alcohol, trading hours, layout, previous incidents and premises-licence conditions can all influence how many people may be required.",

            linkText:
                "Ask About Staffing",

            href:
                "contact.html",

            note:
                "Blackstar can discuss the venue and help establish an appropriate starting point. Any specific premises-licence conditions should also be taken into account."

        },


        licensing: {

            title:
                "Understand Door Supervision Licensing",

            description:
                "People carrying out licensable door supervision activity at licensed premises must hold the appropriate SIA licence. The duties being performed matter, which is why the role should be understood before personnel are deployed.",

            linkText:
                "Discuss Your Requirement",

            href:
                "contact.html",

            note:
                "Blackstar is currently an SIA Approved Contractor for Door Supervision. Current licensing and contractor status can also be checked independently through the SIA."

        },


        oneoff: {

            title:
                "Plan Additional Door Cover",

            description:
                "A one-off event, bank holiday, live performance, private function or unusually busy trading night can change the pressure on your normal door operation. Additional licensed personnel can be considered around the expected attendance and responsibilities for that date.",

            linkText:
                "Discuss One-Off Cover",

            href:
                "contact.html",

            note:
                "Providing the date, venue, expected attendance and hours will make the initial conversation much more useful."

        },


        replacement: {

            title:
                "Review Your Current Door Operation",

            description:
                "If your current arrangement is inconsistent, difficult to manage or no longer right for the venue, Blackstar can start by understanding what is working and what is not. That gives us a clearer picture before recommending a different approach.",

            linkText:
                "Request A Door Review",

            href:
                "contact.html",

            note:
                "You do not need to commit to changing provider simply to discuss how your current door operation could be improved."

        }

    };


    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const selected =
                button.getAttribute("data-service");


            if (!options[selected]) {
                return;
            }


            buttons.forEach(function (item) {

                item.classList.remove("is-active");

                item.setAttribute(
                    "aria-pressed",
                    "false"
                );

            });


            button.classList.add("is-active");

            button.setAttribute(
                "aria-pressed",
                "true"
            );


            updateDoorFinder(
                options[selected],
                resultContainer,
                resultTitle,
                resultDescription,
                resultLink,
                resultNote
            );

        });

    });

}



/**
 * ============================================================
 * UPDATE DOOR FINDER RESULT
 * ============================================================
 */

function updateDoorFinder(
    option,
    container,
    title,
    description,
    link,
    note
) {

    container.classList.add(
        "bs-result-changing"
    );


    window.setTimeout(function () {

        title.textContent =
            option.title;


        description.textContent =
            option.description;


        link.href =
            option.href;


        if (note) {

            note.textContent =
                option.note;

        }


        link.innerHTML =
            option.linkText +
            ' <i class="ph-bold ph-arrow-right"></i>';


        container.classList.remove(
            "bs-result-changing"
        );

    }, 160);

}



/**
 * ============================================================
 * MOBILE CONVERSION BAR
 * ============================================================
 *
 * Shows the fixed Call / Request Quote bar after the visitor
 * has moved beyond the opening hero.
 * ============================================================
 */

function initMobileActionBar() {

    const actionBar = document.querySelector(
        ".bs-mobile-action-bar"
    );

    const hero = document.querySelector(
        ".bs-service-hero"
    );


    if (!actionBar || !hero) {
        return;
    }


    let ticking = false;


    function updateActionBar() {

        const heroBottom =
            hero.offsetTop + hero.offsetHeight;


        const scrollPosition =
            window.scrollY + 150;


        if (scrollPosition > heroBottom) {

            actionBar.classList.add(
                "is-visible"
            );

        } else {

            actionBar.classList.remove(
                "is-visible"
            );

        }


        ticking = false;

    }


    function handleScroll() {

        if (!ticking) {

            window.requestAnimationFrame(
                updateActionBar
            );

            ticking = true;

        }

    }


    window.addEventListener(
        "scroll",
        handleScroll,
        {
            passive: true
        }
    );


    updateActionBar();

}