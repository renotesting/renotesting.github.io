/**
 * Grants admin access to an existing account:
 *   npm run make-admin -- someone@example.com
 *
 * A command rather than an API route or an ADMIN_EMAIL check: registration doesn't verify
 * email addresses, so anyone could otherwise claim admin by registering with the right email.
 */

require('dotenv').config();

const { findInFile, updateInFile } = require('../src/utils/storage');

const USERS_FILE = 'users.json';
const email = process.argv[2];

if (!email) {
  console.error('Usage: npm run make-admin -- someone@example.com');
  process.exit(1);
}

const user = findInFile(USERS_FILE, (u) => u.email === email);

if (!user) {
  console.error(`No account found for ${email}. Register on the site first, then run this again.`);
  process.exit(1);
}

if (!updateInFile(USERS_FILE, (u) => u.id === user.id, { role: 'admin' })) {
  console.error('Could not save the change.');
  process.exit(1);
}

console.log(`${email} is now an admin.`);
