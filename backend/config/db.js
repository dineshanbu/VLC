const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: true
};

let pool = null;

async function initDatabase() {
  try {
    // 1. First connect without DB specified to create database if not exists
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    const dbName = process.env.DB_NAME || 'vic_db';
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConnection.end();

    // 2. Now create the connection pool with the database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName
    });

    console.log(`[DB] Connected to MySQL Database: ${dbName}`);

    // 3. Execute tables creation
    await createTables(pool);

    // 4. Seed initial default data
    await seedDefaultData(pool);

  } catch (error) {
    console.error('[DB Error] Failed to initialize database:', error.message);
  }
}

async function createTables(db) {
  const schemaFile = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaFile)) {
    const rawSql = fs.readFileSync(schemaFile, 'utf-8');
    
    // Clean SQL: remove line comments
    const cleanSql = rawSql
      .split('\n')
      .map(line => line.trim().startsWith('--') ? '' : line)
      .join('\n');

    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toUpperCase().startsWith('USE') && !s.toUpperCase().startsWith('CREATE DATABASE'));

    for (const stmt of statements) {
      if (stmt.length > 5) {
        await db.query(stmt);
      }
    }

    // Ensure job_postings has the modern fields if table was created previously
    try {
      const [columns] = await db.query("SHOW COLUMNS FROM job_postings");
      const colNames = columns.map(c => c.Field);
      
      if (!colNames.includes('job_code')) {
        await db.query("ALTER TABLE job_postings ADD COLUMN job_code VARCHAR(50) NULL AFTER id");
      }
      if (!colNames.includes('overview')) {
        await db.query("ALTER TABLE job_postings ADD COLUMN overview TEXT NULL AFTER experience");
      }
      if (!colNames.includes('responsibilities')) {
        await db.query("ALTER TABLE job_postings ADD COLUMN responsibilities JSON NULL AFTER requirements");
      }
      if (!colNames.includes('qualifications')) {
        await db.query("ALTER TABLE job_postings ADD COLUMN qualifications JSON NULL AFTER responsibilities");
      }
      // Relax type column to VARCHAR if it was an ENUM
      await db.query("ALTER TABLE job_postings MODIFY COLUMN type VARCHAR(50) DEFAULT 'Full-Time'");
    } catch (migErr) {
      console.log('[DB Migration Notice]', migErr.message);
    }

    // Ensure about_page_content and about_leaders have Arabic localization fields
    try {
      const [contentColsRaw] = await db.query("SHOW COLUMNS FROM about_page_content");
      const contentCols = contentColsRaw.map(c => c.Field);
      if (!contentCols.includes('title_ar')) {
        await db.query("ALTER TABLE about_page_content ADD COLUMN title_ar VARCHAR(255) NULL AFTER title");
      }
      if (!contentCols.includes('subtitle_ar')) {
        await db.query("ALTER TABLE about_page_content ADD COLUMN subtitle_ar VARCHAR(255) NULL AFTER subtitle");
      }
      if (!contentCols.includes('badge_ar')) {
        await db.query("ALTER TABLE about_page_content ADD COLUMN badge_ar VARCHAR(100) NULL AFTER badge");
      }
      if (!contentCols.includes('description_ar')) {
        await db.query("ALTER TABLE about_page_content ADD COLUMN description_ar TEXT NULL AFTER description");
      }
      if (!contentCols.includes('content_json_ar')) {
        await db.query("ALTER TABLE about_page_content ADD COLUMN content_json_ar JSON NULL AFTER content_json");
      }

      const [leaderColsRaw] = await db.query("SHOW COLUMNS FROM about_leaders");
      const leaderCols = leaderColsRaw.map(c => c.Field);
      if (!leaderCols.includes('name_ar')) {
        await db.query("ALTER TABLE about_leaders ADD COLUMN name_ar VARCHAR(150) NULL AFTER name");
      }
      if (!leaderCols.includes('title_ar')) {
        await db.query("ALTER TABLE about_leaders ADD COLUMN title_ar VARCHAR(255) NULL AFTER title");
      }
      if (!leaderCols.includes('role_ar')) {
        await db.query("ALTER TABLE about_leaders ADD COLUMN role_ar TEXT NULL AFTER role");
      }
      if (!leaderCols.includes('badge_ar')) {
        await db.query("ALTER TABLE about_leaders ADD COLUMN badge_ar VARCHAR(100) NULL AFTER badge");
      }
      if (!leaderCols.includes('bio_sections_ar')) {
        await db.query("ALTER TABLE about_leaders ADD COLUMN bio_sections_ar JSON NULL AFTER bio_sections");
      }
      
      // Ensure utf8mb4 collation for all Arabic text storage
      await db.query("ALTER TABLE about_page_content CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
      await db.query("ALTER TABLE about_leaders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

      console.log('[DB Migration] About tables verified with Arabic columns and utf8mb4 charset.');
    } catch (aboutMigErr) {
      console.log('[DB Migration Notice - About]', aboutMigErr.message);
    }

    // Ensure products and products_page_settings tables exist and have utf8mb4 charset
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_code VARCHAR(100) NOT NULL UNIQUE,
          category ENUM('our-products', 'future-portfolio') DEFAULT 'our-products',
          name VARCHAR(200) NOT NULL,
          name_ar VARCHAR(200) NULL,
          subtitle VARCHAR(255) NOT NULL,
          subtitle_ar VARCHAR(255) NULL,
          image VARCHAR(500) NOT NULL,
          featured_image VARCHAR(500) NULL,
          description TEXT NOT NULL,
          description_ar TEXT NULL,
          features JSON NULL,
          features_ar JSON NULL,
          specs JSON NULL,
          specs_ar JSON NULL,
          storage JSON NULL,
          storage_ar JSON NULL,
          indication_desc TEXT NULL,
          indication_desc_ar TEXT NULL,
          indication_target VARCHAR(255) NULL,
          indication_target_ar VARCHAR(255) NULL,
          indication_route VARCHAR(255) NULL,
          indication_route_ar VARCHAR(255) NULL,
          gallery JSON NULL,
          resources JSON NULL,
          resources_ar JSON NULL,
          order_index INT DEFAULT 0,
          status ENUM('Active', 'Inactive') DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS products_page_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hero_badge VARCHAR(100) DEFAULT 'OUR PRODUCTS',
          hero_badge_ar VARCHAR(100) DEFAULT 'منتجاتنا',
          hero_title_part1 VARCHAR(255) DEFAULT 'Innovative Vaccines.',
          hero_title_part1_ar VARCHAR(255) DEFAULT 'لقاحات مبتكرة.',
          hero_title_part2 VARCHAR(255) DEFAULT 'Trusted ',
          hero_title_part2_ar VARCHAR(255) DEFAULT 'حماية ',
          hero_title_accent VARCHAR(100) DEFAULT 'Protection.',
          hero_title_accent_ar VARCHAR(100) DEFAULT 'موثوقة.',
          hero_description TEXT NULL,
          hero_description_ar TEXT NULL,
          hero_image VARCHAR(500) DEFAULT 'home_banner.png',
          section_eyebrow VARCHAR(100) DEFAULT 'OUR PRODUCTS',
          section_eyebrow_ar VARCHAR(100) DEFAULT 'منتجاتنا الدوائية',
          cta_badge VARCHAR(100) DEFAULT 'STRATEGIC COLLABORATION',
          cta_badge_ar VARCHAR(100) DEFAULT 'شراكة استراتيجية',
          cta_title_part1 VARCHAR(255) DEFAULT 'Building a Healthier Future, ',
          cta_title_part1_ar VARCHAR(255) DEFAULT 'نبني مستقبلاً أكثر صحة، ',
          cta_title_accent VARCHAR(100) DEFAULT 'Together.',
          cta_title_accent_ar VARCHAR(100) DEFAULT 'معاً.',
          cta_description TEXT NULL,
          cta_description_ar TEXT NULL,
          cta_btn_text VARCHAR(100) DEFAULT 'Explore Partnerships',
          cta_btn_text_ar VARCHAR(100) DEFAULT 'استكشف شراكاتنا',
          cta_link VARCHAR(255) DEFAULT '/partners',
          page_resources JSON NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      // Ensure indication_items dynamic fields exist
      try {
        const [prodColsRaw] = await db.query("SHOW COLUMNS FROM products");
        const prodCols = prodColsRaw.map(c => c.Field);
        if (!prodCols.includes('indication_items')) {
          await db.query("ALTER TABLE products ADD COLUMN indication_items JSON NULL AFTER indication_route_ar");
        }
        if (!prodCols.includes('indication_items_ar')) {
          await db.query("ALTER TABLE products ADD COLUMN indication_items_ar JSON NULL AFTER indication_items");
        }
      } catch (migColErr) {
        console.log('[DB Migration Notice - indication_items]', migColErr.message);
      }

      console.log('[DB Migration] Products tables verified with Arabic columns and utf8mb4 charset.');
    } catch (prodMigErr) {
      console.log('[DB Migration Notice - Products]', prodMigErr.message);
    }

    console.log('[DB] Database tables checked/created successfully.');
  }
}

