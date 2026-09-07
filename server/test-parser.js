require('dotenv').config({ path: './.env' });
const { ChatGroq } = require('@langchain/groq');
const { z } = require('zod');

async function test() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant',
    temperature: 0.1
  });

  const schema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    skills: z.array(z.string()),
    experience_years: z.number(),
    education: z.array(z.string()),
    projects: z.array(z.string())
  });

  const structuredModel = model.withStructuredOutput(schema, { name: "resume" });
  
  try {
    const res = await structuredModel.invoke([
      { role: 'system', content: 'Parse this resume into JSON.' },
      { role: 'user', content: 'Neeraj Gouda. Skills: React, Node. Experience: 2 years. Education: BTech.' }
    ]);
    console.log(res);
  } catch(e) {
    console.error(e);
  }
}
test();
