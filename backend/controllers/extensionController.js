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

const getExtensionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            "SELECT id, name, description, is_active FROM extensions WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Extension with ID ${id} not found`
            });
        }

        const row = result.rows[0];

        res.status(200).json({
            success: true,
            data: {
                id: row.id,
                logo: `/api/extensions/${row.id}/logo`,
                name: row.name,
                description: row.description,
                isActive: row.is_active
            }
        });
    } catch (error) {
        next(error);
    }
};

const getExtensionLogo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            "SELECT logo, logo_type FROM extensions WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0 || !result.rows[0].logo) {
            return res.status(404).json({
                success: false,
                message: `Logo for extension with ID ${id} not found`
            });
        }

        const { logo, logo_type } = result.rows[0];

        res.setHeader(
            "Content-Type",
            logo_type || "image/svg+xml"
        );

        res.setHeader(
            "Cache-Control",
            "public, max-age=86400"
        );

        res.send(logo);
    } catch (error) {
        next(error);
    }
};

