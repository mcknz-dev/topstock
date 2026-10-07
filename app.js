// ========================================
// SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
    "https://tswvzplgbqozvjpxvmop.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_zmRNtoynOoehGXK1F3JvMw_pxtINLOx";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// DEFAULT SIZES
// ========================================

const defaultSizes = [
    "0–6",
    "6–12",
    "12–24",
    "2T",
    "3T",
    "4T",
    "S",
    "M",
    "L",
    "XL",
    "Adult Standard",
    "Adult Plus"
];


// ========================================
// LOGIN
// ========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    const loginError =
        document.getElementById("loginError");

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            if (password !== "store819") {

                loginError.textContent =
                    "Incorrect store password.";

                return;
            }

            if (!username) {

                loginError.textContent =
                    "Please enter your name.";

                return;
            }

            localStorage.setItem(
                "topStockUsername",
                username
            );

            window.location.href =
                "home.html";

        }
    );

}


// ========================================
// HOME PAGE
// ========================================

const searchForm =
    document.getElementById("searchForm");

if (searchForm) {

    const username =
        localStorage.getItem(
            "topStockUsername"
        );

    if (!username) {

        window.location.href =
            "index.html";
    }


    const welcomeMessage =
        document.getElementById(
            "welcomeMessage"
        );

    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Welcome, ${username}`;

    }


    // ====================================
    // SEARCH COSTUME
    // ====================================

    async function searchCostume(
        costumeNumber
    ) {

        const results =
            document.getElementById(
                "searchResults"
            );


        if (!costumeNumber) {

            results.innerHTML =
                "";

            return;
        }


        results.innerHTML =
            "<p>Searching...</p>";


        // --------------------------------
        // Find costume
        // --------------------------------

        const {
            data: costume,
            error: costumeError
        } =
            await supabaseClient
                .from("costumes")
                .select("*")
                .eq(
                    "costume_number",
                    costumeNumber
                )
                .maybeSingle();


        if (costumeError) {

            console.error(
                "Costume search error:",
                costumeError
            );

            results.innerHTML = `

                <div class="no-results">

                    <p>
                        Database error:
                        ${costumeError.message}
                    </p>

                </div>

            `;

            return;
        }


        // --------------------------------
        // Not found
        // --------------------------------

        if (!costume) {

            results.innerHTML = `

                <div class="no-results">

                    <p>
                        Costume #${costumeNumber}
                        was not found.
                    </p>

                </div>

            `;

            return;
        }


        // --------------------------------
        // Get inventory
        // --------------------------------

        const {
            data: inventory,
            error: inventoryError
        } =
            await supabaseClient
                .from("inventory")
                .select("*")
                .eq(
                    "costume_id",
                    costume.id
                )
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        if (inventoryError) {

            console.error(
                "Inventory search error:",
                inventoryError
            );

            results.innerHTML = `

                <div class="no-results">

                    <p>
                        Database error:
                        ${inventoryError.message}
                    </p>

                </div>

            `;

            return;
        }


        // --------------------------------
        // Build result
        // --------------------------------

        let html = `

            <div class="costume-result">

                <div class="result-header">

                    <h2>
                        Costume #${escapeHTML(
            costume.costume_number
        )}
                    </h2>

                    <button
                        type="button"
                        class="close-result"
                        aria-label="Close search result"
                    >
                        ×
                    </button>

                </div>

        `;


        let totalQuantity = 0;


        inventory.forEach(
            function (item) {

                const quantities =
                    item.quantities || {};


                let sizeHTML =
                    "";


                Object.entries(
                    quantities
                ).forEach(
                    function (
                        [size, quantity]
                    ) {

                        quantity =
                            Number(quantity);


                        if (quantity > 0) {

                            totalQuantity +=
                                quantity;


                            sizeHTML += `

                                <div class="size-row">

                                    <span>
                                        ${escapeHTML(
                                size
                            )}
                                    </span>

                                    <strong>
                                        ${quantity}
                                    </strong>

                                </div>

                            `;

                        }

                    }
                );


                const locationType =
                    item.location_type ===
                    "back_room"
                        ? "Back Room"
                        : "Floor";


                html += `

                    <div class="location-card">

                        <h3>
                            ${locationType}
                            —
                            ${escapeHTML(
                    item.location
                )}
                        </h3>

                        ${sizeHTML}

                    </div>

                `;

            }
        );


        html += `

                <div class="total">

                    Total Quantity:

                    <strong>
                        ${totalQuantity}
                    </strong>

                </div>


                <div class="result-buttons">

                    <button
                        type="button"
                        onclick="window.location.href='edit.html?costume=${encodeURIComponent(
            costume.costume_number
        )}'"
                    >
                        EDIT
                    </button>


                    <button
                        type="button"
                        onclick="window.location.href='history.html?costume=${encodeURIComponent(
            costume.costume_number
        )}'"
                    >
                        HISTORY
                    </button>

                </div>


                <button
                    type="button"
                    class="delete-costume-button"
                    onclick="deleteCostume(
                        ${costume.id},
                        '${escapeHTML(
            costume.costume_number
        )}'
                    )"
                >
                    DELETE
                </button>

            </div>

        `;


        results.innerHTML =
            html;


        // --------------------------------
        // Close result
        // --------------------------------

        const closeButton =
            results.querySelector(
                ".close-result"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function () {

                    const costumeInput =
                        document.getElementById(
                            "costumeNumber"
                        );


                    if (costumeInput) {

                        costumeInput.value =
                            "";

                    }


                    results.innerHTML =
                        "";

                }
            );

        }

    }


    // ====================================
    // SEARCH FORM
    // ====================================

    searchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const costumeNumber =
                document
                    .getElementById(
                        "costumeNumber"
                    )
                    .value
                    .trim();


            await searchCostume(
                costumeNumber
            );

        }
    );


    // ====================================
    // RESTORE SEARCH AFTER EDIT
    // ====================================

    const homeParams =
        new URLSearchParams(
            window.location.search
        );


    const returnedCostume =
        homeParams.get(
            "costume"
        );


    if (returnedCostume) {

        const costumeInput =
            document.getElementById(
                "costumeNumber"
            );


        if (costumeInput) {

            costumeInput.value =
                returnedCostume;

        }


        searchCostume(
            returnedCostume
        );


        // Clean URL

        window.history.replaceState(
            {},
            document.title,
            "home.html"
        );

    }


    // ====================================
    // REFRESH WHEN RETURNING
    // ====================================

    window.addEventListener(
        "pageshow",
        function () {

            const costumeInput =
                document.getElementById(
                    "costumeNumber"
                );


            const results =
                document.getElementById(
                    "searchResults"
                );


            if (
                costumeInput &&
                results &&
                costumeInput.value.trim()
            ) {

                searchCostume(
                    costumeInput.value.trim()
                );

            }

        }
    );

}


// ========================================
// ADD COSTUME
// ========================================

const addCostumeForm =
    document.getElementById(
        "addCostumeForm"
    );


if (addCostumeForm) {

    const addMessage =
        document.getElementById(
            "addMessage"
        );


    // ====================================
    // CREATE SIZE ROW
    // ====================================

    function createSizeRow(
        container,
        size,
        removable = false
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "dynamic-size-row";


        row.innerHTML = `

            <span class="size-name">
                ${escapeHTML(size)}
            </span>


            <input
                type="number"
                min="0"
                value="0"
                class="size-quantity"
                data-size="${escapeHTML(size)}"
            >


            <button
                type="button"
                class="quantity-minus"
                aria-label="Decrease ${escapeHTML(size)}"
            >
                −
            </button>


            <button
                type="button"
                class="quantity-plus"
                aria-label="Increase ${escapeHTML(size)}"
            >
                +
            </button>


            ${
            removable
                ? `

                        <button
                            type="button"
                            class="remove-size"
                            aria-label="Remove ${escapeHTML(size)}"
                        >
                            ×
                        </button>

                    `
                : ""
        }

        `;


        setupQuantityControls(
            row
        );


        if (removable) {

            const removeButton =
                row.querySelector(
                    ".remove-size"
                );


            removeButton.addEventListener(
                "click",
                function () {

                    row.remove();

                }
            );

        }


        container.appendChild(
            row
        );

    }


    // ====================================
    // INITIALIZE SIZE LIST
    // ====================================

    const sizeList =
        document.getElementById(
            "sizeList"
        );


    if (sizeList) {

        defaultSizes.forEach(
            function (size) {

                createSizeRow(
                    sizeList,
                    size
                );

            }
        );

    }


    // ====================================
    // ADD CUSTOM SIZE
    // ====================================

    const addCustomSizeButton =
        document.getElementById(
            "addCustomSize"
        );


    if (addCustomSizeButton) {

        addCustomSizeButton.addEventListener(
            "click",
            function () {

                const size =
                    prompt(
                        "Enter the size name:"
                    );


                if (!size) {
                    return;
                }


                const cleanSize =
                    size.trim();


                if (!cleanSize) {
                    return;
                }


                const existingRows =
                    document.querySelectorAll(
                        ".size-quantity"
                    );


                const alreadyExists =
                    Array.from(
                        existingRows
                    ).some(
                        function (input) {

                            return (
                                input.dataset.size
                                    .toLowerCase()
                                ===
                                cleanSize
                                    .toLowerCase()
                            );

                        }
                    );


                if (alreadyExists) {

                    alert(
                        "That size already exists."
                    );

                    return;
                }


                createSizeRow(
                    sizeList,
                    cleanSize,
                    true
                );

            }
        );

    }


    // ====================================
    // ADD COSTUME SUBMIT
    // ====================================

    addCostumeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            addMessage.textContent =
                "Adding costume...";


            const costumeNumber =
                document
                    .getElementById(
                        "costumeNumber"
                    )
                    .value
                    .trim();


            const locationType =
                document.querySelector(
                    'input[name="locationType"]:checked'
                ).value;


            const location =
                document
                    .getElementById(
                        "location"
                    )
                    .value
                    .trim();


            // --------------------------------
            // Collect quantities
            // --------------------------------

            const quantities = {};


            document
                .querySelectorAll(
                    ".size-quantity"
                )
                .forEach(
                    function (input) {

                        const size =
                            input.dataset.size
                                .trim();


                        const quantity =
                            Math.max(
                                0,
                                Number(
                                    input.value
                                ) || 0
                            );


                        if (size) {

                            quantities[size] =
                                quantity;

                        }

                    }
                );


            // --------------------------------
            // Find costume
            // --------------------------------

            let {
                data: costume,
                error: costumeError
            } =
                await supabaseClient
                    .from("costumes")
                    .select("*")
                    .eq(
                        "costume_number",
                        costumeNumber
                    )
                    .maybeSingle();


            if (costumeError) {

                console.error(
                    costumeError
                );


                addMessage.textContent =
                    `Database error: ${costumeError.message}`;

                return;
            }


            // --------------------------------
            // Create costume
            // --------------------------------

            if (!costume) {

                const {
                    data: newCostume,
                    error: newCostumeError
                } =
                    await supabaseClient
                        .from("costumes")
                        .insert({

                            costume_number:
                            costumeNumber

                        })
                        .select()
                        .single();


                if (newCostumeError) {

                    console.error(
                        newCostumeError
                    );


                    addMessage.textContent =
                        `Database error: ${newCostumeError.message}`;

                    return;
                }


                costume =
                    newCostume;

            }


            // --------------------------------
            // Add inventory
            // --------------------------------

            const {
                data: inventory,
                error: inventoryError
            } =
                await supabaseClient
                    .from("inventory")
                    .insert({

                        costume_id:
                        costume.id,

                        location_type:
                        locationType,

                        location:
                        location,

                        quantities:
                        quantities

                    })
                    .select()
                    .single();


            if (inventoryError) {

                console.error(
                    inventoryError
                );


                addMessage.textContent =
                    `Database error: ${inventoryError.message}`;

                return;
            }

            // ========================================
// BUG REPORT
// ========================================

            const reportBugButton =
                document.getElementById(
                    "reportBugButton"
                );

            const bugReportModal =
                document.getElementById(
                    "bugReportModal"
                );

            const closeBugReport =
                document.getElementById(
                    "closeBugReport"
                );

            const submitBugReport =
                document.getElementById(
                    "submitBugReport"
                );

            const bugDescription =
                document.getElementById(
                    "bugDescription"
                );

            const bugReportMessage =
                document.getElementById(
                    "bugReportMessage"
                );


            if (reportBugButton) {

                reportBugButton.addEventListener(
                    "click",
                    function () {

                        bugReportModal.hidden = false;

                        bugDescription.focus();

                    }
                );

            }


            if (closeBugReport) {

                closeBugReport.addEventListener(
                    "click",
                    function () {

                        bugReportModal.hidden = true;

                    }
                );

            }


            if (bugReportModal) {

                bugReportModal.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target ===
                            bugReportModal
                        ) {

                            bugReportModal.hidden =
                                true;

                        }

                    }
                );

            }


            if (submitBugReport) {

                submitBugReport.addEventListener(
                    "click",
                    async function () {

                        const description =
                            bugDescription.value.trim();


                        if (!description) {

                            bugReportMessage.textContent =
                                "Please describe the bug.";

                            return;

                        }


                        submitBugReport.disabled =
                            true;

                        submitBugReport.textContent =
                            "SUBMITTING...";


                        const username =
                            localStorage.getItem(
                                "topStockUsername"
                            ) || "Unknown";


                        const {
                            error
                        } =
                            await supabaseClient
                                .from("bug_reports")
                                .insert({

                                    username:
                                    username,

                                    description:
                                    description

                                });


                        if (error) {

                            console.error(
                                "Bug report error:",
                                error
                            );

                            bugReportMessage.textContent =
                                "Could not submit report. Please try again.";

                            submitBugReport.disabled =
                                false;

                            submitBugReport.textContent =
                                "SUBMIT REPORT";

                            return;

                        }


                        bugDescription.value =
                            "";

                        bugReportMessage.textContent =
                            "Thanks! Bug report submitted.";


                        setTimeout(
                            function () {

                                bugReportModal.hidden =
                                    true;

                                bugReportMessage.textContent =
                                    "";

                                submitBugReport.disabled =
                                    false;

                                submitBugReport.textContent =
                                    "SUBMIT REPORT";

                            },
                            1200
                        );

                    }
                );

            }

            // --------------------------------
            // History
            // --------------------------------

            const username =
                localStorage.getItem(
                    "topStockUsername"
                ) || "Unknown";


            const historyQuantities = {};


            Object.entries(
                quantities
            ).forEach(
                function (
                    [size, quantity]
                ) {

                    if (
                        Number(quantity) > 0
                    ) {

                        historyQuantities[size] =
                            Number(quantity);

                    }

                }
            );


            if (
                Object.keys(
                    historyQuantities
                ).length > 0
            ) {

                const {
                    error: historyError
                } =
                    await supabaseClient
                        .from(
                            "inventory_history"
                        )
                        .insert({

                            costume_id:
                            costume.id,

                            inventory_id:
                            inventory.id,

                            username:
                            username,

                            action:
                                "added costume",

                            size:
                                null,

                            quantity_change:
                                null,

                            old_quantity:
                                null,

                            new_quantity:
                                null,

                            quantities:
                            historyQuantities

                        });


                if (historyError) {

                    console.error(
                        "History error:",
                        historyError
                    );

                }

            }


            // --------------------------------
            // Success
            // --------------------------------

            addMessage.textContent =
                `Costume #${costumeNumber} added successfully!`;


            addCostumeForm.reset();


            if (sizeList) {

                sizeList.innerHTML =
                    "";


                defaultSizes.forEach(
                    function (size) {

                        createSizeRow(
                            sizeList,
                            size
                        );

                    }
                );

            }

        }
    );

}


