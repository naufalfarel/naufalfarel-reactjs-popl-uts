const express = require("express");
const router = express.Router();
const edukasiController = require("../controllers/edukasiController");

// Public routes (no auth required for reading)
router.get("/", edukasiController.getAllEdukasi);
router.get("/popular", edukasiController.getPopularEdukasi);
router.get("/kategori/:kategori", edukasiController.getEdukasiByKategori);
router.get("/:id", edukasiController.getEdukasiById);

// Admin route to seed initial content
router.post("/seed", edukasiController.seedEdukasi);

module.exports = router;
