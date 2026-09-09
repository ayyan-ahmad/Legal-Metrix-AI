const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { checkCompliance } = require('./ruleEngine');
const { extractProductInfo } = require('../services/geminiService');

dotenv.config();

// ─────────────────────────────────────────────────────────────
// Photo ka local path ya URL yahan do:
// Local file path: 'C:/Users/ayyan/Desktop/test.jpg'
// Online image URL: 'https://example.com/product.jpg'
// ─────────────────────────────────────────────────────────────
const IMAGE_INPUT = 'C:/Users/ayyan/Desktop/test.jpg';

async function test() {
  console.log('\n🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected!\n');

  console.log(`🖼️  Image Input: ${IMAGE_INPUT}`);
  console.log('🤖 Gemini image analyze kar raha hai (via geminiService)... \n');

  const extractedData = await extractProductInfo(IMAGE_INPUT);

  console.log('📦 Gemini ka extracted output:');
  console.log(JSON.stringify(extractedData, null, 2));

  console.log('\n⚙️  Rule engine compliance check chal raha hai...\n');
  const compliance = await checkCompliance(extractedData);

  console.log('🎯 FINAL COMPLIANCE RESULT:');
  console.log(JSON.stringify(compliance, null, 2));

  process.exit(0);
}

test().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});