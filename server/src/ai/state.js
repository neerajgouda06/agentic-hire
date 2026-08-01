const { Annotation } = require('@langchain/langgraph');

const AgentState = Annotation.Root({
  // Candidate info
  candidateId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  jobId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  resumePath: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  
  // Pipeline output
  rawText: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  parsedResume: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  matchResult: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  status: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'pending',
  }),
  interviewData: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  
  // System
  errors: Annotation({
    reducer: (x, y) => (y ? [...(x || []), y] : x),
    default: () => [],
  }),
});

module.exports = {
  AgentState,
};
