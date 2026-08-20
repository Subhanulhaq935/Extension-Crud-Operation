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

let allExtensions = [];
let currentFilter = "all";
let currentSearchQuery = "";
let pendingDeletedId = null;
