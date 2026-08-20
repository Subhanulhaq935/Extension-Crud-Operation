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

const getAllExtensions = async (req, res, next) => {
    try {
        const result = await query(
            "SELECT id, name, description, is_active FROM extensions ORDER BY id ASC"
        );

        const extensions = result.rows.map((row) => ({
            id: row.id,
            logo: `/api/extensions/${row.id}/logo`,
            name: row.name,
            description: row.description,
            isActive: row.is_active
        }));

        res.status(200).json({
            success: true,
            data: extensions
        });
    } catch (error) {
        next(error);
    }
};