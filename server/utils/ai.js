const { isRelated } = require("./semantic");
const { getGeminiChatCompletion } = require("./gemini");

/**
 * Helper to call AI (Exclusively using Gemini)
 */
const getAICompletion = async (messages, options = {}) => {
  try {
    return await getGeminiChatCompletion(messages, options);
  } catch (err) {
    console.error("Gemini AI Error:", err.message);
    throw err;
  }
};

/**
 * Calculate match score between user skills and job requirements
 * @param {Array} userSkills - Array of skills from user profile
 * @param {Array} jobRequirements - Array of requirements from job posting
 * @returns {Object} { score, missingSkills, matchSkills }
 */
exports.calculateMatch = (userSkills, jobRequirements) => {
  if (!jobRequirements || jobRequirements.length === 0) {
    return { score: 100, missingSkills: [], matchSkills: [] };
  }

  const matchSkills = [];
  const missingSkills = [];

  const normalizedUserSkills = (userSkills || [])
    .map((s) => (s ? String(s).toLowerCase().trim() : ""))
    .filter((s) => s !== "");

  const normalizedJobRequirements = (jobRequirements || [])
    .map((r) => (r ? String(r).toLowerCase().trim() : ""))
    .filter((r) => r !== "");

  const forbiddenMatches = [
    { s: "java", r: "javascript" },
    { s: "java", r: "node" },
    { s: "java", r: "mern" },
    { s: "mern", r: "java" },
    { s: "mern", r: "springboot" },
    { s: "javascript", r: "java" },
    { s: "js", r: "java" },
  ];

  let totalMatchWeight = 0;

  normalizedJobRequirements.forEach((req) => {
    let bestMatchForReq = 0;

    normalizedUserSkills.forEach((skill) => {
      const s = skill.trim();
      const r = req.trim();

      const isForbidden = forbiddenMatches.some(
        (f) =>
          (s === f.s && r.includes(f.r)) ||
          (r === f.r && s.includes(f.s)) ||
          (s === f.s && r === f.r),
      );
      if (isForbidden) return;

      if (s === r) {
        bestMatchForReq = 1;
      } else if (isRelated(s, r)) {
        // Boost semantic matches that are very close
        bestMatchForReq = Math.max(bestMatchForReq, 0.95);
      } else {
        const sWords = s.split(/\s+/).filter((w) => w.length > 2);
        const rWords = r.split(/\s+/).filter((w) => w.length > 2);

        // Partial word matching for multi-word skills
        let commonWords = 0;
        sWords.forEach((sw) => {
          if (rWords.includes(sw)) commonWords++;
        });

        if (commonWords > 0) {
          const overlap = commonWords / Math.max(sWords.length, rWords.length);
          bestMatchForReq = Math.max(bestMatchForReq, overlap * 0.8);
        }
      }
    });

    if (bestMatchForReq > 0.6) {
      matchSkills.push(req);
      totalMatchWeight += bestMatchForReq;
    } else {
      missingSkills.push(req);
    }
  });

  let score = 0;
  if (normalizedJobRequirements.length > 0) {
    // Base score from weighted matches
    let baseScore = (totalMatchWeight / normalizedJobRequirements.length) * 100;

    // Penalize if too many requirements are missing
    const missingRatio =
      missingSkills.length / normalizedJobRequirements.length;
    if (missingRatio > 0.7) {
      baseScore *= 0.5;
    } else if (missingRatio > 0.5) {
      baseScore *= 0.8;
    }

    // Role-based bonus (if title matches requirements)
    // ... existing bonus logic ...
    const bonus = matchSkills.length > 5 ? 5 : 0;
    score = Math.min(Math.round(baseScore + bonus), 100);

    // Safety check for absolute minimums
    if (matchSkills.length === 0 && normalizedJobRequirements.length > 0) {
      score = 0;
    }

    const hasJavaInReq = normalizedJobRequirements.some(
      (r) => r.includes("java") && !r.includes("javascript"),
    );
    const hasMernInUser = normalizedUserSkills.some(
      (s) =>
        s.includes("mern") ||
        s.includes("react") ||
        s.includes("node") ||
        s.includes("mongo"),
    );
    const hasJavaInUser = normalizedUserSkills.some(
      (s) => s.includes("java") && !s.includes("javascript"),
    );

    if (hasJavaInReq && hasMernInUser && !hasJavaInUser) {
      score = Math.min(score, 30);
    }
  }

  return { score, missingSkills, matchSkills };
};

/**
 * Generate AI-powered match explanation
 */
