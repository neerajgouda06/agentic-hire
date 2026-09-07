require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Candidate = require('./src/models/Candidate');
  const Job = require('./src/models/Job');
  
  const c = await Candidate.findById('6a6db77cce41b9667bdf5dd5');
  console.log("CANDIDATE:");
  console.log(JSON.stringify(c, null, 2));
  
  if (c && c.job_id) {
    const job = await Job.findById(c.job_id);
    console.log("JOB:");
    console.log(JSON.stringify(job, null, 2));
  }
  
  process.exit(0);
}
check();
