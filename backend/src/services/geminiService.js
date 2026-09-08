const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Image URL se image data fetch karke base64 mein convert karna
// Kyun? Gemini ko image "inline data" chahiye, seedha URL nahi le sakta
async function urlToBase64(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data).toString('base64');
}

async function extractProductInfo(imageUrl) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const base64Image = await urlToBase64(imageUrl);

  // Ye prompt sabse critical part hai - Gemini ko STRICT JSON return
  // karne ke liye force kar rahe hain, koi extra text nahi chahiye
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

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    },
  ]);

  const responseText = result.response.text();

  // Gemini kabhi-kabhi ```json ... ``` wrap kar deta hai response ko
  // isliye clean karna zaroori hai JSON.parse karne se pehle
  const cleanedText = responseText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new Error('Failed to parse Gemini response as JSON: ' + responseText);
  }
}

module.exports = { extractProductInfo };