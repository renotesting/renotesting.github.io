/**
 * Contact Form Routes
 * Handles contact form submissions
 */

const express = require('express');
const router = express.Router();

const { sendEmail, sendContactConfirmation } = require('../utils/emailService');
const { appendToFile } = require('../utils/storage');

const CONTACTS_FILE = 'contact-submissions.json';

/**
 * POST /api/contact
 * Submit a contact form
 * Body: { name, email, phone, subject, message }
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create contact submission object
    const submission = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || 'Not provided',
      subject,
      message,
      submittedAt: new Date().toISOString(),
      status: 'new'
    };

    // Save submission to file
    const saved = appendToFile(CONTACTS_FILE, submission);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to submit contact form' });
    }

    // Send confirmation email to user
    await sendContactConfirmation(submission);

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 5px; }
              .content { padding: 20px; background-color: #f5f5f5; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #ff6b6b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div>${name} (${email})</div>
                </div>
                <div class="field">
                  <div class="label">Phone:</div>
                  <div>${phone || 'Not provided'}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div>${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div style="white-space: pre-wrap;">${message}</div>
                </div>
                <div class="field">
                  <div class="label">Submission ID:</div>
                  <div>${submission.id}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `📧 New Contact: ${subject}`,
        html: adminHtml
      });
    }

    console.log(`✅ Contact submission received from ${email}`);

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      submissionId: submission.id
    });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({ error: 'Failed to submit contact form', details: error.message });
  }
});

/**
 * GET /api/contact/:id
 * Get a contact submission (for demo/testing)
 */
router.get('/:id', (req, res) => {
  try {
    const { findInFile } = require('../utils/storage');
    const submission = findInFile(CONTACTS_FILE, (c) => c.id === req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contact submission' });
  }
});

module.exports = router;
