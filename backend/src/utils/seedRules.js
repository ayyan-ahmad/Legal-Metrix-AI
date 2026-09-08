const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Rule = require('../models/Rule');

dotenv.config();

const rules = [
  {
    ruleId: 'MRP-001',
    field: 'mrp',
    label: 'MRP Declaration',
    required: true,
    severity: 'high',
    description: 'Maximum Retail Price must be declared on the package',
  },
  {
    ruleId: 'NET-001',
    field: 'netQuantity',
    label: 'Net Quantity Declaration',
    required: true,
    severity: 'high',
    description: 'Net quantity of the product must be declared',
  },
  {
    ruleId: 'MFR-001',
    field: 'manufacturer',
    label: 'Manufacturer Details',
    required: true,
    severity: 'high',
    description: 'Name and address of manufacturer/packer must be declared',
  },
  {
    ruleId: 'CC-001',
    field: 'consumerCare',
    label: 'Consumer Care Details',
    required: true,
    severity: 'medium',
    description: 'Consumer care contact details must be declared',
  },
  {
    ruleId: 'DATE-001',
    field: 'manufacturingDate',
    label: 'Manufacturing Date',
    required: true,
    severity: 'medium',
    description: 'Month and year of manufacture/packing must be declared',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Rule.deleteMany({}); // purane rules clear kar rahe hain, fresh daalne ke liye
  await Rule.insertMany(rules);
  console.log('Rules seeded successfully');
  process.exit();
}

seed();