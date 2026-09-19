const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Image input chahe Buffer ho, URL ho, ya local file path ho, base64 aur mimeType me convert karta hai
async function getImageData(imageInput, defaultMime = 'image/jpeg') {
  if (Buffer.isBuffer(imageInput)) {
    return {
      base64: imageInput.toString('base64'),
      mimeType: defaultMime,
    };
  } else if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
    const response = await axios.get(imageInput, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'] || 'image/jpeg';
    const mimeType = contentType.includes('png') ? 'image/png' : contentType.includes('webp') ? 'image/webp' : 'image/jpeg';
    return {
      base64: Buffer.from(response.data).toString('base64'),
      mimeType,
    };
  } else if (typeof imageInput === 'string' && fs.existsSync(imageInput)) {
    const ext = path.extname(imageInput).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const buffer = fs.readFileSync(imageInput);
    return {
      base64: buffer.toString('base64'),
      mimeType,
    };
  } else {
    throw new Error(`Invalid or non-existent image input: ${imageInput}`);
  }
}

const Rule = require('../models/Rule');

async function extractProductInfo(imageInput, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const { base64, mimeType: resolvedMime } = await getImageData(imageInput, mimeType);

  // Database se active rules fetch karo
  const dbRules = await Rule.find({});
  const defaultFields = ['mrp', 'netQuantity', 'manufacturer', 'consumerCare', 'manufacturingDate', 'address'];
  
  // Agar database mein rules hain toh unka use karo, nahi toh defaults use karo
  const fieldsSet = new Set(dbRules.length > 0 ? dbRules.map(r => r.field) : defaultFields);
  // productName hta diya kyunki user khud daal raha hai
  const activeFields = Array.from(fieldsSet);

  const formatFields = activeFields.map(f => `"${f}": "string or null"`).join(',\n      ');
  const formatConfidence = activeFields.map(f => `"${f}": 0.0 to 1.0`).join(',\n        ');

  const prompt = `
    Analyze this packaged product image carefully. Extract the following
    information EXACTLY as written on the package. Return ONLY valid JSON,
    no extra text, no markdown formatting, no explanation.

    Format:
    {
      ${formatFields},
      "confidence": {
        ${formatConfidence}
      }
    }

    If a field is not visible or not found in the image, set its value to null
    and confidence to 0.
  `;

  let result;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: resolvedMime,
            data: base64,
          },
        },
      ]);
      break;
    } catch (err) {
      console.warn(`⚠️ Gemini API attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxAttempts) {
        if (err.message.includes('fetch failed')) {
          throw new Error('Network connection error: Failed to connect to Google Gemini AI API. Please check your internet connection and try again.');
        }
        throw err;
      }
      // Wait 1 second before retry
      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  const responseText = result.response.text();
  const cleanedText = responseText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new Error('Failed to parse Gemini response as JSON: ' + responseText);
  }
}

// Chhota helper - X milliseconds ke liye rukta hai (rate limit se bachne ke liye)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Multiple images ko SEQUENTIALLY process karta hai (ek-ek karke, parallel nahi)
// Taaki free-tier rate limits na tootein, aur ek image fail ho toh baaki continue rahein
async function extractFromMultipleImages(imageInputs) {
  const successfulExtractions = [];
  const failedImages = []; // kaunsi image fail hui, aur kyun

  for (let i = 0; i < imageInputs.length; i++) {
    const input = imageInputs[i];

    try {
      const extraction = await extractProductInfo(input);
      successfulExtractions.push(extraction);
    } catch (error) {
      // Ye image fail hui - lekin loop ROOKO mat, note karke aage badho
      console.error(`Image ${i + 1} failed:`, error.message);

      const isRateLimit =
        error.message?.includes('429') ||
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('quota');

      const isUnavailable =
        error.message?.includes('503') ||
        error.message?.toLowerCase().includes('service unavailable') ||
        error.message?.toLowerCase().includes('high demand') ||
        error.message?.toLowerCase().includes('temporarily unavailable') ||
        error.message?.toLowerCase().includes('overloaded');

      failedImages.push({
        imageIndex: i + 1,
        reason: isUnavailable
          ? '503 Service Unavailable: Gemini AI is experiencing high demand. Please try again later.'
          : isRateLimit
          ? 'Rate limit reached - too many requests to AI service'
          : error.message || 'Could not analyze this image',
      });
    }

    // Har image ke baad 500ms ruko - agli image se pehle Gemini ko "breathing room" dena
    if (i < imageInputs.length - 1) {
      await delay(500);
    }
  }

  // Agar EK bhi image successfully process nahi hui, toh poora request fail maano
  if (successfulExtractions.length === 0) {
    // Pehle check karo kya saari failures Gemini availability issue ki wajah se thi
    const allGeminiUnavailable = failedImages.every(f =>
      f.reason?.toLowerCase().includes('503') ||
      f.reason?.toLowerCase().includes('service unavailable') ||
      f.reason?.toLowerCase().includes('high demand') ||
      f.reason?.toLowerCase().includes('temporarily unavailable') ||
      f.reason?.toLowerCase().includes('overloaded')
    );

    if (allGeminiUnavailable) {
      throw new Error('GEMINI_UNAVAILABLE: The Gemini AI service is currently experiencing high demand and is temporarily unavailable. Please wait a few minutes and try again.');
    }

    // Specific reason include karo agar ek hi image thi
    if (failedImages.length === 1 && failedImages[0].reason) {
      throw new Error('IMAGE_PROCESSING_FAILED: ' + failedImages[0].reason);
    }

    throw new Error('All images failed to process. Please try again with clearer photos.');
  }

  // Jitni bhi images successful hui, unko merge karo - har field ke liye,
  // jis image ka confidence sabse zyada hai, uski value final answer banegi
  const merged = {};
  const mergedConfidence = {};

  successfulExtractions.forEach((extraction) => {
    Object.keys(extraction).forEach((field) => {
      if (field === 'confidence') return; // confidence ko alag se handle kar rahe hain

      const currentConfidence = extraction.confidence?.[field] ?? 0;
      const existingConfidence = mergedConfidence[field] ?? -1;

      if (currentConfidence > existingConfidence) {
        merged[field] = extraction[field];
        mergedConfidence[field] = currentConfidence;
      }
    });
  });

  merged.confidence = mergedConfidence;

  return {
    extractedData: merged,
    processedCount: successfulExtractions.length,
    totalCount: imageInputs.length,
    failedImages,
  };
}

module.exports = { extractProductInfo, extractFromMultipleImages };