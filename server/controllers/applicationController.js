const Application = require("../models/Application");
const Job = require("../models/Job");
const { calculateMatch } = require("../utils/ai");
const { sendEmail } = require("../utils/ses");
const { getPresignedUrl, extractS3Key } = require("../utils/s3");

exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate(
      "recruiter",
      "email",
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if seeker
    if (req.user.role !== "seeker") {
      return res.status(403).json({ message: "Only job seekers can apply" });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: req.params.jobId,
      seeker: req.user.id,
    });

    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Check for resume
    if (!req.user.profile.resumeUrl) {
      return res.status(400).json({
        message: "Please upload your resume in your profile before applying",
      });
    }

    // AI Matching
    const jobRequirements = [
      ...(job.skills || []),
      ...(job.requirements || [])
    ];
    const { score, missingSkills } = calculateMatch(
      req.user.profile.skills || [],
      jobRequirements,
    );

    const application = await Application.create({
      job: req.params.jobId,
      seeker: req.user.id,
      recruiter: job.recruiter._id,
      resumeUrl: req.user.profile.resumeUrl,
      resumeKey: req.user.profile.resumeKey,
      matchScore: score,
      skillGap: missingSkills,
    });

    job.applicants.push({
      user: req.user.id,
      resumeUrl: req.user.profile.resumeUrl,
      resumeKey: req.user.profile.resumeKey,
      matchScore: score,
      skillGap: missingSkills,
    });
    await job.save();

    // Emails
    try {
      await sendEmail(
        job.recruiter.email,
        `New Applicant for ${job.title}`,
        `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">New Application Received</h2>
          <p>Hi there,</p>
          <p>A new applicant has applied for your job posting: <strong>${job.title}</strong>.</p>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Applicant:</strong> ${req.user.name}</p>
            <p style="margin: 5px 0 0 0;"><strong>AI Match Score:</strong> <span style="color: #4F46E5; font-weight: bold;">${score}%</span></p>
          </div>
          <p>Please log in to your recruiter dashboard to view the full application and resume.</p>
          <hr style="border: none; border-top: 1px solid #EEE; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">This is an automated notification from AI JobHub.</p>
        </div>
        `,
      );
    } catch (emailErr) {
      console.error("Application notification email failed:", emailErr.message);
    }

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seeker: req.user.id })
      .populate("job", "title company location salaryMin salaryMax")
      .sort("-appliedAt");

    res
      .status(200)
      .json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("seeker", "name email profile")
      .sort("-matchScore");

    const jobRequirements = [
      ...(job.skills || []),
      ...(job.requirements || [])
    ];

    // Generate fresh scores and reliable resume URLs for each application
    const applicationsWithUrls = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();

        const seekerSkills = appObj.seeker?.profile?.skills || [];
        const { score, missingSkills, matchSkills } = calculateMatch(
          seekerSkills,
          jobRequirements,
        );
        appObj.matchScore = score;
        appObj.skillGap = missingSkills;
        appObj.matchSkills = matchSkills;

        const resumeKey =
          appObj.resumeKey ||
          appObj.seeker?.profile?.resumeKey ||
          extractS3Key(appObj.resumeUrl) ||
          extractS3Key(appObj.seeker?.profile?.resumeUrl);

        if (resumeKey) {
          try {
            appObj.resumeUrl = await getPresignedUrl(resumeKey);
            appObj.resumeKey = resumeKey;
          } catch (err) {
            console.error(
              `Error generating presigned URL for ${resumeKey}:`,
              err.message,
            );
          }
        }

        return appObj;
      }),
    );

    // Sort by fresh match score
    applicationsWithUrls.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applicationsWithUrls,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let application = await Application.findById(req.params.id).populate(
      "seeker",
      "email name",
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    // Notify seeker
    await sendEmail(
      application.seeker.email,
      `Application Status Updated: ${status}`,
      `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #7a38eb;">Application Status Update</h2>
        <p>Hi ${application.seeker.name},</p>
        <p>The status of your application for the position of <strong>${application.job.title}</strong> has been updated.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>New Status:</strong> <span style="text-transform: capitalize; font-weight: bold; color: #7a38eb;">${status}</span></p>
        </div>
        <p>You can view more details in your seeker dashboard.</p>
        <hr style="border: none; border-top: 1px solid #EEE; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">This is an automated notification from AI JobHub.</p>
      </div>
      `,
    );

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
