/**
 * Email Routes
 * Handles newsletter subscriptions and email sending
 */

const express = require('express');
const router = express.Router();

const { sendWelcomeEmail, sendNewsletter } = require('../utils/emailService');
const { appendToFile, findInFile, filterFile, deleteFromFile } = require('../utils/storage');
const { verifyAuth } = require('../middleware/auth');

const SUBSCRIBERS_FILE = 'subscribers.json';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/subscribe', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!EMAIL_REGEX.test(email)) {
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

    await sendWelcomeEmail(email, name, 'subscriber');

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
    res.status(500).json({ success: false, message: 'Subscription failed' });
  }
});

router.post('/unsubscribe', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const subscriber = findInFile(SUBSCRIBERS_FILE, (s) => s.email === email);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }

    const deleted = deleteFromFile(SUBSCRIBERS_FILE, (s) => s.email === email);

    if (!deleted) {
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

router.get('/subscribers', verifyAuth, (req, res) => {
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

router.post('/send-newsletter', verifyAuth, async (req, res) => {
  try {
    const { subject, html } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ success: false, message: 'Subject and HTML content are required' });
    }

    const subscribers = filterFile(SUBSCRIBERS_FILE, (s) => s.status === 'active');
    const emails = subscribers.map((s) => s.email);

    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: 'No active subscribers' });
    }

    const results = await sendNewsletter(emails, subject, html);

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
