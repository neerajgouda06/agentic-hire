const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { ChatGroq } = require('@langchain/groq');
const { z } = require('zod');
const specs = require('../utils/spec-loader');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const socket = require('../utils/socket');

// Ensure Groq is instantiated
const getModel = () => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: 'llama3-8b-8192', // Fast, good enough for structured output. Or could use llama3-70b-8192
    temperature: 0.1
  });
};

// 1. Resume Parser Node
const resumeParserNode = async (state) => {
  try {
    const fullPath = path.join(__dirname, '../../', state.resumePath);
    let rawText = state.rawText;
    
    // Extract text from PDF if not already done
    if (!rawText) {
      const dataBuffer = fs.readFileSync(fullPath);
      const data = await pdf(dataBuffer);
      rawText = data.text;
    }

    const promptSpec = specs.getPromptSpec('resume-parser');
    
    // Zod schema matching the spec
    const schema = z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      skills: z.array(z.string()),
      experience_years: z.number(),
      education: z.array(z.string()),
      projects: z.array(z.string())
    });

    const model = getModel().withStructuredOutput(schema);
    const result = await model.invoke([
      { role: 'system', content: promptSpec.system_prompt },
      { role: 'user', content: `Parse this resume:\n\n${rawText}` }
    ]);

    return { rawText, parsedResume: result };
  } catch (error) {
    return { errors: `Parser Error: ${error.message}` };
  }
};

// 2. Matching Agent Node
const matchingAgentNode = async (state) => {
  try {
    const promptSpec = specs.getPromptSpec('matching-agent');
    
    // Fetch Job data
    const job = await Job.findById(state.jobId);
    if (!job) throw new Error('Job not found');

    const schema = z.object({
      matched_required_skills: z.array(z.string()),
      matched_preferred_skills: z.array(z.string()),
      missing_skills: z.array(z.string()),
      all_skills_matched: z.boolean(),
      match_score: z.number()
    });

    const model = getModel().withStructuredOutput(schema);
    
    const userPrompt = `
      Job Required Skills: ${job.required_skills.join(', ')}
      Job Preferred Skills: ${job.preferred_skills ? job.preferred_skills.join(', ') : 'None'}
      Job Minimum Experience: ${job.min_experience} years
      
      Candidate Parsed Data:
      ${JSON.stringify(state.parsedResume, null, 2)}
      
      Evaluate the match based on the provided weights: ${JSON.stringify(promptSpec.weights)}
    `;

    const result = await model.invoke([
      { role: 'system', content: promptSpec.system_prompt },
      { role: 'user', content: userPrompt }
    ]);

    return { matchResult: result };
  } catch (error) {
    return { errors: `Matching Error: ${error.message}` };
  }
};

// 3. Shortlisting Agent Node
const shortlistingAgentNode = async (state) => {
  try {
    const rulesSpec = specs.getShortlistingRules();
    const score = state.matchResult.match_score;
    
    let decision = 'rejected';
    for (const rule of rulesSpec.rules) {
      // Evaluate condition like ">= 80"
      if (rule.condition.startsWith('>=')) {
        const val = parseInt(rule.condition.replace('>=', '').trim());
        if (score >= val) {
          decision = rule.decision;
          break;
        }
      } else if (rule.condition.startsWith('<')) {
        const val = parseInt(rule.condition.replace('<', '').trim());
        if (score < val) {
          decision = rule.decision;
          break;
        }
      }
    }

    // Update MongoDB
    const updatedCandidate = await Candidate.findByIdAndUpdate(state.candidateId, {
      match_score: score,
      status: decision
    }, { new: true });

    try {
      socket.getIO().emit('candidate:updated', updatedCandidate);
    } catch (e) {
      console.log('Socket emit failed in shortlisting agent');
    }

    return { status: decision };
  } catch (error) {
    return { errors: `Shortlisting Error: ${error.message}` };
  }
};

// 4. Interview Agent Node
const interviewAgentNode = async (state) => {
  try {
    const promptSpec = specs.getPromptSpec('interview-agent');
    const job = await Job.findById(state.jobId);
    
    const schema = z.object({
      questions: z.array(z.string()),
      coding_task: z.string(),
      rubric: z.object({
        excellent: z.string(),
        average: z.string(),
        poor: z.string()
      })
    });

    const model = getModel().withStructuredOutput(schema);
    const userPrompt = `
      Job Description: ${job.description}
      Candidate Skills: ${state.parsedResume.skills.join(', ')}
      Missing Skills: ${state.matchResult.missing_skills.join(', ')}
      
      Generate targeted questions for this specific candidate.
    `;

    const result = await model.invoke([
      { role: 'system', content: promptSpec.system_prompt },
      { role: 'user', content: userPrompt }
    ]);

    await Candidate.findByIdAndUpdate(state.candidateId, {
      interview_questions: result.questions,
      // saving rubric or coding task could go here or in a separate collection
    });

    return { interviewData: result };
  } catch (error) {
    return { errors: `Interview Error: ${error.message}` };
  }
};

module.exports = {
  resumeParserNode,
  matchingAgentNode,
  shortlistingAgentNode,
  interviewAgentNode
};
