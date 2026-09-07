const { StateGraph, END } = require('@langchain/langgraph');
const { AgentState } = require('./state');
const {
  resumeParserNode,
  matchingAgentNode,
  shortlistingAgentNode,
  humanApprovalNode,
  interviewAgentNode,
  emailAgentNode
} = require('./nodes');

// Conditional edge after shortlisting: if rejected -> email_agent; if shortlisted -> interview_agent; otherwise human_approval
const afterShortlisting = (state) => {
  if (state.status === 'rejected') {
    return 'email_agent';
  }
  if (state.status === 'shortlisted') {
    return 'interview_agent';
  }
  return 'human_approval';
};

// Build the workflow graph
const workflowBuilder = new StateGraph(AgentState)
  .addNode('resume_parser', resumeParserNode)
  .addNode('matching_agent', matchingAgentNode)
  .addNode('shortlisting_agent', shortlistingAgentNode)
  .addNode('human_approval', humanApprovalNode)
  .addNode('interview_agent', interviewAgentNode)
  .addNode('email_agent', emailAgentNode)
  
  // Connect nodes
  .addEdge('__start__', 'resume_parser')
  .addEdge('resume_parser', 'matching_agent')
  .addEdge('matching_agent', 'shortlisting_agent')
  .addConditionalEdges('shortlisting_agent', afterShortlisting, {
    email_agent: 'email_agent',
    human_approval: 'human_approval',
    interview_agent: 'interview_agent'
  })
  .addEdge('human_approval', END)
  .addEdge('interview_agent', 'email_agent')
  .addEdge('email_agent', END);

const app = workflowBuilder.compile();

// Helper to run post-approval workflow (Interview -> Email)
const runPostApprovalWorkflow = async (candidateId, jobId) => {
  const Candidate = require('../models/Candidate');
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) return;

  let parsedResume = candidate.parsed_resume_json;
  let missingSkills = candidate.missing_skills || [];

  // If candidate parsed_resume_json is missing (old candidate), parse now
  if (!parsedResume || !parsedResume.skills || parsedResume.skills.length === 0) {
    console.log(`[Post-Approval] Parsing missing resume JSON for candidate ${candidateId}...`);
    const parseResult = await resumeParserNode({
      candidateId,
      jobId,
      resumePath: candidate.resume_url
    });
    parsedResume = parseResult.parsedResume || {};
  }

  const initialState = {
    candidateId,
    jobId,
    resumePath: candidate.resume_url,
    parsedResume,
    matchResult: { missing_skills: missingSkills },
    status: candidate.status
  };

  // Execute interview agent & email agent
  console.log(`[Post-Approval] Executing Interview Agent & Email Agent for candidate ${candidateId}...`);
  const interviewResult = await interviewAgentNode(initialState);
  await emailAgentNode({ ...initialState, ...interviewResult });
};

module.exports = {
  workflowApp: app,
  runPostApprovalWorkflow
};
