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