// ========================================
// EDIT COSTUME
// ========================================

const editContainer =
    document.getElementById(
        "editContainer"
    );


if (editContainer) {

    const editTitle =
        document.getElementById(
            "editTitle"
        );


    const params =
        new URLSearchParams(
            window.location.search
        );


    const costumeNumber =
        params.get(
            "costume"
        );


    if (!costumeNumber) {

        editContainer.innerHTML = `

            <div class="no-results">

                <p>
                    No costume was specified.
                </p>

            </div>

        `;

    } else {

        loadEditCostume();

    }


    // ====================================
    // LOAD EDIT COSTUME
    // ====================================

    async function loadEditCostume() {

        const {
            data: costume,
            error: costumeError
        } =
            await supabaseClient
                .from("costumes")
                .select("*")
                .eq(
                    "costume_number",
                    costumeNumber
                )
                .maybeSingle();


        if (costumeError) {

            editContainer.innerHTML = `

                <div class="no-results">

                    <p>
                        Database error:
                        ${costumeError.message}
                    </p>

                </div>

            `;

            return;
        }


        if (!costume) {

            editContainer.innerHTML = `

                <div class="no-results">

                    <p>
                        Costume #${escapeHTML(
                costumeNumber
            )}
                        was not found.
                    </p>

                </div>

            `;

            return;
        }


        editTitle.textContent =
            `EDIT COSTUME #${costume.costume_number}`;


        const {
            data: inventory,
            error: inventoryError
        } =
            await supabaseClient
                .from("inventory")
                .select("*")
                .eq(
                    "costume_id",
                    costume.id
                )
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        if (inventoryError) {

            editContainer.innerHTML = `

                <div class="no-results">

                    <p>
                        Database error:
                        ${inventoryError.message}
                    </p>

                </div>

            `;

            return;
        }


        if (
            !inventory ||
            inventory.length === 0
        ) {

            editContainer.innerHTML = `

                <div class="no-results">

                    <p>
                        No inventory found.
                    </p>

                </div>

            `;

            return;
        }


        let html = `

            <form
                id="editCostumeForm"
                class="edit-form"
            >

        `;


        inventory.forEach(
            function (item, index) {

                const isBackRoom =
                    item.location_type ===
                    "back_room";


                const quantities =
                    item.quantities || {};


                html += `

                    <section
                        class="edit-location"
                        data-inventory-id="${item.id}"
                    >

                        <h2>
                            Location ${index + 1}
                        </h2>


                        <label>
                            Location Type
                        </label>


                        <div class="location-options">

                            <label class="location-option">

                                <input
                                    type="radio"
                                    name="locationType_${item.id}"
                                    value="top_stock"
                                    ${
                    !isBackRoom
                        ? "checked"
                        : ""
                }
                                >

                                <span>
                                    Floor
                                </span>

                            </label>


                            <label class="location-option">

                                <input
                                    type="radio"
                                    name="locationType_${item.id}"
                                    value="back_room"
                                    ${
                    isBackRoom
                        ? "checked"
                        : ""
                }
                                >

                                <span>
                                    Back Room
                                </span>

                            </label>

                        </div>


                        <label>
                            Location
                        </label>


                        <input
                            type="text"
                            class="edit-location-input"
                            value="${escapeHTML(
                    item.location
                )}"
                            required
                        >


                        <h3>
                            Quantities
                        </h3>


                        <div
                            class="edit-size-list"
                            data-inventory-id="${item.id}"
                        >

                `;


                Object.entries(
                    quantities
                ).forEach(
                    function (
                        [size, quantity]
                    ) {

                        html +=
                            createEditSizeRowHTML(
                                size,
                                Number(
                                    quantity
                                ) || 0,
                                false
                            );

                    }
                );


                html += `

                        </div>


                        <button
                            type="button"
                            class="secondary-button edit-add-size"
                            data-inventory-id="${item.id}"
                        >
                            + ADD SIZE
                        </button>


                    </section>

                `;

            }
        );


        html += `

                <button
                    type="submit"
                    class="save-edit-button"
                >
                    SAVE CHANGES
                </button>


                <p
                    id="editMessage"
                    class="form-message"
                ></p>


            </form>

        `;


        editContainer.innerHTML =
            html;


        setupEditControls(
            costume
        );

    }


    // ====================================
    // EDIT SIZE HTML
    // ====================================

    function createEditSizeRowHTML(
        size,
        quantity,
        removable
    ) {

        return `

            <div
                class="dynamic-size-row edit-size-row"
            >

                <span class="size-name">
                    ${escapeHTML(size)}
                </span>


                <input
                    type="number"
                    min="0"
                    value="${quantity}"
                    class="size-quantity"
                    data-size="${escapeHTML(size)}"
                >


                <button
                    type="button"
                    class="quantity-minus"
                >
                    −
                </button>


                <button
                    type="button"
                    class="quantity-plus"
                >
                    +
                </button>


                ${
            removable
                ? `

                            <button
                                type="button"
                                class="remove-size"
                            >
                                ×
                            </button>

                        `
                : ""
        }

            </div>

        `;

    }


    // ====================================
    // SETUP EDIT
    // ====================================

    function setupEditControls(
        costume
    ) {

        const form =
            document.getElementById(
                "editCostumeForm"
            );


        // --------------------------------
        // Existing quantity controls
        // --------------------------------

        document
            .querySelectorAll(
                ".edit-size-row"
            )
            .forEach(
                function (row) {

                    setupQuantityControls(
                        row
                    );

                }
            );


        // --------------------------------
        // Custom sizes
        // --------------------------------

        document
            .querySelectorAll(
                ".edit-add-size"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const inventoryId =
                                button.dataset
                                    .inventoryId;


                            const list =
                                document.querySelector(
                                    `.edit-size-list[data-inventory-id="${inventoryId}"]`
                                );


                            const size =
                                prompt(
                                    "Enter the size name:"
                                );


                            if (!size) {
                                return;
                            }


                            const cleanSize =
                                size.trim();


                            if (!cleanSize) {
                                return;
                            }


                            const existing =
                                list.querySelectorAll(
                                    ".size-quantity"
                                );


                            const duplicate =
                                Array.from(
                                    existing
                                ).some(
                                    function (
                                        input
                                    ) {

                                        return (
                                            input.dataset
                                                .size
                                                .toLowerCase()
                                            ===
                                            cleanSize
                                                .toLowerCase()
                                        );

                                    }
                                );


                            if (duplicate) {

                                alert(
                                    "That size already exists."
                                );

                                return;
                            }


                            const wrapper =
                                document.createElement(
                                    "div"
                                );


                            wrapper.innerHTML =
                                createEditSizeRowHTML(
                                    cleanSize,
                                    0,
                                    true
                                );


                            const row =
                                wrapper.firstElementChild;


                            list.appendChild(
                                row
                            );


                            setupQuantityControls(
                                row
                            );


                            const removeButton =
                                row.querySelector(
                                    ".remove-size"
                                );


                            removeButton.addEventListener(
                                "click",
                                function () {

                                    row.remove();

                                }
                            );

                        }
                    );

                }
            );


        // --------------------------------
        // Save
        // --------------------------------

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const message =
                    document.getElementById(
                        "editMessage"
                    );


                message.textContent =
                    "Saving changes...";


                const username =
                    localStorage.getItem(
                        "topStockUsername"
                    ) || "Unknown";


                const sections =
                    document.querySelectorAll(
                        ".edit-location"
                    );


                let saveFailed =
                    false;


                // =================================
                // SAVE EACH LOCATION
                // =================================

                for (
                    const section
                    of sections
                    ) {

                    const inventoryId =
                        Number(
                            section.dataset
                                .inventoryId
                        );


                    const typeInput =
                        section.querySelector(
                            `input[name="locationType_${inventoryId}"]:checked`
                        );


                    const locationType =
                        typeInput
                            ? typeInput.value
                            : "top_stock";


                    const location =
                        section
                            .querySelector(
                                ".edit-location-input"
                            )
                            .value
                            .trim();


                    const quantities = {};


                    section
                        .querySelectorAll(
                            ".size-quantity"
                        )
                        .forEach(
                            function (input) {

                                const size =
                                    input.dataset
                                        .size
                                        .trim();


                                const quantity =
                                    Math.max(
                                        0,
                                        Number(
                                            input.value
                                        ) || 0
                                    );


                                if (size) {

                                    quantities[size] =
                                        quantity;

                                }

                            }
                        );


                    // --------------------------------
                    // Get original inventory
                    // --------------------------------

                    const {
                        data: oldInventory,
                        error: oldError
                    } =
                        await supabaseClient
                            .from("inventory")
                            .select("*")
                            .eq(
                                "id",
                                inventoryId
                            )
                            .single();


                    if (oldError) {

                        console.error(
                            "Old inventory error:",
                            oldError
                        );

                        saveFailed =
                            true;

                        break;
                    }


                    // --------------------------------
                    // Update inventory
                    // --------------------------------

                    const {
                        error: updateError
                    } =
                        await supabaseClient
                            .from("inventory")
                            .update({

                                location_type:
                                locationType,

                                location:
                                location,

                                quantities:
                                quantities

                            })
                            .eq(
                                "id",
                                inventoryId
                            );


                    if (updateError) {

                        console.error(
                            "Update error:",
                            updateError
                        );

                        saveFailed =
                            true;

                        break;
                    }


                    // =================================
                    // HISTORY
                    // =================================

                    const oldQuantities =
                        oldInventory.quantities ||
                        {};


                    const allSizes =
                        new Set([
                            ...Object.keys(
                                oldQuantities
                            ),
                            ...Object.keys(
                                quantities
                            )
                        ]);


                    for (
                        const size
                        of allSizes
                        ) {

                        const oldQuantity =
                            Number(
                                oldQuantities[size]
                            ) || 0;


                        const newQuantity =
                            Number(
                                quantities[size]
                            ) || 0;


                        if (
                            oldQuantity !==
                            newQuantity
                        ) {

                            const change =
                                newQuantity -
                                oldQuantity;


                            const {
                                error:
                                    historyError
                            } =
                                await supabaseClient
                                    .from(
                                        "inventory_history"
                                    )
                                    .insert({

                                        costume_id:
                                        costume.id,

                                        inventory_id:
                                        inventoryId,

                                        username:
                                        username,

                                        action:
                                            "changed quantity",

                                        size:
                                        size,

                                        quantity_change:
                                        change,

                                        old_quantity:
                                        oldQuantity,

                                        new_quantity:
                                        newQuantity

                                    });


                            if (historyError) {

                                console.error(
                                    "History error:",
                                    historyError
                                );

                            }

                        }

                    }

                }


                if (saveFailed) {

                    message.textContent =
                        "Something went wrong while saving.";

                    return;
                }


                // =================================
                // SUCCESS
                // =================================

                message.textContent =
                    "Changes saved!";


                setTimeout(
                    function () {

                        window.location.href =
                            `home.html?costume=${encodeURIComponent(
                                costume.costume_number
                            )}`;

                    },
                    500
                );

            }
        );

    }

}


