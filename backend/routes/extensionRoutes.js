const express = require("express");
const router = express.Router();

const {
    getAllExtensions,
    getExtensionById,
    getExtensionLogo,
    createExtension,
    updateExtension,
    deleteExtension
} = require("../controllers/extensionController");

const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   name: Extensions
 *   description: Extension management endpoints
 */

/**
 * @swagger
 * /api/extensions:
 *   get:
 *     summary: Retrieve all extensions
 *     tags: [Extensions]
 *     responses:
 *       200:
 *         description: List of all extensions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Extension'
 */
router.get("/", getAllExtensions);

/**
 * @swagger
 * /api/extensions/{id}:
 *   get:
 *     summary: Get an extension by ID
 *     tags: [Extensions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The extension ID
 *     responses:
 *       200:
 *         description: Extension details found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Extension'
 *       404:
 *         description: Extension not found
 */
router.get("/:id", getExtensionById);

/**
 * @swagger
 * /api/extensions/{id}/logo:
 *   get:
 *     summary: Get logo image of an extension
 *     tags: [Extensions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The extension ID
 *     responses:
 *       200:
 *         description: Extension logo image binary
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Logo not found
 */
router.get("/:id/logo", getExtensionLogo);

/**
 * @swagger
 * /api/extensions:
 *   post:
 *     summary: Create a new extension
 *     tags: [Extensions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - logo
 *             properties:
 *               name:
 *                 type: string
 *                 description: Extension name
 *                 example: Vue DevTools
 *               description:
 *                 type: string
 *                 description: Extension description
 *                 example: Browser devtools extension for debugging Vue.js applications.
 *               isActive:
 *                 type: boolean
 *                 description: Whether extension is active
 *                 default: true
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo image file (PNG, JPG, SVG, etc.)
 *     responses:
 *       201:
 *         description: Extension created successfully
 *       400:
 *         description: Missing required fields or invalid input
 */
router.post("/", upload.single("logo"), createExtension);

/**
 * @swagger
 * /api/extensions/{id}:
 *   put:
 *     summary: Update an existing extension
 *     tags: [Extensions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The extension ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Vue DevTools
 *               description:
 *                 type: string
 *                 example: Updated description for Vue DevTools.
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Optional new logo image file
 *     responses:
 *       200:
 *         description: Extension updated successfully
 *       404:
 *         description: Extension not found
 */
router.put("/:id", upload.single("logo"), updateExtension);

/**
 * @swagger
 * /api/extensions/{id}:
 *   delete:
 *     summary: Delete an extension
 *     tags: [Extensions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The extension ID
 *     responses:
 *       200:
 *         description: Extension deleted successfully
 *       404:
 *         description: Extension not found
 */
router.delete("/:id", deleteExtension);

module.exports = router;
