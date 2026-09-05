const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vic_db',
  charset: 'utf8mb4'
};

const NEWS_ARTICLES_DATA = [
  {
    "slug": "vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing",
    "title": "VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing",
    "category": "MOU",
    "categories": ["MOU", "Partnerships", "Manufacturing"],
    "date_str": "Oct 30, 2025",
    "formatted_date": "October 30, 2025",
    "read_time": "3 min read",
    "image": "news1.jpeg",
    "badge": "MOU AGREEMENT",
    "summary": "Thursday 30 October, Riyadh – CSL Seqirus and Vaccine Industrial Company, have signed a Memorandum of Understanding with the Ministry of Health of Saudi Arabia to enhance the biotechnology sector by accessing advanced cell-based seasonal and pandemic influenza vaccines and localizing manufacturing in Saudi Arabia.",
    "content_html": `<p><strong>Thursday 30 October, Riyadh – </strong>CSL Seqirus and Vaccine Industrial Company, have signed a Memorandum of Understanding with the Ministry of Health of Saudi Arabia to enhance the biotechnology sector by accessing advanced cell-based seasonal and pandemic influenza vaccines and localizing manufacturing in Saudi Arabia.</p>
<p>Under a finalised agreement, CSL Seqirus, a leading global influenza vaccine manufacturer, would provide its innovative cell-based seasonal and pandemic influenza vaccines and work with Vaccine Industrial Company (VIC), a prominent Saudi vaccine company, to localize manufacturing at VIC’s new Sudair City facility.</p>
<p>The finalised agreement would also establish pre-pandemic vaccine stockpiles for high-risk populations and an Advance Purchase Agreement to secure pandemic vaccines for the broader population, helping elevate Saudi Arabia’s preparedness in case of an influenza pandemic.</p>
<p>Onshore manufacturing would enable scalable volumes, reduce reliance on global supply chains and provide flexibility as Saudi Arabia prioritises public health during mass gatherings such as Hajj, and hosts major events including World EXPO, FIFA World Cup 2034 and Olympic Esports Games.</p>
<p>Cell-based influenza vaccines are designed to be an exact match to WHO-selected influenza strains and help improve vaccine effectiveness by eliminating changes that can occur in the traditional influenza vaccine manufacturing process.</p>
<h2 class="editorial-heading">About Influenza in Saudi Arabia</h2>
<p>Influenza is one of the fastest changing vaccine-preventable diseases and causes a significant impact on people and the health system in the Kingdom. It can cause mild to severe illness, and at times can lead to death.</p>`,
    "official_link": "https://vaccine.com.sa/vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing/",
    "status": "Published"
  },
  {
    "slug": "vaccine-facility-construction-achieves-major-milestone",
    "title": "Our Vaccine Facility Construction Achieves Major Milestone – October 2025 Update",
    "category": "Manufacturing",
    "categories": ["Manufacturing", "Company Updates"],
    "date_str": "Oct 26, 2025",
    "formatted_date": "October 26, 2025",
    "read_time": "3 min read",
    "image": "construction_milestone_oct.jpg",
    "badge": "MANUFACTURING",
    "summary": "The construction of the Kingdom’s pioneering human vaccine manufacturing facility continues to progress ahead of schedule, marking a new chapter in Saudi Arabia’s biotechnology ambitions. A new video released today showcases the latest advancements at the factory site.",
    "content_html": `<p>The construction of the Kingdom’s pioneering human vaccine manufacturing facility continues to progress ahead of schedule, marking a new chapter in Saudi Arabia’s biotechnology ambitions. A new video released today showcases the latest advancements at the factory site, reflecting rapid development and commitment to excellence.</p>
<p>Dr. Khaled Almosa, founder of Saudi Bio, the Vaccine Industrial Company and Group Chairman stated: “With gratitude to God Almighty and our visionary leadership, the facility has entered an advanced stage of construction. What started at the beginning of the year is now taking tangible shape, thanks to the dedication of our technical and engineering teams and the support we have received at every level.”</p>`,
    "official_link": "https://vaccine.com.sa/vaccine-facility-construction-achieves-major-milestone/",
    "status": "Published"
  },
  {
    "slug": "construction-of-saudi-arabias-first-human-vaccine-factory",
    "title": "Construction of Saudi Arabia's first human vaccine factory begins",
    "category": "Manufacturing",
    "categories": ["Manufacturing", "Company Updates"],
    "date_str": "Jan 19, 2025",
    "formatted_date": "January 19, 2025",
    "read_time": "3 min read",
    "image": "news2.jpg",
    "badge": "MANUFACTURING",
    "summary": "Dr. Khaled Al-Mousa, founder of Saudi Bio and founder of the vaccine manufacturing company, explained via a tweet on his account on the X platform that construction work on the human vaccine factory began at the beginning of this year.",
    "content_html": `<p>Dr. Khaled Al-Mousa, founder of Saudi Bio and founder of the vaccine manufacturing company, explained via a tweet on his account on the X platform that construction work on the human vaccine factory began at the beginning of this year. This factory is considered the first of its kind in the Kingdom and the largest in the Middle East.</p>
<p>Dr. Al-Mousa said: "Thanks be to God Almighty, today we have started construction work on the human vaccine factory project after two years of diligent work on engineering and technical preparations. We are proud of our step towards enhancing our capabilities in vaccine manufacturing, and we are striving to achieve the Kingdom's Vision 2030."</p>`,
    "official_link": "https://vaccine.com.sa/construction-of-saudi-arabias-first-human-vaccine-factory/",
    "status": "Published"
  },
  {
    "slug": "exciting-collaboration-for-innovation-in-vaccine-research",
    "title": "Exciting Collaboration for Innovation in Vaccine Research and Development!",
    "category": "Partnerships",
    "categories": ["Partnerships", "MOU", "Research & Innovation"],
    "date_str": "Oct 26, 2024",
    "formatted_date": "October 26, 2024",
    "read_time": "3 min read",
    "image": "news3.jpg",
    "badge": "PARTNERSHIP",
    "summary": "We are thrilled to announce that Vaccine Research, Development, and Innovation Co. (Vaccine RDI) has signed a Memorandum of Understanding (MoU) with the esteemed King Abdulaziz City for Science and Technology (KACST).",
    "content_html": `<p>We are thrilled to announce that Vaccine Research, Development, and Innovation Co. (Vaccine RDI) has signed a Memorandum of Understanding (MoU) with the esteemed King Abdulaziz City for Science and Technology (KACST). This landmark partnership, sealed on October 22, 2024, marks a new chapter in advancing scientific research, technological innovation, and pharmaceutical development.</p>
<h3>Key Highlights of the Collaboration</h3>
<ul>
<li>Establishing a national research laboratory focused on vaccine and biopharmaceutical development.</li>
<li>Leveraging the expertise of KACST's renowned researchers to support cutting-edge research.</li>
<li>Promoting technology transfer and localizing pharmaceutical manufacturing.</li>
</ul>`,
    "official_link": "https://vaccine.com.sa/exciting-collaboration-for-innovation-in-vaccine-research/",
    "status": "Published"
  },
  {
    "slug": "unveils-new-company-introduction-video",
    "title": "Vaccine Industrial Company Unveils New Company Introduction Video",
    "category": "Company Updates",
    "categories": ["Company Updates"],
    "date_str": "Oct 9, 2024",
    "formatted_date": "October 9, 2024",
    "read_time": "3 min read",
    "image": "news4.jpg",
    "badge": "COMPANY UPDATE",
    "summary": "We are excited to announce the release of our new company introduction video, now available on our media page. This video provides an insightful look into our mission, values, and our role as a leading manufacturer of vaccines.",
    "content_html": `<p>We are excited to announce the release of our new company introduction video, now available on our media page. This video provides an insightful look into our mission, values, and our role as a leading manufacturer of vaccines in the Kingdom of Saudi Arabia.</p>`,
    "official_link": "https://vaccine.com.sa/unveils-new-company-introduction-video/",
    "status": "Published"
  },
  {
    "slug": "irish-embassy-hosts-landmark-project-management-agreement-signing",
    "title": "Irish Embassy Hosts Landmark Project Management Agreement Signing",
    "category": "Partnerships",
    "categories": ["Partnerships", "Events", "Manufacturing"],
    "date_str": "Aug 6, 2024",
    "formatted_date": "August 6, 2024",
    "read_time": "3 min read",
    "image": "irish_embassy_vic.jpg",
    "badge": "PARTNERSHIP",
    "summary": "Under the esteemed patronage of His Excellency the Irish Ambassador and representatives of the Irish government, a significant milestone in the biotechnology and vaccine manufacturing sector was achieved today at the Irish Embassy.",
    "content_html": `<p>Under the esteemed patronage of His Excellency the Irish Ambassador and representatives of the Irish government, a significant milestone in the biotechnology and vaccine manufacturing sector was achieved today at the Irish Embassy. A project management agreement was officially signed between VACCINE INDUSTRIAL COMPANY (VIC) the largest vaccine manufacturer in the Middle East, Modon-Sudair, and ZYME GLOBAL BIOTECH.</p>`,
    "official_link": "https://vaccine.com.sa/irish-embassy-hosts-landmark-project-management-agreement-signing/",
    "status": "Published"
  },
  {
    "slug": "saudi-arabia-injects-133m-into-vaccine-factory",
    "title": "Saudi Arabia Injects $133m into Sudair Vaccine Factory",
    "category": "Manufacturing",
    "categories": ["Manufacturing", "Company Updates"],
    "date_str": "Mar 20, 2024",
    "formatted_date": "March 20, 2024",
    "read_time": "3 min read",
    "image": "saudi_133m_factory.webp",
    "badge": "MANUFACTURING",
    "summary": "Saudi Arabia is planning to invest SAR500 million ($133 million) in a factory to boost local vaccine and medicine manufacturing capacity as the kingdom seeks to become a regional centre for biotechnology.",
    "content_html": `<p>Saudi Authority for Industrial Cities and Technology Zones, also known as Modon, has signed an investment agreement with the Vaccine Industrial Company to set up a joint venture factory in Sudair City to produce vaccines and vital biological medicines.</p>`,
    "official_link": "https://vaccine.com.sa/saudi-arabia-injects-133m-into-vaccine-factory/",
    "status": "Published"
  },
  {
    "slug": "baylor-college-of-medicine-and-vic-rdi-have-signed-academic-and-rd-agreement-for-vaccine-development",
    "title": "Baylor College of Medicine and VCRDI Sign Academic and R&D Agreement for Vaccine Development",
    "category": "Research & Innovation",
    "categories": ["Research & Innovation", "Partnerships", "MOU"],
    "date_str": "Mar 17, 2024",
    "formatted_date": "March 17, 2024",
    "read_time": "3 min read",
    "image": "baylor_vic_agreement.jpg",
    "badge": "RESEARCH",
    "summary": "VCRDI and Baylor College of Medicine (BCM) have signed an Academic and R&D agreement for vaccine development to train scientists and develop innovative formulation platforms.",
    "content_html": `<p>VCRDI and Baylor College of Medicine (BCM) have signed an Academic and R&D agreement for vaccine development. VCRDI and BCM have signed a training agreement to train VCRDI scientists in vaccine development, including scale-up process development, quality control testing, formulation technology, and regulatory documentation.</p>`,
    "official_link": "https://vaccine.com.sa/baylor-college-of-medicine-and-vic-rdi-have-signed-academic-and-rd-agreement-for-vaccine-development/",
    "status": "Published"
  }
];

