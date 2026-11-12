-- VIC (Vaccine Industrial Company) Database Schema for XAMPP MySQL

-- CREATE DATABASE IF NOT EXISTS vic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE vic_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Super Admin', 'Admin', 'Editor', 'Viewer') DEFAULT 'Admin',
  department VARCHAR(100) DEFAULT 'Executive',
  status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
  avatar VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  last_login DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News Articles Table
CREATE TABLE IF NOT EXISTS news_page_settings (
  id TINYINT UNSIGNED PRIMARY KEY,
  hero_eyebrow VARCHAR(150) NOT NULL,
  hero_eyebrow_ar VARCHAR(150) NOT NULL,
  hero_title VARCHAR(500) NOT NULL,
  hero_title_ar VARCHAR(500) NOT NULL,
  hero_description TEXT NOT NULL,
  hero_description_ar TEXT NOT NULL,
  hero_button_text VARCHAR(150) NOT NULL,
  hero_button_text_ar VARCHAR(150) NOT NULL,
  hero_image VARCHAR(500) NOT NULL,
  hero_image_ar VARCHAR(500) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(500) NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Company Updates',
  categories JSON NULL,
  date_str VARCHAR(50) NULL,
  formatted_date VARCHAR(50) NULL,
  read_time VARCHAR(50) DEFAULT '3 min read',
  image VARCHAR(255) DEFAULT NULL,
  badge VARCHAR(60) DEFAULT 'NEWS',
  summary TEXT NULL,
  summary_ar TEXT NULL,
  content_html LONGTEXT NULL,
  content_html_ar LONGTEXT NULL,
  official_link VARCHAR(500) DEFAULT NULL,
  status ENUM('Published', 'Draft', 'Archived') DEFAULT 'Published',
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_ar VARCHAR(200) NULL,
  description TEXT NULL,
  category VARCHAR(80) DEFAULT 'General',
  format VARCHAR(20) DEFAULT 'IMAGE',
  file_size VARCHAR(50) DEFAULT '0 KB',
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Home Page: First of its kind facility gallery
CREATE TABLE IF NOT EXISTS home_facility_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  alt_text VARCHAR(255) NULL,
  image_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NULL,
  source_type ENUM('upload', 'url', 'legacy') NOT NULL DEFAULT 'upload',
  order_index INT NOT NULL DEFAULT 0,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tracks the one-time initial gallery seed so administrator deletions persist.
CREATE TABLE IF NOT EXISTS home_facility_gallery_state (
  id TINYINT UNSIGNED PRIMARY KEY,
  initialized TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS home_facility_content (
  id TINYINT UNSIGNED PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  title_ar VARCHAR(500) NOT NULL DEFAULT '',
  lead TEXT NOT NULL,
  lead_ar TEXT NOT NULL,
  paragraph_one TEXT NOT NULL,
  paragraph_one_ar TEXT NOT NULL,
  paragraph_two TEXT NOT NULL,
  paragraph_two_ar TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Inquiries Table (Populated from Public Contact Form)
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  company VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(200) DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status ENUM('New', 'In Progress', 'Resolved', 'Archived') DEFAULT 'New',
  is_starred TINYINT(1) DEFAULT 0,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pharmacovigilance adverse-event reports (kept separate from general inquiries)
CREATE TABLE IF NOT EXISTS pharmacovigilance_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_name VARCHAR(150) DEFAULT NULL,
  patient_name VARCHAR(150) DEFAULT NULL,
  contact_number VARCHAR(50) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  product_name VARCHAR(200) NOT NULL,
  batch_number VARCHAR(100) DEFAULT NULL,
  expiration_date DATE DEFAULT NULL,
  occupation VARCHAR(150) DEFAULT NULL,
  side_effect_description TEXT NOT NULL,
  other_info TEXT DEFAULT NULL,
  status ENUM('New', 'Under Review', 'Follow-up Required', 'Closed') DEFAULT 'New',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Editable public Pharmacovigilance page content (JSON avoids wide-row limits)
CREATE TABLE IF NOT EXISTS pharmacovigilance_page_settings (
  id TINYINT UNSIGNED PRIMARY KEY,
  settings_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_code VARCHAR(50) NULL,
  title VARCHAR(200) NOT NULL,
  title_ar VARCHAR(200) NULL,
  department VARCHAR(100) NOT NULL,
  department_ar VARCHAR(100) NULL,
  location VARCHAR(100) DEFAULT 'Sudair Industrial City, KSA',
  location_ar VARCHAR(100) NULL,
  type VARCHAR(50) DEFAULT 'Full-Time',
  type_ar VARCHAR(50) NULL,
  experience VARCHAR(50) DEFAULT '3+ years',
  experience_ar VARCHAR(50) NULL,
  overview TEXT NULL,
  overview_ar TEXT NULL,
  description TEXT NULL,
  requirements TEXT NULL,
  responsibilities JSON NULL,
  responsibilities_ar JSON NULL,
  qualifications JSON NULL,
  qualifications_ar JSON NULL,
  status ENUM('Active', 'Closed', 'Draft') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Careers public-page copy and banner content
CREATE TABLE IF NOT EXISTS careers_page_settings (
  id TINYINT UNSIGNED PRIMARY KEY,
  hero_eyebrow TEXT NOT NULL,
  hero_eyebrow_ar TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_title_line2 TEXT NOT NULL,
  hero_title_ar TEXT NOT NULL,
  hero_title_line2_ar TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  hero_description_ar TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  hero_image_ar TEXT NULL,
  life_eyebrow TEXT NOT NULL,
  life_eyebrow_ar TEXT NOT NULL,
  life_title TEXT NOT NULL,
  life_title_ar TEXT NOT NULL,
  life_description TEXT NOT NULL,
  life_description_ar TEXT NOT NULL,
  life_image_1 TEXT NOT NULL,
  life_image_2 TEXT NOT NULL,
  life_image_3 TEXT NOT NULL,
  life_image_4 TEXT NOT NULL,
  mission_eyebrow TEXT NOT NULL,
  mission_eyebrow_ar TEXT NOT NULL,
  mission_title TEXT NOT NULL,
  mission_title_ar TEXT NOT NULL,
  mission_description TEXT NOT NULL,
  mission_description_ar TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NULL,
  candidate_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  resume_url VARCHAR(500) NULL,
  cover_letter TEXT NULL,
  status ENUM('Submitted', 'Reviewing', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired') DEFAULT 'Submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partners Page Settings (Hero banner and page configuration)
CREATE TABLE IF NOT EXISTS partners_page_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hero_badge VARCHAR(100) DEFAULT 'GLOBAL PARTNERSHIPS',
  hero_badge_ar VARCHAR(100) DEFAULT 'شراكات عالمية',
  hero_title VARCHAR(255) DEFAULT 'Stronger Together.',
  hero_title_ar VARCHAR(255) DEFAULT 'معاً أقوى.',
  hero_title_line2 VARCHAR(255) DEFAULT 'Building a Better ',
  hero_title_line2_ar VARCHAR(255) DEFAULT 'نبني مستقبلاً أفضل ',
  hero_accent VARCHAR(100) DEFAULT 'Future.',
  hero_accent_ar VARCHAR(100) DEFAULT 'للجميع.',
  hero_description TEXT NULL,
  hero_description_ar TEXT NULL,
  hero_image VARCHAR(500) DEFAULT 'partner_right.webp',
  hero_image_ar VARCHAR(500) NULL,
  cta_text VARCHAR(100) DEFAULT 'Partner With Us',
  stats_json JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Strategic Partners & Alliances Table
CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NULL,
  name VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NULL,
  category VARCHAR(150) NOT NULL,
  category_ar VARCHAR(150) NULL,
  tier VARCHAR(100) DEFAULT 'Strategic Alliance',
  logo VARCHAR(500) NOT NULL,
  website VARCHAR(500) NULL,
  description TEXT NOT NULL,
  description_ar TEXT NULL,
  featured TINYINT(1) DEFAULT 1,
  order_index INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dynamic Partnership Content Sections (Pillars, Collaboration Models, Vision 2030 highlights)
CREATE TABLE IF NOT EXISTS partnership_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(100) DEFAULT 'custom_section',
  badge VARCHAR(100) NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NULL,
  content TEXT NULL,
  bullet_points JSON NULL,
  image_url VARCHAR(500) NULL,
  content_json JSON NULL,
  icon VARCHAR(100) NULL,
  cta_text VARCHAR(100) NULL,
  cta_url VARCHAR(255) NULL,
  layout_type VARCHAR(50) DEFAULT 'card',
  order_index INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partnership Inquiries Table (Submissions from public modal)
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  organization VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  category VARCHAR(100) DEFAULT 'Technology Transfer',
  message TEXT NULL,
  status ENUM('New', 'Under Review', 'Contacted', 'Archived') DEFAULT 'New',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- About Us Page Content (Hero, Overview modal, Vision & Mission, Vision 2030)
CREATE TABLE IF NOT EXISTS about_page_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(255) NULL,
  title_ar VARCHAR(255) NULL,
  subtitle VARCHAR(255) NULL,
  subtitle_ar VARCHAR(255) NULL,
  badge VARCHAR(100) NULL,
  badge_ar VARCHAR(100) NULL,
  description TEXT NULL,
  description_ar TEXT NULL,
  image_url VARCHAR(500) NULL,
  image_url_ar VARCHAR(500) NULL,
  content_json JSON NULL,
  content_json_ar JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- About Us Leaders & Founding Partners
CREATE TABLE IF NOT EXISTS about_leaders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NULL,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NULL,
  role TEXT NOT NULL,
  role_ar TEXT NULL,
  badge VARCHAR(100) NOT NULL DEFAULT 'Executive Board',
  badge_ar VARCHAR(100) NULL,
  initials VARCHAR(10) NULL,
  image VARCHAR(500) NULL,
  bio_sections JSON NULL,
  bio_sections_ar JSON NULL,
  order_index INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Executive Team profiles are independent of About Us / Founding Leadership.
CREATE TABLE IF NOT EXISTS executive_team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NULL,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NULL,
  role TEXT NOT NULL,
  role_ar TEXT NULL,
  badge VARCHAR(100) NULL,
  badge_ar VARCHAR(100) NULL,
  initials VARCHAR(10) NULL,
  image VARCHAR(500) NULL,
  bio_sections JSON NULL,
  bio_sections_ar JSON NULL,
  order_index INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS executive_team_migrations (
  migration_key VARCHAR(100) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS executive_team_content (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  hero_content JSON NULL,
  page_content JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS manufacturing_platform_content (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  content_json JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products & Pipeline Candidates Table
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

-- Products Page Settings & Hero Configuration Table
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
  hero_image VARCHAR(500) DEFAULT 'prodcut_home.jpg',
  hero_image_ar VARCHAR(500) NULL,
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
  pipeline_content JSON NULL,
  pipeline_image VARCHAR(500) DEFAULT 'cell_technology_hand.webp',
  pipeline_video VARCHAR(500) DEFAULT NULL,
  csl_intro_video VARCHAR(500) DEFAULT NULL,
  csl_about_video VARCHAR(500) DEFAULT NULL,
  csl_logo VARCHAR(500) DEFAULT 'cslseqirus_1_logo-e1761739712420.webp',
  csl_partner_title VARCHAR(255) DEFAULT 'Technology Transfer Partner',
  csl_partner_title_ar VARCHAR(255) DEFAULT 'شريك نقل التقنية',
  csl_partner_description TEXT NULL,
  csl_partner_description_ar TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Home page editable sections
CREATE TABLE IF NOT EXISTS home_page_content (
  section_key VARCHAR(50) PRIMARY KEY,
  badge VARCHAR(150) NULL,
  badge_ar VARCHAR(150) NULL,
  title VARCHAR(500) NULL,
  title_ar VARCHAR(500) NULL,
  title_line2 VARCHAR(500) NULL,
  title_line2_ar VARCHAR(500) NULL,
  description TEXT NULL,
  description_ar TEXT NULL,
  image_url VARCHAR(500) NULL,
  image_url_ar VARCHAR(500) NULL,
  video_url VARCHAR(500) NULL,
  corporate_video_url VARCHAR(500) NULL,
  button_text VARCHAR(250) NULL,
  button_text_ar VARCHAR(250) NULL,
  button_url VARCHAR(1000) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