// ========================================
// QUANTITY CONTROLS
// ========================================

function setupQuantityControls(
    row
) {

    const input =
        row.querySelector(
            ".size-quantity"
        );


    const minus =
        row.querySelector(
            ".quantity-minus"
        );


    const plus =
        row.querySelector(
            ".quantity-plus"
        );


    if (
        !input ||
        !minus ||
        !plus
    ) {
        return;
    }


    // ------------------------------------
    // Minus
    // ------------------------------------

    minus.addEventListener(
        "click",
        function () {

            let value =
                Number(
                    input.value
                ) || 0;


            input.value =
                Math.max(
                    0,
                    value - 1
                );

        }
    );


    // ------------------------------------
    // Plus
    // ------------------------------------

    plus.addEventListener(
        "click",
        function () {

            let value =
                Number(
                    input.value
                ) || 0;


            input.value =
                value + 1;

        }
    );


    // ------------------------------------
    // Manual typing
    // ------------------------------------

    input.addEventListener(
        "input",
        function () {

            let value =
                Number(
                    input.value
                );


            if (
                Number.isNaN(value) ||
                value < 0
            ) {

                input.value =
                    0;

            }

        }
    );

}


// ========================================
// DELETE COSTUME
// ========================================

async function deleteCostume(
    costumeId,
    costumeNumber
) {

    const confirmed =
        confirm(
            `Are you sure you want to delete costume #${costumeNumber}?\n\nThis will remove all inventory for this costume.`
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("costumes")
            .delete()
            .eq(
                "id",
                costumeId
            );


    if (error) {

        alert(
            "Could not delete costume:\n\n" +
            error.message
        );

        return;

    }


    // Clear the current result

    const result =
        document.getElementById(
            "searchResults"
        );


    if (result) {

        result.innerHTML = `

            <div class="no-results">

                <p>
                    Costume #${escapeHTML(
            costumeNumber
        )} was deleted.
                </p>

            </div>

        `;

    }


    // Clear search box

    const searchInput =
        document.getElementById(
            "costumeNumber"
        );


    if (searchInput) {

        searchInput.value = "";

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );


}

// ========================================
// BUG REPORT
// ========================================

const submitBugReport =
    document.getElementById(
        "submitBugReport"
    );


if (submitBugReport) {

    submitBugReport.addEventListener(
        "click",
        async function () {

            const description =
                document
                    .getElementById(
                        "bugDescription"
                    )
                    .value
                    .trim();


            const message =
                document.getElementById(
                    "bugReportMessage"
                );


            if (!description) {

                message.textContent =
                    "Please describe the bug.";

                return;

            }


            submitBugReport.disabled =
                true;

            submitBugReport.textContent =
                "SUBMITTING...";


            const username =
                localStorage.getItem(
                    "topStockUsername"
                ) || "Unknown";


            const {
                error
            } =
                await supabaseClient
                    .from("bug_reports")
                    .insert({

                        username:
                        username,

                        description:
                        description

                    });


            if (error) {

                console.error(
                    "Bug report error:",
                    error
                );

                message.textContent =
                    "Could not submit report.";

                submitBugReport.disabled =
                    false;

                submitBugReport.textContent =
                    "SUBMIT REPORT";

                return;

            }


            message.textContent =
                "Bug report submitted!";


            document.getElementById(
                "bugDescription"
            ).value = "";


            setTimeout(
                function () {

                    document.getElementById(
                        "bugReportModal"
                    ).hidden = true;

                    message.textContent =
                        "";

                    submitBugReport.disabled =
                        false;

                    submitBugReport.textContent =
                        "SUBMIT REPORT";

                },
                1200
            );

        }
    );

}