const MEDIA_ASSETS_DATA = [
  {
    title: 'VIC Official Brand & Logo Kit',
    description: 'Vector SVG, High-Res PNG (Light & Dark backgrounds), brand guidelines & color tokens.',
    category: 'Brand Assets',
    format: 'IMAGE',
    file_size: '12.4 MB',
    file_name: 'logo_navbar.png',
    file_url: '/logo_navbar.png'
  },
  {
    title: 'VIC Corporate Factsheet (2025 Edition)',
    description: 'Official factsheet detailing company milestones, leadership, facility specifications & alliances.',
    category: 'Brand Assets',
    format: 'PDF',
    file_size: '2.8 MB',
    file_name: 'home_banner.png',
    file_url: '/home_banner.png'
  },
  {
    title: 'Executive Leadership Bios & Portraits',
    description: 'Official portraits and verified executive biographies of Dr. Khaled Almosa and VIC board members.',
    category: 'Brand Assets',
    format: 'IMAGE',
    file_size: '18.6 MB',
    file_name: 'Dr.Khaled-Almosa.jpeg',
    file_url: '/Dr.Khaled-Almosa.jpeg'
  },
  {
    title: 'Facility & Cleanroom High-Res Photos',
    description: 'Approved high-resolution press imagery of Sudair facility, laboratory suites, and robotic lines.',
    category: 'Facility & Campus',
    format: 'IMAGE',
    file_size: '45.2 MB',
    file_name: 'about_vic_lab.png',
    file_url: '/about_vic_lab.png'
  }
];

