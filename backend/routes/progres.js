const express = require("express");
const router = express.Router();
const progresController = require("../controllers/progresController");
const { auth } = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");

// All routes are protected
router.use(auth);

// CRUD operations
router.post(
  "/",
  upload.single("fotoProgres"),
  handleUploadError,
  progresController.createProgres
);
router.get("/", progresController.getAllProgres);
router.get("/stats", progresController.getProgresStats);
router.get("/:id", progresController.getProgresById);
router.put(
  "/:id",
  upload.single("fotoProgres"),
  handleUploadError,
  progresController.updateProgres
);
router.delete("/:id", progresController.deleteProgres);

module.exports = router;
