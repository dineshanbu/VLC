const { getPool, seedProductsData, defaultProductsList, defaultProductsPageSettings } = require('../config/db');

// Helper to safely parse JSON or return fallback
function safeParseJson(data, fallback = null) {
  if (data === null || data === undefined) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
}

// Helper to format product row from DB
function formatProduct(row) {
  if (!row) return null;
  return {
    ...row,
    features: safeParseJson(row.features, []),
    features_ar: safeParseJson(row.features_ar, []),
    specs: safeParseJson(row.specs, []),
    specs_ar: safeParseJson(row.specs_ar, []),
    storage: safeParseJson(row.storage, []),
    storage_ar: safeParseJson(row.storage_ar, []),
    indication_items: safeParseJson(row.indication_items, []),
    indication_items_ar: safeParseJson(row.indication_items_ar, []),
    gallery: safeParseJson(row.gallery, []),
    resources: safeParseJson(row.resources, []),
    resources_ar: safeParseJson(row.resources_ar, [])
  };
}

// Helper to extract an uploaded file by field name from req.file or req.files
function getUploadedFile(req, fieldName) {
  if (req.file && (req.file.fieldname === fieldName || !fieldName)) {
    return req.file;
  }
  if (Array.isArray(req.files)) {
    return req.files.find(f => f.fieldname === fieldName) || null;
  }
  if (req.files && req.files[fieldName]) {
    return req.files[fieldName][0] || null;
  }
  return null;
}

// ==========================================
// 1. PRODUCTS CRUD
// ==========================================

