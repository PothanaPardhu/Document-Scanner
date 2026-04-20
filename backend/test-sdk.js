const aiService = require('./services/aiService');
async function test() {
  try {
    const res = await aiService.simplifyText('Quantum computing is a type of computing.', 'Easy');
    console.log("SUCCESS:", res);
  } catch(e) {
    console.error("FAIL:", e);
  }
}
test();
