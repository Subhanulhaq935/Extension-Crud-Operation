const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Extension Manager API",
        version: "1.0.0",
        description: "API documentation for the Extensions Manager CRUD operations with logo image upload support.",
        contact: {
            name: "API Support"
        }
    },
    servers: [
        {
            url: "http://localhost:3001",
            description: "Local Development Server"
        }
    ],
    components: {
        schemas: {
            Extension: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        example: 1
                    },
                    name: {
                        type: "string",
                        example: "React Developer Tools"
                    },
                    description: {
                        type: "string",
                        example: "Adds React debugging tools to the Chrome Developer Tools."
                    },
                    isActive: {
                        type: "boolean",
                        example: true
                    },
                    logo: {
                        type: "string",
                        example: "/api/extensions/1/logo"
                    }
                }
            },
            ApiResponse: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: true
                    },
                    message: {
                        type: "string",
                        example: "Operation successful"
                    }
                }
            }
        }
    }
};

const options = {
    swaggerDefinition,
    // Path to the API docs files (routes and server)
    apis: ["./routes/*.js", "./server.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
