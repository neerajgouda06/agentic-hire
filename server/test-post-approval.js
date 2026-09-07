require('dotenv').config({ path: './.env' });
const specs = require('./src/utils/spec-loader');
const { interviewAgentNode, emailAgentNode } = require('./src/ai/nodes');

async function test() {
  try {
    console.log("Testing spec loader...");
    const emailSpec = specs.getEmailTemplate('interview-invite');
    console.log("Email spec loaded:", emailSpec.subject);

    console.log("Testing Interview Agent Node with dummy state...");
    const state = {
      candidateId: "679c12345678901234567890", // dummy
      jobId: "679c12345678901234567890", // dummy
      parsedResume: { skills: ["React", "Node"] },
      matchResult: { missing_skills: ["TypeScript"] },
      status: "shortlisted"
    };

    console.log("Calling interviewAgentNode...");
    const res = await interviewAgentNode(state);
    console.log("Interview Result:", res);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
