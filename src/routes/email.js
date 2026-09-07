/**
 * Email Routes
 * Handles newsletter subscriptions and email sending
 */

const express = require('express');
const router = express.Router();

const { sendWelcomeEmail, sendNewsletter } = require('../utils/emailService');
const { appendToFile, findInFile, filterFile } = require('../utils/storage');
const { verifyToken } = require('../utils/tokenService');

const SUBSCRIBERS_FILE = 'subscribers.json';

/**
 * POST /api/email/subscribe
 * Subscribe a user to the newsletter
 * Body: { name, email }
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if already subscribed
    const existingSubscriber = findInFile(SUBSCRIBERS_FILE, (s) => s.email === email);
    if (existingSubscriber) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    // Create subscriber object
    const newSubscriber = {
      id: Date.now().toString(),
      name,
      email,
      subscriptionDate: new Date().toISOString(),
      status: 'active'
    };

    // Save subscriber
    const saved = appendToFile(SUBSCRIBERS_FILE, newSubscriber);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    // Send welcome email
    const emailResult = await sendWelcomeEmail(email, name, 'subscriber');

    console.log(`✅ New subscriber: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Subscription successful! Check your email for confirmation.',
      subscriber: {
        id: newSubscriber.id,
        name: newSubscriber.name,
        email: newSubscriber.email
      }
    });
  } catch (error) {
    console.error('Subscription error:', error.message);
    res.status(500).json({ error: 'Subscription failed', details: error.message });
  }
});

/**
 * POST /api/email/unsubscribe
 * Unsubscribe from newsletter
 * Body: { email }
 */
router.post('/unsubscribe', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find and update subscriber status
    const subscriber = findInFile(SUBSCRIBERS_FILE, (s) => s.email === email);
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    // Delete subscriber
    const { deleteFromFile } = require('../utils/storage');
    const deleted = deleteFromFile(SUBSCRIBERS_FILE, (s) => s.email === email);

    if (!deleted) {
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    console.log(`✅ Unsubscribed: ${email}`);

    res.status(200).json({
      success: true,
      message: 'You have been unsubscribed from our newsletter'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error.message);
    res.status(500).json({ error: 'Unsubscribe failed' });
  }
});

/**
 * GET /api/email/subscribers
 * Get all subscribers (admin only)
 * Requires valid JWT token
 */
router.get('/subscribers', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    verifyToken(token); // Will throw if invalid

    const subscribers = filterFile(SUBSCRIBERS_FILE, (s) => s.status === 'active');

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized', details: error.message });
  }
});

/**
 * POST /api/email/send-newsletter
 * Send newsletter to all subscribers (admin only)
 * Requires valid JWT token
 * Body: { subject, html }
 */
router.post('/send-newsletter', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    verifyToken(token); // Will throw if invalid

    const { subject, html } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ error: 'Subject and HTML content are required' });
    }

    // Get all active subscribers
    const subscribers = filterFile(SUBSCRIBERS_FILE, (s) => s.status === 'active');
    const emails = subscribers.map((s) => s.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No active subscribers' });
    }

    // Send newsletter
    const results = await sendNewsletter(emails, subject, html);

    console.log(`📧 Newsletter sent: ${results.sent} success, ${results.failed} failed`);

    res.status(200).json({
      success: true,
      message: 'Newsletter sent',
      results
    });
  } catch (error) {
    console.error('Newsletter error:', error.message);
    res.status(500).json({ error: 'Failed to send newsletter', details: error.message });
  }
});

module.exports = router;
