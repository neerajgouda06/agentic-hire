require('dotenv').config();

async function testResend() {
  console.log("Resend Key:", process.env.RESEND_API_KEY ? "Present" : "Missing");
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'AgentHire <onboarding@resend.dev>',
        to: ['neerajgouda8@gmail.com'], // owner email
        subject: 'Test Interview Invite',
        text: 'This is a test email from AgentHire.'
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}
testResend();
