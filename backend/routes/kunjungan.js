const express = require("express");
const router = express.Router();
const kunjunganController = require("../controllers/kunjunganController");
const { auth } = require("../middleware/auth");

// All routes are protected
router.use(auth);

// CRUD operations
router.post("/", kunjunganController.createKunjungan);
router.get("/", kunjunganController.getAllKunjungan);
router.get("/upcoming", kunjunganController.getUpcomingVisits);
router.get("/:id", kunjunganController.getKunjunganById);
router.put("/:id", kunjunganController.updateKunjungan);
router.put("/:id/hasil", kunjunganController.updateHasilKunjungan);
router.delete("/:id", kunjunganController.deleteKunjungan);

module.exports = router;
