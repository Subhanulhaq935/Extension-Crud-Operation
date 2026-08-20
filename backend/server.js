const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { initDb } = require("./config/db");
const extensionRoutes = require("./routes/extensionRoutes");

// Load environment variables from .env
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

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Extension Manager API is running healthy",
        timestamp: new Date().toISOString()
    });
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
    console.error("API Error:", err.message);

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
        message: err.message || "Internal Server Error"
    });
});
const startServer = async () => {
    try {
        await initDb();

        app.listen(PORT, () => {
            console.log("===========================================");
            console.log("Extension Manager Backend Server Running");
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`API: http://localhost:${PORT}/api/extensions`);
            console.log("===========================================");
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();