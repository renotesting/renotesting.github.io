/**
 * Contact Form Routes
 * Handles contact form submissions
 */

const express = require('express');
const router = express.Router();

const { sendEmail, sendContactConfirmation } = require('../utils/emailService');
const { appendToFile, findInFile } = require('../utils/storage');
const { escapeHtml, stripHeaderBreaks } = require('../utils/sanitize');

const CONTACTS_FILE = 'contact-submissions.json';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  subject: 200,
  message: 5000
};

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required'
      });
    }

    if (!EMAIL_REGEX.test(email) || String(email).length > LIMITS.email) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (String(name).length > LIMITS.name || String(subject).length > LIMITS.subject || String(message).length > LIMITS.message) {
      return res.status(400).json({ success: false, message: 'One or more fields exceed the maximum length' });
    }

    if (phone && String(phone).length > LIMITS.phone) {
      return res.status(400).json({ success: false, message: 'Phone number is too long' });
    }

    const safeName = stripHeaderBreaks(name).slice(0, LIMITS.name);
    const safeEmail = stripHeaderBreaks(email).slice(0, LIMITS.email);
    const safePhone = phone ? stripHeaderBreaks(phone).slice(0, LIMITS.phone) : '';
    const safeSubject = stripHeaderBreaks(subject).slice(0, LIMITS.subject);
    const safeMessage = String(message).slice(0, LIMITS.message);

    const submission = {
      id: Date.now().toString(),
      name: safeName,
      email: safeEmail,
      phone: safePhone || 'Not provided',
      subject: safeSubject,
      message: safeMessage,
      submittedAt: new Date().toISOString(),
      status: 'new'
    };

    const saved = appendToFile(CONTACTS_FILE, submission);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to submit contact form' });
    }

    await sendContactConfirmation(submission);

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #e67e22; color: white; padding: 20px; text-align: center; border-radius: 5px; }
              .content { padding: 20px; background-color: #f5f5f5; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #e67e22; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div>${escapeHtml(safeName)} (${escapeHtml(safeEmail)})</div>
                </div>
                <div class="field">
                  <div class="label">Phone:</div>
                  <div>${escapeHtml(submission.phone)}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div>${escapeHtml(safeSubject)}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div style="white-space: pre-wrap;">${escapeHtml(safeMessage)}</div>
                </div>
                <div class="field">
                  <div class="label">Submission ID:</div>
                  <div>${escapeHtml(submission.id)}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `New Contact: ${safeSubject}`,
        html: adminHtml
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      submissionId: submission.id
    });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit contact form' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const submission = findInFile(CONTACTS_FILE, (c) => c.id === req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve contact submission' });
  }
});

module.exports = router;
