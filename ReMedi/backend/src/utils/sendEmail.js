module.exports = async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_USER) {
    console.log('sendEmail skipped (EMAIL_USER not configured)', { to, subject });
    return;
  }
  console.log('[sendEmail] to:', to, 'subject:', subject);

};
