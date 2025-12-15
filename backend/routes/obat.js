const express = require("express");
const router = express.Router();
const obatController = require("../controllers/obatController");
const { auth } = require("../middleware/auth");

// All routes are protected
router.use(auth);

// CRUD operations
router.post("/", obatController.createObat);
router.get("/", obatController.getAllObat);
router.get("/:id", obatController.getObatById);
router.put("/:id", obatController.updateObat);
router.delete("/:id", obatController.deleteObat);

module.exports = router;
