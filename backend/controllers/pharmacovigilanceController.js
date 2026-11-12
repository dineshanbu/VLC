const { getPool } = require('../config/db');

const defaultPageSettings = {
  hero_eyebrow: 'Patient Safety', hero_eyebrow_ar: 'سلامة المرضى',
  hero_title_line1: 'Adverse Events', hero_title_line1_ar: 'الإبلاغ عن',
  hero_title_line2: 'Reporting.', hero_title_line2_ar: 'الأعراض الجانبية.',
  hero_description: 'At Vaccine Industrial Company, pharmacovigilance is a core priority. We actively monitor medicine safety, manage potential risks, and take necessary actions to protect patients and improve medical care.',
  hero_description_ar: 'في شركة اللقاحات الصناعية (VIC)، تعد اليقظة الدوائية أولوية أساسية ومحورية. نحن نعمل بفاعلية على مراقبة سلامة الأدوية واللقاحات، وإدارة المخاطر المحتملة، واتخاذ كافة الإجراءات اللازمة لحماية المرضى وتعزيز الرعاية الصحية.',
  hero_cta: 'Fill Reporting Form', hero_cta_ar: 'تعبئة نموذج الإبلاغ', hero_image: 'banner_for_all2.webp', hero_image_ar: 'banner_for_all2.webp',
  channels_eyebrow: 'PHARMACOVIGILANCE & PATIENT SAFETY', channels_eyebrow_ar: 'اليقظة الدوائية وسلامة المرضى',
  channels_title: 'Direct Reporting Channels', channels_title_ar: 'قنوات الإبلاغ المباشرة',
  channels_intro: 'To report any safety concerns in Saudi Arabia, contact us via: (Please use one of the below reporting channels):',
  channels_intro_ar: 'للإبلاغ عن أي مخاوف أو بلاغات تتعلق بالسلامة داخل المملكة العربية السعودية، يُرجى التواصل معنا عبر إحدى القنوات التالية:',
  email_title: 'Email', email_title_ar: 'البريد الإلكتروني', email_address: 'mpv@mesned.com',
  email_note: 'Dedicated adverse event monitoring inbox', email_note_ar: 'البريد المخصص لاستقبال بلاغات الأعراض الجانبية',
  phone1_title: 'Primary Safety Line', phone1_title_ar: 'الخط المباشر', phone1_number: '+966 50 554 5754',
  phone1_note: 'Immediate pharmacovigilance telephone reception', phone1_note_ar: 'خدمة تلقي البلاغات الفورية',
  phone2_title: 'Secondary Safety Line', phone2_title_ar: 'خط الطوارئ', phone2_number: '+966 55 175 0051',
  phone2_note: 'Available for urgent safety and medical inquiries', phone2_note_ar: 'متاح للبلاغات والاستفسارات الطبية',
  form_prompt: 'or Use the reporting form published in this page below to submit your report directly.',
  form_prompt_ar: 'أو استخدام نموذج الإبلاغ المنشور في هذه الصفحة أدناه لإرسال التقرير مباشرة.',
  form_eyebrow: 'ADVERSE EVENT REPORT FORM', form_eyebrow_ar: 'نموذج الإبلاغ عن الأعراض الجانبية',
  form_title: 'Please fill out the Reporting form below.', form_title_ar: 'يرجى ملء نموذج الإبلاغ أدناه.',
  form_subtitle: 'All adverse event reports are treated with strict confidentiality in accordance with Saudi Food & Drug Authority (SFDA) pharmacovigilance standards.',
  form_subtitle_ar: 'تُعامل جميع البلاغات والمعلومات بسرية تامة وتُتابع وفقاً لمعايير الهيئة العامة للغذاء والدواء (SFDA).',
  success_title: 'Safety Report Submitted Successfully', success_title_ar: 'تم إرسال بلاغ السلامة بنجاح',
  success_text: 'Thank you for contributing to vaccine and medicine safety. Our pharmacovigilance safety officers have received your report and will follow up if additional details are required.',
  success_text_ar: 'شكراً لكم على مساهمتكم في تعزيز سلامة الأدوية واللقاحات. لقد استلم فريق اليقظة الدوائية بلاغكم وسيتم مراجعته والتواصل معكم عند الحاجة.',
  security_note: 'Your information is strictly protected and securely transmitted to qualified pharmacovigilance safety officers.',
  security_note_ar: 'تتم حماية معلوماتكم بسرية تامة وإرسالها بأمان إلى مسؤولي اليقظة الدوائية المختصين.'
};

