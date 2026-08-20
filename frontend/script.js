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