exports.generateMatchExplanation = async (
  userSkills,
  jobTitle,
  jobRequirements,
) => {
  try {
    const prompt = `
      User Skills: ${userSkills.join(", ")}
      Job Title: ${jobTitle}
      Job Requirements: ${jobRequirements.join(", ")}
      
      Provide a brief (max 2 sentences) explanation of why this user matches this job. 
      Focus on key matching skills. If there are major gaps, mention them briefly.
      Format: "You match because [reasons]. [Optional gap mention]."
    `;

    const res = await getAICompletion(
      [
        { role: "system", content: "You are a professional career advisor." },
        { role: "user", content: prompt },
      ],
      { temperature: 0.5 },
    );

    return res.choices[0].message.content;
  } catch (err) {
    console.error("Explanation Error:", err);
    throw new Error(`AI Match Explanation failed: ${err.message}`);
  }
};

/**
 * Parse Resume using OpenAI
 */
exports.parseResumeWithAI = async (text) => {
  try {
    const prompt = `
      Extract structured data from the following resume text. 
      Text: """${text}"""
      
      Respond ONLY with a valid JSON object. 
      IMPORTANT: Your response must be a JSON object and nothing else.
      Format:
      {
        "name": "Full Name",
        "email": "email address",
        "skills": ["skill1", "skill2", ...],
        "experience_years": number,
        "education": "Highest degree",
        "roles": ["Potential Job Title 1", "Potential Job Title 2"],
        "ats_score": number (0-100),
        "suggestions": ["suggestion1", "suggestion2", ...]
      }
    `;

    const res = await getAICompletion(
      [
        {
          role: "system",
          content:
            "You are an expert ATS (Applicant Tracking System) parser. You always respond with pure JSON. Do not include markdown code block markers.",
        },
        { role: "user", content: prompt },
      ],
      { response_format: { type: "json_object" } },
    );

    if (!res || !res.choices || res.choices.length === 0) {
      throw new Error("AI returned an empty completion for resume parsing");
    }

    let content = res.choices[0].message.content.trim();

    // Improved JSON extraction for Gemini
    try {
      // Remove potential markdown markers that Gemini sometimes adds even when asked not to
      let sanitized = content
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      // If parsing fails, try to find the JSON block manually
      try {
        return JSON.parse(sanitized);
      } catch (e) {
        const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw e;
      }
    } catch (parseErr) {
      console.error("JSON Parse Error on content:", content);
      throw new Error("Failed to parse AI response into valid JSON data");
    }
  } catch (err) {
    console.error("AI Parsing Error:", err);
    throw new Error(`AI Resume Parsing failed: ${err.message}`);
  }
};

/**
 * Generate Job Description with AI
 */
exports.generateJobDescription = async (title, requirements) => {
  try {
    const prompt = `
      Generate a professional and attractive job description based on the following details:
      Job Title: ${title}
      Specific Skills & Requirements provided: ${requirements}
      
      Instructions:
      1. Integrate the provided skills and requirements naturally into the description.
      2. Include these sections:
         - Role Overview
         - Key Responsibilities
         - Required Skills & Qualifications (incorporate the user-provided requirements here)
         - Why Join Us (general but professional)
      
      IMPORTANT: Respond ONLY with the formatted job description text. Do not include any JSON markers, markdown code blocks, or "Certainly! Here is..." prefixes.
    `;

    const res = await getAICompletion([
      {
        role: "system",
        content:
          "You are a professional HR manager and technical recruiter. You output clean, professional job descriptions without any conversational filler or code block markers.",
      },
      { role: "user", content: prompt },
    ]);

    if (!res || !res.choices || res.choices.length === 0) {
      throw new Error("AI returned an empty completion for job description");
    }

    let content = res.choices[0].message.content.trim();
    // Remove potential markdown markers from non-JSON response as well
    content = content
      .replace(/^```markdown\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    return content;
  } catch (err) {
    console.error("JD Generation Error:", err);
    throw new Error(`AI Job Description generation failed: ${err.message}`);
  }
};

/**
 * Natural Language Search Parser
 */
exports.parseNLQuery = async (query) => {
  try {
    const prompt = `
      Parse this job search query: "${query}"
      
      Respond ONLY with a JSON object. Do not include markdown markers.
      Format:
      {
        "role": string,
        "location": string,
        "experience": number,
        "jobType": "full-time" | "part-time" | "contract" | "internship",
        "salary_min": number
      }
    `;

    const res = await getAICompletion(
      [
        {
          role: "system",
          content:
            "You convert natural language search queries into structured data. You always respond with pure JSON.",
        },
        { role: "user", content: prompt },
      ],
      { response_format: { type: "json_object" } },
    );

    let content = res.choices[0].message.content.trim();
    let sanitized = content
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    try {
      return JSON.parse(sanitized);
    } catch (e) {
      const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw e;
    }
  } catch (err) {
    console.error("NL Query Error:", err);
    throw new Error(`AI Natural Language Search failed: ${err.message}`);
  }
};