async function ensurePageSettingsTable(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS pharmacovigilance_page_settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    settings_json LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

async function ensureReportFormColumns(pool) {
  const [columns] = await pool.query('SHOW COLUMNS FROM pharmacovigilance_reports');
  const byName = new Map(columns.map(column => [column.Field, column]));
  if (byName.get('reporter_name')?.Null === 'NO') {
    await pool.query('ALTER TABLE pharmacovigilance_reports MODIFY COLUMN reporter_name VARCHAR(150) NULL');
  }
  if (!byName.has('patient_name')) {
    await pool.query('ALTER TABLE pharmacovigilance_reports ADD COLUMN patient_name VARCHAR(150) NULL AFTER reporter_name');
  }
  if (!byName.has('batch_number')) {
    await pool.query('ALTER TABLE pharmacovigilance_reports ADD COLUMN batch_number VARCHAR(100) NULL AFTER product_name');
  } else if (byName.get('batch_number')?.Null === 'NO') {
    await pool.query('ALTER TABLE pharmacovigilance_reports MODIFY COLUMN batch_number VARCHAR(100) NULL');
  }
  if (!byName.has('expiration_date')) {
    await pool.query('ALTER TABLE pharmacovigilance_reports ADD COLUMN expiration_date DATE NULL AFTER batch_number');
  } else if (byName.get('expiration_date')?.Null === 'NO') {
    await pool.query('ALTER TABLE pharmacovigilance_reports MODIFY COLUMN expiration_date DATE NULL');
  }
}

exports.getPageSettings = async (_req, res) => {
  try {
    const pool = getPool();
    await ensurePageSettingsTable(pool);
    const [rows] = await pool.query('SELECT settings_json FROM pharmacovigilance_page_settings WHERE id = 1');
    let stored = {};
    if (rows[0]?.settings_json) {
      try { stored = JSON.parse(rows[0].settings_json); } catch (_) { stored = {}; }
    }
    const settings = { ...defaultPageSettings, ...stored };
    settings.hero_image_ar = stored.hero_image_ar || settings.hero_image;
    res.json({ success: true, settings });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch Pharmacovigilance page content.' }); }
};

exports.updatePageSettings = async (req, res) => {
  try {
    const pool = getPool();
    await ensurePageSettingsTable(pool);
    const [rows] = await pool.query('SELECT settings_json FROM pharmacovigilance_page_settings WHERE id = 1');
    let stored = {};
    if (rows[0]?.settings_json) {
      try { stored = JSON.parse(rows[0].settings_json); } catch (_) { stored = {}; }
    }
    let submitted = {};
    if (typeof req.body.settings_json === 'string') {
      try { submitted = JSON.parse(req.body.settings_json); } catch (_) { return res.status(400).json({ success: false, message: 'Invalid page content payload.' }); }
    }
    const settings = { ...defaultPageSettings, ...stored, ...submitted };
    if (req.files?.hero_image?.[0]) settings.hero_image = `/uploads/${req.files.hero_image[0].filename}`;
    if (req.files?.hero_image_ar?.[0]) settings.hero_image_ar = `/uploads/${req.files.hero_image_ar[0].filename}`;
    settings.hero_image_ar = settings.hero_image_ar || settings.hero_image;
    const allowed = Object.keys(defaultPageSettings);
    const sanitized = Object.fromEntries(allowed.map(field => [field, String(settings[field] ?? defaultPageSettings[field])]));
    await pool.query(`INSERT INTO pharmacovigilance_page_settings (id, settings_json) VALUES (1, ?)
      ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json)`, [JSON.stringify(sanitized)]);
    res.json({ success: true, message: 'Pharmacovigilance page content saved.', settings: sanitized });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to save Pharmacovigilance page content.' }); }
};

exports.submitReport = async (req, res) => {
  try {
    const { reporterName, patientName, contactNumber, email, productName, batchNumber, expirationDate, occupation, sideEffectDescription, otherInfo } = req.body;
    const normalizedExpiration = expirationDate?.trim() || '';
    const parsedExpiration = /^\d{4}-\d{2}-\d{2}$/.test(normalizedExpiration)
      ? new Date(`${normalizedExpiration}T00:00:00.000Z`)
      : null;
    const validExpirationDate = parsedExpiration && !Number.isNaN(parsedExpiration.getTime()) && parsedExpiration.toISOString().slice(0, 10) === normalizedExpiration;
    if (!contactNumber?.trim() || !productName?.trim() || !sideEffectDescription?.trim() || (normalizedExpiration && !validExpirationDate)) {
      return res.status(400).json({ success: false, message: 'Please complete all required report fields.' });
    }
    const pool = getPool();
    await ensureReportFormColumns(pool);
    const [result] = await pool.query(
      `INSERT INTO pharmacovigilance_reports (reporter_name, patient_name, contact_number, email, product_name, batch_number, expiration_date, occupation, side_effect_description, other_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reporterName?.trim() || null, patientName?.trim() || null, contactNumber.trim(), email?.trim() || null, productName.trim(), batchNumber?.trim() || null, normalizedExpiration || null, occupation || null, sideEffectDescription.trim(), otherInfo?.trim() || null]
    );
    res.status(201).json({ success: true, message: 'Safety report submitted successfully.', reportId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit safety report.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status = 'All', search = '' } = req.query;
    const pool = getPool();
    await ensureReportFormColumns(pool);
    let query = 'SELECT * FROM pharmacovigilance_reports WHERE 1=1';
    const params = [];
    if (status !== 'All') { query += ' AND status = ?'; params.push(status); }
    if (search) { query += ' AND (reporter_name LIKE ? OR patient_name LIKE ? OR email LIKE ? OR product_name LIKE ? OR batch_number LIKE ? OR side_effect_description LIKE ?)'; const term = `%${search}%`; params.push(term, term, term, term, term, term); }
    query += ' ORDER BY created_at DESC';
    const [reports] = await pool.query(query, params);
    res.json({ success: true, count: reports.length, reports });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch safety reports.' }); }
};

exports.updateReport = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const [result] = await getPool().query('UPDATE pharmacovigilance_reports SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?', [status ?? null, notes ?? null, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, message: 'Safety report updated.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to update safety report.' }); }
};

exports.deleteReport = async (req, res) => {
  try {
    const [result] = await getPool().query('DELETE FROM pharmacovigilance_reports WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Safety report not found.' });
    res.json({ success: true, message: 'Safety report deleted.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to delete safety report.' }); }
};
