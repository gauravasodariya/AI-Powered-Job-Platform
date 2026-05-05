const synonymMap = {
  "software developer": [
    "fullstack developer",
    "backend developer",
    "frontend developer",
    "software engineer",
    "web developer",
    "developer",
    "engineer",
  ],
  ai: [
    "machine learning",
    "data science",
    "deep learning",
    "neural networks",
    "artificial intelligence",
    "nlp",
    "computer vision",
    "ml",
    "llm",
  ],
  "machine learning": [
    "ai",
    "data science",
    "deep learning",
    "predictive modeling",
    "ml",
  ],
  "data science": [
    "ai",
    "machine learning",
    "data analytics",
    "statistics",
    "python",
    "r",
    "data scientist",
  ],
  "mern stack": [
    "mongodb",
    "express.js",
    "react",
    "node.js",
    "full stack developer",
    "javascript",
    "mern",
    "node",
  ],
  java: [
    "springboot",
    "spring boot",
    "hibernate",
    "jpa",
    "microservices",
    "j2ee",
    "spring",
  ],
  frontend: [
    "react",
    "vue",
    "angular",
    "html",
    "css",
    "javascript",
    "ui/ux",
    "frontend developer",
  ],
  backend: [
    "node.js",
    "python",
    "java",
    "ruby",
    "php",
    "golang",
    "database",
    "backend developer",
  ],
  cloud: [
    "aws",
    "azure",
    "gcp",
    "devops",
    "docker",
    "kubernetes",
    "cloud engineer",
  ],
  "mobile developer": [
    "react native",
    "flutter",
    "android",
    "ios",
    "swift",
    "kotlin",
    "mobile app developer",
  ],
  python: [
    "django",
    "flask",
    "fastapi",
    "pandas",
    "numpy",
    "data analysis",
    "scripting",
  ],
  javascript: [
    "typescript",
    "es6",
    "react",
    "vue",
    "node",
    "nextjs",
    "frontend",
  ],
  database: [
    "mongodb",
    "postgresql",
    "mysql",
    "sql",
    "nosql",
    "redis",
    "database administrator",
  ],
  testing: ["jest", "cypress", "selenium", "unit testing", "automation", "qa"],
  devops: [
    "docker",
    "kubernetes",
    "jenkins",
    "cicd",
    "ci/cd",
    "terraform",
    "ansible",
    "aws",
    "azure",
    "gcp",
  ],
  "data analyst": [
    "powerbi",
    "tableau",
    "excel",
    "sql",
    "data visualization",
    "statistics",
    "python",
  ],
  "fullstack developer": [
    "mern",
    "mean",
    "lamp",
    "react",
    "node",
    "express",
    "mongodb",
    "javascript",
    "typescript",
  ],
  "backend developer": [
    "node",
    "express",
    "python",
    "django",
    "flask",
    "java",
    "springboot",
    "postgresql",
    "mongodb",
  ],
  "frontend developer": [
    "react",
    "vue",
    "angular",
    "nextjs",
    "tailwind",
    "css",
    "html",
    "javascript",
    "typescript",
  ],
  react: [
    "nextjs",
    "redux",
    "hooks",
    "context api",
    "frontend",
    "javascript",
    "typescript",
  ],
  node: ["express", "backend", "javascript", "typescript", "npm", "rest api"],
  aws: ["s3", "ec2", "lambda", "rds", "cloud", "devops"],
  docker: ["kubernetes", "containers", "devops", "cicd"],
};

/**
 * Escapes special characters for use in a regular expression
 * @param {string} string
 * @returns {string}
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

exports.escapeRegExp = escapeRegExp;

/**
 * Expands a search query with related semantic terms
 * @param {string} query
 * @returns {string[]}
 */
exports.expandQuery = (query) => {
  if (!query || typeof query !== "string") return [];

  // Trim and lowercase the query immediately
  const lowerQuery = query.trim().toLowerCase();
  if (!lowerQuery) return [];

  const results = new Set([lowerQuery]);

  // Split query into words and check each word too
  const words = lowerQuery
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);

  Object.keys(synonymMap).forEach((key) => {
    const trimmedKey = key.trim().toLowerCase();

    // Check if full query matches key (either contains or is contained by)
    // Use word boundaries for more accurate matching
    try {
      const escapedKey = escapeRegExp(trimmedKey);
      const keyRegex = new RegExp(`\\b${escapedKey}\\b`, "i");
      const escapedQuery = escapeRegExp(lowerQuery);
      const queryRegex = new RegExp(`\\b${escapedQuery}\\b`, "i");

      if (keyRegex.test(lowerQuery) || queryRegex.test(trimmedKey)) {
        synonymMap[key].forEach((synonym) =>
          results.add(synonym.trim().toLowerCase()),
        );
      }
    } catch (e) {
      console.error(`Regex expansion error:`, e.message);
      if (lowerQuery.includes(trimmedKey) || trimmedKey.includes(lowerQuery)) {
        synonymMap[key].forEach((synonym) =>
          results.add(synonym.trim().toLowerCase()),
        );
      }
    }

    // Check if any word in query matches key
    words.forEach((word) => {
      if (
        word === trimmedKey ||
        (trimmedKey.length > 3 && trimmedKey.includes(word))
      ) {
        synonymMap[key].forEach((synonym) =>
          results.add(synonym.trim().toLowerCase()),
        );
      }
    });
  });

  return Array.from(results)
    .filter(Boolean)
    .map((s) => s.trim());
};

/**
 * Checks if two skills are semantically related
 * @param {string} skill1
 * @param {string} skill2
 * @returns {boolean}
 */
exports.isRelated = (skill1, skill2) => {
  if (!skill1 || !skill2) return false;

  // Trim and lowercase both skills
  const s1 = String(skill1).toLowerCase().trim();
  const s2 = String(skill2).toLowerCase().trim();

  // 1. Exact match after trimming
  if (s1 === s2) return true;

  // 2. Strict check for Java vs JavaScript to prevent false positives
  if (
    (s1 === "java" && s2.includes("javascript")) ||
    (s2 === "java" && s1.includes("javascript"))
  ) {
    return false;
  }
  if ((s1 === "js" && s2 === "java") || (s2 === "js" && s1 === "java")) {
    return false;
  }

  // 3. Substring match with word boundaries (to avoid "react" matching "reaction")
  const isSubstringMatch = (str, sub) => {
    const escapedSub = escapeRegExp(sub);
    try {
      const regex = new RegExp(`\\b${escapedSub}\\b`, "i");
      return regex.test(str);
    } catch (e) {
      console.error(`Regex error for sub "${sub}" (escaped: "${escapedSub}"):`, e.message);
      return str.toLowerCase().includes(sub.toLowerCase());
    }
  };

  if (isSubstringMatch(s1, s2) || isSubstringMatch(s2, s1)) {
    // Extra check for short terms to avoid overly aggressive matching
    if (s1.length > 2 && s2.length > 2) return true;
  }

  for (const key in synonymMap) {
    const trimmedKey = key.trim().toLowerCase();
    const synonyms = synonymMap[key].map((s) => s.toLowerCase().trim());

    const isS1Related = s1 === trimmedKey || synonyms.includes(s1);
    const isS2Related = s2 === trimmedKey || synonyms.includes(s2);

    if (isS1Related && isS2Related) {
      return true;
    }
  }

  return false;
};
