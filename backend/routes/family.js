const express = require("express");
const router = express.Router();
const familyController = require("../controllers/familyController");
const { auth } = require("../middleware/auth");

// All routes protected
router.use(auth);

// Family CRUD
router.post("/", familyController.addFamily);
router.get("/", familyController.getFamilyMembers);
router.put("/:id", familyController.updateFamily);
router.delete("/:id", familyController.deleteFamily);

// Get patient progress (for family view)
router.get("/patient/:patientId/progress", familyController.getPatientProgress);

module.exports = router;
