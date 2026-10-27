document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================================
       BLACKSTAR CAREERS ASSESSMENT
       careers.js
    ========================================================= */

    const CONFIG = {
        totalQuestions: 20,

        applicationUrl: "https://blackstarsecurityltd.talosats-careers.com",

        trainingUrl: "training.html",

        recruitmentUrl: "contact.html"
    };

    const form = document.querySelector("[data-assessment-form]");
    const resultSection = document.querySelector("[data-assessment-result]");

    if (!form) {
        return;
    }

    const steps = Array.from(form.querySelectorAll(".assessment-step"));
    const progressText = document.querySelector("[data-progress-text]");
    const progressFill = document.querySelector("[data-progress-fill]");
    const progressBar = document.querySelector(".career-assessment__progress");

    const resultStatus = document.querySelector("[data-result-status]");
    const resultHeading = document.querySelector("[data-result-heading]");
    const resultSummary = document.querySelector("[data-result-summary]");

    const passList = document.querySelector("[data-result-pass-list]");
    const actionList = document.querySelector("[data-result-action-list]");
    const reviewList = document.querySelector("[data-result-review-list]");

    const nextStepContainer = document.querySelector("[data-result-next-step]");

    const applyButton = document.querySelector("[data-apply-button]");
    const trainingButton = document.querySelector("[data-training-button]");
    const restartButton = document.querySelector("[data-restart-assessment]");

    let currentStep = 1;

    /* =========================================================
       QUESTION LABELS
    ========================================================= */

    const questionLabels = {
        right_to_work: "Right to work",
        rtw_method: "Right-to-work evidence",
        identity_consistency: "Identity documents",
        sia_licence: "SIA licence",
        sia_type: "SIA licence type",
        sia_status: "SIA licence status",
        sia_training: "SIA training and refresher requirements",
        overseas_residence: "Overseas residence history",
        overseas_check: "Overseas criminal-record evidence",
        five_year_history: "Five-year address and work history",
        references: "References",
        criminality_review: "SIA eligibility review",
        instruction_comprehension: "Following site instructions",
        incident_report: "Incident reporting",
        management_communication: "Communication with management",
        transport: "Travel arrangements",
        availability: "Shift availability",
        punctuality: "Punctuality",
        admin_discipline: "Document and administration deadlines"
    };

    const roleNames = {
        "door-supervisor": "Door Supervisor",
        "security-officer": "Security Officer / Manned Guarding",
        "event-security": "Event Security",
        "safety-steward": "Safety Steward",
        "school-security": "School Security",
        "concierge-residential": "Concierge / Residential Security",
        "unsure": "Undecided"
    };

    /* =========================================================
       INITIALISE
    ========================================================= */

        function initialiseAssessment() {
        form.classList.add("is-initialized");

        steps.forEach((step) => {
            step.classList.remove("is-active");
        });

        form.querySelectorAll('input[type="radio"]').forEach((input) => {
            input.addEventListener("change", () => {
                updateNextButtonState();
            });
        });

        showStep(1, false);
        setCurrentYear();
        initialiseRoleLinks();
        initialiseGuidance();
        updateNextButtonState();
    }

    /* =========================================================
       SHOW QUESTION
    ========================================================= */

    function showStep(stepNumber, shouldScroll = true) {
        if (stepNumber < 1 || stepNumber > CONFIG.totalQuestions) {
            return;
        }

        currentStep = stepNumber;

        steps.forEach((step) => {
            const number = Number(step.dataset.step);
            step.classList.toggle("is-active", number === currentStep);
        });

        updateProgress();
        updateNextButtonState();

        if (shouldScroll) {
            scrollToAssessment();
        }
    }

    function updateNextButtonState() {
        const activeStep = form.querySelector(".assessment-step.is-active");

        if (!activeStep) {
            return;
        }

        const selected = activeStep.querySelector('input[type="radio"]:checked');

        const button = activeStep.querySelector(
            "[data-next-step], .assessment-submit"
        );

        if (!button) {
            return;
        }

        if (selected) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.classList.add("is-ready");
        } else {
            button.disabled = true;
            button.setAttribute("disabled", "disabled");
            button.classList.remove("is-ready");
        }
    }

    /* =========================================================
       PROGRESS
    ========================================================= */

    function getAssessmentStage(step) {
        if (step <= 1) {
            return "Role & Availability";
        }

        if (step <= 4) {
            return "Right to Work & Identity";
        }

        if (step <= 10) {
            return "SIA Licensing";
        }

        if (step <= 13) {
            return "Vetting & Documentation";
        }

        return "Professional Standards";
    }

    function updateProgress() {
        const percentage = (currentStep / CONFIG.totalQuestions) * 100;

        const stageText = document.querySelector("[data-stage-text]");

        if (stageText) {
            stageText.textContent = getAssessmentStage(currentStep);
        }

        if (progressText) {
            progressText.textContent =
                `Question ${currentStep} of ${CONFIG.totalQuestions}`;
        }

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        if (progressBar) {
            progressBar.setAttribute("aria-valuenow", String(currentStep));
        }
    }

    /* =========================================================
       SCROLL
    ========================================================= */

    function scrollToAssessment() {
        const shell = document.querySelector(".career-assessment__shell");

        if (!shell) {
            return;
        }

        const top =
            shell.getBoundingClientRect().top +
            window.pageYOffset -
            110;

        window.scrollTo({
            top,
            behavior: "smooth"
        });
    }

    /* =========================================================
       GET SELECTED INPUT
    ========================================================= */

    function getSelectedInput(step) {
        if (!step) {
            return null;
        }

        return step.querySelector('input[type="radio"]:checked');
    }

    /* =========================================================
       VALIDATE CURRENT QUESTION
    ========================================================= */

    function validateCurrentStep() {
        const step = steps.find(
            (item) => Number(item.dataset.step) === currentStep
        );

        if (!step) {
            return false;
        }

        const selected = getSelectedInput(step);

        if (selected) {
            return true;
        }

        const firstInput = step.querySelector('input[type="radio"]');

        if (firstInput) {
            firstInput.setCustomValidity("Please select an answer.");

            firstInput.reportValidity();

            window.setTimeout(() => {
                firstInput.setCustomValidity("");
            }, 100);
        }

        return false;
    }

    function getNextStep(current) {
        const role = getValue("role");
        const siaLicence = getValue("sia_licence");
        const overseasResidence = getValue("overseas_residence");

        /* Door Supervisor applicant without a licence:
        skip licence-specific questions and keep training flag */
        if (
            current === 5 &&
            role === "door-supervisor" &&
            siaLicence === "no"
        ) {
            clearSkippedSiaAnswers();
            return 9;
        }

        /* Applicant has not chosen a role and has no SIA licence:
        skip irrelevant licence type/status/training questions */
        if (
            current === 5 &&
            role === "unsure" &&
            siaLicence === "no"
        ) {
            clearSkippedSiaAnswers();
            return 9;
        }

        /* No qualifying overseas residence:
        skip overseas document question */
        if (
            current === 9 &&
            overseasResidence === "no"
        ) {
            return 11;
        }

        return current + 1;
    }

    function getPreviousStep(current) {
        const role = getValue("role");
        const siaLicence = getValue("sia_licence");
        const overseasResidence = getValue("overseas_residence");

        /* Door Supervisor route skipped Q6-Q8 */
        if (
            current === 9 &&
            role === "door-supervisor" &&
            siaLicence === "no"
        ) {
            return 5;
        }

        /* Undecided role route skipped Q6-Q8 */
        if (
            current === 9 &&
            role === "unsure" &&
            siaLicence === "no"
        ) {
            return 5;
        }

        /* Overseas evidence question was skipped */
        if (
            current === 11 &&
            overseasResidence === "no"
        ) {
            return 9;
        }

        return current - 1;
    }

    function clearSkippedSiaAnswers() {
        const fieldsToClear = [
            "sia_type",
            "sia_status",
            "sia_training"
        ];

        fieldsToClear.forEach((name) => {
            form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
                input.checked = false;
            });
        });

        [6, 7, 8].forEach((stepNumber) => {
            const step = form.querySelector(
                `.assessment-step[data-step="${stepNumber}"]`
            );

            if (!step) {
                return;
            }

            const guidanceSlot = step.querySelector("[data-guidance-slot]");

            if (guidanceSlot) {
                guidanceSlot.innerHTML = "";
            }
        });
    }

    /* =========================================================
       NEXT / BACK
    ========================================================= */

    form.addEventListener("click", (event) => {
        const nextButton = event.target.closest("[data-next-step]");
        const backButton = event.target.closest("[data-prev-step]");

        if (nextButton) {
            event.preventDefault();

            if (!validateCurrentStep()) {
                return;
            }

            if (currentStep < CONFIG.totalQuestions) {
                showStep(getNextStep(currentStep));
            }
        }

        if (backButton) {
            event.preventDefault();

            if (currentStep > 1) {
                showStep(getPreviousStep(currentStep));
            }
        }
    });

    /* =========================================================
       GUIDANCE
    ========================================================= */

    function initialiseGuidance() {
        form.addEventListener("change", (event) => {
            const input = event.target;

            if (!input.matches('input[type="radio"]')) {
                return;
            }

            renderGuidance(input);
            updateNextButtonState();
        });
    }

    function renderGuidance(input) {
        const step = input.closest(".assessment-step");

        if (!step) {
            return;
        }

        const slot = step.querySelector("[data-guidance-slot]");

        if (!slot) {
            return;
        }

        slot.innerHTML = "";

        const guidanceKey = input.dataset.guidance;

        if (!guidanceKey) {
            return;
        }

        if (
            guidanceKey === "sia-training-route" &&
            shouldUseRoleDependentLicenceMessage()
        ) {
            renderRoleDependentLicenceGuidance(slot);
            return;
        }

        const template = document.getElementById(
            `guidance-${guidanceKey}`
        );

        if (!template) {
            return;
        }

        slot.appendChild(template.content.cloneNode(true));
    }

    /* =========================================================
       ROLE-DEPENDENT SIA GUIDANCE
    ========================================================= */

    function shouldUseRoleDependentLicenceMessage() {
        const role = getValue("role");

        return (
            role !== "door-supervisor" &&
            role !== "security-officer"
        );
    }

    function renderRoleDependentLicenceGuidance(slot) {
        const wrapper = document.createElement("div");

        wrapper.className =
            "assessment-guidance assessment-guidance--review";

        wrapper.innerHTML = `
            <span class="assessment-guidance__label">
                Role requirement
            </span>
            <h3>
                The licence requirement depends on the duties of the role.
            </h3>
            <p>
                Some Blackstar positions require an SIA licence while others
                may have different requirements. Continue the assessment and
                recruitment can confirm what applies to the specific vacancy.
            </p>
        `;

        slot.appendChild(wrapper);
    }

    /* =========================================================
       ROLE CARD LINKS
    ========================================================= */

    function initialiseRoleLinks() {
        const links = document.querySelectorAll("[data-select-role]");

        links.forEach((link) => {
            link.addEventListener("click", () => {
                const role = link.dataset.selectRole;

                const input = form.querySelector(
                    `input[name="role"][value="${role}"]`
                );

                if (input) {
                    input.checked = true;
                }

                showStep(2, false);
            });
        });
    }

    /* =========================================================
       GET VALUE
    ========================================================= */

    function getValue(name) {
        const selected = form.querySelector(
            `input[name="${name}"]:checked`
        );

        return selected ? selected.value : null;
    }

    /* =========================================================
       GET ALL ANSWERS
    ========================================================= */

    function getAnswers() {
        const answers = {};

        const checked = form.querySelectorAll(
            'input[type="radio"]:checked'
        );

        checked.forEach((input) => {
            answers[input.name] = {
                value: input.value,
                outcome: input.dataset.outcome || null,
                guidance: input.dataset.guidance || null,
                flag: input.dataset.flag || null,
                flagScore: input.dataset.flagScore || null
            };
        });

        return answers;
    }

    /* =========================================================
       RESULT COLLECTIONS
    ========================================================= */

    function createResultState() {
        return {
            pass: [],
            action: [],
            review: [],
            blockers: [],
            trainingRequired: false,
            requiresHumanReview: false,
            role: getValue("role"),
            behavioural: {
                punctuality: 0,
                administration: 0,
                communication: 0,
                reporting: 0
            }
        };
    }

    /* =========================================================
       ADD UNIQUE RESULT
    ========================================================= */

    function addUnique(array, text) {
        if (!text) {
            return;
        }

        if (!array.includes(text)) {
            array.push(text);
        }
    }

    /* =========================================================
       GENERIC ANSWER PROCESSING
    ========================================================= */

    function processGenericAnswers(answers, state) {
        Object.entries(answers).forEach(([name, answer]) => {
            if (name === "role") {
                return;
            }

            const label = questionLabels[name] || name;

            if (answer.outcome === "pass") {
                addUnique(state.pass, label);
            }

            if (answer.outcome === "action") {
                addUnique(state.action, label);
            }

            if (answer.outcome === "review") {
                addUnique(state.review, label);
            }

            if (answer.outcome === "training") {
                addUnique(state.action, label);
            }

            if (answer.outcome === "blocker") {
                addUnique(state.action, label);
            }

            if (answer.flag) {
                state.behavioural[answer.flag] =
                    (state.behavioural[answer.flag] || 0) - 1;
            }

            if (answer.flagScore) {
                const [category, score] =
                    answer.flagScore.split(":");

                if (
                    category &&
                    Object.prototype.hasOwnProperty.call(
                        state.behavioural,
                        category
                    )
                ) {
                    state.behavioural[category] += Number(score);
                }
            }
        });
    }

    /* =========================================================
       RIGHT TO WORK
       IMPORTANT:
       Uncertain immigration / right-to-work circumstances are
       routed to human review rather than an automated rejection.
    ========================================================= */

    function evaluateRightToWork(state) {
        const rightToWork = getValue("right_to_work");
        const method = getValue("rtw_method");

        removeItem(state.pass, "Right to work");
        removeItem(state.pass, "Right-to-work evidence");
        removeItem(state.action, "Right to work");
        removeItem(state.action, "Right-to-work evidence");
        removeItem(state.review, "Right to work");
        removeItem(state.review, "Right-to-work evidence");

        if (rightToWork === "yes") {
            addUnique(state.pass, "Right to work");
        }

        if (
            rightToWork === "restricted" ||
            rightToWork === "unsure" ||
            rightToWork === "no"
        ) {
            addUnique(
                state.review,
                "Right-to-work evidence needs individual verification"
            );

            state.requiresHumanReview = true;
        }

        if (
            method === "share-code-evisa" ||
            method === "british-irish-documents"
        ) {
            addUnique(
                state.pass,
                "Right-to-work evidence identified"
            );
        }

        if (
            method === "other-document" ||
            method === "pending" ||
            method === "unsure"
        ) {
            addUnique(
                state.review,
                "Right-to-work document route needs verification"
            );

            state.requiresHumanReview = true;
        }
    }

    /* =========================================================
       SIA / ROLE COMPATIBILITY
    ========================================================= */

    function evaluateSIA(state) {
        const role = state.role;
        const hasLicence = getValue("sia_licence");
        const licenceType = getValue("sia_type");
        const licenceStatus = getValue("sia_status");
        const training = getValue("sia_training");

        removeItem(state.pass, "SIA licence");
        removeItem(state.pass, "SIA licence type");
        removeItem(state.pass, "SIA licence status");
        removeItem(state.pass, "SIA training and refresher requirements");

        removeItem(state.action, "SIA licence");
        removeItem(state.action, "SIA licence type");
        removeItem(state.action, "SIA licence status");
        removeItem(state.action, "SIA training and refresher requirements");

        removeItem(state.review, "SIA licence");
        removeItem(state.review, "SIA licence type");
        removeItem(state.review, "SIA licence status");
        removeItem(state.review, "SIA training and refresher requirements");

        if (role === "door-supervisor") {
            evaluateDoorSupervisorLicence(
                state,
                hasLicence,
                licenceType,
                licenceStatus,
                training
            );

            return;
        }

        if (role === "security-officer") {
            evaluateSecurityOfficerLicence(
                state,
                hasLicence,
                licenceType,
                licenceStatus,
                training
            );

            return;
        }

        evaluateRoleDependentLicence(
            state,
            hasLicence,
            licenceStatus,
            training
        );
    }

    /* =========================================================
       DOOR SUPERVISOR RULES
    ========================================================= */

    function evaluateDoorSupervisorLicence(
        state,
        hasLicence,
        licenceType,
        licenceStatus,
        training
    ) {
        if (
            hasLicence === "no" ||
            licenceType === "none"
        ) {
            state.trainingRequired = true;

            addUnique(
                state.action,
                "Door Supervisor licence required"
            );

            return;
        }

        if (hasLicence === "application") {
            addUnique(
                state.action,
                "SIA licence application must be completed before applying for licensed Door Supervisor work"
            );
        }

        if (hasLicence === "renewal") {
            addUnique(
                state.action,
                "SIA licence renewal is still in progress"
            );
        }

        if (licenceType === "door-supervisor") {
            addUnique(
                state.pass,
                "Appropriate Door Supervisor licence selected"
            );
        } else if (licenceType === "close-protection") {
            addUnique(
                state.review,
                "Licence compatibility should be confirmed with recruitment"
            );
        } else {
            state.trainingRequired = true;

            addUnique(
                state.action,
                "Your current SIA licence does not match the Door Supervisor route selected"
            );
        }

        if (licenceStatus === "valid") {
            addUnique(
                state.pass,
                "SIA licence appears current"
            );
        }

        if (licenceStatus === "expiring") {
            addUnique(
                state.action,
                "SIA licence expires within 3 months"
            );
        }

        if (licenceStatus === "expired") {
            addUnique(
                state.blockers,
                "SIA licence is expired"
            );

            addUnique(
                state.action,
                "Renew your SIA licence before applying for licensed Door Supervisor work"
            );
        }

        if (licenceStatus === "pending") {
            addUnique(
                state.action,
                "SIA application or renewal is still pending"
            );
        }

        if (licenceStatus === "unsure") {
            addUnique(
                state.action,
                "Confirm your SIA licence status"
            );
        }

        evaluateTrainingStatus(state, training);
    }

    /* =========================================================
       SECURITY OFFICER RULES
    ========================================================= */

    function evaluateSecurityOfficerLicence(
        state,
        hasLicence,
        licenceType,
        licenceStatus,
        training
    ) {
        if (
            hasLicence === "no" ||
            licenceType === "none"
        ) {
            state.trainingRequired = true;

            addUnique(
                state.action,
                "Appropriate SIA licensing may be required for this security role"
            );

            return;
        }

        if (
            licenceType === "security-guard" ||
            licenceType === "door-supervisor"
        ) {
            addUnique(
                state.pass,
                "Relevant security licence selected"
            );
        } else {
            addUnique(
                state.review,
                "Licence type needs to be checked against the vacancy"
            );
        }

        if (licenceStatus === "valid") {
            addUnique(
                state.pass,
                "SIA licence appears current"
            );
        }

        if (licenceStatus === "expiring") {
            addUnique(
                state.action,
                "SIA licence expires within 3 months"
            );
        }

        if (licenceStatus === "expired") {
            addUnique(
                state.blockers,
                "SIA licence is expired"
            );

            addUnique(
                state.action,
                "Licence renewal required before licensed work"
            );
        }

        if (
            licenceStatus === "pending" ||
            hasLicence === "renewal" ||
            hasLicence === "application"
        ) {
            addUnique(
                state.action,
                "SIA licence application or renewal is still in progress"
            );
        }

        evaluateTrainingStatus(state, training);
    }

    /* =========================================================
       ROLE-DEPENDENT LICENCE RULES
    ========================================================= */

    function evaluateRoleDependentLicence(
        state,
        hasLicence,
        licenceStatus,
        training
    ) {
        if (hasLicence === "yes") {
            addUnique(
                state.pass,
                "SIA licence information provided"
            );
        } else {
            addUnique(
                state.review,
                "Licence requirements should be checked against the specific vacancy"
            );
        }

        if (licenceStatus === "expired") {
            addUnique(
                state.action,
                "Any required SIA licence will need to be current before licensed work"
            );
        }

        if (training === "no" || training === "unsure") {
            addUnique(
                state.review,
                "Training requirements should be confirmed for the vacancy"
            );
        }
    }

    /* =========================================================
       TRAINING STATUS
    ========================================================= */

    function evaluateTrainingStatus(state, training) {
        if (training === "yes") {
            addUnique(
                state.pass,
                "Current SIA training requirements appear understood"
            );
        }

        if (training === "booked") {
            addUnique(
                state.action,
                "Required training or refresher course is still to be completed"
            );
        }

        if (training === "unsure") {
            addUnique(
                state.action,
                "Confirm current SIA training requirements"
            );
        }

        if (training === "no") {
            addUnique(
                state.action,
                "Required SIA training may need to be completed"
            );
        }
    }

    /* =========================================================
       OVERSEAS CHECK
    ========================================================= */

    function evaluateOverseasHistory(state) {
        const overseas = getValue("overseas_residence");
        const evidence = getValue("overseas_check");

        if (overseas === "no") {
            removeItem(
                state.action,
                "Overseas residence history"
            );

            addUnique(
                state.pass,
                "Overseas residence requirement checked"
            );

            if (evidence === "not-applicable") {
                addUnique(
                    state.pass,
                    "No overseas criminal-record evidence identified as required by your answers"
                );
            }

            return;
        }

        if (
            overseas === "yes" &&
            evidence === "yes"
        ) {
            addUnique(
                state.pass,
                "Overseas criminal-record evidence available"
            );
        }

        if (
            overseas === "yes" &&
            (
                evidence === "obtaining" ||
                evidence === "help" ||
                evidence === "no"
            )
        ) {
            addUnique(
                state.action,
                "Overseas criminal-record evidence needs attention"
            );
        }
    }

    /* =========================================================
       CRIMINALITY
       NEVER AUTOMATICALLY REJECT.
    ========================================================= */

    function evaluateCriminality(state) {
        const value = getValue("criminality_review");

        removeItem(
            state.review,
            "SIA eligibility review"
        );

        if (value === "no") {
            addUnique(
                state.pass,
                "No SIA eligibility concern identified by your answer"
            );

            return;
        }

        if (
            value === "yes" ||
            value === "unsure" ||
            value === "private"
        ) {
            addUnique(
                state.review,
                "Confidential SIA eligibility / recruitment review required"
            );

            state.requiresHumanReview = true;
        }
    }

    /* =========================================================
       BEHAVIOURAL / COMMUNICATION
    ========================================================= */

    function evaluateBehaviouralAnswers(state) {
        if (state.behavioural.communication < 0) {
            addUnique(
                state.review,
                "Communication and following instructions should be discussed with recruitment"
            );
        } else {
            addUnique(
                state.pass,
                "Following instructions and communication"
            );
        }

        if (state.behavioural.reporting < 0) {
            addUnique(
                state.review,
                "Incident-report writing may require further review"
            );
        } else {
            addUnique(
                state.pass,
                "Incident-report judgement"
            );
        }

        if (state.behavioural.punctuality < 0) {
            addUnique(
                state.review,
                "Punctuality expectations should be discussed"
            );
        } else {
            addUnique(
                state.pass,
                "Punctuality"
            );
        }

        if (state.behavioural.administration < 0) {
            addUnique(
                state.review,
                "Document submission and deadline management should be discussed"
            );
        } else {
            addUnique(
                state.pass,
                "Document and deadline management"
            );
        }
    }

    /* =========================================================
       TRANSPORT / AVAILABILITY
    ========================================================= */

    function evaluatePracticalRequirements(state) {
        const transport = getValue("transport");
        const availability = getValue("availability");

        removeItem(state.review, "Travel arrangements");
        removeItem(state.review, "Shift availability");
        removeItem(state.pass, "Travel arrangements");
        removeItem(state.pass, "Shift availability");

        if (transport === "yes") {
            addUnique(
                state.pass,
                "Travel arrangements"
            );
        } else {
            addUnique(
                state.review,
                "Travel arrangements need to be matched against site locations and shift finish times"
            );
        }

        if (availability === "full") {
            addUnique(
                state.pass,
                "Shift availability"
            );
        } else {
            addUnique(
                state.review,
                "Availability needs to be matched against available assignments"
            );
        }
    }

    /* =========================================================
       DETERMINE FINAL RESULT
    ========================================================= */

    function determineFinalStatus(state) {
        if (state.trainingRequired) {
            return "training";
        }

        if (state.blockers.length > 0) {
            return "not-ready";
        }

        if (
            state.requiresHumanReview ||
            state.review.length >= 2
        ) {
            return "review";
        }

        if (state.action.length > 0) {
            return "almost-ready";
        }

        if (state.review.length === 1) {
            return "review";
        }

        return "ready";
    }

    /* =========================================================
       FORM SUBMISSION
    ========================================================= */

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateCurrentStep()) {
            return;
        }

        const answers = getAnswers();
        const state = createResultState();

        processGenericAnswers(answers, state);
        evaluateRightToWork(state);
        evaluateSIA(state);
        evaluateOverseasHistory(state);
        evaluateCriminality(state);
        evaluateBehaviouralAnswers(state);
        evaluatePracticalRequirements(state);

        cleanResultArrays(state);

        const status = determineFinalStatus(state);

        renderResult(status, state);
    });

    /* =========================================================
       CLEAN RESULT ARRAYS
    ========================================================= */

    function cleanResultArrays(state) {
        state.action.forEach((item) => {
            removeItem(state.pass, item);
        });

        state.review.forEach((item) => {
            removeItem(state.pass, item);
        });

        state.blockers.forEach((item) => {
            removeItem(state.pass, item);
        });
    }

    /* =========================================================
       RENDER RESULT
    ========================================================= */

    function renderResult(status, state) {
        form.hidden = true;

        if (resultSection) {
            resultSection.hidden = false;
        }

        populateList(passList, state.pass);
        populateList(actionList, state.action);
        populateList(reviewList, state.review);

        toggleResultCard(
            passList,
            state.pass.length > 0
        );

        toggleResultCard(
            actionList,
            state.action.length > 0
        );

        toggleResultCard(
            reviewList,
            state.review.length > 0
        );

        configureResultCopy(status, state);
        configureResultButtons(status, state);

        if (progressText) {
            progressText.textContent =
                "Assessment complete";
        }

        if (progressFill) {
            progressFill.style.width = "100%";
        }

        if (progressBar) {
            progressBar.setAttribute(
                "aria-valuenow",
                String(CONFIG.totalQuestions)
            );
        }

        scrollToAssessment();
    }

    /* =========================================================
       RESULT COPY
    ========================================================= */

    function configureResultCopy(status, state) {
        const role =
            roleNames[state.role] || "your selected role";

        if (status === "ready") {
            setResultCopy(
                "Ready to Apply",
                "You appear ready to move forward.",
                `Based on the information you provided, no significant readiness issues were identified for ${role}. Formal recruitment checks will still be completed by Blackstar.`,
                `
                    <p>
                        You can now continue to the Blackstar application
                        process. Recruitment will verify your documents,
                        licence information and suitability before any
                        employment decision is made.
                    </p>
                `
            );

            return;
        }

        if (status === "almost-ready") {
            setResultCopy(
                "Almost Ready",
                "There are a few things to resolve first.",
                `You appear potentially ready for ${role}, but one or more practical requirements need attention before the recruitment process can progress smoothly.`,
                `
                    <p>
                        Review the action items above and resolve them where
                        possible. Once your documents, licence or recruitment
                        information are ready, you can continue with your
                        Blackstar application.
                    </p>
                `
            );

            return;
        }

        if (status === "review") {
            setResultCopy(
                "Recruitment Review",
                "Some parts of your assessment need individual review.",
                "This does not mean that your application has been declined. Some circumstances cannot be assessed fairly or accurately by an online questionnaire.",
                `
                    <p>
                        Contact Blackstar Recruitment so that the relevant
                        circumstances can be considered by a person. Do not
                        send sensitive personal details through this
                        readiness assessment.
                    </p>
                `
            );

            return;
        }

        if (status === "training") {
            setResultCopy(
                "Training Route",
                "You're not ready for this licensed role yet.",
                `The ${role} route you selected requires the appropriate licensing before you can undertake the relevant licensed work. Blackstar can guide you towards training first.`,
                `
                    <p>
                        Complete the appropriate training and obtain the
                        required SIA licence. Once licensed, return to the
                        Blackstar careers page and complete the readiness
                        assessment again before applying.
                    </p>
                    <p>
                        Completing Blackstar training does not guarantee
                        employment.
                    </p>
                `
            );

            return;
        }

        if (status === "not-ready") {
            setResultCopy(
                "Action Required",
                "A mandatory requirement needs attention.",
                `One or more current requirements for ${role} need to be resolved before licensed work can begin.`,
                `
                    <p>
                        Follow the guidance shown above and resolve the
                        outstanding requirement. If your circumstances are
                        unusual or you believe this result is incorrect,
                        contact Blackstar Recruitment for a human review.
                    </p>
                `
            );
        }
    }

    function setResultCopy(
        status,
        heading,
        summary,
        nextStepHtml
    ) {
        if (resultStatus) {
            resultStatus.textContent = status;
        }

        if (resultHeading) {
            resultHeading.textContent = heading;
        }

        if (resultSummary) {
            resultSummary.textContent = summary;
        }

        if (nextStepContainer) {
            nextStepContainer.innerHTML = nextStepHtml;
        }
    }

    /* =========================================================
    RESULT BUTTONS
    ========================================================= */

    function configureResultButtons(status) {
        if (applyButton) {
            applyButton.style.display = "";
            applyButton.href = CONFIG.applicationUrl;
            applyButton.target = "_blank";
            applyButton.rel = "noopener noreferrer";
            applyButton.textContent = "View Current Vacancies";
        }

        if (trainingButton) {
            trainingButton.style.display = "none";
            trainingButton.href = CONFIG.trainingUrl;
        }

        // Candidate needs training first
        if (status === "training") {
            if (applyButton) {
                applyButton.style.display = "none";
            }

            if (trainingButton) {
                trainingButton.style.display = "";
                trainingButton.textContent = "View Blackstar Training";
            }

            return;
        }

        // Candidate is not ready and should contact recruitment
        if (status === "not-ready") {
            if (applyButton) {
                applyButton.href = CONFIG.recruitmentUrl;
                applyButton.target = "_self";
                applyButton.removeAttribute("rel");
                applyButton.textContent = "Contact Recruitment";
            }

            return;
        }

        // Candidate needs an individual recruitment review
        if (status === "review") {
            if (applyButton) {
                applyButton.href = CONFIG.recruitmentUrl;
                applyButton.target = "_self";
                applyButton.removeAttribute("rel");
                applyButton.textContent = "Request Recruitment Review";
            }

            return;
        }

        // Candidate has minor issues but can still view current opportunities
        if (status === "almost-ready") {
            if (applyButton) {
                applyButton.href = CONFIG.applicationUrl;
                applyButton.target = "_blank";
                applyButton.rel = "noopener noreferrer";
                applyButton.textContent = "View Current Vacancies";
            }
        }
    }

    /* =========================================================
       POPULATE RESULT LIST
    ========================================================= */

    function populateList(list, items) {
        if (!list) {
            return;
        }

        list.innerHTML = "";

        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    }

    /* =========================================================
       HIDE EMPTY RESULT CARDS
    ========================================================= */

    function toggleResultCard(list, shouldShow) {
        if (!list) {
            return;
        }

        const card = list.closest(".assessment-result-card");

        if (!card) {
            return;
        }

        card.style.display = shouldShow ? "" : "none";
    }

    /* =========================================================
       REMOVE ARRAY ITEM
    ========================================================= */

    function removeItem(array, text) {
        let index = array.indexOf(text);

        while (index !== -1) {
            array.splice(index, 1);
            index = array.indexOf(text);
        }
    }

    /* =========================================================
       RESTART
    ========================================================= */

    if (restartButton) {
        restartButton.addEventListener("click", () => {
            form.reset();

            form.hidden = false;

            if (resultSection) {
                resultSection.hidden = true;
            }

            document
                .querySelectorAll("[data-guidance-slot]")
                .forEach((slot) => {
                    slot.innerHTML = "";
                });

            currentStep = 1;
            showStep(1);

            if (applyButton) {
                applyButton.style.display = "";
            }

            if (trainingButton) {
                trainingButton.style.display = "none";
            }
        });
    }

    /* =========================================================
       CURRENT YEAR
    ========================================================= */

    function setCurrentYear() {
        const elements =
            document.querySelectorAll("[data-current-year]");

        elements.forEach((element) => {
            element.textContent =
                String(new Date().getFullYear());
        });
    }

    /* =========================================================
       START
    ========================================================= */

    initialiseAssessment();
});

