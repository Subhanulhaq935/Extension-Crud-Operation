const API_ORIGIN = "http://localhost:3001";
const API_URL = `${API_ORIGIN}/api/extensions`;

const container = document.getElementById("extensions-container");
const filterButtons = document.querySelectorAll(".filter-button");
const searchInput = document.getElementById("search-input");
const searchClearBtn = document.getElementById("search-clear");
const extensionCountE1 = document.getElementById("extension-count");
const emptyStateE1 = document.getElementById("empty-state");

const modalOverlay = document.getElementById("extension-modal");
const modalTitle = document.getElementById("modal-title");
const modalCloseBtn = document.getElementById("modal-close");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalSubmitBtn = document.getElementById("modal-submit-btn");
const extensionForm = document.getElementById("extension-form");
const formExtensionId = document.getElementById("form-extension-id");
const formName = document.getElementById("form-name");
const formDescription = document.getElementById("form-description");
const formLogo = document.getElementById("form-logo");
const formIsActive = document.getElementById("form-is-active");
const logoPreviewImg = document.getElementById("logo-preview-img");
const logoPreviewPlaceholder = document.getElementById("logo-preview-placeholder");
const logoRequiredMarker = document.getElementById("logo-required-marker");
const btnAddExtension = document.getElementById("btn-add-extension");


const deleteModal = document.getElementById("delete-modal");
const deleteModalCloseBtn = document.getElementById("delete-modal-close");
const deleteCancelBtn = document.getElementById("delete-cancel-btn");
const deleteConfirmBtn = document.getElementById("delete-confirm-btn");
const deleteExtensionName = document.getElementById("delete-extension-name");


const toastContainer = document.getElementById("toast-container");

let allExtensions = [];
let currentFilter = "all";
let currentSearchQuery = "";
let pendingDeletedId = null;

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = type === "success" ? "✓" : "⚠";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";

        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 2. Initialize Data
async function init_data() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const result = await response.json();

        allExtensions = result.data || [];

        console.log(
            "Extensions loaded from PostgreSQL API:",
            allExtensions
        );

        renderCards();

    } catch (error) {
        console.error("Error fetching extensions from API:", error);

        showToast(
            "Could not connect to PostgreSQL backend. Ensure server is running on port 5000.",
            "error"
        );

        renderCards();
    }
}


// 3. Get Filtered Extensions
function getFilteredExtensions() {
    return allExtensions.filter((item) => {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && item.isActive) ||
            (currentFilter === "inactive" && !item.isActive);

        const q = currentSearchQuery.trim().toLowerCase();

        const matchesSearch =
            !q ||
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q));

        return matchesFilter && matchesSearch;
    });
}


// 4. Render Cards
function renderCards() {
    container.innerHTML = "";

    const list = getFilteredExtensions();

    extensionCountEl.textContent =
        `${allExtensions.length} extension${allExtensions.length === 1 ? "" : "s"}`;

    if (list.length === 0) {
        emptyStateEl.style.display = "block";
    } else {
        emptyStateEl.style.display = "none";
    }

    list.forEach((item) => {

        const card = document.createElement("div");

        card.className = "card";

        card.setAttribute("data-id", item.id);

        const logoSrc = item.logo.startsWith("http")
            ? item.logo
            : `${API_ORIGIN}${item.logo}`;

        card.innerHTML = `
            <div class="card-top">

                <img 
                    src="${logoSrc}" 
                    alt="${item.name}" 
                    class="card-logo"
                >

                <div class="card-info">
                    <h3 class="card-name">${item.name}</h3>
                    <p class="card-desc">${item.description}</p>
                </div>

            </div>

            <div class="card-bottom">

                <div class="card-buttons">

                    <button 
                        class="btn-card-action btn-card-edit" 
                        data-id="${item.id}">
                        Edit
                    </button>

                    <button 
                        class="btn-card-action btn-card-remove" 
                        data-id="${item.id}">
                        Remove
                    </button>

                </div>

                <label class="toggle-switch">

                    <input 
                        type="checkbox" 
                        class="status-toggle" 
                        data-id="${item.id}"
                        ${item.isActive ? "checked" : ""}
                    >

                    <span class="slider"></span>

                </label>

            </div>
        `;

        container.appendChild(card);
    });
}

// ==========================================
// Filter and Search Events
// ==========================================

filterButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        // Remove active class from all buttons
        filterButtons.forEach((b) =>
            b.classList.remove("active")
        );

        // Add active class to clicked button
        btn.classList.add("active");

        // Get selected filter
        currentFilter =
            btn.getAttribute("data-filter");

        // Re-render cards
        renderCards();
    });
});


searchInput.addEventListener("input", (e) => {

    // Get search text
    currentSearchQuery = e.target.value;

    // Show / hide clear button
    searchClearBtn.style.display =
        currentSearchQuery ? "block" : "none";

    // Re-render cards
    renderCards();
});


searchClearBtn.addEventListener("click", () => {

    searchInput.value = "";

    currentSearchQuery = "";

    searchClearBtn.style.display = "none";

    searchInput.focus();

    renderCards();
});


// ==========================================
// Card Actions: Toggle Status, Edit, Delete
// ==========================================

container.addEventListener("change", async (e) => {

    if (e.target.classList.contains("status-toggle")) {

        const id =
            e.target.getAttribute("data-id");

        const newStatus =
            e.target.checked;

        const item = allExtensions.find(
            (ext) =>
                String(ext.id) === String(id)
        );

        if (item) {
            item.isActive = newStatus;
        }

        try {

            const formData = new FormData();

            formData.append(
                "isActive",
                newStatus
            );

            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "PUT",
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to update status on server"
                );
            }

            // Re-render if filter no longer matches
            if (
                currentFilter === "active" &&
                !newStatus
            ) {
                renderCards();

            } else if (
                currentFilter === "inactive" &&
                newStatus
            ) {
                renderCards();
            }

            showToast(
                `"${item ? item.name : "Extension"}" is now ${newStatus
                    ? "active"
                    : "inactive"
                }`
            );

        } catch (error) {

            console.error(
                "Error updating status:",
                error
            );

            showToast(
                "Failed to update active status on server",
                "error"
            );

            // Revert UI
            if (item) {
                item.isActive = !newStatus;
            }

            e.target.checked = !newStatus;
        }
    }
});


container.addEventListener("click", (e) => {

    // Remove button
    if (
        e.target.classList.contains(
            "btn-card-remove"
        )
    ) {

        const id =
            e.target.getAttribute("data-id");

        const name =
            e.target.getAttribute("data-name");

        openDeleteModal(id, name);
    }


    // Edit button
    if (
        e.target.classList.contains(
            "btn-card-edit"
        )
    ) {

        const id =
            e.target.getAttribute("data-id");

        const item = allExtensions.find(
            (ext) =>
                String(ext.id) === String(id)
        );

        if (item) {
            openEditModal(item);
        }
    }
});


// ==========================================
// Modal Handlers
// ==========================================

function openAddModal() {

    formExtensionId.value = "";

    modalTitle.textContent =
        "Add New Extension";

    extensionForm.reset();

    formIsActive.checked = true;

    logoPreviewImg.style.display = "none";

    logoPreviewPlaceholder.style.display =
        "block";

    logoPreviewPlaceholder.textContent =
        "No file chosen";

    logoRequiredMarker.style.display =
        "inline";

    formLogo.required = true;

    modalSubmitBtn.textContent =
        "Create Extension";

    modalOverlay.classList.add("open");

    modalOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    formName.focus();
}


function openEditModal(extension) {

    formExtensionId.value =
        extension.id;

    modalTitle.textContent =
        "Edit Extension";

    formName.value =
        extension.name || "";

    formDescription.value =
        extension.description || "";

    formIsActive.checked =
        Boolean(extension.isActive);

    formLogo.value = "";

    const logoSrc =
        extension.logo.startsWith("http")
            ? extension.logo
            : `${API_ORIGIN}${extension.logo}`;

    logoPreviewImg.src =
        logoSrc;

    logoPreviewImg.style.display =
        "block";

    logoPreviewPlaceholder.style.display =
        "none";

    // Logo optional during edit
    logoRequiredMarker.style.display =
        "none";

    formLogo.required = false;

    modalSubmitBtn.textContent =
        "Update Extension";

    modalOverlay.classList.add("open");

    modalOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    formName.focus();
}


function closeModal() {

    modalOverlay.classList.remove("open");

    modalOverlay.setAttribute(
        "aria-hidden",
        "true"
    );
}


// Add button
btnAddExtension.addEventListener(
    "click",
    openAddModal
);


// Close button
modalCloseBtn.addEventListener(
    "click",
    closeModal
);


// Cancel button
modalCancelBtn.addEventListener(
    "click",
    closeModal
);