async function seedDefaultData(db) {
  // Seed Super Admin if not exists
  const [users] = await db.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    const defaultPassword = await bcrypt.hash('Admin@123', 10);
    await db.query(`
      INSERT INTO users (name, email, password, role, department, status, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Dr. Khaled Al-Mosa',
      'admin@vic.com.sa',
      defaultPassword,
      'Super Admin',
      'Executive Leadership',
      'Active',
      '+966 11 123 4567'
    ]);

    const editorPassword = await bcrypt.hash('Editor@123', 10);
    await db.query(`
      INSERT INTO users (name, email, password, role, department, status, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Sarah Al-Otaibi',
      'editor@vic.com.sa',
      editorPassword,
      'Editor',
      'Communications & Media',
      'Active',
      '+966 11 987 6543'
    ]);
    console.log('[DB Seed] Default admin accounts created: admin@vic.com.sa / Admin@123');
  }

  // Seed initial news articles if empty
  const [news] = await db.query('SELECT COUNT(*) as count FROM news_articles');
  if (news[0].count === 0) {
    const initialNews = [
      {
        slug: 'vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh',
        title: 'VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing',
        category: 'MOU',
        categories: JSON.stringify(['MOU', 'Partnerships', 'Manufacturing']),
        date_str: 'Oct 30, 2025',
        formatted_date: 'October 30, 2025',
        read_time: '3 min read',
        image: 'news1.jpeg',
        badge: 'MOU AGREEMENT',
        summary: 'CSL Seqirus and Vaccine Industrial Company have signed an MoU with the Ministry of Health of Saudi Arabia to enhance biotechnology sector access in Saudi Arabia.',
        content_html: '<p>CSL Seqirus and Vaccine Industrial Company have signed a Memorandum of Understanding with the Ministry of Health of Saudi Arabia to enhance the biotechnology sector by accessing advanced cell-based seasonal and pandemic influenza vaccines.</p>',
        status: 'Published'
      },
      {
        slug: 'vaccine-facility-construction-achieves-major-milestone',
        title: 'Our Vaccine Facility Construction Achieves Major Milestone – October 2025 Update',
        category: 'Manufacturing',
        categories: JSON.stringify(['Manufacturing', 'Company Updates']),
        date_str: 'Oct 26, 2025',
        formatted_date: 'October 26, 2025',
        read_time: '3 min read',
        image: 'construction_milestone_oct.jpg',
        badge: 'MANUFACTURING',
        summary: 'The construction of the Kingdom’s pioneering human vaccine manufacturing facility continues to progress ahead of schedule.',
        content_html: '<p>The construction of the Kingdom’s pioneering human vaccine manufacturing facility continues to progress ahead of schedule in Sudair Industrial City.</p>',
        status: 'Published'
      },
      {
        slug: 'saudi-arabia-injects-133m-into-vaccine-factory',
        title: 'Saudi Arabia Injects $133m into Sudair Vaccine Factory',
        category: 'Manufacturing',
        categories: JSON.stringify(['Manufacturing', 'Company Updates']),
        date_str: 'Mar 20, 2024',
        formatted_date: 'March 20, 2024',
        read_time: '3 min read',
        image: 'saudi_133m_factory.webp',
        badge: 'MANUFACTURING',
        summary: 'MODON and VIC sign SR500m ($133m) investment agreement to set up a joint venture vaccine factory in Sudair City.',
        content_html: '<p>Saudi Arabia is planning to invest SAR500 million ($133 million) in a factory to boost local vaccine and medicine manufacturing capacity.</p>',
        status: 'Published'
      }
    ];

    for (const item of initialNews) {
      await db.query(`
        INSERT INTO news_articles (slug, title, category, categories, date_str, formatted_date, read_time, image, badge, summary, content_html, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.slug, item.title, item.category, item.categories, item.date_str,
        item.formatted_date, item.read_time, item.image, item.badge,
        item.summary, item.content_html, item.status
      ]);
    }
    console.log('[DB Seed] Initial news articles inserted.');
  }

  // Seed sample contact inquiries if empty
  const [contacts] = await db.query('SELECT COUNT(*) as count FROM contact_inquiries');
  if (contacts[0].count === 0) {
    const sampleContacts = [
      {
        full_name: 'Dr. Faisal Al-Ghamdi',
        email: 'faisal.ghamdi@moh.gov.sa',
        company: 'Ministry of Health KSA',
        phone: '+966 50 123 4567',
        subject: 'Partnership Inquiry for Antigen Supply',
        message: 'We are interested in discussing long-term procurement frameworks for seasonal vaccines.',
        status: 'New',
        is_starred: 1
      },
      {
        full_name: 'Elena Rostova',
        email: 'e.rostova@bioglobal-tech.com',
        company: 'BioGlobal Technologies',
        phone: '+44 20 7946 0912',
        subject: 'R&D Collaboration & Tech Transfer',
        message: 'Exploring mutual technological collaboration on formulation platforms.',
        status: 'In Progress',
        is_starred: 0
      },
      {
        full_name: 'Mohammed Al-Zahrani',
        email: 'm.zahrani@pharmagroup.sa',
        company: 'Pharma Distribution Co.',
        phone: '+966 55 987 1122',
        subject: 'Distribution Channels Inquiry',
        message: 'Requesting distributor credentials and commercial catalog.',
        status: 'Resolved',
        is_starred: 0
      }
    ];

    for (const c of sampleContacts) {
      await db.query(`
        INSERT INTO contact_inquiries (full_name, email, company, phone, subject, message, status, is_starred)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [c.full_name, c.email, c.company, c.phone, c.subject, c.message, c.status, c.is_starred]);
    }
    console.log('[DB Seed] Initial contact inquiries seeded.');
  }

  // Seed sample media assets if empty
  const [media] = await db.query('SELECT COUNT(*) as count FROM media_assets');
  if (media[0].count === 0) {
    const sampleMedia = [
      {
        title: 'VIC Corporate Identity & Brand Guide',
        description: 'Official brand guidelines, logo variants, and color specifications',
        category: 'Brand Assets',
        format: 'PDF',
        file_size: '2.4 MB',
        file_name: 'vic_brand_guidelines.pdf',
        file_url: '/uploads/vic_brand_guidelines.pdf'
      },
      {
        title: 'Sudair Manufacturing Campus Render 4K',
        description: 'Architectural aerial visualization of the 42,000 sqm bio-facility',
        category: 'Facility & Campus',
        format: 'IMAGE',
        file_size: '3.8 MB',
        file_name: 'sudair_campus_render.jpg',
        file_url: '/uploads/sudair_campus_render.jpg'
      },
      {
        title: 'Q1 2025 Biotech Milestone Press Release',
        description: 'Official corporate media statement on cleanroom progress',
        category: 'Press Kit',
        format: 'DOCX',
        file_size: '450 KB',
        file_name: 'vic_q1_press_release.docx',
        file_url: '/uploads/vic_q1_press_release.docx'
      }
    ];

    for (const m of sampleMedia) {
      await db.query(`
        INSERT INTO media_assets (title, description, category, format, file_size, file_name, file_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [m.title, m.description, m.category, m.format, m.file_size, m.file_name, m.file_url]);
    }
    console.log('[DB Seed] Initial media assets seeded.');
  }

  // Seed default job postings if empty
  await seedJobPostings(db);

  // Seed default partners data if empty
  await seedPartnersData(db);

  // Seed default about us content & leaders if empty
  await seedAboutData(db);

  // Seed default products & portfolio if empty
  await seedProductsData(db);
}

const defaultJobPositions = [
  {
    job_code: 'vic-rd-01',
    title: 'Senior Research Scientist – Virology',
    department: 'Research & Development',
    location: 'Riyadh, KSA',
    experience: '5 - 8 years',
    type: 'Full-Time',
    overview: 'Lead the viral vector and cell-culture characterization for novel vaccine candidates at VIC’s state-of-the-art biopharmaceutical laboratories in Riyadh.',
    responsibilities: [
      'Design and execute cell-based viral propagation and harvest protocols under cGMP standards.',
      'Lead analytical assays (ELISA, qPCR, flow cytometry) for viral potency and antigen purity determination.',
      'Collaborate with international research partners including CSL Seqirus and Baylor College of Medicine.',
      'Author scientific reports, standard operating procedures (SOPs), and regulatory filing dossiers.'
    ],
    qualifications: [
      'Ph.D. or Master’s in Virology, Molecular Biology, Biotechnology, or related life sciences.',
      '5+ years hands-on experience in mammalian cell culture and viral vaccine development.',
      'Demonstrated expertise in cGMP compliance and SFDA/FDA regulatory expectations.',
      'Strong verbal and written English communication skills.'
    ],
    status: 'Active'
  },
  {
    job_code: 'vic-mfg-01',
    title: 'Process Development Engineer',
    department: 'Manufacturing',
    location: 'King Abdullah Economic City',
    experience: '3 - 6 years',
    type: 'Full-Time',
    overview: 'Oversee the scale-up and optimization of bioreactor and purification unit operations at our advanced commercial manufacturing complex.',
    responsibilities: [
      'Scale upstream and downstream bioprocesses from bench scale to commercial bioreactors (up to 2,000L).',
      'Execute tech transfer protocols and equipment qualification (IQ/OQ/PQ) in cleanroom environments.',
      'Implement automated Process Analytical Technology (PAT) to monitor critical process parameters.',
      'Drive root-cause investigations and process deviation resolutions using DMAIC methodology.'
    ],
    qualifications: [
      'B.Sc. or M.Sc. in Chemical Engineering, Biochemical Engineering, or Biotechnology.',
      '3–6 years of upstream/downstream bioprocess engineering in an aseptic vaccine or biologic facility.',
      'Experience with single-use bioreactors, chromatography skids, and ultrafiltration/diafiltration systems.',
      'Familiarity with clean utility systems (WFI, clean steam, compressed clean air).'
    ],
    status: 'Active'
  },
  {
    job_code: 'vic-qa-01',
    title: 'Quality Assurance Specialist',
    department: 'Quality',
    location: 'Riyadh, KSA',
    experience: '2 - 4 years',
    type: 'Full-Time',
    overview: 'Ensure strict compliance with national and international cGMP guidelines across analytical, production, and supply chain operations.',
    responsibilities: [
      'Review and approve batch production records, validation protocols, and analytical test results.',
      'Administer quality management systems (CAPA, change control, deviation management).',
      'Conduct internal quality audits and prepare facility teams for SFDA inspections.',
      'Collaborate with manufacturing teams on line clearance and cleanroom environmental monitoring.'
    ],
    qualifications: [
      'Bachelor’s degree in Pharmacy, Chemistry, Microbiology, or related science.',
      '2–4 years of Quality Assurance experience in a licensed pharmaceutical or vaccine manufacturing plant.',
      'Thorough knowledge of SFDA GMP guidelines, WHO standards, and ICH quality guidelines.',
      'High attention to detail and sound technical writing skills.'
    ],
    status: 'Active'
  },
  {
    job_code: 'vic-ra-01',
    title: 'Regulatory Affairs Manager',
    department: 'Regulatory Affairs',
    location: 'Riyadh, KSA',
    experience: '6 - 10 years',
    type: 'Full-Time',
    overview: 'Drive regulatory strategy and life-cycle management for VIC’s human vaccine portfolio with the Saudi Food & Drug Authority (SFDA) and regional health authorities.',
    responsibilities: [
      'Lead the compilation, submission, and defense of Marketing Authorization Applications (MAA) in eCTD format.',
      'Liaise directly with the SFDA and Ministry of Health on vaccine registration and fast-track pathways.',
      'Provide strategic regulatory guidance on technology transfers and post-approval variations.',
      'Monitor evolving regional and global vaccine regulatory requirements to ensure proactive compliance.'
    ],
    qualifications: [
      'Degree in Pharmacy, Pharmacology, or Life Sciences (Master’s or PharmD preferred).',
      '6–10 years of progressive regulatory affairs experience in Saudi Arabia or the GCC region.',
      'Proven track record of successful biologic or vaccine product registrations with SFDA.',
      'Expertise in eCTD compilation and life-cycle regulatory dossier management.'
    ],
    status: 'Active'
  },
  {
    job_code: 'vic-sc-01',
    title: 'Supply Chain Planner',
    department: 'Supply Chain',
    location: 'Riyadh, KSA',
    experience: '2 - 5 years',
    type: 'Full-Time',
    overview: 'Optimize cold-chain distribution, master production scheduling, and critical biopharmaceutical raw material inventories.',
    responsibilities: [
      'Develop end-to-end master production schedules aligned with national vaccination campaign requirements.',
      'Manage cold-chain logistics (-80°C, -20°C, and 2-8°C) ensuring GDP validation across transport lanes.',
      'Maintain material requirements planning (MRP) for critical single-use consumables and media.',
      'Liaise with customs clearance agencies and health authorities for rapid material import permits.'
    ],
    qualifications: [
      'Bachelor’s in Supply Chain Management, Industrial Engineering, or Business Administration.',
      '2–5 years of biopharma or pharmaceutical supply chain experience in Saudi Arabia.',
      'Knowledge of cold-chain GDP regulations and temperature-controlled validation standards.',
      'Proficiency with enterprise ERP platforms (SAP/Oracle).'
    ],
    status: 'Active'
  },
  {
    job_code: 'vic-hr-01',
    title: 'HR Business Partner',
    department: 'Human Resources',
    location: 'Riyadh, KSA',
    experience: '3 - 6 years',
    type: 'Full-Time',
    overview: 'Champion talent acquisition, Saudization initiatives, and workforce capability building for VIC’s high-growth biotechnology teams.',
    responsibilities: [
      'Partner with executive department leaders to attract and recruit specialized biotech and engineering talent.',
      'Implement specialized development and training tracks in partnership with international institutions.',
      'Foster organizational culture, employee engagement, and talent retention programs.',
      'Ensure alignment with Saudi Labor Law, Saudization quotas (Nitaqat), and national human capital targets.'
    ],
    qualifications: [
      'Bachelor’s degree in Human Resources, Business Administration, or related discipline.',
      '3–6 years of HRBP or talent acquisition experience in pharmaceutical, healthcare, or technology industries.',
      'Strong knowledge of Saudi Labor Law, Qiwa, and Muqeem systems.',
      'Bilingual proficiency in Arabic and English.'
    ],
    status: 'Active'
  },
  {
    job_code: 'vic-mfg-02',
    title: 'Bioprocess Validation Engineer',
    department: 'Manufacturing',
    location: 'Sudair Industrial City',
    experience: '3 - 6 years',
    type: 'Full-Time',
    overview: 'Execute cleaning validation, process validation, and thermal mapping across Sudair biomanufacturing lines.',
    responsibilities: [
      'Author and execute IQ/OQ/PQ protocols for aseptic filling isolators, freeze dryers, and formulation skids.',
      'Lead cleaning validation studies, recovery tests, and carryover limit assessments.',
      'Collaborate with engineering and manufacturing teams to ensure re-qualification cycles are maintained.'
    ],
    qualifications: [
      'Degree in Engineering, Pharmaceutical Sciences, or Industrial Technology.',
      '3+ years validation experience in sterile injectables or biologic production.',
      'Demonstrated understanding of Annex 1 sterile manufacturing requirements.'
    ],
    status: 'Active'
  },
  {
    job_code: 'vic-rd-02',
    title: 'Formulation & Drug Delivery Scientist',
    department: 'Research & Development',
    location: 'Riyadh, KSA',
    experience: '5 - 8 years',
    type: 'Full-Time',
    overview: 'Develop and evaluate novel adjuvant formulations and liquid stabilization matrices for vaccine storage stability.',
    responsibilities: [
      'Formulate emulsion, liposomal, and nanoparticle adjuvants for enhanced immune response.',
      'Conduct accelerated and real-time stability studies in accordance with ICH Q1A guidelines.',
      'Characterize formulation physical stability via DLS, zeta potential, and high-resolution microscopy.'
    ],
    qualifications: [
      'Ph.D. or Master’s in Pharmaceutical Sciences, Physical Chemistry, or Nanotechnology.',
      '5+ years experience in sterile formulation development or biophysical characterization.'
    ],
    status: 'Active'
  }
];

async function seedJobPostings(db, force = false) {
  const [existing] = await db.query('SELECT COUNT(*) as count FROM job_postings');
  if (existing[0].count === 0 || force) {
    if (force) {
      await db.query('DELETE FROM job_postings');
    }
    for (const job of defaultJobPositions) {
      await db.query(`
        INSERT INTO job_postings (job_code, title, department, location, type, experience, overview, description, requirements, responsibilities, qualifications, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        job.job_code,
        job.title,
        job.department,
        job.location,
        job.type,
        job.experience,
        job.overview,
        job.overview, // fallback for description
        Array.isArray(job.qualifications) ? job.qualifications.join('\n') : '', // fallback for requirements
        JSON.stringify(job.responsibilities),
        JSON.stringify(job.qualifications),
        job.status
      ]);
    }
    console.log(`[DB Seed] Seeded ${defaultJobPositions.length} default career job postings.`);
  }
}

