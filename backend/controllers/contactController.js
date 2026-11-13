const { getPool } = require('../config/db');

const OFFICIAL_OFFICE_MAP_URL = 'https://www.google.com/maps?cid=13164615357253241384';
const LEGACY_OFFICE_MAP_URL = 'https://maps.google.com/?q=Building+No+4180,+Unit+6708,+Northern+Ring+Branch+Road,+Al+Wadi,+Riyadh+13313,+Saudi+Arabia';
const PREVIOUS_SHORT_OFFICE_MAP_URL = 'https://maps.app.goo.gl/3CUKTyr1EzHr7JSG7';

const defaultPageSettings = {
  hero_eyebrow:'Connect with VIC',hero_eyebrow_ar:'تواصل مع VIC',hero_title:"Let's Connect.",hero_title_ar:'لنتواصل.',hero_title_accent:"Let's Create Impact.",hero_title_accent_ar:'لنصنع أثراً معاً.',
  hero_description:"We are always open to conversations, collaborations, and opportunities to advance global health together. Reach out to our team — we'd love to hear from you.",hero_description_ar:'نحن نرحب دائمًا بالحوار والتعاون والفرص المشتركة للنهوض بالصحة العالمية معًا. تواصل مع فريقنا - يسعدنا أن نسمع منك.',hero_email:'admin@vaccine.com.sa',hero_phone:'+966 11 491 7984',hero_phone_ar:'+966 11 491 7984',hero_image:'banner_for_all2.webp',hero_image_ar:'banner_for_all2.webp',
  form_eyebrow:'SEND US A MESSAGE',form_eyebrow_ar:'أرسل لنا رسالة',form_title:'How can we help you?',form_title_ar:'كيف يمكننا مساعدتك؟',success_title:'Message Sent Successfully',success_title_ar:'تم إرسال الرسالة بنجاح',success_text:'Our team has received your message and will respond within one business day.',success_text_ar:'لقد استلم فريقنا رسالتك وسنرد عليك خلال يوم عمل واحد.',security_note:'Your information is secure and will only be used to respond to your inquiry.',security_note_ar:'معلوماتك آمنة ولن تُستخدم إلا للرد على استفسارك.',
  locations_eyebrow:'OUR LOCATIONS',locations_eyebrow_ar:'مواقعنا',office_eyebrow:'VISIT VIC',office_eyebrow_ar:'قم بزيارة VIC',office_title:'Vaccine Industrial Company (Head Office)',office_title_ar:'شركة اللقاحات الصناعية (المكتب الرئيسي)',office_address:'Building No 4180, Unit 6708, Northern Ring Branch Road, Al Wadi, Riyadh 13313, Saudi Arabia',office_address_ar:'مبنى رقم 4180، وحدة 6708، طريق الدائري الشمالي الفرعي، حي الوادي، الرياض 13313، المملكة العربية السعودية',office_map_url:OFFICIAL_OFFICE_MAP_URL,office_phone:'+966 11 491 7984',office_image:'layered-glass-vaccine-building-card.png',
  facility_eyebrow:'SUDAIR CITY, RIYADH REGION',facility_eyebrow_ar:'مدينة سدير، منطقة الرياض',facility_title:'VIC (Manufacturing Facility)',facility_title_ar:'منشأة VIC للتصنيع',facility_address:'Location: Sudair City for Industry and Businesses\nCity: Sudair – Riyadh Region\nCountry: Kingdom of Saudi Arabia',facility_address_ar:'الموقع: مدينة سدير للصناعة والأعمال\nالمدينة: سدير – منطقة الرياض\nالمملكة العربية السعودية',facility_map_url:'https://www.google.com/maps/search/?api=1&query=Sudair+City+for+Industry+and+Businesses',facility_image:'layered-glass-vaccine-building-card.png',facility_directions_text:'View Location',facility_directions_text_ar:'عرض رابط الموقع',
  inquiries_title:'General Inquiries',inquiries_title_ar:'الاستفسارات العامة',inquiries_email:'admin@vaccine.com.sa',inquiries_note:'Corporate Communications Desk',inquiries_note_ar:'مكتب الاتصالات المؤسسية',directions_text:'Open directions',directions_text_ar:'افتح الاتجاهات'
};

