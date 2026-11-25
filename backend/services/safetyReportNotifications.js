const { createHash, randomUUID } = require('node:crypto');
// Load the required transport at startup so a missing installation cannot leave
// a running API silently accumulating undeliverable notification jobs.
const nodemailer = require('nodemailer');
const { getPool } = require('../config/db');

const subject = 'Adverse Event Reporting';
const previousPresetHashes = {
  'safety-report': [
    '437477a1eb128b114998e8825866a63bc435a880c8aedc83080ae159de485e29',
    'ec7918645efd3d187c04f29f30c38abfe19c55f8d88a8d3c302f45adc6f55eef'
  ],
  'safety-report-brief': [
    'aba43abe5b0a96533571e9bf28503eb115c0b5fe141a98a59462e65876767e36',
    '975912146725c6611f3c515fdff605b9da7f2cce5e66fc592c7e450c7c3fb366'
  ]
};
const fields = [
  { key: 'report_id', label: 'Report reference', example: '1042' },
  { key: 'submitted_at', label: 'Received (UTC)', example: '2026-11-19 06:45:00' },
  { key: 'updated_at', label: 'Last updated (UTC)', example: '2026-11-19 08:15:00' },
  { key: 'status', label: 'Report status', example: 'Under Review' },
  { key: 'admin_url', label: 'Admin report link', example: '#' },
  { key: 'product_name', label: 'Product name', example: 'Example vaccine' },
  { key: 'batch_number', label: 'Batch number', example: 'B-1042' },
  { key: 'expiration_date', label: 'Expiration date', example: '2027-06-30' },
  { key: 'reporter_name', label: 'Reporter name', example: 'Sample Reporter' },
  { key: 'patient_name', label: 'Patient name', example: 'Sample Patient' },
  { key: 'contact_number', label: 'Contact number', example: '+966 50 000 0000' },
  { key: 'email', label: 'Reporter email', example: 'reporter@example.com' },
  { key: 'occupation', label: 'Occupation', example: 'Healthcare professional' },
  { key: 'side_effect_description', label: 'Adverse event description', example: 'Sample event description.' },
  { key: 'other_info', label: 'Additional information', example: 'Sample additional information.' }
];
const fieldKeys = new Set(fields.map(field => field.key));
const legacyFields = ['report_id', 'submitted_at', 'admin_url'];
const defaultTemplates = [
  {
    id: 'safety-report',
    name: 'Pharmacovigilance | Professional Notification',
    subject,
    showLogo: true,
    fields: [...legacyFields, 'status'],
    html: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf3f7;font-family:Arial,Helvetica,sans-serif;color:#183449">
  <tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #d8e4ea">
      <tr><td style="padding:20px 28px 8px;border-top:4px solid #07847e">
        {{company_logo}}
        <p style="margin:0 0 10px;font-size:13px;color:#496474">Vaccine Industrial Company</p>
      </td></tr>
      <tr><td style="padding:24px 28px;background:#10364c;color:#fff">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.5px;font-weight:bold;color:#9eece3">PHARMACOVIGILANCE</p>
        <h1 style="margin:0;font-size:27px;line-height:1.2;color:#fff">Adverse Event Reporting</h1>
      </td></tr>
      <tr><td style="padding:24px 28px;font-size:15px;line-height:1.6">
        <p style="margin:0 0 8px">Dear Pharmacovigilance Team,</p>
        <p style="margin:0 0 18px">{{event_message}}</p>
        {{report_fields}}
        {{report_link}}
      </td></tr>
      <tr><td style="padding:14px 28px;background:#f5f8fa;border-top:1px solid #d8e4ea;font-size:12px;line-height:1.5;color:#496474">
        <strong>Confidential</strong><br>Please handle this report confidentially.
      </td></tr>
    </table>
  </td></tr>
</table>`
  },
  {
    id: 'safety-report-brief',
    name: 'Pharmacovigilance | Brief Alert',
    subject,
    showLogo: true,
    fields: ['report_id', 'status', 'admin_url'],
    html: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f6f7;font-family:Arial,Helvetica,sans-serif;color:#183449">
  <tr><td align="center" style="padding:20px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;background:#fff;border:1px solid #d8e4ea">
      <tr><td style="padding:20px 24px;border-left:4px solid #07847e">
        {{company_logo}}
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;font-weight:bold;color:#07645e">VIC PHARMACOVIGILANCE</p>
        <h1 style="margin:0 0 12px;font-size:23px;line-height:1.25">Adverse Event Reporting</h1>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.6">{{event_message}}</p>
        {{report_fields}}
        {{report_link}}
      </td></tr>
      <tr><td style="padding:12px 24px;border-top:1px solid #d8e4ea;font-size:12px;color:#496474">
        Vaccine Industrial Company &middot; Confidential
      </td></tr>
    </table>
  </td></tr>
</table>`
  }
];


