const nodemailer = require('nodemailer');

// Check if actual email settings are provided
const hasEmailCredentials = Boolean(
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_USER !== 'your_email@gmail.com'
);

let transporter = null;

if (hasEmailCredentials) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send an email notification safely (with local logging fallback)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || '"JobTracker Support" <noreply@jobtracker.app>';

  if (!hasEmailCredentials || !transporter) {
    console.log(`\n📧 [EMAIL MOCK SERVICE] Notification to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Preview: ${text || 'HTML Template rendered'}\n`);
    return { messageId: 'mock_' + Date.now(), success: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html,
    });
    console.log(`📧 Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Welcome Email on Signup
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Welcome to JobTracker! 🚀</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Welcome to your personal career copilot! You now have a complete platform to track all your job applications, schedule interview rounds, visualize your hiring funnel, and manage your resumes in one place.</p>
          <p>Ready to log your first job application?</p>
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Open Your Dashboard</a>
          </div>
          <p>Best of luck with your job hunt,<br><strong>The JobTracker Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} JobTracker App. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to JobTracker — Supercharge Your Job Search!',
    text: `Hi ${user.name}, welcome to JobTracker! Start organizing your job hunt now: ${process.env.CLIENT_URL || 'http://localhost:5173'}`,
    html,
  });
};

/**
 * Send Interview Reminder Email
 */
const sendInterviewReminder = async (user, interview) => {
  const formattedDate = new Date(interview.interviewDate).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0284c7; padding: 28px 24px; text-align: center; color: #ffffff; }
        .content { padding: 32px 24px; }
        .box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">Upcoming Interview Alert 🎯</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have an upcoming interview scheduled:</p>
          <div class="box">
            <h3 style="margin-top:0; color:#0369a1;">${interview.companyName} — ${interview.jobTitle}</h3>
            <p style="margin: 4px 0;"><strong>Round:</strong> ${interview.round}</p>
            <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${interview.interviewType}</p>
            ${interview.meetingLink ? `<p style="margin: 8px 0 0 0;"><a href="${interview.meetingLink}" style="color: #0284c7; font-weight:600;" target="_blank">Join Meeting Link &rarr;</a></p>` : ''}
            ${interview.notes ? `<p style="margin: 8px 0 0 0; font-size:13px; color:#475569;"><strong>Notes:</strong> ${interview.notes}</p>` : ''}
          </div>
          <p>Make sure to review your notes, test your audio/camera, and join a few minutes early!</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/interviews" class="btn">View All Interviews</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Interview Reminder: ${interview.companyName} (${interview.round})`,
    text: `Interview Reminder: You have an upcoming interview with ${interview.companyName} for ${interview.jobTitle} (${interview.round}) on ${formattedDate}.`,
    html,
  });
};

/**
 * Send Follow-up Reminder Email
 */
const sendFollowUpReminder = async (user, application) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #d97706; padding: 28px 24px; text-align: center; color: #ffffff; }
        .content { padding: 32px 24px; }
        .btn { display: inline-block; background-color: #d97706; color: #ffffff !important; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">Application Follow-Up Due ⏰</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your follow-up date has arrived for your job application with <strong>${application.companyName}</strong> (${application.jobTitle}).</p>
          <p>Sending a polite follow-up email to the recruiter or hiring manager can boost your chances of response by up to 40%.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/applications/${application._id}" class="btn">View Application Details</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Follow-Up Reminder: ${application.companyName} (${application.jobTitle})`,
    text: `Hi ${user.name}, you scheduled a follow-up for your application at ${application.companyName} (${application.jobTitle}).`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendInterviewReminder,
  sendFollowUpReminder,
};
