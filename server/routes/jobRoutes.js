const express = require("express");
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyJob,
  getRecruiterStats,
  getPublicStats,
  generateAIDescription,
  getMatchExplanation,
} = require("../controllers/jobController");

const { protect, authorize, optional } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", optional, getJobs);
router.get("/stats", getPublicStats);
router.post("/generate-description", protect, authorize("recruiter"), generateAIDescription);
router.get("/:id/explanation", protect, getMatchExplanation);
router.post("/", protect, authorize("recruiter"), createJob);

router.get("/:id", optional, getJob);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);

router.post("/:id/apply", protect, authorize("seeker"), applyJob);

router.get("/recruiter/stats", protect, authorize("recruiter"), getRecruiterStats);

module.exports = router;