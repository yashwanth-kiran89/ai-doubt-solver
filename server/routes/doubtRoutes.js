const express = require("express");
const router = express.Router();
const { handleImageUpload } = require("../middleware/upload");
const { protect } = require('../middleware/auth');

const {
  askDoubt,
  askDoubtWithImage,
  askFollowUp,
  getHistory,
  getDoubtById,
  markHelpful,
  deleteDoubt,
} = require("../controllers/doubtController");

router.use(protect);

// Routes
router.post("/ask", askDoubt);
router.post("/ask-with-image", handleImageUpload, askDoubtWithImage);
router.post("/:id/followup", askFollowUp);
router.get("/history", getHistory);
router.get("/:id", getDoubtById);
router.patch("/:id/helpful", markHelpful);
router.delete("/:id", deleteDoubt);

module.exports = router; 
