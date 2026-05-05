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

const {
  protect,
  authorize,
  optional,
} = require("../middleware/authMiddleware");

const router = express.Router();

// 1. Specific POST routes (Must be at the top)
router.post(
  "/generate-description",
  protect,
  authorize("recruiter"),
  generateAIDescription,
);

// 2. Specific GET routes
router.get("/stats", getPublicStats);
router.get(
  "/recruiter/stats",
  protect,
  authorize("recruiter"),
  getRecruiterStats,
);

// 3. Generic GET/POST routes (No parameters)
router.get("/", optional, getJobs);
router.post("/", protect, authorize("recruiter"), createJob);

// 4. Routes with parameters (Must be at the bottom)
router.get("/:id/explanation", protect, getMatchExplanation);
router.post("/:id/apply", protect, authorize("seeker"), applyJob);
router.get("/:id", optional, getJob);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);

module.exports = router;
