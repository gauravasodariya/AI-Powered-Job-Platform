const Job = require("../models/Job");
const Application = require("../models/Application");
const {
  calculateMatch,
  generateJobDescription,
  generateMatchExplanation,
  parseNLQuery,
} = require("../utils/ai");
const { sendEmail } = require("../utils/ses");
const { expandQuery } = require("../utils/semantic");

exports.generateAIDescription = async (req, res) => {
  try {
    const { title, requirements } = req.body;
    if (!title)
      return res.status(400).json({ message: "Job title is required" });

    console.log(`Generating AI description for: ${title}`);
    const description = await generateJobDescription(title, requirements || "");

    if (!description) {
      throw new Error("AI failed to return a description text");
    }

    res.status(200).json({ success: true, data: description });
  } catch (error) {
    console.error("Job Description Generation Error:", error.message);
    console.error("Full error details:", error);
    res.status(error.status || 500).json({
      message: error.message || "Failed to generate job description",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getMatchExplanation = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const userSkills = req.user.profile.skills || [];
    const jobRequirements = [
      ...(job.skills || []),
      ...(job.requirements || []),
    ];

    const explanation = await generateMatchExplanation(
      userSkills,
      job.title,
      jobRequirements,
    );
    res.status(200).json({ success: true, data: explanation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecruiterStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ recruiter: req.user.id });

    const applications = await Application.find({ recruiter: req.user.id });

    const totalApplicants = applications.length;
    const shortlisted = applications.filter(
      (app) => app.status === "shortlisted",
    ).length;
    const rejected = applications.filter(
      (app) => app.status === "rejected",
    ).length;
    const hired = applications.filter((app) => app.status === "hired").length;
    const pending = applications.filter(
      (app) => app.status === "pending",
    ).length;

    // Get monthly job postings (for chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Job.aggregate([
      {
        $match: {
          recruiter: new (require("mongoose").Types.ObjectId)(req.user.id),
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalApplicants,
        shortlisted,
        rejected,
        hired,
        pending,
        monthlyData,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const {
      skills,
      experience,
      experienceMin,
      experienceMax,
      location,
      salaryMin,
      salaryMax,
      industry,
      company,
      education,
      jobType,
      employerType,
      freshness,
      sort,
      search,
    } = req.query;

    let query = {};

    // Text Search (Semantic + AI Parser)
    if (search && search !== "undefined") {
      const trimmedSearch = String(search).trim();
      if (trimmedSearch) {
        // If search is long, try AI parsing for structured filters
        if (trimmedSearch.split(" ").length > 3) {
          try {
            const aiFilters = await parseNLQuery(trimmedSearch);
            if (aiFilters.role)
              query.title = { $regex: aiFilters.role, $options: "i" };
            if (aiFilters.location)
              query.location = { $regex: aiFilters.location, $options: "i" };
            if (aiFilters.experience)
              query.experience = { $lte: parseInt(aiFilters.experience) };
            if (aiFilters.jobType) query.jobType = aiFilters.jobType;
            if (aiFilters.salary_min)
              query.salary = { $gte: parseInt(aiFilters.salary_min) };
          } catch (aiError) {
            console.error(
              "AI Search Parsing Error (Falling back to semantic):",
              aiError.message,
            );
            // Fallback to semantic search
            const expandedTerms = expandQuery(trimmedSearch);
            const searchRegexArray = expandedTerms
              .map((term) => term.trim())
              .filter((term) => term.length > 0)
              .map(
                (term) =>
                  new RegExp(
                    `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
                    "i",
                  ),
              );

            if (searchRegexArray.length > 0) {
              query.$or = query.$or || [];
              query.$or.push(
                { title: { $in: searchRegexArray } },
                { company: { $in: searchRegexArray } },
                { description: { $in: searchRegexArray } },
                { skills: { $in: searchRegexArray } },
                { requirements: { $in: searchRegexArray } },
              );
            }
          }
        } else {
          const expandedTerms = expandQuery(trimmedSearch);
          const searchRegexArray = expandedTerms
            .map((term) => term.trim())
            .filter((term) => term.length > 0)
            .map(
              (term) =>
                new RegExp(
                  `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
                  "i",
                ),
            );

          if (searchRegexArray.length > 0) {
            query.$or = query.$or || [];
            query.$or.push(
              { title: { $in: searchRegexArray } },
              { company: { $in: searchRegexArray } },
              { description: { $in: searchRegexArray } },
              { skills: { $in: searchRegexArray } },
              { requirements: { $in: searchRegexArray } },
            );
          }
        }
      }
    }

    // Skills Filter (Semantic)
    if (skills) {
      const skillsArray = String(skills)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
      let expandedSkills = [];
      skillsArray.forEach((skill) => {
        expandedSkills = [...expandedSkills, ...expandQuery(skill)];
      });

      const regexArray = [...new Set(expandedSkills)]
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(
          (s) =>
            new RegExp(
              `\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
              "i",
            ),
        );

      if (regexArray.length > 0) {
        query.$or = query.$or || [];
        query.$or.push(
          { skills: { $in: regexArray } },
          { requirements: { $in: regexArray } },
        );
      }
    }

    // Experience Filter
    if (experience) {
      const exp = parseInt(experience);
      if (!isNaN(exp)) {
        query.$or = query.$or || [];
        query.$or.push(
          { experience: { $lte: exp } },
          { experienceMin: { $lte: exp } },
        );
      }
    }
    if (experienceMin) {
      const expMin = parseInt(experienceMin);
      if (!isNaN(expMin)) {
        query.experienceMax = { $gte: expMin };
      }
    }
    if (experienceMax) {
      const expMax = parseInt(experienceMax);
      if (!isNaN(expMax)) {
        query.experienceMin = { $lte: expMax };
      }
    }

    // Location Filter
    if (location && location !== "undefined") {
      query.location = { $regex: location, $options: "i" };
    }

    // Salary Filter
    if (salaryMin) {
      const sMin = parseInt(salaryMin);
      if (!isNaN(sMin)) {
        query.salaryMax = { $gte: sMin };
      }
    }
    if (salaryMax) {
      const sMax = parseInt(salaryMax);
      if (!isNaN(sMax)) {
        query.salaryMin = { $lte: sMax };
      }
    }

    // Industry Filter
    if (industry && industry !== "undefined") {
      query.industry = { $regex: industry, $options: "i" };
    }

    // Company Filter
    if (company && company !== "undefined") {
      query.company = { $regex: company, $options: "i" };
    }

    // Education Filter
    if (education && education !== "undefined") {
      query.education = { $regex: education, $options: "i" };
    }

    // Job Type Filter
    if (jobType && typeof jobType === "string") {
      const types = jobType.split(",").filter((t) => t.trim() !== "");
      if (types.length > 0) {
        query.jobType = { $in: types };
      }
    }
    // Employer Type Filter
    if (employerType) {
      query.employerType = employerType;
    }

    // Freshness Filter
    if (freshness) {
      const days = parseInt(freshness);
      const date = new Date();
      date.setDate(date.getDate() - days);
      query.createdAt = { $gte: date };
    }

    let result = Job.find(query).populate("recruiter", "name email");

    // Sorting
    if (sort === "latest") {
      result = result.sort("-createdAt");
    } else if (sort === "relevance") {
      // Relevance sorting can be complex, for now we'll just sort by createdAt
      result = result.sort("-createdAt");
    } else {
      result = result.sort("-createdAt");
    }

    const jobs = await result;

    // Fetch applicant counts for each job from the Application collection
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({
          job: job._id,
        });
        return { ...job.toObject(), applicantCount };
      }),
    );

    // Add AI match score if user is logged in and has skills
    let jobsWithScore = jobsWithCounts;
    if (req.user?.profile?.skills?.length > 0) {
      jobsWithScore = jobsWithCounts.map((job) => {
        const jobRequirements = [
          ...(job.skills || []),
          ...(job.requirements || []),
        ];
        const { score } = calculateMatch(
          req.user.profile.skills,
          jobRequirements,
        );
        return { ...job, matchScore: score };
      });
    }

    res
      .status(200)
      .json({ success: true, count: jobs.length, data: jobsWithScore });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalCompanies = await Job.distinct("company").then(
      (companies) => companies.length,
    );

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalApplications,
        totalCompanies,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "name email",
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applicantCount = await Application.countDocuments({ job: job._id });

    let hasApplied = false;
    let skillGap = [];
    let matchScore = undefined;

    if (req.user) {
      // 1. Check for existing application
      const application = await Application.findOne({
        job: job._id,
        seeker: req.user.id,
      });

      if (application) {
        hasApplied = true;
        skillGap = application.skillGap || [];
        matchScore = application.matchScore;
      } else if (
        req.user.role === "seeker" &&
        req.user.profile?.skills?.length > 0
      ) {
        // 2. If not applied, calculate "preview" skill gaps based on profile
        const jobRequirements = [
          ...(job.skills || []),
          ...(job.requirements || []),
        ];
        const { score, missingSkills } = calculateMatch(
          req.user.profile.skills,
          jobRequirements,
        );
        skillGap = missingSkills;
        matchScore = score;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        applicantCount,
        hasApplied,
        skillGap,
        matchScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    req.body.recruiter = req.user.id;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Make sure user is recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this job" });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Make sure user is recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "email",
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: req.params.id,
      seeker: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    // Get user profile for resume and skills
    const user = req.user;
    if (!user.profile.resumeUrl) {
      return res.status(400).json({ message: "Please upload a resume first" });
    }

    // AI Matching Logic
    const jobRequirements = [
      ...(job.skills || []),
      ...(job.requirements || []),
    ];
    const { score, missingSkills } = calculateMatch(
      user.profile.skills || [],
      jobRequirements,
    );

    // Create entry in Application model (Primary source for dashboards)
    const application = await Application.create({
      job: req.params.id,
      seeker: req.user.id,
      recruiter: job.recruiter._id,
      resumeUrl: user.profile.resumeUrl,
      resumeKey: user.profile.resumeKey,
      matchScore: score,
      skillGap: missingSkills,
      status: "pending",
    });

    // Send email notifications
    // 1. To Recruiter
    try {
      await sendEmail(
        job.recruiter.email,
        `New Applicant for ${job.title}`,
        `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #7a38eb;">New Application Received</h2>
          <p>Hi there,</p>
          <p>A new applicant has applied for your job posting: <strong>${job.title}</strong>.</p>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Applicant Name :</strong> ${user.name}</p>
            <p style="margin: 5px 0 0 0;"><strong>AI Match Score:</strong> <span style="color: #7a38eb; font-weight: bold;">${score}%</span></p>
          </div>
          <p>Please log in to your recruiter dashboard to view the full application and resume.</p>
          <hr style="border: none; border-top: 1px solid #EEE; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">This is an automated notification from AI JobHub.</p>
        </div>
        `,
      );
    } catch (emailErr) {
      console.error("Recruiter email failed:", emailErr);
    }

    // 2. To Seeker
    try {
      await sendEmail(
        user.email,
        `Application Sent: ${job.title}`,
        `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #7a38eb;">Application Sent Successfully</h2>
          <p>Hi ${user.name},</p>
          <p>Your application for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong> has been sent successfully.</p>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Company Name :</strong> ${job.company}</p>
            <p style="margin: 5px 0 0 0;"><strong>AI Match Score :</strong> <span style="color: #7a38eb; font-weight: bold;">${score}%</span></p>
          </div>
          <p>You can track your application status in your seeker dashboard.</p>
          <hr style="border: none; border-top: 1px solid #EEE; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">This is an automated notification from AI JobHub.</p>
        </div>
        `,
      );
    } catch (emailErr) {
      console.error("Seeker email failed:", emailErr);
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
