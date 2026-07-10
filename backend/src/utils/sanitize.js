// Headers we strip before storing in the database.
// This protects users who accidentally send real credentials
// in a webhook — e.g. Stripe signing secrets, Bearer tokens.
const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'x-secret',
  'cookie',
  'set-cookie',
  'proxy-authorization',
];

const sanitizeHeaders = (headers = {}) => {
  const sanitized = { ...headers };
  SENSITIVE_HEADERS.forEach(key => {
    if (sanitized[key]) {
      sanitized[key] = '[redacted]';
    }
  });
  return sanitized;
};

module.exports = { sanitizeHeaders };