const defaultPartnersList = [
  {
    code: 'csl',
    name: 'CSL Seqirus',
    category: 'Technology Transfers Partner',
    tier: 'Strategic Alliance',
    logo: 'CSLSeqirus_1_logo-e1761739712420.png',
    website: 'https://www.cslseqirus.com',
    description: 'Technology transfer partner for full localization of seasonal influenza and pandemic response.',
    order_index: 1,
    status: 'Active'
  },
  {
    code: 'uhlmann',
    name: 'Uhlmann Pac-Systems',
    category: 'Production Lines Partner',
    tier: 'Production Lines & Automation',
    logo: 'uhlmann-logo.png',
    website: 'https://www.uhlmann.de',
    description: 'Uhlmann Pac-Systems, Germany is the world’s leading system provider for the packaging of pharmaceuticals with state of art AI driven technology.',
    order_index: 2,
    status: 'Active'
  },
  {
    code: 'rota',
    name: 'ROTA',
    category: 'Production Lines Partner',
    tier: 'Production Lines & Automation',
    logo: 'Rota-Logo-large-e1779129484988.png',
    website: 'https://www.rota.de',
    description: 'ROTA, Germany is a 100-year-old evolved from a simple ampoule machine into a full portfolio of advanced systems.',
    order_index: 3,
    status: 'Active'
  },
  {
    code: 'bcm',
    name: 'Baylor College of Medicine',
    category: 'Vaccine development, Research & Training',
    tier: 'Academic Research & Clinical R&D',
    logo: 'bcm.png',
    website: 'https://www.bcm.edu',
    description: 'Baylor College of Medicine and VIC-RDI have signed Academic and R&D agreement for vaccine development.',
    order_index: 4,
    status: 'Active'
  },
  {
    code: 'kacst',
    name: 'KACST',
    category: 'Academic Research & Developments',
    tier: 'Academic Research & Developments',
    logo: 'Vaccine-Website-design-06.png',
    website: 'https://www.kacst.gov.sa',
    description: 'KACST and VIC RDI have signed collaboration agreement for research, development and innovation to localize Vaccine Manufacturing in Saudi Arabia.',
    order_index: 5,
    status: 'Active'
  },
  {
    code: 'nibrt',
    name: 'NIBRT',
    category: 'Bio processing research and training partners',
    tier: 'Academic Research & Clinical R&D',
    logo: 'nibrt.webp',
    website: 'https://www.nibrt.ie',
    description: 'A Global Centre of Excellence for Training and Research to help the growth and development of the biopharma manufacturing industry.',
    order_index: 6,
    status: 'Active'
  },
  {
    code: 'dvs',
    name: 'DVS',
    category: 'Business Development Consultants',
    tier: 'Strategic Advisory & Consulting',
    logo: 'DVS.jpeg',
    website: '',
    description: 'DVS Proposes a strategic business development collaboration and commits to build a strong sustainable Vaccine portfolio.',
    order_index: 7,
    status: 'Active'
  },
  {
    code: 'zyme',
    name: 'Zyme',
    category: 'Project Management Partners',
    tier: 'Project Management & Engineering',
    logo: 'Zyme-Logo-big.png',
    website: '',
    description: 'Experts in traditional project management techniques with deep domain knowledge of the biotech process.',
    order_index: 8,
    status: 'Active'
  },
  {
    code: 'keyplants',
    name: 'KeyPlants',
    category: 'Engineering Partner - Turnkey modular concept',
    tier: 'Project Management & Engineering',
    logo: 'keyplant.jpg',
    website: 'https://www.keyplants.com',
    description: 'Keyplants and capabilities include full in-house Design and Fabrication as well as subject matter expertise.',
    order_index: 9,
    status: 'Active'
  },
  {
    code: 'ath',
    name: 'Arabian Trade House',
    category: 'Supply Chain Partner',
    tier: 'Supply Chain & Commercial Distribution',
    logo: 'ATC-1.png',
    website: '',
    description: 'Arabian Trade House is a leading Biotechnology products distributor in Saudi Arabia. The Company was established in 1978.',
    order_index: 10,
    status: 'Active'
  }
];

const defaultPartnershipSections = [
  {
    section_key: 'ecosystem_pillar',
    badge: 'PILLAR 1',
    title: 'Technology Partners',
    subtitle: 'Global Innovators',
    content: 'Global innovators driving advanced bioprocess, cell culture, and mRNA solutions.',
    icon: 'handshake',
    layout_type: 'card',
    order_index: 1,
    status: 'Active'
  },
  {
    section_key: 'ecosystem_pillar',
    badge: 'PILLAR 2',
    title: 'Research & Academic Partners',
    subtitle: 'Scientific Excellence',
    content: 'Collaborating for scientific excellence, clinical trial leadership, and translational immunology.',
    icon: 'microscope',
    layout_type: 'card',
    order_index: 2,
    status: 'Active'
  },
  {
    section_key: 'ecosystem_pillar',
    badge: 'PILLAR 3',
    title: 'Government Partners',
    subtitle: 'National Health Priorities',
    content: 'Aligned with Saudi Vision 2030, Ministry of Health, and SFDA national security standards.',
    icon: 'building',
    layout_type: 'card',
    order_index: 3,
    status: 'Active'
  },
  {
    section_key: 'ecosystem_pillar',
    badge: 'PILLAR 4',
    title: 'Manufacturing Partners',
    subtitle: 'Scale & Reliability',
    content: 'Ensuring world-class sterile filling, automated packaging, and cGMP compliance at scale.',
    icon: 'factory',
    layout_type: 'card',
    order_index: 4,
    status: 'Active'
  },
  {
    section_key: 'ecosystem_pillar',
    badge: 'PILLAR 5',
    title: 'Distribution & Commercial Partners',
    subtitle: 'Global Reach',
    content: 'End-to-end temperature-controlled cold chain delivering vaccines safely across MENA and beyond.',
    icon: 'globe',
    layout_type: 'card',
    order_index: 5,
    status: 'Active'
  },
  {
    section_key: 'vision_2030_alignment',
    badge: 'SAUDI VISION 2030',
    title: 'Pioneering Biomanufacturing Sovereignty in the Kingdom',
    subtitle: 'A state-of-the-art biopharmaceutical campus built for global tech transfer',
    content: 'Located in Sudair Industrial City, VIC is establishing Saudi Arabia’s foremost human vaccine biomanufacturing facility. In alignment with Saudi Vision 2030 and the National Biotechnology Strategy, we partner with world-class innovators to localize end-to-end biological manufacturing, securing the Kingdom’s healthcare future.',
    bullet_points: JSON.stringify([
      'SFDA cGMP & WHO Prequalification-ready production cleanrooms',
      'SAR 500 Million+ bio-facility with high-speed automated sterile filling lines',
      'Complete tech-transfer pipeline from master cell banking to final drug product release',
      'Regional cold-chain logistics hub serving GCC, MENA, and international markets'
    ]),
    image_url: 'baylor_vic_agreement.jpg',
    icon: 'shield',
    cta_text: 'Discover Our Facility',
    cta_url: '/about',
    layout_type: 'split_right',
    order_index: 6,
    status: 'Active'
  },
  {
    section_key: 'collaboration_framework',
    badge: 'COLLABORATION MODELS',
    title: 'Flexible Frameworks Tailored for High-Impact Innovation',
    subtitle: 'From technology licensing to turn-key bioprocessing and regional co-distribution',
    content: 'Whether you are a multinational biotechnology enterprise, a clinical-stage research institution, or a specialized equipment manufacturer, VIC offers collaborative models that accelerate market entry, provide strategic access to the Saudi market, and ensure regulatory agility.',
    bullet_points: JSON.stringify([
      'Technology Transfer & Active Pharmaceutical Ingredient (API) Localization',
      'Collaborative Clinical Research & Fast-Track SFDA Regulatory Registration',
      'Contract Development & Manufacturing Organization (CDMO) Services',
      'Turnkey Cold-Chain Supply Chain & Multi-Country Commercial Distribution'
    ]),
    image_url: 'modon_vic_land.jpg',
    icon: 'award',
    cta_text: 'Start Collaboration',
    cta_url: '#partner-inquiry',
    layout_type: 'split_left',
    order_index: 7,
    status: 'Active'
  }
];

