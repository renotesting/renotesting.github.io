// Read at build time. Without a number, every WhatsApp link is left out of the site.
const number = String(import.meta.env.PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');

const GREETING = 'Hi Reno, I found you on renofitness.ca and have a question.';

export const whatsappUrl = number
  ? `https://wa.me/${number}?text=${encodeURIComponent(GREETING)}`
  : null;
