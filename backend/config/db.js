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
  getPool
};