async function seedPartnersData(db, force = false) {
  try {
    // 1. Seed Partners Page Settings
    const [settings] = await db.query('SELECT COUNT(*) as count FROM partners_page_settings');
    if (settings[0].count === 0 || force) {
      if (force) {
        await db.query('DELETE FROM partners_page_settings');
      }
      const defaultStats = JSON.stringify([
        { label: 'Global Strategic Alliances', value: '10+' },
        { label: 'Ecosystem Pillars', value: '5' },
        { label: 'Capital Commitment', value: 'SAR 500M+' },
        { label: 'Vision 2030 Biotech Impact', value: '100%' }
      ]);
      await db.query(`
        INSERT INTO partners_page_settings 
        (id, hero_badge, hero_title, hero_title_line2, hero_accent, hero_description, hero_image, cta_text, stats_json)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          hero_badge = VALUES(hero_badge),
          hero_title = VALUES(hero_title),
          hero_title_line2 = VALUES(hero_title_line2),
          hero_accent = VALUES(hero_accent),
          hero_description = VALUES(hero_description),
          hero_image = VALUES(hero_image),
          cta_text = VALUES(cta_text),
          stats_json = VALUES(stats_json)
      `, [
        'OUR PARTNERS',
        'Stronger Together.',
        'Building Better Futures.',
        'Futures.',
        'Collaboration is at the heart of everything we do. We work with global leaders, research institutions, and government entities to advance vaccine innovation and strengthen global health.',
        'partner_banner.jpg',
        'Partner With Us',
        defaultStats
      ]);
      console.log('[DB Seed] Seeded partners page banner settings.');
    }

    // 2. Seed Strategic Partners
    const [partners] = await db.query('SELECT COUNT(*) as count FROM partners');
    if (partners[0].count === 0 || force) {
      if (force) {
        await db.query('DELETE FROM partners');
      }
      for (const p of defaultPartnersList) {
        await db.query(`
          INSERT INTO partners (code, name, category, tier, logo, website, description, order_index, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.code, p.name, p.category, p.tier, p.logo, p.website || '', p.description, p.order_index, p.status
        ]);
      }
      console.log(`[DB Seed] Seeded ${defaultPartnersList.length} strategic partners.`);
    }

    // 3. Seed Partnership Dynamic Sections
    const [sections] = await db.query('SELECT COUNT(*) as count FROM partnership_sections');
    if (sections[0].count === 0 || force) {
      if (force) {
        await db.query('DELETE FROM partnership_sections');
      }
      for (const s of defaultPartnershipSections) {
        await db.query(`
          INSERT INTO partnership_sections (section_key, badge, title, subtitle, content, bullet_points, image_url, icon, cta_text, cta_url, layout_type, order_index, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          s.section_key, s.badge || '', s.title, s.subtitle || '', s.content || '',
          s.bullet_points || null, s.image_url || null, s.icon || null,
          s.cta_text || '', s.cta_url || '', s.layout_type, s.order_index, s.status
        ]);
      }
      console.log(`[DB Seed] Seeded ${defaultPartnershipSections.length} partnership dynamic sections.`);
    }

    // 4. Seed initial sample inquiry if empty
    const [inquiries] = await db.query('SELECT COUNT(*) as count FROM partnership_inquiries');
    if (inquiries[0].count === 0) {
      await db.query(`
        INSERT INTO partnership_inquiries (full_name, organization, email, phone, category, message, status)
        VALUES 
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?)
      `, [
        'Dr. Julian Vance', 'BioPharma Global Solutions Ltd', 'j.vance@biopharmasolutions.com', '+44 20 7183 9200', 'Technology Transfer', 'Interested in exploring turn-key formulation technology licensing for pneumococcal conjugate vaccines in the Saudi market.', 'New',
        'Prof. Tariq Mansour', 'King Abdulaziz University R&D', 'tmansour@kau.edu.sa', '+966 50 445 6789', 'Clinical Trials', 'Proposal to partner on Phase II pediatric clinical trials and joint immunological biobanking in western province.', 'Under Review'
      ]);
      console.log('[DB Seed] Seeded sample partnership inquiries.');
    }

  } catch (err) {
    console.error('[DB Seed Partner Error]', err.message);
  }
}

// ==========================================
// ABOUT US SEED DATA & FUNCTIONS
// ==========================================

const defaultAboutContent = {
  hero: {
    section_key: 'hero',
    badge: 'ABOUT VIC',
    badge_ar: 'عن الشركة',
    title: 'Vaccine Industrial Holding LLC',
    title_ar: 'شركة اللقاحات الصناعية القابضة',
    subtitle: 'Leading the Charge in Vaccine Innovation in Saudi Arabia',
    subtitle_ar: 'ريادة الابتكار وتوطين صناعة اللقاحات في المملكة العربية السعودية',
    description: 'Vaccine Industrial Holding LLC (VIC) stands as a pioneering biotechnology firm headquartered in Riyadh, Saudi Arabia, dedicated to advancing vaccine innovation, manufacturing excellence, and national healthcare resilience.',
    description_ar: 'تعد شركة اللقاحات الصناعية القابضة (VIC) شركة رائدة في مجال التقنية الحيوية ومقرها الرياض، المملكة العربية السعودية، وتكرس جهودها لتعزيز الابتكار في اللقاحات، والتميز في التصنيع، ودعم منظومة الأمن الصحي الوطني.',
    image_url: 'home_banner.png'
  },
  overview_modal: {
    section_key: 'overview_modal',
    badge: 'COMPANY OVERVIEW',
    badge_ar: 'نظرة عامة على الشركة',
    title: 'Pioneering Biotechnology in Saudi Arabia',
    title_ar: 'ريادة التقنية الحيوية وصناعة اللقاحات في المملكة',
    description: 'The historic journey, strategic three-phase manufacturing facility, and national mission of Vaccine Industrial Holding LLC.',
    description_ar: 'المسيرة التاريخية، والمجمع الصناعي الاستراتيجي ثلاثي المراحل، والرسالة الوطنية لشركة اللقاحات الصناعية القابضة.',
    content_json: [
      'Vaccine Industrial Holding LLC (VIC) stands as a pioneering biotechnology firm headquartered in Riyadh, Saudi Arabia. Established in January 2022, VIC was conceived by Dr. Khaled Almosa, a distinguished healthcare management consultant and a visionary in the biotechnology sector. With an illustrious career as the Founder, Vice Chairman, and Managing Director of the Saudi Biotechnology Manufacturing Company for Insulin and Biologics from 2010 to 2020, Dr. Almosa has significantly advanced the biotechnology industry within the Kingdom.',
      'Dr. Almosa is a multifaceted entrepreneur, having founded numerous companies across various industries. He is also the founder of the Biotechnology Innovation Company for R&D in collaboration with King Abdulaziz City for Science and Technology (KACST) and the Center for Vaccine Development at Baylor College of Medicine, Houston, USA. Additionally, he established the Biotechnology Training Institute in Saudi Arabia and Bioera Industrial Engineering Company to construct biotech facilities in the GCC region.',
      'Beyond his contributions to VIC, Dr. Almosa is a respected member of the KSA Supreme Committee for Research, Development, and Innovation, chaired by HRH Crown Prince and Prime Minister Mohammed bin Salman. This committee operates under the Council of Economic and Development Affairs and the Council of Ministers (2021–2024), emphasizing Dr. Almosa’s dedication to fostering innovation and driving progress in biotechnology and healthcare.',
      'Vaccine Industrial Holding LLC is the first and only company in Saudi Arabia committed to establishing a state-of-the-art vaccine biomanufacturing facility. This ambitious project aims to transform the Kingdom into a global hub for vaccine production, enhancing self-reliance and advancing the nation’s healthcare infrastructure.',
      'The development of this groundbreaking facility will occur in three strategic phases over seven years. Each phase is meticulously planned to build cutting-edge capabilities, utilizing the latest technologies and innovations to produce high-quality vaccines that meet global standards. VIC’s initiative reflects its commitment to supporting Saudi Arabia’s healthcare needs while contributing to global efforts in vaccine accessibility and sustainability.',
      'Through this transformative journey, VIC addresses regional healthcare demands and positions Saudi Arabia as a global leader in vaccine manufacturing. With visionary leadership, technological excellence, and an unwavering commitment to innovation, Vaccine Industrial Holding LLC is paving the way for a healthier and more resilient future.'
    ],
    content_json_ar: [
      'تعد شركة اللقاحات الصناعية القابضة (VIC) شركة وطنية رائدة في مجال التقنية الحيوية، تتخذ من العاصمة الرياض مقراً رئيسياً لها. تأسست في يناير 2022 بمبادرة من الدكتور خالد الموسى، الخبير الاستشاري الرائد في إدارة الرعاية الصحية والتقنية الحيوية ومؤسس الشركة السعودية للصناعات الحيوية المتقدمة للإنسولين والمستحضرات الحيوية (2010–2020).',
      'أسس الدكتور الموسى العديد من المشاريع الرائدة، من بينها شركة الابتكار للتقنية الحيوية للأبحاث والتطوير بالتعاون مع مدينة الملك عبدالعزيز للعلوم والتقنية (KACST) ومركز أبحاث اللقاحات في كلية بايلور للطب بالولايات المتحدة، إضافة إلى معهد تدريب التقنية الحيوية وشركة بيوإيرا للهندسة الصناعية.',
      'يحظى الدكتور الموسى بعضوية اللجنة العليا للبحث والتطوير والابتكار برئاسة صاحب السمو الملكي ولي العهد رئيس مجلس الوزراء الأمير محمد بن سلمان، والمنبثقة عن مجلس الشؤون الاقتصادية والتنمية، تقديراً لمساهماته النوعية في توطين الصناعات المعرفية والطبية.',
      'تعد شركة اللقاحات الصناعية أول شركة سعودية متخصصة في تأسيس منشأة متكاملة للتصنيع الحيوي للقاحات، بهدف تحويل المملكة إلى مركز إقليمي ودولي لصناعة اللقاحات وتعزيز الاكتفاء الذاتي لمنظومة الرعاية الصحية.',
      'يجري تطوير المنشأة الصناعية عبر ثلاث مراحل استراتيجية متتالية على مدى سبع سنوات، لتأهيل قدرات تصنيعية متقدمة وفق أرقى معايير ممارسات التصنيع الجيد العالمية (GMP)، والمساهمة في استدامة سلاسل الإمداد الطبية الدولية.',
      'تواصل شركة اللقاحات الصناعية مسيرتها بخطى واثقة لتلبية الاحتياجات الصحية الوطنية وترسيخ مكانة المملكة الرائدة عالمياً في تصنيع اللقاحات والتقنيات الحيوية، لبناء غدٍ أكثر صحة وأماناً.'
    ]
  },
  vision_mission: {
    section_key: 'vision_mission',
    badge: 'OUR PURPOSE',
    badge_ar: 'أهدافنا',
    title: '',
    title_ar: '',
    content_json: {
      vision_title: 'OUR VISION',
      vision_paragraphs: [
        "We are committed to contributing to the realization of the National Biotechnology Strategy and aligning our efforts with the ambitious goals of Saudi Arabia's Vision 2030.",
        'Having successfully pioneered the localization of the insulin and biotechnology industries within the Kingdom, we are now focused on advancing the localization of the vaccine industry.',
        'This initiative reflects our deep sense of responsibility and unwavering dedication to the growth and prosperity of our beloved nation, Saudi Arabia. Our mission is driven by a passion for innovation and a commitment to building a self-sustaining biotechnology sector that supports the health and well-being of future generations.'
      ],
      mission_title: 'OUR MISSION',
      mission_paragraphs: [
        'Vaccine Industrial Holding LLC is dedicated to advancing vaccine innovation and manufacturing excellence in Saudi Arabia. We are committed to establishing a state-of-the-art biomanufacturing facility that produces high-quality vaccines using advanced technologies, builds a self-sustaining biotechnology ecosystem, and safeguards national healthcare resilience to shape a healthier future.'
      ]
    },
    content_json_ar: {
      vision_title: 'رؤيتنا',
      vision_paragraphs: [
        'نلتزم بالمساهمة الفاعلة في تحقيق مستهدفات الاستراتيجية الوطنية للتقنية الحيوية ومواءمة جهودنا مع الطموحات الرائدة لرؤية السعودية 2030.',
        'بعد نجاحنا في توطين صناعة الإنسولين والمنتجات الحيوية المتقدمة داخل المملكة، نركز جهودنا اليوم على تسريع توطين صناعة اللقاحات البشرية وفق أعلى المعايير العالمية.',
        'تجسد هذه المبادرة مسؤوليتنا الوطنية الراسخة والتزامنا الثابت بازدهار وطننا الغالي المملكة العربية السعودية. دافعنا هو الشغف بالابتكار وبناء قطاع حيوي مستدام يعزز صحة ورفاه أجيال الحاضر والمستقبل.'
      ],
      mission_title: 'رسالتنا',
      mission_paragraphs: [
        'تكرس شركة اللقاحات الصناعية القابضة جهودها للارتقاء بابتكار اللقاحات والتميز التصنيعي في المملكة العربية السعودية. ونلتزم بإنشاء منشأة تصنيع حيوي متطورة لإنتاج لقاحات عالية الجودة باستخدام أحدث التقنيات، وبناء منظومة تقنية حيوية مكتفية ذاتياً لحماية الصحة العامة وتعزيز الأمن الدوائي الوطني.'
      ]
    }
  },
  vision_2030: {
    section_key: 'vision_2030',
    badge: 'NATIONALITY',
    badge_ar: 'الاستراتيجية الوطنية',
    title: 'Aligned with Saudi Vision 2030',
    title_ar: 'متوافقون مع رؤية السعودية 2030',
    description: "VIC is proud to support the Kingdom's Vision 2030 by localizing advanced vaccine manufacturing, strengthening health security, creating high-value jobs, and driving innovation for a resilient and sustainable healthcare ecosystem.",
    description_ar: 'تفخر شركة اللقاحات الصناعية بدعم رؤية المملكة 2030 من خلال توطين التصنيع المتقدم للقاحات، وتعزيز الأمن الصحي، وتوليد وظائف نوعية عالية القيمة، ودفع عجلة الابتكار لمنظومة صحية مستدامة وقادرة على الصمود.',
    image_url: 'saudi_biotech_strategy.jpg',
    content_json: [
      { title: 'Health Sector Transformation', icon: 'heart', desc: 'Advancing healthcare security and life-saving immunization' },
      { title: 'Economic Diversification', icon: 'trending-up', desc: 'Building non-oil GDP through high-tech biomanufacturing' },
      { title: 'Local Content Development', icon: 'award', desc: 'Maximizing Saudi talent, workforce training, and supply chains' },
      { title: 'Innovation & Sustainability', icon: 'sun', desc: 'State-of-the-art green facilities and sustainable vaccine platforms' }
    ],
    content_json_ar: [
      { title: 'برنامج تحول القطاع الصحي', icon: 'heart', desc: 'تعزيز الأمن الصحي الوطني وتأمين اللقاحات الحيوية المنقذة للحياة' },
      { title: 'التنويع الاقتصادي المستدام', icon: 'trending-up', desc: 'بناء ناتج محلي غير نفطي عبر التصنيع الحيوي عالي التقنية' },
      { title: 'تنمية وتوطين المحتوى المحلي', icon: 'award', desc: 'تمكين الكفاءات الوطنية السعودية وتأهيل سلاسل الإمداد الطبية' },
      { title: 'الابتكار والاستدامة الحيوية', icon: 'sun', desc: 'مرافق تصنيع بيئية متطورة ومنصات لقاحات مستدامة' }
    ]
  }
};

