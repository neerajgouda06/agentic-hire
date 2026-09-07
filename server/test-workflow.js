require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const { workflowApp } = require('./src/ai/workflow');

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  // Pick a candidate
  const Candidate = require('./src/models/Candidate');
  const candidate = await Candidate.findOne({ status: 'pending' });
  if (!candidate) {
    console.log('No pending candidates');
    process.exit(0);
  }
  
  console.log('Testing workflow for candidate:', candidate.name);
  
  try {
    const result = await workflowApp.invoke({
      candidateId: candidate._id.toString(),
      jobId: candidate.job_id.toString(),
      resumePath: candidate.resume_url
    });
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Workflow failed:', error);
  }
  
  process.exit(0);
}

runTest();
