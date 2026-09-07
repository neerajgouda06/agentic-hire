require('dotenv').config({ path: './.env' });
const { ChatGroq } = require('@langchain/groq');
const { z } = require('zod');

async function testMatch() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant',
    temperature: 0.1
  });

  const schema = z.object({
    matched_required_skills: z.array(z.string()),
    matched_preferred_skills: z.array(z.string()),
    missing_skills: z.array(z.string()),
    all_skills_matched: z.boolean(),
    match_score: z.number(),
    
    experience: z.number().default(0),
    required_skills: z.array(z.string()).default([]),
    preferred_skills: z.array(z.string()).default([]),
    weights: z.record(z.number()).default({}),
    name: z.string().default(''),
    skills: z.array(z.string()).default([])
  });

  const parsedResume = {
    "name": "Neeraj Gouda",
    "skills": ["JavaScript (ES6+)", "Python", "SQL", "React.js", "Node.js", "Express.js"]
  };

  const userPrompt = `
    Job Required Skills: React, Node, JS
    Job Preferred Skills: None
    Job Minimum Experience: 1 years
    
    Candidate Parsed Data:
    ${JSON.stringify(parsedResume, null, 2)}
    
    Evaluate the match based on the provided weights: {"required_skills":0.6,"preferred_skills":0.2,"experience":0.2}
  `;

  const structuredModel = model.withStructuredOutput(schema);
  const result = await structuredModel.invoke([
    { role: 'system', content: 'You are an expert HR Matching Agent. Compare the candidate\'s extracted skills and experience against the job\'s required and preferred skills. Calculate a match score between 0 and 100 based on the weights provided. Output strictly in JSON format.' },
    { role: 'user', content: userPrompt }
  ]);
  
  console.log(result);
}
testMatch();
