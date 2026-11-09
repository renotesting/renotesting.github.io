/**
 * Email Service
 * Handles sending emails via Nodemailer
 * Supports Gmail, Outlook, and custom SMTP servers
 */

const nodemailer = require('nodemailer');
const { escapeHtml } = require('./sanitize');
const { generateUnsubscribeToken } = require('./tokenService');

let transporter = null;

function getSiteUrl() {
  return (process.env.SITE_URL || 'https://www.renofitness.ca').replace(/\/+$/, '');
}

function unsubscribeLinks(subscriberId) {
  const token = encodeURIComponent(generateUnsubscribeToken(subscriberId));
  const siteUrl = getSiteUrl();
  return {
    // A page with a confirm button: mail scanners that open links must not unsubscribe anyone.
    page: `${siteUrl}/unsubscribe/?token=${token}`,
    // RFC 8058 one-click target for the unsubscribe button mail clients show.
    oneClick: `${siteUrl}/api/email/unsubscribe?token=${token}`
  };
}

function unsubscribeFooter(pageUrl) {
  return `<p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">You're receiving this because you subscribed to the RenoFitness newsletter. <a href="${escapeHtml(pageUrl)}">Unsubscribe</a></p>`;
}

function withFooter(html, footer) {
  return /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, () => `${footer}</body>`)
    : `${html}${footer}`;
}

function buildTransportOptions(provider, auth) {
  if (provider === 'gmail' || provider === 'outlook') {
    return { service: provider, auth };
  }

  if (provider === 'custom') {
    if (!process.env.SMTP_HOST) {
      console.warn('⚠️  EMAIL_PROVIDER=custom requires SMTP_HOST. Email service disabled.');
      return null;
    }
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth
    };
  }

  console.warn(`⚠️  Unknown EMAIL_PROVIDER "${provider}". Email service disabled.`);
  return null;
}

/**
 * Initialize email transporter
 * Must be called before sending emails
 */
function initializeEmailService() {
  try {
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    if (!emailUser || !emailPassword) {
      console.warn('⚠️  Email credentials not configured. Email service disabled.');
      return false;
    }
    
    // Should be an app-specific password, not the account's regular password
    const transportOptions = buildTransportOptions(emailProvider, {
      user: emailUser,
      pass: emailPassword
    });

    if (!transportOptions) {
      return false;
    }

    transporter = nodemailer.createTransport(transportOptions);
    console.log(`✅ Email service initialized with ${emailProvider}`);
    return true;
  } catch (error) {
    console.error('Error initializing email service:', error.message);
    return false;
  }
}

/**
 * Send single email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {string} options.text - Plain text email body (optional)
 * @param {Object} options.headers - Extra email headers (optional)
 * @returns {Promise<Object>} Email sending result
 */
async function sendEmail({ to, subject, html, text, headers }) {
  try {
    if (!transporter) {
      throw new Error('Email service not initialized');
    }
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'RenoFitness'} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html,
      ...(headers ? { headers } : {})
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send welcome email to new subscriber/user
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} type - Type of welcome (user or subscriber)
 * @param {string} subscriberId - Subscriber id, used for the unsubscribe link (subscribers only)
 * @returns {Promise<Object>} Email sending result
 */
async function sendWelcomeEmail(email, name, type = 'user', subscriberId = null) {
  const siteUrl = getSiteUrl();
  const adminEmail = process.env.ADMIN_EMAIL;
  const subject = type === 'subscriber'
    ? '🎉 Welcome to RenoFitness Newsletter!'
    : '🏋️ Welcome to RenoFitness Community!';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RenoFitness! 🥊</h1>
          </div>
          <div class="content">
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thank you for joining the RenoFitness community! We're excited to have you on board.</p>
            
            ${type === 'subscriber' ? `
            <p>You'll now receive our latest fitness tips, training updates, and exclusive offers directly in your inbox.</p>
            <p>Check out our services:
              <ul>
                <li>🥊 Kickboxing Classes</li>
                <li>🥋 Muay Thai Training</li>
                <li>💪 Personal Training</li>
                <li>🏋️ Weight Training Programs</li>
              </ul>
            </p>
            ` : `
            <p>Your account has been successfully created. You can now access exclusive member features and book training sessions.</p>
            `}
            
            <p>Questions? ${adminEmail ? `Feel free to contact us at ${escapeHtml(adminEmail)}.` : `<a href="${siteUrl}/contact/">Get in touch with us</a>.`}</p>

            <p>Stay strong! 💪<br>
            <strong>The RenoFitness Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RenoFitness. All rights reserved.</p>
            <p><a href="${siteUrl}/">Visit our website</a> | <a href="https://www.facebook.com/renofitness/">Follow us on Facebook</a></p>
            ${subscriberId ? `<p><a href="${escapeHtml(unsubscribeLinks(subscriberId).page)}">Unsubscribe</a></p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html
  });
}

/**
 * Send newsletter to multiple subscribers
 * @param {Array<{id: string, email: string}>} subscribers - Recipients
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<Object>} Results with success/failure counts
 */
async function sendNewsletter(subscribers, subject, html) {
  const results = {
    total: subscribers.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  console.log(`📧 Sending newsletter to ${subscribers.length} subscribers...`);

  for (const { id, email } of subscribers) {
    try {
      const links = unsubscribeLinks(id);
      const result = await sendEmail({
        to: email,
        subject,
        html: withFooter(html, unsubscribeFooter(links.page)),
        headers: {
          'List-Unsubscribe': `<${links.oneClick}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ email, error: result.error });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ email, error: error.message });
    }
  }
  
  console.log(`✅ Newsletter sent: ${results.sent} success, ${results.failed} failed`);
  return results;
}

/**
 * Send contact form submission email
 * @param {Object} data - Contact form data
 * @returns {Promise<Object>} Email sending result
 */
async function sendContactConfirmation(data) {
  const { name, email, subject } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Contacting Us!</h1>
          </div>
          <div class="content">
            <p>Hi ${escapeHtml(name)},</p>
            <p>We received your message and will get back to you as soon as possible.</p>
            <p><strong>Your Message Topic:</strong> ${escapeHtml(subject)}</p>
            <p>In the meantime, feel free to check out our website for more information about our services.</p>
            <p>Stay strong! 💪<br>
            <strong>RenoFitness Team</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: 'We received your message!',
    html
  });
}

module.exports = {
  initializeEmailService,
  sendEmail,
  sendWelcomeEmail,
  sendNewsletter,
  sendContactConfirmation
};