// Close when clicking outside modal
modalOverlay.addEventListener(
    "click",
    (e) => {

        if (e.target === modalOverlay) {
            closeModal();
        }

    }
);


// ==========================================
// Logo File Preview
// ==========================================

formLogo.addEventListener(
    "change",
    (e) => {

        const file =
            e.target.files[0];

        if (file) {

            const reader =
                new FileReader();

            reader.onload =
                (event) => {

                    logoPreviewImg.src =
                        event.target.result;

                    logoPreviewImg.style.display =
                        "block";

                    logoPreviewPlaceholder.style.display =
                        "none";
                };

            reader.readAsDataURL(file);
        }
    }
);


// ==========================================
// Create / Update Extension
// ==========================================

extensionForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const id =
            formExtensionId.value;

        const isEdit =
            Boolean(id);

        const formData =
            new FormData();

        formData.append(
            "name",
            formName.value.trim()
        );

        formData.append(
            "description",
            formDescription.value.trim()
        );

        formData.append(
            "isActive",
            formIsActive.checked
        );

        if (formLogo.files[0]) {

            formData.append(
                "logo",
                formLogo.files[0]
            );
        }

        modalSubmitBtn.disabled =
            true;

        modalSubmitBtn.textContent =
            isEdit
                ? "Updating..."
                : "Creating...";

        try {

            const url =
                isEdit
                    ? `${API_URL}/${id}`
                    : API_URL;

            const method =
                isEdit
                    ? "PUT"
                    : "POST";

            const response =
                await fetch(
                    url,
                    {
                        method,
                        body: formData
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Operation failed"
                );
            }


            // Update existing extension
            if (isEdit) {

                const index =
                    allExtensions.findIndex(
                        (item) =>
                            String(item.id) ===
                            String(id)
                    );

                if (index !== -1) {

                    const updatedData =
                    {
                        ...result.data
                    };

                    if (
                        formLogo.files[0]
                    ) {

                        updatedData.logo =
                            `${updatedData.logo}?t=${Date.now()}`;
                    }

                    allExtensions[index] =
                        updatedData;
                }

                showToast(
                    "Extension updated successfully"
                );


                // Create new extension
            } else {

                allExtensions.unshift(
                    result.data
                );

                showToast(
                    "Extension created successfully"
                );
            }


            renderCards();

            closeModal();

        } catch (error) {

            console.error(
                "Form submit error:",
                error
            );

            showToast(
                error.message ||
                "Failed to save extension",
                "error"
            );

        } finally {

            modalSubmitBtn.disabled =
                false;

            modalSubmitBtn.textContent =
                isEdit
                    ? "Update Extension"
                    : "Create Extension";
        }
    }
);


// ==========================================
// Delete Modal Handlers
// ==========================================

function openDeleteModal(id, name) {

    pendingDeleteId = id;

    deleteExtensionName.textContent =
        name
            ? `"${name}"`
            : "this extension";

    deleteModal.classList.add(
        "open"
    );

    deleteModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeDeleteModal() {

    pendingDeleteId = null;

    deleteModal.classList.remove(
        "open"
    );

    deleteModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


// Close delete modal
deleteModalCloseBtn.addEventListener(
    "click",
    closeDeleteModal
);


// Cancel delete
deleteCancelBtn.addEventListener(
    "click",
    closeDeleteModal
);


// Close when clicking outside
deleteModal.addEventListener(
    "click",
    (e) => {

        if (e.target === deleteModal) {
            closeDeleteModal();
        }

    }
);


// ==========================================
// Delete Extension
// ==========================================

deleteConfirmBtn.addEventListener(
    "click",
    async () => {

        if (!pendingDeleteId) {
            return;
        }

        deleteConfirmBtn.disabled =
            true;

        deleteConfirmBtn.textContent =
            "Deleting...";

        try {

            const response =
                await fetch(
                    `${API_URL}/${pendingDeleteId}`,
                    {
                        method: "DELETE"
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Failed to delete extension"
                );
            }


            // Remove from local array
            allExtensions =
                allExtensions.filter(
                    (item) =>
                        String(item.id) !==
                        String(pendingDeleteId)
                );


            renderCards();

            closeDeleteModal();

            showToast(
                "Extension deleted successfully"
            );

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            showToast(
                error.message ||
                "Could not delete extension",
                "error"
            );

        } finally {

            deleteConfirmBtn.disabled =
                false;

            deleteConfirmBtn.textContent =
                "Delete";
        }
    }
);


// ==========================================
// Start Application
// ==========================================

init_data();