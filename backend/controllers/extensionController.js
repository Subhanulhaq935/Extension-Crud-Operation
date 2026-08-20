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

const createExtension = async (req, res, next) => {
    try {
        const { name, description, isActive } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Extension name is required and cannot be empty"
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Extension description is required and cannot be empty"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Logo image file is required when creating an extension"
            });
        }

        const logoBuffer = req.file.buffer;
        const logoType = req.file.mimetype;
        const activeStatus = parseIsActive(isActive, true);

        const insertQuery = `
            INSERT INTO extensions
            (name, description, is_active, logo, logo_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, description, is_active;
        `;

        const result = await query(insertQuery, [
            name.trim(),
            description.trim(),
            activeStatus,
            logoBuffer,
            logoType
        ]);

        const newExtension = result.rows[0];

        res.status(201).json({
            success: true,
            message: "Extension created successfully",
            data: {
                id: newExtension.id,
                logo: `/api/extensions/${newExtension.id}/logo`,
                name: newExtension.name,
                description: newExtension.description,
                isActive: newExtension.is_active
            }
        });
    } catch (error) {
        next(error);
    }
};


const updateExtension = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        // Check if extension exists
        const existingResult = await query(
            "SELECT id, name, description, is_active, logo_type FROM extensions WHERE id = $1",
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Extension with ID ${id} not found`
            });
        }

        const current = existingResult.rows[0];

        const updatedName =
            name !== undefined ? name.trim() : current.name;

        const updatedDescription =
            description !== undefined
                ? description.trim()
                : current.description;

        const updatedIsActive =
            isActive !== undefined
                ? parseIsActive(isActive, current.is_active)
                : current.is_active;

        if (name !== undefined && !updatedName) {
            return res.status(400).json({
                success: false,
                message: "Extension name cannot be empty"
            });
        }

        if (description !== undefined && !updatedDescription) {
            return res.status(400).json({
                success: false,
                message: "Extension description cannot be empty"
            });
        }

        let updateResult;

        // If new logo is provided
        if (req.file) {
            const logoBuffer = req.file.buffer;
            const logoType = req.file.mimetype;

            const updateWithLogoQuery = `
                UPDATE extensions
                SET name = $1,
                    description = $2,
                    is_active = $3,
                    logo = $4,
                    logo_type = $5
                WHERE id = $6
                RETURNING id, name, description, is_active;
            `;

            updateResult = await query(updateWithLogoQuery, [
                updatedName,
                updatedDescription,
                updatedIsActive,
                logoBuffer,
                logoType,
                id
            ]);
        } else {
            // Keep existing logo
            const updateQuery = `
                UPDATE extensions
                SET name = $1,
                    description = $2,
                    is_active = $3
                WHERE id = $4
                RETURNING id, name, description, is_active;
            `;

            updateResult = await query(updateQuery, [
                updatedName,
                updatedDescription,
                updatedIsActive,
                id
            ]);
        }

        const updated = updateResult.rows[0];

        res.status(200).json({
            success: true,
            message: "Extension updated successfully",
            data: {
                id: updated.id,
                logo: `/api/extensions/${updated.id}/logo`,
                name: updated.name,
                description: updated.description,
                isActive: updated.is_active
            }
        });
    } catch (error) {
        next(error);
    }
};

const deleteExtension = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            "DELETE FROM extensions WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: `Extension with ID ${id} not found`
            });
        }

        res.status(200).json({
            success: true,
            message: "Extension deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getExtensions,
    getExtension,
    createExtension,
    updateExtension,
    deleteExtension
};