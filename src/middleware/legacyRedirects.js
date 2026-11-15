/**
 * Legacy URL redirects
 * Keeps links and search results for the old GitHub Pages site working.
 */

const express = require('express');
const router = express.Router();

const PERMANENT_REDIRECTS = {
  '/index.html': '/',
  '/blog.html': '/blog/',
  '/login.html': '/login/',
  '/register.html': '/register/',
  '/subscribe.html': '/subscribe/',
  '/generator.html': '/generator/',
  // The Mindbody booking widgets these pages embedded were discontinued.
  '/widgets/class.html': '/contact/',
  '/widgets/appointment.html': '/contact/'
};

function addRedirects(redirects, status) {
  for (const [from, to] of Object.entries(redirects)) {
    router.get(from, (req, res) => {
      const queryStart = req.originalUrl.indexOf('?');
      const query = queryStart === -1 ? '' : req.originalUrl.slice(queryStart);
      res.redirect(status, `${to}${query}`);
    });
  }
}

addRedirects(PERMANENT_REDIRECTS, 301);

module.exports = router;
