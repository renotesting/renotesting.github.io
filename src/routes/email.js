/**
 * Email Routes
 * Handles newsletter subscriptions and email sending
 */

const express = require('express');
const router = express.Router();

const { sendWelcomeEmail, sendNewsletter } = require('../utils/emailService');
const { appendToFile, findInFile, filterFile, deleteFromFile } = require('../utils/storage');
const { verifyAuth, requireAdmin } = require('../middleware/auth');
const { subscribeLimiter, unsubscribeLimiter } = require('../middleware/rateLimit');
const { verifyUnsubscribeToken } = require('../utils/tokenService');

const SUBSCRIBERS_FILE = 'subscribers.json';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

router.post('/subscribe', subscribeLimiter, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (typeof name !== 'string' || typeof email !== 'string' || !name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (name.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ success: false, message: 'Name is too long' });
    }

    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existingSubscriber = findInFile(SUBSCRIBERS_FILE, (s) => s.email === email);
    if (existingSubscriber) {
      return res.status(409).json({ success: false, message: 'Email already subscribed' });
    }

    const newSubscriber = {
      id: Date.now().toString(),
      name,
      email,
      subscriptionDate: new Date().toISOString(),
      status: 'active'
    };

    const saved = appendToFile(SUBSCRIBERS_FILE, newSubscriber);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }

    const welcome = await sendWelcomeEmail(email, name, 'subscriber', newSubscriber.id);

    res.status(201).json({
      success: true,
      message: welcome.success
        ? 'Subscription successful! Check your email for confirmation.'
        : "You're subscribed! We couldn't send a confirmation email, but you're on the list.",
      subscriber: {
        id: newSubscriber.id,
        name: newSubscriber.name,
        email: newSubscriber.email
      }
    });
  } catch (error) {
    console.error('Subscription error:', error.message);
    res.status(500).json({ success: false, message: 'Subscription failed' });
  }
});

// Requires the signed token from an email link: knowing someone's address isn't enough to remove them.
router.post('/unsubscribe', unsubscribeLimiter, (req, res) => {
  try {
    // Query string: mail clients' one-click unsubscribe POSTs to the URL in the List-Unsubscribe header.
    const token = req.body.token || req.query.token;

    let subscriberId;
    try {
      subscriberId = verifyUnsubscribeToken(String(token));
    } catch (error) {
      return res.status(400).json({ success: false, message: 'This unsubscribe link is not valid' });
    }

    // Repeating a valid link still succeeds: the person is unsubscribed either way.
    const removed = deleteFromFile(SUBSCRIBERS_FILE, (s) => s.id === subscriberId);
    if (!removed) {
      return res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
    }

    res.status(200).json({
      success: true,
      message: 'You have been unsubscribed from our newsletter'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error.message);
    res.status(500).json({ success: false, message: 'Unsubscribe failed' });
  }
});

router.get('/subscribers', verifyAuth, requireAdmin, (req, res) => {
  try {
    const subscribers = filterFile(SUBSCRIBERS_FILE, (s) => s.status === 'active');

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('List subscribers error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to list subscribers' });
  }
});

router.post('/send-newsletter', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { subject, html } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ success: false, message: 'Subject and HTML content are required' });
    }

    const subscribers = filterFile(SUBSCRIBERS_FILE, (s) => s.status === 'active');

    if (subscribers.length === 0) {
      return res.status(400).json({ success: false, message: 'No active subscribers' });
    }

    const results = await sendNewsletter(subscribers, subject, html);

    res.status(200).json({
      success: true,
      message: 'Newsletter sent',
      results
    });
  } catch (error) {
    console.error('Newsletter error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send newsletter' });
  }
});

module.exports = router;