const defaults = {
  templates: defaultTemplates,
  pharmacovigilance: { enabled: false, recipient: '', templateId: defaultTemplates[0].id }
};

async function readSettings(connection) {
  const [rows] = await connection.query('SELECT settings_json FROM email_notification_settings WHERE id = 1');
  if (!rows.length) return defaults;

  const stored = JSON.parse(rows[0].settings_json);
  const templates = stored.templates.map(({ blocks, ...template }) => {
    const preset = defaultTemplates.find(item => item.id === template.id);
    const hash = createHash('sha256').update(template.html.trim().replace(/\r\n/g, '\n')).digest('hex');
    const html = preset && previousPresetHashes[preset.id].includes(hash) ? preset.html : template.html;
    const selectedFields = template.fields ?? legacyFields.filter(key => html.includes(`{{${key}}}`));
    return {
      ...template,
      html,
      subject,
      showLogo: template.showLogo ?? Boolean(preset),
      fields: Array.isArray(blocks) && !blocks.some(block => block.type === 'fields') ? [] : selectedFields
    };
  });
  if (stored.templates.some(template => !Array.isArray(template.fields))) {
    for (const template of defaultTemplates) {
      if (templates.length < 20 && !templates.some(item => item.id === template.id)) templates.push(template);
    }
  }
  return { ...stored, templates };
}

const phpMail = require('./phpMailTransport');
const usesPhp = () => process.env.MAIL_TRANSPORT === 'php';
const deliveryEnvironment = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'EMAIL_FROM'];
const withinRetryWindow = 'attempts < 12 AND (first_attempt_at IS NULL OR first_attempt_at >= NOW() - INTERVAL 23 HOUR)';

function missingDeliverySettings() {
  if (usesPhp()) return process.env.EMAIL_FROM?.trim() ? [] : ['EMAIL_FROM'];
  const missing = deliveryEnvironment.filter(key => !process.env[key]?.trim());
  if (!Number.isInteger(smtpPort()) || smtpPort() < 1 || smtpPort() > 65535) missing.push('SMTP_PORT');
  return missing;
}

function smtpPort() {
  return Number(process.env.SMTP_PORT?.trim() || 465);
}

function deliveryConfigured() {
  return missingDeliverySettings().length === 0;
}

async function getDeliveryStatus(connection) {
  const missingSettings = missingDeliverySettings();
  const transportAvailable = usesPhp() ? await phpMail.available() : typeof nodemailer.createTransport === 'function';
  try {
    const [[counts]] = await connection.query(`SELECT
      COUNT(CASE WHEN sent_at IS NOT NULL THEN 1 END) AS accepted,
      COUNT(CASE WHEN sent_at IS NULL AND (${withinRetryWindow}) THEN 1 END) AS pending,
      COUNT(CASE WHEN sent_at IS NULL AND NOT (${withinRetryWindow}) THEN 1 END) AS expired
      FROM pharmacovigilance_email_outbox`);
    return { missingSettings, transportAvailable, queue: {
      accepted: Number(counts.accepted), pending: Number(counts.pending), expired: Number(counts.expired)
    } };
  } catch (error) {
    console.warn('[Safety report email delivery status]', error.code || error.name);
    return { missingSettings, transportAvailable, queue: null };
  }
}

async function getEmailHistory(connection, page, status) {
  const pageSize = 25;
  const filter = {
    accepted: 'WHERE sent_at IS NOT NULL',
    pending: `WHERE sent_at IS NULL AND (${withinRetryWindow})`,
    expired: `WHERE sent_at IS NULL AND NOT (${withinRetryWindow})`
  };
  const [rows] = await connection.query(`SELECT id, report_id AS reportId, attempts,
    first_attempt_at AS firstAttemptAt, sent_at AS sentAt,
    CASE WHEN JSON_VALID(payload_json) THEN JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.to[0]')) END AS recipient,
    CASE WHEN JSON_VALID(payload_json) THEN JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.subject')) END AS subject,
    CASE WHEN sent_at IS NOT NULL THEN 'accepted'
      WHEN ${withinRetryWindow} THEN 'pending' ELSE 'expired' END AS status
    FROM pharmacovigilance_email_outbox ${filter[status] ?? ''}
    ORDER BY COALESCE(sent_at, first_attempt_at, next_attempt_at) DESC, id DESC
    LIMIT ? OFFSET ?`, [pageSize + 1, (page - 1) * pageSize]);
  return { items: rows.slice(0, pageSize), hasMore: rows.length > pageSize };
}

