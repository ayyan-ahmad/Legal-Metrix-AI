const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { checkCompliance } = require('./ruleEngine');

dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);

    // Fake data - jaisa Gemini se aa sakta hai
    const fakeExtractedData = {
        productName: 'XYZ Atta',
        mrp: '299',
        netQuantity: '5 kg',
        manufacturer: 'XYZ Foods',
        consumerCare: null, // ye missing hai - violation expected
        manufacturingDate: '08/2026',
        confidence: {
            mrp: 0.95,
            netQuantity: 0.9,
            manufacturer: 0.6, // ye low hai - review expected
            manufacturingDate: 0.85,
        },
    };

    const result = await checkCompliance(fakeExtractedData);
    console.log(JSON.stringify(result, null, 2));
    process.exit();
}

test();