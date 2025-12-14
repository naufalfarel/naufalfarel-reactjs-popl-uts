const express = require("express");
const router = express.Router();
const obatController = require("../controllers/obatController");
const { auth } = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");

// All routes are protected
router.use(auth);

// CRUD operations
router.post(
  "/",
  upload.single("gambarObat"),
  handleUploadError,
  obatController.createObat
);
router.get("/", obatController.getAllObat);
router.get("/:id", obatController.getObatById);
router.put(
  "/:id",
  upload.single("gambarObat"),
  handleUploadError,
  obatController.updateObat
);
router.delete("/:id", obatController.deleteObat);

module.exports = router;