const defaultLeadersList = [
  {
    name: 'Dr. Khaled Almosa',
    title: 'Founder and Chairman of Vaccine Industrial Company',
    role: 'Leading Saudi biotechnology pioneer & senior management consultant. Recognized as the “Godfather of Biotechnology Manufacturing in Saudi Arabia”.',
    badge: 'Founder & Chairman',
    initials: 'KA',
    image: 'Dr.Khaled-Almosa.jpeg',
    order_index: 1,
    status: 'Active',
    bio_sections: [
      {
        heading: 'Executive Summary',
        paragraphs: [
          'Dr. Khaled Almosa is a leading Saudi biotechnology pioneer and senior management consultant. Recognized as the “Godfather of Biotechnology Manufacturing in Saudi Arabia” by H.E. Dr. Hussein A. Gezairy (former WHO Regional Director and former Saudi Minister of Health), he has shaped the Kingdom’s life sciences and healthcare industries for more than three decades.'
        ]
      },
      {
        heading: 'Government, Policy & Innovation Leadership',
        paragraphs: [
          'He served as a member of the Supreme Committee for Research, Development & Innovation (2021–2024), chaired by HRH the Crown Prince at the Council of Economic and Development Affairs. His contributions helped shape national strategies in biotechnology, healthcare, and R&D.'
        ]
      },
      {
        heading: 'Executive Profile',
        paragraphs: [
          'Dr. Almosa is the first Saudi national to invest in and establish biotechnology manufacturing industries, founding companies across insulin and biologics production, human and animal vaccines, biomedical engineering, medical services, consulting, and R&D. His work directly advances Saudi Vision 2030 through healthcare localization, innovation, and workforce development.'
        ]
      },
      {
        heading: 'Pioneering Biotech Enterprises',
        items: [
          'SAUDI BIO (2010–2020) — Founder & Chairman: First and only Saudi manufacturer of insulin and biologics, in partnership with Novo Nordisk and Sandoz. Acquired in 2023 by Lifera (PIF-owned).',
          'Vaccine Industrial Holding Company (VIC) — Founder & Chairman: Home to Saudi Arabia’s first and the Middle East’s largest human vaccine manufacturing facility, partnering with CSL Seqirus and other global biotech leaders.',
          'Biotech Innovation Company for R&D — Founder & Chairman: Established with Baylor College of Medicine; collaborates with KACST; funded by Saudi NIH to conduct MERS clinical trials.',
          'Anivax — Founder & Chairman: A dedicated animal vaccine R&D and manufacturing company in partnership with Boehringer Ingelheim, positioning Saudi Arabia as a regional veterinary biotech hub.',
          'Bioera — Industrial Engineering & Project Management — Founder & Chairman: International engineering firm operating across the GCC, USA, Europe, and India with partners including KeyPlants, Zyme Biotech, Shahin Engineering, Podtech, and Jadwa Contractors.',
          'MedTech Group of Companies — Founder & Chairman: Operates day surgery centers, medical facilities, and medical supplies services in Riyadh.',
          'Biotechnology Training Institute — Founder: Being established with NIBRT, the first institute of its kind in the Middle East to train the region’s biotechnology workforce.'
        ]
      },
      {
        heading: 'Consulting & Strategic Advisory',
        items: [
          'Dr. Khaled Almosa Consulting Firm (Riyadh) — Chairman: Licensed by the Saudi Ministry of Commerce; specializes in biotech, R&D, investment, and business development.',
          'Averon Consulting (Dubai) — Chairman: Provides strategic advisory in healthcare and biotechnology, including regulatory strategy, market entry, partnerships, and innovation planning.'
        ]
      },
      {
        heading: 'Research & Publications',
        items: [
          '“Investigating Factors That Impede Successful Vaccine Manufacturing Business in the Kingdom of Saudi Arabia: Imperatives for Healthcare Sustainability.”',
          '“My Mission to Save Lives in Saudi Arabia: Empowering 2030 Through Local Manufacturing of Insulin, Vaccines, Cancer Therapeutics, and Gene Editing Technologies.”'
        ]
      },
      {
        heading: 'Legacy',
        paragraphs: [
          'Dr. Almosa’s legacy is the biotechnology ecosystem he built — from the first insulin factory to the first human vaccine plant, from pioneering R&D to training the next generation of biotech professionals. His career represents a mission to save lives, strengthen national health security, and secure the Kingdom’s biotechnological future.'
        ]
      }
    ]
  },
  {
    name: 'H.E. Dr. Hussein AlGazairy',
    title: 'Founder of College of Medicine at King Saud University',
    role: 'Ex-Saudi Minister of Health & Ex-Regional Director of WHO, Eastern Mediterranean Region.',
    badge: 'Advisory Board',
    initials: 'HA',
    image: 'H.E-Dr.-Hussein-AlGazairy-1-1.jpg',
    order_index: 2,
    status: 'Active',
    bio_sections: [
      {
        heading: 'Distinguished Leadership',
        items: [
          'Founder of the College of Medicine at King Saud University',
          'Ex-Saudi Minister of Health',
          'Ex-Regional Director of World Health Organization (WHO), Eastern Mediterranean Region'
        ]
      }
    ]
  },
  {
    name: 'Professor Aws Alshamsan',
    title: 'Secretary-General of the Saudi Commission for Health',
    role: 'Ex-Consultant for Biological Products at SFDA & Former Dean of the College of Pharmacy at King Saud University.',
    badge: 'Scientific Board',
    initials: 'AA',
    image: 'Professor-Aws-Alshamsan-1-1.jpg',
    order_index: 3,
    status: 'Active',
    bio_sections: [
      {
        heading: 'Scientific & Academic Background',
        items: [
          'The Secretary-General of the Saudi Commission for Health Specialties',
          'Ex-Consultant for biological products at the Saudi Food and Drug Authority (SFDA) for five years',
          'Co-director of the Joint Center of Excellence in Nanomedicine at KACST between 2013 and 2015',
          'Director of King Abdullah Institute for Nanotechnology between 2014 and 2017',
          'Dean of the College of Pharmacy at King Saud University between 2017–2022'
        ]
      }
    ]
  },
  {
    name: 'Dr. Abdulrazak AlGazairy',
    title: 'Senior Medical Surgeon & Researcher',
    role: 'Head of Ophthalmology Division at PSBAHC, Co-founder of Saudi Biotechnology Manufacturing Co. & Chairman of Meditech Group.',
    badge: 'Medical Board',
    initials: 'AG',
    image: 'drabdul.jpg',
    order_index: 4,
    status: 'Active',
    bio_sections: [
      {
        heading: 'Medical & Executive Experience',
        items: [
          'Senior Medical Surgeon and Researcher',
          'Head of Ophthalmology division, Prince Sultan Bin Abdulaziz Humanitarian City',
          'Co-founder, Saudi Biotechnology Manufacturing Co.',
          'Chairman, Meditech Group'
        ]
      }
    ]
  },
  {
    name: 'Mr. Turki Al-Dayel',
    title: 'Co-Head of Middle East & CEO of Ninety One Private Equity',
    role: 'Ex-Director & Head of Private Equity at Raidah Investment Company (GOSI), Board Member of Arabian Centers & SBMC.',
    badge: 'Executive Board',
    initials: 'TD',
    image: 'Mr.-Turki-Al-Dayel-Director-1.jpg',
    order_index: 5,
    status: 'Active',
    bio_sections: [
      {
        heading: 'Investment Leadership',
        items: [
          'Co-Head of the Middle East & CEO of Ninety One Private Equity, Saudi Arabia',
          'Ex-Director & Head of Private Equity at Raidah Investment Company (GOSI)',
          'Board member of Arabian Centers Co. and Saudi Biotechnology Manufacturing Co.'
        ]
      }
    ]
  },
  {
    name: 'Mr. Abdulrahman AlMalik',
    title: 'Executive Director of Investments - PIF Portfolio Company',
    role: 'Private Equity in Real-estate. Ex Advisor to the Minister of Economy & Planning and Financial Advisor at Ernst & Young.',
    badge: 'Executive Board',
    initials: 'AM',
    image: 'Mr.-Abdulrahman-AlMalik-1.jpg',
    order_index: 6,
    status: 'Active',
    bio_sections: [
      {
        heading: 'Corporate Strategy & Governance',
        items: [
          'Executive Director of Investments - PIF portfolio Company, Private Equity in Real-estate',
          'Ex Advisor to the Minister of Economy & Planning and Financial Advisor at Ernst & Young',
          'Holds an MBA from ESADE Business School'
        ]
      }
    ]
  },
  {
    name: 'Professor Abdullah Alotaibi',
    title: 'Senior Consultant for Education & Training Affairs',
    role: 'Consultant for University Certificates Equalization at Ministry of Education, Former Member of Consultative (SHOURA) Council.',
    badge: 'Advisory Board',
    initials: 'AO',
    image: 'prof-abdullah-alotaibi.png',
    order_index: 7,
    status: 'Active',
    bio_sections: [
      {
        heading: 'Public Service & Academic Leadership',
        items: [
          'Senior Consultant for Education and Training Affairs',
          'Consultant for University Certificates Equalization at Ministry of Education (2016 – Present)',
          'Member of Consultative (SHOURA) Council (2009 – 2021)',
          'Professor of Clinical Low Vision and Rehabilitation at King Saud University (KSU)',
          'Dean of College of Applied Medical Sciences at KSU (2008)',
          'Consultant for Low Vision & Rehabilitation at Ministry of Health (MOH) for 10 years',
          'Member of different Committees at the Saudi Commission for Health Specialties (SCFHS) and Saudi Food and Drug Authority (SFDA)'
        ]
      }
    ]
  }
];

