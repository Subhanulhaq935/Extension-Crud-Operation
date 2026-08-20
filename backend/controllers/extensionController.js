const { query } = require("../config/db");

const parseIsActive = (val, defaultValue = true) => {
    if (val === undefined || val === null || val === "") return defaultValue;

    if (typeof val === "boolean") return val;

    if (typeof val === "string") {
        const lower = val.trim().toLowerCase();

        if (lower === "true" || lower === "1") return true;
        if (lower === "false" || lower === "0") return false;
    }

    return defaultValue;
};