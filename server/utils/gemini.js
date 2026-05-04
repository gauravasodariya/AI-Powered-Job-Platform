const https = require('https');

const GEMINI_API_KEY = (process.env.GEMINI_API || '').trim();

/**
 * Call Google Gemini API using built-in https module
 * @param {string} model - Gemini model name
 * @param {Object} data - Request body
 * @returns {Promise<Object>} - API response
 */
const callGemini = (version, model, data) => {
  if (!GEMINI_API_KEY) {
    return Promise.reject(new Error('GEMINI_API key is missing in environment variables'));
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const endpoint = `/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          if (responseBody.trim() === '') {
            return reject(new Error('Gemini returned an empty response'));
          }
          
          const parsedData = JSON.parse(responseBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            const errorMsg = parsedData.error?.message || responseBody;
            const error = new Error(`Gemini API error (${res.statusCode}): ${errorMsg}`);
            
            if (res.statusCode === 404) error.code = 'MODEL_NOT_FOUND';
            if (errorMsg.includes('Unknown name') || errorMsg.includes('Cannot find field')) error.code = 'UNKNOWN_FIELD';
            
            reject(error);
          }
        } catch (e) {
          reject(new Error(`Failed to parse Gemini response: ${e.message}`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Gemini API request timed out')); });
    req.on('error', (e) => { reject(new Error(`Network error calling Gemini: ${e.message}`)); });
    req.write(postData);
    req.end();
  });
};

/**
 * Fetches available models from Gemini API to see what's supported
 */
const getAvailableModels = (version) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/${version}/models?key=${GEMINI_API_KEY}`,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode === 200) {
            // Filter for models that support generating content
            const models = (data.models || [])
              .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
              .map(m => m.name.replace('models/', ''));
            resolve(models);
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
};

/**
 * Get chat completion from Gemini (formatted to match OpenAI structure)
 */
exports.getGeminiChatCompletion = async (messages, options = {}) => {
  let systemInstruction = "";
  const contents = [];

  messages.forEach(msg => {
    if (msg.role === 'system') {
      systemInstruction = msg.content;
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  });

  if (systemInstruction && contents.length > 0) {
    const firstUserMsg = contents.find(c => c.role === 'user');
    if (firstUserMsg) {
      firstUserMsg.parts[0].text = `INSTRUCTION: ${systemInstruction}\n\nUSER PROMPT: ${firstUserMsg.parts[0].text}`;
    }
  }

  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 2048
  };

  if (options.response_format?.type === 'json_object') {
    generationConfig.response_mime_type = 'application/json';
  }

  const data = { contents, generationConfig };

  // Preferred configurations to try initially
  let configs = [
    { v: 'v1', m: 'gemini-1.5-flash' },
    { v: 'v1beta', m: 'gemini-1.5-flash' },
    { v: 'v1', m: 'gemini-pro' },
    { v: 'v1beta', m: 'gemini-pro' }
  ];

  // STEP 1: Discovery - If preferred configs fail, we'll try to find any available model
  const discoveredModelsV1 = await getAvailableModels('v1');
  const discoveredModelsV1Beta = await getAvailableModels('v1beta');
  
  if (discoveredModelsV1.length > 0 || discoveredModelsV1Beta.length > 0) {
    console.log(`Discovered available models: ${[...discoveredModelsV1, ...discoveredModelsV1Beta].join(', ')}`);
    // Add discovered models to our list to try
    discoveredModelsV1.forEach(m => {
      if (!configs.find(c => c.m === m && c.v === 'v1')) configs.push({ v: 'v1', m });
    });
    discoveredModelsV1Beta.forEach(m => {
      if (!configs.find(c => c.m === m && c.v === 'v1beta')) configs.push({ v: 'v1beta', m });
    });
  }
  
  let lastError = null;

  for (const config of configs) {
    try {
      const response = await callGemini(config.v, config.m, data);
      console.log(`✅ AI Success using model: ${config.m} (${config.v})`);
      return formatResponse(response);
    } catch (err) {
      lastError = err;
      
      if (err.code === 'UNKNOWN_FIELD') {
        try {
          console.warn(`Model ${config.m} rejected config. Retrying with basic config...`);
          const response = await callGemini(config.v, config.m, { contents });
          return formatResponse(response);
        } catch (retryErr) {
          lastError = retryErr;
          continue;
        }
      }

      if (err.code === 'MODEL_NOT_FOUND') continue;
      
      if (err.message.includes('401') || err.message.includes('403')) throw err;
    }
  }

  throw lastError || new Error('All Gemini configurations failed');
};

const formatResponse = (response) => {
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: text
        }
      }
    ]
  };
};
