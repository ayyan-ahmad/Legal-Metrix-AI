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

async function extractProductInfo(imageInput, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const { base64, mimeType: resolvedMime } = await getImageData(imageInput, mimeType);

  const prompt = `
    Analyze this packaged product image carefully. Extract the following
    information EXACTLY as written on the package. Return ONLY valid JSON,
    no extra text, no markdown formatting, no explanation.

    Format:
    {
      "productName": "string or null",
      "mrp": "string or null",
      "netQuantity": "string or null",
      "manufacturer": "string or null",
      "consumerCare": "string or null",
      "manufacturingDate": "string or null",
      "address": "string or null",
      "confidence": {
        "productName": 0.0 to 1.0,
        "mrp": 0.0 to 1.0,
        "netQuantity": 0.0 to 1.0,
        "manufacturer": 0.0 to 1.0,
        "consumerCare": 0.0 to 1.0,
        "manufacturingDate": 0.0 to 1.0,
        "address": 0.0 to 1.0
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

module.exports = { extractProductInfo };