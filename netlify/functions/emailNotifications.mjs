const jsonHeaders = {
  'Content-Type': 'application/json',
};

const compact = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const getConfiguredSender = () => {
  return process.env.SUBMISSION_EMAIL_FROM
    || process.env.RESEND_FROM_EMAIL
    || '';
};

const getNotificationRecipients = () => {
  const raw = process.env.SUBMISSION_NOTIFICATION_EMAIL || process.env.NOTIFICATION_EMAIL || '';
  return raw.split(',').map((email) => email.trim()).filter(Boolean);
};

const buildEmailText = ({ title, lines }) => {
  return [
    title,
    '',
    ...lines.filter(Boolean),
    '',
    'The Banjees',
  ].join('\n');
};

const sendWithResend = async ({ to, subject, text, replyTo }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'RESEND_API_KEY is not configured.' };
  const from = getConfiguredSender();
  if (!from) return { skipped: true, reason: 'SUBMISSION_EMAIL_FROM is not configured.' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      reply_to: replyTo || undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email failed with status ${response.status}.`);
  }

  return { ok: true };
};

export const sendSubmissionEmails = async ({ id, answers, summary }) => {
  const nominatorEmail = compact(answers['Nominator Contact']);
  const nominatorName = compact(answers['Nominator Name']) || 'there';
  const category = compact(summary.category);
  const nominee = compact(summary.nominee);

  const tasks = [];
  const recipients = getNotificationRecipients();

  if (recipients.length) {
    tasks.push(sendWithResend({
      to: recipients,
      replyTo: nominatorEmail,
      subject: `New Banjees nomination: ${category}`,
      text: buildEmailText({
        title: 'A new nomination was submitted.',
        lines: [
          `Submission ID: ${id}`,
          `Category: ${category}`,
          `Nominee: ${nominee}`,
          `Submitted by: ${nominatorName}`,
          `Contact: ${nominatorEmail}`,
          'Review the nomination in the site admin panel before it appears publicly.',
        ],
      }),
    }));
  }

  if (nominatorEmail) {
    tasks.push(sendWithResend({
      to: [nominatorEmail],
      subject: 'The Banjees received your nomination',
      text: buildEmailText({
        title: `Thank you, ${nominatorName}.`,
        lines: [
          'Your Banjees nomination was received and is now pending review by The People\'s Choice Academy.',
          `Category: ${category}`,
          `Nominee: ${nominee}`,
          'Approved nominations will appear in the public nominee directory after review.',
        ],
      }),
    }));
  }

  if (!tasks.length) return { skipped: true };

  return Promise.allSettled(tasks);
};
