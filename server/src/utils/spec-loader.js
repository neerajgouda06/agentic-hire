const fs = require('fs');
const path = require('path');

const getSpecsDir = () => {
  const candidateDirs = [
    path.join(__dirname, '../../../specs'),
    path.join(__dirname, '../../specs'),
    path.join(process.cwd(), 'specs'),
    path.join(process.cwd(), '../specs'),
  ];
  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return path.join(__dirname, '../../../specs');
};

const SPECS_DIR = getSpecsDir();

const loadSpec = (specPath) => {
  try {
    const fullPath = path.join(SPECS_DIR, specPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Spec file not found at ${fullPath}`);
    }
    const data = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading spec ${specPath}:`, error.message);
    throw error;
  }
};


const getHiringSpec = (roleFile) => {
  // roleFile could be "frontend-developer.json" or just "frontend-developer"
  const fileName = roleFile.endsWith('.json') ? roleFile : `${roleFile}.json`;
  return loadSpec(`hiring/${fileName}`);
};

const getWorkflowSpec = (workflowName = 'default-hiring-workflow') => {
  return loadSpec(`workflow/${workflowName}.json`);
};

const getNodeStates = () => {
  return loadSpec('workflow/node-states.json');
};

const getRetryPolicy = () => {
  return loadSpec('system/retry-policy.json');
};

const getShortlistingRules = () => {
  return loadSpec('evaluation/shortlisting-rules.json');
};

const getRagSettings = () => {
  return loadSpec('evaluation/rag-retrieval.json');
};

const getPromptSpec = (agentName) => {
  return loadSpec(`prompts/${agentName}.json`);
};

const getEmailTemplate = (templateName) => {
  return loadSpec(`email/${templateName}.json`);
};

module.exports = {
  loadSpec,
  getHiringSpec,
  getWorkflowSpec,
  getNodeStates,
  getRetryPolicy,
  getShortlistingRules,
  getRagSettings,
  getPromptSpec,
  getEmailTemplate,
};
