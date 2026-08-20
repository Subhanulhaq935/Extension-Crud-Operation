const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load .env
dotenv.config({
    path: path.resolve(__dirname, ".env")
});

const { pool, initDb } = require("./config/db");

const seedData = async () => {
    try {
        console.log(
            "🌱 Starting PostgreSQL database seed for Extension Manager..."
        );

        // Ensure table exists
        await initDb();

        // Path to data.json
        const dataJsonPath = path.resolve(
            __dirname,
            "../data.json"
        );

        if (!fs.existsSync(dataJsonPath)) {
            throw new Error(
                `data.json not found at ${dataJsonPath}`
            );
        }

        // Read data.json
        const rawData = fs.readFileSync(
            dataJsonPath,
            "utf-8"
        );

        // Convert JSON string into JavaScript array
        const extensions = JSON.parse(rawData);

        console.log(
            `Found ${extensions.length} extensions in data.json.`
        );

        let insertedCount = 0;
        let skippedCount = 0;

        // Process every extension
        for (const item of extensions) {

            // Check if extension already exists
            const existingCheck = await pool.query(
                "SELECT id FROM extensions WHERE LOWER(name) = LOWER($1)",
                [item.name]
            );

            if (existingCheck.rows.length > 0) {

                console.log(
                    `- Skipping "${item.name}" (already exists with ID ${existingCheck.rows[0].id})`
                );

                skippedCount++;

                continue;
            }

            // Resolve logo file path
            const relativeLogoPath =
                item.logo.replace(/^\.\//, "");

            const absoluteLogoPath =
                path.resolve(
                    __dirname,
                    "..",
                    relativeLogoPath
                );

            // Check logo exists
            if (!fs.existsSync(absoluteLogoPath)) {

                console.warn(
                    `⚠️ Warning: Logo file not found at ${absoluteLogoPath}. Skipping.`
                );

                continue;
            }

            // Read logo as binary data
            const logoBuffer =
                fs.readFileSync(
                    absoluteLogoPath
                );

            const logoMimeType =
                "image/svg+xml";

            // Insert extension into PostgreSQL
            const insertQuery = `
                INSERT INTO extensions
                (
                    name,
                    description,
                    is_active,
                    logo,
                    logo_type
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `;

            const res = await pool.query(
                insertQuery,
                [
                    item.name,
                    item.description,
                    Boolean(item.isActive),
                    logoBuffer,
                    logoMimeType
                ]
            );

            console.log(
                `+ Seeded "${item.name}" with ID ${res.rows[0].id} (Logo BYTEA size: ${logoBuffer.length} bytes)`
            );

            insertedCount++;
        }

        console.log(
            "=========================================="
        );

        console.log(
            `Seeding complete! Inserted: ${insertedCount}, Skipped: ${skippedCount}, Total: ${extensions.length}`
        );

        console.log(
            "=========================================="
        );

    } catch (error) {

        console.error(
            "Seeding failed:",
            error.message
        );

    } finally {

        // Close PostgreSQL connection
        await pool.end();

        process.exit(0);
    }
};

// Start seeding
seedData();