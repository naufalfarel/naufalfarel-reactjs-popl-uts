const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { auth } = require("../middleware/auth");

// All routes are protected
router.use(auth);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.post("/medical-history", profileController.addMedicalHistory);
router.delete(
  "/medical-history/:historyId",
  profileController.deleteMedicalHistory
);

module.exports = router;
