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
  defaultJobPositions
};
