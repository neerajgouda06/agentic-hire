const { StateGraph, END } = require('@langchain/langgraph');
const { AgentState } = require('./state');
const {
  resumeParserNode,
  matchingAgentNode,
  shortlistingAgentNode,
  interviewAgentNode
} = require('./nodes');

// Conditional edge: Should we generate interview questions?
const shouldInterview = (state) => {
  if (state.status === 'shortlisted' || state.status === 'review') {
    return 'interview_agent';
  }
  return END;
};

// Build the workflow graph
const workflowBuilder = new StateGraph(AgentState)
  .addNode('resume_parser', resumeParserNode)
  .addNode('matching_agent', matchingAgentNode)
  .addNode('shortlisting_agent', shortlistingAgentNode)
  .addNode('interview_agent', interviewAgentNode)
  
  // Connect nodes
  .addEdge('__start__', 'resume_parser')
  .addEdge('resume_parser', 'matching_agent')
  .addEdge('matching_agent', 'shortlisting_agent')
  // Add conditional edge from shortlisting -> interview or END
  .addConditionalEdges('shortlisting_agent', shouldInterview, {
    interview_agent: 'interview_agent',
    [END]: END
  })
  .addEdge('interview_agent', END);

const app = workflowBuilder.compile();

module.exports = {
  workflowApp: app
};
