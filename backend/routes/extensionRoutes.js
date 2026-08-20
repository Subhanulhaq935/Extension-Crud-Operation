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

router.get("/", getAllExtensions);

router.get("/:id", getExtensionById);

router.get("/:id/logo", getExtensionLogo);

router.post("/", upload.single("logo"), createExtension);

router.put("/:id", upload.single("logo"), updateExtension);

router.delete("/:id", deleteExtension);

module.exports = router;