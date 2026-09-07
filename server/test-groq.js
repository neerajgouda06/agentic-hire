require('dotenv').config({ path: './.env' });
const { ChatGroq } = require('@langchain/groq');
const { z } = require('zod');

async function testGroq() {
  try {
    console.log("Testing Groq...");
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1
    });

    const schema = z.object({
      name: z.string(),
      email: z.string(),
      skills: z.array(z.string())
    });

    const structuredModel = model.withStructuredOutput(schema);
    
    console.log("Calling model...");
    const result = await structuredModel.invoke([
      { role: 'system', content: 'You are a resume parser. Extract name, email and skills.' },
      { role: 'user', content: 'Neeraj Gouda. Skills: React, Node, JS. Email: neeraj@test.com' }
    ]);
    
    console.log("Result:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}

testGroq();