function parseRecipients(value) {
  const addresses = new Map();
  for (const address of value.split(/[,;\r\n]+/).map(part => part.trim()).filter(Boolean)) {
    if (!addresses.has(address.toLowerCase())) addresses.set(address.toLowerCase(), address);
  }
  return [...addresses.values()];
}

function validateSettings(input) {
  const { templates, pharmacovigilance } = input || {};
  if (!Array.isArray(templates) || templates.length < 1 || templates.length > 20) return null;
  const cleaned = [];
  const ids = new Set();
  for (const template of templates) {
    if (!template || !['id', 'name', 'html'].every(key => typeof template[key] === 'string')) return null;
    const { id, name, html, fields: selectedFields } = template;
    const showLogo = template.showLogo ?? defaultTemplates.some(preset => preset.id === id);
    if (!/^[a-zA-Z0-9-]{1,64}$/.test(id) || ids.has(id) ||
        !name.trim() || name.length > 100 || !html.trim() || html.length > 110000 ||
        typeof showLogo !== 'boolean' ||
        !Array.isArray(selectedFields) || selectedFields.length > fields.length ||
        selectedFields.some(key => !fieldKeys.has(key))) return null;
    ids.add(id);
    cleaned.push({ id, name: name.trim(), subject, html, showLogo, fields: [...new Set(selectedFields)] });
  }
  const { enabled, recipient, templateId } = pharmacovigilance || {};
  if (typeof enabled !== 'boolean' || typeof recipient !== 'string' || recipient.length > 5100 || !ids.has(templateId)) return null;
  const recipients = parseRecipients(recipient);
  if ((enabled && !recipients.length) || recipients.length > 20 ||
      recipients.some(address => address.length > 254 || !/^[^\s@<>,;:"()\\]+@[a-z\d.-]+\.[a-z\d-]+$/i.test(address))) return null;
  return { templates: cleaned, pharmacovigilance: { enabled, recipient: recipients.join('\n'), templateId } };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function formatTimestamp(value) {
  return value instanceof Date ? value.toISOString().slice(0, 19).replace('T', ' ') : String(value ?? '');
}

async function enqueue(connection, reportId, event) {
  const settings = await readSettings(connection);
  const { enabled, recipient, templateId } = settings.pharmacovigilance;
  if (!enabled) return false;

  const template = settings.templates.find(item => item.id === templateId);
  const [[report]] = await connection.query(
    'SELECT *, CAST(expiration_date AS CHAR) AS expiration_date_text FROM pharmacovigilance_reports WHERE id = ?',
    [reportId]
  );
  const message = event === 'updated'
    ? 'An adverse event report was updated in the VIC admin portal.'
    : 'A new adverse event report was submitted and is available for review.';
  const values = {
    ...report,
    report_id: String(reportId),
    submitted_at: formatTimestamp(report.created_at),
    updated_at: formatTimestamp(report.updated_at),
    expiration_date: report.expiration_date_text,
    admin_url: 'https://vaccine.com.sa/admin/pharmacovigilance'
  };
  const selected = fields.filter(({ key }) => template.fields.includes(key) && values[key] != null && values[key] !== '');
  const inlineKeys = new Set(Array.from(template.html.matchAll(/\{\{(\w+)\}\}/g), match => match[1]));
  const rows = selected.filter(({ key }) =>
    !(key === 'admin_url' && inlineKeys.has('report_link')) && (!legacyFields.includes(key) || !inlineKeys.has(key))
  ).map(({ key, label }) => {
    const value = escapeHtml(String(values[key]));
    const content = key === 'admin_url' ? `<a href="${value}">Open safety reports</a>` : value.replace(/\r?\n/g, '<br>');
    return `<tr><th scope="row" style="padding:9px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #dde8ee;color:#355568">${label}</th><td style="padding:9px 12px;border-bottom:1px solid #dde8ee;overflow-wrap:anywhere">${content}</td></tr>`;
  }).join('');
  const details = rows ? `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f3f8fa;font-size:14px"><tbody>${rows}</tbody></table>` : '';
  let logoUrl = '';
  if (template.showLogo) {
    let path = 'logo_navbar_white.webp';
    try {
      const [[branding]] = await connection.query('SELECT home_banner_logo FROM site_logo_settings WHERE id = 1');
      path = branding?.home_banner_logo || path;
    } catch (error) {
      if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
    }
    const publicPath = path.replace(/^\/?uploads\//, '/backend/uploads/');
    const pngPath = publicPath.replace(/\.webp$/i, '.png');
    const localPng = require('node:path').resolve(__dirname, publicPath.startsWith('/backend/uploads/') ? '../uploads' : '../../public', require('node:path').basename(pngPath));
    logoUrl = new URL(/\.webp$/i.test(publicPath) && require('node:fs').existsSync(localPng) ? pngPath : publicPath, 'https://vaccine.com.sa/').href;
  }
  const logoHtml = `<div style="margin:0 0 12px"><img src="${logoUrl}" alt="Vaccine Industrial Company" width="250" style="display:block;width:250px;max-width:100%;height:auto;border:0;background:#103449;padding:8px;box-sizing:border-box"></div>`;
  const logo = template.showLogo ? logoHtml : '';
  const reportLink = selected.some(({ key }) => key === 'admin_url')
    ? `<div style="padding-top:18px"><a href="${escapeHtml(values.admin_url)}" style="display:inline-block;padding:10px 16px;background:#076b66;border:1px solid #076b66;border-radius:4px;color:#fff;font-size:14px;font-weight:bold;text-decoration:none">Open safety reports</a></div>`
    : '';
  const source = template.showLogo ? template.html : template.html.replace(/<img\b[^>]*\bsrc=["']\{\{company_logo_url\}\}["'][^>]*>/gi, '');
  const html = source.replace(/\{\{(\w+)\}\}/g, (token, key) => {
    if (key === 'company_logo_url') return template.showLogo ? logoUrl : '';
    if (key === 'company_logo') return logo;
    if (key === 'report_link') return reportLink;
    if (key === 'event_message') return message;
    if (key === 'report_fields') return details;
    if (!fieldKeys.has(key)) return token;
    if (!legacyFields.includes(key)) return '';
    return selected.some(field => field.key === key) ? escapeHtml(String(values[key])) : '';
  });
  const payload = {
    logoUrl,
    subject,
    html: (inlineKeys.has('company_logo') || inlineKeys.has('company_logo_url') ? '' : logo) +
      html + (inlineKeys.has('report_fields') ? '' : details),
    text: [message, ...selected.map(({ key, label }) => `${label}: ${values[key]}`)].join('\n')
  };
  const jobs = parseRecipients(recipient).map(address => [randomUUID(), reportId, JSON.stringify({ ...payload, to: [address] })]);
  await connection.query('INSERT INTO pharmacovigilance_email_outbox (id, report_id, payload_json) VALUES ?', [jobs]);
  return true;
}


let processing = false;
async function deliverPending() {
  if (processing || !deliveryConfigured()) return;
  processing = true;
  try {
    const pool = getPool();
    const port = smtpPort();
    if (usesPhp() && !(await phpMail.available())) { console.warn('[Safety report email queue] PHP mail unavailable. Check PHP_BINARY and the relay configured in php.ini (XAMPP default: localhost:25).'); return; }
    const mailer = usesPhp() ? phpMail : nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      disableUrlAccess: true,
      disableFileAccess: true
    });
    const [jobs] = await pool.query(`SELECT id, payload_json FROM pharmacovigilance_email_outbox
      WHERE sent_at IS NULL AND next_attempt_at <= NOW() AND ${withinRetryWindow}
      ORDER BY next_attempt_at LIMIT 20`);
    for (const job of jobs) {
      const [claim] = await pool.query(`UPDATE pharmacovigilance_email_outbox
        SET attempts = attempts + 1, next_attempt_at = NOW() + INTERVAL 5 MINUTE,
            first_attempt_at = COALESCE(first_attempt_at, NOW())
        WHERE id = ? AND sent_at IS NULL AND next_attempt_at <= NOW() AND ${withinRetryWindow}`, [job.id]);
      if (!claim.affectedRows) continue;
      try {
        const payload = JSON.parse(job.payload_json);
        const result = await mailer.sendMail({
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          from: process.env.EMAIL_FROM.trim(),
          messageId: `<${job.id}@${process.env.EMAIL_FROM.trim().split('@')[1]}>`
        });
        if (!result.accepted?.length || result.rejected?.length) {
          throw Object.assign(new Error('SMTP rejected the recipient'), { code: 'ERECIPIENT' });
        }
        await pool.query('UPDATE pharmacovigilance_email_outbox SET sent_at = NOW() WHERE id = ?', [job.id]);
        console.info('[Safety report email notification]', job.id, 'accepted by mail transport');
      } catch (error) {
        console.warn('[Safety report email notification]', job.id, error.code || error.name, error.responseCode || '');
      }
    }
  } catch (error) {
    console.warn('[Safety report email queue]', error.code || error.name);
  } finally {
    processing = false;
  }
}

module.exports = { fields, readSettings, validateSettings, deliveryConfigured, getDeliveryStatus, getEmailHistory, enqueue, deliverPending };