exports.getAllProducts = async (req, res, next) => {
  try {
    const pool = getPool();
    const { category, status, search } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All' && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status && status !== 'All' && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR name_ar LIKE ? OR subtitle LIKE ? OR subtitle_ar LIKE ? OR product_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY order_index ASC, id ASC';

    const [rows] = await pool.query(query, params);
    const products = rows.map(formatProduct);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const pool = getPool();
    const idOrCode = req.params.id;

    const isNumeric = /^\d+$/.test(idOrCode);
    const query = isNumeric
      ? 'SELECT * FROM products WHERE id = ?'
      : 'SELECT * FROM products WHERE product_code = ?';

    const [rows] = await pool.query(query, [idOrCode]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      product: formatProduct(rows[0])
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const pool = getPool();
    const body = req.body;

    const name = body.name;
    const subtitle = body.subtitle || '';
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product Name is required.' });
    }

    // Auto-generate code if missing
    let product_code = body.product_code;
    if (!product_code) {
      product_code = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
    }

    // Check unique code
    const [existing] = await pool.query('SELECT id FROM products WHERE product_code = ?', [product_code]);
    if (existing.length > 0) {
      product_code = `${product_code}-${Date.now().toString().slice(-4)}`;
    }

    const imageFile = getUploadedFile(req, 'image') || req.file;
    const featuredFile = getUploadedFile(req, 'featured_image');

    let image = body.image || 'flucelvax_featured.png';
    let featured_image = body.featured_image || image;

    if (imageFile) {
      image = `/uploads/${imageFile.filename}`;
      if (!featuredFile && (!body.featured_image || body.sync_featured === 'true' || body.sync_featured === true || body.featured_image === body.image)) {
        featured_image = image;
      }
    }

    if (featuredFile) {
      featured_image = `/uploads/${featuredFile.filename}`;
    }

    let gallery = safeParseJson(body.gallery, []);
    if (!Array.isArray(gallery)) gallery = [];
    if (imageFile) {
      if (gallery.length === 0 || body.sync_gallery === 'true' || body.sync_featured === 'true') {
        gallery = [image, ...gallery.filter(g => g !== 'flucelvax_featured.png' && g !== image)];
      }
    }
    if (Array.isArray(req.files)) {
      req.files.filter(f => f.fieldname === 'gallery_files' || f.fieldname === 'gallery').forEach(f => {
        const url = `/uploads/${f.filename}`;
        if (!gallery.includes(url)) gallery.push(url);
      });
    }
    if (featured_image && !gallery.includes(featured_image)) {
      gallery = [featured_image, ...gallery];
    }

    const [result] = await pool.query(`
      INSERT INTO products (
        product_code, category, name, name_ar, subtitle, subtitle_ar,
        image, featured_image, description, description_ar,
        features, features_ar, specs, specs_ar, storage, storage_ar,
        indication_desc, indication_desc_ar, indication_target, indication_target_ar,
        indication_route, indication_route_ar, indication_items, indication_items_ar,
        gallery, resources, resources_ar, order_index, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      product_code,
      body.category || 'our-products',
      name,
      body.name_ar || name,
      subtitle,
      body.subtitle_ar || subtitle,
      image,
      featured_image,
      body.description || '',
      body.description_ar || '',
      typeof body.features === 'object' ? JSON.stringify(body.features) : (body.features || '[]'),
      typeof body.features_ar === 'object' ? JSON.stringify(body.features_ar) : (body.features_ar || '[]'),
      typeof body.specs === 'object' ? JSON.stringify(body.specs) : (body.specs || '[]'),
      typeof body.specs_ar === 'object' ? JSON.stringify(body.specs_ar) : (body.specs_ar || '[]'),
      typeof body.storage === 'object' ? JSON.stringify(body.storage) : (body.storage || '[]'),
      typeof body.storage_ar === 'object' ? JSON.stringify(body.storage_ar) : (body.storage_ar || '[]'),
      body.indication_desc || null,
      body.indication_desc_ar || null,
      body.indication_target || null,
      body.indication_target_ar || null,
      body.indication_route || null,
      body.indication_route_ar || null,
      typeof body.indication_items === 'object' ? JSON.stringify(body.indication_items) : (body.indication_items || '[]'),
      typeof body.indication_items_ar === 'object' ? JSON.stringify(body.indication_items_ar) : (body.indication_items_ar || '[]'),
      JSON.stringify(gallery),
      typeof body.resources === 'object' ? JSON.stringify(body.resources) : (body.resources || '[]'),
      typeof body.resources_ar === 'object' ? JSON.stringify(body.resources_ar) : (body.resources_ar || '[]'),
      parseInt(body.order_index) || 0,
      body.status || 'Active'
    ]);

    const [newRow] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: formatProduct(newRow[0])
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;
    const body = req.body;

    const isNumeric = /^\d+$/.test(id);
    let [existing] = await pool.query(
      isNumeric ? 'SELECT * FROM products WHERE id = ?' : 'SELECT * FROM products WHERE product_code = ?',
      [id]
    );
    if (existing.length === 0 && body.product_code) {
      const [byCode] = await pool.query('SELECT * FROM products WHERE product_code = ?', [body.product_code]);
      existing = byCode;
    }
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const current = existing[0];
    const targetId = current.id;

    const imageFile = getUploadedFile(req, 'image') || req.file;
    const featuredFile = getUploadedFile(req, 'featured_image') || getUploadedFile(req, 'cover_image');

    let image = current.image;
    let featured_image = current.featured_image;

    if (imageFile) {
      image = `/uploads/${imageFile.filename}`;
      // Sync featured_image if requested, or if featured was not explicitly modified differently from old image
      const isExplicitCustomFeatured = body.featured_image && body.featured_image !== current.image && body.featured_image !== current.featured_image;
      if (!featuredFile && (body.sync_featured === 'true' || body.sync_featured === true || !isExplicitCustomFeatured)) {
        featured_image = image;
      }
    } else if (body.image !== undefined && typeof body.image === 'string' && body.image.trim()) {
      image = body.image.trim();
    }

    if (featuredFile) {
      featured_image = `/uploads/${featuredFile.filename}`;
    } else if (body.featured_image !== undefined && !imageFile) {
      featured_image = body.featured_image.trim() || image;
    }

    // Gallery update
    let gallery = body.gallery !== undefined ? safeParseJson(body.gallery, current.gallery) : safeParseJson(current.gallery, []);
    if (typeof gallery === 'string') {
      gallery = safeParseJson(gallery, [image]);
    }
    if (!Array.isArray(gallery)) {
      gallery = [image];
    }
    if (imageFile) {
      const oldImg = current.image;
      gallery = gallery.map(g => (g === oldImg ? image : g));
      if (!gallery.includes(image)) {
        gallery = [image, ...gallery.filter(g => g !== 'flucelvax_featured.png')];
      }
    }

    // Process any uploaded gallery files
    if (Array.isArray(req.files)) {
      req.files.filter(f => f.fieldname === 'gallery_files' || f.fieldname === 'gallery').forEach(f => {
        const url = `/uploads/${f.filename}`;
        if (!gallery.includes(url)) gallery.push(url);
      });
    }

    if (featured_image && !gallery.includes(featured_image)) {
      gallery = [featured_image, ...gallery];
    }

    const stringifyField = (val, fallback) => {
      if (val === undefined) return fallback;
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    };

    await pool.query(`
      UPDATE products SET
        product_code = ?,
        category = ?,
        name = ?,
        name_ar = ?,
        subtitle = ?,
        subtitle_ar = ?,
        image = ?,
        featured_image = ?,
        description = ?,
        description_ar = ?,
        features = ?,
        features_ar = ?,
        specs = ?,
        specs_ar = ?,
        storage = ?,
        storage_ar = ?,
        indication_desc = ?,
        indication_desc_ar = ?,
        indication_target = ?,
        indication_target_ar = ?,
        indication_route = ?,
        indication_route_ar = ?,
        indication_items = ?,
        indication_items_ar = ?,
        gallery = ?,
        resources = ?,
        resources_ar = ?,
        order_index = ?,
        status = ?
      WHERE id = ?
    `, [
      body.product_code !== undefined ? body.product_code : current.product_code,
      body.category !== undefined ? body.category : current.category,
      body.name !== undefined ? body.name : current.name,
      body.name_ar !== undefined ? body.name_ar : current.name_ar,
      body.subtitle !== undefined ? body.subtitle : current.subtitle,
      body.subtitle_ar !== undefined ? body.subtitle_ar : current.subtitle_ar,
      image,
      featured_image,
      body.description !== undefined ? body.description : current.description,
      body.description_ar !== undefined ? body.description_ar : current.description_ar,
      stringifyField(body.features, current.features),
      stringifyField(body.features_ar, current.features_ar),
      stringifyField(body.specs, current.specs),
      stringifyField(body.specs_ar, current.specs_ar),
      stringifyField(body.storage, current.storage),
      stringifyField(body.storage_ar, current.storage_ar),
      body.indication_desc !== undefined ? body.indication_desc : current.indication_desc,
      body.indication_desc_ar !== undefined ? body.indication_desc_ar : current.indication_desc_ar,
      body.indication_target !== undefined ? body.indication_target : current.indication_target,
      body.indication_target_ar !== undefined ? body.indication_target_ar : current.indication_target_ar,
      body.indication_route !== undefined ? body.indication_route : current.indication_route,
      body.indication_route_ar !== undefined ? body.indication_route_ar : current.indication_route_ar,
      stringifyField(body.indication_items, current.indication_items),
      stringifyField(body.indication_items_ar, current.indication_items_ar),
      JSON.stringify(gallery),
      stringifyField(body.resources, current.resources),
      stringifyField(body.resources_ar, current.resources_ar),
      body.order_index !== undefined ? parseInt(body.order_index) : current.order_index,
      body.status !== undefined ? body.status : current.status,
      targetId
    ]);

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [targetId]);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: formatProduct(updated[0])
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const pool = getPool();
    const id = req.params.id;

    const isNumeric = /^\d+$/.test(id);
    const [existing] = await pool.query(
      isNumeric ? 'SELECT id FROM products WHERE id = ?' : 'SELECT id FROM products WHERE product_code = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [existing[0].id]);

    res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.reorderProducts = async (req, res, next) => {
  try {
    const pool = getPool();
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: items array required.' });
    }

    for (const item of items) {
      if (item.id && item.order_index !== undefined) {
        await pool.query('UPDATE products SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
      }
    }

    res.json({ success: true, message: 'Products order updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. PAGE SETTINGS & HERO / CTA CONFIGURATION
// ==========================================

exports.getPageSettings = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM products_page_settings LIMIT 1');

    let settings = rows.length > 0 ? rows[0] : defaultProductsPageSettings;

    const page_resources = safeParseJson(settings.page_resources, defaultProductsPageSettings.page_resources);

    res.json({
      success: true,
      settings: {
        ...settings,
        page_resources
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePageSettings = async (req, res, next) => {
  try {
    const pool = getPool();
    const body = req.body;

    let hero_image = body.hero_image;
    if (req.file) {
      hero_image = `/uploads/${req.file.filename}`;
    }

    let parsedResources = body.page_resources;
    if (typeof body.page_resources === 'object') {
      parsedResources = JSON.stringify(body.page_resources);
    }

    const [existing] = await pool.query('SELECT id, hero_image FROM products_page_settings LIMIT 1');

    if (existing.length === 0) {
      await pool.query(`
        INSERT INTO products_page_settings (
          hero_badge, hero_badge_ar,
          hero_title_part1, hero_title_part1_ar,
          hero_title_part2, hero_title_part2_ar,
          hero_title_accent, hero_title_accent_ar,
          hero_description, hero_description_ar,
          hero_image,
          section_eyebrow, section_eyebrow_ar,
          cta_badge, cta_badge_ar,
          cta_title_part1, cta_title_part1_ar,
          cta_title_accent, cta_title_accent_ar,
          cta_description, cta_description_ar,
          cta_btn_text, cta_btn_text_ar,
          cta_link, page_resources
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        body.hero_badge || 'OUR PRODUCTS',
        body.hero_badge_ar || 'منتجاتنا',
        body.hero_title_part1 || 'Innovative Vaccines.',
        body.hero_title_part1_ar || 'لقاحات مبتكرة.',
        body.hero_title_part2 || 'Trusted ',
        body.hero_title_part2_ar || 'حماية ',
        body.hero_title_accent || 'Protection.',
        body.hero_title_accent_ar || 'موثوقة.',
        body.hero_description || '',
        body.hero_description_ar || '',
        hero_image || 'home_banner.png',
        body.section_eyebrow || 'OUR PRODUCTS',
        body.section_eyebrow_ar || 'منتجاتنا الدوائية',
        body.cta_badge || 'STRATEGIC COLLABORATION',
        body.cta_badge_ar || 'شراكة استراتيجية',
        body.cta_title_part1 || 'Building a Healthier Future, ',
        body.cta_title_part1_ar || 'نبني مستقبلاً أكثر صحة، ',
        body.cta_title_accent || 'Together.',
        body.cta_title_accent_ar || 'معاً.',
        body.cta_description || '',
        body.cta_description_ar || '',
        body.cta_btn_text || 'Explore Partnerships',
        body.cta_btn_text_ar || 'استكشف شراكاتنا',
        body.cta_link || '/partners',
        parsedResources || null
      ]);
    } else {
      await pool.query(`
        UPDATE products_page_settings SET
          hero_badge = ?,
          hero_badge_ar = ?,
          hero_title_part1 = ?,
          hero_title_part1_ar = ?,
          hero_title_part2 = ?,
          hero_title_part2_ar = ?,
          hero_title_accent = ?,
          hero_title_accent_ar = ?,
          hero_description = ?,
          hero_description_ar = ?,
          hero_image = COALESCE(?, hero_image),
          section_eyebrow = ?,
          section_eyebrow_ar = ?,
          cta_badge = ?,
          cta_badge_ar = ?,
          cta_title_part1 = ?,
          cta_title_part1_ar = ?,
          cta_title_accent = ?,
          cta_title_accent_ar = ?,
          cta_description = ?,
          cta_description_ar = ?,
          cta_btn_text = ?,
          cta_btn_text_ar = ?,
          cta_link = ?,
          page_resources = ?
        WHERE id = ?
      `, [
        body.hero_badge !== undefined ? body.hero_badge : 'OUR PRODUCTS',
        body.hero_badge_ar !== undefined ? body.hero_badge_ar : 'منتجاتنا',
        body.hero_title_part1 !== undefined ? body.hero_title_part1 : 'Innovative Vaccines.',
        body.hero_title_part1_ar !== undefined ? body.hero_title_part1_ar : 'لقاحات مبتكرة.',
        body.hero_title_part2 !== undefined ? body.hero_title_part2 : 'Trusted ',
        body.hero_title_part2_ar !== undefined ? body.hero_title_part2_ar : 'حماية ',
        body.hero_title_accent !== undefined ? body.hero_title_accent : 'Protection.',
        body.hero_title_accent_ar !== undefined ? body.hero_title_accent_ar : 'موثوقة.',
        body.hero_description !== undefined ? body.hero_description : '',
        body.hero_description_ar !== undefined ? body.hero_description_ar : '',
        hero_image || null,
        body.section_eyebrow !== undefined ? body.section_eyebrow : 'OUR PRODUCTS',
        body.section_eyebrow_ar !== undefined ? body.section_eyebrow_ar : 'منتجاتنا الدوائية',
        body.cta_badge !== undefined ? body.cta_badge : 'STRATEGIC COLLABORATION',
        body.cta_badge_ar !== undefined ? body.cta_badge_ar : 'شراكة استراتيجية',
        body.cta_title_part1 !== undefined ? body.cta_title_part1 : 'Building a Healthier Future, ',
        body.cta_title_part1_ar !== undefined ? body.cta_title_part1_ar : 'نبني مستقبلاً أكثر صحة، ',
        body.cta_title_accent !== undefined ? body.cta_title_accent : 'Together.',
        body.cta_title_accent_ar !== undefined ? body.cta_title_accent_ar : 'معاً.',
        body.cta_description !== undefined ? body.cta_description : '',
        body.cta_description_ar !== undefined ? body.cta_description_ar : '',
        body.cta_btn_text !== undefined ? body.cta_btn_text : 'Explore Partnerships',
        body.cta_btn_text_ar !== undefined ? body.cta_btn_text_ar : 'استكشف شراكاتنا',
        body.cta_link !== undefined ? body.cta_link : '/partners',
        parsedResources !== undefined ? parsedResources : null,
        existing[0].id
      ]);
    }

    const [updatedRows] = await pool.query('SELECT * FROM products_page_settings LIMIT 1');
    const updated = updatedRows[0];

    res.json({
      success: true,
      message: 'Products page settings updated successfully.',
      settings: {
        ...updated,
        page_resources: safeParseJson(updated.page_resources, [])
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. RESTORE / SEED OFFICIAL DEFAULTS
// ==========================================

exports.seedProducts = async (req, res, next) => {
  try {
    const pool = getPool();
    await seedProductsData(pool, true);
    res.json({
      success: true,
      message: 'Products catalog and page settings restored to official defaults successfully.'
    });
  } catch (error) {
    next(error);
  }
};
