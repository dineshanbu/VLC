const { getPool, seedPartnersData, defaultPartnersList, defaultPartnershipSections } = require('../config/db');

// ==========================================
// 1. PAGE SETTINGS (HERO BANNER & BADGES)
// ==========================================

exports.getPageSettings = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM partners_page_settings ORDER BY id ASC LIMIT 1');
    if (rows.length > 0) {
      let stats = [];
      try {
        stats = typeof rows[0].stats_json === 'string' ? JSON.parse(rows[0].stats_json) : (rows[0].stats_json || []);
      } catch (e) {
        stats = [];
      }
      return res.json({
        success: true,
        settings: {
          ...rows[0],
          hero_image_ar: rows[0].hero_image_ar || rows[0].hero_image || 'partner_right.webp',
          stats
        }
      });
    }

    // Default fallback
    res.json({
      success: true,
      settings: {
        id: 1,
        hero_badge: 'GLOBAL PARTNERSHIPS',
        hero_badge_ar: 'شراكات عالمية',
        hero_title: 'Stronger Together.',
        hero_title_ar: 'معاً أقوى.',
        hero_title_line2: 'Building a Better ',
        hero_title_line2_ar: 'نبني مستقبلاً أفضل ',
        hero_accent: 'Future.',
        hero_accent_ar: 'للجميع.',
        hero_description: 'Collaborating with global leaders to expand access to innovative vaccines and drive a healthier, more resilient tomorrow.',
        hero_description_ar: 'نتعاون مع مؤسسات عالمية رائدة لتوفير لقاحات مبتكرة وتقنيات متقدمة وخبرات علمية للمنطقة وخارجها.',
        hero_image: 'partner_right.webp',
        hero_image_ar: 'partner_right.webp',
        cta_text: 'Partner With Us',
        stats: [
          { label: 'Global Strategic Alliances', value: '10+' },
          { label: 'Ecosystem Pillars', value: '5' },
          { label: 'Capital Commitment', value: 'SAR 500M+' },
          { label: 'Vision 2030 Biotech Impact', value: '100%' }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePageSettings = async (req, res, next) => {
  try {
    const pool = getPool();
    const {
      hero_badge,
      hero_badge_ar,
      hero_title,
      hero_title_ar,
      hero_title_line2,
      hero_title_line2_ar,
      hero_accent,
      hero_accent_ar,
      hero_description,
      hero_description_ar,
      cta_text,
      stats_json
    } = req.body;

    const englishFile = req.files?.hero_image?.[0] || (req.file?.fieldname === 'hero_image' ? req.file : null);
    const arabicFile = req.files?.hero_image_ar?.[0] || (req.file?.fieldname === 'hero_image_ar' ? req.file : null);
    const hero_image = englishFile ? `/uploads/${englishFile.filename}` : req.body.hero_image;
    const hero_image_ar = arabicFile ? `/uploads/${arabicFile.filename}` : (req.body.hero_image_ar || hero_image);

    const formattedStats = typeof stats_json === 'object' ? JSON.stringify(stats_json) : stats_json;

    await pool.query(`
      INSERT INTO partners_page_settings 
      (id, hero_badge, hero_badge_ar, hero_title, hero_title_ar, hero_title_line2, hero_title_line2_ar, hero_accent, hero_accent_ar, hero_description, hero_description_ar, hero_image, hero_image_ar, cta_text, stats_json)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        hero_badge = VALUES(hero_badge),
        hero_badge_ar = VALUES(hero_badge_ar),
        hero_title = VALUES(hero_title),
        hero_title_ar = VALUES(hero_title_ar),
        hero_title_line2 = VALUES(hero_title_line2),
        hero_title_line2_ar = VALUES(hero_title_line2_ar),
        hero_accent = VALUES(hero_accent),
        hero_accent_ar = VALUES(hero_accent_ar),
        hero_description = VALUES(hero_description),
        hero_description_ar = VALUES(hero_description_ar),
        hero_image = COALESCE(VALUES(hero_image), hero_image),
        hero_image_ar = COALESCE(VALUES(hero_image_ar), hero_image_ar),
        cta_text = VALUES(cta_text),
        stats_json = VALUES(stats_json)
    `, [
      hero_badge || 'OUR PARTNERS',
      hero_badge_ar || 'شركاؤنا',
      hero_title || 'Stronger Together.',
      hero_title_ar || 'معاً أقوى.',
      hero_title_line2 || 'Building Better Futures.',
      hero_title_line2_ar || 'نبني مستقبلاً أفضل ',
      hero_accent || 'Futures.',
      hero_accent_ar || 'للجميع.',
      hero_description || '',
      hero_description_ar || '',
      hero_image || 'partner_banner.jpg',
      hero_image_ar || hero_image || 'partner_banner.jpg',
      cta_text || 'Partner With Us',
      formattedStats || null
    ]);

    const [rows] = await pool.query('SELECT * FROM partners_page_settings WHERE id = 1');
    res.json({
      success: true,
      message: 'Partners page settings updated successfully.',
      settings: { ...rows[0], hero_image_ar: rows[0].hero_image_ar || rows[0].hero_image }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. STRATEGIC PARTNERS CRUD
// ==========================================

exports.getAllPartners = async (req, res, next) => {
  try {
    const pool = getPool();
    const { tier, category, status, search } = req.query;

    let query = 'SELECT * FROM partners WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (tier && tier !== 'All') {
      query += ' AND tier = ?';
      params.push(tier);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY order_index ASC, id ASC';

    const [rows] = await pool.query(query, params);

    // Get distinct categories and tiers for filtering
    const [categories] = await pool.query('SELECT DISTINCT category FROM partners WHERE category IS NOT NULL ORDER BY category ASC');
    const [tiers] = await pool.query('SELECT DISTINCT tier FROM partners WHERE tier IS NOT NULL ORDER BY tier ASC');

    res.json({
      success: true,
      count: rows.length,
      partners: rows,
      categories: categories.map(c => c.category),
      tiers: tiers.map(t => t.tier)
    });
  } catch (error) {
    next(error);
  }
};

exports.getPartnerById = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }
    res.json({ success: true, partner: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createPartner = async (req, res, next) => {
  try {
    const pool = getPool();
    const { code, name, name_ar, category, category_ar, tier, website, description, description_ar, featured, order_index, status } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Partner name and category are required.' });
    }

    let logo = req.body.logo || '';
    if (req.file) {
      logo = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(`
      INSERT INTO partners (code, name, name_ar, category, category_ar, tier, logo, website, description, description_ar, featured, order_index, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code || name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30),
      name,
      name_ar?.trim() || null,
      category,
      category_ar?.trim() || null,
      tier || 'Strategic Alliance',
      logo,
      website || '',
      description || '',
      description_ar?.trim() || null,
      featured !== undefined ? (featured ? 1 : 0) : 1,
      parseInt(order_index) || 0,
      status || 'Active'
    ]);

    const [newPartner] = await pool.query('SELECT * FROM partners WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Partner created successfully.',
      partner: newPartner[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePartner = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;
    const { code, name, name_ar, category, category_ar, tier, website, description, description_ar, featured, order_index, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM partners WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    let logo = existing[0].logo;
    if (req.file) {
      logo = `/uploads/${req.file.filename}`;
    } else if (req.body.logo) {
      logo = req.body.logo;
    }

    await pool.query(`
      UPDATE partners SET
        code = ?,
        name = ?,
        name_ar = ?,
        category = ?,
        category_ar = ?,
        tier = ?,
        logo = ?,
        website = ?,
        description = ?,
        description_ar = ?,
        featured = ?,
        order_index = ?,
        status = ?
      WHERE id = ?
    `, [
      code !== undefined ? code : existing[0].code,
      name !== undefined ? name : existing[0].name,
      name_ar !== undefined ? (name_ar.trim() || null) : existing[0].name_ar,
      category !== undefined ? category : existing[0].category,
      category_ar !== undefined ? (category_ar.trim() || null) : existing[0].category_ar,
      tier !== undefined ? tier : existing[0].tier,
      logo,
      website !== undefined ? website : existing[0].website,
      description !== undefined ? description : existing[0].description,
      description_ar !== undefined ? (description_ar.trim() || null) : existing[0].description_ar,
      featured !== undefined ? (featured ? 1 : 0) : existing[0].featured,
      order_index !== undefined ? parseInt(order_index) : existing[0].order_index,
      status !== undefined ? status : existing[0].status,
      id
    ]);

    const [updated] = await pool.query('SELECT * FROM partners WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Partner updated successfully.',
      partner: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePartner = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;

    const [existing] = await pool.query('SELECT id FROM partners WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    await pool.query('DELETE FROM partners WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Partner deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.reorderPartners = async (req, res, next) => {
  try {
    const pool = getPool();
    const { items } = req.body; // Array of { id, order_index }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: items array required.' });
    }

    for (const item of items) {
      if (item.id && item.order_index !== undefined) {
        await pool.query('UPDATE partners SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
      }
    }

    res.json({ success: true, message: 'Partners order updated.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. DYNAMIC PARTNERSHIP SECTIONS CRUD
// ==========================================

exports.getSections = async (req, res, next) => {
  try {
    const pool = getPool();
    const { status, section_key } = req.query;

    let query = 'SELECT * FROM partnership_sections WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (section_key) {
      query += ' AND section_key = ?';
      params.push(section_key);
    }

    query += ' ORDER BY order_index ASC, id ASC';

    const [rows] = await pool.query(query, params);

    // Format JSON fields
    const parsedSections = rows.map(s => {
      let bullet_points = [];
      try {
        bullet_points = typeof s.bullet_points === 'string' ? JSON.parse(s.bullet_points) : (s.bullet_points || []);
      } catch (e) {
        bullet_points = [];
      }
      return {
        ...s,
        bullet_points
      };
    });

    res.json({
      success: true,
      count: parsedSections.length,
      sections: parsedSections
    });
  } catch (error) {
    next(error);
  }
};

exports.createSection = async (req, res, next) => {
  try {
    const pool = getPool();
    const {
      section_key,
      badge,
      title,
      subtitle,
      content,
      bullet_points,
      icon,
      cta_text,
      cta_url,
      layout_type,
      order_index,
      status
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Section title is required.' });
    }

    let image_url = req.body.image_url || '';
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    let formattedBullets = null;
    if (bullet_points) {
      formattedBullets = typeof bullet_points === 'object' ? JSON.stringify(bullet_points) : bullet_points;
    }

    const [result] = await pool.query(`
      INSERT INTO partnership_sections 
      (section_key, badge, title, subtitle, content, bullet_points, image_url, icon, cta_text, cta_url, layout_type, order_index, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      section_key || 'custom_section',
      badge || '',
      title,
      subtitle || '',
      content || '',
      formattedBullets,
      image_url,
      icon || '',
      cta_text || '',
      cta_url || '',
      layout_type || 'card',
      parseInt(order_index) || 0,
      status || 'Active'
    ]);

    const [newSection] = await pool.query('SELECT * FROM partnership_sections WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Partnership section created successfully.',
      section: newSection[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;
    const {
      section_key,
      badge,
      title,
      subtitle,
      content,
      bullet_points,
      icon,
      cta_text,
      cta_url,
      layout_type,
      order_index,
      status
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM partnership_sections WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    let image_url = existing[0].image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url !== undefined) {
      image_url = req.body.image_url;
    }

    let formattedBullets = existing[0].bullet_points;
    if (bullet_points !== undefined) {
      formattedBullets = typeof bullet_points === 'object' ? JSON.stringify(bullet_points) : bullet_points;
    }

    await pool.query(`
      UPDATE partnership_sections SET
        section_key = ?,
        badge = ?,
        title = ?,
        subtitle = ?,
        content = ?,
        bullet_points = ?,
        image_url = ?,
        icon = ?,
        cta_text = ?,
        cta_url = ?,
        layout_type = ?,
        order_index = ?,
        status = ?
      WHERE id = ?
    `, [
      section_key !== undefined ? section_key : existing[0].section_key,
      badge !== undefined ? badge : existing[0].badge,
      title !== undefined ? title : existing[0].title,
      subtitle !== undefined ? subtitle : existing[0].subtitle,
      content !== undefined ? content : existing[0].content,
      formattedBullets,
      image_url,
      icon !== undefined ? icon : existing[0].icon,
      cta_text !== undefined ? cta_text : existing[0].cta_text,
      cta_url !== undefined ? cta_url : existing[0].cta_url,
      layout_type !== undefined ? layout_type : existing[0].layout_type,
      order_index !== undefined ? parseInt(order_index) : existing[0].order_index,
      status !== undefined ? status : existing[0].status,
      id
    ]);

    const [updated] = await pool.query('SELECT * FROM partnership_sections WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Partnership section updated successfully.',
      section: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;

    const [existing] = await pool.query('SELECT id FROM partnership_sections WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    await pool.query('DELETE FROM partnership_sections WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Partnership section deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. PARTNERSHIP INQUIRIES
// ==========================================

exports.submitInquiry = async (req, res, next) => {
  try {
    const pool = getPool();
    const { full_name, organization, email, phone, category, message } = req.body;

    if (!full_name || !organization || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, organization, and work email.'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO partnership_inquiries (full_name, organization, email, phone, category, message, status)
      VALUES (?, ?, ?, ?, ?, ?, 'New')
    `, [
      full_name,
      organization,
      email,
      phone || '',
      category || 'Technology Transfer',
      message || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Partnership inquiry submitted successfully.',
      inquiry_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.getInquiries = async (req, res, next) => {
  try {
    const pool = getPool();
    const { status, category, search } = req.query;

    let query = 'SELECT * FROM partnership_inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR organization LIKE ? OR email LIKE ? OR message LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      inquiries: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;
    const { status, notes } = req.body;

    const [existing] = await pool.query('SELECT * FROM partnership_inquiries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    await pool.query(`
      UPDATE partnership_inquiries SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [status, notes, id]);

    res.json({
      success: true,
      message: 'Inquiry status updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteInquiry = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;

    await pool.query('DELETE FROM partnership_inquiries WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Inquiry deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. RESTORE / SEED OFFICIAL DEFAULTS
// ==========================================

exports.seedPartners = async (req, res, next) => {
  try {
    const pool = getPool();
    await seedPartnersData(pool, true);
    res.json({
      success: true,
      message: 'Partners, page settings, and dynamic sections reset to official defaults successfully.'
    });
  } catch (error) {
    next(error);
  }
};
