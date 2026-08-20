const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});


const dbUrl =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URI ||
    process.env.DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.PG_URL;

const isProduction =
    process.env.NODE_ENV === "production" || Boolean(dbUrl);

const poolConfig = dbUrl
    ? {
          connectionString: dbUrl,
          ssl: {
              rejectUnauthorized: false
          }
      }
    : {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT, 10) || 5432,
          database: process.env.DB_NAME || "extension_manager_crud",
          user: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD,
          ssl:
              isProduction &&
              process.env.DB_HOST !== "localhost" &&
              process.env.DB_HOST !== "127.0.0.1"
                  ? { rejectUnauthorized: false }
                  : false
      };

const pool = new Pool(poolConfig);


pool.on("connect", () => {
    console.log(
        "Connected to PostgreSQL database:",
        process.env.DB_NAME || "extension_manager_crud"
    );
});


pool.on("error", (err) => {
    console.error(
        "Unexpected error on idle PostgreSQL client:",
        err.message
    );
});


// Initialize database table
const initDb = async () => {

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS extensions (
            id SERIAL PRIMARY KEY,
            logo BYTEA NOT NULL,
            logo_type VARCHAR(100) NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE
        );
    `;

    try {

        await pool.query(createTableQuery);

        console.log(
            "Database table 'extensions' verified/initialized."
        );

    } catch (error) {

        console.error(
            "Error creating/verifying 'extensions' table:",
            error.message
        );
    }
};


// Export database functions
module.exports = {
    pool,

    query: (text, params) =>
        pool.query(text, params),

    initDb
};