async function seedAboutData(db, force = false) {
  try {
    // 1. Seed About Page Content
    const [existingContent] = await db.query('SELECT COUNT(*) as count FROM about_page_content');
    if (existingContent[0].count === 0 || force) {
      if (force) {
        await db.query('DELETE FROM about_page_content');
      }
      for (const key of Object.keys(defaultAboutContent)) {
        const item = defaultAboutContent[key];
        await db.query(`
          INSERT INTO about_page_content (section_key, title, title_ar, subtitle, subtitle_ar, badge, badge_ar, description, description_ar, image_url, content_json, content_json_ar)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            title_ar = VALUES(title_ar),
            subtitle = VALUES(subtitle),
            subtitle_ar = VALUES(subtitle_ar),
            badge = VALUES(badge),
            badge_ar = VALUES(badge_ar),
            description = VALUES(description),
            description_ar = VALUES(description_ar),
            image_url = VALUES(image_url),
            content_json = VALUES(content_json),
            content_json_ar = VALUES(content_json_ar)
        `, [
          item.section_key,
          item.title || '',
          item.title_ar || '',
          item.subtitle || '',
          item.subtitle_ar || '',
          item.badge || '',
          item.badge_ar || '',
          item.description || '',
          item.description_ar || '',
          item.image_url || '',
          item.content_json ? JSON.stringify(item.content_json) : null,
          item.content_json_ar ? JSON.stringify(item.content_json_ar) : null
        ]);
      }
      console.log('[DB Seed] Seeded default about page sections with Arabic support.');
    }

    // Auto-fill Arabic defaults for any section where Arabic fields are NULL or empty
    for (const key of Object.keys(defaultAboutContent)) {
      const item = defaultAboutContent[key];
      await db.query(`
        UPDATE about_page_content 
        SET 
          title_ar = COALESCE(NULLIF(title_ar, ''), ?),
          subtitle_ar = COALESCE(NULLIF(subtitle_ar, ''), ?),
          badge_ar = COALESCE(NULLIF(badge_ar, ''), ?),
          description_ar = COALESCE(NULLIF(description_ar, ''), ?),
          content_json_ar = COALESCE(content_json_ar, ?)
        WHERE section_key = ?
      `, [
        item.title_ar || '',
        item.subtitle_ar || '',
        item.badge_ar || '',
        item.description_ar || '',
        item.content_json_ar ? JSON.stringify(item.content_json_ar) : null,
        key
      ]);
    }

    // 2. Seed About Leaders
    const [existingLeaders] = await db.query('SELECT COUNT(*) as count FROM about_leaders');
    if (existingLeaders[0].count === 0 || force) {
      if (force) {
        await db.query('DELETE FROM about_leaders');
      }
      for (const leader of defaultLeadersList) {
        await db.query(`
          INSERT INTO about_leaders (name, title, role, badge, initials, image, bio_sections, order_index, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          leader.name,
          leader.title,
          leader.role,
          leader.badge,
          leader.initials || '',
          leader.image || '',
          leader.bio_sections ? JSON.stringify(leader.bio_sections) : null,
          leader.order_index || 0,
          leader.status || 'Active'
        ]);
      }
      console.log(`[DB Seed] Seeded ${defaultLeadersList.length} founding leaders.`);
    }

  } catch (err) {
    console.error('[DB Seed About Error]', err.message);
  }
}

// ==========================================
// 4. PRODUCTS & PORTFOLIO DEFAULTS & SEEDING
// ==========================================

const defaultProductsList = [
  {
    product_code: 'flucelvax',
    category: 'our-products',
    name: 'Flucelvax®',
    name_ar: 'Flucelvax®',
    subtitle: 'Seasonal Influenza Vaccine',
    subtitle_ar: 'لقاح الإنفلونزا الموسمية المعتمد على مزارع الخلايا',
    image: 'flucelvax_featured.png',
    featured_image: 'flucelvax_featured.png',
    description: 'Flucelvax® is a next-generation, cell culture-based influenza vaccine designed to help protect against seasonal flu.',
    description_ar: 'يعتبر Flucelvax® جيلاً متقدماً من لقاحات الإنفلونزا المصنعة بتقنية زراعة الخلايا لتوفير أقصى درجات الحماية من سلالات الإنفلونزا الموسمية.',
    features: [
      'Produced in MDCK cell culture',
      'Egg-free manufacturing process',
      'High purity and consistent quality'
    ],
    features_ar: [
      'مصنع في مزارع خلايا MDCK الحيوية المتقدمة',
      'خالٍ تماماً من البيض ومناسب للأشخاص ذوي الحساسية',
      'درجة نقاء استثنائية وجودة تصنيعية متسقة عالمياً'
    ],
    specs: [
      { label: 'Product Name', value: 'Flucelvax®' },
      { label: 'Type', value: 'Seasonal Influenza Vaccine' },
      { label: 'Technology', value: 'Cell Culture (MDCK)' },
      { label: 'Formulation', value: 'Suspension for Injection' },
      { label: 'Pack Size', value: '0.5 mL pre-filled syringe' },
      { label: 'Route of Administration', value: 'Intramuscular use' },
      { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
    ],
    specs_ar: [
      { label: 'اسم المنتج الدوائي', value: 'Flucelvax®' },
      { label: 'نوع اللقاح', value: 'لقاح الإنفلونزا الموسمية' },
      { label: 'التقنية الحيوية', value: 'زراعة الخلايا (MDCK)' },
      { label: 'الشكل الصيدلاني', value: 'معلق للحقن' },
      { label: 'حجم العبوة', value: 'حقنة مسبقة التعبئة 0.5 مل' },
      { label: 'طريقة الإعطاء', value: 'حقن عضلي' },
      { label: 'جهة التصنيع', value: 'شركة اللقاحات الصناعية (VIC)' }
    ],
    storage: [
      { label: 'Storage Temperature', value: '2°C to 8°C' },
      { label: 'Do Not Freeze', value: 'Yes' },
      { label: 'Shelf Life', value: '24 Months' },
      { label: 'Protect from Light', value: 'Yes' }
    ],
    storage_ar: [
      { label: 'درجة حرارة التخزين', value: '2 إلى 8 درجات مئوية' },
      { label: 'عدم التجميد', value: 'نعم، يمنع التجميد' },
      { label: 'مدة الصلاحية', value: '24 شهراً' },
      { label: 'الحماية من الضوء', value: 'نعم، يحفظ في عبوته الأصلية' }
    ],
    indication_desc: 'is indicated for active immunization against seasonal and epidemic pathogens targeted by this vaccine. Administration must comply with official national health authority vaccination guidelines.',
    indication_desc_ar: 'مخصص للتحصين الفعال ضد مسببات الأمراض الموسمية والوبائية المستهدفة بهذا اللقاح. ويجب أن تتوافق طريقة الإعطاء بدقة مع الإرشادات الوطنية المعتمدة من وزارة الصحة.',
    indication_target: 'Individuals 6 months and older / High-risk and general population cohorts',
    indication_target_ar: 'الأفراد من سن 6 أشهر فما فوق / الفئات الأكثر عرضة للمخاطر الصحية وعامة أفراد المجتمع',
    indication_route: 'Administered via intramuscular injection by qualified healthcare professionals',
    indication_route_ar: 'عن طريق الحقن العضلي بإشراف ممارسين صحيين معتمدين',
    gallery: [
      'flucelvax_featured.png',
      'p4.jpg',
      'flucelvax_modal_main.jpg',
      'thumb_vials1.jpg'
    ],
    resources: [
      { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    resources_ar: [
      { name: 'معلومات المنتج الدوائي', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'دليل الوصفات الطبية المعتمد', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'نشرة معلومات المرضى', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'شهادة الجودة والتصنيع الدوائي', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    order_index: 0,
    status: 'Active'
  },
  {
    product_code: 'vaxigrip',
    category: 'our-products',
    name: 'Vaxigrip®',
    name_ar: 'Vaxigrip®',
    subtitle: 'Influenza Vaccine (Split Virion)',
    subtitle_ar: 'لقاح الإنفلونزا (فيروس مجزأ معطل)',
    image: 'p3.jpg',
    featured_image: 'p3.jpg',
    description: 'Vaxigrip® is formulated to provide robust seasonal protection against circulating influenza viruses, backed by proven clinical efficacy.',
    description_ar: 'تم تطوير Vaxigrip® لتوفير استجابة مناعية قوية ضد فيروسات الإنفلونزا المنتشرة، مدعوماً بنتائج سريرية مثبتة على نطاق دولي واسع.',
    features: [
      'Quadrivalent broad protection against circulating flu strains',
      'High batch-to-batch consistency and purity',
      'Compliant with international WHO recommendations'
    ],
    features_ar: [
      'حماية رباعية واسعة النطاق ضد سلالات الإنفلونزا المتداولة',
      'اتساق عالي الجودة بين دفعات الإنتاج مع أعلى معايير النقاء',
      'متطابق كلياً مع توصيات منظمة الصحة العالمية (WHO)'
    ],
    specs: [
      { label: 'Product Name', value: 'Vaxigrip®' },
      { label: 'Type', value: 'Influenza Vaccine (Split Virion)' },
      { label: 'Technology', value: 'Inactivated Split Virion' },
      { label: 'Formulation', value: 'Injectable Suspension' },
      { label: 'Pack Size', value: '0.5 mL pre-filled syringe' },
      { label: 'Route of Administration', value: 'Intramuscular / Subcutaneous' },
      { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
    ],
    specs_ar: [
      { label: 'اسم المنتج الدوائي', value: 'Vaxigrip®' },
      { label: 'نوع اللقاح', value: 'لقاح الإنفلونزا (فيروس مجزأ)' },
      { label: 'التقنية الحيوية', value: 'فيروس معطل مجزأ' },
      { label: 'الشكل الصيدلاني', value: 'معلق للحقن' },
      { label: 'حجم العبوة', value: 'حقنة مسبقة التعبئة 0.5 مل' },
      { label: 'طريقة الإعطاء', value: 'حقن عضلي أو تحت الجلد' },
      { label: 'جهة التصنيع', value: 'شركة اللقاحات الصناعية (VIC)' }
    ],
    storage: [
      { label: 'Storage Temperature', value: '2°C to 8°C' },
      { label: 'Do Not Freeze', value: 'Yes' },
      { label: 'Shelf Life', value: '24 Months' },
      { label: 'Protect from Light', value: 'Yes' }
    ],
    storage_ar: [
      { label: 'درجة حرارة التخزين', value: '2 إلى 8 درجات مئوية' },
      { label: 'عدم التجميد', value: 'نعم، يمنع التجميد' },
      { label: 'مدة الصلاحية', value: '24 شهراً' },
      { label: 'الحماية من الضوء', value: 'نعم' }
    ],
    indication_desc: 'is indicated for active immunization against influenza viral infections.',
    indication_desc_ar: 'مخصص للتحصين الفعال ضد عدوى فيروسات الإنفلونزا الموسمية.',
    indication_target: 'Adults and pediatric cohorts aged 6 months and above',
    indication_target_ar: 'البالغين والأطفال من عمر 6 أشهر فما فوق',
    indication_route: 'Intramuscular or deep subcutaneous injection',
    indication_route_ar: 'عن طريق الحقن العضلي أو تحت الجلد بعمق',
    gallery: [
      'p3.jpg',
      'thumb_vials1.jpg',
      'thumb_vials2.jpg',
      'thumb_scientist.jpg'
    ],
    resources: [
      { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    resources_ar: [
      { name: 'معلومات المنتج الدوائي', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'دليل الوصفات الطبية المعتمد', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'نشرة معلومات المرضى', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'شهادة الجودة والتصنيع الدوائي', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    order_index: 1,
    status: 'Active'
  },
  {
    product_code: 'pneumovax',
    category: 'our-products',
    name: 'Pneumovax®',
    name_ar: 'Pneumovax®',
    subtitle: 'Pneumococcal Polyvalent Vaccine',
    subtitle_ar: 'لقاح المكورات الرئوية متعدد التكافؤ',
    image: 'p2.jpg',
    featured_image: 'p2.jpg',
    description: 'Pneumovax® is a polyvalent vaccine formulated to protect against invasive pneumococcal infections in vulnerable and high-risk populations.',
    description_ar: 'لقاح عالي الكفاءة تم تركيبه للحماية من عدوى المكورات الرئوية لدى الفئات الضعيفة والأكثر عرضة للإصابة والمضاعفات التنفسية.',
    features: [
      'Broad 23-serotype pneumococcal coverage',
      'Elevated and durable immune response',
      'Produced under strict GMP quality standards'
    ],
    features_ar: [
      'تغطية وقائية واسعة النطاق تشمل 23 نمطاً مصلياً رئوياً',
      'استجابة مناعية طويلة الأمد ومثبتة سريرياً',
      'ينتج وفقاً لأدق معايير ممارسات التصنيع الجيد (GMP)'
    ],
    specs: [
      { label: 'Product Name', value: 'Pneumovax®' },
      { label: 'Type', value: 'Pneumococcal Polyvalent Vaccine' },
      { label: 'Technology', value: 'Purified Capsular Polysaccharide' },
      { label: 'Formulation', value: 'Solution for Injection' },
      { label: 'Pack Size', value: '0.5 mL single-dose vial / syringe' },
      { label: 'Route of Administration', value: 'Intramuscular / Subcutaneous' },
      { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
    ],
    specs_ar: [
      { label: 'اسم المنتج الدوائي', value: 'Pneumovax®' },
      { label: 'نوع اللقاح', value: 'لقاح المكورات الرئوية متعدد التكافؤ' },
      { label: 'التقنية الحيوية', value: 'عديد السكاريد المحفظي المنقى' },
      { label: 'الشكل الصيدلاني', value: 'محلول للحقن' },
      { label: 'حجم العبوة', value: 'قارورة جرعة واحدة 0.5 مل' },
      { label: 'طريقة الإعطاء', value: 'حقن عضلي أو تحت الجلد' },
      { label: 'جهة التصنيع', value: 'شركة اللقاحات الصناعية (VIC)' }
    ],
    storage: [
      { label: 'Storage Temperature', value: '2°C to 8°C' },
      { label: 'Do Not Freeze', value: 'Yes' },
      { label: 'Shelf Life', value: '24 Months' },
      { label: 'Protect from Light', value: 'Yes' }
    ],
    storage_ar: [
      { label: 'درجة حرارة التخزين', value: '2 إلى 8 درجات مئوية' },
      { label: 'عدم التجميد', value: 'نعم، يمنع التجميد' },
      { label: 'مدة الصلاحية', value: '24 شهراً' },
      { label: 'الحماية من الضوء', value: 'نعم' }
    ],
    indication_desc: 'is indicated for vaccination against pneumococcal disease caused by the 23 serotypes in the vaccine.',
    indication_desc_ar: 'مخصص للوقاية من أمراض المكورات الرئوية الناتجة عن 23 نمطاً مصلياً مشمولاً باللقاح.',
    indication_target: 'Adults 50+ and persons aged 2+ with increased risk',
    indication_target_ar: 'البالغين من سن 50 فما فوق والأشخاص من سن سنتين فأكثر ذوي الخطورة العالية',
    indication_route: 'Intramuscular or subcutaneous',
    indication_route_ar: 'عن طريق الحقن العضلي أو تحت الجلد',
    gallery: [
      'p2.jpg',
      'thumb_vials1.jpg',
      'thumb_vials2.jpg',
      'thumb_scientist.jpg'
    ],
    resources: [
      { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    resources_ar: [
      { name: 'معلومات المنتج الدوائي', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'دليل الوصفات الطبية المعتمد', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'نشرة معلومات المرضى', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'شهادة الجودة والتصنيع الدوائي', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    order_index: 2,
    status: 'Active'
  },
  {
    product_code: 'rotarix',
    category: 'our-products',
    name: 'Rotarix®',
    name_ar: 'Rotarix®',
    subtitle: 'Rotavirus Oral Vaccine',
    subtitle_ar: 'لقاح الروتا الفموي للرضع',
    image: 'p1.jpg',
    featured_image: 'p1.jpg',
    description: 'Rotarix® is an oral vaccine offering early and robust protection against severe rotavirus gastroenteritis in infants.',
    description_ar: 'لقاح حي موهن يعطى عن طريق الفم لتوفير حماية مبكرة وفعالة للرضع ضد التهاب المعدة والأمعاء الحاد الناجم عن فيروس الروتا.',
    features: [
      'Gentle oral drop administration for infants',
      'High clinical efficacy against severe rotavirus diarrhea',
      'Extensively validated across global clinical trials'
    ],
    features_ar: [
      'جرعات فموية لطيفة ومناسبة للرضع والأطفال حديثي الولادة',
      'فعالية إكلينيكية عالية ومثبتة ضد نوبات الإسهال الشديد',
      'معتمد ومختبر بدقة عبر دراسات سريرية دولية رائدة'
    ],
    specs: [
      { label: 'Product Name', value: 'Rotarix®' },
      { label: 'Type', value: 'Live Attenuated Rotavirus Vaccine' },
      { label: 'Technology', value: 'Human Attenuated Strain' },
      { label: 'Formulation', value: 'Oral Suspension' },
      { label: 'Pack Size', value: '1.5 mL oral applicator' },
      { label: 'Route of Administration', value: 'Oral Use Only' },
      { label: 'Manufacturer', value: 'Vaccine Industrial Company (VIC)' }
    ],
    specs_ar: [
      { label: 'اسم المنتج الدوائي', value: 'Rotarix®' },
      { label: 'نوع اللقاح', value: 'لقاح فيروس الروتا الحي الموهن' },
      { label: 'التقنية الحيوية', value: 'سلالة بشرية موهنة' },
      { label: 'الشكل الصيدلاني', value: 'معلق فموي' },
      { label: 'حجم العبوة', value: 'أداة تطبيق فموية 1.5 مل' },
      { label: 'طريقة الإعطاء', value: 'استخدام فموي فقط' },
      { label: 'جهة التصنيع', value: 'شركة اللقاحات الصناعية (VIC)' }
    ],
    storage: [
      { label: 'Storage Temperature', value: '2°C to 8°C' },
      { label: 'Do Not Freeze', value: 'Yes' },
      { label: 'Shelf Life', value: '24 Months' },
      { label: 'Protect from Light', value: 'Yes' }
    ],
    storage_ar: [
      { label: 'درجة حرارة التخزين', value: '2 إلى 8 درجات مئوية' },
      { label: 'عدم التجميد', value: 'نعم، يمنع التجميد' },
      { label: 'مدة الصلاحية', value: '24 شهراً' },
      { label: 'الحماية من الضوء', value: 'نعم' }
    ],
    indication_desc: 'is indicated for the prevention of rotavirus gastroenteritis in infants from 6 to 24 weeks of age.',
    indication_desc_ar: 'مخصص للوقاية من التهاب المعدة والأمعاء بفيروس الروتا للرضع من سن 6 أسابيع إلى 24 أسبوعاً.',
    indication_target: 'Infants from 6 to 24 weeks of age',
    indication_target_ar: 'الرضع من عمر 6 إلى 24 أسبوعاً',
    indication_route: 'Oral administration only',
    indication_route_ar: 'إعطاء عن طريق الفم فقط',
    gallery: [
      'p1.jpg',
      'thumb_vials1.jpg',
      'thumb_vials2.jpg',
      'thumb_scientist.jpg'
    ],
    resources: [
      { name: 'Product Information', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'Prescribing Information', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'Patient Information Leaflet', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'Quality Certificate', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    resources_ar: [
      { name: 'معلومات المنتج الدوائي', type: 'PDF', size: '1.2 MB', icon: 'document' },
      { name: 'دليل الوصفات الطبية المعتمد', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
      { name: 'نشرة معلومات المرضى', type: 'PDF', size: '0.8 MB', icon: 'patient' },
      { name: 'شهادة الجودة والتصنيع الدوائي', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
    ],
    order_index: 3,
    status: 'Active'
  },
  {
    product_code: 'meningococcal-quad',
    category: 'future-portfolio',
    name: 'MenACWY®',
    name_ar: 'MenACWY®',
    subtitle: 'Meningococcal Conjugate Vaccine',
    subtitle_ar: 'لقاح المكورات السحائية المقترن الرباعي',
    image: 'modal_vials_banner.jpg',
    featured_image: 'modal_vials_banner.jpg',
    description: 'Next-generation conjugate vaccine targeting Neisseria meningitidis serogroups A, C, W-135, and Y to safeguard public health and pilgrims.',
    description_ar: 'لقاح مقترن متقدم من الجيل الجديد يستهدف المجموعات المصلية A و C و W-135 و Y لحماية الصحة العامة وضيوف الرحمن.',
    features: [
      'Comprehensive 4-strain meningococcal coverage',
      'Conjugate protein technology for extended immunity',
      'Formulated for national immunization schedules'
    ],
    features_ar: [
      'تغطية وقائية شاملة ضد 4 سلالات للمكورات السحائية',
      'تقنية بروتينية مقترنة لمناعة طويلة الأمد',
      'مصمم ليتوافق مع جداول التحصين الوطنية المعتمدة'
    ],
    specs: [
      { label: 'Pipeline Phase', value: 'Phase III Development / Technology Transfer' },
      { label: 'Target Indication', value: 'Meningococcal Disease Prevention' },
      { label: 'Target Age Group', value: 'Infants, Adolescents, and Travelers' },
      { label: 'Manufacturing Target', value: 'VIC Bio-Facility, Sudair, KSA' }
    ],
    specs_ar: [
      { label: 'مرحلة التطوير', value: 'المرحلة السريرية الثالثة / نقل التقنية' },
      { label: 'دواعي الاستعمال المستهدفة', value: 'الوقاية من مرض المكورات السحائية' },
      { label: 'الفئة العمرية المستهدفة', value: 'الرضع، المراهقين، والمسافرين' },
      { label: 'منشأة التصنيع المستهدفة', value: 'مجمع VIC الحيوي، سدير، المملكة' }
    ],
    storage: [
      { label: 'Storage Temperature', value: '2°C to 8°C' },
      { label: 'Do Not Freeze', value: 'Yes' },
      { label: 'Shelf Life', value: 'Target 24 Months' },
      { label: 'Protect from Light', value: 'Yes' }
    ],
    storage_ar: [
      { label: 'درجة حرارة التخزين', value: '2 إلى 8 درجات مئوية' },
      { label: 'عدم التجميد', value: 'نعم' },
      { label: 'مدة الصلاحية', value: 'مستهدف 24 شهراً' },
      { label: 'الحماية من الضوء', value: 'نعم' }
    ],
    indication_desc: 'Active immunization against invasive meningococcal disease.',
    indication_desc_ar: 'التحصين الفعال ضد مرض المكورات السحائية الغازي.',
    indication_target: 'Infants, adolescents, and pilgrims',
    indication_target_ar: 'الرضع والمراهقين والحجاج والمعتمرين',
    indication_route: 'Intramuscular injection',
    indication_route_ar: 'حقن عضلي',
    gallery: [
      'modal_vials_banner.jpg',
      'thumb_vials1.jpg'
    ],
    resources: [],
    resources_ar: [],
    order_index: 4,
    status: 'Active'
  },
  {
    product_code: 'recombinant-hepb',
    category: 'future-portfolio',
    name: 'HepB Recombinant',
    name_ar: 'لقاح التهاب الكبد ب المؤتلف',
    subtitle: 'Hepatitis B Recombinant Vaccine',
    subtitle_ar: 'لقاح التهاب الكبد الوبائي ب المعاد تركيبه جينياً',
    image: 'thumb_vials2.jpg',
    featured_image: 'thumb_vials2.jpg',
    description: 'Advanced recombinant hepatitis B surface antigen (HBsAg) vaccine providing durable lifetime immunity for newborns and adults.',
    description_ar: 'لقاح متطور يعتمد على مستضد السطح لالتهاب الكبد ب المنتج بتقنية الحمض النووي المؤتلف لتوفير مناعة مدى الحياة.',
    features: [
      'Recombinant DNA technology platform',
      'High seroprotection rates across all demographics',
      'Localized manufacturing in Saudi Arabia'
    ],
    features_ar: [
      'منصة تقنية الحمض النووي المؤتلف (Recombinant DNA)',
      'معدلات حماية مصلية عالية عبر جميع الفئات العمرية',
      'تصنيع وطني متكامل داخل المملكة العربية السعودية'
    ],
    specs: [
      { label: 'Pipeline Phase', value: 'Development & Localization' },
      { label: 'Target Indication', value: 'Hepatitis B Infection' },
      { label: 'Formulation', value: 'Injectable Suspension' },
      { label: 'Manufacturing Target', value: 'VIC Bio-Facility, Sudair, KSA' }
    ],
    specs_ar: [
      { label: 'مرحلة التطوير', value: 'التطوير والتوطين التقني' },
      { label: 'دواعي الاستعمال المستهدفة', value: 'الوقاية من عدوى التهاب الكبد ب' },
      { label: 'الشكل الصيدلاني', value: 'معلق قابل للحقن' },
      { label: 'منشأة التصنيع المستهدفة', value: 'مجمع VIC الحيوي، سدير، المملكة' }
    ],
    storage: [
      { label: 'Storage Temperature', value: '2°C to 8°C' },
      { label: 'Do Not Freeze', value: 'Yes' },
      { label: 'Shelf Life', value: 'Target 36 Months' },
      { label: 'Protect from Light', value: 'Yes' }
    ],
    storage_ar: [
      { label: 'درجة حرارة التخزين', value: '2 إلى 8 درجات مئوية' },
      { label: 'عدم التجميد', value: 'نعم' },
      { label: 'مدة الصلاحية', value: 'مستهدف 36 شهراً' },
      { label: 'الحماية من الضوء', value: 'نعم' }
    ],
    indication_desc: 'Prevention of Hepatitis B infection.',
    indication_desc_ar: 'الوقاية من عدوى فيروس التهاب الكبد الوبائي ب.',
    indication_target: 'Newborns, children, and high-risk adults',
    indication_target_ar: 'حديثي الولادة والأطفال والبالغين ذوي الخطورة',
    indication_route: 'Intramuscular injection',
    indication_route_ar: 'حقن عضلي',
    gallery: [
      'thumb_vials2.jpg',
      'thumb_vials1.jpg'
    ],
    resources: [],
    resources_ar: [],
    order_index: 5,
    status: 'Active'
  }
];

const defaultProductsPageSettings = {
  hero_badge: 'OUR PRODUCTS',
  hero_badge_ar: 'منتجاتنا',
  hero_title_part1: 'Innovative Vaccines.',
  hero_title_part1_ar: 'لقاحات مبتكرة.',
  hero_title_part2: 'Trusted ',
  hero_title_part2_ar: 'حماية ',
  hero_title_accent: 'Protection.',
  hero_title_accent_ar: 'موثوقة.',
  hero_description: 'Developing and manufacturing high-quality vaccines to protect lives and strengthen global health security.',
  hero_description_ar: 'تطوير وتصنيع لقاحات عالية الجودة لحماية الأرواح وتعزيز الأمن الصحي العالمي والمحلي.',
  hero_image: 'home_banner.png',
  section_eyebrow: 'OUR PRODUCTS',
  section_eyebrow_ar: 'منتجاتنا الدوائية',
  cta_badge: 'STRATEGIC COLLABORATION',
  cta_badge_ar: 'شراكة استراتيجية',
  cta_title_part1: 'Building a Healthier Future, ',
  cta_title_part1_ar: 'نبني مستقبلاً أكثر صحة، ',
  cta_title_accent: 'Together.',
  cta_title_accent_ar: 'معاً.',
  cta_description: 'Partnering with global biotechnology leaders, research institutes, and healthcare organizations to localize advanced vaccine manufacturing and safeguard public health.',
  cta_description_ar: 'نتعاون مع رواد التقنية الحيوية العالميين ومراكز الأبحاث لتوطين التصنيع المتقدم للقاحات وحماية الصحة العامة.',
  cta_btn_text: 'Explore Partnerships',
  cta_btn_text_ar: 'استكشف شراكاتنا',
  cta_link: '/partners',
  page_resources: [
    { name: 'Product Information', name_ar: 'معلومات المنتج الدوائي', type: 'PDF', size: '1.2 MB', icon: 'document' },
    { name: 'Prescribing Information', name_ar: 'دليل الوصفات الطبية المعتمد', type: 'PDF', size: '1.5 MB', icon: 'prescribing' },
    { name: 'Patient Information Leaflet', name_ar: 'نشرة معلومات المرضى', type: 'PDF', size: '0.8 MB', icon: 'patient' },
    { name: 'Quality Certificate', name_ar: 'شهادة الجودة والتصنيع الدوائي', type: 'PDF', size: '0.6 MB', icon: 'certificate' }
  ]
};

async function seedProductsData(db, force = false) {
  try {
    // 1. Seed / Update Products Settings
    const [existingSettings] = await db.query('SELECT COUNT(*) as count FROM products_page_settings');
    if (existingSettings[0].count === 0 || force) {
      if (force) {
        await db.query('DELETE FROM products_page_settings');
      }
      const s = defaultProductsPageSettings;
      await db.query(`
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
        s.hero_badge, s.hero_badge_ar,
        s.hero_title_part1, s.hero_title_part1_ar,
        s.hero_title_part2, s.hero_title_part2_ar,
        s.hero_title_accent, s.hero_title_accent_ar,
        s.hero_description, s.hero_description_ar,
        s.hero_image,
        s.section_eyebrow, s.section_eyebrow_ar,
        s.cta_badge, s.cta_badge_ar,
        s.cta_title_part1, s.cta_title_part1_ar,
        s.cta_title_accent, s.cta_title_accent_ar,
        s.cta_description, s.cta_description_ar,
        s.cta_btn_text, s.cta_btn_text_ar,
        s.cta_link, JSON.stringify(s.page_resources)
      ]);
      console.log('[DB Seed] Seeded products page settings and resources.');
    }

    // 2. Seed Products
    const [existingProducts] = await db.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count === 0 || force) {
      if (force) {
        await db.query('DELETE FROM products');
      }
      for (const p of defaultProductsList) {
        await db.query(`
          INSERT INTO products (
            product_code, category, name, name_ar, subtitle, subtitle_ar,
            image, featured_image, description, description_ar,
            features, features_ar, specs, specs_ar, storage, storage_ar,
            indication_desc, indication_desc_ar, indication_target, indication_target_ar,
            indication_route, indication_route_ar,
            gallery, resources, resources_ar, order_index, status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.product_code,
          p.category,
          p.name,
          p.name_ar,
          p.subtitle,
          p.subtitle_ar,
          p.image,
          p.featured_image,
          p.description,
          p.description_ar,
          JSON.stringify(p.features),
          JSON.stringify(p.features_ar),
          JSON.stringify(p.specs),
          JSON.stringify(p.specs_ar),
          JSON.stringify(p.storage),
          JSON.stringify(p.storage_ar),
          p.indication_desc,
          p.indication_desc_ar,
          p.indication_target,
          p.indication_target_ar,
          p.indication_route,
          p.indication_route_ar,
          JSON.stringify(p.gallery),
          JSON.stringify(p.resources),
          JSON.stringify(p.resources_ar),
          p.order_index,
          p.status
        ]);
      }
      console.log(`[DB Seed] Seeded ${defaultProductsList.length} default commercial vaccines & pipeline candidates.`);
    }

  } catch (err) {
    console.error('[DB Seed Products Error]', err.message);
  }
}

// Getter for pool
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      database: process.env.DB_NAME || 'vic_db'
    });
  }
  return pool;
}

module.exports = {
  initDatabase,
  getPool,
  seedJobPostings,
  defaultJobPositions,
  seedPartnersData,
  defaultPartnersList,
  defaultPartnershipSections,
  seedAboutData,
  defaultAboutContent,
  defaultLeadersList,
  seedProductsData,
  defaultProductsList,
  defaultProductsPageSettings
};



