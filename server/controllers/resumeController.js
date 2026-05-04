const pdf = require("pdf-parse");
const User = require("../models/User");
const {
  uploadFile,
  deleteFile,
  getPresignedUrl,
  extractS3Key,
} = require("../utils/s3");
const { parseResumeWithAI } = require("../utils/ai");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    // 1. Upload to S3
    const { key } = await uploadFile(req.file);
    const presignedUrl = await getPresignedUrl(key);

    // 2. Parse PDF for text
    let text = "";
    try {
      const data = await pdf(req.file.buffer);
      text = data.text;
    } catch (pdfErr) {
      console.error("PDF Parsing error:", pdfErr);
    }

    // 3. AI Powered Parsing (Optional - won't block upload)
    let aiData = null;
    if (text) {
      try {
        aiData = await parseResumeWithAI(text);
      } catch (aiErr) {
        console.error("AI Parsing failed but continuing with upload:", aiErr.message);
      }
    }

    // 4. Update user profile (Only resume URL and key)
    const user = await User.findById(req.user.id);

    if (user.profile.resumeKey) {
      try {
        await deleteFile(user.profile.resumeKey);
      } catch (err) {
        console.error("Error deleting old resume:", err);
      }
    }

    const standardUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "eu-north-1"}.amazonaws.com/${key}`;
    user.profile.resumeUrl = standardUrl;
    user.profile.resumeKey = key;
    
    // We DON'T automatically save skills here anymore. 
    // We let the user review them on the frontend first.
    if (aiData?.experience_years) {
      user.profile.experience = aiData.experience_years;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: aiData ? "Resume uploaded and parsed successfully" : "Resume uploaded successfully (AI parsing failed)",
      data: {
        resumeUrl: presignedUrl,
        extractedSkills: aiData?.skills || [],
        suggestions: aiData?.suggestions || [],
        ats_score: aiData?.ats_score || 0,
        aiParsed: !!aiData
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResumeInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let resumeUrl = user.profile.resumeUrl;
    let resumeKey = user.profile.resumeKey;

    if (!resumeKey && user.profile.resumeUrl) {
      resumeKey = extractS3Key(user.profile.resumeUrl);
      if (resumeKey) {
        user.profile.resumeKey = resumeKey;
        await user.save();
      }
    }
    
    if (resumeKey) {
      resumeUrl = await getPresignedUrl(resumeKey);
    }

    res.status(200).json({
      success: true,
      data: {
        resumeUrl,
        resumeKey,
        skills: user.profile.skills,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