async function seedAll() {
  const pool = mysql.createPool(dbConfig);
  console.log('[Seed] Syncing all static news & media into MySQL vic_db...');

  // Push News Articles
  for (const item of NEWS_ARTICLES_DATA) {
    const [exists] = await pool.query('SELECT id FROM news_articles WHERE slug = ?', [item.slug]);
    if (exists.length === 0) {
      await pool.query(`
        INSERT INTO news_articles 
        (slug, title, category, categories, date_str, formatted_date, read_time, image, badge, summary, content_html, official_link, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.slug,
        item.title,
        item.category,
        JSON.stringify(item.categories),
        item.date_str,
        item.formatted_date,
        item.read_time,
        item.image,
        item.badge,
        item.summary,
        item.content_html,
        item.official_link,
        item.status
      ]);
      console.log(`[Seed] Inserted article: ${item.title}`);
    } else {
      await pool.query(`
        UPDATE news_articles 
        SET title = ?, category = ?, categories = ?, date_str = ?, formatted_date = ?, read_time = ?, image = ?, badge = ?, summary = ?, content_html = ?, official_link = ?, status = ?
        WHERE slug = ?
      `, [
        item.title,
        item.category,
        JSON.stringify(item.categories),
        item.date_str,
        item.formatted_date,
        item.read_time,
        item.image,
        item.badge,
        item.summary,
        item.content_html,
        item.official_link,
        item.status,
        item.slug
      ]);
      console.log(`[Seed] Updated article: ${item.title}`);
    }
  }

  // Push Media Assets
  for (const m of MEDIA_ASSETS_DATA) {
    const [exists] = await pool.query('SELECT id FROM media_assets WHERE file_name = ?', [m.file_name]);
    if (exists.length === 0) {
      await pool.query(`
        INSERT INTO media_assets (title, description, category, format, file_size, file_name, file_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [m.title, m.description, m.category, m.format, m.file_size, m.file_name, m.file_url]);
      console.log(`[Seed] Inserted media asset: ${m.title}`);
    }
  }

  console.log('[Seed] All static data successfully pushed to MySQL database!');
  await pool.end();
}

seedAll().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
