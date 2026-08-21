const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { initDb, query } = require("./config/db");
const extensionRoutes = require("./routes/extensionRoutes");

dotenv.config({
    path: path.resolve(__dirname, ".env")
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API and Database Health Check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Health check status
 */
app.get("/api/health", async (req, res) => {
    const dbUrl =
        process.env.DATABASE_URL ||
        process.env.DATABASE_URI ||
        process.env.DB_URL ||
        process.env.POSTGRES_URL ||
        process.env.PG_URL;

    try {
        await query("SELECT 1");
        res.status(200).json({
            success: true,
            message: "Extension Manager API is running healthy",
            dbConnected: true,
            dbHost: dbUrl ? "Cloud Database URL configured" : (process.env.DB_HOST || "localhost"),
            timestamp: new Date().toISOString()
        });
    } catch (dbErr) {
        res.status(200).json({
            success: true,
            message: "API is up but DB connection failed",
            dbConnected: false,
            dbError: dbErr.message || String(dbErr),
            dbHost: dbUrl ? "Cloud Database URL configured" : (process.env.DB_HOST || "localhost"),
            envKeysPresent: Object.keys(process.env).filter(k => k.includes("DB") || k.includes("POSTGRES") || k.includes("DATA")),
            timestamp: new Date().toISOString()
        });
    }
});

app.use("/api/extensions", extensionRoutes);

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    console.error("API Error:", err);

    // Handle Multer specific errors
    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size exceeds the 5MB limit"
            });
        }

        return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`
        });
    }

    const statusCode =
        err.status ||
        (res.statusCode !== 200 && res.statusCode !== 201
            ? res.statusCode
            : 500);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: err.message || String(err)
    });
});

const startServer = async () => {
    try {
        await initDb();

        app.listen(PORT, () => {
            console.log("===========================================");
            console.log("Extension Manager Backend Server Running");
            console.log(`URL:  http://localhost:${PORT}`);
            console.log(`API:  http://localhost:${PORT}/api/extensions`);
            console.log(`Docs: http://localhost:${PORT}/api-docs`);
            console.log("===========================================");
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