async function ensureContactPageSettingsTable(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS contact_page_settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    settings_json LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

exports.getPageSettings = async (_req, res) => {
  try {
    const pool = getPool(); await ensureContactPageSettingsTable(pool);
    const [rows] = await pool.query('SELECT settings_json FROM contact_page_settings WHERE id = 1');
    let stored = {};
    try { if (rows[0]?.settings_json) stored = JSON.parse(rows[0].settings_json); } catch (_) {}
    const settings = { ...defaultPageSettings, ...stored };
    settings.hero_image_ar = stored.hero_image_ar || settings.hero_image;
    if (/^(location link:\s*)?google maps?$/i.test(String(settings.facility_directions_text || '').trim()) || /^view location(?: link)?$/i.test(String(settings.facility_directions_text || '').trim())) {
      settings.facility_directions_text = 'View Location';
    }
    if (/^(رابط الموقع:\s*)?google maps?$/i.test(String(settings.facility_directions_text_ar || '').trim()) || /^عرض الموقع$/.test(String(settings.facility_directions_text_ar || '').trim())) {
      settings.facility_directions_text_ar = 'عرض رابط الموقع';
    }
    if (!settings.office_map_url || [LEGACY_OFFICE_MAP_URL, PREVIOUS_SHORT_OFFICE_MAP_URL].includes(settings.office_map_url)) {
      settings.office_map_url = OFFICIAL_OFFICE_MAP_URL;
    }
    res.json({ success: true, settings });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to load Contact page content.' }); }
};

exports.updatePageSettings = async (req, res) => {
  try {
    const pool = getPool(); await ensureContactPageSettingsTable(pool);
    const [rows] = await pool.query('SELECT settings_json FROM contact_page_settings WHERE id = 1');
    let stored = {};
    try { if (rows[0]?.settings_json) stored = JSON.parse(rows[0].settings_json); } catch (_) {}
    let submitted = {};
    try { if (req.body.settings_json) submitted = JSON.parse(req.body.settings_json); }
    catch (_) { return res.status(400).json({ success: false, message: 'Invalid Contact page content.' }); }
    const settings = { ...defaultPageSettings, ...stored, ...submitted };
    if (req.files?.hero_image?.[0]) settings.hero_image = `/uploads/${req.files.hero_image[0].filename}`;
    if (req.files?.hero_image_ar?.[0]) settings.hero_image_ar = `/uploads/${req.files.hero_image_ar[0].filename}`;
    if (req.files?.office_image?.[0]) settings.office_image = `/uploads/${req.files.office_image[0].filename}`;
    if (req.files?.facility_image?.[0]) settings.facility_image = `/uploads/${req.files.facility_image[0].filename}`;
    settings.hero_image_ar = settings.hero_image_ar || settings.hero_image;
    const sanitized = Object.fromEntries(Object.keys(defaultPageSettings).map(key => [key, String(settings[key] ?? defaultPageSettings[key])]));
    await pool.query(`INSERT INTO contact_page_settings (id, settings_json) VALUES (1, ?) ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json)`, [JSON.stringify(sanitized)]);
    res.json({ success: true, settings: sanitized, message: 'Contact page content saved.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to save Contact page content.' }); }
};

// POST /api/contacts (Public API - Submit contact message from main page)
exports.submitContactInquiry = async (req, res) => {
  try {
    const { fullName, email, company, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, valid email, and your message.'
      });
    }

    const pool = getPool();
    const [result] = await pool.query(`
      INSERT INTO contact_inquiries (full_name, email, company, phone, subject, message, status, is_starred)
      VALUES (?, ?, ?, ?, ?, ?, 'New', 0)
    `, [
      fullName.trim(),
      email.trim().toLowerCase(),
      company || '',
      phone || '',
      subject || 'General Inquiry',
      message.trim()
    ]);

    res.status(201).json({
      success: true,
      message: 'Thank you. Your message has been received and routed to our team.',
      inquiryId: result.insertId
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry', error: error.message });
  }
};

// GET /api/contacts (Admin - List inquiries with filtering & pagination)
exports.getAllInquiries = async (req, res) => {
  try {
    const pool = getPool();
    const { status, starred, search } = req.query;

    let query = 'SELECT * FROM contact_inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (starred === 'true' || starred === '1') {
      query += ' AND is_starred = 1';
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ? OR company LIKE ? OR subject LIKE ? OR message LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const [inquiries] = await pool.query(query, params);
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries', error: error.message });
  }
};

// GET /api/contacts/:id
exports.getInquiryById = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM contact_inquiries WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, inquiry: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inquiry', error: error.message });
  }
};

// PUT /api/contacts/:id (Update status / toggle star / add notes)
exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_starred, notes } = req.body;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM contact_inquiries WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const current = rows[0];

    await pool.query(`
      UPDATE contact_inquiries 
      SET status = ?, is_starred = ?, notes = ?
      WHERE id = ?
    `, [
      status !== undefined ? status : current.status,
      is_starred !== undefined ? (is_starred ? 1 : 0) : current.is_starred,
      notes !== undefined ? notes : current.notes,
      id
    ]);

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry: {
        id: parseInt(id),
        status: status !== undefined ? status : current.status,
        is_starred: is_starred !== undefined ? (is_starred ? 1 : 0) : current.is_starred,
        notes: notes !== undefined ? notes : current.notes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update inquiry', error: error.message });
  }
};

// DELETE /api/contacts/:id
exports.deleteInquiry = async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM contact_inquiries WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete inquiry', error: error.message });
  }
};
